import { Component, OnInit, Input } from '@angular/core';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { SprachQualifikationDTO } from '@app/shared/models/dtos-generated/sprachQualifikationDTO';
import { DbTranslatePipe } from '@app/shared/pipes/db-translate.pipe';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SpinnerService } from 'oblique-reactive';
import { STES_DETAILS_MODAL_SPINNER_CHANNEL } from '../../stes-details-modal.component';

class SprachkentnisseDTO {
    bemerkungen?: string;
    objVersion?: number;
    sprachQualifikationen?: SprachQualifikationDTO[];
}

@Component({
    selector: 'avam-stes-details-modal-sprachen',
    templateUrl: './stes-details-modal-sprachen.component.html',
    styleUrls: ['./stes-details-modal-sprachen.component.scss']
})
export class StesDetailsModalSprachenComponent implements OnInit {
    @Input() stesId: string;

    dataSource = [];
    columns = [
        { columnDef: 'sprache', header: 'i18n.labels.language', cell: (element: any) => `${element.sprache}` },
        { columnDef: 'muendlichKenntnisse', header: 'stes.label.muendlich', cell: (element: any) => `${element.muendlichKenntnisse}` },
        { columnDef: 'schriftlichKenntnisse', header: 'stes.label.schriftlich', cell: (element: any) => `${element.schriftlichKenntnisse}` },
        { columnDef: 'muttersprache', header: 'stes.label.Muttersprache', cell: (element: any) => `${element.muttersprache}` },
        { columnDef: 'sprachAufenthalt', header: 'stes.label.sprachenaufenhalt', cell: (element: any) => `${element.sprachAufenthalt}` }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    data: SprachkentnisseDTO;
    sprachkentnisseForm: FormGroup;

    constructor(
        private dataService: StesDataRestService,
        private translateService: TranslateService,
        private dbTranslatePipe: DbTranslatePipe,
        private formBuilder: FormBuilder,
        private spinnerService: SpinnerService
    ) {}

    ngOnInit() {
        this.sprachkentnisseForm = this.createFormGroup();
        this.getData();
    }

    createFormGroup(): FormGroup {
        return this.formBuilder.group({
            bemerkungen: [null]
        });
    }

    getData() {
        this.spinnerService.activate(STES_DETAILS_MODAL_SPINNER_CHANNEL);
        this.dataService.getSprachkenntnisseBearbeiten(this.stesId, this.translateService.currentLang).subscribe(
            resp => {
                this.data = resp;
                this.dataSource = this.data.sprachQualifikationen.map((element, index) => this.mapToRow(element, index));
                this.sprachkentnisseForm.patchValue(this.data);
                this.spinnerService.deactivate(STES_DETAILS_MODAL_SPINNER_CHANNEL);
            },
            () => {
                this.spinnerService.activate(STES_DETAILS_MODAL_SPINNER_CHANNEL);
            }
        );
    }

    mapToRow(element: SprachQualifikationDTO, index: number) {
        return {
            id: index,
            sprache: this.dbTranslatePipe.transform(element.sprache, 'text'),
            muendlichKenntnisse: this.dbTranslatePipe.transform(element.muendlichKenntnisse, 'text'),
            schriftlichKenntnisse: this.dbTranslatePipe.transform(element.schriftlichKenntnisse, 'text'),
            muttersprache: element.mutterspracheB ? this.translateService.instant('i18n.common.yes') : this.translateService.instant('i18n.common.no'),
            sprachAufenthalt: element.sprachAufenthaltB ? this.translateService.instant('i18n.common.yes') : this.translateService.instant('i18n.common.no')
        };
    }
}
