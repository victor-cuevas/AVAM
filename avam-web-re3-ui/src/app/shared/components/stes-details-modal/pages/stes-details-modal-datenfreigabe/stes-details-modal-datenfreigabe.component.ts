import { Component, Input, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { BenutzerstelleResultDTO } from '@app/shared/models/dtos-generated/benutzerstelleResultDTO';
import { StesDatenfreigabeDTO } from '@app/shared/models/dtos-generated/stesDatenfreigabeDTO';
import { DbTranslatePipe } from '@app/shared/pipes/db-translate.pipe';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { SpinnerService } from 'oblique-reactive';
import { STES_DETAILS_MODAL_SPINNER_CHANNEL } from '../../stes-details-modal.component';
import { FormUtilsService } from '@app/shared/services/forms/form-utils.service';
import { AlertChannelEnum } from '@app/shared/components/alert/alert-channel.enum';

interface BenutzerStelleDO {
    name: string;
    strasse: string;
    strasseNr: string;
    plz: string;
    ort: string;
}

@Component({
    selector: 'avam-stes-details-modal-datenfreigabe',
    templateUrl: './stes-details-modal-datenfreigabe.component.html',
    styleUrls: ['./stes-details-modal-datenfreigabe.component.scss']
})
export class StesDetailsModalDatenfreigabeComponent implements OnInit, AfterViewInit {
    @Input() stesId: string;

    datenfreigabeForm: FormGroup;
    benutzerstelle: BenutzerStelleDO;

    constructor(
        private dataService: StesDataRestService,
        private dbTranslate: DbTranslatePipe,
        private fehlermeldungenService: FehlermeldungenService,
        private formBuilder: FormBuilder,
        private spinnerService: SpinnerService,
        private changeDetectorRef: ChangeDetectorRef,
        private formUtils: FormUtilsService
    ) {}

    ngOnInit() {
        this.datenfreigabeForm = this.createFormGroup();
        this.getData();
    }

    ngAfterViewInit() {
        this.changeDetectorRef.detectChanges();
    }

    createFormGroup(): FormGroup {
        return this.formBuilder.group({
            wurdeBefragt: null,
            oeffentlich: null,
            login: null,
            kontaktangebenJobroom: null,
            kontaktangebenArbeitgeber: null,
            unterlagen: null,
            bulletin: null,
            befragungen: null,
            beantragtAm: null,
            benutzerstellenId: null
        });
    }

    getData() {
        this.spinnerService.activate(STES_DETAILS_MODAL_SPINNER_CHANNEL);

        this.dataService.getDatenfreigabe(this.stesId, AlertChannelEnum.MODAL).subscribe(
            datenfreigabe => {
                if (datenfreigabe && datenfreigabe.data) {
                    this.datenfreigabeForm.patchValue(this.mapToForm(datenfreigabe.data));
                    this.benutzerstelle = this.mapBenutzerstelle(datenfreigabe.data.benutzerstelleObject);
                    this.displayVermittlungsstoppAktiviertMsg(datenfreigabe.data.zuweisungsStop);
                }
                this.spinnerService.deactivate(STES_DETAILS_MODAL_SPINNER_CHANNEL);
            },
            () => {
                this.spinnerService.deactivate(STES_DETAILS_MODAL_SPINNER_CHANNEL);
            }
        );
    }

    mapToForm(datenfreigabe: StesDatenfreigabeDTO) {
        return {
            wurdeBefragt: datenfreigabe.statusBefragungB,
            oeffentlich: datenfreigabe.oeffentlichB,
            login: datenfreigabe.geschuetztB,
            kontaktangebenJobroom: datenfreigabe.geschuetztKontaktangabenB,
            kontaktangebenArbeitgeber: datenfreigabe.arbeitsvermittlerB,
            unterlagen: datenfreigabe.arbeitsvermittlerBewerbB,
            bulletin: datenfreigabe.bewerberBulletinB,
            beantragtAm: this.formUtils.parseDate(datenfreigabe.shAntragsdatum),
            benutzerstellenId: datenfreigabe.benutzerstelleObject ? datenfreigabe.benutzerstelleObject.code : null
        };
    }

    mapBenutzerstelle(benutzerstelleObject: BenutzerstelleResultDTO): BenutzerStelleDO {
        if (!benutzerstelleObject) {
            return { name: '', strasse: '', strasseNr: '', plz: '', ort: '' };
        }
        return {
            name: this.dbTranslate.transform(benutzerstelleObject, 'name'),
            strasse: this.dbTranslate.transform(benutzerstelleObject, 'strasse'),
            strasseNr: benutzerstelleObject.strasseNr,
            plz: benutzerstelleObject.plzObject ? benutzerstelleObject.plzObject.postleitzahl : '',
            ort: benutzerstelleObject.plzObject ? this.dbTranslate.transform(benutzerstelleObject.plzObject, 'ort') : ''
        };
    }

    displayVermittlungsstoppAktiviertMsg(zuweisungsStop: boolean) {
        if (zuweisungsStop) {
            this.fehlermeldungenService.showMessage('stes.message.publikation.zuweisungsstoppaktivpublikationpruefen', 'warning', AlertChannelEnum.MODAL);
        }
    }
}
