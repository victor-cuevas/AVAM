import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SpinnerService } from 'oblique-reactive';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { BaseResponseWrapperOsteDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperOsteDTOWarningMessages';
import { OsteDTO } from '@shared/models/dtos-generated/osteDTO';
import { KontaktDTO } from '@shared/models/dtos-generated/kontaktDTO';
import { FormUtilsService } from '@shared/services/forms/form-utils.service';
import { CodeDTO } from '@shared/models/dtos-generated/codeDTO';
import { GeschlechtCodeEnum } from '@shared/enums/domain-code/geschlecht-code.enum';
import { AnredeCodeEnum } from '@shared/enums/domain-code/anrede-code.enum';
import { StaatDTO } from '@shared/models/dtos-generated/staatDTO';
import { DomainEnum } from '@shared/enums/domain.enum';
import { OSTE_DETAILS_MODAL_SPINNER_CHANNEL as spinnerChannel } from '../../oste-details-modal.component';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-oste-details-modal-bewerbung',
    templateUrl: './oste-details-modal-bewerbung.component.html',
    styleUrls: ['./oste-details-modal-bewerbung.component.scss']
})
export class OsteDetailsModalBewerbungComponent implements OnInit {
    @Input() osteId: string;

    bewerbungForm: FormGroup;
    anredeDropdownModel = [];
    anredeOptions: CodeDTO[];
    schweiz: StaatDTO;
    oste: OsteDTO;

    constructor(
        private formBuilder: FormBuilder,
        private spinnerService: SpinnerService,
        private osteDataService: OsteDataRestService,
        private stesDataService: StesDataRestService,
        private facade: FacadeService,
        private dbTranslateService: DbTranslateService
    ) {}

    ngOnInit() {
        this.createForm();
        this.loadData();
    }

    createForm() {
        this.bewerbungForm = this.formBuilder.group({
            kontaktperson: [{ value: null, disabled: true }],
            kontaktpersonAnrede: null,
            kontaktpersonName: null,
            kontaktpersonVorname: null,
            kontaktpersonTelefon: null,
            kontaktpersonEmail: null,
            kontaktpersonFragen: [{ value: null, disabled: true }],
            kontaktpersonFragenAnrede: null,
            kontaktpersonFragenName: null,
            kontaktpersonFragenVorname: null,
            kontaktpersonFragenTelefon: null,
            kontaktpersonFragenEmail: null,
            ergaenzendeAngaben: null,
            schriftlich: null,
            persoenlich: null,
            arbeitgeberName1: null,
            arbeitgeberName2: null,
            arbeitgeberName3: null,
            arbeitgeberStrasse: null,
            arbeitgeberStrasseNr: null,
            plz: this.formBuilder.group({
                postleitzahl: null,
                ort: null
            }),
            unternehmenPostfach: null,
            postfach: this.formBuilder.group({
                postleitzahl: null,
                ort: null
            }),
            land: null,
            elektronisch: null,
            email: null,
            onlineFormular: null,
            telefonisch: null,
            telefon: null
        });
    }

    loadData() {
        this.spinnerService.activate(spinnerChannel);

        forkJoin<CodeDTO[], StaatDTO, BaseResponseWrapperOsteDTOWarningMessages>([
            this.stesDataService.getCode(DomainEnum.ANREDE),
            this.stesDataService.getStaatSwiss(),
            this.osteDataService.getOsteBewerbung(this.osteId)
        ]).subscribe(
            ([anredeOptions, schweiz, osteResponse]) => {
                this.schweiz = schweiz;
                this.anredeOptions = anredeOptions;

                this.anredeDropdownModel = this.facade.formUtilsService.mapDropdownKurztext(anredeOptions);

                if (osteResponse.data) {
                    this.oste = osteResponse.data;
                    this.mapToForm(osteResponse.data);
                }
                this.spinnerService.deactivate(spinnerChannel);
            },
            () => {
                this.spinnerService.deactivate(spinnerChannel);
            }
        );
    }

