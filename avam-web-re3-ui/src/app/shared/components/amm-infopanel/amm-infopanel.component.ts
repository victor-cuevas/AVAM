import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { AmmInfopanelService, InfobarData } from './amm-infopanel.service';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
@Component({
    selector: 'avam-amm-infopanel',
    templateUrl: './amm-infopanel.component.html',
    styleUrls: ['./amm-infopanel.component.scss']
})
export class AmmInfopanelComponent implements OnInit {
    @Input('hasTitle') hasTitle = true;

    @Input('data') set data(data: InfobarData) {
        this.infopanelData = data;
    }

    @Input('infoPanelTemplate') infoPanelTemplate: TemplateRef<any>;
    infopanelData: InfobarData;
    maskData: InfobarData;
    constructor(private infopanelService: AmmInfopanelService) {}

    ngOnInit() {
        this.infopanelService.resetTemplateInInfobar();
        this.infopanelService.pullInformation().subscribe(data => {
            this.maskData = data;
        });
    }

    showTooltip(element: HTMLElement, tooltip: NgbTooltip) {
        if (element.clientWidth !== element.scrollWidth) {
            tooltip.open();
        }
    }
}
