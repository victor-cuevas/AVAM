import { Component, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { DomainEnum } from '@shared/enums/domain.enum';
import { finalize } from 'rxjs/operators';
import { RollenGrunddatenFormComponent, RollenGrunddatenFormData } from '@modules/informationen/components/rollen-grunddaten-form/rollen-grunddaten-form.component';
import { ActivatedRoute } from '@angular/router';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { RolleDTO } from '@dtos/rolleDTO';
import { RolleBearbeitenBase } from '@modules/informationen/components/rolle-bearbeiten/rolle-bearbeiten.base';
import { RolleService } from '@shared/services/rolle.service';
import PrintHelper from '@shared/helpers/print.helper';
import { CodeDTO } from '@dtos/codeDTO';
import { BaseResponseWrapperRolleDTOWarningMessages } from '@dtos/baseResponseWrapperRolleDTOWarningMessages';

@Component({
    selector: 'avam-rollen-grunddaten-bearbeiten-page',
    templateUrl: './rollen-grunddaten-bearbeiten-page.component.html'
})
export class RollenGrunddatenBearbeitenPageComponent extends RolleBearbeitenBase implements DeactivationGuarded {
    data: RollenGrunddatenFormData;
    permissions = Permissions;
    @ViewChild('form')
    private form: RollenGrunddatenFormComponent;
    private originalDto: RolleDTO;

    constructor(protected service: RolleService, route: ActivatedRoute) {
        super(service, route, 'benutzerverwaltung.subnavmenuitem.grunddaten');
    }

    canDeactivate(): boolean {
        return this.form.form.dirty;
    }

    save() {
        this.service.facade.fehlermeldungenService.closeMessage();
        if (this.form.form.invalid) {
            this.form.ngForm.onSubmit(undefined);
            this.service.facade.fehlermeldungenService.showErrorMessage('stes.error.bearbeiten.pflichtfelder');
            OrColumnLayoutUtils.scrollTop();
        } else {
            this.service.facade.spinnerService.activate(this.channel);
            this.service.rest
                .update(this.form.mapToDto(this.originalDto))
                .pipe(finalize(() => this.service.facade.spinnerService.deactivate(this.channel)))
                .subscribe(response => {
                    if (response.data) {
                        this.originalDto = response.data;
                        this.data = {
                            ...this.data,
                            dto: response.data
                        };
                        this.service.facade.notificationService.success('common.message.datengespeichert');
                    }
                });
        }
    }

    protected loadData(rolleId: string): void {
        this.service.facade.spinnerService.activate(this.channel);
        forkJoin<CodeDTO[], CodeDTO[], BaseResponseWrapperRolleDTOWarningMessages>([
            this.service.data.getCode(DomainEnum.VOLLZUGSREGIONTYP),
            this.service.data.getCode(DomainEnum.BENUTZERSTELLETYP),
            this.service.rest.getByRolleId(rolleId)
        ])
            .pipe(finalize(() => this.service.facade.spinnerService.deactivate(this.channel)))
            .subscribe(([vollzugsregiontyp, benutzerstellentyp, rolle]) => {
                this.originalDto = rolle.data;
                this.data = {
                    vollzugsregiontyp,
                    benutzerstellentyp,
                    dto: rolle.data
                };
                this.updateInfobar(rolle.data);
            });
    }

    protected print(): void {
        PrintHelper.print();
    }
}
