import { KontakteViewDTO } from '@dtos/kontakteViewDTO';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { UnternehmenDTO } from '@dtos/unternehmenDTO';
import { StaatDTO } from '@dtos/staatDTO';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { Component, ViewChild, AfterViewInit, OnDestroy, TemplateRef } from '@angular/core';
import { AmmMassnahmeErfassenWizardService } from '@app/shared/components/new/avam-wizard/amm-massnahme-erfassen-wizard.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { Router } from '@angular/router';
import { BewDurchfuehrungsortFormComponent } from '@app/modules/amm/bewirtschaftung/components';
import { Observable, Subscription, forkJoin, iif, of } from 'rxjs';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxService } from '@app/shared';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { PermissionContextService } from '@app/shared/services/permission.context.service';
import { DurchfuehrungsortDTO } from '@dtos/durchfuehrungsortDTO';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { KontaktpersonRestService } from '@app/core/http/kontaktperson-rest.service';
import { AmmKontaktpersonDTO } from '@app/shared/models/dtos-generated/ammKontaktpersonDTO';
import { FacadeService } from '@app/shared/services/facade.service';

@Component({
    selector: 'avam-bew-massnahme-durchfuehrungsort-erfassen',
    templateUrl: './bew-massnahme-durchfuehrungsort-erfassen.component.html',
    providers: [PermissionContextService]
})
export class BewMassnahmeDurchfuehrungsortErfassenComponent implements AfterViewInit, OnDestroy {
    @ViewChild('durchsfuerungsortFormComponent') durchsfuerungsortFormComponent: BewDurchfuehrungsortFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    durchfuehrungsortData: any;
    observeClickActionSub: Subscription;
    organisationInfoBar: string;
    produktId: number;
    produktTitelLabel: string;
    unternehmensname: string;
    zulassungstyp: string;
    burNrToDisplay: number;
    unternehmenStatus: string;
    provBurNr: number;
    langSubscription: Subscription;
    permissions: typeof Permissions = Permissions;
    switzerland: StaatDTO;
    kontaktPersonenList: AmmKontaktpersonDTO[] = [];
    durchfuehrungsortDTO: DurchfuehrungsortDTO;

    constructor(
        private wizardService: AmmMassnahmeErfassenWizardService,
        private router: Router,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private infopanelService: AmmInfopanelService,
        private permissionContextService: PermissionContextService,
        private stesDataRestService: StesDataRestService,
        private ammHelper: AmmHelper,
        private kontaktpersonRestService: KontaktpersonRestService,
        private facade: FacadeService
    ) {
        const step = new Observable<boolean>(subscriber => {
            this.facade.fehlermeldungenService.closeMessage();
            this.wizardService.durchfuehrungsortDTOState = this.durchsfuerungsortFormComponent.mapToDTO();

            subscriber.next(true);
        });

        this.wizardService.setOnPreviousStep(step);
    }

