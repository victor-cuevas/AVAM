import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ToolboxService } from '@app/shared';
import { filter, takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { Unsubscribable } from 'oblique-reactive';
import { BenutzerstelleResultDTO } from '@dtos/benutzerstelleResultDTO';
import { FacadeService } from '@shared/services/facade.service';
import { BenutzerstelleAuswaehlenTabelleInterface } from '@shared/components/benutzerstelle-auswaehlen-tabelle/benutzerstelle-auswaehlen-tabelle.interface';
import { Router } from '@angular/router';
import { buildBenutzerstellePath } from '@shared/services/build-route-path.function';
import { hasObjKey } from '@shared/services/utility.function';

@Component({
    selector: 'avam-benutzerstellen-suchen-result',
    templateUrl: './benutzerstellen-suchen-result.component.html'
})
export class BenutzerstellenSuchenResultComponent extends Unsubscribable implements OnInit, OnChanges, OnDestroy {
    static readonly MODAL_PRINT_OPTIONS: NgbModalOptions = { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' };
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @Input('resultsData') resultsData: BenutzerstelleResultDTO[];
    @Input('showBadge') showBadge: boolean;
    @Input('tableStateKey') tableStateKey: string;
    private readonly toolboxChannel = 'benutzerstelleSuchenResult';
    benutzerstellenTableData = [];

    constructor(private toolboxService: ToolboxService, protected modalService: NgbModal, private facadeService: FacadeService, private router: Router) {
        super();
        ToolboxService.CHANNEL = this.toolboxChannel;
    }

    ngOnInit() {
        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.modalService.open(this.modalPrint, BenutzerstellenSuchenResultComponent.MODAL_PRINT_OPTIONS);
            });
        this.toolboxService.sendConfiguration(ToolboxConfig.getBenutzerstellenSuchenConfig());
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.benutzerstellenTableData = [];
        if (changes.resultsData && changes.resultsData.currentValue) {
            const benutzerstellenData = changes.resultsData.currentValue;
            benutzerstellenData.forEach(item => {
                this.benutzerstellenTableData.push(this.buildRow(item));
            });
        }
    }

    buildRow(benutzerstelleDto: BenutzerstelleResultDTO): BenutzerstelleAuswaehlenTabelleInterface {
        const benutzerstelleObj = benutzerstelleDto;
        const benutzerstelle = this.facadeService.dbTranslateService.translate(benutzerstelleDto, 'name');
        const id = benutzerstelleDto.code;
        const typ = this.facadeService.dbTranslateService.translate(benutzerstelleDto.typeObject, 'text');
        const strassenr = `${this.facadeService.dbTranslateService.translate(benutzerstelleDto, 'strasse')} ${benutzerstelleDto.strasseNr}`;
        const ort = this.facadeService.dbTranslateService.translate(benutzerstelleDto.plzObject, 'ort');
        const telefon = benutzerstelleDto.telefonNr;

        return { benutzerstelleObj, benutzerstelle, id, typ, strassenr, ort, telefon };
    }

    ngOnDestroy(): void {
        this.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    openBenutzerstelle(benutzerstelle: BenutzerstelleAuswaehlenTabelleInterface): void {
        if (hasObjKey(benutzerstelle, 'benutzerstelleObj.benutzerstelleId')) {
            this.router.navigate([buildBenutzerstellePath(benutzerstelle.benutzerstelleObj.benutzerstelleId)]);
        }
    }
}
