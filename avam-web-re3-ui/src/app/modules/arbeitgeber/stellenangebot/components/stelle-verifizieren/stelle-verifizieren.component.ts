import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MeldungenVerifizierenWizardService } from '@shared/components/new/avam-wizard/meldungen-verifizieren-wizard.service';
import { filter, finalize, takeUntil } from 'rxjs/operators';
import { FacadeService } from '@shared/services/facade.service';
import { Unsubscribable } from 'oblique-reactive';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToolboxService } from '@app/shared';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { CodeDTO } from '@dtos/codeDTO';
import PrintHelper from '@shared/helpers/print.helper';
import { MeldungAblehnenModalComponent } from '@modules/arbeitgeber/stellenangebot/pages/jobroom-meldung-verifizieren/meldung-ablehnen-modal/meldung-ablehnen-modal.component';
import { AlertChannelEnum } from '@shared/components/alert/alert-channel.enum';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OsteEgovDTO } from '@dtos/osteEgovDTO';
// prettier-ignore
import {
    MeldungWeiterleitenModalComponent
} from '@modules/arbeitgeber/stellenangebot/pages/jobroom-meldung-verifizieren/meldung-weiterleiten-modal/meldung-weiterleiten-modal.component';
import { JobroomAblehnenParamDTO } from '@dtos/jobroomAblehnenParamDTO';
import { BenutzerstelleResultDTO } from '@dtos/benutzerstelleResultDTO';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';

@Component({
    selector: 'avam-stelle-verifizieren',
    templateUrl: './stelle-verifizieren.component.html',
    styleUrls: ['./stelle-verifizieren.component.scss']
})
export class StelleVerifizierenComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('ablehnenModal') ablehnenModal: ElementRef;
    @ViewChild('weiterleitenModal') weiterleitenModal: ElementRef;
    stelleForm: FormGroup;
    anrede: CodeDTO;
    toolBoxId = 'jobroomStelleVerifizieren';

    constructor(
        public wizardService: MeldungenVerifizierenWizardService,
        private facadeService: FacadeService,
        private fb: FormBuilder,
        private unternehmenRestService: UnternehmenRestService,
        private infopanelService: AmmInfopanelService,
        readonly modalService: NgbModal
    ) {
        super();
    }

    ngOnInit(): void {
        this.stelleForm = this.fb.group({
            beschreibung: ''
        });
        this.infopanelService.updateInformation({
            title: '',
            subtitle: 'arbeitgeber.oste.stelleverifizieren',
            tableCount: undefined,
            hideInfobar: true
        });
        this.initToolbox();
    }

    ngAfterViewInit(): void {
        this.setSubscriptions();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.facadeService.toolboxService.sendConfiguration([]);
    }

    setSubscriptions() {
        this.facadeService.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.wizardService.transformData();
            this.stelleForm.controls.beschreibung.setValue(this.wizardService.osteEgovDTO.beschreibung);
        });
        this.wizardService.onDataChange$.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.anrede = this.wizardService.anredenDomain.find(item => item.code === this.wizardService.osteEgovDTO.kpAnredeCode);
            this.stelleForm.controls.beschreibung.setValue(this.wizardService.osteEgovDTO.beschreibung);
        });
    }

    openAblehnenModal() {
        this.facadeService.openModalFensterService.openModal(this.ablehnenModal);
    }

    openWeiterleitenModal() {
        this.facadeService.openModalFensterService.openXLModal(this.weiterleitenModal);
    }

    search(dto: JobroomAblehnenParamDTO) {
        this.wizardService.activateSpinner(MeldungAblehnenModalComponent.CHANNEL);
        this.unternehmenRestService
            .rejectMeldung(this.wizardService.osteEgovId, dto, AlertChannelEnum.NEST_MODAL)
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.wizardService.deactivateSpinner(MeldungAblehnenModalComponent.CHANNEL))
            )
            .subscribe(response => {
                if (!response.warning || (response.warning && !response.warning.length)) {
                    this.modalService.dismissAll();
                    this.wizardService.navigateToMeldungenUebersicht();
                    this.facadeService.notificationService.success('arbeitgeber.oste.feedback.stellewurdeabgelehnt');
                }
            });
    }

    weiterleiten(benutzerstelle: BenutzerstelleResultDTO) {
        this.facadeService.spinnerService.activate(MeldungWeiterleitenModalComponent.CHANNEL);
        this.unternehmenRestService
            .forwardMeldung(this.wizardService.osteEgovId, benutzerstelle.code, AlertChannelEnum.NEST_MODAL)
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.wizardService.deactivateSpinner(MeldungWeiterleitenModalComponent.CHANNEL))
            )
            .subscribe(response => {
                if (!response.warning || (response.warning && !response.warning.length)) {
                    this.modalService.dismissAll();
                    this.wizardService.navigateToMeldungenUebersicht();
                    this.facadeService.notificationService.success(
                        this.facadeService.translateService.instant('arbeitgeber.oste.message.stelleweitergeleitet', { 0: benutzerstelle.nameDe })
                    );
                }
            });
    }

    private initToolbox() {
        ToolboxService.CHANNEL = this.toolBoxId;
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getJobroomStelleVerifizierenConfig(), this.toolBoxId);
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => PrintHelper.print());
    }
}
