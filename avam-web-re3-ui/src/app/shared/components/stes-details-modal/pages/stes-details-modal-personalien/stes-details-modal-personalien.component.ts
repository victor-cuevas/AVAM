import { Component, OnInit, Input, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { StesPersonalienDTO } from '@app/shared/models/dtos-generated/stesPersonalienDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FormUtilsService } from '@app/shared/services/forms/form-utils.service';
import { forkJoin } from 'rxjs';
import { StatusEnum } from '@app/shared/classes/fixed-codes';
import { SpinnerService } from 'oblique-reactive';
import { STES_DETAILS_MODAL_SPINNER_CHANNEL } from '../../stes-details-modal.component';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { CoreMultiselectInterface } from '@app/library/core/core-multiselect/core-multiselect.interface';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-stes-details-modal-personalien',
    templateUrl: './stes-details-modal-personalien.component.html',
    styleUrls: ['./stes-details-modal-personalien.component.scss']
})
export class StesDetailsModalPersonalienComponent implements OnInit, AfterViewInit {
    @Input() stesId: string;

    personalienForm: FormGroup;
    wohnadresseForm: FormGroup;

    aufenthaltsstatusDropdownLabels: any[] = [];
    schlagworteList = [];
    schlagworte = [];

    constructor(
        private formBuilder: FormBuilder,
        private stesDataService: StesDataRestService,
        private dbTranslateService: DbTranslateService,
        private facade: FacadeService,
        private spinnerService: SpinnerService,
        private changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.personalienForm = this.createFormGroup();
        this.getData();
    }

    ngAfterViewInit() {
        this.changeDetectorRef.detectChanges();
    }

    createFormGroup(): FormGroup {
        const form = this.formBuilder.group({
            wohnadresse: this.formBuilder.group({
                name: null,
                vorname: null,
                strasse: null,
                postfach: null,
                plz: this.formBuilder.group({
                    postleitzahl: null,
                    ort: null
                }),
                land: null,
                gemeinde: this.formBuilder.group({
                    postleitzahl: null,
                    ort: null
                })
            }),
            kontaktangaben: this.formBuilder.group({
                telefonprivat: null,
                telefongeschaeft: null,
                fax: null,
                mobile: null,
                email: null
            }),
            personenstammdaten: this.formBuilder.group({
                personenNr: null,
                svNr: null,
                zasName: null,
                zasVorname: null,
                geschlecht: null,
                zivilstand: null,
                nationalitaet: null,
                geburtsdatum: null,
                versichertenNrList: null,
                letzterzasabgleich: null
            }),
            aufenthaltsbewilligung: this.formBuilder.group({
                leistungsimporteuefta: null,
                aufenthaltsstatus: null,
                aufenthaltbis: null,
                einreisedatum: null
            }),
            schlagworte: this.formBuilder.group({
                schlagworte: []
            })
        });

        this.wohnadresseForm = form.get('wohnadresse') as FormGroup;

        return form;
    }

    getData() {
        this.spinnerService.activate(STES_DETAILS_MODAL_SPINNER_CHANNEL);
        forkJoin(
            this.stesDataService.getCode(DomainEnum.AUFENHALTSSTATUS),
            this.stesDataService.getPersonalienBearbeiten(this.stesId),
            this.stesDataService.getSchlagworte(StatusEnum.AKTIV)
        ).subscribe(
            ([aufenthaltsstatus, personalien, schlagworte]) => {
                this.aufenthaltsstatusDropdownLabels = this.facade.formUtilsService.mapDropdownKurztext(aufenthaltsstatus);

                if (personalien.data.stesPersonalienDTO) {
                    this.schlagworteList = this.setFunktionMultiselectOptions(schlagworte, personalien.data.stesPersonalienDTO.schlagwortSTESListe).slice();

                    this.personalienForm.reset(this.mapToForm(personalien.data.stesPersonalienDTO));
                }
                this.spinnerService.deactivate(STES_DETAILS_MODAL_SPINNER_CHANNEL);
            },
            error => {
                this.spinnerService.deactivate(STES_DETAILS_MODAL_SPINNER_CHANNEL);
            }
        );
    }

    mapToForm(personalien: StesPersonalienDTO) {
        return {
            wohnadresse: this.mapWohnadresse(personalien),
            kontaktangaben: this.mapKontaktangaben(personalien),
            personenstammdaten: this.mapPersonenstammdaten(personalien),
            aufenthaltsbewilligung: this.mapAufenthaltsbewilligung(personalien),
            schlagworte: {
                schlagworte: null
            }
        };
    }

