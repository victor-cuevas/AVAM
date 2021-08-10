import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { FacadeService } from '@shared/services/facade.service';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { filter, finalize, takeUntil } from 'rxjs/operators';
import { CodeDTO } from '@dtos/codeDTO';
import { DateValidator } from '@shared/validators/date-validator';
import { BenutzerstelleResultDTO } from '@dtos/benutzerstelleResultDTO';
import { BenutzerstellenRestService } from '@core/http/benutzerstellen-rest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { VollzugsregionDTO } from '@dtos/vollzugsregionDTO';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { forkJoin, of } from 'rxjs';
import { BenutzerstelleSucheComponent } from '@shared/components/benutzerstelle-suche/benutzerstelle-suche.component';
import { BenutzerstelleSucheParamsModel } from '@stes/pages/details/pages/datenfreigabe/benutzerstelle-suche-params.model';
import { StatusEnum } from '@shared/classes/fixed-codes';
import { BenutzerstelleAuswaehlenTabelleInterface } from '@shared/components/benutzerstelle-auswaehlen-tabelle/benutzerstelle-auswaehlen-tabelle.interface';
import { BaseResponseWrapperVollzugsregionDTOWarningMessages } from '@dtos/baseResponseWrapperVollzugsregionDTOWarningMessages';
import { ToolboxService } from '@app/shared';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { Unsubscribable } from 'oblique-reactive';
import { Permissions } from '@shared/enums/permissions.enum';

