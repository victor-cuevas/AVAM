import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { ZeitraumCodeEnum } from '@app/shared/enums/domain-code/zeitraum-code.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { StesMatchingprofilPaths } from '@app/shared/enums/stes-navigation-paths.enum';

import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { MatchingStesOverviewDTO } from '@app/shared/models/dtos-generated/matchingStesOverviewDTO';
import { StesMatchingOverviewRequestParams } from '@app/shared/models/dtos-generated/stesMatchingOverviewRequestParams';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { Subscription } from 'rxjs';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { StesMatchingtrefferTableComponent } from '@stes/pages/matchingtreffern-suchen/stes-matchingtreffer-table/stes-matchingtreffer-table.component';

@Component({
    selector: 'avam-matchingtreffern-suchen',
    templateUrl: './matchingtreffern-suchen.component.html',
    styleUrls: ['./matchingtreffern-suchen.component.scss']
})
export class MatchingtreffernSuchenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('personalberater') personalberater: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('results') results: StesMatchingtrefferTableComponent;

    spinnerChannel = 'matchingtreffern-suchen-spinner';

    readonly stateKey = 'matching-stes-table-stateKey';
    readonly cacheStateKey = 'matching-stes-search-cache-stateKey';

    formNumber = StesFormNumberEnum.ARBEITSVERMITTLUNG_SEARCH_MATCHINGTREFFERN;
    matchingtreffernChannel = 'matchingtreffern-table';
    toolboxId = 'matchingtreffern-table';
    toolboxConfiguration: ToolboxConfiguration[] = [new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true), new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)];
    toolboxActionSub: Subscription;

    searchForm: FormGroup;
    zeitraumOptions: [];
    zeitraumDefaultValue: string;
    zeitraumSelectedValue: string;

    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;

    dataSource = [];
    searchDone = false;

    constructor(
        private readonly formBuilder: FormBuilder,
        private changeDetector: ChangeDetectorRef,
        private obliqueHelper: ObliqueHelperService,
        private dataService: StesDataRestService,
        private translateService: TranslateService,
        private fehlermeldungenService: FehlermeldungenService,
        private toolboxService: ToolboxService,
        private resetDialogService: ResetDialogService,
        private router: Router,
        private spinnerService: SpinnerService,
        private modalService: NgbModal,
        private searchSessionService: SearchSessionStorageService
    ) {
        super();
        ToolboxService.CHANNEL = this.toolboxId;
        SpinnerService.CHANNEL = this.spinnerChannel;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.searchForm = this.createFormGroup();
        this.searchForm.patchValue({ zeitraum: ZeitraumCodeEnum.LETZTE_24_STUNDEN });
        this.getData();
        this.toolboxActionSub = this.getToolboxActionSub();
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.onReset());
    }

    ngAfterViewInit() {
        this.personalberater.appendCurrentUser();
        this.changeDetector.detectChanges();
        const state = this.searchSessionService.restoreStateByKey(this.cacheStateKey);
        if (state) {
            this.searchForm.patchValue(state.fields);
        }
        //perform default search
        this.onSubmit();
    }

    createFormGroup(): FormGroup {
        return this.formBuilder.group({ benutzer: [null, Validators.required], zeitraum: null });
    }

    customPropertyMapper = (element: CodeDTO) => {
        return {
            value: element.code,
            labelFr: element.kurzTextFr,
            labelIt: element.kurzTextIt,
            labelDe: element.kurzTextDe
        };
    };

    getData() {
        this.dataService.getCode(DomainEnum.TREFFER_SEIT).subscribe(zeitraumOptions => {
            // map zeitraum dropdown options
            this.zeitraumOptions = zeitraumOptions.map(this.customPropertyMapper);
        });
    }

    getToolboxActionSub() {
        return this.toolboxService.observeClickAction(this.toolboxId).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });
    }

    openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }

    onSubmit() {
        this.fehlermeldungenService.closeMessage();

        if (!this.searchForm.valid) {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
            return;
        }

        this.storeState();
        this.searchDone = false;
        this.spinnerService.activate(this.spinnerChannel);
        this.dataService.searchMatchingStesOverview(this.mapToDTO(), this.translateService.currentLang).subscribe(
            response => {
                this.zeitraumSelectedValue = this.searchForm.controls.zeitraum.value;

                if (response.data) {
                    this.dataSource = response.data.map(row => this.createRow(row)).sort((v1, v2) => (v1.vorname < v2.vorname ? -1 : 1));
                }
                this.searchDone = true;
                this.spinnerService.deactivate(this.spinnerChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.searchDone = true;
                this.spinnerService.deactivate(this.spinnerChannel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    private storeState() {
        const storage: any = this.searchForm.value;
        this.searchSessionService.storeFieldsByKey(this.cacheStateKey, storage);
    }

    onReset() {
        this.fehlermeldungenService.closeMessage();
        this.searchForm.patchValue({ zeitraum: ZeitraumCodeEnum.LETZTE_24_STUNDEN });
        this.personalberater.appendCurrentUser();
        this.dataSource = [];
        this.searchDone = false;
        this.results.onReset();
        this.onSubmit();
    }

    itemSelected(selectedStesId) {
        this.router.navigate([`stes/details/${selectedStesId}/${StesMatchingprofilPaths.MATCHINGPROFIL}`], {
            state: {
                zeitraum: this.zeitraumSelectedValue
            }
        });
    }

    mapToDTO(): StesMatchingOverviewRequestParams {
        return {
            benutzerDetail: this.searchForm.controls.benutzer['benutzerObject'] ? this.searchForm.controls.benutzer['benutzerObject'] : this.searchForm.controls.benutzer.value,
            zeitlicheEinschraenkung: this.searchForm.controls.zeitraum.value
        };
    }

    createRow(matchingOverview: MatchingStesOverviewDTO) {
        return {
            versichertenNr: matchingOverview.versichertenNr ? matchingOverview.versichertenNr : '',
            name: matchingOverview.name ? matchingOverview.name : '',
            vorname: matchingOverview.vorname ? matchingOverview.vorname : '',
            wohnort: matchingOverview.wohnort ? matchingOverview.wohnort : '',
            stesId: matchingOverview.stesId
        };
    }

    ngOnDestroy() {
        this.fehlermeldungenService.closeMessage();
        if (this.toolboxActionSub) {
            this.toolboxActionSub.unsubscribe();
        }
        super.ngOnDestroy();
    }
}
