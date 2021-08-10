import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Permissions } from '@shared/enums/permissions.enum';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { FormUtilsService } from '@app/shared';
import { AuthenticationService } from '@core/services/authentication.service';
import { UserDto } from '@dtos/userDto';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { MitteilungBfsDTO } from '@dtos/mitteilungBfsDTO';
import { takeUntil } from 'rxjs/operators';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { BenutzerDetailDTO } from '@dtos/benutzerDetailDTO';

@Component({
    selector: 'avam-mitteilung-senden',
    templateUrl: './mitteilung-senden.component.html'
})
export class MitteilungSendenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    @Input() unternehmenId: string;
    channel = 'mitteilung-senden-channel';
    messages: { type: string; text: string }[] = [];
    permissions: typeof Permissions = Permissions;
    formNumber = StesFormNumberEnum.BUR_MITTEILUNG_SENDEN;

    mitteilungForm: FormGroup;
    currentUser: UserDto;
    currentDate: string;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private modalService: NgbModal,
        private formUtils: FormUtilsService,
        private spinnerService: SpinnerService,
        private restService: UnternehmenRestService,
        private authService: AuthenticationService,
        private notificationService: NotificationService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.currentDate = this.formUtils.formatDateNgx(new Date(), FormUtilsService.GUI_DATE_FORMAT);
        this.currentUser = this.authService.getLoggedUser();
        this.buildForm();
    }

    public ngAfterViewInit(): void {
        this.mitteilungForm.controls.mitteilung.updateValueAndValidity();
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public senden(): void {
        this.messages = [];
        if (this.mitteilungForm.valid) {
            this.spinnerService.activate(this.channel);
            this.restService
                .sendMitteilung(this.unternehmenId, this.mapToDTO())
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(
                    (response: BaseResponseWrapperLongWarningMessages) => {
                        this.spinnerService.deactivate(this.channel);
                        OrColumnLayoutUtils.scrollTop();
                        if (!response.warning.length || !response.warning.filter(warning => warning.key === 'DANGER').length) {
                            this.notificationService.success('common.message.datengespeichert');
                            this.router.navigate([`./bearbeiten`], { relativeTo: this.route, queryParams: { mitteilungId: response.data } });
                            this.close();
                        }
                    },
                    () => {
                        this.spinnerService.deactivate(this.channel);
                        OrColumnLayoutUtils.scrollTop();
                    }
                );
        } else {
            this.ngForm.onSubmit(undefined);
            this.messages.push({ text: 'stes.error.bearbeiten.pflichtfelder', type: 'danger' });
        }
    }

    public close(): void {
        this.modalService.dismissAll();
    }

    public closeAlert(index: number): void {
        this.messages.splice(index, 1);
    }

    private buildForm(): void {
        this.mitteilungForm = this.fb.group({
            mitteilung: ['', Validators.required],
            currentUser: this.getBenutzerDTO()
        });
    }

    private getBenutzerDTO(): BenutzerDetailDTO {
        return {
            benutzerId: this.currentUser.benutzerId,
            benutzerDetailId: +this.currentUser.benutzerDetailId,
            benutzerLogin: this.currentUser.benutzerLogin,
            nachname: this.currentUser.name,
            vorname: this.currentUser.vorname,
            benuStelleCode: this.currentUser.benutzerstelleCode
        };
    }

    private mapToDTO(): MitteilungBfsDTO {
        return {
            unternehmenId: +this.unternehmenId,
            mitteilung: this.mitteilungForm.controls.mitteilung.value,
            ansprechpersonAvamId: this.currentUser.benutzerId,
            mitteilungsDatum: new Date()
        };
    }
}
