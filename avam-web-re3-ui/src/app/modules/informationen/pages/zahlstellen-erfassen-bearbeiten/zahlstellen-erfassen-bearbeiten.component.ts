import { AfterViewInit, Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Unsubscribable } from 'oblique-reactive';
import { FormModeEnum } from '@shared/enums/form-mode.enum';
import { ZahlstelleDTO } from '@dtos/zahlstelleDTO';
import { Permissions } from '@shared/enums/permissions.enum';
import { ZahlstellenFormModeService } from '@modules/informationen/components/zahlstellen-form/zahlstellen-form-mode.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { FacadeService } from '@shared/services/facade.service';
import { ZahlstellenFormComponent } from '@modules/informationen/components/zahlstellen-form/zahlstellen-form.component';
import { ToolboxService } from '@app/shared';
import { filter, finalize, takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ZahlstelleRestService } from '@core/http/zahlstelle-rest.service';
import { ZahlstellenHandlerService } from '@modules/informationen/components/zahlstellen-form/zahlstellen-handler.service';
import { WarningMessages } from '@dtos/warningMessages';
import KeyEnum = WarningMessages.KeyEnum;

export interface ZahlstellenElementData {
    zahlstelle?: ZahlstelleDTO;
    formMode?: FormModeEnum;
    spracheOptions?: any[];
    alkTypOptions?: any[];
}
@Component({
    selector: 'avam-zahlstellen-erfassen-bearbeiten',
    templateUrl: './zahlstellen-erfassen-bearbeiten.component.html',
    styleUrls: ['./zahlstellen-erfassen-bearbeiten.component.scss'],
    providers: [ZahlstellenHandlerService, ZahlstellenFormModeService]
})
export class ZahlstellenErfassenBearbeitenComponent extends Unsubscribable implements AfterViewInit, OnDestroy {
    @ViewChild('formComponent') formComponent: ZahlstellenFormComponent;
    @ViewChild('infobartemplate') infobartemplate: TemplateRef<any>;
    zahlstelleelementData: ZahlstellenElementData = {};
    permissions: typeof Permissions = Permissions;
    currentMode: FormModeEnum;
    formModes = FormModeEnum;
    channel = 'zahlstellen-page';
    navigateToSearch: any;
    private alkTypOptions = [
        { value: '1', labelDe: 'öffentlich', labelFr: 'Public', labelIt: 'pubblico' },
        { value: '2', labelDe: 'privat', labelFr: 'Privé', labelIt: 'privato' }
    ];
    private spracheOptions = [
        { value: 'D', labelDe: 'Deutsch', labelFr: 'Allemand', labelIt: 'Tedesco' },
        { value: 'F', labelDe: 'Französisch', labelFr: 'Français', labelIt: 'Francese' },
        { value: 'I', labelDe: 'Italienisch', labelFr: 'Italien', labelIt: 'Italiano' }
    ];

    constructor(
        private formMode: ZahlstellenFormModeService,
        private activatedRoute: ActivatedRoute,
        private infopanelService: AmmInfopanelService,
        private router: Router,
        private facadeService: FacadeService,
        private restService: ZahlstelleRestService
    ) {
        super();
        ToolboxService.CHANNEL = this.channel;
        this.navigateToSearch = this.router.getCurrentNavigation().extras.state && this.router.getCurrentNavigation().extras.state.navigateToSearch;
    }

    ngAfterViewInit() {
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getZahlstelleErfassenConfig(), this.channel);
        this.currentMode = this.activatedRoute.snapshot.data.mode;
        this.setZahlstelleData();
        this.observePrintAction();
    }

    ngOnDestroy(): void {
        this.infopanelService.updateInformation({ title: '', subtitle: '', hideInfobar: false });
        this.facadeService.toolboxService.sendConfiguration([]);
        this.facadeService.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    canDeactivate() {
        return this.formComponent.formGroup.dirty;
    }

    navigateHome() {
        if (this.navigateToSearch) {
            this.router.navigate(['/informationen/verzeichnisse/zahlstellen/suchen']);
        } else {
            this.router.navigate(['/home']);
        }
    }

    save() {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.formComponent.updateStandortadresseFieldsWhenAreEmpty();
        if (this.formComponent.formGroup.valid) {
            this.facadeService.spinnerService.activate(this.channel);
            if (this.currentMode === this.formModes.CREATE) {
                this.restService
                    .createZahlstelle(this.formComponent.mapToDTO())
                    .pipe(
                        takeUntil(this.unsubscribe),
                        finalize(() => {
                            OrColumnLayoutUtils.scrollTop();
                            this.facadeService.spinnerService.deactivate(this.channel);
                        })
                    )
                    .subscribe(response => {
                        if (!response.warning || !response.warning.filter((warningMessage: WarningMessages) => warningMessage.key === KeyEnum.DANGER).length) {
                            this.facadeService.notificationService.success('common.message.datengespeichert');
                            this.formComponent.formGroup.markAsPristine();
                            this.router.navigate(['../bearbeiten'], { relativeTo: this.activatedRoute, queryParams: { zahlstelleId: response.data } });
                        }
                    });
            } else if (this.currentMode === this.formModes.EDIT) {
                this.restService
                    .updateZahlstelle(this.formComponent.mapToDTO())
                    .pipe(
                        takeUntil(this.unsubscribe),
                        finalize(() => {
                            OrColumnLayoutUtils.scrollTop();
                            this.facadeService.spinnerService.deactivate(this.channel);
                        })
                    )
                    .subscribe(response => {
                        if (!response.warning || !response.warning.filter((warningMessage: WarningMessages) => warningMessage.key === KeyEnum.DANGER).length) {
                            this.facadeService.notificationService.success('common.message.datengespeichert');
                            this.zahlstelleelementData = {
                                ...this.zahlstelleelementData,
                                zahlstelle: response.data
                            };
                            this.formComponent.formGroup.markAsPristine();
                        }
                    });
            }
        } else {
            this.formComponent.ngForm.onSubmit(undefined);
            this.facadeService.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    private observePrintAction(): void {
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(
                takeUntil(this.unsubscribe),
                filter(action => action.message.action === ToolboxActionEnum.PRINT)
            )
            .subscribe(PrintHelper.print);
    }

    private setZahlstelleData() {
        if (this.currentMode === this.formModes.CREATE) {
            this.zahlstelleelementData = {
                formMode: this.currentMode,
                alkTypOptions: this.alkTypOptions,
                spracheOptions: this.spracheOptions,
                zahlstelle: {
                    kassenstatus: '1',
                    sprachcode: 'D'
                }
            };
        } else if (this.currentMode === this.formModes.EDIT) {
            this.getData();
        }
    }

    private getData() {
        this.facadeService.spinnerService.activate(this.channel);
        this.restService
            .getZahlstelleById(this.activatedRoute.snapshot.queryParams.zahlstelleId)
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => {
                    this.facadeService.spinnerService.deactivate(this.channel);
                    OrColumnLayoutUtils.scrollTop();
                })
            )
            .subscribe(response => {
                this.zahlstelleelementData = {
                    formMode: this.currentMode,
                    alkTypOptions: this.alkTypOptions,
                    spracheOptions: this.spracheOptions,
                    zahlstelle: response.data
                };
                this.infopanelService.sendTemplateToInfobar(this.infobartemplate);
                this.infopanelService.sendLastUpdate(response.data);
            });
    }
}
