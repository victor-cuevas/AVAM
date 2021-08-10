import { Component, OnInit, Input, ElementRef, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { OsteDataRestService } from '@app/core/http/oste-data-rest.service';
import { forkJoin } from 'rxjs';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { OSTE_DETAILS_MODAL_SPINNER_CHANNEL } from '../../oste-details-modal.component';
import { SpinnerService } from 'oblique-reactive';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { OsteDTO } from '@app/shared/models/dtos-generated/osteDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { OsteArbeitsformDTO } from '@app/shared/models/dtos-generated/osteArbeitsformDTO';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OsteStellenbeschreibungModalComponent } from '../../oste-stellenbeschreibung-modal/oste-stellenbeschreibung-modal.component';
import { FormUtilsService } from '@app/shared/services/forms/form-utils.service';
import { FacadeService } from '@shared/services/facade.service';
@Component({
    selector: 'avam-oste-details-modal-basisangaben',
    templateUrl: './oste-details-modal-basisangaben.component.html',
    styleUrls: ['./oste-details-modal-basisangaben.component.scss']
})
export class OsteDetailsModalBasisangabenComponent implements OnInit {
    @Input() osteId: string;
    @ViewChild('stellenbeschreibungModal') stellenbeschreibungModal: ElementRef;

    basisangabenForm: FormGroup;

    stellenbeschreibung: string;
    fristTypOptions = [];
    lohnartOptions = [];
    waehrungOptions = [];
    arbeitsformenOptions = [];

    constructor(
        private formBuilder: FormBuilder,
        private stesDataService: StesDataRestService,
        private osteDataService: OsteDataRestService,
        private spinnerService: SpinnerService,
        private dbTranslateService: DbTranslateService,
        private modalService: NgbModal,
        private facade: FacadeService
    ) {}

    ngOnInit() {
        this.basisangabenForm = this.createFormGroup();
        this.getData();
    }

    createFormGroup(): FormGroup {
        return this.formBuilder.group({
            stellenbezeichnung: null,
            abSofort: null,
            nachVereinbarung: null,
            checkboxAb: null,
            stellenAntritt: null,
            fristTyp: null,
            vertragsdauer: null,
            beschaeftigungsgradSlider: this.formBuilder.group({
                beschaeftigungsgrad: [''],
                pensumVon: 1,
                pensumBis: 100
            }),
            arbeitszeitStd: null,
            arbeitsform: null,
            lohnart: null,
            waehrung: null,
            lohnMin: null,
            lohnMax: null,
            arbeitsortStaat: null,
            postleitzahl: null,
            ort: null,
            arbeitsortText: null,
            detailangaben: null,
            behinderte: null,
            jobSharing: null
        });
    }

    getData() {
        this.spinnerService.activate(OSTE_DETAILS_MODAL_SPINNER_CHANNEL);

        forkJoin(
            this.stesDataService.getCode(DomainEnum.OSTE_FRIST_TYP),
            this.stesDataService.getCode(DomainEnum.ARBEITSFORM),
            this.stesDataService.getCode(DomainEnum.LOHNART),
            this.stesDataService.getCode(DomainEnum.WAEHRUNG),
            this.osteDataService.getOsteBasisangaben(this.osteId)
        ).subscribe(
            ([osteFristTyp, arbeitsform, lohnart, waehrung, basisangaben]) => {
                if (basisangaben.data && osteFristTyp && arbeitsform && lohnart && waehrung) {
                    this.fristTypOptions = this.facade.formUtilsService.mapDropdownKurztext(osteFristTyp);
                    this.lohnartOptions = this.facade.formUtilsService.mapDropdownKurztext(lohnart);
                    this.waehrungOptions = this.facade.formUtilsService.mapDropdownKurztext(waehrung);

                    //set and select the arbeitsformen options
                    this.setArbeitsformenMultiselectOptions(arbeitsform, basisangaben.data.arbeitsformList);

                    this.basisangabenForm.reset(this.mapToForm(basisangaben.data));

                    this.stellenbeschreibung = basisangaben.data.beschreibung;
                }

                this.spinnerService.deactivate(OSTE_DETAILS_MODAL_SPINNER_CHANNEL);
            },
            error => {
                this.spinnerService.deactivate(OSTE_DETAILS_MODAL_SPINNER_CHANNEL);
            }
        );
    }

    mapToForm(oste: OsteDTO) {
        return {
            stellenbezeichnung: oste.bezeichnung,
            abSofort: oste.abSofort,
            nachVereinbarung: oste.nachVereinbarung,
            checkboxAb: !!oste.stellenAntritt,
            stellenAntritt: this.facade.formUtilsService.parseDate(oste.stellenAntritt),
            fristTyp: oste.fristTypId,
            vertragsdauer: this.facade.formUtilsService.parseDate(oste.vertragsDauer),
            beschaeftigungsgradSlider: { beschaeftigungsgrad: '', pensumVon: oste.pensumVon, pensumBis: oste.pensumBis },
            arbeitszeitStd: oste.arbeitszeitStd,
            lohnart: oste.lohnartId,
            waehrung: oste.waehrungId,
            lohnMin: oste.lohnMin,
            lohnMax: oste.lohnMax,
            arbeitsortStaat: oste.arbeitsortStaatDto ? this.dbTranslateService.translate(oste.arbeitsortStaatDto, 'name') : null,
            postleitzahl: oste.arbeitsortPlzDto ? oste.arbeitsortPlzDto : oste.arbeitsortAuslandPlz || '',
            ort: oste.arbeitsortPlzDto ? oste.arbeitsortPlzDto : oste.arbeitsortAuslandOrt || '',
            arbeitsortText: oste.arbeitsortText,
            detailangaben: oste.detailangaben,
            behinderte: oste.behinderte,
            jobSharing: oste.jobSharing
        };
    }

    openStellenbeschreibungModal() {
        const modalRef = this.modalService.open(OsteStellenbeschreibungModalComponent, {
            ariaLabelledBy: 'modal-basic-title',
            windowClass: 'modal-xs',
            backdrop: 'static',
            centered: true
        });

        modalRef.componentInstance.text = this.stellenbeschreibung;
        modalRef.componentInstance.headerKey = 'arbeitgeber.oste.label.stellenbeschreibung';
    }

    setArbeitsformenMultiselectOptions(arbeitsformListDomain: CodeDTO[], arbeitsformListBE: OsteArbeitsformDTO[]) {
        this.arbeitsformenOptions = arbeitsformListDomain.map(this.mapMultiselect);

        if (arbeitsformListBE) {
            this.arbeitsformenOptions.forEach(element => {
                if (arbeitsformListBE.some(el => el.arbeitsformId === element.id)) {
                    element.value = true;
                }
            });
        }
    }

    private mapMultiselect = (arbeitsform: CodeDTO) => {
        return {
            id: arbeitsform.codeId,
            textDe: arbeitsform.kurzTextDe,
            textIt: arbeitsform.kurzTextIt,
            textFr: arbeitsform.kurzTextFr,
            value: false
        };
    };
}
