import { Component, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { OsteDataRestService } from '@app/core/http/oste-data-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { StesBerufsdatenDTO } from '@app/shared/models/dtos-generated/stesBerufsdatenDTO';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Subscription } from 'rxjs';

@Component({
    selector: 'avam-anforderungen-skills-vergleichen-modal',
    templateUrl: './anforderungen-skills-vergleichen-modal.component.html',
    styleUrls: ['./anforderungen-skills-vergleichen-modal.component.scss']
})
export class AnforderungenSkillsVergleichenModalComponent implements OnInit, OnDestroy {
    formNumber = StesFormNumberEnum.ANFORDERUNGEN_SKILLS_VERGLEICHEN;

    @Input() stesId: string;
    @Input() osteId: string;

    beschreibung: string[] = [];
    qualifikationen: StesBerufsdatenDTO[] = [];

    modalToolboxConfiguration;
    toolboxChannel = 'anforderungen-skills-vergleichen-modal';
    oldToolboxChannel = '';
    toolboxClickAction: Subscription;

    constructor(
        private readonly modalService: NgbModal,
        private stesRestService: StesDataRestService,
        private osteRestService: OsteDataRestService,
        private toolboxService: ToolboxService,
        private renderer: Renderer2
    ) {
        this.oldToolboxChannel = ToolboxService.CHANNEL;
        ToolboxService.CHANNEL = this.toolboxChannel;
    }

    ngOnInit() {
        this.getData();
        this.setToolboxConfig();
        this.toolboxClickAction = this.subscribeToToolbox();
    }

    setToolboxConfig() {
        this.modalToolboxConfiguration = [
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)
        ];
    }

    subscribeToToolbox(): Subscription {
        return this.toolboxService.observeClickAction(this.toolboxChannel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            }
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.print();
            }
        });
    }

    print() {
        const pvTable = document.getElementsByTagName('avam-profilvergleich-table')[0];
        this.renderer.addClass(pvTable, 'd-none');
        PrintHelper.print();
        this.renderer.removeClass(pvTable, 'd-none');
    }

    formatText(beschreibung: string): string[] {
        return beschreibung ? beschreibung.split('\n') : [];
    }

    close() {
        ToolboxService.CHANNEL = this.oldToolboxChannel;
        this.modalService.dismissAll();
    }

    getData() {
        forkJoin(this.stesRestService.getBerufsdaten(this.stesId), this.osteRestService.searchByOste(this.osteId)).subscribe(([berufsdaten, oste]) => {
            this.beschreibung = this.formatText(oste.beschreibung);
            this.qualifikationen = berufsdaten.data.berufsdatenDTOList;
        });
    }

    ngOnDestroy() {
        if (this.toolboxClickAction) {
            this.toolboxClickAction.unsubscribe();
        }
        this.modalToolboxConfiguration = [];
    }
}
