import { Component, ElementRef, ViewChild } from '@angular/core';
import { RolleDTO } from '@dtos/rolleDTO';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { RolleBearbeitenBase } from '@modules/informationen/components/rolle-bearbeiten/rolle-bearbeiten.base';
import { RolleService } from '@shared/services/rolle.service';
import { forkJoin } from 'rxjs';
import { CodeDTO } from '@dtos/codeDTO';
import { DomainEnum } from '@shared/enums/domain.enum';
import { SysFunkRolleViewDTO } from '@dtos/sysFunkRolleViewDTO';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { BerechtigungDropdownsDTO } from '@dtos/berechtigungDropdownsDTO';

@Component({
    selector: 'avam-rollen-berechtigungen-bearbeiten-page',
    templateUrl: './rollen-berechtigungen-bearbeiten-page.component.html'
})
export class RollenBerechtigungenBearbeitenPageComponent extends RolleBearbeitenBase implements DeactivationGuarded {
    readonly savePermission: Permissions = Permissions.INFORMATIONEN_BENUTZERVERWALTUNG_ROLLE_BEARBEITEN_BERECHTIGUNGEN_SPEICHERN;

    @ViewChild('modalPrint') modalPrint: ElementRef;
    data: RollenBerechtigungenFormData;
    origBerechtigungen: string;
    berechtigungScopes: CodeDTO[] = [];
    berechtigungen: SysFunkRolleViewDTO[] = [];

    constructor(protected service: RolleService, route: ActivatedRoute) {
        super(service, route, 'benutzerverwaltung.subnavmenuitem.berechtigungen');
    }

    canDeactivate(): boolean {
        let canDeactivate = false;
        if (this.origBerechtigungen) {
            canDeactivate = this.origBerechtigungen !== JSON.stringify(this.berechtigungen);
        }
        return canDeactivate;
    }

    save(): void {
        // TODO save
    }

    onBerechtigungSelection(scope: CodeDTO): void {
        if (!this.berechtigungen) {
            return;
        }
        this.service.facade.spinnerService.activate(this.channel);
        for (let o of this.berechtigungen) {
            o.scopeId = scope.codeId;
        }
        this.service.facade.spinnerService.deactivate(this.channel);
    }

    protected loadData(rolleId: string): void {
        this.service.facade.spinnerService.activate(this.channel);
        forkJoin([
            this.service.data.getCode(DomainEnum.SCOPE),
            this.service.rest.getByRolleId(this.rolleId),
            this.service.rest.getBerechtigungen(this.rolleId),
            this.service.rest.getDropdowns()
        ])
            .pipe(finalize(() => this.service.facade.spinnerService.deactivate(this.channel)))
            .subscribe(([berechtigungScopes, rolle, berechtigungen, dropdowns]) => {
                this.data = {
                    dto: rolle.data,
                    dropdowns: dropdowns.data,
                    berechtigungScopes
                };
                this.updateInfobar(rolle.data);
                this.berechtigungScopes = berechtigungScopes;
                this.origBerechtigungen = JSON.stringify(berechtigungen.data);
                this.berechtigungen = berechtigungen.data;
            });
    }

    protected print(): void {
        this.service.facade.openModalFensterService.openXLModal(this.modalPrint);
    }
}

// TODO move to form
export interface RollenBerechtigungenFormData {
    dto: RolleDTO;
    dropdowns: BerechtigungDropdownsDTO;
    berechtigungScopes: CodeDTO[];
}
