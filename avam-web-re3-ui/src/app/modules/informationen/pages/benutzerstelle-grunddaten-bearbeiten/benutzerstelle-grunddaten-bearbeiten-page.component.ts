import { Component, ViewChild } from '@angular/core';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { ActivatedRoute } from '@angular/router';
import { BenutzerstelleGrunddaten } from '@modules/informationen/components/benutzerstelle-grunddaten-form/benutzerstelle-grunddaten';
import { DomainEnum } from '@shared/enums/domain.enum';
import { forkJoin } from 'rxjs';
import { BenutzerstelleService } from '@shared/services/benutzerstelle.service';
import { finalize } from 'rxjs/operators';
import { BenutzerstelleBearbeitenBase } from '@modules/informationen/components/benutzerstelle-bearbeiten/benutzerstelle-bearbeiten.base';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { BaseResponseWrapperBenutzerstelleObjectDTOWarningMessages } from '@dtos/baseResponseWrapperBenutzerstelleObjectDTOWarningMessages';
import { BenutzerstelleGrunddatenFormComponent } from '@modules/informationen/components/benutzerstelle-grunddaten-form/benutzerstelle-grunddaten-form.component';
import { BenutzerstelleObjectDTO } from '@dtos/benutzerstelleObjectDTO';
import { Permissions } from '@shared/enums/permissions.enum';
import { CodeDTO } from '@dtos/codeDTO';
import { InformationenPaths } from '@shared/enums/stes-navigation-paths.enum';

@Component({
    selector: 'avam-benutzerstelle-grunddaten-bearbeiten-page',
    templateUrl: './benutzerstelle-grunddaten-bearbeiten-page.component.html'
})
export class BenutzerstelleGrundDatenBearbeitenPageComponent extends BenutzerstelleBearbeitenBase implements DeactivationGuarded {
    readonly savePermission: Permissions = Permissions.INFORMATIONEN_VERZEICHNISSE_BENUTZERSTELLE_GRUNDDATEN_SPEICHERN;

    @ViewChild('form') form: BenutzerstelleGrunddatenFormComponent;
    data: BenutzerstelleGrunddaten;

    benutzerTypReadOnly = false;

    constructor(route: ActivatedRoute, service: BenutzerstelleService) {
        super(service, route, 'verzeichnisse.subnavmenuitem.benutzerstellegrunddaten');
    }

    canDeactivate(): boolean {
        return this.form.formGroup.dirty;
    }

    save(): void {
        this.service.facade.fehlermeldungenService.closeMessage();
        if (this.form.formGroup.invalid) {
            this.form.ngForm.onSubmit(undefined);
            this.service.facade.fehlermeldungenService.showErrorMessage('stes.error.bearbeiten.pflichtfelder');
            OrColumnLayoutUtils.scrollTop();
        } else {
            this.service.facade.spinnerService.activate(this.channel);
            this.service.rest
                .update(this.form.mapToDto(this.data.dto))
                .pipe(finalize(() => this.deactivateSpinnerAndScrollTop()))
                .subscribe((response: BaseResponseWrapperBenutzerstelleObjectDTOWarningMessages) => {
                    this.service.facade.notificationService.success('common.message.datengespeichert');
                    this.data = {
                        ...this.data,
                        dto: response.data
                    };
                });
        }
    }

    protected loadFormData(benutzerstelleId: number): void {
        this.service.facade.spinnerService.activate(this.channel);
        forkJoin<CodeDTO[], BaseResponseWrapperBenutzerstelleObjectDTOWarningMessages>([
            this.service.dataRest.getCode(DomainEnum.BENUTZERSTELLETYP),
            this.service.rest.get(benutzerstelleId)
        ])
            .pipe(finalize(() => this.service.facade.spinnerService.deactivate(this.channel)))
            .subscribe(([benutzerstellType, benutzerstelle]) => {
                this.data = {
                    dto: this.fixPostfach(benutzerstelle.data),
                    benutzerstelleTypeOptions: benutzerstellType
                };
                this.benutzerTypReadOnly = this.data.dto.enabled !== 'TRUE';
            });
    }

    private fixPostfach(data: BenutzerstelleObjectDTO): BenutzerstelleObjectDTO {
        if (data.postPostfach === 0) {
            data.postPostfach = undefined;
        }
        return data;
    }

    zuruecksetzen() {
        if (this.form.formGroup.dirty) {
            this.service.facade.resetDialogService.reset(() => {
                this.service.facade.fehlermeldungenService.closeMessage();
                this.loadFormData(this.benutzerstelleId);
            });
        }
    }

    abbrechen() {
        this.service.router.navigate([`${InformationenPaths.BASE}/${InformationenPaths.VERZEICHNISSE_BENUTZERSTELLEN_SUCHEN}`]);
    }
}
