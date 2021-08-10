import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { NumberValidator } from '@shared/validators/number-validator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FacadeService } from '@shared/services/facade.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxService } from '@app/shared';
import { ToolboxActionEnum, ToolboxConfiguration } from '@shared/services/toolbox.service';
import { Unsubscribable } from 'oblique-reactive';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { AlertChannelEnum } from '@shared/components/alert/alert-channel.enum';
import { OsteEgovDTO } from '@dtos/osteEgovDTO';
import { StaatDTO } from '@dtos/staatDTO';
import { takeUntil } from 'rxjs/operators';
import PrintHelper from '@shared/helpers/print.helper';
import { UnternehmenErfassenDTO } from '@dtos/unternehmenErfassenDTO';
import { AuthenticationService } from '@core/services/authentication.service';
import { MeldungenVerifizierenWizardService } from '@shared/components/new/avam-wizard/meldungen-verifizieren-wizard.service';
import { TwoFieldsAutosuggestValidator } from '@shared/validators/two-fields-autosuggest-validator';
import { CommonInfoFieldsComponent } from '@shared/components/unternehmen/common/common-info-fields/common-info-fields.component';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { BaseResponseWrapperListUnternehmenResultDTOWarningMessages } from '@dtos/baseResponseWrapperListUnternehmenResultDTOWarningMessages';

