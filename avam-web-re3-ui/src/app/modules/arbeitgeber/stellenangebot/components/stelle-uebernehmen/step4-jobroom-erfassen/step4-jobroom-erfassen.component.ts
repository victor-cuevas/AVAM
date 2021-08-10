import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { Permissions } from '@shared/enums/permissions.enum';
import { Step4OsteErfassenFormComponent } from '@shared/components/unternehmen/oste-erfassen/step4-oste-erfassen-form/step4-oste-erfassen-form.component';
import { MeldungenVerifizierenWizardService } from '@shared/components/new/avam-wizard/meldungen-verifizieren-wizard.service';
import { OsteEgovParamDTO } from '@dtos/osteEgovParamDTO';
import { OsteDTO } from '@dtos/osteDTO';
import * as moment from 'moment';
import { FacadeService } from '@shared/services/facade.service';
import { finalize, takeUntil } from 'rxjs/operators';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { Unsubscribable } from 'oblique-reactive';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { WarningMessages } from '@dtos/warningMessages';
import { ActivatedRoute, Router } from '@angular/router';
import { OsteAnlegenParamDTO } from '@dtos/osteAnlegenParamDTO';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { HeaderService } from '@core/services/header.service';
import KeyEnum = WarningMessages.KeyEnum;

@Component({
    selector: 'avam-step4-jobroom-erfassen',
    templateUrl: './step4-jobroom-erfassen.component.html',
    styleUrls: ['./step4-jobroom-erfassen.component.scss']
})
export class Step4JobroomErfassenComponent extends Unsubscribable implements AfterViewInit, OnDestroy {
    @ViewChild('formComponent') formComponent: Step4OsteErfassenFormComponent;
    permissions: typeof Permissions = Permissions;
    channel = 'stes4OsteErfassen';

    constructor(
        public wizardService: MeldungenVerifizierenWizardService,
        private router: Router,
        private route: ActivatedRoute,
        private facadeService: FacadeService,
        private osteRestService: OsteDataRestService,
        private infopanelService: AmmInfopanelService,
        private headerService: HeaderService
    ) {
        super();
    }

    ngAfterViewInit() {
        this.infopanelService.updateInformation({ subtitle: 'arbeitgeber.oste.subnavmenuitem.bewirtschaftung' });
        if (this.wizardService.osteEgovAnlegenParamDTO) {
            setTimeout(() => this.formComponent.setForm(this.mapOsteEgovToOsteDto()), 1000);
        }
    }

