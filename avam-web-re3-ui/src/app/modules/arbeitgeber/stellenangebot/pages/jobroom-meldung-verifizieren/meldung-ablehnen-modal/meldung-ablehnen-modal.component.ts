import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Unsubscribable } from 'oblique-reactive';
import { AlertChannelEnum } from '@shared/components/alert/alert-channel.enum';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-meldung-ablehnen-modal',
    templateUrl: './meldung-ablehnen-modal.component.html'
})
export class MeldungAblehnenModalComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    static readonly CHANNEL = 'ablehnen-modal';
    @Input() grundDomain;
    @Input() osteEgovId;
    @Output('onSearch') onSearch = new EventEmitter();
    ablehnenForm: FormGroup;
    alertChannel = AlertChannelEnum;

    constructor(private fb: FormBuilder, readonly modalService: NgbModal, private facadeService: FacadeService) {
        super();
    }

    get spinnerChannel() {
        return MeldungAblehnenModalComponent.CHANNEL;
    }

    ngOnInit() {
        this.facadeService.fehlermeldungenService.closeMessage(AlertChannelEnum.NEST_MODAL);
        this.ablehnenForm = this.fb.group({
            grundId: [null, Validators.required],
            anmerkungen: null
        });
    }

    ngAfterViewInit(): void {
        // Workaround for oblique triangle
        setTimeout(() => this.ablehnenForm.controls.grundId.patchValue(null), 0);
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.facadeService.fehlermeldungenService.closeMessage(AlertChannelEnum.NEST_MODAL);
    }

    reset() {
        this.facadeService.fehlermeldungenService.closeMessage(AlertChannelEnum.NEST_MODAL);
        this.ablehnenForm.reset();
    }

    send() {
        const dto = {
            ablehnungGrundCode: this.ablehnenForm.get('grundId').value,
            ablehnungGrundText: this.ablehnenForm.get('anmerkungen').value
        };
        this.facadeService.fehlermeldungenService.closeMessage(AlertChannelEnum.NEST_MODAL);
        if (this.ablehnenForm.valid) {
            this.onSearch.emit(dto);
        } else {
            this.facadeService.fehlermeldungenService.showErrorMessage('arbeitgeber.oste.feedback.ablehnunggrundfehlt', AlertChannelEnum.NEST_MODAL);
        }
    }
}