@Component({
    selector: 'avam-vollzugsregion-erfassen-bearbeiten',
    templateUrl: './vollzugsregion-erfassen-bearbeiten.component.html',
    styleUrls: ['./vollzugsregion-erfassen-bearbeiten.component.scss']
})
export class VollzugsregionErfassenBearbeitenComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('infobartemplate') infobartemplate: TemplateRef<any>;
    @ViewChild('benutzerstellenSuche') benutzerstellenSucheModal: BenutzerstelleSucheComponent;
    tableConfig;
    displayTable = true;
    isBearbeiten = false;
    vollzugsregion: VollzugsregionDTO;
    form: FormGroup;
    formValueOnLoad = {};
    tableDataOnLoad = [];
    regionTypArray: any[];
    regionTypCodes: CodeDTO[];
    kantoneList = '';
    benutzerstelleIds: number[] = [];
    benutzerstelleSucheParams: BenutzerstelleSucheParamsModel = {
        benutzerstellentyp: null,
        vollzugsregiontyp: null,
        status: StatusEnum.AKTIV,
        kanton: null
    };
    navigateToSearch: any;

    readonly channel = 'VollzugsregionErfassenBearbeiten';
    readonly permissions: typeof Permissions = Permissions;
    private readonly baseTableConfig = {
        columns: [
            {
                columnDef: 'benutzerstelle',
                header: 'common.label.benutzerstelle',
                cell: (element: any) => element.benutzerstelle
            },
            {
                columnDef: 'benutzerstelleID',
                header: 'stes.label.benutzerstellenid',
                cell: (element: any) => element.benutzerstelleID
            },
            {
                columnDef: 'benutzerstelleTyp',
                header: 'verzeichnisse.label.benutzerstelletyp',
                cell: (element: any) => element.benutzerstelleTyp
            },
            {
                columnDef: 'strasseNr',
                header: 'common.label.strassenrlong',
                cell: (element: any) => element.strasseNr
            },
            {
                columnDef: 'plz',
                header: 'stes.label.plz',
                cell: (element: any) => element.plz
            },
            {
                columnDef: 'ort',
                header: 'common.label.ort',
                cell: (element: any) => element.ort
            },
            {
                columnDef: 'telefon',
                header: 'common.label.telefon',
                cell: (element: any) => element.telefon
            },
            { columnDef: 'actions', cell: () => '', fixWidth: true, isDelete: true }
        ],
        data: [],
        config: {
            sortField: 'benutzerstelle',
            sortOrder: -1,
            displayedColumns: []
        }
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private facadeService: FacadeService,
        private obliqueHelper: ObliqueHelperService,
        private infopanelService: AmmInfopanelService,
        private stesRestService: StesDataRestService,
        private benutzerstellenRestService: BenutzerstellenRestService
    ) {
        super();
        this.navigateToSearch = this.router.getCurrentNavigation().extras.state && this.router.getCurrentNavigation().extras.state.navigateToSearch;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.isBearbeiten = this.route.snapshot.data.isBearbeiten;
        if (!this.isBearbeiten) {
            this.infopanelService.updateInformation({
                title: 'benutzerverwaltung.topnavmenuitem.vollzugsregionerfassen',
                subtitle: '',
                hideInfobar: true
            });
        }
        this.setTableData([]);
        this.generateForm();
        this.configureToolbox();
    }

    ngAfterViewInit() {
        this.facadeService.spinnerService.activate(this.channel);
        this.getInitialData();
    }

    ngOnDestroy() {
        this.infopanelService.updateInformation({ title: '', secondTitle: '', subtitle: '', hideInfobar: false });
        this.facadeService.toolboxService.sendConfiguration([]);
        this.facadeService.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    cancel() {
        if (this.navigateToSearch) {
            this.router.navigate(['/informationen/benutzerverwaltung/vollzugsregion/suchen']);
        } else {
            this.router.navigate(['/home']);
        }
    }

    reset() {
        if (this.form.dirty || this.isDataModified()) {
            this.facadeService.resetDialogService.reset(() => {
                this.facadeService.fehlermeldungenService.closeMessage();
                this.tableConfig.data = [...this.tableDataOnLoad];
                this.form.patchValue(this.formValueOnLoad);
                this.form.markAsPristine();
                this.setKantone();
            });
        }
    }

    openBenutzerstelleModal() {
        this.benutzerstelleIds = !!this.tableConfig && !!this.tableConfig.data ? this.tableConfig.data.map(data => data.object.benutzerstelleId) : [];
        this.facadeService.openModalFensterService.openXLModal(this.benutzerstellenSucheModal);
    }

    addBenutzerstellen(data: BenutzerstelleAuswaehlenTabelleInterface[]) {
        this.displayTable = false;
        setTimeout(() => {
            this.tableConfig.data = this.tableConfig.data.concat(
                data.map((selectedItem: BenutzerstelleAuswaehlenTabelleInterface) => this.createRow(selectedItem.benutzerstelleObj))
            );
            this.displayTable = true;
            this.setKantone();
        }, 0);
    }

    deleteBenutzerstelle(data: any) {
        this.displayTable = false;
        setTimeout(() => {
            const deleteIndex = this.tableConfig.data.findIndex(row => row.benutzerstelleID === data.benutzerstelleID);
            this.tableConfig.data.splice(deleteIndex, 1);
            this.displayTable = true;
            this.setKantone();
        }, 0);
    }

    save() {
        this.facadeService.fehlermeldungenService.closeMessage();
        if (this.form.valid) {
            this.facadeService.spinnerService.activate(this.channel);
            const speichernObservable = this.isBearbeiten
                ? this.benutzerstellenRestService.putVollzugsregion(this.mapToDTO())
                : this.benutzerstellenRestService.postVollzugsregion(this.mapToDTO());
            speichernObservable
                .pipe(finalize(() => this.facadeService.spinnerService.deactivate(this.channel)))
                .subscribe((response: BaseResponseWrapperLongWarningMessages | BaseResponseWrapperVollzugsregionDTOWarningMessages) => {
                    if (!!response.data) {
                        this.form.markAsPristine();
                        this.facadeService.notificationService.success('common.message.datengespeichert');
                        if (this.isBearbeiten) {
                            this.vollzugsregion = response.data as VollzugsregionDTO;
                            this.infopanelService.sendLastUpdate(this.vollzugsregion);
                            this.mapToForm(this.vollzugsregion);
                        } else {
                            this.router.navigate(['../bearbeiten'], { relativeTo: this.route, queryParams: { vollzugsregionId: response.data } });
                        }
                    }
                });
        } else {
            this.ngForm.onSubmit(undefined);
            this.facadeService.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    canDeactivate() {
        return this.form.dirty;
    }

    private mapToDTO(): VollzugsregionDTO {
        return {
            ...this.vollzugsregion,
            code: this.form.controls.vollzugsregionID.value,
            nameDe: this.form.controls.bezeichnungDeutsch.value,
            nameFr: this.form.controls.bezeichnungFranzoesisch.value,
            nameIt: this.form.controls.bezeichnungItalienisch.value,
            vregTypeObject: this.regionTypCodes.find((typ: CodeDTO) => typ.codeId === +this.form.controls.vollzugsregiontyp.value),
            gueltigAb: this.form.controls.gueltigVon.value,
            gueltigBis: this.form.controls.gueltigBis.value,
            benutzerstelleList: this.tableConfig.data.map(data => data.object)
        };
    }

    private isDataModified(): boolean {
        return !(this.tableConfig.data.length === this.tableDataOnLoad.length && this.tableConfig.data.join() === this.tableDataOnLoad.join());
    }

    private generateForm() {
        this.form = this.fb.group(
            {
                bezeichnungDeutsch: [null, Validators.required],
                bezeichnungFranzoesisch: [null, Validators.required],
                bezeichnungItalienisch: [null, Validators.required],
                vollzugsregiontyp: [null, Validators.required],
                vollzugsregionID: [null, Validators.required],
                gueltigVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                gueltigBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]]
            },
            {
                validators: DateValidator.rangeBetweenDates('gueltigVon', 'gueltigBis', 'val202', false, false)
            }
        );
    }

    private configureToolbox() {
        ToolboxService.CHANNEL = this.channel;
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getVollzugsregionErfassenBearbeitenConfig(), this.channel);
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(
                takeUntil(this.unsubscribe),
                filter(action => action.message.action === ToolboxActionEnum.PRINT)
            )
            .subscribe(PrintHelper.print);
    }

    private setTableData(data: BenutzerstelleResultDTO[]) {
        this.tableConfig = Object.assign({}, this.baseTableConfig);
        this.tableConfig.data = data.length ? data.map(row => this.createRow(row)) : [];
        this.tableConfig.config.displayedColumns = this.tableConfig.columns.map(c => c.columnDef);
    }

    private createRow(data: BenutzerstelleResultDTO) {
        return {
            benutzerstelleID: data.code,
            benutzerstelle: this.facadeService.dbTranslateService.translate(data, 'name'),
            benutzerstelleTyp: this.facadeService.dbTranslateService.translate(data.typeObject, 'text'),
            strasseNr: `${this.facadeService.dbTranslateService.translate(data, 'strasse')} ${data.strasseNr}`,
            plz: data.plzObject.postleitzahl,
            ort: this.facadeService.dbTranslateService.translate(data.plzObject, 'ort'),
            telefon: data.telefonNr,
            object: data
        };
    }

    private setKantone() {
        const kantoneList: string[] = [];
        this.tableConfig.data.forEach((tableData: { object: BenutzerstelleResultDTO }) => {
            const kantonsKuerzel = tableData.object.plzObject.kantonsKuerzel;
            if (!kantoneList.find((kantone: string) => kantone === kantonsKuerzel)) {
                kantoneList.push(kantonsKuerzel);
            }
        });
        this.kantoneList = kantoneList.join(', ');
    }

    private getInitialData() {
        let bearbeitenObservable;
        if (this.isBearbeiten) {
            this.route.queryParamMap.subscribe(params => {
                if (params.get('vollzugsregionId')) {
                    bearbeitenObservable = this.benutzerstellenRestService.getVollzugsregionById(params.get('vollzugsregionId'));
                } else {
                    of({ data: null });
                }
            });
        } else {
            bearbeitenObservable = of({ data: null });
        }

        forkJoin<CodeDTO[], BaseResponseWrapperVollzugsregionDTOWarningMessages>(this.stesRestService.getCode(DomainEnum.VOLLZUGSREGIONTYP), bearbeitenObservable)
            .pipe(
                finalize(() => {
                    this.facadeService.spinnerService.deactivate(this.channel);
                })
            )
            .subscribe(([codeDTOs, vollzugsregionResponse]) => {
                this.vollzugsregion = vollzugsregionResponse.data;
                this.regionTypArray = this.facadeService.formUtilsService.mapDropdownKurztext(codeDTOs);
                this.regionTypCodes = codeDTOs;
                if (vollzugsregionResponse.data) {
                    this.mapToForm(vollzugsregionResponse.data);
                    this.infopanelService.sendTemplateToInfobar(this.infobartemplate);
                    this.infopanelService.sendLastUpdate(vollzugsregionResponse.data);
                    this.infopanelService.updateInformation({
                        title: 'verzeichnisse.label.vollzugsregion',
                        secondTitle: vollzugsregionResponse.data.code,
                        subtitle: '',
                        hideInfobar: false
                    });
                }
            });
    }

    private mapToForm(dto: VollzugsregionDTO) {
        this.formValueOnLoad = {
            bezeichnungDeutsch: dto.nameDe,
            bezeichnungFranzoesisch: dto.nameFr,
            bezeichnungItalienisch: dto.nameIt,
            vollzugsregiontyp: dto.vregTypeObject.codeId,
            vollzugsregionID: dto.code,
            gueltigVon: this.facadeService.formUtilsService.parseDate(dto.gueltigAb),
            gueltigBis: this.facadeService.formUtilsService.parseDate(dto.gueltigBis)
        };
        this.tableDataOnLoad = dto.benutzerstelleList.map((benutzerstelleResultDTO: BenutzerstelleResultDTO) => this.createRow(benutzerstelleResultDTO));

        this.form.patchValue(this.formValueOnLoad);
        this.displayTable = false;
        setTimeout(() => {
            this.tableConfig.data = [...this.tableDataOnLoad];
            this.displayTable = true;
            this.setKantone();
        }, 0);
    }
}
