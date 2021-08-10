import { Component, OnInit, Input } from '@angular/core';
import { CoreInfoBarService } from './core-info-bar.service';

@Component({
    selector: 'core-info-bar',
    templateUrl: './core-info-bar.component.html',
    styleUrls: ['./core-info-bar.component.scss']
})
export class CoreInfoBarComponent implements OnInit {
    @Input('hasTitle') hasTitle = true;

    @Input('data') set data(data) {
        this.receivedData = data;
    }

    @Input('infoPanelTemplate') infoPanelTemplate: any;
    receivedData: any;
    maskData: any;
    constructor(private infobarService: CoreInfoBarService) {}

    ngOnInit() {
        this.infobarService.pullInformation().subscribe(data => {
            this.maskData = data;
        });
    }

    showTooltip(element, tooltip) {
        if (element.clientWidth !== element.scrollWidth) {
            tooltip.open();
        }
    }
}
