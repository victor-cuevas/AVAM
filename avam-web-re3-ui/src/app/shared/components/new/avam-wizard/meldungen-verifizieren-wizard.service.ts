import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { OsteEgovDTO } from '@dtos/osteEgovDTO';
import { FacadeService } from '@shared/services/facade.service';
import { OsteConstants } from '@modules/arbeitgeber/shared/enums/oste.enums';
import { Subject } from 'rxjs';
import * as moment from 'moment';
import { AbbrechenModalComponent, FormUtilsService } from '@app/shared';
import { AbbrechenModalActionWizard } from '@shared/classes/abbrechen-modal-action-wizard';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import { OsteEgovParamDTO } from '@dtos/osteEgovParamDTO';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { UnternehmenResponseDTO } from '@dtos/unternehmenResponseDTO';
import { StaatDTO } from '@dtos/staatDTO';

@Injectable({
    providedIn: 'root'
})
export class MeldungenVerifizierenWizardService {
    list: any = [];
    currentStep: number;
    osteEgovDTO: OsteEgovDTO;
    osteEgovAnlegenParamDTO: OsteEgovParamDTO;
    osteEgovId;
    unternehmenId;
    unternehmenDto: UnternehmenResponseDTO;
    anredenDomain: any[];
    arbeitsFormDomain: any[];
    meldeArtDomain: any[];
    grundDomain: any[];
    osteEgovViewObject: OsteEgovViewObject = {
        stellenantritt: '',
        anstellungsdauer: '',
        besondereArbeitsformen: '',
        erfasstAm: '',
        meldeart: '',
        ablehnungDatum: '',
        ablehnungGrund: '',
        staat: ''
    };
    onDataChange$: Subject<any> = new Subject();
    finishedSteps = {
        step0: false,
        step1: false,
        step2: false,
        step3: false,
        step4: false
    };
    disabledButtons = false;
    private readonly ANMELDUNG_CODE = '0';
    private staat: any;

    constructor(
        private searchSession: SearchSessionStorageService,
        private router: Router,
        private facadeService: FacadeService,
        private modalService: NgbModal,
        private interactionService: StesComponentInteractionService
    ) {}

    resetData() {
        this.finishedSteps = {
            step0: false,
            step1: false,
            step2: false,
            step3: false,
            step4: false
        };
        this.setOsteEgovId(null);
        this.searchSession.clearStorageByKey('jobroom-arbeitgeber-form');
        this.searchSession.restoreDefaultValues('jobroom-arbeitgeber-table');
        this.disabledButtons = false;
    }

    setOsteEgovAnlegenParamDTO(osteEgovAnlegenParamDTO: OsteEgovParamDTO) {
        this.osteEgovAnlegenParamDTO = osteEgovAnlegenParamDTO;
    }

    setOsteEgovId(id) {
        this.osteEgovId = id;
    }

    setUnternehmenId(id) {
        this.unternehmenId = id;
    }

    setUnternehmenDTO(unternehmenDto: UnternehmenResponseDTO) {
        this.unternehmenDto = unternehmenDto;
    }

    setOsteEgovDTO(osteEgovDTO: OsteEgovDTO) {
        this.osteEgovDTO = osteEgovDTO;
        this.transformData();
        this.onDataChange$.next();
    }

    transformData() {
        this.setStellenAntritt();
        this.setAnstellungsdauer();
        this.setBesondereArbeitsformen();
        this.setAnmeldeDatum();
        this.setMeldeart();
        this.setAblehnungsGrund();
        this.setAblehnungsDatum();
        this.setStaat();
    }

    setMeldeart() {
        this.osteEgovViewObject.meldeart = this.facadeService.dbTranslateService.translate(this.meldeArtDomain.find(item => item.code === this.ANMELDUNG_CODE), 'text');
    }

