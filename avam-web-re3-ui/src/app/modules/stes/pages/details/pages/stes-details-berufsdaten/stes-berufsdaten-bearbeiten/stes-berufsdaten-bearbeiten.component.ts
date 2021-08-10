import { DateValidator } from '@shared/validators/date-validator';
import { DeactivationGuarded } from 'src/app/shared/services/can-deactive-guard.service';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { forkJoin, iif, Subscription } from 'rxjs';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { DomainEnum } from 'src/app/shared/enums/domain.enum';
import { map, takeUntil } from 'rxjs/operators';
import { GeschlechtPipe } from 'src/app/shared';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { WizardService } from '@app/shared/components/new/avam-wizard/wizard.service';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { StesDetailsPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { AbschlussCode } from '@app/shared/enums/domain-code/abschluss-code.enum';
import { BerufsfunktionCode } from '@app/shared/enums/domain-code/berufsfunktion-code.enum';
import { AbschlusslandCode } from '@shared/enums/domain-code/abschlussland-code.enum';
import { CodeDTO } from '@shared/models/dtos-generated/codeDTO';
import PrintHelper from '@shared/helpers/print.helper';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { StesDetailsLabels } from '@shared/enums/stes-routing-labels.enum';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'app-stes-berufsdaten-bearbeiten',
    templateUrl: './stes-berufsdaten-bearbeiten.component.html',
    styleUrls: ['./stes-berufsdaten-bearbeiten.component.scss'],
    providers: [ObliqueHelperService]
})
export class StesBerufsdatenBearbeitenComponent extends Unsubscribable implements OnInit, OnDestroy, DeactivationGuarded {
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    berufsdatenForm: FormGroup;
    isAnmeldung: boolean;
    disableberufsAbschluss = true;
    stesId: string;
    data: any[] = [];
    isZuletzt: boolean;
    berufsQualifikationId: string;
    berufsDetails: any;
    berufsdatenBearbeitenChannel = 'berufsdatenBearbeiten';

    qualifikationOptions: any[] = [];
    berufsErfahrungOptions: any[] = [];
    berufsFunktionOptions: any[] = [];
    ausbildungsniveauOptions: any[] = [];
    berufsAbschlussOptions: any[] = [];
    abschlussauslandOptions: CodeDTO[];

    observeClickActionSub: Subscription;
    berufsdatenAnzeigenToolboxId = 'berufsdatenBearbeiten';

    permissions: typeof Permissions = Permissions;
    permissionsList: Permissions[];

