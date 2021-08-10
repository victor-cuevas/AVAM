import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UnternehmenTypes } from '@shared/enums/unternehmen.enum';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';
import { UnternehmenWizardService } from '@shared/components/new/avam-wizard/unternehmen-wizard.service';
import { ToolboxService } from '@app/shared';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { filter, takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { ResetDialogService } from '@shared/services/reset-dialog.service';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { UnternehmenErfassenDTO } from '@dtos/unternehmenErfassenDTO';
import { BaseResponseWrapperListUnternehmenResultDTOWarningMessages } from '@dtos/baseResponseWrapperListUnternehmenResultDTOWarningMessages';
import { WizardStandortadresseComponent } from '@shared/components/unternehmen/erfassen/wizard-standortadresse/wizard-standortadresse.component';
import { WizardDoppelerfassungComponent } from '@shared/components/unternehmen/erfassen/wizard-doppelerfassung/wizard-doppelerfassung.component';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Permissions } from '@shared/enums/permissions.enum';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { StaatDTO } from '@dtos/staatDTO';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';

@Component({
    selector: 'avam-unternehmen-erfassen',
    templateUrl: './erfassen.component.html',
    styleUrls: ['./erfassen.component.scss']
})
export class UnternehmenErfassenComponent extends Unsubscribable implements AfterViewInit, OnInit, OnDestroy {
    @ViewChild('routerOutletComponent') routerOutletComponent;
    public channel = 'unternehmen-erfassen-spinner';
    public toolboxChannel = 'unternehmen-erfassen';
    public type: string;
    public routeData: ActivatedRoute;
    public permissions: typeof Permissions = Permissions;
    private schweizDTO: StaatDTO;
    private firstStepData;
    private secondStepData;
    private firstStepFormData;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private wizardService: UnternehmenWizardService,
        private toolboxService: ToolboxService,
        private resetDialogService: ResetDialogService,
        private fehlermeldungenService: FehlermeldungenService,
        private unternehmenRestService: UnternehmenRestService,
        private spinnerService: SpinnerService,
        private translateService: TranslateService,
        private modalService: NgbModal,
        private dataService: StesDataRestService,
        private notificationService: NotificationService,
        private authService: AuthenticationService,
        private infoPanelService: AmmInfopanelService
    ) {
        super();
        ToolboxService.CHANNEL = this.toolboxChannel;
    }

    static checkErrors(warnings): boolean {
        return !warnings || warnings.filter(warning => warning.key === 'DANGER').length === 0;
    }

    public onOutletActivate(event): void {
        this.routerOutletComponent = event;
        this.assignLocalData();
        this.assignStepPath(event);
        OrColumnLayoutUtils.scrollTop();
    }

    public ngOnInit() {
        this.toolboxService.sendConfiguration(ToolboxConfig.getAmmErfassenConfig());
        this.routeData = this.activatedRoute;
        this.type = this.routeData.snapshot.data['type'];

        if (!this.firstStepData) {
            this.router.navigate([this.getStepPath(0)]);
        }

        this.setSubscriptions();
    }

    public ngAfterViewInit() {
        this.infoPanelService.dispatchInformation({
            title: `unternehmen.label.wizard.${this.type}_erfassen`,
            subtitle: this.routeData.firstChild.snapshot.data['title'],
            hideInfobar: true
        });
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
        this.infoPanelService.updateInformation({ hideInfobar: false });
    }

    public getStepPath(step: number) {
        let route = '';
        switch (this.type) {
            case UnternehmenTypes.ARBEITGEBER:
                route = '/arbeitgeber/details/erfassen';
                break;
            case UnternehmenTypes.FACHBERATUNG:
                route = '/stes/fachberatung/erfassen';
                break;
            default:
                route = '/amm/anbieter/erfassen';
                break;
        }

        if (step > 1) {
            route = `${route}/step${step}`;
        }

        return route;
    }

    complete() {
        this.spinnerService.activate(this.channel);
        if (this.routerOutletComponent) {
            this.unternehmenRestService
                .createUnternehmen(this.mapToDto(this.firstStepFormData, true), false)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(
                    response => {
                        if (response) {
                            this.notificationService.success('common.message.datengespeichert');
                            this.router.navigate([`${this.getStepPath(2).replace('erfassen/step2', '')}/${response.data}`]);
                        }
                        OrColumnLayoutUtils.scrollTop();
                        this.spinnerService.deactivate(this.channel);
                    },
                    () => {
                        this.spinnerService.deactivate(this.channel);
                        OrColumnLayoutUtils.scrollTop();
                    }
                );
        }
    }

    private reset() {
        if (this.routerOutletComponent.standOrtAdresseForm.dirty) {
            this.resetDialogService.reset(() => {
                this.fehlermeldungenService.closeMessage();
                this.routerOutletComponent.resetForm();
            });
        } else {
            this.fehlermeldungenService.closeMessage();
            this.routerOutletComponent.resetForm();
        }
    }

    private mapToDto(form, step2): UnternehmenErfassenDTO {
        return {
            unternehmen: {
                name1: form.name.value,
                name2: form.name2.value,
                name3: form.name3.value,
                strasse: form.strasse.value,
                strasseNr: form.strasseNr.value,
                plzOrt: form.plz.plzWohnAdresseObject,
                plzOrtPostfach: form.plzPostfach.plzWohnAdresseObject,
                postfach: form.postfach.value,
                land: form.land.landAutosuggestObject,
                branche: form.branche.branchAutosuggestObj
            },
            ansprechpersonDetailId: step2 ? this.getCurrentUserBenutzerDetailId() : null,
            mitteilungAnBFS: form.ergaenzendeAngaben.value
        };
    }

    private goToStep(step: number) {
        const form = this.routerOutletComponent.standOrtAdresseForm;
        this.fehlermeldungenService.closeMessage();
        if (form) {
            this.firstStepData = {};
            if (form.valid) {
                this.spinnerService.activate(this.channel);
                this.firstStepFormData = form.controls;
                this.firstStepData = {
                    ...form.value,
                    land: form.controls.land.landAutosuggestObject,
                    branche: form.controls.branche.branchAutosuggestObj
                };
                this.unternehmenRestService
                    .searchDoppelErfasstUnternehmen(this.mapToDto(form.controls, false))
                    .pipe(takeUntil(this.unsubscribe))
                    .subscribe(
                        (response: BaseResponseWrapperListUnternehmenResultDTOWarningMessages) => {
                            this.spinnerService.deactivate(this.channel);
                            if (UnternehmenErfassenComponent.checkErrors(response.warning)) {
                                this.secondStepData = response;
                                form.markAsPristine();
                                this.wizardService.movePosition(step);
                            }
                            OrColumnLayoutUtils.scrollTop();
                        },
                        () => {
                            this.spinnerService.deactivate(this.channel);
                            OrColumnLayoutUtils.scrollTop();
                        }
                    );
            } else {
                this.routerOutletComponent.ngForm.onSubmit(undefined);
                OrColumnLayoutUtils.scrollTop();
                this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            }
        } else {
            this.wizardService.movePosition(step);
        }
    }

    private cancel() {
        this.router.navigate(['home/start-page']);
    }

    private setSubscriptions() {
        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                if (this.wizardService.currentStep === 0) {
                    window.print();
                } else {
                    this.modalService.open(this.routerOutletComponent.modalPrint, { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-xl', backdrop: 'static' });
                }
            });
        this.getDefaultLand();
    }

    private assignStepPath(event): void {
        if (event instanceof WizardStandortadresseComponent && this.wizardService.list.length) {
            this.wizardService.changeStep(0);
        } else if (event instanceof WizardDoppelerfassungComponent && this.wizardService.list.length) {
            this.wizardService.changeStep(1);
        }
    }

    private assignLocalData(): void {
        if (this.firstStepData) {
            this.routerOutletComponent.firstStepData = this.firstStepData;
        }
        if (this.secondStepData) {
            this.routerOutletComponent.schweizDTO = this.schweizDTO;
            this.routerOutletComponent.secondStepData = this.secondStepData;
        }
    }

    private getDefaultLand() {
        this.spinnerService.activate(this.channel);
        this.dataService
            .getStaatSwiss()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                schweizDTO => {
                    this.schweizDTO = schweizDTO;
                    this.spinnerService.deactivate(this.channel);
                },
                () => {
                    this.spinnerService.deactivate(this.channel);
                }
            );
    }

    private getCurrentUserBenutzerDetailId(): number {
        const currentUser = this.authService.getLoggedUser();
        return +currentUser.benutzerDetailId;
    }
}
