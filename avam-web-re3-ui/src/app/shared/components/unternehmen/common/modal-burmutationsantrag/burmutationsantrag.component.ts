import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UnternehmenResponseDTO } from '@dtos/unternehmenResponseDTO';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormUtilsService, GenericConfirmComponent } from '@app/shared';
import { AuthenticationService } from '@core/services/authentication.service';
import { BenutzerstellenRestService } from '@core/http/benutzerstellen-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { AvamPersonalberaterAutosuggestComponent } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { finalize, takeUntil } from 'rxjs/operators';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { UnternehmenErfassenDTO } from '@dtos/unternehmenErfassenDTO';
import { BaseResponseWrapper } from '@dtos/baseResponseWrapper';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';

@Component({
    selector: 'avam-burmutationsantrag',
    templateUrl: './burmutationsantrag.component.html',
    styleUrls: ['./burmutationsantrag.component.scss']
})
export class BurmutationsantragComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('benutzerstelleChild') benutzerstelleChild: AvamPersonalberaterAutosuggestComponent;
    @Input() bisherData: UnternehmenResponseDTO;
    @Input() neuData: UnternehmenResponseDTO;
    public burmutationsantragForm: FormGroup;
    public channel = 'unternehmen-mutationsantrag';
    erfasstam: any;
    benutzerObject: any;
    alertList: {
        isShown: boolean;
        messageText: string;
        messageType: string;
    }[] = [];
    currentUser: any;

    constructor(
        private spinnerService: SpinnerService,
        private unternehmenRestService: UnternehmenRestService,
        private authenticationService: AuthenticationService,
        private fb: FormBuilder,
        private readonly modalService: NgbModal,
        private formUtils: FormUtilsService,
        private fehlermeldungService: FehlermeldungenService,
        private readonly benutzerstellenRestService: BenutzerstellenRestService,
        private translateService: TranslateService,
        private readonly notificationService: NotificationService
    ) {
        super();
    }

    ngOnInit() {
        this.alertList.push({
            isShown: true,
            messageText: this.translateService.instant('unternehmen.burmutationsantrag.info'),
            messageType: 'info'
        });
        this.generateForm();
        this.initDefaultValues();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    close(unternehmenData?) {
        if (this.burmutationsantragForm.dirty) {
            const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
            modalRef.result.then(result => {
                if (result) {
                    this.modalService.dismissAll(unternehmenData);
                }
            });
            modalRef.componentInstance.titleLabel = 'common.message.ungespeicherteAnderungen';
            modalRef.componentInstance.promptLabel = 'i18n.validation.unsavedChanges';
            modalRef.componentInstance.primaryButton = 'common.button.jaAbbrechen';
            modalRef.componentInstance.secondaryButton = 'i18n.common.no';
        } else {
            this.modalService.dismissAll(unternehmenData);
        }
    }

    processSave() {
        this.spinnerService.activate(this.channel);
        const unternehmenErfassenDTO: UnternehmenErfassenDTO = {
            unternehmen: this.neuData,
            mitteilungAnBFS: this.burmutationsantragForm.controls.mitteilungBFS.value
        };
        this.unternehmenRestService
            .sendBurMutationsantrag(unternehmenErfassenDTO, this.translateService.currentLang)
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => {
                    this.spinnerService.deactivate(this.channel);
                })
            )
            .subscribe((response: BaseResponseWrapper) => {
                if (!response.warning.length || !response.warning.filter(warning => warning.key === 'DANGER').length) {
                    this.notificationService.success('common.message.datengespeichert');
                    this.modalService.dismissAll(this.neuData);
                } else {
                    response.warning.forEach(warningData => {
                        this.fehlermeldungService.deleteMessage(warningData.values.key, warningData.key.toLowerCase());
                        this.alertList.push({ isShown: true, messageText: warningData.values.key, messageType: warningData.key.toLowerCase() });
                    });
                }
            });
    }

    getFormNr(): string {
        return StesFormNumberEnum.UNTERNEHMEN_BURMUTATIONSANTRAG;
    }

    closeMessage(index: number): void {
        this.alertList[index].isShown = false;
    }

    private initDefaultValues() {
        const currentUser = this.getCurrentUserForAutosuggestDto();
        this.burmutationsantragForm.controls.benutzerstelle.setValue(currentUser);
        this.erfasstam = this.formUtils.formatDateNgx(this.bisherData.erfasstAm, FormUtilsService.GUI_DATE_FORMAT);
    }

    private generateForm() {
        this.burmutationsantragForm = this.fb.group({
            mitteilungBFS: null,
            benutzerstelle: null
        });
    }

    private getCurrentUserForAutosuggestDto() {
        const currentUser = this.authenticationService.getLoggedUser();
        return {
            benutzerId: currentUser.benutzerId,
            benutzerDetailId: currentUser.benutzerDetailId,
            benutzerLogin: currentUser.benutzerLogin,
            nachname: currentUser.name,
            vorname: currentUser.vorname,
            benuStelleCode: currentUser.benutzerstelleCode,
            benutzerstelleId: currentUser.benutzerstelleId
        };
    }
}
