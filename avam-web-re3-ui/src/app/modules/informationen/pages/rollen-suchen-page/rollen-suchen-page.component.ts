import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RollenSuchenFormData } from '@modules/informationen/components/rollen-suchen-form/rollen-suchen-form.data';
import { RollenSuchenFormComponent } from '@modules/informationen/components/rollen-suchen-form/rollen-suchen-form.component';
import { forkJoin } from 'rxjs';
import { CodeDTO } from '@dtos/codeDTO';
import { DomainEnum } from '@shared/enums/domain.enum';
import { finalize, takeUntil } from 'rxjs/operators';
import { RolleService } from '@shared/services/rolle.service';
import { Unsubscribable } from 'oblique-reactive';
import { BaseResponseWrapperListRolleDTOWarningMessages } from '@dtos/baseResponseWrapperListRolleDTOWarningMessages';
import { RolleDTO } from '@dtos/rolleDTO';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { Router } from '@angular/router';
import { Permissions } from '@shared/enums/permissions.enum';

@Component({
    selector: 'avam-rollen-suchen-page',
    templateUrl: './rollen-suchen-page.component.html'
})
export class RollenSuchenPageComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('form') form: RollenSuchenFormComponent;
    formData: RollenSuchenFormData;
    rollen: RolleDTO[] = [];
    searchDone: boolean;
    readonly formChannel = 'avam-rollen-suchen-page.channel';
    readonly resultChannel = 'avam-rollen-result-page.channel';
    readonly permissions: typeof Permissions = Permissions;
    static readonly FORM_CACHE_STATE_KEY = 'avam-rollen-suchen-page.cache';
    static readonly RESULT_CACHE_STATE_KEY = 'avam-rollen-suchen-page-result.cache';

    constructor(private service: RolleService, private storageService: SearchSessionStorageService, private router: Router) {
        super();
    }

    get formStateKey(): string {
        return RollenSuchenPageComponent.FORM_CACHE_STATE_KEY;
    }

    get resultStateKey(): string {
        return RollenSuchenPageComponent.RESULT_CACHE_STATE_KEY;
    }

    ngOnInit(): void {
        this.initFormOptions();
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
    }

    ngOnDestroy(): void {
        this.service.facade.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    search(): void {
        this.service.facade.fehlermeldungenService.closeMessage();
        if (this.form.searchForm.valid) {
            this.storageService.storeFieldsByKey(RollenSuchenPageComponent.FORM_CACHE_STATE_KEY, this.form.handler.mapToFormData());
            this.searchRollen();
        }
    }

    reset(): void {
        this.form.handler.reactive.reset();
        this.rollen = [];
        this.searchDone = false;
        this.storageService.restoreDefaultValues(RollenSuchenPageComponent.RESULT_CACHE_STATE_KEY);
        this.storageService.clearStorageByKey(RollenSuchenPageComponent.FORM_CACHE_STATE_KEY);
    }

    searchRollen(): void {
        this.service.facade.spinnerService.activate(this.resultChannel);
        this.service.rest
            .search(this.form.handler.mapToDTO())
            .pipe(
                finalize(() => {
                    this.service.facade.spinnerService.deactivate(this.resultChannel);
                    this.searchDone = true;
                })
            )
            .subscribe(
                (response: BaseResponseWrapperListRolleDTOWarningMessages) => {
                    this.rollen = response.data;
                },
                () => (this.rollen = [])
            );
    }

    openRolle(rolle: RolleDTO): void {
        this.service.navigateToBearbeiten(rolle);
    }

    private initFormOptions(): void {
        this.service.facade.spinnerService.activate(this.formChannel);
        forkJoin<CodeDTO[], CodeDTO[]>([this.service.data.getCode(DomainEnum.BENUTZERSTELLETYP), this.service.data.getCode(DomainEnum.VOLLZUGSREGIONTYP)])
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.service.facade.spinnerService.deactivate(this.formChannel))
            )
            .subscribe(([benutzerstellen, vollzugsregionen]) => {
                this.formData = { benutzerstellen, vollzugsregionen };
            });
    }
}
