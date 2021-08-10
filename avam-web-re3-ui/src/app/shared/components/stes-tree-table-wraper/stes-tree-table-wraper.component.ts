import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
    selector: 'avam-stes-tree-table-wraper',
    templateUrl: './stes-tree-table-wraper.component.html'
})
export class StesTreeTableWraperComponent implements OnInit {
    @Output() onDoubleClick = new EventEmitter<any>();
    @Output() onEnter = new EventEmitter<any>();

    @Input() public tree = [];
    @Input() objectOptions;

    public ngOnInit() {
        this.removeActionColumn();
    }

    private removeActionColumn() {
        if (this.objectOptions) {
            const i = this.objectOptions.columnOrder.indexOf('action');
            if (i !== -1) {
                this.objectOptions.columnOrder.splice(i, 1);
            }
        }
    }

    public launchNodeClickedEvent(event): void {
        this.onDoubleClick.emit(event);
    }
}
