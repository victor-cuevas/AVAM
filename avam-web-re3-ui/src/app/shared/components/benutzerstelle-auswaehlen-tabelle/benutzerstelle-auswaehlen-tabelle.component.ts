import { Component, OnInit, Input, OnChanges, EventEmitter, Output, ViewChild, ElementRef, OnDestroy, SimpleChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BenutzerstelleResultDTO } from '@app/shared/models/dtos-generated/benutzerstelleResultDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { Subscription } from 'rxjs';
import { OpenModalFensterService } from '@shared/services/open-modal-fenster.service';
import { BenutzerstelleAuswaehlenTabelleInterface } from './benutzerstelle-auswaehlen-tabelle.interface';
import { BenuAuswaehlenTableComponent } from '@shared/components/benutzerstelle-auswaehlen-tabelle/benu-auswaehlen-table/benu-auswaehlen-table.component';

@Component({
    selector: 'app-benutzerstelle-auswaehlen-tabelle',
    templateUrl: './benutzerstelle-auswaehlen-tabelle.component.html',
    styleUrls: ['./benutzerstelle-auswaehlen-tabelle.component.scss']
})
export class BenutzerstelleAuswaehlenTabelleComponent implements OnInit, OnChanges, OnDestroy {
    benutzerstellenTableData = [];

    @Input() showHeader = true;
    @Input() benutzerstellenData: BenutzerstelleResultDTO[] = [];
    @Input() isMultiselect = false;
    @Input() selectedBenutzerstellen: number[] = [];
    @Input() showBadge: boolean;
    @Output() benutzerstelleIdEmitter = new EventEmitter();
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('benuAuswaehlenTable') benuAuswaehlenTable: BenuAuswaehlenTableComponent;

    observeClickActionSub: Subscription;

    constructor(
        private readonly modalService: NgbModal,
        private dbTranslateService: DbTranslateService,
        private toolboxService: ToolboxService,
        private openModalFensterService: OpenModalFensterService
    ) {}

    ngOnInit() {
        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openModalFensterService.openPrintModal(this.modalPrint, this.benutzerstellenTableData);
            }
        });
    }

    ngOnDestroy() {
        this.observeClickActionSub.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges) {
        const benutzerstellenData = changes.benutzerstellenData.currentValue;
        this.benutzerstellenTableData = [];

        benutzerstellenData.forEach(item => {
            this.benutzerstellenTableData.push(this.buildRow(item));
        });
    }

    buildRow(benutzerstelleDto: BenutzerstelleResultDTO) {
        const benutzerstelleObj = benutzerstelleDto;
        const benutzerstelle = this.dbTranslateService.translate(benutzerstelleDto, 'name');
        const id = benutzerstelleDto.code;
        const typ = this.dbTranslateService.translate(benutzerstelleDto.typeObject, 'text');
        const strassenr = `${this.dbTranslateService.translate(benutzerstelleDto, 'strasse')} ${benutzerstelleDto.strasseNr}`;
        const ort = this.dbTranslateService.translate(benutzerstelleDto.plzObject, 'ort');
        const telefon = benutzerstelleDto.telefonNr;

        return { benutzerstelleObj, benutzerstelle, id, typ, strassenr, ort, telefon };
    }

    itemSelected(item: BenutzerstelleAuswaehlenTabelleInterface) {
        this.benutzerstelleIdEmitter.emit(item);
        this.close();
    }

    close() {
        this.modalService.dismissAll();
    }
}