    setAnmeldeDatum() {
        this.osteEgovViewObject.erfasstAm = this.facadeService.formUtilsService.formatDateNgx(this.osteEgovDTO.erfasstAm, FormUtilsService.GUI_DATE_FORMAT);
    }

    setStaat() {
        this.osteEgovViewObject.staat = this.staat && this.staat.nameDe ? this.facadeService.dbTranslateService.translate(this.staat, 'name') : this.staat;
    }

    setBesondereArbeitsformen() {
        if (this.osteEgovDTO.arbeitsformList != null && this.osteEgovDTO.arbeitsformList.length) {
            let sbArbeitsformen = '';
            this.osteEgovDTO.arbeitsformList.forEach((item, index) => {
                const codeArbeitsform = this.arbeitsFormDomain.find(i => i.code === item.arbeitsformCode.trim());
                if (
                    codeArbeitsform != null &&
                    codeArbeitsform[`text${this.facadeService.translateService.currentLang[0].toUpperCase()}${this.facadeService.translateService.currentLang[1]}`] != null
                ) {
                    if (index > 0 && index < this.osteEgovDTO.arbeitsformList.length) {
                        sbArbeitsformen += ', ';
                    }
                    sbArbeitsformen +=
                        codeArbeitsform[`kurzText${this.facadeService.translateService.currentLang[0].toUpperCase()}${this.facadeService.translateService.currentLang[1]}`];
                }
            });
            this.osteEgovViewObject.besondereArbeitsformen = sbArbeitsformen;
        }
    }

    setAnstellungsdauer() {
        this.osteEgovViewObject.anstellungsdauer = '';
        if (this.osteEgovDTO.fristTyp === OsteConstants.FRIST_TYP_UNBEFRISTET) {
            this.osteEgovViewObject.anstellungsdauer = 'arbeitgeber.oste.label.unbefristet';
        } else if (this.osteEgovDTO.fristTyp === OsteConstants.FRIST_TYP_KURZEINSATZ) {
            this.osteEgovViewObject.anstellungsdauer = this.facadeService.translateService.instant('arbeitgeber.oste.label.kurzeinsatz');
        } else if (this.osteEgovDTO.vertragsdauer != null && this.osteEgovDTO.vertragsdauer.trim().length >= 10) {
            this.osteEgovViewObject.anstellungsdauer = this.facadeService.translateService.instant('arbeitgeber.oste.label.befristetbis');
            const datumVertragsdauer = this.osteEgovDTO.vertragsdauer.trim();
            this.osteEgovViewObject.anstellungsdauer += ` ${datumVertragsdauer.substring(8, 10)}.${datumVertragsdauer.substring(5, 7)}.${datumVertragsdauer.substring(0, 4)}`;
        }
        if (this.osteEgovViewObject.anstellungsdauer) {
            this.osteEgovViewObject.anstellungsdauer = this.osteEgovViewObject.anstellungsdauer.trim();
        }
    }

    setStellenAntritt() {
        this.osteEgovViewObject.stellenantritt = '';
        if (this.osteEgovDTO.abSofort) {
            this.osteEgovViewObject.stellenantritt = this.facadeService.translateService.instant('arbeitgeber.oste.label.absofort');
            if (this.osteEgovDTO.stellenantritt != null && this.osteEgovDTO.stellenantritt.trim().length >= 10) {
                const stellenAntrittDatum = this.osteEgovDTO.stellenantritt.trim();
                this.osteEgovViewObject.stellenantritt += ` / ${this.facadeService.translateService.instant('common.label.ab')}  ${stellenAntrittDatum.substring(
                    8,
                    10
                )}.${stellenAntrittDatum.substring(5, 7)}.${stellenAntrittDatum.substring(0, 4)}`;
            }
        } else if (this.osteEgovDTO.stellenantritt != null && this.osteEgovDTO.stellenantritt.trim().length >= 10) {
            const stellenAntrittDatum = this.osteEgovDTO.stellenantritt.trim();
            this.osteEgovViewObject.stellenantritt = `${this.facadeService.translateService.instant('common.label.ab')} ${stellenAntrittDatum.substring(
                8,
                10
            )}.${stellenAntrittDatum.substring(5, 7)}.${stellenAntrittDatum.substring(0, 4)}`;
        }
        if (this.osteEgovViewObject.stellenantritt) {
            this.osteEgovViewObject.stellenantritt = this.osteEgovViewObject.stellenantritt.trim();
        }
    }

