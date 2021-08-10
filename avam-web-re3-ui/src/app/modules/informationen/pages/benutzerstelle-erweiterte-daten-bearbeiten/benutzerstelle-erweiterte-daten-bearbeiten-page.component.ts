import { Component, ViewChild } from '@angular/core';
// prettier-ignore
import { BenutzerstelleErweiterteDaten } from
        '@modules/informationen/components/benutzerstelle-erweiterte-daten-bearbeiten-form/benutzerstelle-erweiterte-daten';
import { DomainEnum } from '@shared/enums/domain.enum';
import { SpracheEnum } from '@shared/enums/sprache.enum';
import { CodeDTO } from '@dtos/codeDTO';
// prettier-ignore
import { BenutzerstelleErweiterteDatenBearbeitenFormComponent } from
        '@modules/informationen/components/benutzerstelle-erweiterte-daten-bearbeiten-form/benutzerstelle-erweiterte-daten-bearbeiten-form.component';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { BenutzerstelleService } from '@shared/services/benutzerstelle.service';
import { forkJoin } from 'rxjs';
// prettier-ignore
import {BaseResponseWrapperBenutzerstelleObjectDTOWarningMessages} from
        '@dtos/baseResponseWrapperBenutzerstelleObjectDTOWarningMessages';
import { ActivatedRoute } from '@angular/router';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { InformationenPaths } from '@shared/enums/stes-navigation-paths.enum';
import { Permissions } from '@shared/enums/permissions.enum';
import { BenutzerstelleBearbeitenBase } from '@modules/informationen/components/benutzerstelle-bearbeiten/benutzerstelle-bearbeiten.base';

@Component({
    selector: 'avam-benutzerstelle-erweiterte-daten-bearbeiten-page',
    templateUrl: './benutzerstelle-erweiterte-daten-bearbeiten-page.component.html'
})
export class BenutzerstelleErweiterteDatenBearbeitenPageComponent extends BenutzerstelleBearbeitenBase implements DeactivationGuarded {
    @ViewChild('form') form: BenutzerstelleErweiterteDatenBearbeitenFormComponent;
    data: BenutzerstelleErweiterteDaten;
    readonly savePermission: Permissions = Permissions.INFORMATIONEN_VERZEICHNISSE_BENUTZERSTELLE_ERWEITERT_SPEICHERN;

    constructor(protected service: BenutzerstelleService, route: ActivatedRoute) {
        super(service, route, 'verzeichnisse.subnavmenuitem.benutzerstelleerweitert');
    }

    canDeactivate(): boolean {
        return this.form.canDeactivate();
    }

    cancel(): void {
        this.service.router.navigate([`${InformationenPaths.BASE}/${InformationenPaths.VERZEICHNISSE_BENUTZERSTELLEN_SUCHEN}`]);
    }

    save(): void {
        this.service.facade.fehlermeldungenService.closeMessage();
        if (this.form.formGroup.invalid) {
            this.form.ngForm.onSubmit(undefined);
            this.service.facade.fehlermeldungenService.showErrorMessage('stes.error.bearbeiten.pflichtfelder');
            OrColumnLayoutUtils.scrollTop();
        } else {
            this.service.facade.spinnerService.activate(this.channel);
            this.service.rest.update(this.form.mapToDto()).subscribe(
                (response: BaseResponseWrapperBenutzerstelleObjectDTOWarningMessages) => {
                    this.data = {
                        ...this.data,
                        dto: response.data
                    };
                    this.deactivateSpinnerAndScrollTop();
                    this.service.facade.notificationService.success('common.message.datengespeichert');
                },
                () => this.deactivateSpinnerAndScrollTop()
            );
        }
    }

    protected loadFormData(benutzerstelleId: number): void {
        forkJoin<CodeDTO[], BaseResponseWrapperBenutzerstelleObjectDTOWarningMessages>([
            this.service.dataRest.getCode(DomainEnum.SPRACHE),
            this.service.rest.get(this.benutzerstelleId)
        ]).subscribe(
            ([spracheOptions, getDto]) => {
                this.data = {
                    dto: getDto.data,
                    spracheOptions: spracheOptions.filter(el => el.code !== SpracheEnum.RAETOROMANISCH)
                };
                this.service.facade.spinnerService.deactivate(this.channel);
            },
            () => this.service.facade.spinnerService.deactivate(this.channel)
        );
    }
}
