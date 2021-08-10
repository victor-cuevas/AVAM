import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { InfotagBewirtschaftungGrunddatenFormComponent } from '@app/modules/amm/infotag/components';
import { InfotagBewGrunddatenData } from '@app/modules/amm/infotag/components/infotag-bewirtschaftung-grunddaten-form/infotag-bewirtschaftung-grunddaten-form.component';
import { AmmInfotagRestService } from '@app/modules/amm/infotag/services/amm-infotag-rest.service';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { AmmInfotagMassnahmeWizardService } from '@app/shared/components/new/avam-wizard/amm-infotag-massnahme-wizard.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { SpracheEnum } from '@app/shared/enums/sprache.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { BaseResponseWrapperSessionDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperSessionDTOWarningMessages';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { forkJoin, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { SessionDTO } from '@app/shared/models/dtos-generated/sessionDTO';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'avam-infotag-bewirtschaftung-grunddaten-erfassen',
    templateUrl: './infotag-bewirtschaftung-grunddaten-erfassen.component.html',
    styleUrls: ['./infotag-bewirtschaftung-grunddaten-erfassen.component.scss']
})
export class InfotagBewirtschaftungGrunddatenErfassenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('grunddatenForm') grunddatenForm: InfotagBewirtschaftungGrunddatenFormComponent;
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;

    grunddatenData: InfotagBewGrunddatenData;
    channel = 'infotag-bewirtschaftung-grunddaten-erfassen';
    unternehmen: UnternehmenDTO;

    constructor(
        public wizardService: AmmInfotagMassnahmeWizardService,
        private stesRestService: StesDataRestService,
        private infopanelService: AmmInfopanelService,
        private toolboxService: ToolboxService,
        private spinnerService: SpinnerService,
        private fehlermeldungenService: FehlermeldungenService,
        private ammInfotagRest: AmmInfotagRestService,
        private translate: TranslateService
    ) {
        super();
        ToolboxService.CHANNEL = this.channel;
        SpinnerService.CHANNEL = this.channel;

        const step = new Observable<boolean>(subscriber => {
            this.setupInfobar(false);
            subscriber.next(true);
        });

        this.wizardService.setOnNextStep(step);
    }

    ngOnInit() {
        this.wizardService.navigateInside = false;
        this.configureToolbox();
        this.subscribeToToolbox();
        this.subscribeToLangChange();
        this.getData();
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.channel, undefined, false);
    }

    subscribeToToolbox() {
        this.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                }
            });
    }

    getData() {
        this.spinnerService.activate(this.channel);

        // isInit: Opening the wizard for the first time. It is false when going back and forth inside the wizard.
        const isInit = !(this.wizardService.infotagDto && this.wizardService.infotagDto.durchfuehrungsId > 0);
        // isCopy: Opening the wizard for the first time in copy mode. It is false once we go to second step and save.
        const isCopy = !!this.wizardService.dfeCopyId;

        // Get the correct endpoint from which to fetch the DTO.
        const fetchObservable = this.getHttpObservable(isInit, isCopy);

        forkJoin<CodeDTO[], CodeDTO[], BaseResponseWrapperSessionDTOWarningMessages>([
            this.stesRestService.getCode(DomainEnum.VERFUEGBARKEITAMM),
            this.stesRestService.getCode(DomainEnum.SPRACHE),
            fetchObservable
        ]).subscribe(
            ([verfuegbarkeitoptions, spracheoptions, res]) => {
                this.wizardService.infotagDto = res.data;
                this.wizardService.spracheOptions = spracheoptions.filter(el => el.code !== SpracheEnum.RAETOROMANISCH);
                this.wizardService.grunddatenForm = this.grunddatenForm.formGroup;
                this.grunddatenData = { verfuegbarkeitOptions: verfuegbarkeitoptions, spracheOptions: this.wizardService.spracheOptions, grunddatenDto: res.data };
                if (isCopy) {
                    this.fehlermeldungenService.showMessage('amm.infotag.message.infotagKopiert', 'info');
                }
                this.setupInfobar(isInit);

                this.spinnerService.deactivate(this.channel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.spinnerService.deactivate(this.channel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    getHttpObservable(isInit: boolean, isCopy: boolean): Observable<BaseResponseWrapperSessionDTOWarningMessages> {
        return isCopy && isInit
            ? this.ammInfotagRest.getCopyInfotag(this.wizardService.dfeCopyId)
            : isInit
            ? this.ammInfotagRest.getNewInfotag(this.wizardService.massnahmeId)
            : this.ammInfotagRest.getInfotag(this.wizardService.infotagDto.durchfuehrungsId);
    }

    setupInfobar(isInit: boolean) {
        if (isInit) {
            this.wizardService.infobarKurzel = this.setInfobarData(this.wizardService.infotagDto);
            this.unternehmen = this.wizardService.getInfotagUnternehmen();
            this.infopanelService.appendToInforbar(this.panelTemplate);
        }

        this.infopanelService.dispatchInformation({
            title: 'amm.infotag.titel.infotagErfassen',
            subtitle: 'amm.infotag.subnavmenuitem.grunddaten',
            hideInfobar: false
        });
    }

    setInfobarData(dto: SessionDTO): string {
        if (dto && dto.massnahmeObject && dto.massnahmeObject.produktObject && dto.massnahmeObject.produktObject.elementkategorieAmtObject) {
            return dto.massnahmeObject.produktObject.elementkategorieAmtObject.organisation + '-';
        }

        return '';
    }

    cancel() {
        this.wizardService.cancel();
    }

    reset() {
        this.grunddatenForm.reset();
    }

    next() {
        this.fehlermeldungenService.closeMessage();

        if (this.grunddatenForm.formGroup.invalid) {
            this.grunddatenForm.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.save();
    }

    save() {
        this.spinnerService.activate(this.channel);

        this.ammInfotagRest.saveInfotag(this.grunddatenForm.mapToDTO()).subscribe(
            res => {
                if (res.data) {
                    this.wizardService.infotagDto = res.data;
                    this.wizardService.navigateInside = true;
                    this.wizardService.moveNext();
                }

                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            }
        );
    }

    subscribeToLangChange() {
        this.translate.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            const isInit = !(this.wizardService.infotagDto && this.wizardService.infotagDto.durchfuehrungsId > 0);
            this.setupInfobar(isInit);
        });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
