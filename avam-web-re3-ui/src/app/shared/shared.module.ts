import { InfoleistePanelService } from '@shared/services/infoleiste-panel.service';
import { ZahlstelleSuchenModule } from './components/zahlstelle-suchen/zahlstelle-suchen.module';
import { StesGesuchteArbeitsregionenComponent } from '@stes/pages/details';
import { CanDeactivateGuard } from './services/can-deactive-guard.service';
import { CanDeleteGuard } from './services/can-delete-guard.service';
import { SearchSessionStorageService } from './services/search-session-storage.service';
import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ObliqueModule } from 'oblique-reactive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UnternehmenDataService } from './services/unternehmen-data.service';
import { MessageBus } from './services/message-bus';
import { InfotagService } from './services/infotag.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import {
    AbbrechenModalComponent,
    AbbrechenOnlyActiveModalComponent,
    AlkZahlstelleAutosuggestComponent,
    ArbeitsorteAutosuggestComponent,
    ArrowScrollingTopDirective,
    AutofocusDirective,
    AutofocusTwoFieldsDirective,
    AutosizeDirective,
    AutosuggestInputComponent,
    AutosuggestTwoFieldsComponent,
    AvamNavTreeComponent,
    BenutzerstelleAuswaehlenTabelleComponent,
    CloseTabDirective,
    CustomErrorMessages,
    CustomFormControlStateDirective,
    DmsService,
    DoubleParagraphComponent,
    EmailInputComponent,
    ErwerbssituationAktuellTableComponent,
    FormPersonalienHelperService,
    FormUtilsService,
    GemeindeAutosuggestComponent,
    GenericConfirmComponent,
    GeschlechtPipe,
    InfotagSearchFormComponent,
    InfotagSearchResultComponent,
    NavigationComponent,
    NumberOnlyDirective,
    ObjectIteratorPipe,
    OpenCloseNavbarDirective,
    ParagraphComponent,
    PermissionDirective,
    ResizableColumnDirective,
    RoboHelpService,
    SchlagworteAutosuggestInputComponent,
    SortableHeader,
    TerminAngabenFormComponent,
    TextareaComponent,
    ThrottleClickDirective,
    VermittlungSelectComponent,
    AvamDataTableModalComponent,
    ModalWrapperComponent,
    PositiveIntegerOnlyDirective,
    VollzugsregionAutosuggestComponent,
    SortByPipe,
    ButtonDisplayPipe,
    FormatNumberPipe,
    FachberatungsangebotService,
    KontaktpersonService,
    StesCommonSearchTableComponent,
    FormatSwissFrancPipe,
    InfotagSearchResultTableComponent,
    AmmStandortErfassenWizardService,
    DbTranslatePipe,
    MonthPipe,
    AmmBeschaeftigungseinheitErfassenWizardService,
    ReplaceQuotesPipe,
    DisableOnSpinnerDirective
} from './index';
import { AvamWizardComponent } from './components/new/avam-wizard/avam-wizard.component';
import { AvamWizardStepComponent } from './components/new/avam-wizard/avam-wizard-step/avam-wizard-step.component';
import { AvamWizardSubstepComponent } from './components/new/avam-wizard/avam-wizard-substep/avam-wizard-substep.component';
import { SkipStepDirective } from './components/new/avam-wizard/skip-step.directive';
import { HistorisierungComponent } from './components/historisierung/historisierung.component';
import { InfoMessageService } from '@shared/services/info-message.service';
import { DmsMetadatenKopierenModalComponent } from './components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { DmsTemplatesComponent } from './components/dms-templates/dms-templates.component';
import { LandAutosuggestModalComponent } from './components/land-autosuggest-modal/land-autosuggest-modal.component';
import { DropdownArrayComponent } from './components/dropdown-array/dropdown-array.component';
import { RouterModule } from '@angular/router';
import { ButtonPermissionsDirective } from './directives/button-permissions.directive';
import { CoreComponentsModule } from '@app/library/core/core-components.module';
import { ZuweisungWizardService } from './components/new/avam-wizard/zuweisung-wizard.service';
import { ErweiterteSucheComponent } from './components/erweiterte-suche/erweiterte-suche.component';
import { FachberatungWizardService } from './components/new/avam-wizard/fachberatung-wizard.service';
import { StesDetailsInfoleisteComponent, StesDetailsInfoleistePanelComponent } from '@app/modules/stes/components';
import { TextOverflowTooltipDirective } from '@shared/directives/text-overflow-tooltip.directive';
import { TextOverflowTooltipInputFieldDirective } from '@shared/directives/text-overflow-tooltip-input-field.directive';
import { AmmnutzungWizardService } from './components/new/avam-wizard/ammnutzung-wizard.service';
import { AvamFooterModule } from './components/avam-action-footer/action-footer.module';
import { AvamInputModalComponent } from './components/avam-input-modal/avam-input-modal.component';
import { ZuweisungWizardComponent } from '@app/modules/stes/pages/arbeitsvermittlungen/zuweisung/wizard/zuweisung-wizard.component';
import { AvamSelectWeekAvailabilityComponent } from './components/avam-select-week-availability/avam-select-week-availability.component';
import { KontaktpersonWaehlenModalComponent } from './components/kontaktperson-waehlen-modal/kontaktperson-waehlen-modal.component';
import { KontaktpersonInputWrapperComponent } from './components/kontaktperson-input-wrapper/kontaktperson-input-wrapper.component';
import { NegateInputDirective } from './directives/negate-input.directive';
import { DetailFachberatungsangebotModalComponent } from './components/detail-fachberatungsangebot-modal/detail-fachberatungsangebot-modal.component';
import { AvamTreeTablePrintModalComponent } from './components/avam-tree-table-print-modal/avam-tree-table-print-modal.component';
import { ProfilvergleichModalComponent } from './components/profilvergleich-modal/profilvergleich-modal.component';
import { AvamAmmUebersichtTreeTableComponent } from './components/avam-amm-uebersicht-tree-table/avam-amm-uebersicht-tree-table.component';
import { StesTreeTableWraperComponent } from './components/stes-tree-table-wraper/stes-tree-table-wraper.component';
import { AnforderungenSkillsVergleichenModalComponent } from './components/anforderungen-skills-vergleichen-modal/anforderungen-skills-vergleichen-modal.component';
import {
    StesDetailsModalComponent,
    StesDetailsModalPersonalienComponent,
    StesDetailsModalGrunddatenComponent,
    StesDetailsModalBerufsdatenComponent,
    StesDetailsModalBerufsdatenDetailComponent,
    StesDetailsModalStellensucheComponent,
    StesDetailsModalSprachenComponent,
    StesDetailsModalDatenfreigabeComponent
} from './components/stes-details-modal/index';
import { MassnahmenartWaehlenModalComponent } from './components/massnahmenart-waehlen-modal/massnahmenart-waehlen-modal.component';
import {
    OsteDetailsModalComponent,
    OsteDetailsModalBewirtschaftungComponent,
    OsteDetailsModalBasisangabenComponent,
    OsteDetailsModalAnforderungenComponent,
    OsteDetailsModalBewerbungComponent
} from './components/oste-details-modal/index';
import { MatchingWizardService } from './components/new/avam-wizard/matching-wizard.service';
import { ToolboxModule } from './components/toolbox/toolbox.module';
import { CustomPopoverModule } from './directives/custom-popover.module';
import { MassnahmeBuchenWizardService } from './components/new/avam-wizard/massnahme-buchen-wizard.service';
import { OsteStellenbeschreibungModalComponent } from './components/oste-details-modal/oste-stellenbeschreibung-modal/oste-stellenbeschreibung-modal.component';
import { AvamStesInfoBarComponent } from './components/avam-stes-info-bar/avam-stes-info-bar.component';
import { BenutzerstelleSucheComponent } from '@shared/components/benutzerstelle-suche/benutzerstelle-suche.component';
import { GekoStesService } from '@shared/services/geko-stes.service';
import { SideNavigationResizeDirective } from './directives/side-navigation-resize.directive';
import { ParticipationPlacesComponent } from '../modules/stes/pages/amm/pages/uebersicht/teilnehmerplaetze/components/participation-places/participation-places.component';
import { StesCommonSearchComponent } from '@shared/components/stes-common-search/stes-common-search.component';
// prettier-ignore
import {
    MassnahmenverantwortungBenutzerstelleSearchComponent
} from '@shared/components/massnahmenverantwortung-benutzerstelle-search/massnahmenverantwortung-benutzerstelle-search.component';
import { CdkTableModule } from '@angular/cdk/table';
import { MeldungenTableComponent } from './components/meldungen-table/meldungen-table.component';
import { AvamGenericTablePrintComponent } from './components/avam-generic-table-print/avam-generic-table-print.component';
import { AufgabenTableComponent } from './components/aufgaben-table/aufgaben-table.component';
import { ModalAnfBerufTableComponent } from './components/oste-details-modal/pages/oste-details-modal-anforderungen/modal-anf-beruf-table/modal-anf-beruf-table.component';
import { ModalAnfSpracheTableComponent } from './components/oste-details-modal/pages/oste-details-modal-anforderungen/modal-anf-sprache-table/modal-anf-sprache-table.component';
import { GeschaefteTableComponent } from './components/geschaefte-table/geschaefte-table.component';
import { ParticipationTooltipDirective } from '../modules/stes/pages/amm/pages/uebersicht/teilnehmerplaetze/components/participation-places/participation-tooltip.directive';
import { CommonWrapperTableComponent } from './components/common-wrapper-table/common-wrapper-table.component';
import { UnternehmenSearchComponent } from './components/unternehmen/search/search.component';
import { UnternehmenErfassenComponent } from './components/unternehmen/erfassen/erfassen.component';
import { UnternehmenWizardService } from '@shared/components/new/avam-wizard/unternehmen-wizard.service';
import { WizardStandortadresseComponent } from './components/unternehmen/erfassen/wizard-standortadresse/wizard-standortadresse.component';
import { WizardDoppelerfassungComponent } from './components/unternehmen/erfassen/wizard-doppelerfassung/wizard-doppelerfassung.component';
import { ProfilvergleichTableComponent } from './components/profilvergleich-table/profilvergleich-table.component';
import { MetadatenCopyTableComponent } from './components/dms-metadaten-kopieren-modal/metadaten-copy-table/metadaten-copy-table.component';
import { UnternehmenMainContainerComponent } from './components/unternehmen/common/main-container/main-container.component';
import { UnternehmenAdressdatenComponent } from './components/unternehmen/unternehmen-daten/adressdaten/adressdaten.component';
import { UnternehmenContentComponent } from './components/unternehmen/common/content/content.component';
import { BenuAuswaehlenTableComponent } from './components/benutzerstelle-auswaehlen-tabelle/benu-auswaehlen-table/benu-auswaehlen-table.component';
import { HistorisierungTableComponent } from './components/historisierung/historisierung-table/historisierung-table.component';
import { DmsTempTableComponent } from './components/dms-templates/dms-temp-table/dms-temp-table.component';
import { KontaktpersonenComponent } from './components/unternehmen/kontaktpflege/kontaktpersonen/kontaktpersonen.component';
import { KontaktpersonSearchComponent } from './components/unternehmen/kontaktperson-search/kontaktperson-search.component';
import { CommonInfoFieldsComponent } from './components/unternehmen/common/common-info-fields/common-info-fields.component';
// prettier-ignore
import { KontaktpersonenTableComponent } from './components/kontaktpersonen-table/kontaktpersonen-table.component';
import { KontaktpersonSearchResultComponent } from './components/unternehmen/kontaktperson-search/kontaktperson-search-result/kontaktperson-search-result.component';
import { AmmProduktErfassenWizardService } from './components/new/avam-wizard/amm-produkt-erfassen-wizard.service';
import { KontaktPersonErfassenComponent } from './components/unternehmen/kontaktpflege/kontaktpersonen/kontakt-person-erfassen/kontakt-person-erfassen.component';
import { VermittlungSelectTableComponent } from './components/vermittlung-select/vermittlung-select-table/vermittlung-select-table/vermittlung-select-table.component';
// prettier-ignore
import {
    KontaktpersonWaehlenTableComponent
} from './components/kontaktperson-waehlen-modal/kontaktperson-waehlen-table/kontaktperson-waehlen-table/kontaktperson-waehlen-table.component';
import { AmmInfotagMassnahmeWizardService } from './components/new/avam-wizard/amm-infotag-massnahme-wizard.service';
import { AmmInfopanelComponent } from './components/amm-infopanel/amm-infopanel.component';
import { KontakteComponent } from '@shared/components/unternehmen/kontaktpflege/kontakte/kontakte.component';
import { BurDatenModalComponent } from './components/unternehmen/common/bur-daten-modal/bur-daten-modal.component';
import { KontaktTableComponent } from './components/kontakt-table/kontakt-table.component';
import { KontaktErfassenComponent } from './components/unternehmen/kontaktpflege/kontakte/kontakt-erfassen/kontakt-erfassen.component';
import { KontaktService } from '@shared/services/kontakt.service';
import { BurDatenAnzeigenComponent } from './components/unternehmen/bur-bfs/bur-daten-anzeigen/bur-daten-anzeigen.component';
import { MutationsantraegeAnzeigenComponent } from './components/unternehmen/bur-bfs/mutationsantrag/mutationsantraege-anzeigen/mutationsantraege-anzeigen.component';
import { KundenberaterComponent } from '@shared/components/unternehmen/kontaktpflege/kundenberater/kundenberater.component';
import { TerminUebertragenComponent } from '@shared/components/termin-uebertragen/termin-uebertragen.component';
import { PopoverModule } from 'ngx-bootstrap';
import { BurmutationsantragComponent } from '@shared/components/unternehmen/common/modal-burmutationsantrag/burmutationsantrag.component';
import { PermissionContextDirective } from './directives/permission-context.directive';
import { AmmMassnahmeErfassenWizardService } from './components/new/avam-wizard/amm-massnahme-erfassen-wizard.service';
import { MutationsantragSichtenComponent } from './components/unternehmen/bur-bfs/mutationsantrag/mutationsantrag-sichten/mutationsantrag-sichten.component';
// prettier-ignore
import {
    MutationsantraegeAnzeigenTableComponent
} from './components/unternehmen/bur-bfs/mutationsantrag/mutationsantraege-anzeigen/mutationsantraege-anzeigen-table/mutationsantraege-anzeigen-table.component';
import { ModalBuradresseComponent } from '@shared/components/unternehmen/common/modal-buradresse/modal-buradresse.component';
import { MitteilungenAnzeigenComponent } from './components/unternehmen/bur-bfs/mitteilung/mitteilungen-anzeigen/mitteilungen-anzeigen.component';
import { MitteilungAnzeigenComponent } from './components/unternehmen/bur-bfs/mitteilung/mitteilung-anzeigen/mitteilung-anzeigen.component';
import { FachberatungsangeboteTableComponent } from './components/fachberatungsangebote-table/fachberatungsangebote-table.component';
import { MitteilungSendenComponent } from './components/unternehmen/bur-bfs/mitteilung/mitteilung-senden/mitteilung-senden.component';
import { AvamKontaktpersonDynamicArrayComponent } from './components/avam-kontaktperson-dynamic-array/avam-kontaktperson-dynamic-array.component';
import { DateRangeFormComponent } from './components/date-range-form/date-range-form.component';
import { AmmKursErfassenWizardService } from './components/new/avam-wizard/amm-kurs-erfassen-wizard.service';
import { VermittlungDataPanelComponent } from './components/vermittlung-data-panel/vermittlung-data-panel.component';
import { VermittlungRueckmeldungenComponent } from './components/vermittlung-rueckmeldungen/vermittlung-rueckmeldungen.component';
import { SchnellzuweisungenBearbeitenComponent } from './components/schnellzuweisungen-bearbeiten/schnellzuweisungen-bearbeiten.component';
import { AvamCollapsePanelComponent } from '@shared/components/avam-collapse-panel/avam-collapse-panel.component';
import { ProfilvergleichComponent } from '@shared/components/zuweisung/profilvergleich/profilvergleich.component';
import { VermittlungFertigstellenComponent } from '@shared/components/zuweisung/vermittlung-fertigstellen/vermittlung-fertigstellen.component';
import { VermittlungSearchFormComponent } from './components/vermittlung-search-form/vermittlung-search-form.component';
import { ContentService } from '@shared/components/unternehmen/common/content/content.service';
import { WrappersModule } from '@app/library/wrappers/wrappers.module';
// prettier-ignore
import {
    MatchingVermittlungFertigstellenComponent
} from '@shared/components/matchingprofil-vermittlung-erfassen/matching-vermittlung-fertigstellen/matching-vermittlung-fertigstellen.component';
import { MatchingProfilvergleichComponent } from '@shared/components/matchingprofil-vermittlung-erfassen/matching-profilvergleich/matching-profilvergleich.component';
import { AlertModule } from './components/alert/alert.module';
import { PreviousRouteService } from './services/previous-route.service';
import { AlignPopupTemplateAndInputModule } from '@app/library/wrappers/form/autosuggests/directives/align-popup-template-and-input/align-popup-template-and-input.module';
import { ArrowScrollingModule } from '@app/library/wrappers/form/autosuggests/directives/arrow-scrolling/arrow-scrolling.module';
import { RegionenAuswaehlenComponentModule } from './components/regionen-auswaehlen/regionen-auswaehlen.module';
import { CommonButtonDisplayPipe } from './pipes/common-button-display.pipe';
import { BeurteilungskriteriumAuswaehlenModalModule } from './components/beurteilungskriterium-auswaehlen-modal/beurteilungskriterium-auswaehlen-modal.module';
import { AmmPlanwertRestService } from '@app/modules/amm/planung/services/amm-planwert-rest.service';
import { RahmenvertragSuchenTableComponent } from './components/rahmenvertrag-suchen-table/rahmenvertrag-suchen-table.component';
import { TeilzahlungswertService } from './services/teilzahlungswert.service';
import { CallbackHelperService } from '@shared/services/callback-helper.service';
import { VertragswertErfassenWizardService } from './components/new/avam-wizard/vertragswert-erfassen-wizard.service';
import { MeldungenComponent } from './components/unternehmen/geschaeftskontrolle/meldungen/meldungen.component';
import { AbrechnungswertErfassenWizardService } from './components/new/avam-wizard/abrechnungswert-erfassen-wizard.service';
import { BewPreismodelTableComponent } from './components/bew-preismodel-table/bew-preismodel-table.component';
import { BewRestwertTableComponent } from './components/bew-restwert-table/bew-restwert-table.component';
import { ArbeitgeberSearchTableComponent } from './components/arbeitgeber-search-table/arbeitgeber-search-table.component';
import { GekoArbeitgeberService } from '@shared/services/geko-arbeitgeber.service';
import { AufgabenAnzeigenComponent } from '@shared/components/unternehmen/geschaeftskontrolle/aufgaben/aufgaben-anzeigen.component';
import { GeschaefteComponent } from './components/unternehmen/geschaeftskontrolle/geschaefte/geschaefte.component';
import { AufgabenErfassenComponent } from './components/unternehmen/geschaeftskontrolle/aufgaben-erfassen/aufgaben-erfassen.component';
import { AufgabenErfassenFormComponent } from './components/unternehmen/geschaeftskontrolle/aufgaben-erfassen/aufgaben-erfassen-form.component';
import { UnternehmenSearchFormComponent } from './components/unternehmen/search/unternehmen-search-form/unternehmen-search-form.component';
import { GekoRegelService } from '@shared/services/geko-regel.service';
import { ControllingwerteTableComponent } from './components/controllingwerte-table/controllingwerte-table.component';
import { Step1OsteErfassenFormComponent } from '@shared/components/unternehmen/oste-erfassen/step1-oste-erfassen-form/step1-oste-erfassen-form.component';
import { BenutzerstelleErfassenWizardService } from '@shared/components/new/avam-wizard/benutzerstelle-erfassen-wizard.service';
import { RolleErfassenWizardService } from '@shared/components/new/avam-wizard/rolle-erfassen-wizard.service';
import { Step2OsteErfassenFormComponent } from '@shared/components/unternehmen/oste-erfassen/step2-oste-erfassen-form/step2-oste-erfassen-form.component';
import { Step2OsteSpracheTableComponent } from '@shared/components/unternehmen/oste-erfassen/step2-oste-erfassen-form/step2-oste-sprache-table/step2-oste-sprache-table.component';
import { Step2OsteBerufTableComponent } from '@shared/components/unternehmen/oste-erfassen/step2-oste-erfassen-form/step2-oste-beruf-table/step2-oste-beruf-table.component';
import { Step3OsteErfassenFormComponent } from '@shared/components/unternehmen/oste-erfassen/step3-oste-erfassen-form/step3-oste-erfassen-form.component';
import { Step4OsteErfassenFormComponent } from '@shared/components/unternehmen/oste-erfassen/step4-oste-erfassen-form/step4-oste-erfassen-form.component';
import { ButtonGroupBewirtschaftungComponent } from '@shared/components/unternehmen/oste-erfassen/step4-oste-erfassen-form/button-checkbox/button-group-bewirtschaftung.component';
import { BenutzerstelleService } from '@shared/services/benutzerstelle.service';
import { RolleService } from '@shared/services/rolle.service';
import { AmmPlanungRestService } from '@app/modules/amm/planung/services/amm-planung-rest.service';
import { BeschaeftigungsgradRangeSelectComponent } from './components/beschaeftigungsgrad-range-select/beschaeftigungsgrad-range-select.component';
import { AvamNavTreeModelDirective } from '@shared/components/avam-nav-tree/avam-nav-tree-model.directive';
import { BenutzermeldungService } from '@shared/services/benutzermeldung.service';

