import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { StesZasRestService } from '@core/http/stes-zas-rest.service';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ZasAbgleichRequest } from '@shared/models/dtos/stes-zas-abgleich-request';
import { PersonVersichertenNrDTO } from '@dtos/personVersichertenNrDTO';
import { FormUtilsService } from '@app/shared';
import { SpinnerService } from 'oblique-reactive';
import { StesZasAbgleichenComponent } from '@stes/pages/details/pages/stes-details-personalien/stes-zas-abgleichen/stes-zas-abgleichen.component';
import { ZasAbgleichResponse } from '@shared/models/dtos/stes-zas-abgleich-response';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { StesZasDTO } from '@shared/models/dtos-generated/stesZasDTO';
import { BaseResponseWrapperListStesZasDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperListStesZasDTOWarningMessages';

@Injectable()
export class StesZasAbgleichService {
    private static readonly CHANNEL: string = 'personalien';
    private readonly modalOpts: NgbModalOptions = { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-xl', backdrop: 'static' };
    private subject: Subject<ZasAbgleichResponse> = new Subject();

    constructor(
        private readonly modalService: NgbModal,
        private formUtils: FormUtilsService,
        private spinnerService: SpinnerService,
        private stesZasRestService: StesZasRestService,
        private fehlermeldungService: FehlermeldungenService
    ) {
        //
    }

    getTakeOverZasEventEmitter(): Subject<ZasAbgleichResponse> {
        return this.subject;
    }

    createZasAbgleich(zasAbgleichRequest: ZasAbgleichRequest): void {
        if (!zasAbgleichRequest.personenstammdaten.controls.svNr.value) {
            this.fehlermeldungService.showMessage('stes.error.anmeldung.keinesvnr', 'danger');
            return;
        }
        if (!zasAbgleichRequest.personenstammdaten) {
            this.openModal();
        } else {
            this.spinnerService.activate(StesZasAbgleichService.CHANNEL);
            this.createZasAbgleichRequest(zasAbgleichRequest).subscribe((response: BaseResponseWrapperListStesZasDTOWarningMessages) => {
                const comp: StesZasAbgleichenComponent = this.openModal().componentInstance as StesZasAbgleichenComponent;
                comp.zasAbgleichRequest = zasAbgleichRequest;
                comp.zasResponse = response;
                this.spinnerService.deactivate(StesZasAbgleichService.CHANNEL);
            });
        }
    }

    takeOverZas(zasAbgleichResponse: ZasAbgleichResponse): void {
        this.subject.next(zasAbgleichResponse);
    }

    private openModal(): NgbModalRef {
        return this.modalService.open(StesZasAbgleichenComponent, this.modalOpts);
    }

    private createZasAbgleichRequest(zasAbgleichRequest: ZasAbgleichRequest): Observable<BaseResponseWrapperListStesZasDTOWarningMessages> {
        const controls: any = zasAbgleichRequest.personenstammdaten.controls;

        return this.stesZasRestService.createZasAbgleich({
            personenNr: zasAbgleichRequest.personenNr,
            namePersReg: controls.zasName.value,
            vornamePersReg: controls.zasVorname.value,
            nationalitaetObject: zasAbgleichRequest.nationalitaet,
            nationalitaetId: zasAbgleichRequest.nationalitaetId,
            geschlechtId: controls.geschlecht.value ? controls.geschlecht.value : 0,
            geburtsDatum: this.formUtils.parseDate(controls.geburtsdatum.value),
            letzterZASAbgleich: this.formUtils.parseDate(zasAbgleichRequest.letzterZASAbgleich),
            personStesId: zasAbgleichRequest.stesId,
            versichertenNrList: this.initVersichertenNrList(zasAbgleichRequest.bisherigeVersichertenNr, controls.svNr.value, zasAbgleichRequest.stesId)
        } as StesZasDTO);
    }

    private initVersichertenNrList(versichertenNrList: PersonVersichertenNrDTO[], svNr: number, stesId?: number): PersonVersichertenNrDTO[] {
        const svNrStr: string = String(svNr);
        const personVersichertenNrDTO: PersonVersichertenNrDTO = {
            personVersichertenNrId: 0,
            personStesId: stesId,
            versichertenNr: svNrStr,
            istAktuelleVersichertenNr: true
        } as PersonVersichertenNrDTO;

        if (!versichertenNrList) {
            return [personVersichertenNrDTO];
        }

        const notFound: boolean = versichertenNrList.findIndex((nr: PersonVersichertenNrDTO) => nr.versichertenNr === svNrStr) === -1;
        if (notFound) {
            versichertenNrList.push(personVersichertenNrDTO);
        } else {
            versichertenNrList.forEach((nr: PersonVersichertenNrDTO) => {
                nr.istAktuelleVersichertenNr = nr.versichertenNr === svNrStr;
            });
        }
        return versichertenNrList;
    }
}
