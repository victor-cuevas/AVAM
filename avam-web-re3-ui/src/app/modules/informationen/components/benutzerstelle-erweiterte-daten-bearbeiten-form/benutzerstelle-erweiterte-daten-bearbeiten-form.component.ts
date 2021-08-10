import { AfterViewInit, Component, Input, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
// prettier-ignore
import {BenutzerstelleErweiterteDatenModeService}
    from '@modules/informationen/components/benutzerstelle-erweiterte-daten-bearbeiten-form/benutzerstelle-erweiterte-daten-mode.service';
// prettier-ignore
import {BenutzerstelleErweiterteDatenHandlerService}
    from '@modules/informationen/components/benutzerstelle-erweiterte-daten-bearbeiten-form/benutzerstelle-erweiterte-daten-handler.service';
// prettier-ignore
import {BenutzerstelleErweiterteDatenReactiveFormsService}
    from '@modules/informationen/components/benutzerstelle-erweiterte-daten-bearbeiten-form/benutzerstelle-erweiterte-daten-reactive-forms.service';
import { Subscription } from 'rxjs';
import { FormModeEnum } from '@shared/enums/form-mode.enum';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { ActivatedRoute } from '@angular/router';
// prettier-ignore
import {BenutzerstelleErweiterteDaten}
    from '@modules/informationen/components/benutzerstelle-erweiterte-daten-bearbeiten-form/benutzerstelle-erweiterte-daten';
import { DropdownOption } from '@shared/services/forms/form-utils.service';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { BenutzerstelleObjectDTO } from '@dtos/benutzerstelleObjectDTO';
import { FacadeService } from '@shared/services/facade.service';
import { AvamLabelInputComponent } from '@app/library/wrappers/form/avam-label-input/avam-label-input.component';

@Component({
    selector: 'avam-benutzerstelle-erweiterte-daten-bearbeiten-form',
    templateUrl: './benutzerstelle-erweiterte-daten-bearbeiten-form.component.html',
    providers: [BenutzerstelleErweiterteDatenModeService, BenutzerstelleErweiterteDatenHandlerService, BenutzerstelleErweiterteDatenReactiveFormsService]
})
export class BenutzerstelleErweiterteDatenBearbeitenFormComponent implements OnInit, OnDestroy, DeactivationGuarded, AfterViewInit {
    @Input('data') data: BenutzerstelleErweiterteDaten;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('leiter') leiterInput: AvamLabelInputComponent;
    formGroup: FormGroup;
    currentFormMode: FormModeEnum;
    dto: BenutzerstelleObjectDTO;
    spracheOptions: DropdownOption[];
    isEdit = () => this.currentFormMode === FormModeEnum.EDIT;
    showVollzugsregionen = () => this.isEdit();
    isRavAdresseStatistikReadOnly: boolean;
    gueltibAbBisReadonlyState: string;
    private readonly all = 'all';
    private readonly true = 'TRUE';
    private modeSubscription: Subscription;

    constructor(
        private router: ActivatedRoute,
        private obliqueHelper: ObliqueHelperService,
        private handler: BenutzerstelleErweiterteDatenHandlerService,
        private mode: BenutzerstelleErweiterteDatenModeService,
        private facade: FacadeService
    ) {
        this.formGroup = handler.reactiveForms.form;
        this.modeSubscription = this.mode.mode$.subscribe((currentMode: FormModeEnum) => {
            this.currentFormMode = currentMode;
        });
    }

    ngOnInit(): void {
        this.obliqueHelper.ngForm = this.ngForm;
        this.router.data.subscribe(data => {
            this.mode.changeMode(data.mode);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.data.currentValue && this.data.dto) {
            this.dto = this.data.dto;
            this.spracheOptions = this.facade.formUtilsService.mapDropdownKurztext(this.data.spracheOptions);
            this.handle();
        }
    }

    ngAfterViewInit(): void {
        this.leiterInput.coreInput.inputElement.nativeElement.focus();
    }

    ngOnDestroy(): void {
        this.modeSubscription.unsubscribe();
    }

    canDeactivate(): boolean {
        return this.formGroup.dirty;
    }

    mapToDto(dto?: BenutzerstelleObjectDTO): BenutzerstelleObjectDTO {
        return dto ? this.handler.mapToDto(dto) : this.handler.mapToDto(this.dto);
    }

    reset(): void {
        if (this.formGroup.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                if (this.isEdit()) {
                    this.formGroup.reset(this.handler.mapToForm(this.dto));
                }
            });
        }
    }

    private handle(): void {
        switch (this.currentFormMode) {
            case FormModeEnum.CREATE:
                this.handleCreate(this.dto);
                break;
            case FormModeEnum.EDIT:
                this.handleEdit(this.dto);
                break;
            default:
                break;
        }
    }

    private handleEdit(dto: BenutzerstelleObjectDTO): void {
        this.isRavAdresseStatistikReadOnly = !this.dto.enabled || this.dto.enabled !== this.true;
        this.gueltibAbBisReadonlyState = !this.dto.enabledStatistik || this.dto.enabledStatistik !== this.true ? this.all : '';
        this.formGroup.reset(this.handler.mapToForm(dto));
    }

    private handleCreate(dto: BenutzerstelleObjectDTO): void {
        this.formGroup.reset(this.handler.mapToForm(dto));
    }
}
