import { ToolboxService } from 'src/app/shared';
import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { StesComponentInteractionService } from 'src/app/shared/services/stes-component-interaction.service';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { Unsubscribable } from 'oblique-reactive';
import { filter, takeUntil } from 'rxjs/operators';
import { MessageBus } from 'src/app/shared/services/message-bus';
import { StesHeaderDTO } from '@shared/models/dtos-generated/stesHeaderDTO';

@Component({
    selector: 'app-stes-details-infoleiste',
    templateUrl: './stes-details-infoleiste.component.html',
    styleUrls: ['./stes-details-infoleiste.component.scss']
})
export class StesDetailsInfoleisteComponent extends Unsubscribable implements OnInit, OnDestroy {
    @Input() contentNumber = null;
    /**
     * Should we display the name of the stes in the header?
     */
    @Input() hasNameHeader = true;
    /**
     * Should we display the name of the stes in the panel?
     */
    @Input() hasNamePanel = false;
    @Input() additionalClass = [];
    @Input() additionalToolboxClass = {};

    @Input() showToolbox = true;

    public stesHeader: StesHeaderDTO;
    public ueberschriftTooltip: string;

    private inputUeberschrift: string;
    private ueberschriftStr: string;
    private characterNumberOverflow: number;
    private detailsHeaderSubscription: Subscription;
    private dataSubscription: Subscription;
    private routeSubscription: Subscription;

    constructor(
        private route: ActivatedRoute,
        private componentInteraction: StesComponentInteractionService,
        private dataService: StesDataRestService,
        private toolboxService: ToolboxService,
        private translateService: TranslateService,
        private messageBus: MessageBus
    ) {
        super();
    }

    @Input() set ueberschrift(value: string) {
        this.inputUeberschrift = value;
        this.setUeberschiftOverflow();
    }

    get ueberschrift(): string {
        return this.ueberschriftStr;
    }

    ngOnInit() {
        if (!this.contentNumber) {
            this.messageBus
                .getData()
                .pipe(filter(message => message.type === 'stes-details-infoleiste.contentNumber'))
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(message => {
                    this.contentNumber = message.data;
                });
        }

        this.routeSubscription = this.route.params.subscribe(data => {
            if (data && data['stesId']) {
                this.loadDetailsHeaderContent(data['stesId']);
            }
        });

        this.detailsHeaderSubscription = this.componentInteraction.detailsHeaderSubject.subscribe(stesId => {
            this.loadDetailsHeaderContent(stesId);
        });

        this.componentInteraction.dataLengthHeaderSubject.pipe(takeUntil(this.unsubscribe)).subscribe(dataLength => {
            this.contentNumber = dataLength;
        });
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        if (this.detailsHeaderSubscription) {
            this.detailsHeaderSubscription.unsubscribe();
        }

        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }

        if (this.dataSubscription) {
            this.dataSubscription.unsubscribe();
        }
    }

    setUeberschiftOverflow() {
        this.setCharacterNumberOverflow();
        if (this.inputUeberschrift.length > this.characterNumberOverflow) {
            this.ueberschriftTooltip = this.inputUeberschrift;
            this.ueberschriftStr = this.inputUeberschrift.substring(0, this.characterNumberOverflow) + '...';
        } else {
            this.ueberschriftStr = this.inputUeberschrift;
        }
    }

    setCharacterNumberOverflow() {
        const windowWidth = window.innerWidth;
        if (windowWidth > 1800) {
            this.characterNumberOverflow = windowWidth / 30;
        } else if (windowWidth > 1500) {
            this.characterNumberOverflow = windowWidth / 40;
        } else if (windowWidth > 1200) {
            this.characterNumberOverflow = windowWidth / 50;
        } else {
            this.characterNumberOverflow = 20;
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.setUeberschiftOverflow();
    }

    loadDetailsHeaderContent(stesId: string) {
        this.dataSubscription = this.dataService.getStesHeader(stesId, this.translateService.currentLang).subscribe((data: StesHeaderDTO) => {
            this.stesHeader = { ...data };
            this.toolboxService.sendEmailAddress(this.stesHeader.stesBenutzerEmail ? this.stesHeader.stesBenutzerEmail : '');
        });
    }
}