@NgModule({
    declarations: [
        CustomFormControlStateDirective,
        AutosuggestInputComponent,
        CustomErrorMessages,
        ParagraphComponent,
        TextareaComponent,
        AutosizeDirective,
        StesDetailsInfoleistePanelComponent,
        StesDetailsInfoleisteComponent,
        ThrottleClickDirective,
        CloseTabDirective,
        TextOverflowTooltipDirective,
        TextOverflowTooltipInputFieldDirective,
        SortableHeader,
        ObjectIteratorPipe,
        AutosuggestTwoFieldsComponent,
        EmailInputComponent,
        GemeindeAutosuggestComponent,
        AlkZahlstelleAutosuggestComponent,
        AbbrechenModalComponent,
        GenericConfirmComponent,
        ErwerbssituationAktuellTableComponent,
        ArbeitsorteAutosuggestComponent,
        OpenCloseNavbarDirective,
        ResizableColumnDirective,
        VermittlungSelectComponent,
        AvamDataTableModalComponent,
        ModalWrapperComponent,
        AbbrechenOnlyActiveModalComponent,
        InfotagSearchFormComponent,
        InfotagSearchResultComponent,
        TerminAngabenFormComponent,
        NumberOnlyDirective,
        PositiveIntegerOnlyDirective,
        VollzugsregionAutosuggestComponent,
        BenutzerstelleAuswaehlenTabelleComponent,
        DoubleParagraphComponent,
        AvamWizardComponent,
        AvamWizardStepComponent,
        AvamWizardSubstepComponent,
        SkipStepDirective,
        HistorisierungComponent,
        NavigationComponent,
        GeschlechtPipe,
        PermissionDirective,
        ButtonPermissionsDirective,
        SchlagworteAutosuggestInputComponent,
        DmsTemplatesComponent,
        AutofocusDirective,
        AutofocusTwoFieldsDirective,
        DmsMetadatenKopierenModalComponent,
        DmsTemplatesComponent,
        LandAutosuggestModalComponent,
        LandAutosuggestModalComponent,
        DropdownArrayComponent,
        ArrowScrollingTopDirective,
        AvamInputModalComponent,
        AvamNavTreeComponent,
        AvamNavTreeModelDirective,
        ErweiterteSucheComponent,
        ZuweisungWizardComponent,
        AvamSelectWeekAvailabilityComponent,
        KontaktpersonWaehlenModalComponent,
        KontaktpersonInputWrapperComponent,
        NegateInputDirective,
        DetailFachberatungsangebotModalComponent,
        AvamAmmUebersichtTreeTableComponent,
        AvamTreeTablePrintModalComponent,
        ProfilvergleichModalComponent,
        StesTreeTableWraperComponent,
        AnforderungenSkillsVergleichenModalComponent,
        SortByPipe,
        ButtonDisplayPipe,
        StesDetailsModalComponent,
        StesDetailsModalPersonalienComponent,
        StesDetailsModalGrunddatenComponent,
        StesDetailsModalBerufsdatenComponent,
        StesDetailsModalBerufsdatenDetailComponent,
        StesDetailsModalStellensucheComponent,
        StesDetailsModalSprachenComponent,
        StesDetailsModalDatenfreigabeComponent,
        MassnahmenartWaehlenModalComponent,
        OsteDetailsModalComponent,
        OsteDetailsModalBewirtschaftungComponent,
        OsteDetailsModalBasisangabenComponent,
        OsteDetailsModalAnforderungenComponent,
        OsteDetailsModalBewerbungComponent,
        OsteStellenbeschreibungModalComponent,
        AvamStesInfoBarComponent,
        FormatNumberPipe,
        FormatSwissFrancPipe,
        BenutzerstelleSucheComponent,
        ParticipationPlacesComponent,
        SideNavigationResizeDirective,
        MassnahmenverantwortungBenutzerstelleSearchComponent,
        StesCommonSearchComponent,
        MeldungenTableComponent,
        AvamGenericTablePrintComponent,
        AufgabenTableComponent,
        GeschaefteTableComponent,
        ModalAnfBerufTableComponent,
        ModalAnfSpracheTableComponent,
        ParticipationTooltipDirective,
        CommonWrapperTableComponent,
        UnternehmenSearchComponent,
        UnternehmenErfassenComponent,
        WizardStandortadresseComponent,
        WizardDoppelerfassungComponent,
        ProfilvergleichTableComponent,
        UnternehmenMainContainerComponent,
        UnternehmenAdressdatenComponent,
        UnternehmenContentComponent,
        MetadatenCopyTableComponent,
        BenuAuswaehlenTableComponent,
        HistorisierungTableComponent,
        DmsTempTableComponent,
        KontakteComponent,
        KontaktpersonenComponent,
        KontaktpersonSearchComponent,
        KundenberaterComponent,
        CommonInfoFieldsComponent,
        KontaktpersonenTableComponent,
        KontaktpersonSearchResultComponent,
        StesCommonSearchTableComponent,
        KontaktPersonErfassenComponent,
        VermittlungSelectTableComponent,
        KontaktpersonWaehlenTableComponent,
        InfotagSearchResultTableComponent,
        KontaktpersonWaehlenTableComponent,
        AmmInfopanelComponent,
        BurDatenModalComponent,
        KontaktTableComponent,
        KontaktErfassenComponent,
        BurDatenAnzeigenComponent,
        MutationsantraegeAnzeigenComponent,
        TerminUebertragenComponent,
        MutationsantraegeAnzeigenComponent,
        BurmutationsantragComponent,
        PermissionContextDirective,
        MutationsantragSichtenComponent,
        MutationsantraegeAnzeigenTableComponent,
        ModalBuradresseComponent,
        MitteilungenAnzeigenComponent,
        MitteilungAnzeigenComponent,
        FachberatungsangeboteTableComponent,
        DateRangeFormComponent,
        MitteilungSendenComponent,
        StesGesuchteArbeitsregionenComponent,
        AvamKontaktpersonDynamicArrayComponent,
        VermittlungDataPanelComponent,
        VermittlungRueckmeldungenComponent,
        SchnellzuweisungenBearbeitenComponent,
        AvamCollapsePanelComponent,
        ProfilvergleichComponent,
        VermittlungFertigstellenComponent,
        AvamCollapsePanelComponent,
        VermittlungSearchFormComponent,
        MonthPipe,
        VermittlungSearchFormComponent,
        MatchingProfilvergleichComponent,
        MatchingVermittlungFertigstellenComponent,
        CommonButtonDisplayPipe,
        ReplaceQuotesPipe,
        RahmenvertragSuchenTableComponent,
        DisableOnSpinnerDirective,
        AufgabenAnzeigenComponent,
        MeldungenComponent,
        BewPreismodelTableComponent,
        BewRestwertTableComponent,
        ArbeitgeberSearchTableComponent,
        GeschaefteComponent,
        AufgabenErfassenComponent,
        AufgabenErfassenFormComponent,
        UnternehmenSearchFormComponent,
        ControllingwerteTableComponent,
        Step1OsteErfassenFormComponent,
        Step2OsteErfassenFormComponent,
        Step2OsteBerufTableComponent,
        Step2OsteSpracheTableComponent,
        Step3OsteErfassenFormComponent,
        Step4OsteErfassenFormComponent,
        ButtonGroupBewirtschaftungComponent,
        BeschaeftigungsgradRangeSelectComponent
    ],
    exports: [
        AutosuggestInputComponent,
        ParagraphComponent,
        TextareaComponent,
        CloseTabDirective,
        CustomFormControlStateDirective,
        ThrottleClickDirective,
        TextOverflowTooltipDirective,
        TextOverflowTooltipInputFieldDirective,
        AutosuggestTwoFieldsComponent,
        EmailInputComponent,
        GemeindeAutosuggestComponent,
        AlkZahlstelleAutosuggestComponent,
        AbbrechenModalComponent,
        GenericConfirmComponent,
        ErwerbssituationAktuellTableComponent,
        ArbeitsorteAutosuggestComponent,
        OpenCloseNavbarDirective,
        ResizableColumnDirective,
        VermittlungSelectComponent,
        AvamDataTableModalComponent,
        ModalWrapperComponent,
        AbbrechenOnlyActiveModalComponent,
        ObjectIteratorPipe,
        SortableHeader,
        InfotagSearchFormComponent,
        InfotagSearchResultComponent,
        StesDetailsInfoleistePanelComponent,
        StesDetailsInfoleisteComponent,
        TerminAngabenFormComponent,
        NumberOnlyDirective,
        AlertModule,
        PositiveIntegerOnlyDirective,
        VollzugsregionAutosuggestComponent,
        BenutzerstelleAuswaehlenTabelleComponent,
        DoubleParagraphComponent,
        AvamWizardComponent,
        AvamWizardStepComponent,
        AvamWizardSubstepComponent,
        SkipStepDirective,
        HistorisierungComponent,
        NavigationComponent,
        GeschlechtPipe,
        PermissionDirective,
        ButtonPermissionsDirective,
        SchlagworteAutosuggestInputComponent,
        DmsMetadatenKopierenModalComponent,
        LandAutosuggestModalComponent,
        LandAutosuggestModalComponent,
        BeurteilungskriteriumAuswaehlenModalModule,
        DropdownArrayComponent,
        ArrowScrollingTopDirective,
        AvamInputModalComponent,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NgbModule,
        ObliqueModule,
        TranslateModule,
        CoreComponentsModule,
        AvamNavTreeComponent,
        AvamNavTreeModelDirective,
        ErweiterteSucheComponent,
        AutofocusDirective,
        AutofocusTwoFieldsDirective,
        AvamFooterModule,
        AvamSelectWeekAvailabilityComponent,
        KontaktpersonWaehlenModalComponent,
        KontaktpersonInputWrapperComponent,
        DetailFachberatungsangebotModalComponent,
        AvamAmmUebersichtTreeTableComponent,
        AvamTreeTablePrintModalComponent,
        ProfilvergleichModalComponent,
        StesTreeTableWraperComponent,
        AnforderungenSkillsVergleichenModalComponent,
        SortByPipe,
        ButtonDisplayPipe,
        StesDetailsModalComponent,
        StesDetailsModalPersonalienComponent,
        StesDetailsModalGrunddatenComponent,
        StesDetailsModalBerufsdatenComponent,
        StesDetailsModalBerufsdatenDetailComponent,
        StesDetailsModalStellensucheComponent,
        StesDetailsModalSprachenComponent,
        StesDetailsModalDatenfreigabeComponent,
        MassnahmenartWaehlenModalComponent,
        OsteDetailsModalComponent,
        OsteDetailsModalBewirtschaftungComponent,
        OsteDetailsModalBasisangabenComponent,
        OsteDetailsModalAnforderungenComponent,
        OsteDetailsModalBewerbungComponent,
        ToolboxModule,
        AvamStesInfoBarComponent,
        FormatNumberPipe,
        FormatSwissFrancPipe,
        BenutzerstelleSucheComponent,
        ParticipationPlacesComponent,
        SideNavigationResizeDirective,
        MassnahmenverantwortungBenutzerstelleSearchComponent,
        StesCommonSearchComponent,
        MeldungenTableComponent,
        AvamGenericTablePrintComponent,
        AufgabenTableComponent,
        GeschaefteTableComponent,
        ParticipationTooltipDirective,
        ProfilvergleichTableComponent,
        StesCommonSearchTableComponent,
        InfotagSearchResultTableComponent,
        AmmInfopanelComponent,
        UnternehmenMainContainerComponent,
        UnternehmenErfassenComponent,
        UnternehmenSearchComponent,
        KontaktpersonSearchComponent,
        UnternehmenAdressdatenComponent,
        KontaktpersonenComponent,
        KontaktPersonErfassenComponent,
        KontakteComponent,
        KontaktErfassenComponent,
        KundenberaterComponent,
        BurDatenAnzeigenComponent,
        MutationsantraegeAnzeigenComponent,
        TerminUebertragenComponent,
        PermissionContextDirective,
        MutationsantragSichtenComponent,
        MutationsantraegeAnzeigenTableComponent,
        MitteilungenAnzeigenComponent,
        MitteilungAnzeigenComponent,
        FachberatungsangeboteTableComponent,
        DateRangeFormComponent,
        StesGesuchteArbeitsregionenComponent,
        AvamKontaktpersonDynamicArrayComponent,
        CommonWrapperTableComponent,
        VermittlungRueckmeldungenComponent,
        VermittlungDataPanelComponent,
        SchnellzuweisungenBearbeitenComponent,
        AvamCollapsePanelComponent,
        AvamCollapsePanelComponent,
        ProfilvergleichComponent,
        VermittlungFertigstellenComponent,
        UnternehmenContentComponent,
        VermittlungSearchFormComponent,
        MonthPipe,
        WrappersModule,
        MatchingProfilvergleichComponent,
        MatchingVermittlungFertigstellenComponent,
        RegionenAuswaehlenComponentModule,
        CommonButtonDisplayPipe,
        ReplaceQuotesPipe,
        CommonInfoFieldsComponent,
        RahmenvertragSuchenTableComponent,
        ZahlstelleSuchenModule,
        DisableOnSpinnerDirective,
        AufgabenAnzeigenComponent,
        MeldungenComponent,
        BewPreismodelTableComponent,
        BewRestwertTableComponent,
        ArbeitgeberSearchTableComponent,
        GeschaefteComponent,
        AufgabenErfassenComponent,
        UnternehmenSearchFormComponent,
        ControllingwerteTableComponent,
        BurDatenModalComponent,
        Step1OsteErfassenFormComponent,
        Step2OsteErfassenFormComponent,
        Step2OsteBerufTableComponent,
        Step2OsteSpracheTableComponent,
        Step3OsteErfassenFormComponent,
        Step4OsteErfassenFormComponent,
        ButtonGroupBewirtschaftungComponent,
        BenuAuswaehlenTableComponent,
        BeschaeftigungsgradRangeSelectComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NgbModule, // Keep this order!
        ObliqueModule.forRoot(), // It has only forRoot method
        TranslateModule.forChild(),
        BsDatepickerModule.forRoot(),
        CoreComponentsModule,
        RouterModule,
        AvamFooterModule,
        ToolboxModule,
        CustomPopoverModule,
        CdkTableModule,
        PopoverModule,
        WrappersModule,
        AlertModule,
        AlignPopupTemplateAndInputModule,
        ArrowScrollingModule,
        BeurteilungskriteriumAuswaehlenModalModule,
        RegionenAuswaehlenComponentModule,
        ZahlstelleSuchenModule
    ],
    providers: [
        FormUtilsService,
        FormPersonalienHelperService,
        CallbackHelperService,
        CanDeactivateGuard,
        CanDeleteGuard,
        SearchSessionStorageService,
        PreviousRouteService,
        UnternehmenDataService,
        MessageBus,
        InfotagService,
        InfoMessageService,
        RoboHelpService,
        DmsService,
        ZuweisungWizardService,
        FachberatungWizardService,
        AmmnutzungWizardService,
        MatchingWizardService,
        MassnahmeBuchenWizardService,
        SortByPipe,
        GekoStesService,
        UnternehmenWizardService,
        FachberatungsangebotService,
        KontaktpersonService,
        KontaktService,
        AmmProduktErfassenWizardService,
        AmmInfotagMassnahmeWizardService,
        PermissionContextDirective,
        AmmMassnahmeErfassenWizardService,
        AmmKursErfassenWizardService,
        AmmStandortErfassenWizardService,
        DatePipe,
        DbTranslatePipe,
        ContentService,
        MonthPipe,
        AmmBeschaeftigungseinheitErfassenWizardService,
        ReplaceQuotesPipe,
        AmmPlanwertRestService,
        AmmPlanungRestService,
        TeilzahlungswertService,
        BenutzerstelleErfassenWizardService,
        RolleErfassenWizardService,
        VertragswertErfassenWizardService,
        InfoleistePanelService,
        AbrechnungswertErfassenWizardService,
        GekoArbeitgeberService,
        GekoRegelService,
        BenutzermeldungService,
        BenutzerstelleService,
        RolleService
    ],
    entryComponents: [
        LandAutosuggestModalComponent,
        AbbrechenModalComponent,
        AbbrechenOnlyActiveModalComponent,
        DmsMetadatenKopierenModalComponent,
        HistorisierungComponent,
        DmsTemplatesComponent,
        OsteStellenbeschreibungModalComponent,
        MassnahmenartWaehlenModalComponent,
        AvamGenericTablePrintComponent,
        GenericConfirmComponent
    ]
})
export class SharedModule {
    constructor() {
        /**/
    }
}
