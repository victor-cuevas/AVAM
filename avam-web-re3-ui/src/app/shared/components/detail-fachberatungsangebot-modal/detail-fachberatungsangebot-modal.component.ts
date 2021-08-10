import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { Subscription } from 'rxjs';
import PrintHelper from '@app/shared/helpers/print.helper';

export interface FachberatungsangebotDetails {
    fachberatungsbereichObject: CodeDTO;
    bezeichnung: string;
    angebotsNr: number;
    zielpublikum: string;
    initialisierung: string;
    leistung: string;
}

@Component({
    selector: 'avam-detail-fachberatungsangebot-modal',
    templateUrl: './detail-fachberatungsangebot-modal.component.html',
    styleUrls: ['./detail-fachberatungsangebot-modal.component.scss']
})
export class DetailFachberatungsangebotModalComponent implements OnInit, OnDestroy {
    fachberatungsangebotForm: FormGroup;
    formNumber = StesFormNumberEnum.FACHBERATUNGSANGEBOT_DETAIL;
    modalToolboxConfiguration: ToolboxConfiguration[];

    toolboxClickActionSub: Subscription;
    toolboxChannel = 'fachberatungsangebot-details-modal';
    oldToolboxChannel = '';

    @Input() fbDetails: FachberatungsangebotDetails;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    constructor(
        private obliqueHelper: ObliqueHelperService,
        private formBuilder: FormBuilder,
        private dbTranslateService: DbTranslateService,
        private readonly modalService: NgbModal,
        private toolboxService: ToolboxService
    ) {
        this.oldToolboxChannel = ToolboxService.CHANNEL;
        ToolboxService.CHANNEL = this.toolboxChannel;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.createForm();
        this.setForm();
        this.setToolboxConfig();
        this.toolboxClickActionSub = this.subscribeToToolbox();
    }

    setToolboxConfig() {
        this.modalToolboxConfiguration = [new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false), new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)];
    }

    subscribeToToolbox(): Subscription {
        return this.toolboxService.observeClickAction(this.toolboxChannel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            }
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
        });
    }

    createForm() {
        this.fachberatungsangebotForm = this.formBuilder.group({
            beratungsbereich: null,
            bezeichnung: null,
            angebotsNr: null,
            zielpublikum: null,
            initialisierung: null,
            leistung: null
        });
    }

    setForm() {
        if (this.fbDetails) {
            this.fachberatungsangebotForm.setValue(this.mapToForm(this.fbDetails));
        }
    }

    mapToForm(fbDetails: FachberatungsangebotDetails) {
        return {
            beratungsbereich: fbDetails.fachberatungsbereichObject ? this.dbTranslateService.translate(fbDetails.fachberatungsbereichObject, 'text') : '',
            bezeichnung: fbDetails.bezeichnung ? fbDetails.bezeichnung : '',
            angebotsNr: fbDetails.angebotsNr ? fbDetails.angebotsNr : null,
            zielpublikum: fbDetails.zielpublikum ? fbDetails.zielpublikum : '',
            initialisierung: fbDetails.initialisierung ? fbDetails.initialisierung : '',
            leistung: fbDetails.leistung ? fbDetails.leistung : ''
        };
    }

    close() {
        ToolboxService.CHANNEL = this.oldToolboxChannel;
        this.modalService.dismissAll();
    }

    ngOnDestroy() {
        if (this.toolboxClickActionSub) {
            this.toolboxClickActionSub.unsubscribe();
        }
        this.modalToolboxConfiguration = [];
    }
}