@Component({
    selector: 'avam-jobroom-arbeitgeber-erfassen',
    templateUrl: './jobroom-arbeitgeber-erfassen.component.html',
    styleUrls: ['./jobroom-arbeitgeber-erfassen.component.scss']
})
export class JobroomArbeitgeberErfassenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @Input() osteEgovDTO: OsteEgovDTO;
    @Input() staatDto: StaatDTO;
    @ViewChild('korrespondenzAdresseFormComponent') korrespondenzAdresseFormComponent: CommonInfoFieldsComponent;
    @ViewChild('ngForm') public ngForm: FormGroupDirective;

    channel = 'JobroomArbeitgeberErfassenChannel';
    public standOrtAdresseForm: FormGroup;
    modalToolboxConfiguration: ToolboxConfiguration[];
    formNr = StesFormNumberEnum.JOBROOM_MELDUNG_ERFASSEN;
    alertChannel = AlertChannelEnum;
    originalChannel: string;

    constructor(
        private authService: AuthenticationService,
        private unternehmenRestService: UnternehmenRestService,
        private fb: FormBuilder,
        readonly modalService: NgbModal,
        private facadeService: FacadeService,
        private wizardService: MeldungenVerifizierenWizardService
    ) {
        super();
        this.originalChannel = ToolboxService.CHANNEL;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.subscribeToToolbox();
        this.showInitialMessages();
        this.generateForm();
    }

    ngAfterViewInit(): void {
        this.setDefaultValue();
    }

    ngOnDestroy() {
        this.facadeService.fehlermeldungenService.closeMessage();
        ToolboxService.CHANNEL = this.originalChannel;
        super.ngOnDestroy();
    }

    reset() {
        this.facadeService.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);
        this.setDefaultValue();
    }

    close(): void {
        this.modalService.dismissAll();
    }

    complete() {
        this.facadeService.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);
        if (!this.standOrtAdresseForm.valid) {
            this.facadeService.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger', AlertChannelEnum.MODAL);
            this.ngForm.onSubmit(undefined);
        } else {
            this.facadeService.spinnerService.activate(this.channel);
            this.unternehmenRestService
                .createUnternehmen(this.mapToDTO(this.standOrtAdresseForm.controls), true, this.alertChannel.MODAL)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(
                    (response: BaseResponseWrapperListUnternehmenResultDTOWarningMessages) => {
                        this.facadeService.spinnerService.deactivate(this.channel);
                        if (!!response && !!response.data) {
                            this.facadeService.notificationService.success('common.message.datengespeichert');
                            this.close();
                            this.wizardService.setOsteEgovAnlegenParamDTO(null);
                            this.wizardService.setUnternehmenId(response.data);
                            this.wizardService.movePosition(3);
                        }
                    },
                    () => this.facadeService.spinnerService.deactivate(this.channel)
                );
        }
    }

    private subscribeToToolbox() {
        this.modalToolboxConfiguration = ToolboxConfig.getJobroomArbeitgeberErfassenConfig();
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                }
                if (action.message.action === ToolboxActionEnum.EXIT) {
                    this.close();
                }
            });
    }

    private generateForm(): void {
        this.standOrtAdresseForm = this.fb.group({
            name: [null, [Validators.required, Validators.maxLength(32)]],
            name2: [null, Validators.maxLength(32)],
            name3: [null, Validators.maxLength(32)],
            strasse: [null, Validators.maxLength(50)],
            strasseNr: [null, Validators.maxLength(14)],
            plz: this.fb.group({
                postleitzahl: [null, TwoFieldsAutosuggestValidator.inputMaxLength(15, 'postleitzahl')],
                ort: [null, TwoFieldsAutosuggestValidator.inputMaxLength(40, 'ort')]
            }),
            plzPostfach: this.fb.group({
                postleitzahl: [null, TwoFieldsAutosuggestValidator.inputMaxLength(15, 'postleitzahl')],
                ort: [null, TwoFieldsAutosuggestValidator.inputMaxLength(40, 'ort')]
            }),
            land: [null, Validators.required],
            postfach: [null, [NumberValidator.isPositiveInteger, Validators.maxLength(6)]],
            ergaenzendeAngaben: null,
            branche: [null, Validators.required]
        });
        this.standOrtAdresseForm.setValidators(
            TwoFieldsAutosuggestValidator.plzPlzAuslandCrossValidator(
                'plz',
                'plzPostfach',
                'postleitzahl',
                'ort',
                'postleitzahl',
                'ort',
                this.korrespondenzAdresseFormComponent.plzAutosuggestComponent
            )
        );
    }

    private showInitialMessages() {
        this.facadeService.fehlermeldungenService.showMessage('common.button.jobroomfertigstellenansBFSsenden', 'info', this.alertChannel.MODAL);
    }

    private setDefaultValue() {
        if (this.osteEgovDTO) {
            this.standOrtAdresseForm.reset({
                name: this.osteEgovDTO.untName,
                strasse: this.osteEgovDTO.untStrasse,
                strasseNr: this.osteEgovDTO.untHausNr,
                postfach: !!this.osteEgovDTO.untPostfach ? this.osteEgovDTO.untPostfach : '',
                plz: {
                    postleitzahl: this.osteEgovDTO.untPlz ? this.osteEgovDTO.untPlz : '',
                    ort: this.osteEgovDTO.untOrt ? this.osteEgovDTO.untOrt : ''
                },
                plzPostfach: {
                    postleitzahl: this.osteEgovDTO.untPostfachPlz ? this.osteEgovDTO.untPostfachPlz : '',
                    ort: this.osteEgovDTO.untPostfachOrt ? this.osteEgovDTO.untPostfachOrt : ''
                }
            });
            this.standOrtAdresseForm.patchValue({ land: this.staatDto ? this.staatDto : '' });
        }
    }

    private mapToDTO(form): UnternehmenErfassenDTO {
        return {
            unternehmen: {
                name1: form.name.value,
                name2: form.name2.value,
                name3: form.name3.value,
                strasse: form.strasse.value,
                strasseNr: form.strasseNr.value,
                plzOrt: form.plz.plzWohnAdresseObject ? form.plz.plzWohnAdresseObject : null,
                plzOrtPostfach: form.plzPostfach.plzWohnAdresseObject ? form.plzPostfach.plzWohnAdresseObject : null,
                postfach: form.postfach.value,
                land: form.land.landAutosuggestObject,
                branche: form.branche.branchAutosuggestObj
            },
            mitteilungAnBFS: form.ergaenzendeAngaben.value,
            ansprechpersonDetailId: this.getCurrentUserBenutzerDetailId()
        };
    }

    private getCurrentUserBenutzerDetailId(): number {
        const currentUser = this.authService.getLoggedUser();
        return +currentUser.benutzerDetailId;
    }
}
