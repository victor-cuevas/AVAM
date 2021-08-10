import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { DateRangeFormComponent } from '@app/shared/components/date-range-form/date-range-form.component';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { DurchfuehrungseinheitListeViewDTO } from '@app/shared/models/dtos-generated/durchfuehrungseinheitListeViewDTO';
import { InfotagDurchfuehrungseinheitSuchenParamDTO } from '@app/shared/models/dtos-generated/infotagDurchfuehrungseinheitSuchenParamDTO';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { forkJoin, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AmmInfotagRestService } from '../../services/amm-infotag-rest.service';

@Component({
    selector: 'avam-infotage-uebersicht',
    templateUrl: './infotage-uebersicht.component.html',
    styleUrls: ['./infotage-uebersicht.component.scss']
})
export class InfotageUebersichtComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    static CHANNEL = 'infotage-uebersicht-component';
    @ViewChild('suchenFormComponent') suchenFormComponent: DateRangeFormComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;

    formData = { state: {} };
    massnahmeId: number;
    dataSource = [];
    permissions: typeof Permissions = Permissions;
    anbieter: UnternehmenDTO;
    massnahmeDto: MassnahmeDTO;

    get channel() {
        return InfotageUebersichtComponent.CHANNEL;
    }

    constructor(
        private facade: FacadeService,
        private infopanelService: AmmInfopanelService,
        private infotagRestService: AmmInfotagRestService,
        private modalService: NgbModal,
        private route: ActivatedRoute,
        private router: Router,
        private searchSession: SearchSessionStorageService
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.subscribeToToolbox();
        this.subscribeToLangChange();
        this.configureToolbox();
        this.setupForm();
        this.getRouteData();
    }

    ngAfterViewInit(): void {
        this.getData(true);
    }

    subscribeToToolbox() {
        this.facade.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    this.openPrintModal();
                }
            });
    }

    openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true });
    }

    subscribeToLangChange() {
        this.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.facade.fehlermeldungenService.closeMessage();
            this.getData(true);
        });
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.getToolboxConfigData(), true);
    }

    getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: null,
            vorlagenKategorien: null,
            entityIDsMapping: { MASSNAHME_ID: this.massnahmeId }
        };
    }

    setupForm() {
        const state = this.searchSession.restoreStateByKey(this.channel);
        if (state) {
            this.formData = {
                state: state.fields
            };
            return;
        }

        const currentYear = new Date().getFullYear();

        this.formData = {
            state: {
                gueltigVon: new Date(currentYear, 0, 1),
                gueltigBis: new Date(2099, 11, 31)
            }
        };
    }

    getRouteData() {
        this.route.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.massnahmeId = +params['massnahmeId'];
        });
    }

    getData(init: boolean) {
        if (!this.suchenFormComponent.isValid()) {
            this.suchenFormComponent.ngForm.onSubmit(undefined);
            this.facade.openModalFensterService.openInfoModal('stes.error.bearbeiten.pflichtfelder');
            return;
        }

        this.facade.spinnerService.activate(this.channel);
        const sources: Observable<any>[] = [this.infotagRestService.getInfotageByMassnahme(this.getSearchParams())];
        if (init) {
            sources.push(this.infotagRestService.getInfotagMassnahme(this.massnahmeId));
        }
        forkJoin(sources).subscribe(
            ([searchRes, getMassnahmeRes]) => {
                this.searchSession.storeFieldsByKey(this.channel, this.suchenFormComponent.mapToDTO());
                this.dataSource = [...searchRes.data]
                    .sort(this.sortByStrField('durchfuehrungseinheitTitel'))
                    .sort(this.sortByStrField('ortsbezeichnung'))
                    .map(element => this.createRow(element));
                if (getMassnahmeRes) {
                    this.massnahmeDto = getMassnahmeRes.data;
                    this.updateInfopanel(this.massnahmeDto);
                } else {
                    this.infopanelService.updateInformation({ tableCount: this.dataSource.length });
                }

                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    getSearchParams(): InfotagDurchfuehrungseinheitSuchenParamDTO {
        const formValue = this.suchenFormComponent.mapToDTO();

        return {
            language: this.facade.translateService.currentLang,
            massnahmeId: this.massnahmeId,
            zeitraumVon: formValue.gueltigVon,
            zeitraumBis: formValue.gueltigBis
        };
    }

    sortByStrField(field: string) {
        return (v1: DurchfuehrungseinheitListeViewDTO, v2: DurchfuehrungseinheitListeViewDTO): number => {
            const str1 = this.facade.dbTranslateService.translate(v1, field) || '';
            const str2 = this.facade.dbTranslateService.translate(v2, field) || '';
            return str1.localeCompare(str2);
        };
    }

    createRow(responseDTO: DurchfuehrungseinheitListeViewDTO) {
        return {
            infotagId: responseDTO.durchfuehrungseinheitId,
            titel: this.facade.dbTranslateService.translateWithOrder(responseDTO, 'durchfuehrungseinheitTitel') || '',
            ort: this.createOrtStr(responseDTO),
            datum: this.facade.formUtilsService.parseDate(responseDTO.durchfuehrungseinheitGueltigVon) || '',
            kurszeiten: this.facade.dbTranslateService.translateWithOrder(responseDTO, 'kurszeiten') || '',
            teilnehmer: `${responseDTO.anzBuchungenKorr} / ${responseDTO.maxPlaetze || '0'}`,
            ueberbuchung: `${responseDTO.anzUeberbuchungen} / ${responseDTO.ueberbuchungenMax || '0'}`
        };
    }

    createOrtStr(responseDTO: DurchfuehrungseinheitListeViewDTO) {
        const plz = responseDTO.plz || '';
        const ortsbezeichnung = this.facade.dbTranslateService.translateWithOrder(responseDTO, 'ortsbezeichnung') || '';
        return `${plz} ${ortsbezeichnung}`.trim();
    }

    updateInfopanel(data: MassnahmeDTO) {
        this.infopanelService.dispatchInformation({
            title: 'amm.infotag.label.infotagMassnahme',
            secondTitle: data ? this.facade.dbTranslateService.translateWithOrder(data, 'titel') : undefined,
            subtitle: 'amm.infotag.label.listeinfotage',
            hideInfobar: false,
            tableCount: this.dataSource.length
        });
        this.anbieter = data.ammAnbieterObject.unternehmen;
        this.infopanelService.sendTemplateToInfobar(this.panelTemplate);
    }

    onRefresh() {
        this.facade.fehlermeldungenService.closeMessage();
        this.getData(false);
    }

    onCreate() {
        this.router.navigate([`amm/infotag/massnahme/${this.massnahmeId}/infotag/erfassen/grunddaten`]);
    }

    seelctedRow(infotagId: number) {
        this.router.navigate([`amm/infotag/massnahme/${this.massnahmeId}/infotage/infotag/grunddaten`], {
            queryParams: { dfeId: infotagId }
        });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.infopanelService.resetTemplateInInfobar();
    }
}
