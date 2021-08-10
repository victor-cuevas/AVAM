import { Observable, Subscription } from 'rxjs';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { CodeDTO } from '@dtos/codeDTO';
import { KantonDTO } from '@dtos/kantonDTO';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { UnternehmenDetailsDTO } from '@dtos/unternehmenDetailsDTO';
import { AmmInfopanelService, InfobarData } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { BaseResponseWrapperListBetriebsabteilungDTOWarningMessages } from '@dtos/baseResponseWrapperListBetriebsabteilungDTOWarningMessages';
import { ActivatedRoute } from '@angular/router';
import { StaatDTO } from '@dtos/staatDTO';
import { FormGroup } from '@angular/forms';
import { ErweiterteSucheComponent, GenericConfirmComponent } from '@app/shared';
import { first } from 'rxjs/operators';
import { FacadeService } from '@shared/services/facade.service';
import { BetriebsabteilungDTO } from '@dtos/betriebsabteilungDTO';
import { DropdownOption } from '@shared/services/forms/form-utils.service';
import { KaeSweConstant } from '@modules/arbeitgeber/shared/enums/kaeswe.enums';
import * as moment from 'moment';

export abstract class KaeSweService {
    closeBearbeitenNavItemSubscription: Subscription;
    closeErfassenNavItemSubscription: Subscription;

    protected constructor(
        protected stesRestService: StesDataRestService,
        protected unternehmenRestService: UnternehmenRestService,
        protected infopanelService: AmmInfopanelService,
        protected facadeService: FacadeService
    ) {}

    kantonMapper = (element: KantonDTO) => {
        return {
            code: element.kantonsKuerzel,
            value: element.kantonsKuerzel,
            labelFr: element.nameFr,
            labelIt: element.nameIt,
            labelDe: element.nameDe
        } as KantonType;
    };

    abteilungenMapper = (element: BetriebsabteilungDTO) => {
        return {
            value: element.betriebsabteilungId,
            code: `${element.abteilungNr}`,
            codeId: element.betriebsabteilungId,
            labelFr: element.abteilungName,
            labelIt: element.abteilungName,
            labelDe: element.abteilungName
        } as DropdownOption;
    };

    updateTitle(data: InfobarData): void {
        this.infopanelService.updateInformation(data);
    }

    getStaatSwiss(): Observable<StaatDTO> {
        return this.stesRestService.getStaatSwiss();
    }

    getCode(domain: string): Observable<Array<CodeDTO>> {
        return this.stesRestService.getCode(domain);
    }

    getCodeBy(domain: string, code: string): Observable<CodeDTO> {
        return this.stesRestService.codeSearch(domain, code);
    }

    getAllKantone(): Observable<KantonDTO[]> {
        return this.stesRestService.getAllKantone();
    }

    getUnternehmen(unternehmenId: number): Observable<UnternehmenDetailsDTO> {
        return this.unternehmenRestService.getUnternehmenDetailsById(unternehmenId);
    }

    getBetriebsAbteilungen(unternehmenId: number): Observable<BaseResponseWrapperListBetriebsabteilungDTOWarningMessages> {
        return this.unternehmenRestService.getBetriebsabteilungen(unternehmenId);
    }

    resetCloseBearbeitenSubscription(): void {
        if (this.closeBearbeitenNavItemSubscription) {
            this.closeBearbeitenNavItemSubscription.unsubscribe();
            this.closeBearbeitenNavItemSubscription = null;
        }
    }

    resetCloseErfassenSubscription(): void {
        if (this.closeErfassenNavItemSubscription) {
            this.closeErfassenNavItemSubscription.unsubscribe();
            this.closeErfassenNavItemSubscription = null;
        }
    }

    redirectToErfassen(relativeTo: ActivatedRoute): void {
        this.redirect(`./erfassen`, relativeTo);
    }

    redirectToBearbeiten(relativeTo: ActivatedRoute, unternehmenId: number, id: number): void {
        this.redirect(`./bearbeiten`, relativeTo, id);
    }

    redirectToBearbeitenAfterCreate(relativeTo: ActivatedRoute, id: number): void {
        this.redirect(`../bearbeiten`, relativeTo, id);
    }

    redirectToCopy(relativeTo: ActivatedRoute, unternehmenId: number, id: number): void {
        this.redirect(`../erfassen`, relativeTo, id);
    }

    redirectToParent(relativeTo: ActivatedRoute): void {
        this.redirect(`../`, relativeTo);
    }

    redirectToVoranmeldung(relativeTo: ActivatedRoute, id: number): void {
        this.redirect(`./`, relativeTo, id);
    }

    abstract redirect(commands: any, relativeTo?: ActivatedRoute, id?: number): void;

    storeErweiterteSuche(erweiterteSucheComponent: ErweiterteSucheComponent): any[] {
        const ret = [];
        if (!erweiterteSucheComponent) {
            return ret;
        }
        const esArray = erweiterteSucheComponent.getExtraCriteria() as FormGroup[];
        esArray.forEach(crit => {
            const val = {
                comparatorId: crit.controls.comparatorId.value,
                searchFieldId: crit.controls.searchFieldId.value,
                searchFreeText: crit.controls.searchFreeText.value,
                searchLevel1: crit.controls.searchLevel1.value,
                searchLevel3: crit.controls.searchLevel3.value,
                searchValue: crit.controls.searchValue.value
            };
            ret.push(val);
        });
        return ret;
    }

