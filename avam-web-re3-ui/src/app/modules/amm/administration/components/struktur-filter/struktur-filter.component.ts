import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges, ViewChild, OnInit } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { StrukturHandlerService } from './struktur-handler.service';
import { StrukturReactiveFormService } from './struktur-reactive-form.service';
import { ElementKategorieDTO } from '@app/shared/models/dtos-generated/elementKategorieDTO';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

export interface StrukturFilterDTO {
    elementkategorieId: number;
    anzeigeDatum: Date;
}

@Component({
    selector: 'avam-struktur-filter',
    templateUrl: './struktur-filter.component.html',
    styleUrls: ['./struktur-filter.component.scss'],
    providers: [StrukturHandlerService, StrukturReactiveFormService]
})
export class StrukturFilterComponent implements OnInit, OnChanges {
    @Input() data: ElementKategorieDTO[] = [];
    @Output() onRefresh: EventEmitter<StrukturFilterDTO> = new EventEmitter();
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    public searchForm: FormGroup;
    public categoriesOptions: any[];

    constructor(private handler: StrukturHandlerService, private obliqueHelper: ObliqueHelperService) {
        this.searchForm = handler.reactiveForm.searchForm;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.data.currentValue) {
            this.categoriesOptions = this.handler.mapOptions(this.data);
            this.handler.mapToForm(this.data);
        }
    }

    refresh() {
        this.onRefresh.emit(this.handler.mapToDTO(this.searchForm));
    }
}
