import { AbstractControl, FormGroup } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from '@core/services/authentication.service';
import { Injectable } from '@angular/core';
import { AvamPersonalberaterAutosuggestComponent } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { DomainEnum } from '@app/shared/enums/domain.enum';

@Injectable()
export class GekoSearchHelper {
    private readonly modalOpts: NgbModalOptions = { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-xl', backdrop: 'static' };

    constructor(private readonly modalService: NgbModal, private authenticationService: AuthenticationService) {}

    initBenutzerVerantwortlichBenutzerstelle(searchFormGroup: FormGroup, benutzerVerantwortlich: AvamPersonalberaterAutosuggestComponent, fromGekoMeldungen?: boolean): void {
        benutzerVerantwortlich.appendCurrentUser();
        const currentUser = this.authenticationService.getLoggedUser();
        if (currentUser) {
            searchFormGroup.controls.benutzerstellenId.setValue({
                code: currentUser.benutzerstelleCode,
                benutzerstelleId: currentUser.benutzerstelleId
            });
        }
        if (fromGekoMeldungen) {
            searchFormGroup.controls.benutzerstellenId.setValue(null);
        }
    }

    openBenutzerstelleSuche(benutzerstellenSuche: any): void {
        this.modalService.open(benutzerstellenSuche, this.modalOpts);
    }

    updateBenutzerstelleSuche(searchFormGroup: FormGroup, event: any): void {
        searchFormGroup.controls.benutzerstellenId.setValue({ code: event.id, benutzerstelleId: event.benutzerstelleObj.benutzerstelleId });
    }

    updateBenutzerVerantwortlich(searchFormGroup: FormGroup, value: any) {
        if (!!value) {
            searchFormGroup.controls.benutzerstellenId.setValue({ code: value.benuStelleCode, benutzerstelleId: this.getSafeId(value.benutzerstelleId) });
        }
    }

    onInputBenutzerInitialisiert(searchFormGroup: FormGroup, event: any) {
        // for IE - onKeyup, for other browsers - onInput
        const value = event && event.target ? event.target.value : event;
        if (value === '') {
            // workaround for the "undefined undefined" displaying if the state is loaded from cache
            searchFormGroup.controls['benutzerInitialisiert'].reset();
            return;
        }
    }

    onInputBenutzerVerantwortlich(searchFormGroup: FormGroup, benutzerVerantwortlich: AvamPersonalberaterAutosuggestComponent, event: any) {
        // for IE - onKeyup, for other browsers - onInput
        const value = event && event.target ? event.target.value : event;
        if (value === '') {
            // workaround for the "undefined undefined" displaying if the state is loaded from cache
            searchFormGroup.controls['benutzerVerantwortlich'].reset();
            return;
        }
        if (!value) {
            searchFormGroup.controls.benutzerstellenId.setValue(null);
            benutzerVerantwortlich.benutzerDetail = null;
        } else if (value.benuStelleCode) {
            searchFormGroup.controls.benutzerstellenId.setValue({ code: value.benuStelleCode, benutzerstelleId: this.getSafeId(value.benutzerstelleId) });
        }
    }

    isUserLogged(): boolean {
        const currentUser = this.authenticationService.getLoggedUser();
        return currentUser !== null && currentUser !== undefined;
    }

    getBenutzerstelleSuchenTokens(): any {
        const currentUser = this.authenticationService.getLoggedUser();
        return {
            benutzerstelleId: `${currentUser.benutzerstelleId}`,
            vollzugsregionTyp: DomainEnum.STES
        };
    }

    getBenutzerSuchenTokens(): any {
        const currentUser = this.authenticationService.getLoggedUser();
        return {
            myBenutzerstelleId: `${currentUser.benutzerstelleId}`,
            myVollzugsregionTyp: DomainEnum.STES
        };
    }

    checkBenutzerControl(control: AbstractControl) {
        // reset benutzer control values or set them the to valid objects
        const benutzerObject = control['benutzerObject'];
        if (benutzerObject && benutzerObject.benutzerId && benutzerObject.benutzerId > 0) {
            control.setValue(benutzerObject);
        } else {
            control.reset();
        }
    }

    getSafeId(value: any) {
        return !value || value === -1 ? null : value;
    }
}
