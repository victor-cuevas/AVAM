import { Component, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs/index';
import { DbTranslateService } from '../../../../../shared/services/db-translate.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { passwordValidator } from '../../../../../shared/validators/login-password-validator';
import { StesFormNumberEnum } from '../../../../../shared/enums/stes-form-number.enum';

@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
    changePasswordToolboxId = 'changePassword-modal';
    changePasswordDto: ChangePassword;
    changePasswordForm: FormGroup;
    error = null;
    @Output() emitChangePassword: EventEmitter<ChangePassword> = new EventEmitter();
    @Output() closeChangePassword: EventEmitter<boolean> = new EventEmitter();
    modalToolboxConfiguration: ToolboxConfiguration[];

    private observeClickAction: Subscription;

    constructor(private formBuilder: FormBuilder, private dbTranslateService: DbTranslateService, private toolboxService: ToolboxService) {
        ToolboxService.CHANNEL = 'change-password';
    }

    ngOnInit(): void {
        this.initForm();
        this.modalToolboxConfiguration = [new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false), new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)];
        this.observeClickAction = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            }
        });
    }

    initForm() {
        this.changePasswordForm = this.formBuilder.group({
            currentPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required, passwordValidator]],
            confirmNewPassword: ['', [Validators.required, passwordValidator]]
        });
    }

    ngOnDestroy() {
        if (this.observeClickAction) {
            this.observeClickAction.unsubscribe();
        }
    }

    @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
        if (event.key.startsWith('Esc')) {
            this.close();
        }
    }

    close() {
        this.closeChangePassword.emit(true);
    }

    getFormNr(): string {
        return StesFormNumberEnum.PASSWORT_AENDERN;
    }

    changePassword(): void {
        if (this.changePasswordForm.valid) {
            this.error = null;
            this.emitChangePassword.emit(
                (this.changePasswordDto = {
                    password: this.changePasswordForm.value.currentPassword,
                    newPassword: this.changePasswordForm.value.newPassword,
                    confirmNewPassword: this.changePasswordForm.value.confirmNewPassword
                })
            );
        } else {
            this.error = 'login.error.racfError.169';
        }
    }

    matchNewPassword() {
        if (this.changePasswordForm.invalid) {
            return false;
        }
        if (this.changePasswordForm.value.newPassword !== this.changePasswordForm.value.confirmNewPassword) {
            this.error = 'login.error.passwordMatch';
            return true;
        }
        this.error = null;
        return false;
    }
}

export interface ChangePassword {
    password: string;
    newPassword: string;
    confirmNewPassword: string;
}
