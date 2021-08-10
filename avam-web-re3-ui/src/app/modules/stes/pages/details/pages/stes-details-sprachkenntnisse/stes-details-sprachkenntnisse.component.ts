import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { map, takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpFormStateEnum } from '@app/shared';
import { WizardService } from '@app/shared/components/new/avam-wizard/wizard.service';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, iif, Subscription } from 'rxjs';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AvamComponentsTableComponent } from '@app/library/wrappers/form/avam-components-table/avam-components-table.component';
import { ColumnInterface, Autosuggest, ComponentType, Dropdown } from '@app/library/wrappers/form/avam-components-table/avam-components-table.interface';
import { sort } from '@app/library/wrappers/form/avam-components-table/avam-components-table-sorting';
import { StesSprachkenntnisseDTO } from '@dtos/stesSprachkenntnisseDTO';
import { FacadeService } from '@shared/services/facade.service';

class SprachQualifikationen {
    spracheID: string;
    muendlichKenntnisseID: string;
    schriftlichKenntnisseID: string;
    mutterspracheB: boolean;
    sprachAufenthaltB: boolean;
    stesSprachqualifikationID: string;
    sprache: CodeDTO;
    ojbVersion?: string;
}

class SprachkenntnisseDTO {
    bemerkungen: string;
    objVersion: string;
    sprachQualifikationen: SprachQualifikationen[] = [];
}

export enum COLUMN {
    language = 'language',
    muendlich = 'muendlich',
    schriftlich = 'schriftlich',
    muttersprache = 'muttersprache',
    sprachenaufenthalt = 'sprachenaufenthalt'
}

@Component({
    selector: 'app-stes-details-sprachkenntnisse',
    templateUrl: './stes-details-sprachkenntnisse.component.html',
    styleUrls: ['./stes-details-sprachkenntnisse.component.scss']
})
export class StesDetailsSprachkenntnisseComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy, DeactivationGuarded {
    @ViewChild('table') table: AvamComponentsTableComponent;
    isAnmeldung: boolean;
    stesId: string;
    sprachkenntnisseChannel = 'sprachkenntnisse-channel';
    permissions: typeof Permissions = Permissions;
    isSaveDisabled: boolean;
    sprachkenntnisseOptions: any[] = [];
    yesNoOptions: any[] = [];
    data: any;
    observeClickActionSub: Subscription;
    dataSource = null;
    columns: ColumnInterface[];
    sprachQualifikationIDs = [];
    sprachkenntnisseForm: FormGroup;
    private sprachKenntnisseToolboxId = 'sprachKenntnisse';

    constructor(
        private formBuilder: FormBuilder,
        private stesInfobarService: AvamStesInfoBarService,
        private route: ActivatedRoute,
        private router: Router,
        private dataService: StesDataRestService,
        private wizardService: WizardService,
        private translateService: TranslateService,
        private facade: FacadeService
    ) {
        super();
        ToolboxService.CHANNEL = this.sprachkenntnisseChannel;
    }

    ngOnInit() {
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesSprachkenntnisse' });
        this.sprachkenntnisseForm = this.formBuilder.group({
            bemerkungen: null
        });
    }

    ngAfterViewInit(): void {
        this.setSubscriptions();
        this.getData();
    }

    getData() {
        this.facade.spinnerService.activate(this.sprachkenntnisseChannel);

        const getAnmeldenSub = this.dataService.getSprachkenntnisseAnmelden(this.stesId, this.translateService.currentLang);
        const getBearbeitenSub = this.dataService.getSprachkenntnisseBearbeiten(this.stesId, this.translateService.currentLang);

        forkJoin<CodeDTO[], CodeDTO[], StesSprachkenntnisseDTO>(
            this.dataService.getCode(DomainEnum.SPRACHKENNTNISSE),
            this.dataService.getFixedCode(DomainEnum.YES_NO_OPTIONS),
            iif(() => this.isAnmeldung, getAnmeldenSub, getBearbeitenSub)
        )
            .pipe(
                map(([dropdown, yesNoOptions, sprachenData]) => {
                    this.yesNoOptions = this.facade.formUtilsService.mapDropdownKurztext(yesNoOptions);
                    this.sprachkenntnisseOptions = this.facade.formUtilsService.mapDropdownKurztext(dropdown);
                    this.createColumns();
                    this.data = sprachenData;
                    this.mapToDataSource();
                })
            )
            .subscribe(
                () => {
                    this.facade.spinnerService.deactivate(this.sprachkenntnisseChannel);
                    this.wizardService.formHttpState.next(HttpFormStateEnum.GET_SUCCESS);
                },
                () => {
                    this.facade.spinnerService.deactivate(this.sprachkenntnisseChannel);
                    this.wizardService.formHttpState.next(HttpFormStateEnum.GET_NO_RESPONCE);
                }
            );
    }

    canDeactivate() {
        return this.table.form.dirty || this.sprachkenntnisseForm.dirty;
    }

