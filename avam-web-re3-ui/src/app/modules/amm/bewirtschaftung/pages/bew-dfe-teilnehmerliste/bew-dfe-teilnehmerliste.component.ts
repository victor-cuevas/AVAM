import { AmmTeilnehmerlisteManuellUmbuchbarDTO } from '@app/shared/models/dtos-generated/ammTeilnehmerlisteManuellUmbuchbarDTO';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { BewMassnahmeTeilnehmerlisteFormComponent } from '../../components';
import { ActivatedRoute } from '@angular/router';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { FiltersData } from '../../components/bew-massnahme-teilnehmerliste-form/bew-massnahme-teilnehmerliste-form.component';
import { Subscription, forkJoin } from 'rxjs';
import { ToolboxService } from '@app/shared';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { AmmDmsTypeEnum } from '@app/shared/enums/amm-dms-type.enum';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { TeilnehmerDTO } from '@app/shared/models/dtos-generated/teilnehmerDTO';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { AmmTeilnehmerlisteBuchungenParamDTO } from '@app/shared/models/dtos-generated/ammTeilnehmerlisteBuchungenParamDTO';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { AmmZulassungstypCode } from '@app/shared/enums/domain-code/amm-zulassungstyp-code.enum';
// prettier-ignore
import { BaseResponseWrapperAmmTeilnehmerlisteBuchungenParamDTOWarningMessages } from
'@app/shared/models/dtos-generated/baseResponseWrapperAmmTeilnehmerlisteBuchungenParamDTOWarningMessages';
import { FacadeService } from '@app/shared/services/facade.service';
import { SessionDTO } from '@app/shared/models/dtos-generated/sessionDTO';
import { AmmTeilnehmerlisteHelperService, TeilnehmerInfobarData } from '../../services/amm-teilnehmerliste-helper.service';
import { TeilnehmerlisteExportParamDto } from '@app/shared/models/dtos-generated/teilnehmerlisteExportParamDto';
import { ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { ElementPrefixEnum } from '@app/shared/enums/domain-code/element-prefix.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';

@Component({
    selector: 'avam-bew-dfe-teilnehmerliste',
    templateUrl: './bew-dfe-teilnehmerliste.component.html'
})
export class BewDfeTeilnehmerlisteComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('formComponent') formComponent: BewMassnahmeTeilnehmerlisteFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    permissions: typeof Permissions = Permissions;

    massnahmeId: number;
    dfeId: number;
    beschaeftigungseinheitId: number;
    data: FiltersData;

    dataSource;
    lastUpdate;

    inPlanungAkquisitionSichtbar = true;
    displayKurseCheckboxes = true;
    showStatusleiste = false;
    showAutomatischesNachrueckenCheckbox = false;
    enableAutomatischesNachrueckenCheckbox = false;
    showSpeichern = false;
    showUmbuchen = false;
    disableButton = false;

    teilnehmerlisteForm: FormGroup;

    teilnehmerlisteBuchungen: AmmTeilnehmerlisteBuchungenParamDTO;
    manuellUmbuchbar: AmmTeilnehmerlisteManuellUmbuchbarDTO;
    massnahmeDto: MassnahmeDTO;
    dfeDto: SessionDTO;

    infobarData: TeilnehmerInfobarData;

    aktiveBuchungen: number;
    freieBuchungen: number;
    buchungenAufWarteliste: number;
    annulierteBuchungen: number;

    channel = 'dfe-teilnehmerliste-form';
    resultsChannel = 'dfe-teilnehmerliste-results';
    stateChannel = 'dfe-teilnehmerliste-state';

    toolboxSubscription: Subscription;
    rowCheckboxSubscription: Subscription;
    langSubscription: Subscription;

    constructor(
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private facade: FacadeService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private stesDataRestService: StesDataRestService,
        private infopanelService: AmmInfopanelService,
        private teilnehmerHelperService: AmmTeilnehmerlisteHelperService,
        private searchSession: SearchSessionStorageService,
        private ammHelper: AmmHelper
    ) {
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.route.parent.queryParams.subscribe(params => {
            this.massnahmeId = +params['massnahmeId'];
            this.dfeId = +params['dfeId'];
            this.beschaeftigungseinheitId = +params['beId'];
            this.data = {
                ...this.data,
                massnahmeId: this.massnahmeId,
                dfeId: this.dfeId ? this.dfeId : 0,
                beschaeftigungseinheitId: this.beschaeftigungseinheitId ? this.beschaeftigungseinheitId : 0
            };
        });

        this.toolboxSubscription = this.subscribeToToolbox();
        this.teilnehmerHelperService.configureToolbox(this.channel, this.getToolboxConfigData());

        this.initInfopanel();

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.teilnehmerHelperService.updateSecondLabel(this.dfeDto);
            this.infobarData = this.teilnehmerHelperService.addToInforbar(this.massnahmeDto);
            this.infopanelService.appendToInforbar(this.infobarTemplate);
            this.dataSource = this.lastUpdate ? this.lastUpdate.map((row, index) => this.createRow(row, index)) : [];
        });

        this.createForm();
        this.rowCheckboxSubscription = this.subscribeToRowCheckboxChanges();
    }

    ngAfterViewInit() {
        this.getData();
    }

    ngOnDestroy(): void {
        this.langSubscription.unsubscribe();
        this.toolboxSubscription.unsubscribe();
        this.rowCheckboxSubscription.unsubscribe();
        this.infopanelService.removeFromInfobar(this.infobarTemplate);
        this.facade.fehlermeldungenService.closeMessage();
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin([this.bewirtschaftungRestService.getDfeSession(this.dfeId), this.stesDataRestService.getActiveCodeByDomain(DomainEnum.ZEITRAUMFILTER)]).subscribe(
            ([dfeResponse, zeitraumfilterOptionsResponse]) => {
                this.data = { ...this.data, zeitraumfilterOptions: zeitraumfilterOptionsResponse };

                if (dfeResponse.data) {
                    this.dfeDto = dfeResponse.data;
                    this.massnahmeDto = this.dfeDto.massnahmeObject;
                    this.showStatusleiste = this.massnahmeDto.zulassungstypObject.code === AmmZulassungstypCode.KOLLEKTIV;

                    this.teilnehmerHelperService.updateSecondLabel(this.dfeDto);
                    this.infobarData = this.teilnehmerHelperService.addToInforbar(this.massnahmeDto);
                    this.infopanelService.appendToInforbar(this.infobarTemplate);

                    const state = this.searchSession.restoreStateByKey(this.stateChannel);
                    this.search(state ? state.fields : this.formComponent.mapToDto(this.data));
                }

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    onRefresh() {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.formComponent.formGroup.valid) {
            this.searchSession.storeFieldsByKey(this.stateChannel, this.formComponent.mapToDto(this.data));
            this.search(this.formComponent.mapToDto(this.data));
        } else {
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    submit() {
        this.facade.fehlermeldungenService.closeMessage();
        this.save();
    }

    save() {
        this.facade.spinnerService.activate(this.resultsChannel);

        this.bewirtschaftungRestService
            .massnahmeDfeTeilnehmerlisteSpeichern(this.formComponent.mapToDto(this.data), this.dfeId, this.teilnehmerlisteForm.controls.automatisheWarteliste.value)
            .subscribe(
                response => {
                    this.handleResponse(response);
                },
                () => {
                    OrColumnLayoutUtils.scrollTop();
                    this.facade.spinnerService.deactivate(this.resultsChannel);
                }
            );
    }

    reset() {
        if (this.teilnehmerlisteForm.controls.automatisheWarteliste.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.resetValues();
            });
        } else {
            this.resetValues();
        }
    }

    umbuchen(event?) {
        const checkboxes = event ? [event.ammBuchungId] : this.getRowCheckboxes().controls.reduce((arr, cb, i) => (cb.value && arr.push(this.dataSource[i].ammBuchungId), arr), []);

        this.aufWartelisteUmbuchen(checkboxes);
    }

    aufWartelisteUmbuchen(checkboxes: number[]) {
        this.facade.spinnerService.activate(this.resultsChannel);
        this.facade.fehlermeldungenService.closeMessage();

        this.bewirtschaftungRestService.massnahmeDfeTeilnehmerlisteUmbuchen(this.formComponent.mapToDto(this.data), this.dfeId, checkboxes).subscribe(
            response => {
                this.handleResponse(response);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.resultsChannel);
            }
        );
    }

    zurKursplanung() {
        this.ammHelper.navigateToPlanungAnzeigen(this.dfeId, ElementPrefixEnum.DURCHFUEHRUNGSEINHEIT_PREFIX);
    }

    subscribeToRowCheckboxChanges() {
        return this.teilnehmerlisteForm.controls.rowCheckboxes.valueChanges.subscribe(arr => {
            this.disableButton = arr.every(v => !!v === false);
        });
    }

    private resetValues() {
        this.teilnehmerlisteForm.reset();
        this.formComponent.formGroup.reset();

        this.search(this.formComponent.mapToDto(this.data));
    }

    private search(teilnehmerlisteParams: AmmTeilnehmerlisteBuchungenParamDTO) {
        this.facade.spinnerService.activate(this.resultsChannel);

        this.bewirtschaftungRestService.getMassnahmeDfeTeilnehmerliste(teilnehmerlisteParams).subscribe(
            response => {
                this.handleResponse(response);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.resultsChannel);
            }
        );
    }

    private handleResponse(response: BaseResponseWrapperAmmTeilnehmerlisteBuchungenParamDTOWarningMessages) {
        if (response.data) {
            this.createForm();
            this.updateAnzahlBuchungen(response.data);
            this.teilnehmerlisteBuchungen = response.data;
            this.lastUpdate = this.teilnehmerlisteBuchungen.teilnehmerlisteArray;
            this.manuellUmbuchbar = this.teilnehmerlisteBuchungen.manuellUmbuchbar;
            this.dataSource = this.teilnehmerlisteBuchungen.teilnehmerlisteArray.map((row: TeilnehmerDTO, index) => this.createRow(row, index));
            this.formComponent.teilnehmerlisteBuchungenDto = this.teilnehmerlisteBuchungen;
            this.inPlanungAkquisitionSichtbar = this.teilnehmerlisteBuchungen.durchfuehrungseinheit
                ? this.teilnehmerlisteBuchungen.durchfuehrungseinheit.inPlanungAkquisitionSichtbar
                : false;

            this.showAutomatischesNachrueckenCheckbox =
                this.teilnehmerlisteBuchungen.session && this.teilnehmerlisteBuchungen.kollektiv && this.teilnehmerlisteBuchungen.kapazitaetTeilnehmerWarteliste > 0;
            this.enableAutomatischesNachrueckenCheckbox = this.teilnehmerlisteBuchungen.manuellUmbuchbar && this.teilnehmerlisteBuchungen.manuellUmbuchbar.autonachrueckenAktiv;
            this.teilnehmerlisteForm.controls.automatisheWarteliste.setValue(
                this.teilnehmerlisteBuchungen.manuellUmbuchbar && this.teilnehmerlisteBuchungen.manuellUmbuchbar.autonachrueckenChecked
            );

            this.formComponent.mapToForm();
            this.setButtons();

            this.rowCheckboxSubscription.unsubscribe();
            this.rowCheckboxSubscription = this.subscribeToRowCheckboxChanges();

            OrColumnLayoutUtils.scrollTop();
            this.facade.spinnerService.deactivate(this.resultsChannel);
        } else {
            OrColumnLayoutUtils.scrollTop();
            this.facade.spinnerService.deactivate(this.resultsChannel);
        }
    }

    private updateAnzahlBuchungen(teilnehmerlisteBuchungenDto: AmmTeilnehmerlisteBuchungenParamDTO) {
        this.aktiveBuchungen = teilnehmerlisteBuchungenDto.aktive;
        this.freieBuchungen = teilnehmerlisteBuchungenDto.freie;
        this.buchungenAufWarteliste = teilnehmerlisteBuchungenDto.aufWarteliste;
        this.annulierteBuchungen = teilnehmerlisteBuchungenDto.annulierte;
    }

    private getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: null,
            vorlagenKategorien: null,
            entityIDsMapping: { DFE_ID: this.dfeId },
            uiSuffix: AmmDmsTypeEnum.DMS_TYP_KURS
        };
    }

    private subscribeToToolbox(): Subscription {
        return this.facade.toolboxService.observeClickAction(this.channel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXCEL) {
                const formGroup: FormGroup = this.formComponent.formGroup;

                const teilnehmerlisteExportParamDto: TeilnehmerlisteExportParamDto = {} as TeilnehmerlisteExportParamDto;
                teilnehmerlisteExportParamDto.dfeId = this.data.dfeId;

                this.teilnehmerHelperService.onExcelExport(teilnehmerlisteExportParamDto, formGroup, this.data, this.resultsChannel);
            }
        });
    }

    private initInfopanel() {
        this.infopanelService.dispatchInformation({
            title: 'amm.massnahmen.subnavmenuitem.kurs',
            subtitle: 'amm.massnahmen.subnavmenuitem.teilnehmerliste'
        });
    }

    private createForm() {
        this.teilnehmerlisteForm = this.formBuilder.group({
            rowCheckboxes: this.formBuilder.array([]),
            automatisheWarteliste: false
        });
    }

    private createRow(teilnehmer: TeilnehmerDTO, index: number) {
        const formArray = this.getRowCheckboxes();

        if (this.displayKurseCheckboxes) {
            formArray.push(this.formBuilder.control(false));
        }

        const showCheckbox = this.manuellUmbuchbar && this.manuellUmbuchbar.manuelleBuchbarkeit[index];

        return {
            index,
            ammBuchungId: teilnehmer.ammBuchungId,
            kanton: teilnehmer.kanton,
            platz: teilnehmer.buchungPlatz ? teilnehmer.buchungPlatz : '',
            teilnehmer: `${teilnehmer.stesName}, ${teilnehmer.stesVorname}`,
            personenNr: teilnehmer.personenNr,
            benutzerId: teilnehmer.benutzerLogin,
            bearbeitung: `${teilnehmer.benutzerNachname}, ${teilnehmer.benutzerVorname}`,
            benutzerstelle: teilnehmer.benutzerstelleId,
            buchungsdatum: teilnehmer.buchungDatum ? new Date(teilnehmer.buchungDatum) : '',
            von: teilnehmer.buchungVon ? new Date(teilnehmer.buchungVon) : '',
            bis: teilnehmer.buchungBis ? new Date(teilnehmer.buchungBis) : '',
            abbruch: teilnehmer.buchungAbbruch ? new Date(teilnehmer.buchungAbbruch) : '',
            entscheidart: this.facade.dbTranslateService.translateWithOrder(teilnehmer.entscheidArt, 'kurzText'),
            status: this.facade.dbTranslateService.translateWithOrder(teilnehmer.entscheidStatus, 'kurzText'),
            hideCheckbox: !showCheckbox
        };
    }

    private getRowCheckboxes(): FormArray {
        return this.teilnehmerlisteForm.get('rowCheckboxes') as FormArray;
    }

    private setButtons() {
        const listeErzeugt = this.listenerzeugungErfolgreich();

        this.showSpeichern = listeErzeugt && this.showAutomatischesNachrueckenCheckbox && this.enableAutomatischesNachrueckenCheckbox;

        this.showUmbuchen =
            this.showAutomatischesNachrueckenCheckbox &&
            this.teilnehmerlisteBuchungen.manuellUmbuchbar &&
            this.teilnehmerlisteBuchungen.manuellUmbuchbar.anzahlManuellUmbuchbar > 0;
    }

    private listenerzeugungErfolgreich() {
        return (
            (this.teilnehmerlisteBuchungen.durchfuehrungseinheit != null &&
                (this.teilnehmerlisteBuchungen.session || this.teilnehmerlisteBuchungen.beschaeftigungseinheitTyp != null)) ||
            this.teilnehmerlisteBuchungen.massnahmeId !== 0
        );
    }
}
