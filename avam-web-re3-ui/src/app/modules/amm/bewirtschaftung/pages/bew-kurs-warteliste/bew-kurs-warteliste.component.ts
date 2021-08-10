import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { FacadeService } from '@app/shared/services/facade.service';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { forkJoin } from 'rxjs';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { TeilnehmerDTO } from '@app/shared/models/dtos-generated/teilnehmerDTO';
import { FormArray, FormGroup, FormBuilder } from '@angular/forms';
import { AmmTeilnehmerlisteManuellUmbuchbarDTO } from '@app/shared/models/dtos-generated/ammTeilnehmerlisteManuellUmbuchbarDTO';
import { AmmTeilnehmerlisteBuchungenParamDTO } from '@app/shared/models/dtos-generated/ammTeilnehmerlisteBuchungenParamDTO';
import { ActivatedRoute } from '@angular/router';

import { Permissions } from '@app/shared/enums/permissions.enum';
import { SessionDTO } from '@app/shared/models/dtos-generated/sessionDTO';
// prettier-ignore
import { BaseResponseWrapperAmmTeilnehmerlisteBuchungenParamDTOWarningMessages } from 
'@app/shared/models/dtos-generated/baseResponseWrapperAmmTeilnehmerlisteBuchungenParamDTOWarningMessages';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { AmmDmsTypeEnum } from '@app/shared/enums/amm-dms-type.enum';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { takeUntil } from 'rxjs/operators';
import { Unsubscribable, SpinnerService } from 'oblique-reactive';
import { ElementPrefixEnum } from '@app/shared/enums/domain-code/element-prefix.enum';

