import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AuthenticationService } from '@core/services/authentication.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BenutzerstellenComponent, BenutzerStelleTableRowBuilder } from './benutzerstellen/benutzerstellen.component';
import { BenutzerStelleTableRow } from '@shared/models/dtos/benutzerstelle-table-row.interface';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { ChangePassword, ChangePasswordComponent } from './change-password/change-password.component';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { BenutzerstelleAendernService } from '@myAvam/services/benutzerstelle-aendern.service';
import { BaseResponseWrapperBooleanWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperBooleanWarningMessages';
import { JwtDTO } from '@shared/models/dtos-generated/jwtDTO';
import { Subscription } from 'rxjs';
import { StesDataService } from '@stes/services/stes-data.service';
import { BaseResponseWrapperJwtDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperJwtDTOWarningMessages';
import { AbstractBaseForm } from '@shared/classes/abstract-base-form';

@Component({ templateUrl: 'login.component.html' })
export class LoginComponent implements OnInit, OnDestroy {
    loginForm: FormGroup;
    loading = false;
    changePwdMsg = false;
    changePwdDto: ChangePasswordDto;
    submitted = false;
    returnUrl: string;

    readonly channel: string = 'app-login-search';
    readonly benutzerstelleAendernChannel: string = 'benutzerstelle-aendern';
    user: JwtDTO;
    @ViewChild('benutzerstellenModal') benutzerstellenModal: BenutzerstellenComponent;
    @ViewChild('changePasswordModal') changePasswordModal: ChangePasswordComponent;
    private benutzerstelleAendernSubscription: Subscription;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private readonly modalServiceOne: NgbModal,
        private readonly modalServiceTwo: NgbModal,
        private notificationService: NotificationService,
        private dbTranslateService: DbTranslateService,
        private benutzerstelleAendernService: BenutzerstelleAendernService,
        private spinnerService: SpinnerService,
        private stesDataService: StesDataService
    ) {}

    // convenience getter for easy access to form fields
    get f() {
        return this.loginForm.controls;
    }

    ngOnInit(): void {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });

        // reset login status
        this.authenticationService.logout();

        // get return url from route parameters or default to home
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';

        this.benutzerstelleAendernSubscription = this.benutzerstelleAendernService.subject.subscribe(
            (dto: JwtDTO) => {
                localStorage.setItem('currentUser', JSON.stringify(dto));
                this.user = dto;
                this.startSession();
                this.spinnerService.deactivate(this.benutzerstelleAendernChannel);
            },
            () => this.spinnerService.deactivate(this.benutzerstelleAendernChannel)
        );
    }

    ngOnDestroy(): void {
        if (this.benutzerstelleAendernSubscription) {
            this.benutzerstelleAendernSubscription.unsubscribe();
        }
    }

    public login(): void {
        this.submitted = true;

        // stop here if form is invalid
        if (!this.validForm()) {
            return;
        }

        this.loading = true;

        this.spinnerActivate();

        this.authenticationService
            .login(this.f.username.value, this.f.password.value)
            .pipe(first())
            .subscribe(
                response => {
                    this.user = response.data;
                    if (this.user) {
                        if (this.user.userDto.benutzerstelleList.length > 1) {
                            this.displaySelectBenutzerstelle();
                        } else {
                            this.logSingleBenutzerstelle();
                        }
                    } else {
                        this.close();
                        if (response.warning && this.isPasswordExpired(response)) {
                            this.displayChangePassword();
                        }
                    }
                    this.spinnerDeactivate();
                },
                () => {
                    this.close();
                    this.spinnerDeactivate();
                }
            );
    }

    public changePassword(): void {
        this.submitted = true;

        // stop here if form is invalid
        if (!this.validForm()) {
            return;
        }

        this.loading = true;

        this.displayChangePassword();
    }

    private isPasswordExpired(response: BaseResponseWrapperJwtDTOWarningMessages) {
        return response.warning.find(elem => {
            if (Array.isArray(elem.values)) {
                return elem.values.find(v => v.key === 'login.error.racfError.changePassword');
            } else {
                return elem.values.key === 'login.error.racfError.changePassword';
            }
        });
    }

    public benutzerstelleSelected(benutzerstelle: BenutzerStelleTableRow): void {
        this.spinnerService.activate(this.benutzerstelleAendernChannel);
        this.benutzerstelleAendernService.changeBenutzerstelle(this.user, benutzerstelle, true);
        this.stesDataService.clearResponseDTOs();
    }

    public close(): void {
        this.modalServiceOne.dismissAll();
        this.modalServiceTwo.dismissAll();
        this.authenticationService.logout();
        this.loading = false;
    }

    private displaySelectBenutzerstelle(): void {
        this.modalServiceOne.open(this.benutzerstellenModal, {
            ariaLabelledBy: 'modal-basic-title',
            windowClass: 'hugeModal',
            backdrop: 'static'
        });
    }

    private logSingleBenutzerstelle(): void {
        this.benutzerstelleSelected(new BenutzerStelleTableRowBuilder(this.dbTranslateService).build(this.user.userDto.benutzerstelleList[0]));
    }

    private startSession(): void {
        this.loading = false;
        this.authenticationService.emitLoginEvent();
        this.modalServiceOne.dismissAll();
        this.router.navigate([this.returnUrl]);
    }

    private displayChangePassword(): void {
        this.modalServiceTwo.open(this.changePasswordModal, {
            ariaLabelledBy: 'modal-basic-title',
            windowClass: 'hugeModal',
            backdrop: 'static'
        });
    }

    private setNewPassword(changePwd: ChangePassword): void {
        this.changePwdDto = {
            username: this.f.username.value,
            password: this.f.password.value,
            newPassword: changePwd.newPassword,
            confirmNewPassword: changePwd.confirmNewPassword
        };

        this.spinnerActivate();

        this.authenticationService.changePassword(this.changePwdDto).subscribe(
            (msg: BaseResponseWrapperBooleanWarningMessages) => {
                this.changePwdMsg = msg.data == null ? false : msg.data;
                if (!AbstractBaseForm.hasDangerWarning(msg.warning)) {
                    this.close();
                }

                if (this.changePwdMsg) {
                    this.loginForm.setValue({
                        username: this.f.username.value,
                        password: changePwd.newPassword
                    });
                    this.notificationService.success('login.feedback.changePassword.success');
                    this.login();
                }
                this.spinnerDeactivate();
            },
            () => {
                this.changePwdMsg = false;
                this.spinnerDeactivate();
            }
        );
    }

    private validForm(): boolean {
        if (this.loginForm.invalid) {
            if (!this.f.username.value) {
                this.notificationService.warning('Benutzer-ID muss zwingend eingegeben werden');
            }
            if (!this.f.password.value) {
                this.notificationService.warning('Passwort muss zwingend eingegeben werden');
            }
            return false;
        }
        return true;
    }

    private spinnerActivate() {
        this.spinnerService.activate(this.channel);
    }

    private spinnerDeactivate() {
        this.spinnerService.deactivate(this.channel);
    }
}

export interface ChangePasswordDto extends ChangePassword {
    username: string;
}
