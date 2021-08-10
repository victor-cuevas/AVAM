import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostBinding, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { InfotagSearchResultComponent, ToolboxService } from '../../../../shared';
import { ToolboxActionEnum, ToolboxConfiguration } from '@shared/services/toolbox.service';
import { Subscription } from 'rxjs';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { InfotagService } from '@shared/services/infotag.service';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import { Router } from '@angular/router';
import { Unsubscribable } from 'oblique-reactive';
import { buildStesPath } from '@shared/services/build-route-path.function';
import { StesTerminePaths } from '@shared/enums/stes-navigation-paths.enum';
import { CodeDTO } from '@shared/models/dtos-generated/codeDTO';
import { filter, takeUntil } from 'rxjs/operators';
import { TableButtonTypeEnum } from '@app/shared/enums/table-button-type.enum';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'app-stes-infotag-modal',
    templateUrl: './stes-infotag-modal.component.html',
    styles: [
        `
            ::ng-deep #infotag-modal .column-content {
                overflow-y: hidden;
            }
            ::ng-deep #infotag-modal app-stes-details-infoleiste i.fa.fa-info {
                display: none;
            }
            ::ng-deep .removeStyle {
                padding: 0 !important;
                margin: 0 !important;
            }
        `
    ]
})
export class StesInfotagModalComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    static readonly TOOLBOX_ID: string = 'stesInfotagModal';
    readonly spinnerChannel: string = 'modalSpinnerChannel';
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('searchResult') infotagSearchResult: InfotagSearchResultComponent;
    @HostBinding('class.application-fixed') applicationFixed = true;
    stesId: string;
    modalToolboxConfiguration: ToolboxConfiguration[];
    public resultCountInfoleiste: number;
    private readonly originalChannel: string;
    private subscriptions: Array<Subscription>;
    private buchungsstatusGebuchtId = 0;

    constructor(
        private infotagService: InfotagService,
        private changeDetectorRef: ChangeDetectorRef,
        private componentInteraction: StesComponentInteractionService,
        private router: Router,
        private facadeService: FacadeService
    ) {
        super();
        this.originalChannel = ToolboxService.CHANNEL;
        ToolboxService.CHANNEL = this.getToolboxId();
    }

    ngOnInit(): void {
        this.subscriptions = new Array<Subscription>();
        this.infotagService
            .getBuchungsstatusCodes()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((codes: CodeDTO[]) => {
                if (codes) {
                    const code = codes.find(c => c.code === '1');
                    if (code) {
                        this.buchungsstatusGebuchtId = code.codeId;
                    }
                }
            });
        this.facadeService.messageBus
            .getData()
            .pipe(filter(message => message.type === 'reload-infotag-buchung-toolbox'))
            .subscribe(() => this.configureToolbox());
        this.configureToolbox();
        this.observeBuchung();
    }

    ngOnDestroy(): void {
        this.subscriptions.filter(s => s !== null).forEach((sub: Subscription) => sub.unsubscribe());
        ToolboxService.CHANNEL = this.originalChannel;
        super.ngOnDestroy();
    }

    ngAfterViewInit(): void {
        this.facadeService.messageBus.buildAndSend('infotag-search-form', this.stesId);
        this.componentInteraction.updateDetailsHeader(this.stesId);
        this.changeDetectorRef.detectChanges();
    }

    close(): void {
        this.facadeService.openModalFensterService.dismissAll();
    }

    getFormNr(): string {
        return StesFormNumberEnum.INFOTAG_BUCHEN;
    }

    getToolboxId(): string {
        return StesInfotagModalComponent.TOOLBOX_ID;
    }

    handleResultCount(resultCount: number): void {
        this.resultCountInfoleiste = resultCount;
    }

    handleInfotagSearchResultEvent(event: any): void {
        if (!event || !event.action) {
            return;
        } else if (event.action === TableButtonTypeEnum.UEBERNEHMEN) {
            this.facadeService.spinnerService.activate(this.spinnerChannel);
            this.infotagService.initBuchung(this.stesId, event.data.dfID, this.buchungsstatusGebuchtId);
        } else if (event.action === TableButtonTypeEnum.ANSCHAUEN) {
            this.facadeService.messageBus.buildAndSend('stes-termine-anzeigen.infotagZeigen', { stesId: this.stesId, dfeId: event.data.dfID, title: event.data.titel });
        }
    }

    private observeBuchung(): void {
        this.subscriptions.push(
            this.infotagService.geschaeftsfallSubject.asObservable().subscribe((gfId: number) => {
                this.facadeService.spinnerService.deactivate(this.spinnerChannel);
                this.navigateToGrunddatenSichten(gfId.toString());
            })
        );
    }

    private getGrunddatenBuchungURL(): string {
        return buildStesPath(this.stesId, StesTerminePaths.INFOTAGGRUNDDATENBUCHUNG);
    }

    private navigateToGrunddatenSichten(gfId: string): void {
        this.close();
        this.router.navigate([this.getGrunddatenBuchungURL()], { queryParams: { gfId } });
    }

    private configureToolbox(): void {
        this.modalToolboxConfiguration = [
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)
        ];

        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((event: any) => {
                if (event.message.action === ToolboxActionEnum.EXIT) {
                    this.close();
                } else if (event.message.action === ToolboxActionEnum.PRINT) {
                    this.facadeService.openModalFensterService.openPrintModal(this.modalPrint, this.infotagSearchResult.dataSource);
                }
            });
    }
}
