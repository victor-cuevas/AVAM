import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Permissions } from '@shared/enums/permissions.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from '@shared/services/facade.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { Unsubscribable } from 'oblique-reactive';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { CodeDTO } from '@dtos/codeDTO';
import { BerufDTO } from '@dtos/berufDTO';
import { ToolboxService } from '@app/shared';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { filter, finalize, takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { DomainEnum } from '@shared/enums/domain.enum';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { forkJoin, Observable } from 'rxjs';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { BenutzerstellenRestService } from '@core/http/benutzerstellen-rest.service';
import { BaseResponseWrapperIntegerWarningMessages } from '@dtos/baseResponseWrapperIntegerWarningMessages';
import { DateValidator } from '@shared/validators/date-validator';
import { BaseResponseWrapperBerufBearbeitenDTOWarningMessages } from '@dtos/baseResponseWrapperBerufBearbeitenDTOWarningMessages';
import { BerufBearbeitenDTO } from '@dtos/berufBearbeitenDTO';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';

@Component({
    selector: 'avam-beruf-erfassen-bearbeiten',
    templateUrl: './beruf-erfassen-bearbeiten.component.html',
    styleUrls: ['./beruf-erfassen-bearbeiten.component.scss']
})
export class BerufErfassenBearbeitenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy, DeactivationGuarded {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('infobartemplate') infobartemplate: TemplateRef<any>;

    form: FormGroup;
    berufBearbeitenDTO: BerufBearbeitenDTO;
    formValueOnLoad = {};
    isBearbeiten = false;
    navigatedFromSuchen: boolean;
    anerkennungsformArray = [];
    lehrberufCodeDTO: CodeDTO;

    readonly channel = 'VollzugsregionErfassenBearbeiten';
    readonly permissions: typeof Permissions = Permissions;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private facadeService: FacadeService,
        private obliqueHelper: ObliqueHelperService,
        private infopanelService: AmmInfopanelService,
        private stesRestService: StesDataRestService,
        private benutzerstellenRestService: BenutzerstellenRestService
    ) {
        super();
        this.navigatedFromSuchen = this.router.getCurrentNavigation().extras.state && this.router.getCurrentNavigation().extras.state.navigateToSearch;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.isBearbeiten = this.route.snapshot.data.isBearbeiten;
        if (!this.isBearbeiten) {
            this.infopanelService.updateInformation({
                title: 'stes.subnavmenuitem.stesBerufErfassen',
                subtitle: '',
                hideInfobar: true
            });
        }
        this.generateForm();
        this.configureToolbox();
    }

    ngAfterViewInit() {
        this.getData();
    }

    ngOnDestroy() {
        this.infopanelService.updateInformation({ title: '', subtitle: '', hideInfobar: false });
        this.facadeService.toolboxService.sendConfiguration([]);
        this.facadeService.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    canDeactivate(): boolean {
        return this.form.dirty;
    }

    cancel() {
        if (this.navigatedFromSuchen) {
            this.router.navigate(['../suchen'], { relativeTo: this.route });
        } else {
            this.router.navigate(['/home']);
        }
    }

    reset() {
        if (this.form.dirty) {
            this.facadeService.resetDialogService.reset(() => {
                this.facadeService.fehlermeldungenService.closeMessage();
                this.form.patchValue(this.formValueOnLoad);
                this.form.markAsPristine();
                this.form.updateValueAndValidity();
            });
        }
    }

    save() {
        this.facadeService.fehlermeldungenService.closeMessage();
        if (this.form.valid) {
            this.facadeService.spinnerService.activate(this.channel);
            const observable: Observable<BaseResponseWrapperBerufBearbeitenDTOWarningMessages | BaseResponseWrapperLongWarningMessages> = this.isBearbeiten
                ? this.benutzerstellenRestService.putBeruf(this.mapToDTO())
                : this.benutzerstellenRestService.postBeruf(this.mapToDTO());
            observable
                .pipe(finalize(() => this.facadeService.spinnerService.deactivate(this.channel)))
                .subscribe((response: BaseResponseWrapperBerufBearbeitenDTOWarningMessages | BaseResponseWrapperLongWarningMessages) => {
                    if (!!response.data) {
                        this.form.markAsPristine();
                        this.facadeService.notificationService.success('common.message.datengespeichert');
                        if (this.isBearbeiten) {
                            this.berufBearbeitenDTO = response.data as BerufBearbeitenDTO;
                            this.infopanelService.sendLastUpdate(this.berufBearbeitenDTO.berufDTO);
                            this.mapToForm(this.berufBearbeitenDTO);
                        } else {
                            this.router.navigate(['../bearbeiten'], { relativeTo: this.route, queryParams: { berufId: response.data } });
                        }
                    }
                });
        } else {
            this.ngForm.onSubmit(undefined);
            this.facadeService.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    private mapToDTO(): BerufDTO {
        const baseValue = this.isBearbeiten ? this.berufBearbeitenDTO.berufDTO : {};
        return {
            ...baseValue,
            berufNr: +this.form.controls.berufNr.value,
            bezeichnungMaDe: this.form.controls.maennlichDe.value,
            bezeichnungMaFr: this.form.controls.maennlichFr.value,
            bezeichnungMaIt: this.form.controls.maennlichIt.value,
            bezeichnungWeDe: this.form.controls.weiblicheDe.value,
            bezeichnungWeFr: this.form.controls.weiblicheFr.value,
            bezeichnungWeIt: this.form.controls.weiblicheIt.value,
            chIscoBeruf: !!this.form.controls.bfsStammcode.value
                ? {
                      bfsStammcode: +this.form.controls.bfsStammcode.value
                  }
                : undefined,
            anerkennungsformObject: this.form.controls.anerkennungsform.value ? this.lehrberufCodeDTO : null,
            gueltigAb: this.form.controls.gueltigVon.value,
            gueltigBis: this.form.controls.gueltigBis.value
        };
    }

    private generateForm() {
        this.form = this.fb.group(
            {
                bfsStammcode: null,
                anerkennungsform: null,
                berufNr: null,
                gueltigVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                gueltigBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                maennlichDe: [null, [Validators.required]],
                weiblicheDe: [null, [Validators.required]],
                maennlichFr: [null, [Validators.required]],
                weiblicheFr: [null, [Validators.required]],
                maennlichIt: [null, [Validators.required]],
                weiblicheIt: [null, [Validators.required]],
                stellenmeldepflicht: null
            },
            {
                validators: DateValidator.rangeBetweenDates('gueltigVon', 'gueltigBis', 'val201', true, false)
            }
        );
    }

    private configureToolbox() {
        ToolboxService.CHANNEL = this.channel;
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getBerufErfassenBearbeitenConfig(), this.channel);
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(
                takeUntil(this.unsubscribe),
                filter(action => action.message.action === ToolboxActionEnum.PRINT)
            )
            .subscribe(PrintHelper.print);
    }

    private getData() {
        let berufDataObservable;
        if (this.isBearbeiten) {
            this.route.queryParamMap.subscribe(params => {
                if (params.get('berufId')) {
                    berufDataObservable = this.benutzerstellenRestService.getBeruf(+params.get('berufId'));
                }
            });
        } else {
            berufDataObservable = this.benutzerstellenRestService.getNextBerufNr();
        }

        this.facadeService.spinnerService.activate(this.channel);
        forkJoin<CodeDTO[], BaseResponseWrapperIntegerWarningMessages | BaseResponseWrapperBerufBearbeitenDTOWarningMessages>([
            this.stesRestService.getCode(DomainEnum.ANERKENNUNGSFORM),
            berufDataObservable
        ])
            .pipe(finalize(() => this.facadeService.spinnerService.deactivate(this.channel)))
            .subscribe(([anerkennungsformCodeDTOs, berufResponse]) => {
                this.anerkennungsformArray = anerkennungsformCodeDTOs.map(this.propertyMapper);
                this.lehrberufCodeDTO = anerkennungsformCodeDTOs[0];
                this.setBerufData(berufResponse.data);
            });
    }

    setBerufData(berufData: number | BerufBearbeitenDTO) {
        if (this.isBearbeiten) {
            const berufBearbeitenDTO = berufData as BerufBearbeitenDTO;
            this.berufBearbeitenDTO = berufBearbeitenDTO;
            this.mapToForm(berufBearbeitenDTO);
            this.infopanelService.sendTemplateToInfobar(this.infobartemplate);
            this.infopanelService.sendLastUpdate(this.berufBearbeitenDTO.berufDTO);
            this.infopanelService.updateInformation({
                title: 'stes.label.vermittlung.beruf',
                secondTitle: '',
                hideInfobar: false
            });
        } else {
            this.form.controls.berufNr.setValue(berufData);
        }
    }

    mapToForm(berufbearbeitenDTO: BerufBearbeitenDTO) {
        const berufDTO = berufbearbeitenDTO.berufDTO;
        this.formValueOnLoad = {
            bfsStammcode: !!berufDTO.chIscoBeruf ? berufDTO.chIscoBeruf.bfsStammcode : null,
            anerkennungsform: !!berufDTO.anerkennungsformObject ? berufDTO.anerkennungsformObject.codeId : null,
            berufNr: berufDTO.berufNr,
            gueltigVon: this.facadeService.formUtilsService.parseDate(berufDTO.gueltigAb),
            gueltigBis: this.facadeService.formUtilsService.parseDate(berufDTO.gueltigBis),
            maennlichDe: berufDTO.bezeichnungMaDe,
            weiblicheDe: berufDTO.bezeichnungWeDe,
            maennlichFr: berufDTO.bezeichnungMaFr,
            weiblicheFr: berufDTO.bezeichnungWeFr,
            maennlichIt: berufDTO.bezeichnungMaIt,
            weiblicheIt: berufDTO.bezeichnungWeIt,
            stellenmeldepflicht: berufbearbeitenDTO.meldepflichtig
        };
        this.form.patchValue(this.formValueOnLoad);
    }

    private propertyMapper(element: CodeDTO) {
        return {
            value: element.codeId,
            labelDe: element.kurzTextDe,
            labelFr: element.kurzTextFr,
            labelIt: element.kurzTextIt
        };
    }
}
