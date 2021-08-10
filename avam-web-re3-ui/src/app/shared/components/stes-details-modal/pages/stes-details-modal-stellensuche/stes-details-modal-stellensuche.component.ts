import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { SpinnerService } from 'oblique-reactive';
import { STES_DETAILS_MODAL_SPINNER_CHANNEL } from '../../stes-details-modal.component';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { forkJoin } from 'rxjs';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { StesStellensucheDTO } from '@app/shared/models/dtos-generated/stesStellensucheDTO';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';
import { BurOertlicheEinheitDTO } from '@app/shared/models/dtos-generated/burOertlicheEinheitDTO';
import { NogaDTO } from '@app/shared/models/dtos-generated/nogaDTO';
import { StesArbeitsformDTO } from '@app/shared/models/dtos-generated/stesArbeitsformDTO';
import { RegionDTO } from '@dtos/regionDTO';
import { FormUtilsService } from '@app/shared';
import { FacadeService } from '@shared/services/facade.service';

enum Regions {
    Suchregion = 'Suchregion',
    Grossregion = 'Grossregion'
}
@Component({
    selector: 'avam-stes-details-modal-stellensuche',
    templateUrl: './stes-details-modal-stellensuche.component.html',
    styleUrls: ['./stes-details-modal-stellensuche.component.scss']
})
export class StesDetailsModalStellensucheComponent implements OnInit {
    @Input() stesId: string;

    stellensucheForm: FormGroup;
    arbeitgeberForm: FormGroup;
    arbeitsformFormArray: FormArray;
    arbeitsortFormArray: FormArray;

    arbeitSelectOptions = [];
    mobiliteatSelectOptions = [];
    fuehrerausweisKategorieOptions = [];
    arbeitsformList = [];
    arbeitsortList = [];
    unternehmenId;

    constructor(
        private formBuilder: FormBuilder,
        private spinnerService: SpinnerService,
        private stesDataService: StesDataRestService,
        private translate: TranslateService,
        private dbTranslateService: DbTranslateService,
        private changeDetectorRef: ChangeDetectorRef,
        private facade: FacadeService
    ) {}

    ngOnInit() {
        this.stellensucheForm = this.createFormGroup();
        this.arbeitgeberForm = this.stellensucheForm.get('arbeitgeber') as FormGroup;
        this.arbeitsformFormArray = this.stellensucheForm.get('arbeitsform') as FormArray;
        this.arbeitsortFormArray = this.stellensucheForm.get('arbeitsort') as FormArray;
        this.getData();
    }

    createFormGroup(): FormGroup {
        return this.formBuilder.group({
            vermittlungsGrad: null,
            arbeitszeitId: null,
            arbeitszeitDetail: null,
            arbeitsort: this.formBuilder.array([]),
            mobilitaetId: null,
            wohnortwechsel: null,
            fahrzeugVerfuegbar: null,
            fuehrerausweisKategorie: null,
            arbeitgeber: this.formBuilder.group({
                letzterAGBekannt: null,
                name1: null,
                name2: null,
                name3: null,
                plz: null,
                land: null,
                bur: null,
                branche: null,
                teatigkeitBranche: null
            }),
            anstellungBisDatum: null,
            stellenAntrittAbDatum: null,
            arbeitsform: this.formBuilder.array([])
        });
    }

    mapToForm(stellensuche: StesStellensucheDTO, regions) {
        return {
            vermittlungsGrad: stellensuche.vermittlungsGrad ? stellensuche.vermittlungsGrad + '%' : null,
            arbeitszeitId: stellensuche.arbeitszeitId,
            arbeitszeitDetail: stellensuche.arbeitszeitDetail,
            mobilitaetId: stellensuche.mobilitaetId,
            fuehrerausweisKategorie: null,
            wohnortwechsel: stellensuche.wohnortwechselMoeglich
                ? this.translate.instant('stes.multiselect.mobiliteat.moeglich')
                : this.translate.instant('stes.multiselect.mobiliteat.nichtmoeglich'),
            fahrzeugVerfuegbar: stellensuche.fahrzeugVerfuegbar,
            anstellungBisDatum: this.facade.formUtilsService.parseDate(stellensuche.anstellungBisDatum),
            stellenAntrittAbDatum: this.facade.formUtilsService.parseDate(stellensuche.stellenAntrittAbDatum),
            arbeitgeber: this.getArbeitgeber(stellensuche),
            arbeitsform: this.getArbeitsformValues(stellensuche.arbeitsformenList),
            arbeitsort: this.getArbeitsorte(regions)
        };
    }