    private setFunktionMultiselectOptions(funktionInitialCodeList: CodeDTO[], savedFunktionen: any[]): CoreMultiselectInterface[] {
        const mappedOptions = funktionInitialCodeList.map(this.multiselectMapper);
        mappedOptions.forEach(element => {
            if (savedFunktionen.some(el => el.schlagwortId === element.id)) {
                element.value = true;
            }
        });
        return mappedOptions;
    }

    private multiselectMapper = (schlagwort: any) => {
        const element = schlagwort;

        return {
            id: element.schlagwortId,
            textDe: element.schlagwortDe,
            textIt: element.schlagwortIt,
            textFr: element.schlagwortFr,
            value: false
        };
    };

    private mapWohnadresse(personalien: StesPersonalienDTO) {
        return {
            name: personalien.nameAVAM,
            vorname: personalien.vornameAVAM,
            strasse: `${personalien.strasseWohnadresse} ${personalien.hausNrWohnadresse}`,
            postfach: personalien.postfachNrWohnadresse === 0 ? '' : personalien.postfachNrWohnadresse,
            plz: {
                postleitzahl: personalien.plzWohnAdresseObject ? personalien.plzWohnAdresseObject : personalien.plzWohnadresseAusland || '',
                ort: personalien.plzWohnAdresseObject ? personalien.plzWohnAdresseObject : personalien.ortWohnadresseAusland || ''
            },
            land: personalien.landWohnadresseObject ? this.dbTranslateService.translate(personalien.landWohnadresseObject, 'name') : null,
            gemeinde: {
                postleitzahl: personalien.gemeindeWohnadresseObject ? personalien.gemeindeWohnadresseObject.bfsNummer : '',
                ort: personalien.gemeindeWohnadresseObject ? this.dbTranslateService.translate(personalien.gemeindeWohnadresseObject, 'name') : ''
            }
        };
    }

    private mapKontaktangaben(personalien: StesPersonalienDTO) {
        return {
            telefonprivat: personalien.telNrPrivat,
            telefongeschaeft: personalien.telNrGeschaeft,
            fax: personalien.faxNr,
            mobile: personalien.mobileNr,
            email: personalien.email
        };
    }

    private mapPersonenstammdaten(personalien: StesPersonalienDTO) {
        return {
            personenNr: personalien.personStesObject ? personalien.personStesObject.personenNr : null,
            svNr: this.getSvNummer(personalien),
            zasName: personalien.personStesObject ? personalien.personStesObject.namePersReg : null,
            zasVorname: personalien.personStesObject ? personalien.personStesObject.vornamePersReg : null,
            geschlecht: personalien.personStesObject ? this.dbTranslateService.translate(personalien.personStesObject.geschlechtObject, 'text') : null,
            zivilstand: personalien.personStesObject ? this.dbTranslateService.translate(personalien.personStesObject.zivilstandObject, 'text') : null,
            nationalitaet: personalien.personStesObject.nationalitaetObject ? this.dbTranslateService.translate(personalien.personStesObject.nationalitaetObject, 'name') : null,
            geburtsdatum: personalien.personStesObject ? personalien.personStesObject.geburtsDatum : null,
            versichertenNrList: personalien.personStesObject ? personalien.personStesObject.versichertenNrList : null,
            letzterzasabgleich: this.facade.formUtilsService.parseDate(personalien.personStesObject.letzterZASAbgleich)
        };
    }

    private mapAufenthaltsbewilligung(personalien: StesPersonalienDTO) {
        return {
            leistungsimporteuefta: personalien.leistungsimportEUEFTA,
            aufenthaltsstatus: personalien.aufenthaltsStatusID,
            aufenthaltbis: this.facade.formUtilsService.parseDate(personalien.aufenthaltBis),
            einreisedatum: this.facade.formUtilsService.parseDate(personalien.einreiseDatum)
        };
    }

    private getSvNummer(personalien: StesPersonalienDTO) {
        let svNumber;

        if (!personalien.personStesObject.svNrFromZas && personalien.personStesObject.versichertenNrList !== undefined) {
            personalien.personStesObject.versichertenNrList.forEach(element => {
                if (element.istAktuelleVersichertenNr) {
                    svNumber = element.versichertenNr;
                }
            });
        } else {
            svNumber = personalien.personStesObject.svNrFromZas;
        }

        return svNumber;
    }

    private getSchlagworteList(personalien) {
        const schlagworte = [];
        this.schlagworteList.forEach(element => {
            const result = personalien.schlagwortSTESListe.find(v => v.schlagwortId === element.codeId);
            element.value = !!result;
            schlagworte.push(element);
        });

        return schlagworte;
    }
}