    ngAfterViewInit() {
        this.getData();
        this.configureToolbox();
        this.initInfopanel();
        this.infopanelService.appendToInforbar(this.infobarTemplate);

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.initInfopanel();
        });

        this.wizardService.isWizardNext = false;
    }

    getData() {
        this.facade.spinnerService.activate(this.wizardService.channel);
        const updateKP = this.kontaktpersonRestService.getKontaktpersonenByUnternehmenId(this.wizardService.unternehmenObject.unternehmenId);

        forkJoin([
            //NOSONAR
            iif(
                () =>
                    this.wizardService.unternehmenObject.unternehmenId && this.facade.authenticationService.hasAnyPermission([Permissions.ARBEITGEBER_KONTAKTPERSON_SUCHEN])
                        ? true
                        : false,
                updateKP,
                of(null)
            ),
            this.bewirtschaftungRestService.getMassnahmeDurchfuehrungsort(this.wizardService.massnahmeId),
            this.stesDataRestService.getStaatSwiss()
        ]).subscribe(
            ([kontaktPersonResponse, durchfuehrungsortResponse, swissResponse]) => {
                if (kontaktPersonResponse && kontaktPersonResponse.data) {
                    this.kontaktPersonenList = kontaktPersonResponse.data.map(this.ammHelper.kontaktpersonMapper);
                }

                this.durchfuehrungsortDTO = durchfuehrungsortResponse.data;
                this.switzerland = swissResponse;

                if (this.durchfuehrungsortDTO) {
                    this.permissionContextService.getContextPermissions(this.durchfuehrungsortDTO.ownerId);
                }

                if (this.wizardService.durchfuehrungsortDTOState) {
                    if (this.wizardService.hasAnbieterChanged) {
                        this.durchfuehrungsortDTO.bemerkung = this.wizardService.durchfuehrungsortDTOState.bemerkung;
                        this.wizardService.hasAnbieterChanged = false;
                    } else {
                        this.isAnbieterInfoChanged(this.wizardService.durchfuehrungsortDTOState, this.durchfuehrungsortDTO);
                        this.isKontaktpersonInfoChanged(this.wizardService.durchfuehrungsortDTOState);
                        this.durchfuehrungsortDTO = this.wizardService.durchfuehrungsortDTOState;
                        this.durchfuehrungsortDTO.ojbVersion = durchfuehrungsortResponse.data.ojbVersion;
                        this.durchfuehrungsortDTO.ammKontaktpersonObject.ojbVersion = durchfuehrungsortResponse.data.ammKontaktpersonObject.ojbVersion;
                    }
                }

                this.durchfuehrungsortData = {
                    durchfuehrungsortDTO: this.durchfuehrungsortDTO
                };

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.wizardService.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.wizardService.channel);
            }
        );
    }

    isAnbieterInfoChanged(stateDto: DurchfuehrungsortDTO, currentDto: DurchfuehrungsortDTO) {
        if (stateDto && this.isAddressDifferentFromAnbieterWizard(stateDto, this.switzerland, currentDto)) {
            this.facade.fehlermeldungenService.showMessage('amm.message.abweichungstandortadresse', 'info');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    isAddressDifferentFromAnbieterWizard(stateDto, switzerland: StaatDTO, currentDto: DurchfuehrungsortDTO) {
        let isDifferent = false;
        const anbieter: UnternehmenDTO = currentDto.unternehmenObject;

        if (anbieter) {
            let isPlzChanged = false;
            const plz = stateDto.plzObject;
            const land = stateDto.landObject;

            if (land && land.iso2Code === switzerland.iso2Code) {
                isPlzChanged = plz.plzId !== anbieter.plz.plzId;
            } else {
                isPlzChanged = stateDto.auslPlz !== anbieter.plzAusland || stateDto.auslOrt !== anbieter.ortAusland;
            }

            isDifferent =
                this.areStrasseOrHausNummerChanged(stateDto, anbieter) || land.staatId !== anbieter.staat.staatId || isPlzChanged || this.isNameChanged(stateDto, anbieter);
        }

        return isDifferent;
    }

    isNameChanged(stateDto, anbieter: UnternehmenDTO): boolean {
        const isName1Changed = this.isNameLineChanged(stateDto.ugname1, anbieter.name1);
        const isName2Changed = this.isNameLineChanged(stateDto.ugname2, anbieter.name2);
        const isName3Changed = this.isNameLineChanged(stateDto.ugname3, anbieter.name3);

        return isName1Changed || isName2Changed || isName3Changed;
    }

    isNameLineChanged(ugName: string, anbieterName: string): boolean {
        const isOnlyOnePresent = !!ugName !== !!anbieterName;
        const areBothPresentAndDifferent = !!ugName && !!anbieterName && ugName.toLowerCase() !== anbieterName.toLowerCase();

        return isOnlyOnePresent || areBothPresentAndDifferent;
    }

    areStrasseOrHausNummerChanged(stateDto, anbieter: UnternehmenDTO): boolean {
        return (
            (stateDto.strasse ? stateDto.strasse.toLowerCase() : '') !== (anbieter.strasse ? anbieter.strasse.toLowerCase() : '') ||
            (stateDto.hausNummer ? stateDto.hausNummer.toLowerCase() : '') !== (anbieter.strasseNr ? anbieter.strasseNr.toLowerCase() : '')
        );
    }

    submit() {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.durchsfuerungsortFormComponent.formGroup.invalid) {
            this.durchsfuerungsortFormComponent.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.finish();
    }

    finish() {
        this.facade.spinnerService.activate(this.wizardService.channel);

        this.bewirtschaftungRestService.saveMassnahmeDurchfuehrungsort(this.durchsfuerungsortFormComponent.mapToDTO(), this.wizardService.massnahmeId).subscribe(
            response => {
                if (response.data) {
                    this.wizardService.isWizardNext = true;
                    this.isAnbieterInfoChanged(response.data, this.durchfuehrungsortDTO);
                    this.isKontaktpersonInfoChanged(this.wizardService.durchfuehrungsortDTOState);

                    this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                    this.router.navigate([`/amm/bewirtschaftung/produkt/${this.wizardService.produktId}/massnahmen/massnahme/grunddaten`], {
                        queryParams: { massnahmeId: this.wizardService.massnahmeId }
                    });
                }

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.wizardService.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.wizardService.channel);
            }
        );
    }

    onKpersonSelected(kperson: KontakteViewDTO) {
        this.wizardService.kpersonId = kperson.kontaktpersonId;
    }

    back() {
        this.wizardService.movePrev();
    }

    reset() {
        this.durchsfuerungsortFormComponent.reset();
    }

    cancel() {
        this.router.navigate([`amm/bewirtschaftung/produkt/${this.produktId}/massnahmen`]);
        // add logic to redirect to UI 315-002 when SUC is ready
    }

    ngOnDestroy(): void {
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.removeFromInfobar(this.infobarTemplate);

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        this.langSubscription.unsubscribe();
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.wizardService.channel);

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
        });
    }

    private initInfopanel() {
        this.organisationInfoBar = this.ammHelper.getMassnahmenOrganisationTypKuerzel(
            this.wizardService.savedElementkategorieAmtObject,
            this.wizardService.savedStrukturelementGesetzObject
        );
        this.produktId = this.wizardService.produktId;
        this.produktTitelLabel = this.facade.dbTranslateService.translateWithOrder(this.wizardService.produktTitelObject, 'titel');
        this.zulassungstyp = this.facade.dbTranslateService.translate(this.wizardService.zulassungstypObject, 'kurzText');

        this.provBurNr = this.wizardService.unternehmenObject.provBurNr;
        this.burNrToDisplay = this.provBurNr ? this.provBurNr : this.wizardService.unternehmenObject.burNummer;
        this.unternehmensname = this.ammHelper.concatenateUnternehmensnamen(
            this.wizardService.unternehmenObject.name1,
            this.wizardService.unternehmenObject.name2,
            this.wizardService.unternehmenObject.name3
        );
        this.unternehmenStatus = this.facade.dbTranslateService.translate(this.wizardService.unternehmenObject.statusObject, 'text');

        const massnahmeLabel = this.facade.translateService.instant('amm.massnahmen.subnavmenuitem.massnahme');
        const massnahmeTitelLabel = this.facade.dbTranslateService.translateWithOrder(this.wizardService.massnahmeTitelObject, 'titel');
        const erfassenLabel = this.facade.translateService.instant('amm.nutzung.alttext.erfassen');

        this.infopanelService.dispatchInformation({
            title: `${massnahmeLabel} ${massnahmeTitelLabel} ${erfassenLabel}`,
            subtitle: 'amm.massnahmen.subnavmenuitem.durchfuehrungsort'
        });
    }

    private isKontaktpersonInfoChanged(durchfuehrungsortDTOState) {
        if (
            durchfuehrungsortDTOState &&
            this.ammHelper.isKontaktpersonInfoDifferentFromAnbieterWizard(
                durchfuehrungsortDTOState.ammKontaktpersonObject,
                this.durchsfuerungsortFormComponent.isKontaktPersonSelected(durchfuehrungsortDTOState),
                this.kontaktPersonenList,
                this.wizardService.kpersonId
            )
        ) {
            this.facade.fehlermeldungenService.showMessage('amm.message.abweichungkontaktperson', 'info');
            OrColumnLayoutUtils.scrollTop();
        }
    }
}
