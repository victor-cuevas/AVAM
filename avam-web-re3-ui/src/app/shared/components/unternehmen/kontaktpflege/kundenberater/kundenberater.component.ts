import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToolboxService } from '@app/shared';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';
import { Permissions } from '@shared/enums/permissions.enum';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum, ToolboxEvent } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { ResetDialogService } from '@shared/services/reset-dialog.service';
import { KundenberaterRestService } from '@core/http/kundenberater-rest.service';
import { KundenberaterDTO } from '@dtos/kundenberaterDTO';
import { BenutzerDetailDTO } from '@dtos/benutzerDetailDTO';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';

@Component({
    selector: 'avam-kundenberater',
    templateUrl: './kundenberater.component.html'
})
export class KundenberaterComponent extends Unsubscribable implements OnInit, DeactivationGuarded, OnDestroy {
    kundenberaterSpinnerChannel = 'kundenberaterSpinner';
    permissions: typeof Permissions = Permissions;
    kundenberaterForm: FormGroup;
    readOnly = false;
    readonly channel = 'kundenberater-channel';
    private static readonly DATEN_GESPEICHERT = 'common.message.datengespeichert';
    private unternehmenId: number;
    private loadedKundenberater: KundenberaterDTO;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private translateService: TranslateService,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private resetDialogService: ResetDialogService,
        private kundenberaterRestService: KundenberaterRestService,
        private spinnerService: SpinnerService,
        private notificationService: NotificationService,
        private infopanelService: AmmInfopanelService,
        private toolboxService: ToolboxService,
        private fehlermeldungenService: FehlermeldungenService
    ) {
        super();
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit(): void {
        this.fehlermeldungenService.closeMessage();
        this.createForm();
        this.setTitleAndToolbox();
        this.setSubscriptions();
    }

    ngOnDestroy(): void {
        this.toolboxService.resetConfiguration();
        super.ngOnDestroy();
    }

    canDeactivate(): boolean {
        return this.kundenberaterForm.dirty;
    }

    reset(): void {
        if (this.kundenberaterForm.dirty) {
            this.resetDialogService.reset(() => {
                this.resetForm();
            });
        }
    }

    save(): void {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.kundenberaterSpinnerChannel);
        this.kundenberaterRestService.save(this.mapToDto()).subscribe(
            res => {
                if (res.data) {
                    this.loadedKundenberater = res.data;
                    this.notificationService.success(KundenberaterComponent.DATEN_GESPEICHERT);
                    this.fillKundenberaterList(res.data);
                }
                this.spinnerService.deactivate(this.kundenberaterSpinnerChannel);
            },
            () => this.spinnerService.deactivate(this.kundenberaterSpinnerChannel)
        );
    }

    private createForm(): void {
        this.kundenberaterForm = this.formBuilder.group({ personalberatern: [] });
        this.kundenberaterForm.setControl('personalberatern', this.formBuilder.array([this.formBuilder.group({ personalberater: null })]));
    }

    private setTitleAndToolbox(): void {
        this.infopanelService.updateInformation({ subtitle: 'unternehmen.label.kundenberater' });
        this.toolboxService.sendConfiguration(ToolboxConfig.getKundenberaterConfig(), this.channel);
        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: { channel: any; message: ToolboxEvent }) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                }
            });
    }

    private setSubscriptions(): void {
        this.route.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.unternehmenId = params['unternehmenId'];
            this.loadData();
        });
    }

    private loadData(): void {
        this.spinnerService.activate(this.kundenberaterSpinnerChannel);
        this.kundenberaterRestService.load(this.unternehmenId).subscribe(
            res => {
                if (res.data) {
                    this.loadedKundenberater = res.data;
                    this.fillKundenberaterList(res.data);
                    if (res.data.readOnly) {
                        this.readOnly = true;
                    }
                }
                this.spinnerService.deactivate(this.kundenberaterSpinnerChannel);
            },
            () => this.spinnerService.deactivate(this.kundenberaterSpinnerChannel)
        );
    }

    private fillKundenberaterList(kundenberater: KundenberaterDTO): void {
        if (kundenberater.kundenberaterList && kundenberater.kundenberaterList.length > 0) {
            this.kundenberaterForm.setControl(
                'personalberatern',
                this.formBuilder.array(
                    kundenberater.kundenberaterList.map(f =>
                        this.formBuilder.group({
                            personalberater: [
                                {
                                    benutzerId: f.benutzerId,
                                    benutzerDetailId: f.benutzerDetailId ? f.benutzerDetailId.toString() : null,
                                    benutzerLogin: f.benutzerLogin,
                                    nachname: f.nachname,
                                    vorname: f.vorname,
                                    benuStelleCode: f.benuStelleCode,
                                    benutzerstelleId: f.benutzerstelleId
                                }
                            ]
                        })
                    )
                )
            );
        }
    }

    private resetForm(): void {
        if (this.kundenberaterForm.dirty && this.loadedKundenberater) {
            this.fillKundenberaterList(this.loadedKundenberater);
        }
    }

    private mapToDto() {
        const kundenberater: KundenberaterDTO = {
            unternehmenId: this.unternehmenId,
            unternehmenOjbVersion: this.loadedKundenberater ? this.loadedKundenberater.unternehmenOjbVersion : 0,
            kundenberaterList: []
        };
        const controls = (this.kundenberaterForm.controls.personalberatern as FormArray).controls as FormGroup[];
        controls
            .filter(cntrl => cntrl.controls['personalberater']['benutzerObject'])
            .forEach(c => {
                const obj = c.controls['personalberater']['benutzerObject'];
                if (obj.benutzerDetailId === -1 && !obj.benutzerLogin) {
                    return;
                }
                const b: BenutzerDetailDTO = {
                    benutzerDetailId: +obj.benutzerDetailId,
                    benutzerLogin: obj.benutzerLogin,
                    nachname: obj.nachname,
                    vorname: obj.vorname
                };
                kundenberater.kundenberaterList.push(b);
            });
        return kundenberater;
    }
}
