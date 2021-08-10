import { AlertChannelEnum } from './../alert/alert-channel.enum';
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import { finalize, map, takeUntil } from 'rxjs/operators';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StesBenutzerstelleSucheFormbuilder } from '@shared/formbuilders/stes-benutzerstelle-suche.formbuilder';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import { BenutzerstelleSucheParamsModel } from '@stes/pages/details/pages/datenfreigabe/benutzerstelle-suche-params.model';
import { BenutzerstellenRestService } from '@core/http/benutzerstellen-rest.service';
import { BenutzerstelleResultDTO } from '@dtos/benutzerstelleResultDTO';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { KantonDTO } from '@dtos/kantonDTO';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { FacadeService } from '@shared/services/facade.service';
import { BaseResponseWrapperListBenutzerstelleResultDTOWarningMessages } from '@dtos/baseResponseWrapperListBenutzerstelleResultDTOWarningMessages';
import { BenutzerstelleAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-benutzerstelle-autosuggest/avam-benutzerstelle-autosuggest.component';
import { BenutzerstelleAuswaehlenTabelleComponent } from '@app/shared';
import { BenutzerstelleAuswaehlenTabelleInterface } from '@shared/components/benutzerstelle-auswaehlen-tabelle/benutzerstelle-auswaehlen-tabelle.interface';

@Component({
    selector: 'app-benutzerstelle-suche',
    templateUrl: './benutzerstelle-suche.component.html',
    styleUrls: ['./benutzerstelle-suche.component.scss']
})
export class BenutzerstelleSucheComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('benutzerstelleAuswaehlenTabelle') benutzerstelleAuswaehlenTabelle: BenutzerstelleAuswaehlenTabelleComponent;

    @Input() uebergebeneDaten: BenutzerstelleSucheParamsModel;
    @Input() isMultiSelect = false;
    @Input() vollzugsregionBenutzerstellen: number[] = [];
    @Output() emitBenutzerstelle = new EventEmitter();
    @Output() emitSelectedBenutzerstellen = new EventEmitter<BenutzerstelleAuswaehlenTabelleInterface[]>();

    readonly benutzerstelleSucheChannel = 'benutzerstelle-suche';
    readonly benutzerstelleResultChannel = 'benutzerstelle-result-modal';
    readonly benutzerstelleSucheToolboxId = 'benutzerstelle-suche-modal';

    searchForm: FormGroup;
    searchFormBuilder: StesBenutzerstelleSucheFormbuilder;
    benutzerstelletypOptionsLasbels: any[] = [];
    kantonOptionsLabels: KantonDTO[] = [];
    statusOptionsLabels: any[] = [];
    vollzugsregiontypLabels: any[] = [];
    toolboxConfig: ToolboxConfiguration[] = [];
    benutzerstellenData: BenutzerstelleResultDTO[] = [];
    kantonWaehlenSelectIsFocused = false;
    alertChannel = AlertChannelEnum;
    benutzerstelleSuchenTokens: any = {};
    benutzerstelleAutosuggestType = BenutzerstelleAutosuggestType.DEFAULT;
    enableUebernehmen = false;
    searchDone = false;

    private originalChannel: string;

    constructor(
        private formBuilder: FormBuilder,
        private benutzerstellenRestService: BenutzerstellenRestService,
        private stesDataRestService: StesDataRestService,
        private facadeService: FacadeService
    ) {
        super();
        SpinnerService.CHANNEL = this.benutzerstelleSucheChannel;
        this.originalChannel = ToolboxService.CHANNEL;
        ToolboxService.CHANNEL = this.benutzerstelleSucheToolboxId;
    }

    ngOnInit(): void {
        this.searchFormBuilder = new StesBenutzerstelleSucheFormbuilder(this.formBuilder);
        this.searchForm = this.searchFormBuilder.initForm(this.uebergebeneDaten);
        this.loadData();
        this.configureToolbox();
    }

    ngAfterViewInit(): void {
        if (this.benutzerstelleAuswaehlenTabelle.benuAuswaehlenTable) {
            this.benutzerstelleAuswaehlenTabelle.benuAuswaehlenTable.newSelections.pipe(takeUntil(this.unsubscribe)).subscribe(newSelections => {
                this.enableUebernehmen = newSelections;
            });
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        ToolboxService.CHANNEL = this.originalChannel;
    }

    loadData(): void {
        forkJoin<any, any, any, CodeDTO[]>([
            //NOSONAR
            this.stesDataRestService.getAllKantone(AlertChannelEnum.MODAL),
            this.stesDataRestService.getCode(DomainEnum.BENUTZERSTELLETYP, AlertChannelEnum.MODAL),
            this.stesDataRestService.getCode(DomainEnum.VOLLZUGSREGIONTYP, AlertChannelEnum.MODAL),
            this.stesDataRestService.getFixedCode(DomainEnum.STATUS_OPTIONS, AlertChannelEnum.MODAL)
        ])
            .pipe(
                map(([kantonData, benutzerstelletypData, vollzugsregiontypData, statusOptions]) => {
                    this.kantonOptionsLabels = kantonData;
                    this.benutzerstelletypOptionsLasbels = this.facadeService.formUtilsService.mapDropdownKurztext(benutzerstelletypData);
                    this.vollzugsregiontypLabels = this.facadeService.formUtilsService.mapDropdownKurztext(vollzugsregiontypData);
                    this.statusOptionsLabels = statusOptions.map(this.customPropertyMapperCode);
                })
            )
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                () => this.facadeService.spinnerService.deactivate(this.benutzerstelleSucheChannel),
                () => this.facadeService.spinnerService.deactivate(this.benutzerstelleSucheChannel)
            );
    }

    onSubmit(): void {
        this.facadeService.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);
        this.facadeService.spinnerService.activate(this.benutzerstelleResultChannel);
        this.benutzerstellenData = [];
        this.benutzerstellenRestService
            .getBenutzerstellen(this.searchFormBuilder.mapToDTO(this.isMultiSelect), this.facadeService.translateService.currentLang, AlertChannelEnum.MODAL)
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => {
                    this.searchDone = true;
                    this.facadeService.spinnerService.deactivate(this.benutzerstelleResultChannel);
                })
            )
            .subscribe((response: BaseResponseWrapperListBenutzerstelleResultDTOWarningMessages) => {
                this.benutzerstellenData = response.data;
            });
    }

    getFormNr(): string {
        if (this.isMultiSelect) {
            return StesFormNumberEnum.BENUTZERSTELLE_SUCHEN_VOLLZUGSREGION;
        } else {
            return StesFormNumberEnum.BENUTZERSTELLE_SUCHEN;
        }
    }

    close(): void {
        this.facadeService.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);
        this.facadeService.openModalFensterService.dismissAll();
    }

    reset(): void {
        this.benutzerstellenData = [];
        this.searchForm.reset({
            statusId: this.uebergebeneDaten.status,
            benutzerstelle: '',
            strasse: '',
            strasseNr: '',
            postleitzahl: '',
            ort: '',
            kantonId: '',
            benutzerstelleIdVon: '',
            benutzerstelleIdBis: '',
            benutzerstelleTypId: this.uebergebeneDaten.benutzerstellentyp,
            vollzugsregion: null,
            vollzugsregionTypeId: this.uebergebeneDaten.vollzugsregiontyp
        });
        this.facadeService.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);
        this.searchDone = false;
        this.enableUebernehmen = false;
    }

    onTextClear(name: string): void {
        this.searchForm.get(name).reset();
    }

    receiveData(data): void {
        this.emitBenutzerstelle.emit(data);
        this.close();
    }

    onUebernehmen(): void {
        const selectedRows = this.benutzerstelleAuswaehlenTabelle.benuAuswaehlenTable.selectedRows;
        this.emitSelectedBenutzerstellen.emit(selectedRows.filter(benuStelle => this.vollzugsregionBenutzerstellen.indexOf(benuStelle.benutzerstelleObj.benutzerstelleId) < 0));
        this.close();
    }

    private configureToolbox(): void {
        this.toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false));
        this.toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false));
        this.toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false));
        this.facadeService.toolboxService
            .observeClickAction(this.benutzerstelleSucheToolboxId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((event: any) => {
                if (event.message.action === ToolboxActionEnum.EXIT) {
                    this.close();
                }
            });
    }

    private customPropertyMapperCode = (element: CodeDTO) => {
        return {
            value: element.code,
            code: element.code,
            codeId: element.code,
            labelFr: element.kurzTextFr,
            labelIt: element.kurzTextIt,
            labelDe: element.kurzTextDe
        };
    };
}
