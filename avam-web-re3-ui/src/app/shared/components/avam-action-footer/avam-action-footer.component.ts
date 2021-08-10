import { Component, OnInit, OnDestroy, Input, TemplateRef, ElementRef, AfterViewInit } from '@angular/core';
import { AvamActionService } from './avam-action.service';
import { Subscription } from 'rxjs';
import { SpinnerService } from 'oblique-reactive';

@Component({
    selector: 'avam-action-footer',
    templateUrl: './avam-action-footer.component.html',
    styleUrls: ['./avam-action-footer.component.scss']
})
export class AvamActionFooterComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() buttonsTemplate: TemplateRef<any>;
    @Input() customWidth: string;

    getData = false;
    navCollapsed: boolean;
    private subscription: Subscription;
    private spinnerSubscription: Subscription;
    private buttons: HTMLCollection;

    constructor(private avamActionService: AvamActionService, private spinnerService: SpinnerService, private elementRef: ElementRef) {
        this.spinnerSubscription = this.spinnerService.events.subscribe(event => {
            this.getData = event.active;
            if (!event.channel.includes('modal')) {
                if (this.buttons && this.buttons.length > 0) {
                    this.setDisabledButtons(event.active);
                }
            }
        });
    }

    ngOnInit() {
        this.subscription = this.avamActionService.getCollapsed().subscribe(collapsed => {
            this.navCollapsed = collapsed;
        });
    }

    ngAfterViewInit(): void {
        this.deactivateButtons();
    }

    deactivateButtons() {
        this.buttons = this.elementRef.nativeElement.children[0].children[0].children;
        if (this.buttons.length > 0 && this.getData) {
            this.setDisabledButtons(true);
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.spinnerSubscription.unsubscribe();
    }

    private setDisabledButtons(active: boolean) {
        for (let i = 0; i < this.buttons.length; i++) {
            if (this.buttons.item(i)['nodeName'] === 'BUTTON' && !this.buttons.item(i).classList.contains('keepDisabled')) {
                this.buttons.item(i)['disabled'] = active;
            } else if (this.buttons.item(i)['nodeName'] === 'DIV' && !this.buttons.item(i).classList.contains('keepDisabled')) {
                for (let j = 0; j < this.buttons.item(i).children.length; j++) {
                    this.buttons.item(i).children.item(j)['disabled'] = active;
                }
            }
        }
    }
}