    ngOnDestroy(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    reset() {
        if (this.formComponent.bewirtschaftungForm.dirty) {
            this.facadeService.fehlermeldungenService.closeMessage();
            this.facadeService.resetDialogService.reset(() => {
                this.formComponent.setForm(this.mapOsteEgovToOsteDto());
                this.formComponent.bewirtschaftungForm.markAsPristine();
            });
        }
    }

    save() {
        this.facadeService.fehlermeldungenService.closeMessage();
        if (this.formComponent.bewirtschaftungForm.valid) {
            this.facadeService.spinnerService.activate(this.channel);
            this.osteRestService
                .checkOsteStep(this.mapToDTO(), 4)
                .pipe(
                    takeUntil(this.unsubscribe),
                    finalize(() => {
                        this.facadeService.spinnerService.deactivate(this.channel);
                        OrColumnLayoutUtils.scrollTop();
                    })
                )
                .subscribe((response: BaseResponseWrapperLongWarningMessages) => {
                    if (!response.warning || !response.warning.filter((warningMessage: WarningMessages) => warningMessage.key === KeyEnum.DANGER).length) {
                        this.facadeService.notificationService.success('common.message.datengespeichert');
                        this.formComponent.bewirtschaftungForm.markAsPristine();
                        this.router.navigate([`../../../../../details/${this.wizardService.unternehmenId}/stellenangebote/stellenangebot/bewirtschaftung`], {
                            relativeTo: this.route,
                            queryParams: { osteId: response.data }
                        });
                        this.headerService.getJobroomMeldungenCount();
                    }
                });
        } else {
            OrColumnLayoutUtils.scrollTop();
            this.formComponent.ngForm.onSubmit(undefined);
            this.facadeService.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    private mapOsteEgovToOsteDto(): OsteDTO {
        const osteEgovParamDTO: OsteEgovParamDTO = this.wizardService.osteEgovAnlegenParamDTO;
        const currentUser = this.facadeService.authenticationService.getLoggedUser();
        const currentUserForAutosuggestDto = {
            benutzerId: currentUser.benutzerId,
            benutzerDetailId: Number(currentUser.benutzerDetailId),
            benutzerLogin: currentUser.benutzerLogin,
            nachname: currentUser.name,
            vorname: currentUser.vorname,
            benuStelleCode: currentUser.benutzerstelleCode,
            benutzerstelleId: currentUser.benutzerstelleId
        };
        return {
            zuweisungFreigeben: osteEgovParamDTO.zuweisungFreigeben,
            meldung: osteEgovParamDTO.zuweisungMeldung,
            zuweisungStop: osteEgovParamDTO.zuweisungsstopp,
            vorselektion: osteEgovParamDTO.ravVorselektion,
            zuweisungMax: osteEgovParamDTO.maxZuweisungen,
            stellenverantwortlicherDetailObject:
                osteEgovParamDTO.stellenverantwortungDTO && osteEgovParamDTO.stellenverantwortungDTO.benutzerId
                    ? osteEgovParamDTO.stellenverantwortungDTO
                    : currentUserForAutosuggestDto,
            angabenBewirt: osteEgovParamDTO.bewirtschWeitereAngaben,
            schlagwortList: osteEgovParamDTO.schlagworte.map(item => item.schlagwortObject),
            meldepflicht: false,
            meldepflichtBearbeitungId: 0,
            gleicheOste: 1,
            auftraggeberObject: null,
            sperrfrist: null,
            anmeldeDatum: new Date(),
            gueltigkeit: moment()
                .add(30, 'days')
                .toDate(),
            abmeldeDatum: null,
            abmeldeGrund: null,
            statusId: null,
            auftraggeberBurObject: null
        };
    }

    private mapToDTO(): OsteAnlegenParamDTO {
        const bewirtschaftung = this.formComponent.bewirtschaftungForm.controls;
        const currentUnternehmen: any = this.formComponent.bewirtschaftungForm.controls.stellenmeldung.value ? this.formComponent.getCurrentAuftraggeber() : null;
        return {
            ...this.wizardService.osteEgovAnlegenParamDTO,
            stellenverantwortungDTO: bewirtschaftung.stellenverantwortung['benutzerObject'],
            meldepflicht: bewirtschaftung.meldepflicht.value,
            zuweisungMeldung: bewirtschaftung.meldungBeiVermittlung.value,
            zuweisungFreigeben: bewirtschaftung.vermittlungenFreigegeben.value,
            ravVorselektion: bewirtschaftung.vorselektion.value,
            zuweisungsstopp: bewirtschaftung.vermittlungsstop.value,
            anzahlStellen: bewirtschaftung.anzhalstellen.value,
            maxZuweisungen: bewirtschaftung.zuweisungMax.value,
            auftraggeber: bewirtschaftung.stellenmeldung.value,
            auftraggeberBurId: currentUnternehmen ? currentUnternehmen.burOrtEinheitId : null,
            auftraggeberId: currentUnternehmen ? currentUnternehmen.unternehmenId : null,
            bewirtschWeitereAngaben: bewirtschaftung.weitereAngaben.value,
            schlagworte: this.getSchlagwortFromMultiselect(),
            sperrfrist: bewirtschaftung.sperrfristbis.value,
            jobroomInternPublikation: this.formComponent.internButtons.getCurrentValue().isYesSelected,
            jobroomInternAnonym: this.formComponent.internButtons.getCurrentValue().isAnonym,
            jobroomExternPublikation: this.formComponent.externButtons.getCurrentValue().isYesSelected,
            jobroomExternAnonym: this.formComponent.externButtons.getCurrentValue().isAnonym,
            publEures: this.formComponent.euresButtons.getCurrentValue().isYesSelected,
            publEuresAnonym: this.formComponent.euresButtons.getCurrentValue().isAnonym,
            meldeDatum: bewirtschaftung.anmeldeDatum.value,
            gueltigkeitsDatum: bewirtschaftung.unbegrentz.value ? new Date(9999, 11, 31) : bewirtschaftung.gueltigkeitsDatum.value
        };
    }

    private getSchlagwortFromMultiselect() {
        return this.formComponent.schlagworteOptions
            .filter(item => !!item.value)
            .map(item => {
                return {
                    schlagwortId: item.id
                };
            });
    }
}