    getData() {
        this.spinnerService.activate(STES_DETAILS_MODAL_SPINNER_CHANNEL);

        forkJoin(
            this.stesDataService.getCode(DomainEnum.ARBEITSZEIT),
            this.stesDataService.getCode(DomainEnum.MOBILITAET),
            this.stesDataService.getCode(DomainEnum.FUEHRERAUSWEIS_KATEGORIE),
            this.stesDataService.getCode(DomainEnum.ARBEITSFORM),
            this.stesDataService.getCode(DomainEnum.ARBEITSFORMSTES),
            this.stesDataService.getStellensucheBearbeiten(this.stesId),
            this.stesDataService.getAllRegions('de')
        ).subscribe(
            ([arbeitszeitList, mobilitaetList, fuehrerausweisKategorieList, arbeitsformList, arbeitsformStes, stellensuche, regions]) => {
                this.arbeitSelectOptions = this.facade.formUtilsService.mapDropdownKurztext(arbeitszeitList);
                this.mobiliteatSelectOptions = this.facade.formUtilsService.mapDropdownKurztext(mobilitaetList);

                this.arbeitsformList = arbeitsformList.concat(arbeitsformStes);
                this.arbeitsformList.forEach(() => this.arbeitsformFormArray.push(new FormControl(null)));

                this.arbeitsortList = stellensuche.data.stesGrossregionList.concat(stellensuche.data.stesSuchregionList);
                this.arbeitsortList.forEach(() => this.arbeitsortFormArray.push(new FormControl(null)));

                this.unternehmenId = stellensuche.data.letzterArbeitgeberID === 0 ? null : stellensuche.data.letzterArbeitgeberID;

                this.stellensucheForm.reset(this.mapToForm(stellensuche.data, regions));

                this.setFuehrerausweisKategorieOptions(fuehrerausweisKategorieList, stellensuche.data.fuehrerAusweisKatList);

                this.changeDetectorRef.detectChanges();

                this.spinnerService.deactivate(STES_DETAILS_MODAL_SPINNER_CHANNEL);
            },
            error => {
                this.spinnerService.deactivate(STES_DETAILS_MODAL_SPINNER_CHANNEL);
            }
        );
    }

    getArbeitgeber(stellensuche: StesStellensucheDTO) {
        const letzterAG = stellensuche.unternehmen;
        const letzterAGBur = stellensuche.letzterArbeitgeberBurObject;
        const noga78 = this.checkNoga(stellensuche.letzterAGBekannt, letzterAG, letzterAGBur);

        if (stellensuche.letzterAGBekannt) {
            if (letzterAG) {
                return this.getLetzterArbeitgeber(letzterAG, noga78, stellensuche.letzterAgNoga);
            }
            if (letzterAGBur) {
                return this.getLetzterArbeitgeberBur(letzterAGBur, noga78, stellensuche.letzterAgNoga);
            }
        }

        return this.getOnlyNoga(stellensuche.letzterAgNoga);
    }

    getLetzterArbeitgeber(letzterAG: UnternehmenDTO, noga78: boolean, noga: NogaDTO) {
        return {
            letzterAGBekannt: true,
            name1: { unternehmenId: this.unternehmenId, name1: letzterAG.name1 },
            name2: letzterAG.name2,
            name3: letzterAG.name3,
            plz: letzterAG.plz ? `${letzterAG.plz.postleitzahl} ${this.dbTranslateService.translate(letzterAG.plz, 'ort')}` : `${letzterAG.plzAusland} ${letzterAG.ortAusland}`,
            land: letzterAG.staat ? this.dbTranslateService.translate(letzterAG.staat, 'name') : null,
            bur: letzterAG.burOrtEinheitObject ? letzterAG.burOrtEinheitObject.letzterAGBurNummer : letzterAG.burNummer,
            branche: letzterAG.nogaDTO ? `${letzterAG.nogaDTO.nogaCodeUp} / ${this.dbTranslateService.translate(letzterAG.nogaDTO, 'textlang')}` : null,
            teatigkeitBranche: noga78 ? `${noga.nogaCodeUp} / ${this.dbTranslateService.translate(noga, 'textlang')}` : null
        };
    }