    setGrundDomain(grundDomain) {
        this.grundDomain = grundDomain;
    }

    setAnredenDomain(anredenDomain) {
        this.anredenDomain = anredenDomain;
    }

    setArbeitsFormDomain(arbeitsFormDomain) {
        this.arbeitsFormDomain = arbeitsFormDomain;
    }

    setMeldeArtDomain(meldeArtDomain) {
        this.meldeArtDomain = meldeArtDomain;
    }

    navigateStep(clickedStep: number) {
        switch (clickedStep) {
            case -1:
                this.router.navigate([`arbeitgeber/stellenangebot/jobroom-meldungen/suchen`]);
                break;
            case 0:
                this.router.navigate(['arbeitgeber/stellenangebot/jobroom-meldungen/verifizieren'], { queryParams: { osteEgovId: this.osteEgovId } });
                break;
            case 1:
                this.router.navigate(['arbeitgeber/stellenangebot/jobroom-meldungen/verifizieren/zuordnen'], { queryParams: { osteEgovId: this.osteEgovId } });
                this.finishedSteps.step0 = true;
                break;
            case 2:
                this.router.navigate(['arbeitgeber/stellenangebot/jobroom-meldungen/verifizieren/uebernehmen'], { queryParams: { osteEgovId: this.osteEgovId } });
                break;
            case 3:
                this.router.navigate(['arbeitgeber/stellenangebot/jobroom-meldungen/verifizieren/uebernehmen'], {
                    queryParams: { osteEgovId: this.osteEgovId, unternehmenId: this.unternehmenId }
                });
                break;
            case 4:
                this.router.navigate(['arbeitgeber/stellenangebot/jobroom-meldungen/verifizieren/uebernehmen/step2'], {
                    queryParams: { osteEgovId: this.osteEgovId, unternehmenId: this.unternehmenId }
                });
                break;
            case 5:
                this.router.navigate(['arbeitgeber/stellenangebot/jobroom-meldungen/verifizieren/uebernehmen/step3'], {
                    queryParams: { osteEgovId: this.osteEgovId, unternehmenId: this.unternehmenId }
                });
                break;
            case 6:
                this.router.navigate(['arbeitgeber/stellenangebot/jobroom-meldungen/verifizieren/uebernehmen/step4'], {
                    queryParams: { osteEgovId: this.osteEgovId, unternehmenId: this.unternehmenId }
                });
                break;
        }
    }

    movePosition(clickedStep: number) {
        const isBackward = this.currentStep > clickedStep;
        const isFormDirty = this.list.toArray()[this.currentStep].isDirty;
        if (isFormDirty && isBackward) {
            this.openModal(clickedStep);
        } else {
            this.selectCurrentStep(clickedStep);
        }
    }

