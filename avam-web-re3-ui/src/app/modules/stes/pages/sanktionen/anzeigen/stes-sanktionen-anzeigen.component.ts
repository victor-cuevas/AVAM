import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ToolboxService } from '@app/shared/services/toolbox.service';
import { TreeOptionInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-option.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { ToolboxActionEnum, ToolboxConfiguration } from '@shared/services/toolbox.service';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { Subject, Subscription } from 'rxjs';
import { StesTreeTableWraperComponent } from '@shared/components/stes-tree-table-wraper/stes-tree-table-wraper.component';
import { takeUntil } from 'rxjs/operators';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { PreviousRouteService } from '@shared/services/previous-route.service';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { SanktionenSachverhaltCodeEnum } from '@shared/enums/domain-code/sanktionen-sachverhalts-code.enum';
import { Permissions } from '@shared/enums/permissions.enum';
import { TableHelperService } from '@stes/pages/sanktionen/helpers/table-helper.service';
import { CodeDTO } from '@dtos/codeDTO';
import { TreeNodeInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-node.interface';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-stes-sanktionen-anzeigen',
    templateUrl: './stes-sanktionen-anzeigen.component.html'
})
export class StesSanktionenAnzeigenComponent implements OnInit, OnDestroy, AfterViewInit {
    static stesSanktionenChannel = 'sanktionen';

    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('sanktionenDataTable') sanktionenDataTable: StesTreeTableWraperComponent;
    @ViewChild('actionColumnTemplate') actionColumnTemplate: TemplateRef<any>;

    public stesId: string;
    public sanktionenToolboxId: 'sanktionen-anzeigen';
    public observeClickActionToolboxSub: Subscription;
    public sanktionenData: TreeNodeInterface[] = [];
    public sanktionenTableOptions: TreeOptionInterface;

    public permissions: typeof Permissions = Permissions;
    public observeTranslateServiceSub: Subscription;
    public sachverhaltTypen: CodeDTO[];
    private unsubscribe$: Subject<{}>;

    constructor(
        private route: ActivatedRoute,
        private previousRouteService: PreviousRouteService,
        private router: Router,
        private stesInfobarService: AvamStesInfoBarService,
        private dataRestService: StesDataRestService,
        private tableHelper: TableHelperService,
        private facade: FacadeService
    ) {
        this.unsubscribe$ = new Subject();
        ToolboxService.CHANNEL = StesSanktionenAnzeigenComponent.stesSanktionenChannel;
    }

    public ngOnInit() {
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.sanktionen.anzeigen' });
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.facade.fehlermeldungenService.closeMessage();
        this.configureToolbox();
        this.createSubscriptions();

        this.getData();
    }

    public ngAfterViewInit() {
        this.facade.spinnerService.activate(StesSanktionenAnzeigenComponent.stesSanktionenChannel);
    }

    public getData(): void {
        this.dataRestService
            .getSanktionen(this.stesId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                response => {
                    this.facade.spinnerService.deactivate(StesSanktionenAnzeigenComponent.stesSanktionenChannel);
                    this.sanktionenData = this.tableHelper.generateTableRows(response.data);
                    this.updateDataLengthHeader(this.sanktionenData.length);
                    this.observeTranslateServiceSub = this.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
                        this.sanktionenData = this.tableHelper.generateTableRows(response.data);
                        this.updateDataLengthHeader(this.sanktionenData.length);
                    });
                    this.createSanktionenTableOptions();
                },
                () => this.facade.spinnerService.deactivate(StesSanktionenAnzeigenComponent.stesSanktionenChannel)
            );
    }

    public ngOnDestroy(): void {
        this.facade.toolboxService.sendConfiguration([]);
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public updateDataLengthHeader(numItems: number) {
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.sanktionen.anzeigen', tableCount: numItems });
    }

    onRowSelected(node: { model: TreeNodeInterface }) {
        const data = node.model.data;
        const objectType = data['type'];
        const sanktionTypeName = this.getSanktionRouteName(this.facade.formUtilsService.getCodeByCodeId(this.sachverhaltTypen, data['sanktionType']));

        if (objectType === 'SACHVERHALT') {
            this.router.navigate([`stes/details/${this.stesId}/sanktionen/${sanktionTypeName}-bearbeiten`], { queryParams: { sachverhaltId: data['id'] } });
        } else if (objectType === 'STELLUNGNAHME') {
            this.router.navigate([`stes/details/${this.stesId}/sanktionen/${sanktionTypeName}-stellungnahme-bearbeiten`], {
                queryParams: { sachverhaltId: data['parentId'], stellungnahmeId: data['id'] }
            });
        } else if (objectType === 'ENTSCHEID') {
            this.router.navigate([`stes/details/${this.stesId}/sanktionen/${sanktionTypeName}-entscheid-bearbeiten`], {
                queryParams: { sachverhaltId: data['parentId'], entscheidId: data['id'] }
            });
        }
    }

    public navigateTo(type: string) {
        this.router.navigate([`stes/details/${this.stesId}/sanktionen/${type}`]);
    }

    private openPrintModal() {
        this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.sanktionenTableOptions);
    }

    private configureToolbox() {
        this.facade.toolboxService.sendConfiguration(
            [
                new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)
            ],
            this.sanktionenToolboxId,
            ToolboxDataHelper.createForStellensuchende(this.stesId)
        );
    }

    private createSubscriptions() {
        this.observeClickActionToolboxSub = this.facade.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    this.openPrintModal();
                }
            });
        this.dataRestService
            .getCode('SachverhaltGrund')
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(data => {
                this.sachverhaltTypen = data;
            });
    }

    private createSanktionenTableOptions() {
        this.sanktionenTableOptions = {
            columnOrder: ['objekte', 'kontrollperiode', 'erfassungsdatum', 'status', 'frist', 'entscheiddatum', 'einstelltage', 'einstellungsbeginn', 'stesId'],
            columnTitle: [
                'stes.sanktionen.header.objekte',
                'stes.sanktionen.header.kontrollperiode',
                'stes.sanktionen.header.erfassungsdatum',
                'stes.sanktionen.header.status',
                'stes.sanktionen.header.frist',
                'stes.sanktionen.header.entscheiddatum',
                'stes.sanktionen.header.einstelltage',
                'stes.sanktionen.header.einstellungsbeginn',
                'stes.sanktionen.header.stesId'
            ],
            actions: {
                template: this.actionColumnTemplate
            }
        };
    }

    private getSanktionRouteName(type: string): string {
        if (SanktionenSachverhaltCodeEnum.SACHVERHALT_ABM.valueOf() === type) {
            return 'arbeitsbemuehungen';
        } else if (SanktionenSachverhaltCodeEnum.SACHVERHALT_AMM.valueOf() === type) {
            return 'arbeitsmarktliche-massnahmen';
        } else if (SanktionenSachverhaltCodeEnum.SACHVERHALT_BRT.valueOf() === type) {
            return 'beratung';
        } else if (SanktionenSachverhaltCodeEnum.SACHVERHALT_KTM.valueOf() === type) {
            return 'kontrollvorschriften-weisungen';
        } else {
            return 'vermittlung';
        }
    }
}