    getLetzterArbeitgeberBur(letzterAGBur: BurOertlicheEinheitDTO, noga78: boolean, noga: NogaDTO) {
        return {
            letzterAGBekannt: true,
            name1: { unternehmenId: this.unternehmenId, name1: letzterAGBur.letzterAGName1 },
            name2: letzterAGBur.letzterAGName2,
            name3: letzterAGBur.letzterAGName3,
            plz: `${letzterAGBur.letzterAGPlz} ${letzterAGBur.letzterAGOrt}`,
            land: letzterAGBur.letzterAGLand ? this.dbTranslateService.translate(letzterAGBur.letzterAGLand, 'name') : '',
            bur: letzterAGBur.letzterAGBurNummer,
            branche: letzterAGBur.nogaDTO ? `${letzterAGBur.nogaDTO.nogaCodeUp} / ${this.dbTranslateService.translate(letzterAGBur.nogaDTO, 'textlang')}` : null,
            teatigkeitBranche: noga78 ? `${noga.nogaCodeUp} / ${this.dbTranslateService.translate(noga, 'textlang')}` : null
        };
    }

    getOnlyNoga(noga: NogaDTO) {
        return {
            letzterAGBekannt: false,
            teatigkeitBranche: noga ? `${noga.nogaCodeUp} / ${this.dbTranslateService.translate(noga, 'textlang')}` : null
        };
    }

    checkNoga(letzterAGBekannt: boolean, letzterAG: UnternehmenDTO, letzterAGBur: BurOertlicheEinheitDTO): boolean {
        return (
            letzterAGBekannt &&
            ((letzterAG && letzterAG.nogaDTO && letzterAG.nogaDTO.nogaCodeUp && letzterAG.nogaDTO.nogaCodeUp.length > 1 && letzterAG.nogaDTO.nogaCodeUp.substring(0, 2) === '78') ||
                (letzterAGBur && letzterAGBur.letzterAGNogaCode && letzterAGBur.letzterAGNogaCode.length > 1 && letzterAGBur.letzterAGNogaCode.substring(0, 2) === '78'))
        );
    }

    private getArbeitsformValues(arbeitsformen: Array<StesArbeitsformDTO>): boolean[] {
        const arbeitsformValues = [];

        this.arbeitsformList.forEach(element => {
            if (arbeitsformen.some(el => el.code.codeId === element.codeId)) {
                arbeitsformValues.push(true);
            } else {
                arbeitsformValues.push(false);
            }
        });

        return arbeitsformValues;
    }

    private getArbeitsorte(arbeitsorte: Array<RegionDTO>): string[] {
        const arbeitsortRegions = [];

        arbeitsorte.forEach(element => {
            switch (element.merkmal) {
                case Regions.Suchregion:
                    this.arbeitsortList.forEach(region => {
                        if (element.regionId === region.suchregionId) {
                            arbeitsortRegions.push(this.dbTranslateService.translate(element, 'region'));
                        }
                    });
                    break;
                case Regions.Grossregion:
                    this.arbeitsortList.forEach(region => {
                        if (element.regionId === region.grossregionId) {
                            arbeitsortRegions.push(this.dbTranslateService.translate(element, 'region'));
                        }
                    });
                    break;
                default:
                    break;
            }
        });

        return arbeitsortRegions;
    }

    private setFuehrerausweisKategorieOptions(options: any, dataBE: any) {
        const mappedOptions = options.map(this.mapMultiselect);

        mappedOptions.forEach(element => {
            if (dataBE.some(el => el.code.codeId === element.id)) {
                element.value = true;
            }
        });

        this.fuehrerausweisKategorieOptions = mappedOptions;
    }

    private mapMultiselect = element => {
        return {
            id: element.codeId,
            textDe: element.kurzTextDe,
            textIt: element.kurzTextIt,
            textFr: element.kurzTextFr,
            value: false
        };
    };
}
