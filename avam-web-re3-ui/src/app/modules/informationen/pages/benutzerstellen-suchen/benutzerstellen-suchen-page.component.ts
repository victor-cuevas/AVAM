import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
    BenutzerstellenSuchenFormComponent,
    BenutzerstellenSuchenFormData
} from '@modules/informationen/components/benutzerstellen-suchen-form/benutzerstellen-suchen-form.component';
import { FacadeService } from '@shared/services/facade.service';
import { forkJoin } from 'rxjs';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import { CodeDTO } from '@dtos/codeDTO';
import { finalize, takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { KantonDTO } from '@dtos/kantonDTO';
import { BenutzerstellenQueryDTO } from '@dtos/benutzerstellenQueryDTO';
import { BaseResponseWrapperListBenutzerstelleResultDTOWarningMessages } from '@dtos/baseResponseWrapperListBenutzerstelleResultDTOWarningMessages';
import { BenutzerstellenRestService } from '@core/http/benutzerstellen-rest.service';
import { BenutzerstelleResultDTO } from '@dtos/benutzerstelleResultDTO';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { Router } from '@angular/router';
import { ReloadHelper } from '@shared/helpers/reload.helper';

@Component({
    selector: 'avam-benutzerstellen-suchen-page',
    templateUrl: './benutzerstellen-suchen-page.component.html',
    styleUrls: ['./benutzerstellen-suchen-page.component.scss'],
    providers: [SearchSessionStorageService]
})
export class BenutzerstellenSuchenPageComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('suchenFormComponent') suchenFormComponent: BenutzerstellenSuchenFormComponent;

    readonly searchFormStateKey = 'benutzerstellen-suchen-searchForm-stateKey';
    readonly tableStateKey = 'benutzerstellen-suchen-result-stateKey';
    readonly formSpinnerChannel = 'benutzerstellen-suchen-form-channel';
    readonly resultsSpinnerChannel = 'benutzerstellen-suchen-results-channel';
    formData: BenutzerstellenSuchenFormData;
    searchResults: BenutzerstelleResultDTO[] = [];
    searchDone: boolean;

    constructor(
        private facadeService: FacadeService,
        private stesDataRestService: StesDataRestService,
        private benutzerstellenRestService: BenutzerstellenRestService,
        private storageService: SearchSessionStorageService,
        private router: Router
    ) {
        super();
    }

    ngOnInit() {
        this.getData();
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
    }

    ngOnDestroy(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    search(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        if (this.suchenFormComponent.searchForm.valid) {
            this.storeFormState();
            this.callRestService(this.suchenFormComponent.mapToDto());
            this.searchDone = true;
        }
    }

    reset(): void {
        this.suchenFormComponent.handler.reactiveForm.setDefaultValues();
        this.searchResults = [];
        this.searchDone = false;
        this.storageService.restoreDefaultValues(this.tableStateKey);
        this.storageService.clearStorageByKey(this.searchFormStateKey);
    }

    onSavedSearchData(): void {
        this.callRestService(this.suchenFormComponent.mapToDto());
        this.searchDone = true;
    }

    private callRestService(benutzerstellenQueryDTO: BenutzerstellenQueryDTO): void {
        this.facadeService.spinnerService.activate(this.resultsSpinnerChannel);
        this.benutzerstellenRestService
            .getBenutzerstellen(benutzerstellenQueryDTO, this.facadeService.translateService.currentLang)
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.facadeService.spinnerService.deactivate(this.resultsSpinnerChannel))
            )
            .subscribe(
                (response: BaseResponseWrapperListBenutzerstelleResultDTOWarningMessages) => {
                    this.searchResults = response.data;
                },
                () => {
                    this.searchResults = [];
                }
            );
    }

    private getData(): void {
        this.facadeService.spinnerService.activate(this.formSpinnerChannel);
        forkJoin<CodeDTO[], KantonDTO[], CodeDTO[], CodeDTO[]>([
            this.stesDataRestService.getFixedCode(DomainEnum.STATUS_OPTIONS),
            this.stesDataRestService.getAllKantone(),
            this.stesDataRestService.getCode(DomainEnum.BENUTZERSTELLETYP),
            this.stesDataRestService.getCode(DomainEnum.VOLLZUGSREGIONTYP)
        ])
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.facadeService.spinnerService.deactivate(this.formSpinnerChannel))
            )
            .subscribe(([statusRes, kantoneRes, benutzerstellenRes, vollzugsregionenRes]) => {
                this.formData = {
                    stati: statusRes,
                    kantone: kantoneRes,
                    benutzerstelleTyps: benutzerstellenRes,
                    vollzugsregionen: vollzugsregionenRes
                };
            });
    }

    private storeFormState(): void {
        this.storageService.storeFieldsByKey(this.searchFormStateKey, this.suchenFormComponent.handler.getFormValue());
    }
}