    constructor(
        private formBuilder: FormBuilder,
        private dataService: StesDataRestService,
        private route: ActivatedRoute,
        private translateService: TranslateService,
        private router: Router,
        private wizardService: WizardService,
        private geschlechtPipe: GeschlechtPipe,
        private obliqueHelper: ObliqueHelperService,
        private stesInfobarService: AvamStesInfoBarService,
        private interactionService: StesComponentInteractionService,
        private facade: FacadeService
    ) {
        super();
        SpinnerService.CHANNEL = this.berufsdatenBearbeitenChannel;
        ToolboxService.CHANNEL = this.berufsdatenBearbeitenChannel;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.getData();
        this.initForm();
        this.route.parent.data.subscribe(response => {
            this.isAnmeldung = response.isAnmeldung;
            if (this.isAnmeldung) {
                this.route.paramMap.subscribe(params => {
                    this.stesId = params.get('stesId');
                });
            } else {
                this.route.parent.params.subscribe(params => {
                    this.stesId = params['stesId'];
                });
            }
        });
        this.route.queryParamMap.subscribe(params => {
            this.berufsQualifikationId = params.get('berufId');
            if (this.berufsQualifikationId) {
                this.facade.navigationService.showNavigationTreeRoute(StesDetailsPaths.BERUFSDATENBEARBEITEN, { berufId: this.berufsQualifikationId });
            } else {
                this.facade.navigationService.showNavigationTreeRoute(StesDetailsPaths.BERUFSDATENERFASSEN);
            }
        });
        this.loadDataBerufsdaten();
        if (this.isAnmeldung) {
            this.subscribeToWizard();
        }
        // In addition to BSP3
        this.berufsdatenForm.controls.ausgeuebtB.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
            if (!value) {
                this.berufsdatenForm.controls.zuletztB.setValue(false);
            }
        });
        this.berufsdatenForm.controls.ausuebungVon.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.dauerBerechnen();
        });
        this.berufsdatenForm.controls.ausuebungBis.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.dauerBerechnen();
        });
        this.addToolboxActions();
        this.facade.dbTranslateService
            .getEventEmitter()
            .asObservable()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                if (this.berufsDetails) {
                    this.updateTitle();
                }
            });
        this.facade.messageBus
            .getData()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(message => {
                if (message.type === 'close-nav-item' && message.data) {
                    this.closeComponent(message);
                }
            });

        this.checkConfirmationToCancel();
    }

    closeComponent(message) {
        if (
            message.data.label === this.translateService.instant(StesDetailsLabels.BERUFSDATENERFASSEN) ||
            message.data.label === this.translateService.instant(StesDetailsLabels.BERUFSDATENBEARBEITEN)
        ) {
            this.cancel();
        }
    }

    subscribeToWizard() {
        this.wizardService.setFormIsDirty(this.berufsdatenForm.dirty);
        this.berufsdatenForm.valueChanges.subscribe(() => {
            this.wizardService.setFormIsDirty(this.berufsdatenForm.dirty);
        });
        this.wizardService.setIsBerufErfassenStep(true);
    }

    ngOnDestroy() {
        this.wizardService.showBerufsdaten(false);
        this.facade.toolboxService.sendConfiguration([]);
        this.observeClickActionSub.unsubscribe();
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.navigationService.hideNavigationTreeRoute(StesDetailsPaths.BERUFSDATENERFASSEN);
        super.ngOnDestroy();
    }

    getData() {
        this.facade.spinnerService.activate(this.berufsdatenBearbeitenChannel);
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesBeruf' });
        forkJoin<any, any, any, any, any, any>([
            //NOSONAR
            this.dataService.getCode(DomainEnum.QUALIFIKATION),
            this.dataService.getCode(DomainEnum.BERUFSERFAHRUNG),
            this.dataService.getCode(DomainEnum.BERUFSFUNKTION),
            this.dataService.getActiveCodeByDomain(DomainEnum.AUSBILDUNGSNIVEAU),
            this.dataService.getCode(DomainEnum.BERUFSABSCHLUSS),
            this.dataService.getCode(DomainEnum.ABSCHLUSSAUSLAND)
        ])
            .pipe(
                map(([dataQualifikation, dataBerufserfahrung, dataBerufsfunktion, dataAusbildungsniveau, dataBerufsabschluss, dataAbschlussausland]) => {
                    this.qualifikationOptions = this.facade.formUtilsService.mapDropdownKurztext(dataQualifikation);
                    this.berufsErfahrungOptions = this.facade.formUtilsService.mapDropdownKurztext(dataBerufserfahrung);
                    this.berufsFunktionOptions = this.facade.formUtilsService.mapDropdownKurztext(dataBerufsfunktion);
                    this.ausbildungsniveauOptions = this.facade.formUtilsService.mapDropdownKurztext(dataAusbildungsniveau);
                    this.berufsAbschlussOptions = this.facade.formUtilsService.mapDropdownKurztext(dataBerufsabschluss);
                    this.abschlussauslandOptions = dataAbschlussausland;
                })
            )
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                res => {
                    this.route.parent.data.subscribe(response => {
                        this.isAnmeldung = response.isAnmeldung;
                        if (this.isAnmeldung) {
                            this.route.paramMap.subscribe(params => this.getBeruf(params));
                        } else {
                            this.route.queryParamMap.subscribe(params => this.getBeruf(params));
                        }
                    });
                    this.permissionsList = !this.isAnmeldung && this.berufsQualifikationId ? [this.permissions.STES_ANMELDEN_BEARBEITEN] : undefined;

                    this.configureToolbox();

                    if (!this.berufsQualifikationId) {
                        this.setDefaultValues();
                    }

                    this.facade.spinnerService.deactivate(this.berufsdatenBearbeitenChannel);
                },
                () => {
                    this.facade.spinnerService.deactivate(this.berufsdatenBearbeitenChannel);
                }
            );
    }

    getBerufsqualifikation() {
        this.dataService.getBerufsqualifikation(this.stesId, this.berufsQualifikationId).subscribe(reponse => {
            this.berufsDetails = reponse.data;
            this.berufsdatenForm.reset(this.mapToForm(this.berufsDetails));

            if (this.berufsDetails.berufsAbschlussObject.code === AbschlussCode.AUSLANDISCH) {
                this.disableberufsAbschluss = false;
            }

            this.updateTitle();

            this.dauerBerechnen();
        });
    }

    save() {
        this.facade.fehlermeldungenService.closeMessage();
        if (this.berufsdatenForm.valid) {
            this.facade.spinnerService.activate(this.berufsdatenBearbeitenChannel);

            const ojbVersion = this.berufsDetails ? this.berufsDetails.ojbVersion : null;
            const update = this.dataService.updateBerufsqualifikation(this.stesId, this.translateService.currentLang, this.mapToDTO(ojbVersion));
            const create = this.dataService.createBerufsdaten(this.stesId, this.mapToDTO(ojbVersion), this.translateService.currentLang);

            iif(() => !!this.berufsQualifikationId, update, create)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(
                    response => {
                        OrColumnLayoutUtils.scrollTop();

                        this.facade.spinnerService.deactivate(this.berufsdatenBearbeitenChannel);

                        if (response.data !== null) {
                            this.facade.notificationService.success('common.message.datengespeichert');
                            this.berufsDetails = response.data;
                            this.berufsdatenForm.markAsPristine();

                            if (!this.isAnmeldung) {
                                this.router.navigate([`stes/details/${this.stesId}/berufsdaten/bearbeiten/`], {
                                    queryParams: { berufId: this.berufsDetails.stesBerufsqualifikationID }
                                });
                                this.updateTitle();

                                if (!this.berufsQualifikationId) {
                                    this.facade.navigationService.hideNavigationTreeRoute(StesDetailsPaths.BERUFSDATENERFASSEN);
                                }

                                OrColumnLayoutUtils.scrollTop();
                            } else {
                                this.router.navigate([`stes/anmeldung/berufsdaten/${this.stesId}`]);
                            }
                        }
                    },
                    () => {
                        OrColumnLayoutUtils.scrollTop();
                        this.facade.spinnerService.deactivate(this.berufsdatenBearbeitenChannel);
                    }
                );
        } else {
            this.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    reset() {
        if (this.berufsdatenForm.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();

                if (!this.berufsQualifikationId) {
                    this.berufsdatenForm.reset();
                    this.setDefaultValues();
                    this.facade.fehlermeldungenService.closeMessage();
                } else {
                    this.berufsdatenForm.reset(this.mapToForm(this.berufsDetails));
                    this.dauerBerechnen();
                }
            });
        }
    }

    cancel() {
        this.facade.fehlermeldungenService.closeMessage();
        if (!this.isAnmeldung) {
            if (
                this.router.url.includes(StesDetailsPaths.BERUFSDATENERFASSEN.replace('./', '')) ||
                this.router.url.includes(StesDetailsPaths.BERUFSDATENBEARBEITEN.replace('./', ''))
            ) {
                if (!this.canDeactivate()) {
                    this.hideNavigation();
                }
                this.router.navigate([`stes/details/${this.stesId}/berufsdaten`]);
            }
        } else {
            this.router.navigate([`stes/anmeldung/berufsdaten/${this.stesId}`]);
        }
    }

    private checkConfirmationToCancel(): void {
        this.interactionService.navigateAwayAbbrechen.pipe(takeUntil(this.unsubscribe)).subscribe((okClicked: boolean) => {
            if (okClicked) {
                this.hideNavigation();
            }
        });
    }

    private hideNavigation() {
        this.facade.navigationService.hideNavigationTreeRoute(StesDetailsPaths.BERUFSDATENBEARBEITEN);
        this.facade.navigationService.hideNavigationTreeRoute(StesDetailsPaths.BERUFSDATENERFASSEN);
    }

    deleteWithConfirm() {
        this.openDeleteConfirmation();
    }

    delete() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.spinnerService.activate(this.berufsdatenBearbeitenChannel);
        this.dataService
            .deleteBerufsqualifikation(this.stesId, this.berufsQualifikationId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                response => {
                    this.facade.spinnerService.deactivate(this.berufsdatenBearbeitenChannel);

                    if (response.data !== null) {
                        this.facade.notificationService.success('common.message.datengeloescht');
                        this.facade.navigationService.hideNavigationTreeRoute(StesDetailsPaths.BERUFSDATENBEARBEITEN);
                        if (!this.isAnmeldung) {
                            this.router.navigate([`stes/details/${this.stesId}/berufsdaten`]);
                        } else {
                            this.router.navigate([`stes/anmeldung/berufsdaten/${this.stesId}`]);
                        }
                    }
                },
                () => {
                    this.facade.spinnerService.deactivate(this.berufsdatenBearbeitenChannel);
                }
            );
    }

    mapToDTO(ojbVersion: number) {
        let dauer = '';
        if (this.berufsdatenForm.controls.ausuebungVon.value && this.berufsdatenForm.controls.ausuebungBis.value) {
            let monatVon = '' + (this.berufsdatenForm.controls.ausuebungVon.value.getMonth() + 1);
            if (monatVon.length === 1) {
                monatVon = `0${monatVon}`;
            }
            let monatBis = '' + (this.berufsdatenForm.controls.ausuebungBis.value.getMonth() + 1);
            if (monatBis.length === 1) {
                monatBis = `0${monatBis}`;
            }
            dauer =
                `${monatVon}.${this.berufsdatenForm.controls.ausuebungVon.value.getFullYear()}` +
                ` - ` +
                `${monatBis}.${this.berufsdatenForm.controls.ausuebungBis.value.getFullYear()}`;
        }
        return {
            ojbVersion,
            ausbildungsNiveauID: this.berufsdatenForm.controls.ausbildungsniveau.value,
            ausgeuebtB: this.berufsdatenForm.controls.ausgeuebtB.value,
            bemerkungen: this.berufsdatenForm.controls.fachkenntnisse.value,
            berufsAbschlussID: this.berufsdatenForm.controls.berufsAbschluss.value,
            berufsAbschlussStatusID: this.berufsdatenForm.controls.berufsAbschlussAnerkannt.value
                ? this.facade.formUtilsService.getCodeIdByCode(this.abschlussauslandOptions, AbschlusslandCode.ANERKANNT)
                : this.facade.formUtilsService.getCodeIdByCode(this.abschlussauslandOptions, AbschlusslandCode.NICHTANERKANNT),
            berufsErfahrungID: this.berufsdatenForm.controls.berufsErfahrung.value,
            berufsFunktionID: this.berufsdatenForm.controls.berufsFunktion.value,
            berufsTaetigkeitObject: this.berufsdatenForm.controls.berufsTaetigkeit['berufAutosuggestObject'],
            datumVon: this.facade.formUtilsService.formatDateNgx(this.firstDay(this.berufsdatenForm.controls.ausuebungVon.value)),
            datumBis: this.facade.formUtilsService.formatDateNgx(this.twentyEighthDay(this.berufsdatenForm.controls.ausuebungBis.value)),
            dauer,
            einschraenkungen: this.berufsdatenForm.controls.einschraenkungen.value,
            gesuchtB: this.berufsdatenForm.controls.gesuchtB.value,
            qualifikationID: this.berufsdatenForm.controls.qualifikation.value,
            stesID: this.stesId,
            zuletztB: this.berufsdatenForm.controls.zuletztB.value,
            stesBerufsqualifikationID: this.berufsQualifikationId
        };
    }

    mapToForm(data: any) {
        return {
            berufsTaetigkeit: data.berufsTaetigkeitObject,
            qualifikation: data.qualifikationID,
            ausgeuebtB: data.ausgeuebtB,
            zuletztB: data.zuletztB,
            gesuchtB: data.gesuchtB,
            berufsErfahrung: data.berufsErfahrungID,
            berufsFunktion: data.berufsFunktionID,
            ausbildungsniveau: data.ausbildungsNiveauID,
            berufsAbschluss: data.berufsAbschlussID,
            berufsAbschlussAnerkannt:
                data.berufsAbschlussStatusID === parseInt(this.facade.formUtilsService.getCodeIdByCode(this.abschlussauslandOptions, AbschlusslandCode.ANERKANNT), 10),
            ausuebungVon: this.firstDay(data.datumVon),
            ausuebungBis: this.firstDay(data.datumBis),
            fachkenntnisse: data.bemerkungen,
            einschraenkungen: data.einschraenkungen
        };
    }

    configureToolbox() {
        let toolboxConfig: ToolboxConfiguration[] = [];
        if (this.isAnmeldung) {
            toolboxConfig = ToolboxConfig.getStesAnmeldungConfig();
        } else if (!this.berufsQualifikationId) {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true));
        } else {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true));
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));
        }

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.berufsdatenAnzeigenToolboxId, ToolboxDataHelper.createForStellensuchende(this.stesId), !this.isAnmeldung);
    }

    canDeactivate(): boolean {
        return this.berufsdatenForm.dirty;
    }

    // BSP11
    onBerufsAbschlussChange(event: any) {
        this.disableberufsAbschluss = event !== this.facade.formUtilsService.getCodeIdByCode(this.berufsAbschlussOptions, AbschlussCode.AUSLANDISCH);
        if (this.disableberufsAbschluss) {
            this.berufsdatenForm.controls.berufsAbschlussAnerkannt.setValue(false);
        }
    }

    // Needed for BSP1
    loadDataBerufsdaten() {
        this.facade.spinnerService.activate('berufsdaten');
        this.dataService
            .getBerufsdaten(this.stesId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                response => {
                    this.data = response.data.berufsdatenDTOList;
                    this.stesInfobarService.sendLastUpdate(response.data.berufsdatenDTOList[0]);
                    this.isBerufZuletzt();
                    this.facade.spinnerService.deactivate('berufsdaten');
                },
                () => {
                    this.facade.spinnerService.deactivate('berufsdaten');
                }
            );
    }

    // Needed for BSP1
    isBerufZuletzt() {
        this.isZuletzt =
            this.data.some(beruf => beruf.stesBerufsqualifikationID === +this.berufsQualifikationId && beruf.zuletztB) ||
            (this.data.length === 1 && !this.berufsQualifikationId == null && this.data.some(beruf => beruf.zuletztB));
    }

    // BSP1
    showErrorMsg() {
        this.isBerufZuletzt();
        if (this.berufsdatenForm.controls.zuletztB.value && this.data !== null && this.data.length > 0 && (!this.isZuletzt && this.data.some(beruf => beruf.zuletztB))) {
            this.facade.fehlermeldungenService.showMessage('stes.error.berufsdaten.zuletztexistiert', 'warning');
        } else {
            this.facade.fehlermeldungenService.closeMessage();
        }
    }

    updateTitle() {
        const infoBarTitle = `${this.translateService.instant('stes.label.vermittlung.beruf')} ${this.facade.dbTranslateService.translate(
            this.berufsDetails.berufsTaetigkeitObject,
            this.geschlechtPipe.transform('bezeichnung', this.berufsDetails.geschlecht)
        )}`;
        this.stesInfobarService.sendDataToInfobar({ title: infoBarTitle });

        this.facade.messageBus.sendData({ type: 'stes-details-content-ueberschrift', data: { ueberschrift: infoBarTitle } });
    }

    openHistoryModal(objId: string, objType: string) {
        this.facade.openModalFensterService.openHistoryModal(objId, objType);
    }

    openDeleteConfirmation() {
        this.facade.openModalFensterService.deleteModal(result => {
            if (result) {
                this.delete();
            }
        });
    }

    private dauerBerechnen() {
        if (this.berufsdatenForm.controls.ausuebungVon.value && this.berufsdatenForm.controls.ausuebungBis.value) {
            const von = new Date(this.berufsdatenForm.controls.ausuebungVon.value);
            const bis = new Date(this.berufsdatenForm.controls.ausuebungBis.value);
            bis.setMonth(bis.getMonth() + 1); // RE2 always calculate the difference + 1 month

            if (von < bis) {
                let year = bis.getFullYear() - von.getFullYear();
                let month = bis.getMonth() + 1 - (von.getMonth() + 1);

                if (bis.getMonth() + 1 - (von.getMonth() + 1) < 0) {
                    year = bis.getFullYear() - von.getFullYear() - 1;
                    month = 12 + (bis.getMonth() + 1 - (von.getMonth() + 1));
                }

                this.berufsdatenForm.controls.dauerJahre.setValue(year);
                this.berufsdatenForm.controls.dauerMonate.setValue(month);
            } else {
                this.berufsdatenForm.controls.dauerJahre.reset();
                this.berufsdatenForm.controls.dauerMonate.reset();
            }
        } else {
            this.berufsdatenForm.controls.dauerJahre.reset();
            this.berufsdatenForm.controls.dauerMonate.reset();
        }
    }

    private getBeruf(params: ParamMap) {
        this.berufsQualifikationId = params.get('berufId');
        if (this.berufsQualifikationId) {
            this.getBerufsqualifikation();
        }
    }

    private initForm() {
        this.berufsdatenForm = this.formBuilder.group(
            {
                berufsTaetigkeit: [null, Validators.required],
                qualifikation: null,
                ausgeuebtB: null,
                zuletztB: null,
                gesuchtB: null,
                berufsErfahrung: [null, Validators.required],
                berufsFunktion: [null, Validators.required],
                ausbildungsniveau: [null, Validators.required],
                berufsAbschluss: [null, Validators.required],
                berufsAbschlussAnerkannt: null,
                ausuebungVon: [null, [DateValidator.dateFormatMonthYearNgx, DateValidator.dateValidMonthYearNgx]],
                ausuebungBis: [null, [DateValidator.dateFormatMonthYearNgx, DateValidator.dateValidMonthYearNgx]],
                dauerJahre: { value: null, disabled: true },
                dauerMonate: { value: null, disabled: true },
                fachkenntnisse: null,
                einschraenkungen: null
            },
            { validator: DateValidator.rangeBetweenDates('ausuebungVon', 'ausuebungBis', 'val201') }
        );
    }

    private setDefaultValues() {
        this.berufsdatenForm.controls.berufsFunktion.setValue(this.facade.formUtilsService.getCodeIdByCode(this.berufsFunktionOptions, BerufsfunktionCode.FACHFUNKTION));
        this.berufsdatenForm.controls.berufsAbschluss.setValue(this.facade.formUtilsService.getCodeIdByCode(this.berufsAbschlussOptions, AbschlussCode.KEINER));
        this.disableberufsAbschluss = true;
    }

    private firstDay(data: any): Date {
        let firstDay = null;
        if (data) {
            const date = new Date(data);
            firstDay = new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0);
        }
        return firstDay;
    }

    private twentyEighthDay(data: any): Date {
        let day28 = null;
        if (data) {
            const date = new Date(data);
            day28 = new Date(date.getFullYear(), date.getMonth(), 28, 12, 0, 0, 0);
        }
        return day28;
    }

    private addToolboxActions() {
        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe(action => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
            if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(this.berufsQualifikationId, AvamCommonValueObjectsEnum.T_STES_BERUFSQUALIFIKATION);
            }
        });
    }
}
