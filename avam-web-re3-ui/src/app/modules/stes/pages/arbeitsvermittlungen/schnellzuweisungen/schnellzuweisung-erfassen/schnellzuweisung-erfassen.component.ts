import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { FormUtilsService } from '@app/shared';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { StesArbeitsvermittlungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { KontakteViewDTO } from '@app/shared/models/dtos-generated/kontakteViewDTO';
import { SchnellzuweisungDTO } from '@app/shared/models/dtos-generated/schnellzuweisungDTO';
import { StaatDTO } from '@app/shared/models/dtos-generated/staatDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { NavigationService } from '@app/shared/services/navigation-service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { SchnellzuweisungLabels } from '@shared/enums/stes-routing-labels.enum';
import { MessageBus } from '@shared/services/message-bus';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { forkJoin, Subscription } from 'rxjs';
import { SchnellzuweisungFormHandler } from '../schnellzuweisung-form-handler';
import { FacadeService } from '@shared/services/facade.service';

const schnellzuweisungErfassenToolbox = 'schnellzuweisungErfassen';
const schnellzuweisungErfassenChannel = 'schnellzuweisungErfassen';

@Component({
    selector: 'avam-schnellzuweisung-erfassen',
    templateUrl: './schnellzuweisung-erfassen.component.html',
    styleUrls: ['./schnellzuweisung-erfassen.component.scss'],
    providers: [ObliqueHelperService, SchnellzuweisungFormHandler]
})
export class SchnellzuweisungErfassenComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('vermittlung') vermittlung: AvamPersonalberaterAutosuggestComponent;
    vermittlungSuchenTokens: {};
    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;

    schnellzuweisungForm: FormGroup;
    checkboxForm: FormGroup;
    schnellzuweisungToolboxId = schnellzuweisungErfassenToolbox;
    schnellzuweisungChannel = schnellzuweisungErfassenChannel;
    toolboxActionSub: Subscription;
    anredeOptions = [];
    stesId: string;
    editMode = false;
    unternehmenId: number = null;
    permissions: typeof Permissions = Permissions;
    schweizDto: StaatDTO;

    shouldShowPrompt: boolean[] = [true];
    shouldDisableModal: boolean;

    constructor(
        private navigationService: NavigationService,
        private route: ActivatedRoute,
        private obliqueHelper: ObliqueHelperService,
        private toolboxService: ToolboxService,
        private router: Router,
        private dataService: StesDataRestService,
        private dbTranslateService: DbTranslateService,
        private spinnerService: SpinnerService,
        private fehlermeldungenService: FehlermeldungenService,
        private notificationService: NotificationService,
        private resetDialogService: ResetDialogService,
        private stesDataRestService: StesDataRestService,
        private schnellzuweisungFormHandler: SchnellzuweisungFormHandler,
        private authService: AuthenticationService,
        private changeDetector: ChangeDetectorRef,
        private messageBus: MessageBus,
        private stesInfobarService: AvamStesInfoBarService,
        private facade: FacadeService
    ) {
        ToolboxService.CHANNEL = this.schnellzuweisungToolboxId;
        SpinnerService.CHANNEL = this.schnellzuweisungChannel;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.schnellzuweisungErfassen' });
        this.getData();
        this.configureToolbox();
        this.toolboxActionSub = this.subscribeToToolbox();
        this.setSideNav();
        this.schnellzuweisungForm = this.schnellzuweisungFormHandler.createForm(this.editMode);
        this.checkboxForm = this.schnellzuweisungFormHandler.defineFormGroups(this.schnellzuweisungForm);
        this.getRouteParams();
        this.initVermittlungSuchenToken();
        this.schnellzuweisungFormHandler.setAdditionalValidators(this.checkboxForm, this.schnellzuweisungForm);
        this.schnellzuweisungForm.valueChanges.subscribe(val => {
            this.unternehmenId = val.unternehmenId !== -1 ? val.unternehmenId : null;
            this.shouldDisableModal = this.isArbeitgeberDirty();
        });
        this.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                this.closeComponent(message);
            }
        });
    }

    closeComponent(message) {
        if (message.data.label === this.dbTranslateService.instant(SchnellzuweisungLabels.SCHNELLZUWEISUNG_ERFASSEN)) {
            this.cancel();
        }
    }

    ngAfterViewInit() {
        this.vermittlung.appendCurrentUser();
        this.changeDetector.detectChanges();
    }

    configureToolbox() {
        const toolboxConfig = [
            new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)
        ];
        this.toolboxService.sendConfiguration(toolboxConfig, this.schnellzuweisungToolboxId);
    }

    subscribeToToolbox(): Subscription {
        return this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                window.print();
            }
        });
    }

    setSideNav() {
        this.navigationService.showNavigationTreeRoute(StesArbeitsvermittlungPaths.SCHNELLZUWEISUNG_ERFASSEN);
    }

    getData() {
        this.spinnerService.activate(this.schnellzuweisungChannel);

        forkJoin<CodeDTO[], StaatDTO>([this.dataService.getCode(DomainEnum.ANREDE), this.stesDataRestService.getStaatSwiss()]).subscribe(
            ([anredeOptions, schweizDto]) => {
                if (anredeOptions) {
                    this.anredeOptions = this.facade.formUtilsService.mapDropdownKurztext(anredeOptions);
                }

                if (schweizDto) {
                    this.schweizDto = schweizDto;
                    this.schnellzuweisungForm.controls.land.setValue(schweizDto);
                    this.schnellzuweisungForm.controls.land['landAutosuggestObject'] = schweizDto;
                }

                this.spinnerService.deactivate(this.schnellzuweisungChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.spinnerService.deactivate(this.schnellzuweisungChannel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    getRouteParams() {
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });
    }

    initVermittlungSuchenToken() {
        const currentUser = this.authService.getLoggedUser();

        if (currentUser) {
            this.vermittlungSuchenTokens = {
                myBenutzerstelleId: `${currentUser.benutzerstelleId}`,
                myVollzugsregionTyp: DomainEnum.STES
            };
        }
    }

    selectedItem(data) {
        if (data) {
            this.schnellzuweisungFormHandler.mapSelectedUnternehmenToForm(data, this.schnellzuweisungForm, this.schnellzuweisungChannel);
        }
    }

    onUnternehmenInput() {
        this.schnellzuweisungForm.controls.unternehmenId.setValue(-1);
    }

    onKontaktpersonSelected(kontaktperson: KontakteViewDTO) {
        this.schnellzuweisungFormHandler.onKontaktpersonSelected(kontaktperson, this.schnellzuweisungForm);
    }

    onKontaktpersonClear() {
        this.schnellzuweisungFormHandler.onKontaktpersonClear(this.schnellzuweisungForm);
    }

    mapToDTO(): SchnellzuweisungDTO {
        const kontaktpersonForm = this.schnellzuweisungForm.controls.kontaktpersonForm as FormGroup;
        const kontaktpersonCtrls = kontaktpersonForm.controls;
        return {
            ojbVersion: this.schnellzuweisungForm.controls.ojbVersion.value,
            stesId: +this.stesId,
            schnellzuweisungVom: this.facade.formUtilsService.parseDate(this.schnellzuweisungForm.controls.schnellzuweisungVom.value),
            bewerbungBis: this.facade.formUtilsService.parseDate(this.schnellzuweisungForm.controls.bewerbungBis.value),
            vermittlerDetailObject: this.schnellzuweisungForm.controls.vermittlung['benutzerObject'],
            unternehmenId: this.mapUnternehmenId(),
            unternehmenName1: this.mapUnternehmenName1(),
            unternehmenName2: this.schnellzuweisungForm.controls.arbeitgeberName2.value,
            unternehmenName3: this.schnellzuweisungForm.controls.arbeitgeberName3.value,
            unternehmenStrasse: this.schnellzuweisungForm.controls.arbeitgeberStrasse.value,
            unternehmenHausNr: this.schnellzuweisungForm.controls.arbeitgeberStrasseNr.value,
            unternehmenPostfach: this.schnellzuweisungForm.controls.unternehmenPostfach.value,
            ugStaatObject: this.schnellzuweisungForm.controls.land['landAutosuggestObject'],
            ugPlzObject: this.schnellzuweisungForm.controls.plz['plzWohnAdresseObject'],
            ugAuslPlz: this.schnellzuweisungForm.controls.plz['plzWohnAdresseObject'].plzWohnadresseAusland,
            ugAuslPostleitort: this.schnellzuweisungForm.controls.plz['plzWohnAdresseObject'].ortWohnadresseAusland,
            ugPostfachPlzObject: this.schnellzuweisungForm.controls.postfach['plzWohnAdresseObject'],
            ugAuslPostfachPlz: this.schnellzuweisungForm.controls.postfach['plzWohnAdresseObject'].plzWohnadresseAusland,
            ugAuslPostfachOrt: this.schnellzuweisungForm.controls.postfach['plzWohnAdresseObject'].ortWohnadresseAusland,
            kontaktpersonAnredeId: +kontaktpersonCtrls.anrede.value,
            kontaktpersonName: kontaktpersonCtrls.kontaktpersonName.value ? kontaktpersonCtrls.kontaktpersonName.value : '',
            kontaktpersonVorname: kontaktpersonCtrls.kontaktpersonVorname.value,
            kontaktpersonTelefon: kontaktpersonCtrls.kontaktpersonTelefon.value,
            kontaktpersonEmail: kontaktpersonCtrls.kontaktpersonEmail.value,
            stellenbezeichnung: this.schnellzuweisungForm.controls.stellenbezeichnung.value,
            berufObject: this.schnellzuweisungForm.controls.berufTaetigkeit['berufAutosuggestObject'],
            beschaeftigungsgrad: +this.schnellzuweisungForm.controls.vermittlungsGrad.value,
            schriftlich: this.checkboxForm.controls.schriftlich.value,
            elektronisch: this.checkboxForm.controls.elektronisch.value,
            telefonisch: this.checkboxForm.controls.telefonisch.value,
            persoenlich: this.checkboxForm.controls.persoenlich.value,
            bewerUnternehmenEmail: this.schnellzuweisungForm.controls.email.value,
            bewerUnternehmenTelefon: this.schnellzuweisungForm.controls.telefon.value,
            bewerUnternehmenUrl: this.schnellzuweisungFormHandler.mapOnlineFormularToDTO(this.schnellzuweisungForm.controls.onlineFormular.value)
        };
    }

    mapUnternehmenId() {
        const unternehmenId = this.schnellzuweisungForm.controls.arbeitgeberName1['unternehmenAutosuggestObject'].unternehmenId;
        return unternehmenId && unternehmenId !== -1 ? unternehmenId : null;
    }

    mapUnternehmenName1() {
        const unternehmenId = this.schnellzuweisungForm.controls.arbeitgeberName1['unternehmenAutosuggestObject'].unternehmenId;
        return unternehmenId && unternehmenId !== -1
            ? this.schnellzuweisungForm.controls.arbeitgeberName1['unternehmenAutosuggestObject'].name1
            : this.schnellzuweisungForm.controls.arbeitgeberName1.value;
    }

    save() {
        this.fehlermeldungenService.closeMessage();

        if (!this.schnellzuweisungForm.valid) {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            if (!this.checkboxForm.valid) {
                this.fehlermeldungenService.showMessage('arbeitgeber.oste.message.bewerbungsformUngueltig', 'danger');
            }
            OrColumnLayoutUtils.scrollTop();
            return;
        }
        this.spinnerService.activate(this.schnellzuweisungChannel);

        this.dataService.createSchnellzuweisung(this.mapToDTO(), this.dbTranslateService.getCurrentLang()).subscribe(
            response => {
                if (response.data !== null) {
                    this.schnellzuweisungForm.markAsPristine();
                    this.notificationService.success(this.dbTranslateService.instant('common.message.datengespeichert'));
                }
                this.spinnerService.deactivate(this.schnellzuweisungChannel);
                OrColumnLayoutUtils.scrollTop();
                this.router.navigate([`stes/details/${this.stesId}/arbeitsvermittlungen/schnellzuweisung-bearbeiten`], {
                    queryParams: { zuweisungId: response.data.schnellzuweisungId }
                });
            },
            () => {
                this.notificationService.error(this.dbTranslateService.instant('common.message.datennichtgespeichert'));
                this.spinnerService.deactivate(this.schnellzuweisungChannel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    reset() {
        if (this.schnellzuweisungForm.dirty) {
            this.resetDialogService.reset(() => {
                this.schnellzuweisungForm.reset({ schnellzuweisungVom: new Date(), vermittlungsGrad: 100, checkboxForm: { schriftlich: true }, land: this.schweizDto });
                this.schnellzuweisungForm.controls.land['landAutosuggestObject'] = this.schweizDto;
                this.vermittlung.appendCurrentUser();
            });
        }
    }

    cancel() {
        if (this.router.url.includes(StesArbeitsvermittlungPaths.SCHNELLZUWEISUNG_ERFASSEN)) {
            this.router.navigate([`./${StesArbeitsvermittlungPaths.ARBEITSVERMITTLUNGEN_ANZEIGEN}`], { relativeTo: this.route.parent });
        }
    }

    onPersonalEmailClick() {
        this.shouldShowPrompt = [false];
    }

    canDeactivate(): boolean {
        return this.schnellzuweisungForm.dirty;
    }

    isArbeitgeberDirty() {
        return this.schnellzuweisungFormHandler.isArbeitgeberDirty(this.schnellzuweisungForm, this.unternehmenId);
    }

    ngOnDestroy() {
        this.toolboxService.sendConfiguration([]);
        this.toolboxActionSub.unsubscribe();
        this.fehlermeldungenService.closeMessage();
        this.navigationService.hideNavigationTreeRoute(StesArbeitsvermittlungPaths.SCHNELLZUWEISUNG_ERFASSEN);
    }
}
