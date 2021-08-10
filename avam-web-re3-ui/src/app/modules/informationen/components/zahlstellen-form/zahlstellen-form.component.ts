import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { FormModeEnum } from '@shared/enums/form-mode.enum';
import { ZahlstellenElementData } from '@modules/informationen/pages/zahlstellen-erfassen-bearbeiten/zahlstellen-erfassen-bearbeiten.component';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { ZahlstellenFormModeService } from '@modules/informationen/components/zahlstellen-form/zahlstellen-form-mode.service';
import { ZahlstellenHandlerService } from '@modules/informationen/components/zahlstellen-form/zahlstellen-handler.service';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { FacadeService } from '@shared/services/facade.service';
import { ZahlstelleDTO } from '@dtos/zahlstelleDTO';

@Component({
    selector: 'avam-zahlstellen-form',
    templateUrl: './zahlstellen-form.component.html',
    styleUrls: ['./zahlstellen-form.component.scss'],
    providers: [ZahlstellenHandlerService, ZahlstellenFormModeService]
})
export class ZahlstellenFormComponent extends Unsubscribable implements OnInit, OnChanges {
    @Input() zahlstelleelementData: ZahlstellenElementData;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    currentMode: string;
    spracheOptions: any;
    alkTypOptions: any;
    formGroup: FormGroup;
    formModes = FormModeEnum;

    constructor(
        private obliqueHelper: ObliqueHelperService,
        private formMode: ZahlstellenFormModeService,
        private infopanelService: AmmInfopanelService,
        private handler: ZahlstellenHandlerService,
        private facadeService: FacadeService
    ) {
        super();
        this.formGroup = handler.reactiveForms.createForm();
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.formMode.mode$.pipe(takeUntil(this.unsubscribe)).subscribe(currentMode => {
            this.currentMode = currentMode;
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.zahlstelleelementData.currentValue) {
            this.spracheOptions = this.zahlstelleelementData.spracheOptions;
            this.alkTypOptions = this.zahlstelleelementData.alkTypOptions;
            this.formMode.changeMode(this.zahlstelleelementData.formMode);
            switch (this.zahlstelleelementData.formMode) {
                case FormModeEnum.CREATE:
                    this.infopanelService.updateInformation({
                        title: 'verzeichnisse.topnavmenuitem.zahlstelleerfassen',
                        subtitle: '',
                        hideInfobar: true
                    });
                    break;
                case FormModeEnum.EDIT:
                case FormModeEnum.READONLY:
                    this.infopanelService.updateInformation({
                        title: 'stes.label.zahlstelle',
                        subtitle: '',
                        hideInfobar: false
                    });
                    this.infopanelService.sendLastUpdate(this.zahlstelleelementData.zahlstelle);
                    setTimeout(() => {
                        this.formGroup.reset(this.handler.mapToForm(this.zahlstelleelementData.zahlstelle));
                    }, 500);
                    break;
                default:
                    break;
            }
        }
    }

    mapToDTO(): ZahlstelleDTO {
        return this.handler.mapToDTO(this.formGroup.controls, this.zahlstelleelementData.zahlstelle);
    }

    reset() {
        if (this.formGroup.dirty) {
            this.facadeService.resetDialogService.reset(() => {
                this.facadeService.fehlermeldungenService.closeMessage();
                this.formGroup.reset(this.handler.mapToForm(this.zahlstelleelementData.zahlstelle));
                this.formGroup.markAsPristine();
            });
        }
    }

    updateStandortadresseFieldsWhenAreEmpty() {
        if (this.zahlstelleelementData.formMode === FormModeEnum.CREATE) {
            this.handler.updateStandortadresseFieldsWhenAreEmpty(this.formGroup.controls);
        }
    }
}
