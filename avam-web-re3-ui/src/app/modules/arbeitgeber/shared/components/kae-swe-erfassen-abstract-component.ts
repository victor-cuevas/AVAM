import { Unsubscribable } from 'oblique-reactive';
import { BetriebsabteilungDTO } from '@dtos/betriebsabteilungDTO';
import { DropdownOption } from '@shared/services/forms/form-utils.service';
import { AbstractControl, FormGroup } from '@angular/forms';
import { CodeDTO } from '@dtos/codeDTO';
import { UnternehmenDetailsDTO } from '@dtos/unternehmenDetailsDTO';
import { ReferencedKaeSweObject } from '@modules/arbeitgeber/shared/services/kaeswe.service';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { Permissions } from '@shared/enums/permissions.enum';
import { ZahlstelleDTO } from '@dtos/zahlstelleDTO';
import { FacadeService } from '@shared/services/facade.service';
import { ToolboxAction, ToolboxActionEnum } from '@shared/services/toolbox.service';
import { AbbrechenModalComponent } from '@app/shared';
import { AbbrechenModalActionNavigation } from '@shared/classes/abbrechen-modal-action-navigation';
import { distinctUntilChanged, first, takeUntil } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import { AfterViewInit, ElementRef } from '@angular/core';

export abstract class KaeSweErfassenAbstractComponent extends Unsubscribable implements AfterViewInit {
    isBearbeiten = false;
    betriebsabteilungDTOs: BetriebsabteilungDTO[] = [];
    betriebsabteilungOptions: DropdownOption[] = [];
    statusOptions: DropdownOption[] = [];
    entscheiddurchSuchenTokens: any = {};
    freigabedurchSuchenTokens: any = {};
    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;
    vorgaenger: ReferencedKaeSweObject = { id: null, entscheidNr: null, statusCode: null };
    nachfolger: ReferencedKaeSweObject = { id: null, entscheidNr: null, statusCode: null };
    permissions: typeof Permissions = Permissions;

    unternehmenDetailsDTO: UnternehmenDetailsDTO;
    protected unternehmenId: number;
    protected transferAlkCodes: CodeDTO[] = [];
    protected aktivStatusCodeId: number;
    private onVorgaengerClickSubscribtion: Subscription;

    protected constructor(protected facadeService: FacadeService, protected interactionService: StesComponentInteractionService) {
        super();
    }

    abstract canDeactivate(): Observable<boolean> | Promise<boolean> | boolean;

    ngAfterViewInit(): void {
        this.onChanges();
    }

    onVorgaengerClicked(): void {
        this.prepareForOnVorgaengerClicked();
        if (this.canDeactivate()) {
            const modalRef = this.facadeService.openModalFensterService.openModal(AbbrechenModalComponent);
            modalRef.componentInstance.setModalAction(new AbbrechenModalActionNavigation(this.interactionService, modalRef.componentInstance.activeModal));
        } else {
            this.redirectToMeldung();
            this.unsubscribeVorgaengerClick();
        }
    }

    fillZahlstelle(formGroup: FormGroup, data: any): void {
        formGroup.controls.alkControl.setValue(data.alkZahlstellenNr);
        formGroup.controls.zahlstelleControl.setValue(data.kurzname);
        formGroup.markAsDirty();
    }

    isUnternehmenAktiv(): boolean {
        if (!this.unternehmenDetailsDTO || !this.unternehmenDetailsDTO.statusObject) {
            return true;
        }
        return this.unternehmenDetailsDTO.statusObject.codeId === this.aktivStatusCodeId;
    }

    protected abstract onChanges(): void;

    protected abstract hideNavigationTreeRoute(): void;

    protected abstract isStatusFreigabebereit(): boolean;

    protected observe(form: FormGroup, controlName: string, fctToCall: any): Subscription {
        return form
            .get(controlName)
            .valueChanges.pipe(distinctUntilChanged())
            .subscribe((value: any) => fctToCall(value));
    }

    protected observeAlk(form: FormGroup): Subscription {
        return this.observe(form, 'alkControl', (alk: any) => {
            const zahlstelleValue = form.controls.zahlstelleControl.value;
            this.setMandatoryAlkZahlstelleByStatusOnChanges(this.isStatusFreigabebereit(), alk, zahlstelleValue);
        });
    }

    protected observeZahlstelle(form: FormGroup): Subscription {
        return this.observe(form, 'zahlstelleControl', (zahlstelle: any) => {
            const alkValue = form.controls.alkControl.value;
            this.setMandatoryAlkZahlstelleByStatusOnChanges(this.isStatusFreigabebereit(), alkValue, zahlstelle);
        });
    }

    protected abstract setMandatoryAlkZahlstelleByStatusOnChanges(isFreigabebereit: boolean, alk, zahlstelle);

    protected onCancel(elementRef: ElementRef, afterFct: any): void {
        const visible = !!elementRef.nativeElement.offsetParent;
        if (visible && this.canDeactivate()) {
            this.interactionService.navigateAwayAbbrechen.pipe(first()).subscribe((res: boolean) => {
                if (res) {
                    this.hideNavigationTreeRoute();
                }
            });
        } else {
            this.hideNavigationTreeRoute();
        }
        afterFct();
    }

    protected setAlvAnerkanntValue(control: AbstractControl, value: number) {
        const abteilung = this.betriebsabteilungDTOs.find(a => a.betriebsabteilungId === value);
        if (abteilung) {
            control.setValue(abteilung.alvAnerkannt);
        }
    }

    protected getAlvAnerkanntValue(value: number): boolean {
        const abteilung = this.betriebsabteilungDTOs.find(a => a.betriebsabteilungId === value);
        if (abteilung) {
            return abteilung.alvAnerkannt;
        }
        return false;
    }

    protected getALKZahlstelleId(controls: { [key: string]: AbstractControl }): number {
        return this.getALKZahlstelleDto(controls).zahlstelleId;
    }

    protected getALKZahlstelleDto(controls: { [key: string]: AbstractControl }): ZahlstelleDTO {
        return controls.alkControl['alkZahlstelleObject'];
    }

    protected isPrintAction(action: ToolboxAction): boolean {
        return action.message.action === ToolboxActionEnum.PRINT;
    }

    protected isHistoryAction(action: ToolboxAction) {
        return action.message.action === ToolboxActionEnum.HISTORY;
    }

    protected isCopyAction(action: ToolboxAction) {
        return action.message.action === ToolboxActionEnum.COPY;
    }

    protected abstract redirectToMeldung(): void;

    private prepareForOnVorgaengerClicked(): void {
        this.unsubscribeVorgaengerClick();
        this.onVorgaengerClickSubscribtion = this.interactionService.navigateAwayAbbrechen.pipe(takeUntil(this.unsubscribe)).subscribe((onOkClicked: boolean) => {
            if (onOkClicked) {
                this.redirectToMeldung();
            }
            this.unsubscribeVorgaengerClick();
        });
    }

    private unsubscribeVorgaengerClick(): void {
        if (this.onVorgaengerClickSubscribtion) {
            this.onVorgaengerClickSubscribtion.unsubscribe();
        }
    }
}
