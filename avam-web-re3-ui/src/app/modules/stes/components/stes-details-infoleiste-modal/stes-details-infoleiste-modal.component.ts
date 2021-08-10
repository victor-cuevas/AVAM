import { ToolboxService } from 'src/app/shared';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { StesComponentInteractionService } from 'src/app/shared/services/stes-component-interaction.service';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { StesHeaderDTO } from '@shared/models/dtos-generated/stesHeaderDTO';

@Component({
    selector: 'app-stes-details-infoleiste-modal',
    templateUrl: './stes-details-infoleiste-modal.component.html',
    styleUrls: ['./stes-details-infoleiste-modal.component.scss']
})
export class StesDetailsInfoleisteModalComponent implements OnInit, OnDestroy {
    @Input() ueberschrift: string;
    @Input() ueberschriftModal: string;
    @Input() toolboxId: string;
    @Input() stesId: string;
    @Input() modalNumber: string;

    private detailsHeaderSubscription: Subscription;
    private dataSubscription: Subscription;
    private routeSubscription: Subscription;

    public stesHeader: StesHeaderDTO;

    constructor(
        private route: ActivatedRoute,
        private componentInteraction: StesComponentInteractionService,
        private dataService: StesDataRestService,
        private toolboxService: ToolboxService
    ) {}

    ngOnInit() {
        this.loadDetailsHeaderContent(this.stesId);

        this.detailsHeaderSubscription = this.componentInteraction.detailsHeaderSubject.subscribe(stesId => {
            this.loadDetailsHeaderContent(stesId);
        });
    }

    ngOnDestroy() {
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

    loadDetailsHeaderContent(stesId: string) {
        this.dataSubscription = this.dataService.getStesHeader(stesId, 'de').subscribe((data: StesHeaderDTO) => {
            this.stesHeader = { ...data };
            this.toolboxService.sendEmailAddress(this.stesHeader.stesBenutzerEmail ? this.stesHeader.stesBenutzerEmail : '');
        });
    }
}
