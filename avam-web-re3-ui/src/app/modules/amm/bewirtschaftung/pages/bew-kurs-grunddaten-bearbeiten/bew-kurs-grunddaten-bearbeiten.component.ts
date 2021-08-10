import { SessionDTO } from '@dtos/sessionDTO';
import { Permissions } from '@shared/enums/permissions.enum';
import { TranslateService } from '@ngx-translate/core';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { Component, AfterViewInit, ViewChild, OnDestroy, TemplateRef } from '@angular/core';
import { Subscription, forkJoin, Observable } from 'rxjs';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { BewKursGrunddatenFormComponent } from '@app/modules/amm/bewirtschaftung/components';
import { SpinnerService, NotificationService } from 'oblique-reactive';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BewirtschaftungKursGrunddatenData } from '@app/modules/amm/bewirtschaftung/components/bew-kurs-grunddaten-form/bew-kurs-grunddaten-form.component';
import { DeactivationGuarded } from '@app/shared/services/can-deactive-guard.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { GenericConfirmComponent } from '@app/shared';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AmmZulassungstypCode } from '@app/shared/enums/domain-code/amm-zulassungstyp-code.enum';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { DmsMetadatenKopierenModalComponent, DmsMetadatenContext } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { AmmBewirtschaftungNavigationHelper } from '../../services/amm-bewirtschaftung-navigation-helper.service';
import { NavigationService } from '@app/shared/services/navigation-service';
import { AmmBewirtschaftungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { AmmConstants } from '@app/shared/enums/amm-constants';
import { ElementPrefixEnum } from '@app/shared/enums/domain-code/element-prefix.enum';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';

@Component({
    selector: 'avam-bew-kurs-grunddaten-bearbeiten',
    templateUrl: './bew-kurs-grunddaten-bearbeiten.component.html'
})
export class BewKursGrunddatenBearbeitenComponent implements AfterViewInit, OnDestroy, DeactivationGuarded {
    @ViewChild('grunddatenFormComponent') grunddatenFormComponent: BewKursGrunddatenFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    channel = 'bewirtschaftung-kurs-grunddaten-bearbeiten';
    grunddatenData: BewirtschaftungKursGrunddatenData;
    observeClickActionSub: Subscription;
    langSubscription: Subscription;
    queryParamsSub: Subscription;
    permissions: typeof Permissions = Permissions;
    organisationInfoBar: string;
    massnahmeTitel: string;
    zulassungstyp: string;
    provBurNr: number;
    burNrToDisplay: number;
    unternehmensname: string;
    unternehmenStatus: string;
    dfeId: number;
    erfassungsspracheIdGrunddatenState: number;
    isMassnahmeKollektiv: boolean;
    inPlanungAkquisitionSichtbar: boolean;
    showDeleteKursButton: boolean;
    durchfuehrungAbsagbar: boolean;
    durchfuehrungsEntscheideErstellbar: boolean;
    massnahmeId: number;
    produktId: number;

    constructor(
        private infopanelService: AmmInfopanelService,
        private fehlermeldungenService: FehlermeldungenService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private spinnerService: SpinnerService,
        private stesDataRestService: StesDataRestService,
        private route: ActivatedRoute,
        private translateService: TranslateService,
        private modalService: NgbModal,
        private notificationService: NotificationService,
        private dbTranslateService: DbTranslateService,
        private ammHelper: AmmHelper,
        private toolboxService: ToolboxService,
        private router: Router,
        private bewirtschaftungNavigationHelper: AmmBewirtschaftungNavigationHelper,
        private navigationService: NavigationService
    ) {}

    ngAfterViewInit() {
        this.route.parent.parent.parent.params.subscribe(params => {
            this.produktId = +params['produktId'];
        });

        this.queryParamsSub = this.route.parent.queryParams.subscribe(params => {
            this.massnahmeId = +params['massnahmeId'];
            this.dfeId = +params['dfeId'];

            this.getData();
        });

        this.subscribeToToolbox();
        this.initInfopanel();

        this.langSubscription = this.translateService.onLangChange.subscribe(() => {
            this.updateSecondLabel(this.grunddatenData.grunddatenDto);
            this.sendTemplateToInfobar(this.grunddatenData.grunddatenDto);
        });
    }

    getData() {
        this.spinnerService.activate(this.channel);

        forkJoin([
            //NOSONAR
            this.bewirtschaftungRestService.getDfeSession(this.dfeId),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.SPRACHE),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.VERFUEGBARKEITAMM),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.DURCHFUEHRUNGSKRITERUM_AMM),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.SESSION_STATUS)
        ]).subscribe(
            ([dfeResponse, spracheOptionsResponse, verfuegbarkeitAmmResponse, durchfuehrungskriteriumResponse, sessionStatusResponse]) => {
                const grunddatenDto = dfeResponse.data;

                this.grunddatenData = {
                    grunddatenDto,
                    erfassungsspracheOptions: spracheOptionsResponse,
                    verfuegbarkeitAmmOptions: verfuegbarkeitAmmResponse,
                    durchfuehrungskriteriumOptions: durchfuehrungskriteriumResponse,
                    sessionStatusOptions: sessionStatusResponse
                };

                if (grunddatenDto) {
                    this.isMassnahmeKollektiv = grunddatenDto.massnahmeObject.zulassungstypObject.code === AmmZulassungstypCode.KOLLEKTIV;
                    this.inPlanungAkquisitionSichtbar = grunddatenDto.inPlanungAkquisitionSichtbar;
                    this.showDeleteKursButton = this.displayDeleteKursBtn(grunddatenDto);
                    this.durchfuehrungAbsagbar = grunddatenDto.durchfuehrungAbsagbar;
                    this.durchfuehrungsEntscheideErstellbar = grunddatenDto.durchfuehrungsEntscheideErstellbar;
                    const showWartelisteSideNav = !!grunddatenDto.wartelisteplaetze;
                    this.bewirtschaftungNavigationHelper.setKurseDynamicNavigation(
                        this.massnahmeId,
                        this.dfeId,
                        this.inPlanungAkquisitionSichtbar,
                        showWartelisteSideNav,
                        this.isMassnahmeKollektiv
                    );
                }
                this.updateSecondLabel(grunddatenDto);
                this.sendTemplateToInfobar(grunddatenDto);
                this.infopanelService.sendLastUpdate(grunddatenDto);
                this.configureToolbox();

                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            }
        );
    }

    submit() {
        this.fehlermeldungenService.closeMessage();

        if (this.grunddatenFormComponent.formGroup.invalid) {
            this.grunddatenFormComponent.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.save();
    }

    save() {
        this.executeHttpMethod(this.bewirtschaftungRestService.saveDfeSession(this.grunddatenFormComponent.mapToDTO()));
    }

    reset() {
        this.grunddatenFormComponent.reset();
    }

    openDeleteModal() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.deleteKurs();
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    deleteKurs() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);

        this.bewirtschaftungRestService.deleteDfeSession(this.dfeId).subscribe(
            response => {
                if (!response) {
                    this.grunddatenFormComponent.formGroup.markAsPristine();
                    this.notificationService.success(this.dbTranslateService.instant('common.message.datengeloescht'));

                    this.navigationService.hideNavigationTreeRoute(AmmBewirtschaftungPaths.AMM_BEWIRTSCHAFTUNG_KURS);
                    this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/massnahmen/massnahme/kurse`], { queryParams: { massnahmeId: this.massnahmeId } });
                    //add logic for BSP81 "der Benutzer die Massnahme ab der Planung erfasst hat"
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

    zurKursplanung() {
        this.ammHelper.navigateToPlanungAnzeigen(this.dfeId, ElementPrefixEnum.DURCHFUEHRUNGSEINHEIT_PREFIX);
    }

    openAbsagenModal() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.kursAbsagen();
            }
        });
        modalRef.componentInstance.promptLabel = 'amm.bewirtschaftung.message.dfeAbsagen';
        modalRef.componentInstance.primaryButton = 'amm.massnahmen.button.jaabsagen';
    }

    kursAbsagen() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);
        this.erfassungsspracheIdGrunddatenState = this.grunddatenFormComponent.formGroup.controls.erfassungssprache.value;

        this.bewirtschaftungRestService.absagenDfeSession(this.grunddatenFormComponent.mapToDTO()).subscribe(
            absagenResponse => {
                if (absagenResponse.data) {
                    const grunddatenDto = absagenResponse.data;
                    this.grunddatenData = {
                        ...this.grunddatenData,
                        grunddatenDto,
                        erfassungsspracheIdGrunddatenState: this.erfassungsspracheIdGrunddatenState
                    };

                    if (grunddatenDto.hasFreigegebenePositiveEntscheide) {
                        this.notificationService.success(this.translateService.instant('amm.bewirtschaftung.message.dfeAbgesagt.entscheideWiderrufen'));
                    } else {
                        this.notificationService.success(this.translateService.instant('amm.bewirtschaftung.message.dfeAbgesagt.keineEntscheideWiderrufen'));
                    }

                    this.inPlanungAkquisitionSichtbar = grunddatenDto.inPlanungAkquisitionSichtbar;
                    this.showDeleteKursButton = this.displayDeleteKursBtn(grunddatenDto);
                    this.durchfuehrungAbsagbar = grunddatenDto.durchfuehrungAbsagbar;
                    this.durchfuehrungsEntscheideErstellbar = grunddatenDto.durchfuehrungsEntscheideErstellbar;

                    this.notificationService.success(this.translateService.instant('amm.bewirtschaftung.message.dfeAbgesagt'));
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

    kursKopieren() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);

        this.bewirtschaftungRestService.kopierenDfeSession(this.dfeId).subscribe(
            kopierenResponse => {
                if (kopierenResponse.data) {
                    this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                    this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/massnahmen/massnahme/kurse/kurs/grunddaten`], {
                        queryParams: { massnahmeId: this.massnahmeId, dfeId: kopierenResponse.data.durchfuehrungsId }
                    });
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

    openEntscheideErstellenModal() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.entscheideErstellen();
            }
        });
        modalRef.componentInstance.promptLabel = 'amm.bewirtschaftung.message.dfeEntscheideErstellen';
        modalRef.componentInstance.primaryButton = 'amm.massnahmen.button.jaentscheideerstellen';
    }

    entscheideErstellen() {
        this.executeHttpMethod(
            this.bewirtschaftungRestService.entscheideErsrellenDfeSession(this.grunddatenFormComponent.mapToDTO()),
            'amm.bewirtschaftung.message.dfeEntscheidZuweisungErstellt'
        );
    }

    canDeactivate(): boolean {
        return this.grunddatenFormComponent.formGroup.dirty;
    }

    ngOnDestroy(): void {
        this.fehlermeldungenService.closeMessage();
        this.infopanelService.removeFromInfobar(this.infobarTemplate);
        this.infopanelService.sendLastUpdate({}, true);
        this.infopanelService.updateInformation({ secondTitle: '' });
        this.langSubscription.unsubscribe();

        if (this.queryParamsSub) {
            this.queryParamsSub.unsubscribe();
        }

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));

        if (this.isMassnahmeKollektiv) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.WORD, true, true));
        }

        this.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.configureToolboxData());
    }

    private subscribeToToolbox() {
        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.openDmsCopyModal(this.dfeId);
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(+this.dfeId, AvamCommonValueObjectsEnum.T_SESSION, AmmConstants.ZEITPLAN_ANWESENHEIT_OBJECT);
            }
        });
    }

    private openDmsCopyModal(dfeId: number) {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;

        comp.context = DmsMetadatenContext.DMS_CONTEXT_AMM_DFE_KURS_GRUNDDATEN;
        comp.id = dfeId.toString();
    }

    private openHistoryModal(objId: number, objType: string, ref: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });

        const comp = modalRef.componentInstance as HistorisierungComponent;

        comp.id = objId.toString();
        comp.type = objType;
        comp.ref = ref;
    }

    private configureToolboxData(): DokumentVorlageToolboxData {
        const lamErstelltEntscheide = this.grunddatenData.grunddatenDto.lamErstelltEntscheide;

        const config = {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.KURS,
            vorlagenKategorien: [VorlagenKategorie.KURS, VorlagenKategorie.DURCHFUEHRUNGSENTSCHEID, VorlagenKategorie.BEGLEITBRIEF_TEILNEHMERLISTE],
            entityIDsMapping: { DFE_ID: this.dfeId },
            kursLamErstelltEntscheide: lamErstelltEntscheide
        };

        if (lamErstelltEntscheide) {
            config.vorlagenKategorien.push(VorlagenKategorie.ENTSCHEID_KURS);
        }

        return config;
    }

    private initInfopanel() {
        this.infopanelService.dispatchInformation({
            title: 'amm.massnahmen.subnavmenuitem.kurs',
            subtitle: 'amm.massnahmen.subnavmenuitem.grunddaten'
        });
    }

    private displayDeleteKursBtn(data: SessionDTO): boolean {
        return data.anzahlBuchungen === 0 && (!data.reservationenList || (data.reservationenList && data.reservationenList.length === 0));
    }

    private updateSecondLabel(grunddatenDto: SessionDTO) {
        if (grunddatenDto) {
            this.infopanelService.updateInformation({
                secondTitle: this.dbTranslateService.translateWithOrder(grunddatenDto, 'titel')
            });
        }
    }

    private sendTemplateToInfobar(grunddatenDto: SessionDTO) {
        if (grunddatenDto) {
            this.organisationInfoBar = this.ammHelper.getMassnahmenOrganisationTypKuerzel(
                grunddatenDto.massnahmeObject.produktObject.elementkategorieAmtObject,
                grunddatenDto.massnahmeObject.produktObject.strukturelementGesetzObject
            );
            this.massnahmeTitel = this.dbTranslateService.translateWithOrder(grunddatenDto.massnahmeObject, 'titel');
            this.zulassungstyp = this.dbTranslateService.translate(grunddatenDto.massnahmeObject.zulassungstypObject, 'kurzText');
            this.provBurNr = grunddatenDto.massnahmeObject.ammAnbieterObject.unternehmen.provBurNr;
            this.burNrToDisplay = this.provBurNr ? this.provBurNr : grunddatenDto.massnahmeObject.ammAnbieterObject.unternehmen.burNummer;
            this.unternehmensname = this.ammHelper.concatenateUnternehmensnamen(
                grunddatenDto.massnahmeObject.ammAnbieterObject.unternehmen.name1,
                grunddatenDto.massnahmeObject.ammAnbieterObject.unternehmen.name2,
                grunddatenDto.massnahmeObject.ammAnbieterObject.unternehmen.name3
            );
            this.unternehmenStatus = this.dbTranslateService.translate(grunddatenDto.massnahmeObject.ammAnbieterObject.unternehmen.statusObject, 'text');
        }

        this.infopanelService.sendTemplateToInfobar(this.infobarTemplate);
    }

    private executeHttpMethod = (httpMethod: Observable<any>, notificationMessage = 'common.message.datengespeichert') => {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.channel);
        this.erfassungsspracheIdGrunddatenState = this.grunddatenFormComponent.formGroup.controls.erfassungssprache.value;

        httpMethod.subscribe(
            response => {
                if (response.data) {
                    const grunddatenDto = response.data;

                    this.grunddatenData = {
                        ...this.grunddatenData,
                        grunddatenDto,
                        erfassungsspracheIdGrunddatenState: this.erfassungsspracheIdGrunddatenState
                    };

                    this.inPlanungAkquisitionSichtbar = grunddatenDto.inPlanungAkquisitionSichtbar;
                    this.showDeleteKursButton = this.displayDeleteKursBtn(grunddatenDto);
                    this.durchfuehrungAbsagbar = grunddatenDto.durchfuehrungAbsagbar;
                    this.durchfuehrungsEntscheideErstellbar = grunddatenDto.durchfuehrungsEntscheideErstellbar;
                    this.infopanelService.sendLastUpdate(grunddatenDto);
                    const showWartelisteSideNav = !!grunddatenDto.wartelisteplaetze;
                    this.notificationService.success(this.translateService.instant(notificationMessage));
                    this.bewirtschaftungNavigationHelper.setKurseDynamicNavigation(
                        this.massnahmeId,
                        this.dfeId,
                        this.inPlanungAkquisitionSichtbar,
                        showWartelisteSideNav,
                        this.isMassnahmeKollektiv
                    );
                    this.configureToolbox();
                }

                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            },
            () => {
                this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.channel);
            }
        );
    };
}