    mapToForm(oste: OsteDTO) {
        const kontaktperson = !oste.vorselektion
            ? this.mapKontaktperson(oste)
            : {
                  kontaktperson: null,
                  kontaktpersonAnrede: null,
                  kontaktpersonName: null,
                  kontaktpersonVorname: null,
                  kontaktpersonEmail: null,
                  kontaktpersonTelefon: null
              };

        const kontaktpersonFragen = oste.vorselektion ? this.mapKontaktpersonFragenVorselektion(oste) : this.mapKontaktpersonFragen(oste);

        this.bewerbungForm.patchValue({
            kontaktperson: kontaktperson.kontaktperson,
            kontaktpersonAnrede: kontaktperson.kontaktpersonAnrede,
            kontaktpersonName: kontaktperson.kontaktpersonName,
            kontaktpersonVorname: kontaktperson.kontaktpersonVorname,
            kontaktpersonTelefon: kontaktperson.kontaktpersonTelefon,
            kontaktpersonEmail: kontaktperson.kontaktpersonEmail,
            kontaktpersonFragen: kontaktpersonFragen.kontaktperson,
            kontaktpersonFragenAnrede: kontaktpersonFragen.kontaktpersonAnrede,
            kontaktpersonFragenName: kontaktpersonFragen.kontaktpersonName,
            kontaktpersonFragenVorname: kontaktpersonFragen.kontaktpersonVorname,
            kontaktpersonFragenTelefon: kontaktpersonFragen.kontaktpersonTelefon,
            kontaktpersonFragenEmail: kontaktpersonFragen.kontaktpersonEmail,
            ergaenzendeAngaben: oste.bewerAngaben,
            schriftlich: oste.bewerSchriftlich,
            persoenlich: oste.bewerPersoenlich,
            arbeitgeberName1: oste.unternehmenId && oste.unternehmenName1 ? { name1: oste.unternehmenName1, unternehmenId: oste.unternehmenId } : null,
            arbeitgeberName2: oste.unternehmenName2,
            arbeitgeberName3: oste.unternehmenName3,
            arbeitgeberStrasse: oste.unternehmenStrasse,
            arbeitgeberStrasseNr: oste.unternehmenStrasseNr,
            plz: this.mapPlz(oste),
            unternehmenPostfach: oste.unternehmenPostfach,
            postfach: this.mapPostfachPlz(oste),
            land: oste.staatDto ? this.dbTranslateService.translate(oste.staatDto, 'name') : null,
            elektronisch: oste.bewerElektronisch,
            email: oste.unternehmenEmail,
            onlineFormular: oste.unternehmenUrl,
            telefonisch: oste.bewerTelefonisch,
            telefon: oste.unternehmenTelefon
        });
    }

    isSchweiz(staat: StaatDTO): boolean {
        return staat && staat.code === this.schweiz.code;
    }

    mapPlz(oste: OsteDTO) {
        if (this.isSchweiz(oste.staatDto)) {
            return {
                postleitzahl: oste.plzDto,
                ort: oste.plzDto
            };
        } else {
            return {
                postleitzahl: oste.unternehmenPlzAusland,
                ort: oste.unternehmenPostleitortAusland
            };
        }
    }

    mapPostfachPlz(oste: OsteDTO) {
        if (this.isSchweiz(oste.staatDto)) {
            return {
                postleitzahl: oste.postfachPlzDto,
                ort: oste.postfachPlzDto
            };
        } else {
            return {
                postleitzahl: oste.unternehmenPostfachPlzAusland,
                ort: oste.unternehmenPostfachPostleitortAusland
            };
        }
    }

