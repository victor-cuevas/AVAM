import { Injectable } from '@angular/core';
import { AufgabenErfassenReactiveFormsService } from '@shared/components/unternehmen/geschaeftskontrolle/aufgaben-erfassen/aufgaben-erfassen-reactive-forms.service';
import { GeKoAufgabeDetailsDTO } from '@dtos/geKoAufgabeDetailsDTO';
import { AvamPersonalberaterAutosuggestComponent } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { AbstractControl, Validators } from '@angular/forms';
import { CodeDTO } from '@dtos/codeDTO';
import { FormModeEnum } from '@shared/enums/form-mode.enum';
import { GekoAufgabenCodes } from '@shared/models/geko-aufgaben-codes.model';
import { SortByPipe } from '@app/shared';
import { GekobereichCodeEnum } from '@modules/geko/utils/GekobereichCodeEnum';

@Injectable()
export class AufgabenErfassenHandlerService {
    benutzerstelleField: AbstractControl;
    statusOptionsCodes: CodeDTO[];
    statusOptions: any[];
    prioritaetOptions: any[];
    geschaeftsartenOptions: any[];
    codes: GekoAufgabenCodes;
    isEditMode: boolean;

    constructor(public reactiveForms: AufgabenErfassenReactiveFormsService, private sortByPipe: SortByPipe) {
        this.benutzerstelleField = this.reactiveForms.form.controls.benutzerstelle;
    }

    initCodes(codes: GekoAufgabenCodes, bereich: GekobereichCodeEnum): void {
        this.codes = codes;
        const geschaeftsarten = this.getGeschaeftsarten(codes.geschaeftsarten, bereich);
        this.geschaeftsartenOptions = this.sortByPipe.transform(geschaeftsarten.map(this.codeMapper()), 'label', false, true);
        this.prioritaetOptions = this.codes.priorities.map(this.codeMapper());
        this.statusOptions = this.sortByPipe.transform(this.codes.status.map(this.codeMapper()), 'label', false, true);
        this.statusOptionsCodes = this.codes.status;
    }
    getGeschaeftsarten(geschaeftsarten: CodeDTO[], bereich: GekobereichCodeEnum): CodeDTO[] {
        const codes = geschaeftsarten.filter(g => g.code && g.code.includes(bereich));
        return codes;
    }

    mapToForm(dto: GeKoAufgabeDetailsDTO): any {
        return {
            geschaeftsart: dto.geschaeftsart.codeId,
            prioritaet: dto.prioritaet.codeId,
            aufgabentext: dto.aufgabeText,
            faelligAm: dto.zuErledigenBis ? new Date(dto.zuErledigenBis) : null,
            benutzerstelle: dto.benutzerstelle,
            zuestaendig: dto.zustBenutzerDetail,
            initialisiertDurch: dto.initBenutzerDetail,
            status: dto.status.codeId
        };
    }

    mapToDto(dto: GeKoAufgabeDetailsDTO): GeKoAufgabeDetailsDTO {
        const controls = this.reactiveForms.form.controls;
        const newVals = {
            zuErledigenBis: controls.faelligAm.value,
            benutzerstelle: controls.benutzerstelle['benutzerstelleObject'],
            zustBenutzerDetail: controls.zuestaendig['benutzerObject'],
            initBenutzerDetail: controls.initialisiertDurch['benutzerObject'],
            geschaeftsart: {
                codeId: controls.geschaeftsart.value
            },
            prioritaet: {
                codeId: controls.prioritaet.value
            },
            aufgabeText: controls.aufgabentext.value
        };
        const updatedDto = { ...dto, ...newVals };
        if (this.isEditMode) {
            updatedDto.aufgabeId = dto.aufgabeId;
            updatedDto.status = {
                codeId: this.reactiveForms.form.controls.status.value
            };
        }
        return updatedDto;
    }

    updateBenutzerZustaendig(value: any): void {
        if (!!value) {
            this.reactiveForms.form.controls.benutzerstelle.setValue({
                code: value.benuStelleCode,
                benutzerstelleId: value.benutzerstelleId ? value.benutzerstelleId : null
            });
        }
    }

    onInputBenutzerZustaendig(event: any, zuestaendig: AvamPersonalberaterAutosuggestComponent): void {
        // for IE - onKeyup, for other browsers - onInput
        const value = event && event.target ? event.target.value : event;
        if (!value) {
            zuestaendig.benutzerDetail = null;
            this.setRequiredField(zuestaendig);
        } else if (value.benuStelleCode) {
            this.reactiveForms.form.controls.benutzerstelle.setValue({
                code: value.benuStelleCode,
                benutzerstelleId: value.benutzerstelleId ? value.benutzerstelleId : null
            });
        }
    }

    updateBenutzerstelleSuche(event: any): void {
        this.reactiveForms.form.controls.benutzerstelle.setValue({
            code: event.id,
            benutzerstelleId: event.benutzerstelleObj.benutzerstelleId ? event.benutzerstelleObj.benutzerstelleId : null
        });
    }

    updateBenutzerstelle(event: any, zuestaendig: AvamPersonalberaterAutosuggestComponent): void {
        const value = event && event.target ? event.target.value : event;
        if (!value) {
            this.setRequiredField(zuestaendig);
        }
    }

    setRequiredField(zuestaendig: AvamPersonalberaterAutosuggestComponent): void {
        if (!zuestaendig.benutzerDetail) {
            this.benutzerstelleField.setValidators(Validators.required);
        } else {
            this.benutzerstelleField.clearValidators();
        }
        this.benutzerstelleField.updateValueAndValidity();
    }

    setFaelligAmValidators(formMode: FormModeEnum, statusCodeId?: number): void {
        if (!this.statusOptionsCodes) {
            return;
        }
        this.reactiveForms.setFaelligAmValidators(formMode, this.statusOptionsCodes, statusCodeId);
    }

    setDefaultValues(formMode: FormModeEnum, statusCodeId?: number): void {
        this.isEditMode = formMode === FormModeEnum.EDIT;
        if (this.isEditMode && statusCodeId) {
            this.reactiveForms.setDefaultValues(formMode, this.statusOptionsCodes, this.prioritaetOptions, statusCodeId);
        } else {
            this.reactiveForms.setDefaultValues(formMode, this.statusOptionsCodes, this.prioritaetOptions);
        }
    }

    onLangChange(): void {
        this.geschaeftsartenOptions = this.sortByPipe.transform(this.geschaeftsartenOptions, 'label', false, true);
    }

    private codeMapper(): any {
        return (code: CodeDTO) => {
            return {
                value: code.codeId,
                labelFr: code.textFr,
                labelIt: code.textIt,
                labelDe: code.textDe,
                code: code.code,
                codeId: code.codeId
            };
        };
    }
}
