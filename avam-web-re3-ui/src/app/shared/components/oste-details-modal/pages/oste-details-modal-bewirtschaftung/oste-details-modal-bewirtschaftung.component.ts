import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { OsteDataRestService } from '@app/core/http/oste-data-rest.service';
import { SpinnerService } from 'oblique-reactive';
import { OSTE_DETAILS_MODAL_SPINNER_CHANNEL } from '../../oste-details-modal.component';
import { OsteDTO } from '@app/shared/models/dtos-generated/osteDTO';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { forkJoin } from 'rxjs';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import * as moment from 'moment';
import { OsteSchlagwortDTO } from '@app/shared/models/dtos-generated/osteSchlagwortDTO';
import { CoreButtonGroupInterface } from '@app/library/core/core-button-group/core-button-group.interface';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { FormUtilsService } from '@app/shared/services/forms/form-utils.service';
import { FacadeService } from '@shared/services/facade.service';
@Component({
    selector: 'avam-oste-details-modal-bewirtschaftung',
    templateUrl: './oste-details-modal-bewirtschaftung.component.html',
    styleUrls: ['./oste-details-modal-bewirtschaftung.component.scss']
})
export class OsteDetailsModalBewirtschaftungComponent implements OnInit {
    @Input() osteId: string;

    bewirtschaftungForm: FormGroup;

    abmeldeGrundOptions = [];
    bearbeitungsstandOptions = [];
    statusOptions = [];
    schlagworteOptions = [];

    jobroomInternGroup: CoreButtonGroupInterface[];
    jobroomExternGroup: CoreButtonGroupInterface[];
    euresGroup: CoreButtonGroupInterface[];

    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;

    constructor(
        private formBuilder: FormBuilder,
        private stesDataService: StesDataRestService,
        private osteDataService: OsteDataRestService,
        private spinnerService: SpinnerService,
        private facade: FacadeService
    ) {}

    ngOnInit() {
        this.bewirtschaftungForm = this.createFormGroup();
        this.getData();
    }

    createFormGroup(): FormGroup {
        return this.formBuilder.group({
            stellenverantwortung: null,
            meldepflicht: null,
            bearbeitungsstand: null,
            meldung: null,
            zuweisungFreigeben: null,
            vorselektion: null,
            zuweisungStop: null,
            gleicheOste: null,
            zuweisungMax: null,
            weitereAngaben: null,
            schlagworte: null,
            sperrfristbis: null,
            jobroomInternPublikation: null,
            jobroomExternPublikation: null,
            eures: null,
            anmeldeDatum: null,
            gueltigkeitsDatum: null,
            gueltigkeitUnbegrenzt: null,
            status: null,
            abmeldeDatum: null,
            abmeldeGrund: null
        });
    }

    getData() {
        this.spinnerService.activate(OSTE_DETAILS_MODAL_SPINNER_CHANNEL);

        forkJoin(
            this.stesDataService.getCode(DomainEnum.MELDEPFLICHTBEARBEITUNG),
            this.stesDataService.getCode(DomainEnum.ABMELDEGRUND_OSTE),
            this.stesDataService.getCode(DomainEnum.STATUS_OSTE),
            this.osteDataService.getOsteBewirtschaftung(this.osteId)
        ).subscribe(
            ([meldepflichtbearbeitungOptions, abmeldegrundOste, statusOste, response]) => {
                if (response.data && meldepflichtbearbeitungOptions && abmeldegrundOste && statusOste) {
                    this.bearbeitungsstandOptions = this.facade.formUtilsService.mapDropdownKurztext(meldepflichtbearbeitungOptions);
                    this.abmeldeGrundOptions = this.facade.formUtilsService.mapDropdownKurztext(abmeldegrundOste);
                    this.statusOptions = this.facade.formUtilsService.mapDropdownKurztext(statusOste);
                    this.bewirtschaftungForm.reset(this.mapToForm(response.data));

                    //set schlagworte
                    this.schlagworteOptions = response.data.schlagwortList.map(this.mapMultiselect);
                    //init button groups
                    this.initButtons(response.data);
                }
                this.spinnerService.deactivate(OSTE_DETAILS_MODAL_SPINNER_CHANNEL);
            },
            error => {
                this.spinnerService.deactivate(OSTE_DETAILS_MODAL_SPINNER_CHANNEL);
            }
        );
    }

