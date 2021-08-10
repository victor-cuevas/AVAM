import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'avam-collapse-panel',
    templateUrl: './avam-collapse-panel.component.html',
    styleUrls: ['./avam-collapse-panel.component.scss']
})
export class AvamCollapsePanelComponent implements OnInit {
    @Input() title: string;

    isLeftSideCollapsed: boolean;

    constructor() {}

    ngOnInit() {}
}