    setSubscriptions() {
        this.route.parent.data.pipe(takeUntil(this.unsubscribe)).subscribe(data => {
            this.isAnmeldung = data.isAnmeldung;
        });

        if (this.isAnmeldung) {
            this.route.paramMap.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
                this.stesId = params.get('stesId');
            });
        } else {
            this.route.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
                this.stesId = params['stesId'];
            });
        }

        this.configureToolbox();

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
            if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.facade.openModalFensterService.openHistoryModal(this.stesId, AvamCommonValueObjectsEnum.T_STES);
            }
        });
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = this.isAnmeldung ? ToolboxConfig.getStesAnmeldungConfig() : ToolboxConfig.getDefaultConfig();
        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.sprachKenntnisseToolboxId, ToolboxDataHelper.createForStellensuchende(this.stesId), !this.isAnmeldung);
    }

    prev() {
        this.wizardService.movePrev();
    }

    ngOnDestroy() {
        this.observeClickActionSub.unsubscribe();
        this.facade.toolboxService.sendConfiguration([]);
        this.facade.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    mapToDataSource() {
        this.dataSource = [];
        this.sprachQualifikationIDs = [];
        if (this.isAnmeldungFirstSprache()) {
            this.dataSource.push(this.getDefaultAnmeldungSprache());
        } else {
            this.data.sprachQualifikationen.forEach((sprachQualifikation, index) => {
                this.sprachQualifikationIDs.push(sprachQualifikation.stesSprachqualifikationID);
                this.dataSource.push({
                    id: index,
                    language: sprachQualifikation.sprache,
                    muendlich: sprachQualifikation.muendlichKenntnisse ? sprachQualifikation.muendlichKenntnisse.codeId.toString() : null,
                    schriftlich: sprachQualifikation.schriftlichKenntnisse ? sprachQualifikation.schriftlichKenntnisse.codeId.toString() : null,
                    muttersprache: sprachQualifikation.mutterspracheB ? '1' : '0',
                    sprachenaufenthalt: sprachQualifikation.sprachAufenthaltB ? '1' : '0'
                });
            });
        }

        this.sprachkenntnisseForm.controls.bemerkungen.reset(this.data.bemerkungen);
    }

    createColumns() {
        const mapOptions = {};
        this.sprachkenntnisseOptions.forEach(option => {
            mapOptions[option.value] = option;
        });
        this.columns = [
            this.createLanguageColumn(),
            this.createMuendlichColumn(),
            this.createSchriftlichColumn(),
            this.createMutterspracheColumn(),
            this.createSprachenaufenthaltColumn(),
            this.createActionColumn()
        ];
    }

    private createLanguageColumn(): Autosuggest {
        return {
            columnDef: COLUMN.language,
            header: 'i18n.labels.language',
            cell: (element: any) => {
                return element.language;
            },
            component: {
                type: ComponentType.autosuggest,
                validators: Validators.required
            }
        };
    }

    private createMuendlichColumn(): Dropdown {
        return {
            columnDef: COLUMN.muendlich,
            header: 'stes.label.muendlich',
            cell: (element: any) => {
                return element.muendlich;
            },
            component: {
                type: ComponentType.dropdown,
                options: this.sprachkenntnisseOptions,
                validators: Validators.required,
                initialValue: this.facade.formUtilsService.getCodeIdByCode(this.sprachkenntnisseOptions, '1')
            }
        };
    }

    private createSchriftlichColumn(): Dropdown {
        return {
            columnDef: COLUMN.schriftlich,
            header: 'stes.label.schriftlich',
            cell: (element: any) => {
                return element.schriftlich;
            },
            component: {
                type: ComponentType.dropdown,
                options: this.sprachkenntnisseOptions,
                validators: Validators.required,
                initialValue: this.facade.formUtilsService.getCodeIdByCode(this.sprachkenntnisseOptions, '1')
            }
        };
    }

    private createMutterspracheColumn(): Dropdown {
        return {
            columnDef: COLUMN.muttersprache,
            header: 'stes.label.Muttersprache',
            cell: (element: any) => {
                return element.muttersprache;
            },
            component: {
                type: ComponentType.dropdown,
                options: this.yesNoOptions,
                initialValue: '0'
            }
        };
    }

    private createSprachenaufenthaltColumn(): Dropdown {
        return {
            columnDef: COLUMN.sprachenaufenthalt,
            header: 'stes.label.sprachenaufenhalt',
            cell: (element: any) => {
                return element.sprachenaufenthalt;
            },
            component: {
                type: ComponentType.dropdown,
                options: this.yesNoOptions,
                initialValue: '0'
            }
        };
    }

    private createActionColumn() {
        return {
            columnDef: 'actions',
            header: '',
            cell: (element: any) => {
                return '';
            },
            component: {}
        };
    }

    save(shouldFinish?: boolean) {
        this.facade.fehlermeldungenService.closeMessage();

        if (!this.table.form.valid) {
            this.table.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
            return;
        }

        if (this.table.form.valid) {
            this.facade.spinnerService.activate(this.sprachkenntnisseChannel);
            this.dataService.saveSprachkenntnisse(this.stesId, this.translateService.currentLang, this.mapSprachkenntnisse()).subscribe(
                response => {
                    if (response.data) {
                        this.data = response.data;
                        this.mapToDataSource();
                        this.facade.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                        if (shouldFinish) {
                            this.dataService.stesErfassenAktivieren(this.stesId, this.translateService.currentLang).subscribe(
                                responseAktivieren => {
                                    if (responseAktivieren.data) {
                                        this.wizardService.setFormIsDirty(false);
                                        this.router.navigate(['../../../details/' + this.stesId], { relativeTo: this.route });
                                        this.facade.notificationService.success('stes.feedback.anmeldungsBestaetigung');
                                    }
                                    this.facade.spinnerService.deactivate(this.sprachkenntnisseChannel);
                                },
                                () => {
                                    this.facade.spinnerService.deactivate(this.sprachkenntnisseChannel);
                                }
                            );
                        } else {
                            this.facade.spinnerService.deactivate(this.sprachkenntnisseChannel);
                        }
                    } else {
                        this.facade.spinnerService.deactivate(this.sprachkenntnisseChannel);
                    }
                },
                () => this.facade.spinnerService.deactivate(this.sprachkenntnisseChannel)
            );
        } else {
            this.table.triggerValidation();
        }
    }

    mapSprachkenntnisse() {
        const sprachkenntnisseDTO: SprachkenntnisseDTO = new SprachkenntnisseDTO();
        sprachkenntnisseDTO.bemerkungen = this.data.bemerkungen;
        sprachkenntnisseDTO.objVersion = this.data.objVersion;
        sprachkenntnisseDTO.sprachQualifikationen = [];

        const rowsFormGroups = (this.table.form.controls.tableRows as FormArray).controls;
        rowsFormGroups.forEach((row: FormGroup) => {
            const rowID = row.controls.rowId.value;
            const language = row.controls.language['autosuggestObject'] ? row.controls.language['autosuggestObject'] : row.controls.language.value;

            sprachkenntnisseDTO.sprachQualifikationen.push({
                spracheID: language ? language.codeId : null,
                sprache: row.controls.language['autosuggestObject'],
                muendlichKenntnisseID: row.controls.muendlich.value,
                schriftlichKenntnisseID: row.controls.schriftlich.value,
                mutterspracheB: row.controls.muttersprache.value && Number(row.controls.muttersprache.value) === 1 ? Number(row.controls.muttersprache.value) === 1 : false,
                sprachAufenthaltB:
                    row.controls.sprachenaufenthalt.value && Number(row.controls.sprachenaufenthalt.value) === 1 ? Number(row.controls.sprachenaufenthalt.value) === 1 : false,
                stesSprachqualifikationID: rowID < this.sprachQualifikationIDs.length ? this.sprachQualifikationIDs[rowID] : null
            });
        });

        sprachkenntnisseDTO.bemerkungen = this.sprachkenntnisseForm.controls.bemerkungen.value;

        return sprachkenntnisseDTO;
    }

    reset() {
        if (this.table.form.dirty || this.sprachkenntnisseForm.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.mapToDataSource();
            });
        }
    }

    finish() {
        this.save(true);
    }

    cancel() {
        this.facade.fehlermeldungenService.closeMessage();
        this.router.navigate(['/home']);
    }

    onSort(event) {
        const mapOptions = {};
        this.sprachkenntnisseOptions.forEach(option => {
            mapOptions[option.value] = option;
        });

        event.data = this.table.components.controls.map((formGroup: FormGroup) => {
            return {
                id: formGroup.controls.rowId.value,
                language: formGroup.controls.language['autosuggestObject'],
                muendlich: formGroup.controls.muendlich.value,
                schriftlich: formGroup.controls.schriftlich.value,
                muttersprache: formGroup.controls.muttersprache.value,
                sprachenaufenthalt: formGroup.controls.sprachenaufenthalt.value
            };
        });

        switch (event.field) {
            case COLUMN.sprachenaufenthalt:
                sort.AvamLabelDropdownComponent(event, this.yesNoOptions);
                break;
            case COLUMN.muttersprache:
                sort.AvamLabelDropdownComponent(event, this.yesNoOptions);
                break;
            case COLUMN.muendlich:
                sort.AvamLabelDropdownComponent(event, mapOptions);
                break;
            case COLUMN.schriftlich:
                sort.AvamLabelDropdownComponent(event, mapOptions);
                break;
            case COLUMN.language:
                sort.AvamSpracheAutosuggestComponent(event);
                break;
            default:
                break;
        }
    }

    private isAnmeldungFirstSprache(): boolean {
        return this.isAnmeldung && (!this.data.sprachQualifikationen || this.data.sprachQualifikationen.length === 0);
    }

    private getDefaultAnmeldungSprache(): any {
        return {
            id: 0,
            language: null,
            muendlich: this.facade.formUtilsService.getCodeIdByCode(this.sprachkenntnisseOptions, '1'),
            schriftlich: this.facade.formUtilsService.getCodeIdByCode(this.sprachkenntnisseOptions, '1'),
            muttersprache: '1',
            sprachenaufenthalt: '0'
        };
    }
}