    mapToForm(oste: OsteDTO) {
        const isGueltigkeitUnbegrenzt = this.isGueltigkeitUnbegrenzt(oste.gueltigkeit);

        return {
            stellenverantwortung: oste.stellenverantwortlicherDetailObject,
            meldepflicht: oste.meldepflicht,
            bearbeitungsstand: oste.meldepflichtBearbeitungId,
            meldung: oste.meldung,
            zuweisungFreigeben: oste.zuweisungFreigeben,
            vorselektion: oste.vorselektion,
            zuweisungStop: oste.zuweisungStop,
            gleicheOste: oste.gleicheOste,
            zuweisungMax: oste.zuweisungMax ? oste.zuweisungMax : 10,
            weitereAngaben: oste.angabenBewirt,
            schlagworte: null,
            sperrfristbis: this.facade.formUtilsService.parseDate(oste.sperrfrist),
            anmeldeDatum: this.facade.formUtilsService.parseDate(oste.anmeldeDatum),
            gueltigkeitsDatum: !isGueltigkeitUnbegrenzt ? this.facade.formUtilsService.parseDate(oste.gueltigkeit) : null,
            gueltigkeitUnbegrenzt: isGueltigkeitUnbegrenzt,
            status: oste.statusId,
            abmeldeDatum: this.facade.formUtilsService.parseDate(oste.abmeldeDatum),
            abmeldeGrund: oste.abmeldeGrund
        };
    }

    private initButtons(oste: OsteDTO) {
        this.initButtonsJobroomInternGroup(oste);
        this.initButtonsJobroomExternGroup(oste);
        this.initButtonsEuresGroup(oste);
    }

    private initButtonsJobroomInternGroup(oste: OsteDTO) {
        this.jobroomInternGroup = [
            {
                label: 'common.label.ja',
                value: 'C',
                disabled: true,
                selected: oste.jobroomInternPublikation && !oste.jobroomInternAnonym
            },
            {
                label: 'common.label.nein',
                value: 'C1',
                disabled: true,
                selected: !oste.jobroomInternPublikation && !oste.jobroomInternAnonym
            },
            {
                label: 'common.label.anonym',
                value: 'C2',
                disabled: true,
                selected: oste.jobroomInternPublikation && oste.jobroomInternAnonym
            }
        ];
    }

    private initButtonsJobroomExternGroup(oste: OsteDTO) {
        this.jobroomExternGroup = [
            {
                label: 'common.label.ja',
                value: 'B',
                disabled: true,
                selected: oste.jobroomExternPublikation && !oste.jobroomExternAnonym
            },
            {
                label: 'common.label.nein',
                value: 'B1',
                disabled: true,
                selected: !oste.jobroomExternPublikation && !oste.jobroomExternAnonym
            },
            {
                label: 'common.label.anonym',
                value: 'B2',
                disabled: true,
                selected: oste.jobroomExternAnonym && oste.jobroomExternPublikation
            }
        ];
    }

    private initButtonsEuresGroup(oste: OsteDTO) {
        this.euresGroup = [
            {
                label: 'common.label.ja',
                value: 'A',
                disabled: true,
                selected: oste.eures && !oste.euresAnonym
            },
            {
                label: 'common.label.nein',
                value: 'A1',
                disabled: true,
                selected: !oste.eures && !oste.euresAnonym
            },
            {
                label: 'common.label.anonym',
                value: 'A2',
                disabled: true,
                selected: oste.euresAnonym && oste.eures
            }
        ];
    }

    private mapMultiselect = (schlagwort: OsteSchlagwortDTO) => {
        const element = schlagwort.schlagwortObject;

        return {
            id: element.schlagwortId,
            textDe: element.schlagwortDe,
            textIt: element.schlagwortIt,
            textFr: element.schlagwortFr,
            value: true
        };
    };

    private isGueltigkeitUnbegrenzt(date: Date): boolean {
        const gueltigkeitsDatum = moment(date).format('DD.MM.YYYY');
        const maxDate = moment('9999-12-31').format('DD.MM.YYYY');
        return !moment(gueltigkeitsDatum, 'DD.MM.YYYY').isBefore(moment(maxDate, 'DD.MM.YYYY'));
    }
}
