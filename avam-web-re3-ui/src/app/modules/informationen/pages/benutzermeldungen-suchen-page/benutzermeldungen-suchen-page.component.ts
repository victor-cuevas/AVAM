import { Component, OnInit, ViewChild } from '@angular/core';
import { BenutzerMeldungViewDTO } from '@dtos/benutzerMeldungViewDTO';
import {
    BenutzermeldungenFormData,
    BenutzermeldungenSuchenFormComponent
} from '@modules/informationen/components/benutzermeldungen-suchen-form/benutzermeldungen-suchen-form.component';
import { forkJoin } from 'rxjs';
import { CodeDTO } from '@dtos/codeDTO';
import { KantonDTO } from '@dtos/kantonDTO';
import { DomainEnum } from '@shared/enums/domain.enum';
import { finalize, takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { BenutzermeldungService } from '@shared/services/benutzermeldung.service';
import { BaseResponseWrapperListBenutzerMeldungViewDTOWarningMessages } from '@dtos/baseResponseWrapperListBenutzerMeldungViewDTOWarningMessages';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-benutzermeldungen-suchen-page',
    templateUrl: './benutzermeldungen-suchen-page.component.html'
})
export class BenutzermeldungenSuchenPageComponent extends Unsubscribable implements OnInit {
    @ViewChild('suchenFormComponent') suchenFormComponent: BenutzermeldungenSuchenFormComponent;

    readonly formChannel = 'avam-benutzermeldungen-suchen-page.channel';
    readonly resultChannel = 'avam-benutzermeldungen-result-page.channel';
    benutzermeldungen: BenutzerMeldungViewDTO[] = [];
    searchDone: boolean;
    formData: BenutzermeldungenFormData;
    formStateKey: string;

    constructor(private service: BenutzermeldungService, private dataRestService: StesDataRestService, private facadeService: FacadeService) {
        super();
    }

    ngOnInit(): void {
        this.getData();
    }

    search(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        if (this.suchenFormComponent.searchForm.valid) {
            this.service.rest
                .search(this.suchenFormComponent.mapToDto())
                .pipe(
                    finalize(() => {
                        this.service.facade.spinnerService.deactivate(this.resultChannel);
                        this.searchDone = true;
                    })
                )
                .subscribe(
                    (response: BaseResponseWrapperListBenutzerMeldungViewDTOWarningMessages) => {
                        this.benutzermeldungen = response.data;
                    },
                    () => (this.benutzermeldungen = [])
                );
        } else {
            this.facadeService.fehlermeldungenService.showErrorMessage('stes.error.bearbeiten.pflichtfelder');
        }
    }

    reset(): void {}

    openBenutzermeldung(event: BenutzerMeldungViewDTO) {}

    private getData(): void {
        forkJoin<CodeDTO[], CodeDTO[], KantonDTO[]>([
            this.dataRestService.getCode(DomainEnum.BENUTZER_MELDUNG_TYP),
            this.dataRestService.getCode(DomainEnum.BENUTZER_MELDUNG_STATUS),
            this.dataRestService.getAllKantone()
        ])
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(([meldungstypRes, statiRes, kantoneRes]) => {
                this.formData = {
                    meldungstyp: meldungstypRes,
                    stati: statiRes,
                    kantone: kantoneRes
                };
            });
    }
}
