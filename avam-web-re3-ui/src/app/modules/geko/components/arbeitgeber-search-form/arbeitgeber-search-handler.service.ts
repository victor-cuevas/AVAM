import { Injectable } from '@angular/core';
import { ArbeitgeberSearchReactiveFormsService } from '@modules/geko/components/arbeitgeber-search-form/arbeitgeber-search-reactive-forms.service';
import { GeKoGeschaeftSuchenDTO } from '@dtos/geKoGeschaeftSuchenDTO';
import { FacadeService } from '@shared/services/facade.service';
import { GeschaeftArbeitgeberSuchenFormData } from '@modules/geko/components/arbeitgeber-search-form/geschaeft-arbeitgeber-suchen-form.data';

@Injectable()
export class ArbeitgeberSearchHandlerService {
    constructor(public reactiveFormsService: ArbeitgeberSearchReactiveFormsService, private facadeService: FacadeService) {}

    mapToForm(dto: GeKoGeschaeftSuchenDTO): GeschaeftArbeitgeberSuchenFormData {
        return {
            geschaeftsartId: dto.geschaeftsartId,
            sachstandId: dto.sachstandId,
            geschaeftsterminVon: dto.dateFrom,
            geschaeftsterminBis: dto.dateUntil,
            erstelltAmVon: dto.dateErfasstFrom,
            erstelltAmBis: dto.dateErfasstUntil,
            isBearbeiter: dto.isBearbeiter,
            isFreigeber: dto.isFreigeber,
            fallbearbeiterId: dto.benutzerId,
            benutzerstelleId: dto.benutzerstelleId
        } as GeschaeftArbeitgeberSuchenFormData;
    }

    mapToDTO(): GeKoGeschaeftSuchenDTO {
        return {
            geschaeftsartId: this.reactiveFormsService.searchForm.get('geschaeftsartId').value,
            sachstandId: this.reactiveFormsService.searchForm.get('sachstandId').value,
            dateFrom: this.facadeService.formUtilsService.parseDate(this.reactiveFormsService.searchForm.get('geschaeftsterminVon').value),
            dateUntil: this.facadeService.formUtilsService.parseDate(this.reactiveFormsService.searchForm.get('geschaeftsterminBis').value),
            dateErfasstFrom: this.facadeService.formUtilsService.parseDate(this.reactiveFormsService.searchForm.get('erstelltAmVon').value),
            dateErfasstUntil: this.facadeService.formUtilsService.parseDate(this.reactiveFormsService.searchForm.get('erstelltAmBis').value),
            benutzerId: this.reactiveFormsService.searchForm.controls['fallbearbeiterId']['benutzerObject'].benutzerDetailId,
            benutzerstelleId: this.reactiveFormsService.searchForm.controls['benutzerstellenId']['benutzerstelleObject'].benutzerstelleId,
            isBearbeiter: this.reactiveFormsService.searchForm.get('isBearbeiter').value,
            isFreigeber: this.reactiveFormsService.searchForm.get('isFreigeber').value
        } as GeKoGeschaeftSuchenDTO;
    }
}
