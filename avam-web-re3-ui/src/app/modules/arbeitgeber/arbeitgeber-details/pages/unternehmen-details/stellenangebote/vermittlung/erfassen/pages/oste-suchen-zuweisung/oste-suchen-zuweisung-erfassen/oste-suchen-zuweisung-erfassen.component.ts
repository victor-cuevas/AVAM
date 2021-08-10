import { Component, OnDestroy, OnInit } from '@angular/core';
import { Permissions } from '@shared/enums/permissions.enum';
import { ZuweisungWizardService } from '@shared/components/new/avam-wizard/zuweisung-wizard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesFuerZuweisungSuchenParamDTO } from '@dtos/stesFuerZuweisungSuchenParamDTO';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { BaseResponseWrapperListStesVMDTOWarningMessages } from '@dtos/baseResponseWrapperListStesVMDTOWarningMessages';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { StesVMDTO } from '@dtos/stesVMDTO';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { takeUntil } from 'rxjs/operators';
import { GenericConfirmComponent } from '@app/shared';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'avam-oste-suchen-zuweisung-erfassen',
    templateUrl: './oste-suchen-zuweisung-erfassen.component.html',
    styleUrls: ['./oste-suchen-zuweisung-erfassen.component.scss']
})
export class OsteSuchenZuweisungErfassenComponent extends Unsubscribable implements OnInit, OnDestroy {
    searchResult: StesVMDTO[];
    permissions: typeof Permissions = Permissions;
    channel = 'zuweisungErfassenStes1Channel';
    unternehmenId: any;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private fehlermeldungenService: FehlermeldungenService,
        private spinnerService: SpinnerService,
        private infopanelService: AmmInfopanelService,
        private stesDataService: StesDataRestService,
        private activatedRoute: ActivatedRoute,
        private zuweisungWizard: ZuweisungWizardService,
        private modalService: NgbModal
    ) {
        super();
    }

    ngOnInit() {
        this.zuweisungWizard.selectCurrentStep(0);
        this.infopanelService.updateInformation({ subtitle: 'stes.label.stellensuchendenSuchen' });
        this.activatedRoute.parent.params.subscribe(params => {
            this.unternehmenId = params['unternehmenId'];
        });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    manageSpinner(event: any) {
        if (event) {
            this.spinnerService.activate(this.channel);
        } else {
            this.spinnerService.deactivate(this.channel);
        }
    }

    cancel() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.zuweisungWizard.navigateToArbeitsvermittlungOste();
            }
        });
        modalRef.componentInstance.titleLabel = 'common.button.vermittlungAbbrechen';
        modalRef.componentInstance.promptLabel = 'common.message.vermittlungAbbrechen';
        modalRef.componentInstance.primaryButton = 'common.button.jaAbbrechen';
        modalRef.componentInstance.secondaryButton = 'i18n.common.no';
    }

    search(dto: StesFuerZuweisungSuchenParamDTO) {
        this.spinnerService.activate(this.channel);
        this.stesDataService
            .searchArbeitgeberStellenvermitllungWizard(dto)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (stellenAngebote: BaseResponseWrapperListStesVMDTOWarningMessages) => {
                    this.searchResult = stellenAngebote.data && !!stellenAngebote.data.length ? stellenAngebote.data : [];
                    this.infopanelService.updateInformation({ tableCount: this.searchResult.length });
                    this.spinnerService.deactivate(this.channel);
                    OrColumnLayoutUtils.scrollTop();
                },
                () => {
                    this.spinnerService.deactivate(this.channel);
                    OrColumnLayoutUtils.scrollTop();
                }
            );
    }

    itemSelected(stesId) {
        this.zuweisungWizard.setStesId(stesId);
        this.zuweisungWizard.navigateToOste(2);
    }
}
