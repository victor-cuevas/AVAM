import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GekoRegelService, GeschaeftsregelHeader } from '@shared/services/geko-regel.service';
import { SpinnerService } from 'oblique-reactive';

@Component({
    selector: 'avam-geschaeftsregeln-main-container',
    templateUrl: './geschaeftsregeln-main-container.component.html'
})
export class GeschaeftsregelnMainContainerComponent implements OnInit, AfterViewInit {
    static readonly CHANNEL = 'avam-admin-geko-geschaeftsregeln-main.channel';
    header: GeschaeftsregelHeader;
    readonly navPath = 'geko';
    readonly channel: string;

    constructor(public service: GekoRegelService, private changeDetector: ChangeDetectorRef) {
        SpinnerService.CHANNEL = this.channel;
        this.channel = GeschaeftsregelnMainContainerComponent.CHANNEL;
    }

    ngOnInit(): void {
        this.service.getLoggedUserBenutzerstelleKanton(this.channel);
        this.service.pullHeader().subscribe((header: GeschaeftsregelHeader) => {
            this.header = header;
        });
    }

    ngAfterViewInit(): void {
        this.changeDetector.detectChanges();
    }
}
