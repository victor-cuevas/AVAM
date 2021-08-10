import { Injectable } from '@angular/core';
import { AmmKontaktpersonDTO } from '@app/shared/models/dtos-generated/ammKontaktpersonDTO';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { SessionDTO } from '@app/shared/models/dtos-generated/sessionDTO';
import { TranslateService } from '@ngx-translate/core';
import { InfotagMassnahmeBeschreibungReactiveFormsService } from './infotag-massnahme-beschreibung-reactive-forms.service';
import { AmmHelper } from '@app/shared/helpers/amm.helper';

@Injectable()
export class InfotagMassnahmeBeschreibungHandlerService {
    constructor(public reactiveForms: InfotagMassnahmeBeschreibungReactiveFormsService, private translate: TranslateService, private ammHelper: AmmHelper) {}

    mapOptions(options: CodeDTO[] = []) {
        return options.map(option => this.languagePropertyMapper(option));
    }

    languagePropertyMapper(element: CodeDTO) {
        return {
            value: element.code,
            labelDe: element.kurzTextDe,
            labelFr: element.kurzTextFr,
            labelIt: element.kurzTextIt
        };
    }

    mapToForm(dto: MassnahmeDTO | SessionDTO = {}) {
        const ammBeschreibungObject = dto.ammBeschreibungObject ? dto.ammBeschreibungObject : {};
        const durchfuehrungsortObject = dto.durchfuehrungsortObject ? dto.durchfuehrungsortObject : {};

        const form = {
            erfassungssprache: this.translate.currentLang.toUpperCase(),
            //Mehrsprachig
            inhaltDe: ammBeschreibungObject.inhaltDe,
            inhaltFr: ammBeschreibungObject.inhaltFr,
            inhaltIt: ammBeschreibungObject.inhaltIt,
            methodikDe: ammBeschreibungObject.methodikDe,
            methodikFr: ammBeschreibungObject.methodikFr,
            methodikIt: ammBeschreibungObject.methodikIt,
            massnahmenzielDe: ammBeschreibungObject.massnahmenZielDe,
            massnahmenzielFr: ammBeschreibungObject.massnahmenZielFr,
            massnahmenzielIt: ammBeschreibungObject.massnahmenZielIt,
            //Anbieter
            name1: durchfuehrungsortObject.ugname1,
            name2: durchfuehrungsortObject.ugname2,
            name3: durchfuehrungsortObject.ugname3,
            strasse: durchfuehrungsortObject.strasse,
            strasseNr: durchfuehrungsortObject.hausNummer,
            raum: durchfuehrungsortObject.raum,
            plz: {
                postleitzahl: durchfuehrungsortObject.plzObject ? durchfuehrungsortObject.plzObject : durchfuehrungsortObject.auslPlz || '',
                ort: durchfuehrungsortObject.plzObject ? durchfuehrungsortObject.plzObject : durchfuehrungsortObject.auslOrt || ''
            },
            land: durchfuehrungsortObject.landObject
        };

        //Kontaktperson
        const kontaktPerson = this.mapAmmKontaktpersonObject(durchfuehrungsortObject.ammKontaktpersonObject);

        return { ...form, ...kontaktPerson };
    }

    mapAmmKontaktpersonObject(ammKontaktpersonObject: AmmKontaktpersonDTO) {
        const kontakperson = ammKontaktpersonObject ? ammKontaktpersonObject : {};

        return {
            kontaktperson: this.setKontaktPerson(kontakperson),
            name: kontakperson.name,
            vorname: kontakperson.vorname,
            telefon: kontakperson.telefon,
            mobile: kontakperson.mobile,
            fax: kontakperson.fax,
            email: kontakperson.email,
            kontaktId: kontakperson.kontaktId
        };
    }

    setKontaktPerson(ammKontaktpersonObject: AmmKontaktpersonDTO): string {
        const name = ammKontaktpersonObject.name ? ammKontaktpersonObject.name : '';
        const vorname = ammKontaktpersonObject.vorname ? ammKontaktpersonObject.vorname : '';

        if (name || vorname) {
            return `${name}${name && vorname ? ', ' : ''}${vorname}`;
        }

        return null;
    }

    mapToDto(dto: MassnahmeDTO | SessionDTO, isKpersonCleared: boolean): MassnahmeDTO | SessionDTO {
        const beschreibung = dto.ammBeschreibungObject;
        const ort = dto.durchfuehrungsortObject;
        const controls = this.reactiveForms.beschreibungForm.controls;

        return {
            ...dto,
            ammBeschreibungObject: {
                ...beschreibung,
                inhaltDe: controls.inhaltDe.value,
                inhaltFr: controls.inhaltFr.value,
                inhaltIt: controls.inhaltIt.value,
                methodikDe: controls.methodikDe.value,
                methodikFr: controls.methodikFr.value,
                methodikIt: controls.methodikIt.value,
                massnahmenZielDe: controls.massnahmenzielDe.value,
                massnahmenZielFr: controls.massnahmenzielFr.value,
                massnahmenZielIt: controls.massnahmenzielIt.value
            },
            durchfuehrungsortObject: {
                ...ort,
                ugname1: controls.name1.value,
                ugname2: controls.name2.value,
                ugname3: controls.name3.value,
                strasse: controls.strasse.value,
                hausNummer: controls.strasseNr.value,
                raum: controls.raum.value,
                plzObject: controls.plz['plzWohnAdresseObject'] ? controls.plz['plzWohnAdresseObject'] : null,
                auslPlz: controls.plz['plzWohnAdresseObject'] ? controls.plz['plzWohnAdresseObject'].plzWohnadresseAusland : null,
                auslOrt: controls.plz['plzWohnAdresseObject'] ? controls.plz['plzWohnAdresseObject'].ortWohnadresseAusland : null,
                landObject: controls.land['landAutosuggestObject'],
                ammKontaktpersonObject: this.ammHelper.initializeKperson(
                    this.reactiveForms.beschreibungForm,
                    ort,
                    this.reactiveForms.beschreibungForm.controls.kontaktPersonObject.value,
                    isKpersonCleared
                )
            }
        };
    }
}
