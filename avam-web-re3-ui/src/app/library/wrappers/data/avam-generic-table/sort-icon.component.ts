import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AvamGenericTableComponent } from './avam-generic-table.component';
import { Subscription } from 'rxjs';
import { AvamGenericTableService } from './avam-generic-table.service';

@Component({
    selector: 'sort-icon',
    template: `
        <i class="sort-icon fa ml-2" [ngClass]="{ 'fa-caret-up': sortOrder === 1, 'fa-caret-down': sortOrder === -1 }"></i>
    `
})
export class SortIconComponent implements OnInit, OnDestroy {
    @Input('column') column: any;
    sortOrder: any;
    subscription: Subscription;

    constructor(private dt: AvamGenericTableComponent, private tableService: AvamGenericTableService) {}
    ngOnInit(): void {
        this.subscription = this.tableService.sortSource$.subscribe(data => {
            this.sortOrder = this.dt.isSorted(this.column) ? this.dt._sortOrder : 0;
        });
    }
    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