@Component({
    selector: 'avam-bew-kurs-warteliste',
    templateUrl: './bew-kurs-warteliste.component.html'
})
export class BewKursWartelisteComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    permissions: typeof Permissions = Permissions;
    channel = 'bew-kurs-warteliste';

    massnahmeId: number;
    dfeId: number;

    dataSource;
    lastUpdate;
    manuellUmbuchbar: AmmTeilnehmerlisteManuellUmbuchbarDTO;
    teilnehmerlisteForm: FormGroup;

    displayKurseCheckboxes = true;
    disableButton = false;
    showUmbuchen = false;
    inPlanungAkquisitionSichtbar = false;

    kuerzelMassnahmentyp: string;
    zulassungsTyp: string;
    unternehmensname: string;
    provBurNr: number;
    burNrToDisplay: number;
    unternehmenStatus: string;
    aktiveBuchungen: number;
    freieBuchungen: number;
    buchungenAufWarteliste: number;
    annulierteBuchungen: number;

    rowCheckboxSubscription: Subscription;
    langSubscription: Subscription;

    dfeDto: SessionDTO;
    massnahmeDto: MassnahmeDTO;
    teilnehmerlisteBuchungen: AmmTeilnehmerlisteBuchungenParamDTO;

    constructor(
        private facade: FacadeService,
        private infopanelService: AmmInfopanelService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private ammHelper: AmmHelper
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.route.parent.queryParams.subscribe(params => {
            this.massnahmeId = +params['massnahmeId'];
            this.dfeId = +params['dfeId'];
        });

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.dataSource = this.lastUpdate ? this.lastUpdate.map((row, index) => this.createRow(row, index)) : [];
            this.updateSecondLabel(this.dfeDto);
            this.addToInforbar(this.massnahmeDto);
        });

        this.createForm();

        this.subscribeToToolbox();
        this.configureToolbox();

        this.initInfopanel();
        this.rowCheckboxSubscription = this.subscribeToRowCheckboxChanges();
    }

    ngAfterViewInit() {
        this.getData();
    }

    ngOnDestroy(): void {
        this.langSubscription.unsubscribe();
        this.rowCheckboxSubscription.unsubscribe();
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.removeFromInfobar(this.infobarTemplate);
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        const suchParam: AmmTeilnehmerlisteBuchungenParamDTO = this.mapToDTO();

        forkJoin([this.bewirtschaftungRestService.getDfeSession(this.dfeId), this.bewirtschaftungRestService.getDfeWarteliste(suchParam)]).subscribe(
            ([dfeResponse, wartelisteResponse]) => {
                if (dfeResponse.data) {
                    this.dfeDto = dfeResponse.data;
                    this.massnahmeDto = this.dfeDto.massnahmeObject;

                    this.updateSecondLabel(this.dfeDto);
                    this.addToInforbar(this.massnahmeDto);
                }

                this.handleWartelisteResponse(wartelisteResponse);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    reset() {
        this.teilnehmerlisteForm.reset();
    }

    zurKursplanung() {
        this.ammHelper.navigateToPlanungAnzeigen(this.dfeId, ElementPrefixEnum.DURCHFUEHRUNGSEINHEIT_PREFIX);
    }

    umbuchen(event?) {
        const checkboxes = event ? [event.ammBuchungId] : this.getRowCheckboxes().controls.reduce((arr, cb, i) => (cb.value && arr.push(this.dataSource[i].ammBuchungId), arr), []);

        this.aufWartelisteUmbuchen(checkboxes);
    }

    mapToDTO(): AmmTeilnehmerlisteBuchungenParamDTO {
        const teilnehmerlisteDtoParam: AmmTeilnehmerlisteBuchungenParamDTO = {};

        if (this.dfeId) {
            teilnehmerlisteDtoParam.durchfuehrungseinheit = { durchfuehrungsId: this.dfeId };
        }

        teilnehmerlisteDtoParam.createTeilnehmerliste = true;

        teilnehmerlisteDtoParam.typeTeilnehmerliste = false;
        teilnehmerlisteDtoParam.createManuellUmbuchbarParam = true;
        teilnehmerlisteDtoParam.createInitialerZeitraum = false;

        return teilnehmerlisteDtoParam;
    }

    private aufWartelisteUmbuchen(checkboxes: number[]) {
        this.facade.spinnerService.activate(this.channel);
        this.facade.fehlermeldungenService.closeMessage();

        this.bewirtschaftungRestService.dfeWartelisteUmbuchen(this.mapToDTO(), this.dfeId, checkboxes).subscribe(
            response => {
                this.handleWartelisteResponse(response);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    private handleWartelisteResponse(response: BaseResponseWrapperAmmTeilnehmerlisteBuchungenParamDTOWarningMessages) {
        if (response.data) {
            this.createForm();
            this.updateAnzahlBuchungen(response.data);
            this.teilnehmerlisteBuchungen = response.data;
            this.lastUpdate = this.teilnehmerlisteBuchungen.teilnehmerlisteArray;
            this.manuellUmbuchbar = this.teilnehmerlisteBuchungen.manuellUmbuchbar;
            this.dataSource = this.teilnehmerlisteBuchungen.teilnehmerlisteArray.map((row: TeilnehmerDTO, index) => this.createRow(row, index));
            this.inPlanungAkquisitionSichtbar = this.teilnehmerlisteBuchungen.durchfuehrungseinheit
                ? this.teilnehmerlisteBuchungen.durchfuehrungseinheit.inPlanungAkquisitionSichtbar
                : false;

            this.setButtons();

            this.rowCheckboxSubscription.unsubscribe();
            this.rowCheckboxSubscription = this.subscribeToRowCheckboxChanges();

            OrColumnLayoutUtils.scrollTop();
            this.facade.spinnerService.deactivate(this.channel);
        } else {
            OrColumnLayoutUtils.scrollTop();
            this.facade.spinnerService.deactivate(this.channel);
        }
    }

    private createForm() {
        this.teilnehmerlisteForm = this.formBuilder.group({
            rowCheckboxes: this.formBuilder.array([])
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

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.ZURUECK, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.getToolboxConfigData(), true);
    }

    private getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: null,
            vorlagenKategorien: null,
            entityIDsMapping: { DFE_ID: this.dfeId }
        };
    }

    private initInfopanel() {
        this.infopanelService.dispatchInformation({
            title: 'amm.massnahmen.subnavmenuitem.kurs',
            subtitle: 'amm.massnahmen.subnavmenuitem.warteliste'
        });
    }

    private updateSecondLabel(dfeDto: SessionDTO) {
        if (dfeDto) {
            this.infopanelService.updateInformation({
                secondTitle: this.facade.dbTranslateService.translateWithOrder(dfeDto, 'titel')
            });
        }
    }

    private addToInforbar(massnahmeDto: MassnahmeDTO) {
        if (massnahmeDto) {
            this.kuerzelMassnahmentyp = this.getKuerzelMassnahmentyp(massnahmeDto);
            this.zulassungsTyp = this.facade.dbTranslateService.translateWithOrder(massnahmeDto.zulassungstypObject, 'kurzText');
            this.provBurNr = massnahmeDto.ammAnbieterObject.unternehmen.provBurNr;
            this.burNrToDisplay = this.provBurNr ? this.provBurNr : massnahmeDto.ammAnbieterObject.unternehmen.burNummer;
            this.unternehmensname = this.ammHelper.concatenateUnternehmensnamen(
                massnahmeDto.ammAnbieterObject.unternehmen.name1,
                massnahmeDto.ammAnbieterObject.unternehmen.name2,
                massnahmeDto.ammAnbieterObject.unternehmen.name3
            );
            this.unternehmenStatus = this.facade.dbTranslateService.translate(massnahmeDto.ammAnbieterObject.unternehmen.statusObject, 'text');
        }

        this.infopanelService.appendToInforbar(this.infobarTemplate);
    }

    private getKuerzelMassnahmentyp(massnahmeDto: MassnahmeDTO): string {
        const kuerzel = massnahmeDto && massnahmeDto.produktObject.elementkategorieAmtObject ? massnahmeDto.produktObject.elementkategorieAmtObject.organisation : '';
        const massnahmentyp =
            massnahmeDto && massnahmeDto.produktObject.strukturelementGesetzObject
                ? this.facade.dbTranslateService.translate(massnahmeDto.produktObject.strukturelementGesetzObject, 'elementName')
                : '';

        return kuerzel && massnahmentyp ? `${kuerzel} - ${massnahmentyp}` : kuerzel ? kuerzel : massnahmentyp ? massnahmentyp : '';
    }

    private subscribeToToolbox(): Subscription {
        return this.facade.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((event: any) => {
                if (event.message.action === ToolboxActionEnum.PRINT) {
                    this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.dataSource);
                }
            });
    }

    private getRowCheckboxes(): FormArray {
        return this.teilnehmerlisteForm.get('rowCheckboxes') as FormArray;
    }

    private subscribeToRowCheckboxChanges() {
        return this.teilnehmerlisteForm.controls.rowCheckboxes.valueChanges.subscribe(arr => {
            this.disableButton = arr.every(v => !!v === false);
        });
    }

    private setButtons() {
        const listeErzeugt = this.listenerzeugungErfolgreich();

        this.showUmbuchen = listeErzeugt && this.teilnehmerlisteBuchungen.manuellUmbuchbar && this.teilnehmerlisteBuchungen.manuellUmbuchbar.anzahlManuellUmbuchbar > 0;
    }

    private listenerzeugungErfolgreich() {
        return (
            (this.teilnehmerlisteBuchungen.durchfuehrungseinheit != null &&
                (this.teilnehmerlisteBuchungen.session || this.teilnehmerlisteBuchungen.beschaeftigungseinheitTyp != null)) ||
            this.teilnehmerlisteBuchungen.massnahmeId !== 0
        );
    }

    private updateAnzahlBuchungen(teilnehmerlisteBuchungenDto: AmmTeilnehmerlisteBuchungenParamDTO) {
        this.aktiveBuchungen = teilnehmerlisteBuchungenDto.aktive;
        this.freieBuchungen = teilnehmerlisteBuchungenDto.freie;
        this.buchungenAufWarteliste = teilnehmerlisteBuchungenDto.aufWarteliste;
        this.annulierteBuchungen = teilnehmerlisteBuchungenDto.annulierte;
    }
}