    restoreErweiterteSuche(state: any, erweiterteSucheComponent: ErweiterteSucheComponent, callback: (fromSubscription: boolean) => void): void {
        if (erweiterteSucheComponent && state.fields.erweiterteSuche && state.fields.erweiterteSuche.length > 0) {
            if (erweiterteSucheComponent.staticChildrenOptions.length > 0) {
                this.restoreErweiterteSucheParams(state, erweiterteSucheComponent);
                if (callback) {
                    callback(false);
                }
            } else {
                erweiterteSucheComponent.extraCriteriaLoaded.pipe(first()).subscribe(() => {
                    this.restoreErweiterteSucheParams(state, erweiterteSucheComponent);
                    if (callback) {
                        callback(true);
                    }
                });
            }
        } else {
            if (callback) {
                callback(false);
            }
        }
    }

    create(dto: UnternehmenDetailsDTO, aktivStatusCodeId: number, route: ActivatedRoute): void {
        if (!dto) {
            return;
        }
        if (this.checkBsp2(dto, aktivStatusCodeId)) {
            const modalRef = this.facadeService.openModalFensterService.openModal(GenericConfirmComponent);
            modalRef.result.then((result: any) => {
                if (result) {
                    this.redirectToErfassen(route);
                }
            });
            const component: GenericConfirmComponent = modalRef.componentInstance as GenericConfirmComponent;
            component.titleLabel = 'common.button.entscheidErfassen';
            component.promptLabel = 'kaeswe.message.entscheidbeiinaktivemunternehmen';
            component.secondaryButton = 'common.button.neinAbbrechen';
            component.primaryButton = 'common.button.JaEntscheidErfassen';
        } else {
            this.redirectToErfassen(route);
        }
    }

    checkBsp1(dto: UnternehmenDetailsDTO, aktivStatusCodeId: number): boolean {
        return this.isUnternehmenAktiv(dto, aktivStatusCodeId) || (isNaN(dto.nachfolgerId) || dto.nachfolgerId < 1);
    }

    getMessageForTransferAlk(dto: any, transferAlkCodes: CodeDTO[]): string {
        if (!dto.transferAsal) {
            return this.getAlkDescription(KaeSweConstant.TRANSFER_ALK_DATEN_NICHTUEBERMITTELT, transferAlkCodes);
        }

        if (dto.transferAsal && dto.transferAsalDatum) {
            return `${this.getAlkDescription(KaeSweConstant.TRANSFER_ALK_DATEN_UEBERMITTELT, transferAlkCodes)} ${this.formatted(dto.transferAsalDatum)}`;
        }

        return this.getAlkDescription(KaeSweConstant.TRANSFER_ALK_DATEN_UEBERMITTELT, transferAlkCodes);
    }

    getAlkDescription(code: string, transferAlkCodes: CodeDTO[]): string {
        return this.facadeService.dbTranslateService.translate(transferAlkCodes.find(c => c.code === code), 'text');
    }

    formatted(date: Date): string {
        if (!date) {
            return '';
        }
        return moment(date).format(KaeSweConstant.DATE_FORMAT);
    }

    //The DTO defines a couple of fields as Date.
    //The problem is that when the DTO comes from REST
    //call, the REST sever sends a millisecond value.
    //Because the typescript is transpiled to javascript,
    //we lost the type information. Therefore the HttpClient
    //doesn't know, that those fields are date, so it will
    //just the number value. This, we receive a number in
    //this ts parameter despite the Date type
    asDate(ts: Date): Date {
        if (!ts) {
            return null;
        }

        return new Date(ts);
    }

    private restoreErweiterteSucheParams(state, erweiterteSucheComponent: ErweiterteSucheComponent): void {
        for (let i = 0; i < state.fields.erweiterteSuche.length; i++) {
            erweiterteSucheComponent.onAddExtraCriteria();
            erweiterteSucheComponent.criteria.controls[i].setValue(state.fields.erweiterteSuche[i]);
        }
    }

    private checkBsp2(dto: UnternehmenDetailsDTO, aktivStatusCodeId: number): boolean {
        return !this.isUnternehmenAktiv(dto, aktivStatusCodeId) && (isNaN(dto.nachfolgerId) || dto.nachfolgerId <= 0);
    }

    private isUnternehmenAktiv(dto: UnternehmenDetailsDTO, aktivStatusCodeId: number): boolean {
        if (!dto || !dto.statusObject) {
            return true;
        }
        return dto.statusObject.codeId === aktivStatusCodeId;
    }
}

export interface KantonType {
    code: string;
    value: string;
    labelFr: string;
    labelIt: string;
    labelDe: string;
}

export interface ReferencedKaeSweObject {
    id: number;
    entscheidNr: number;
    statusCode: string;
}
