import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { AmmBuchungParamDTO } from '@app/shared/models/dtos-generated/ammBuchungParamDTO';
import { AmmKontaktpersonDTO } from '@app/shared/models/dtos-generated/ammKontaktpersonDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { AngebotsdatenPageData } from '../../angebotsdaten-sichten.component';

@Component({
    selector: 'avam-angebotsdaten-durchfuehrungsort',
    templateUrl: './angebotsdaten-durchfuehrungsort.component.html',
    styleUrls: ['./angebotsdaten-durchfuehrungsort.component.scss']
})
export class AngebotsdatenDurchfuehrungsortComponent implements OnInit {
    @Input() ammBuchung: AmmBuchungParamDTO;
    @Input() massnahmenType: string;
    @Input() pageData: AngebotsdatenPageData;

    massnahmenTypes: typeof AmmMassnahmenCode = AmmMassnahmenCode;

    angebotsdatenDurchfForm: FormGroup;
    unternehmenId: number;
    burNr: number;
    unternehmenName: string;
    status: string;
    unternehmenLabel: string;

    constructor(private formBuilder: FormBuilder, private dbTranslateService: DbTranslateService) {}

    ngOnInit() {
        this.createFormGroup();
        this.getUnternehmenLabel();
        this.getData();
        if (this.ammBuchung.unternehmenObject) {
            this.unternehmenName = this.getUnternehmenName();
            this.burNr = this.getBurNr();
            this.status = this.getStatus();
        }
    }

    getUnternehmenLabel() {
        if (this.massnahmenType === this.massnahmenTypes.AP || this.massnahmenType === this.massnahmenTypes.BP) {
            this.unternehmenLabel = 'amm.massnahmen.label.arbeitgeber';
        } else {
            this.unternehmenLabel = 'amm.massnahmen.label.anbieter';
        }
    }

    getStatus(): string {
        if (this.ammBuchung.unternehmenObject.statusObject) {
            return `${this.dbTranslateService.translateWithOrder(this.ammBuchung.unternehmenObject.statusObject, 'text')}`;
        }
        return null;
    }

    getBurNr(): number {
        return this.ammBuchung.unternehmenObject.provBurNr ? this.ammBuchung.unternehmenObject.provBurNr : this.ammBuchung.unternehmenObject.burNummer;
    }

    getUnternehmenName(): string {
        const name1 = this.ammBuchung.unternehmenObject.name1 ? this.ammBuchung.unternehmenObject.name1 : '';
        const name2 = this.ammBuchung.unternehmenObject.name2 ? this.ammBuchung.unternehmenObject.name2 : '';
        const name3 = this.ammBuchung.unternehmenObject.name3 ? this.ammBuchung.unternehmenObject.name3 : '';
        return `${name1} ${name2} ${name3}`;
    }

    createFormGroup() {
        this.angebotsdatenDurchfForm = this.formBuilder.group({
            name1: null,
            name2: null,
            name3: null,
            strasse: null,
            strasseNr: null,
            raum: null,
            plz: this.formBuilder.group({
                postleitzahl: null,
                ort: null
            }),
            land: null,
            ergaenzendeAngaben: null,
            kontaktId: null,
            kontaktperson: null,
            name: null,
            vorname: null,
            telefon: null,
            mobile: null,
            fax: null,
            email: null
        });
    }

    getData() {
        this.angebotsdatenDurchfForm.reset(this.mapToForm());
        this.unternehmenId = this.ammBuchung.unternehmenObject.unternehmenId;
    }

    mapToForm() {
        const form = {
            name1: this.ammBuchung.dfOrtObject.ugname1,
            name2: this.ammBuchung.dfOrtObject.ugname2,
            name3: this.ammBuchung.dfOrtObject.ugname3,
            strasse: this.ammBuchung.dfOrtObject.strasse,
            strasseNr: this.ammBuchung.dfOrtObject.hausNummer,
            raum: this.ammBuchung.dfOrtObject.raum,
            plz: {
                postleitzahl: this.ammBuchung.dfOrtObject.plzObject ? this.ammBuchung.dfOrtObject.plzObject : this.ammBuchung.dfOrtObject.auslPlz || '',
                ort: this.ammBuchung.dfOrtObject.plzObject ? this.ammBuchung.dfOrtObject.plzObject : this.ammBuchung.dfOrtObject.auslOrt || ''
            },
            land: this.ammBuchung.dfOrtObject.landObject,
            ergaenzendeAngaben: this.ammBuchung.dfOrtObject.bemerkung
        };

        const ammKontaktperson = this.mapAmmKontaktpersonObject(this.ammBuchung.dfOrtObject.ammKontaktpersonObject);

        return { ...form, ...ammKontaktperson };
    }

    mapAmmKontaktpersonObject(ammKontaktpersonObject: AmmKontaktpersonDTO) {
        return {
            kontaktperson: ammKontaktpersonObject && ammKontaktpersonObject.kontaktId ? this.setKontaktperson(ammKontaktpersonObject) : null,
            kontaktId: ammKontaktpersonObject ? ammKontaktpersonObject.kontaktId : null,
            name: ammKontaktpersonObject ? ammKontaktpersonObject.name : null,
            vorname: ammKontaktpersonObject ? ammKontaktpersonObject.vorname : null,
            telefon: ammKontaktpersonObject ? ammKontaktpersonObject.telefon : null,
            mobile: ammKontaktpersonObject ? ammKontaktpersonObject.mobile : null,
            fax: ammKontaktpersonObject ? ammKontaktpersonObject.fax : null,
            email: ammKontaktpersonObject ? ammKontaktpersonObject.email : null
        };
    }

    setKontaktperson(kontaktperson: AmmKontaktpersonDTO): string {
        let kontaktpersonInputValue = '';

        if (kontaktperson) {
            if (kontaktperson.name) {
                kontaktpersonInputValue += kontaktperson.name;

                if (kontaktperson.vorname) {
                    kontaktpersonInputValue += `, ${kontaktperson.vorname}`;
                }
            } else if (kontaktperson.vorname) {
                kontaktpersonInputValue += kontaktperson.vorname;
            }
        }

        return kontaktpersonInputValue;
    }
}
