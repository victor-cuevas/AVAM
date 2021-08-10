import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { BaseResponseWrapperStesBerufsdatenListDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperStesBerufsdatenListDTOWarningMessages';
import { StesBerufsdatenDTO } from '@app/shared/models/dtos-generated/stesBerufsdatenDTO';
import { StesBerufsdatenListDTO } from '@app/shared/models/dtos-generated/stesBerufsdatenListDTO';
import { GeschlechtPipe } from '@app/shared/pipes/geschlecht.pipe';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { SpinnerService } from 'oblique-reactive';
import { STES_DETAILS_MODAL_SPINNER_CHANNEL as spinnerChannel } from '../../stes-details-modal.component';

@Component({
    selector: 'avam-stes-details-modal-berufsdaten',
    templateUrl: './stes-details-modal-berufsdaten.component.html',
    styleUrls: ['./stes-details-modal-berufsdaten.component.scss']
})
export class StesDetailsModalBerufsdatenComponent implements OnInit {
    @Input() stesId: string;
    @Output() onSelect: EventEmitter<StesBerufsdatenDTO> = new EventEmitter<StesBerufsdatenDTO>();

    dataSource;
    columns = [
        { columnDef: 'berufsTaetigkeit', header: 'stes.label.vermittlung.berufTaetigkeit', cell: (element: any) => `${element.berufsTaetigkeit}` },
        { columnDef: 'dauer', header: 'stes.label.dauervonbis', cell: (element: any) => `${element.dauer}` },
        { columnDef: 'berufsFunktion', header: 'stes.label.funktion', cell: (element: any) => `${element.berufsFunktion}` },
        { columnDef: 'qualifikation', header: 'stes.label.qualifikation', cell: (element: any) => `${element.qualifikation}` },
        { columnDef: 'ausgeuebtB', header: 'stes.label.ausgeuebt', cell: (element: any) => `${element.ausgeuebtB}` },
        { columnDef: 'zuletztB', header: 'stes.label.zuletzt', cell: (element: any) => `${element.zuletztB}` },
        { columnDef: 'gesuchtB', header: 'stes.label.gesucht', cell: (element: any) => `${element.gesuchtB}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor(
        private spinnerService: SpinnerService,
        private dataService: StesDataRestService,
        private dbTranslateService: DbTranslateService,
        private geschlechtPipe: GeschlechtPipe
    ) {}

    ngOnInit() {
        this.loadData();
    }

    onClick(beruf: StesBerufsdatenDTO) {
        this.onSelect.emit(beruf);
    }

    loadData() {
        this.spinnerService.activate(spinnerChannel);
        this.dataService.getBerufsdaten(this.stesId).subscribe(
            (response: BaseResponseWrapperStesBerufsdatenListDTOWarningMessages) => {
                this.createTableModel(response.data);
                this.spinnerService.deactivate(spinnerChannel);
            },
            () => {
                this.spinnerService.deactivate(spinnerChannel);
            }
        );
    }

    createTableModel(responseData: StesBerufsdatenListDTO) {
        const berufs = responseData.berufsdatenDTOList;
        const geschlecht = responseData.geschlecht;

        this.dataSource = berufs ? berufs.map(beruf => this.createTableRow(beruf, geschlecht)) : [];
    }

    createTableRow(data: StesBerufsdatenDTO, geschlecht: string) {
        const berufsTaetigkeit = this.dbTranslateService.translate(data.berufsTaetigkeitObject, this.geschlechtPipe.transform('bezeichnung', geschlecht));
        const berufsFunktion = data.berufsFunktionObject ? this.dbTranslateService.translate(data.berufsFunktionObject, 'text') : '';
        const qualifikation = data.qualifikationObject ? this.dbTranslateService.translate(data.qualifikationObject, 'text') : '';

        return {
            berufsTaetigkeit,
            dauer: data.dauer,
            berufsFunktion,
            qualifikation,
            ausgeuebtB: data.ausgeuebtB ? 'X' : '-',
            zuletztB: data.zuletztB ? 'X' : '-',
            gesuchtB: data.gesuchtB ? 'X' : '-',
            beruf: { ...data }
        };
    }
}
