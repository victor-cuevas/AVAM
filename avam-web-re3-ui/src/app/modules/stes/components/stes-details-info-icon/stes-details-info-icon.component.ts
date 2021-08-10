import { Component, Input, OnDestroy, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToolboxActionEnum, ToolboxConfiguration } from '@shared/services/toolbox.service';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { ToolboxService } from 'src/app/shared';
import { StesHeaderDTO } from '@shared/models/dtos-generated/stesHeaderDTO';

@Component({
    selector: 'app-stes-details-info-icon',
    templateUrl: './stes-details-info-icon.component.html',
    styleUrls: ['./stes-details-info-icon.component.scss']
})
export class StesDetailsInfoIconComponent implements OnInit, OnDestroy {
    @Input() set data(inputData: StesHeaderDTO) {
        this._data = inputData;
    }

    @Output() onClick: EventEmitter<any> = new EventEmitter();

    public _data: StesHeaderDTO;
    public id = 'popover';
    private observeClickActionSub: Subscription;
    public popoverToolboxConfiguration: ToolboxConfiguration[];

    @ViewChild('popover') public popover: NgbPopover;

    constructor(private toolboxService: ToolboxService) {}

    ngOnInit() {
        this.popoverToolboxConfiguration = [new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)];
        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe(action => {
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            }
        });
    }

    ngOnDestroy() {
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
    }

    close() {
        this.popover.close();
    }

    print() {}

    onClickInfoIcon() {
        this.onClick.emit();
    }
}