    openModal(clickedStep) {
        const modalRef = this.modalService.open(AbbrechenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.componentInstance.setModalAction(new AbbrechenModalActionWizard(this.interactionService, this.modalService));
        modalRef.result.then(
            () => {
                this.interactionService.navigateAwayStep.next(false);
            },
            () => {
                return;
            }
        );

        const navigateAway = this.interactionService.navigateAwayStep.subscribe(res => {
            if (res) {
                this.selectCurrentStep(clickedStep);
            }
            navigateAway.unsubscribe();
        });
    }

    selectCurrentStep(currentStep: number) {
        if (currentStep >= 0 && currentStep < this.list.length) {
            const stepList = this.list.toArray();
            stepList[this.currentStep].isActive = false;

            for (let step = this.currentStep; step < currentStep; step++) {
                if (step !== 2) {
                    stepList[step].isValid = true;
                }
            }
            stepList[currentStep].isValid = false;
            stepList[currentStep].isActive = true;
            stepList[currentStep].isDisabled = false;
            if (this.currentStep < currentStep) {
                this.setFollowingStepsInvalid(currentStep);
                this.makeStepDisabled(currentStep);
            }
            if (currentStep > 2) {
                stepList[2].isActive = true;
                stepList[currentStep].isDirty = true;
            } else {
                stepList[2].isActive = false;
            }
            this.currentStep = currentStep;
        }
        this.navigateStep(currentStep);
    }

    initSteps() {
        this.currentStep = 0;
        this.list.forEach((element, index) => {
            element.isActive = false;
            element.isDefault = false;
            element.isDirty = false;
            element.isDisabled = true;
            element.isInvalid = false;
            element.isLoading = false;
            element.isValid = false;
            if (index > 2) {
                element.isVisible = false;
            }
        });
        this.list.first.isActive = true;
        this.list.first.isDisabled = false;
    }

    deactiveSteps() {
        this.list.forEach(step => {
            step.isActive = false;
            step.isDefault = false;
            step.isDirty = false;
            step.isDisabled = true;
            step.isInvalid = false;
            step.isLoading = false;
            step.isValid = false;
        });
    }

    activateSpinner(channel: string) {
        this.facadeService.spinnerService.activate(channel);
        this.deactivateWizard();
    }

    deactivateSpinner(channel: string) {
        this.facadeService.spinnerService.deactivate(channel);
        this.activateWizard();
        OrColumnLayoutUtils.scrollTop();
    }

    navigateToMeldungenUebersicht() {
        this.movePosition(-1);
    }

    private activateWizard() {
        if (this.list) {
            this.list.forEach(step => {
                step.isLoading = false;
            });
        }
    }

    private deactivateWizard() {
        if (this.list) {
            this.list.forEach(step => {
                step.isLoading = true;
            });
        }
    }

    private makeStepDisabled(step: number) {
        for (let i = step; i < this.list.length; i++) {
            if (step > 2) {
                this.list.toArray()[2].isActive = true;
                this.list.toArray()[2].isDisabled = false;
                this.list.toArray()[i].isVisible = true;
                this.list.toArray()[i].isDirty = true;
                if (i > step) {
                    this.list.toArray()[i].isDisabled = true;
                }
            }
        }
    }

    private setFollowingStepsInvalid(step: number) {
        for (let i = step; i < this.list.length; i++) {
            this.list.toArray()[i].isValid = false;
        }
    }

    private setAblehnungsDatum() {
        if (this.osteEgovDTO.ablehnungDatum) {
            const date = moment(this.osteEgovDTO.ablehnungDatum.substring(0, 10), 'YYYY-MM-DD').toDate();
            this.osteEgovViewObject.ablehnungDatum = this.facadeService.formUtilsService.formatDateNgx(new Date(date), FormUtilsService.GUI_DATE_FORMAT);
        }
    }

    private setAblehnungsGrund() {
        if (this.osteEgovDTO.ablehnungGrundEgovCode) {
            this.osteEgovViewObject.ablehnungGrund = this.facadeService.dbTranslateService.translate(this.osteEgovDTO.ablehnungGrundEgovCode, 'text');
        }
    }

    setOsteEgovStaat(staat: StaatDTO) {
        if (staat) {
            this.staat = staat;
        } else {
            this.staat = this.osteEgovDTO.untLand;
        }
        this.setStaat();
    }
}

export interface OsteEgovViewObject {
    stellenantritt: string;
    anstellungsdauer: string;
    besondereArbeitsformen: string;
    erfasstAm: string;
    meldeart: string;
    ablehnungDatum: string;
    ablehnungGrund: string;
    staat: any;
}