    mapKontaktperson(
        oste: OsteDTO
    ): {
        kontaktperson: string;
        kontaktpersonAnrede: number;
        kontaktpersonName: string;
        kontaktpersonVorname: string;
        kontaktpersonTelefon: string;
        kontaktpersonEmail: string;
    } {
        if (oste.bewerAnredeId || oste.bewerName || oste.bewerVorname || oste.bewerEmail || oste.bewerTelefonNr) {
            return {
                kontaktperson: null,
                kontaktpersonAnrede: oste.bewerAnredeId,
                kontaktpersonName: oste.bewerName,
                kontaktpersonVorname: oste.bewerVorname,
                kontaktpersonEmail: oste.bewerEmail,
                kontaktpersonTelefon: oste.bewerTelefonNr
            };
        }

        return this.mapKontakt(oste.kontaktObject);
    }

    mapKontaktpersonFragenVorselektion(
        oste: OsteDTO
    ): {
        kontaktperson: string;
        kontaktpersonAnrede: number;
        kontaktpersonName: string;
        kontaktpersonVorname: string;
        kontaktpersonTelefon: string;
        kontaktpersonEmail: string;
    } {
        const benutzerDetail = oste.stellenverantwortlicherDetailObject;
        return benutzerDetail
            ? {
                  kontaktperson: null,
                  kontaktpersonAnrede: this.getAnredeId(benutzerDetail.geschlechtCode),
                  kontaktpersonName: benutzerDetail.nachname,
                  kontaktpersonVorname: benutzerDetail.vorname,
                  kontaktpersonTelefon: benutzerDetail.telefonnr,
                  kontaktpersonEmail: benutzerDetail.email
              }
            : {
                  kontaktperson: null,
                  kontaktpersonAnrede: null,
                  kontaktpersonName: null,
                  kontaktpersonVorname: null,
                  kontaktpersonEmail: null,
                  kontaktpersonTelefon: null
              };
    }

    mapKontaktpersonFragen(
        oste: OsteDTO
    ): {
        kontaktperson: string;
        kontaktpersonAnrede: number;
        kontaktpersonName: string;
        kontaktpersonVorname: string;
        kontaktpersonTelefon: string;
        kontaktpersonEmail: string;
    } {
        if (oste.fragenAnredeId || oste.fragenName || oste.fragenVorname || oste.fragenEmail || oste.fragenTelefonNr) {
            return {
                kontaktperson: null,
                kontaktpersonAnrede: oste.fragenAnredeId,
                kontaktpersonName: oste.fragenName,
                kontaktpersonVorname: oste.fragenVorname,
                kontaktpersonTelefon: oste.fragenTelefonNr,
                kontaktpersonEmail: oste.fragenEmail
            };
        }

        return this.mapKontakt(oste.kontaktFragenObject);
    }

    mapKontakt(
        kontakt: KontaktDTO
    ): {
        kontaktperson: string;
        kontaktpersonAnrede: number;
        kontaktpersonName: string;
        kontaktpersonVorname: string;
        kontaktpersonTelefon: string;
        kontaktpersonEmail: string;
    } {
        const kontaktperson = kontakt ? kontakt.kontaktpersonObject : null;

        return {
            kontaktperson: kontaktperson ? `${kontaktperson.name}${kontaktperson.name && kontaktperson.vorname ? ', ' : ''}${kontaktperson.vorname}` : null,
            kontaktpersonAnrede: kontaktperson ? kontaktperson.anredeId : null,
            kontaktpersonName: kontaktperson ? kontaktperson.name : null,
            kontaktpersonVorname: kontaktperson ? kontaktperson.vorname : null,
            kontaktpersonEmail: kontakt ? kontakt.email : null,
            kontaktpersonTelefon: kontakt ? kontakt.telefonNr : null
        };
    }

    getAnredeId(geschlechtCode: string): number {
        const anredeCode =
            geschlechtCode === GeschlechtCodeEnum.GESCHLECHT_M
                ? AnredeCodeEnum.ANREDE_HERR
                : geschlechtCode === GeschlechtCodeEnum.GESCHLECHT_F
                ? AnredeCodeEnum.ANREDE_FRAU
                : null;

        return anredeCode ? +this.facade.formUtilsService.getCodeIdByCode(this.anredeOptions, anredeCode) : null;
    }
}
