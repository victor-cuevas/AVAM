import { Component, OnInit, Input, SimpleChanges, OnChanges, ViewChild, OnDestroy } from '@angular/core';
import { StrukturelementFormService } from './strukturelement-form.service';
import { StrukturelementHandlerService } from './strukturelement-handler.service';
import { StrukturelementFormModeService } from './strukturelement-form-mode.service';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { FormModeEnum } from '@app/shared/enums/form-mode.enum';
import { SpracheEnum } from '@app/shared/enums/sprache.enum';
import { StrukturElementData } from '../strukturelement-modal/strukturelement-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MassnahmenartWaehlenModalComponent } from '@app/shared/components/massnahmenart-waehlen-modal/massnahmenart-waehlen-modal.component';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { StrukturElementDTO } from '@app/shared/models/dtos-generated/strukturElementDTO';
import { AmmConstants } from '@app/shared/enums/amm-constants';
import { StrukturElementType } from '@app/shared/components/massnahmenart-waehlen-modal/massnahmenart-tree-models';
import { Unsubscribable } from 'oblique-reactive';
import { takeUntil } from 'rxjs/operators';
import { ErfassungsspracheEnum } from '@app/shared/enums/erfassungssprache.enum';

@Component({
    selector: 'avam-strukturelement-form',
    templateUrl: './strukturelement-form.component.html',
    styleUrls: ['./strukturelement-form.component.scss'],
    providers: [StrukturelementFormService, StrukturelementHandlerService, StrukturelementFormModeService]
})
export class StrukturelementFormComponent extends Unsubscribable implements OnInit, OnChanges, OnDestroy {
    @Input() strukturelementData: StrukturElementData;

    @ViewChild('ngForm') ngForm: FormGroupDirective;

    showAusgleichsstelle: boolean;
    showKbArtAsal: boolean;
    spracheEnum = ErfassungsspracheEnum;
    currentMode: string;
    formModes = FormModeEnum;
    spracheOptions: any[];
    public formGroup: FormGroup;

    constructor(
        public handler: StrukturelementHandlerService,
        private formMode: StrukturelementFormModeService,
        private formService: StrukturelementFormService,
        private modalService: NgbModal,
        private obliqueHelper: ObliqueHelperService,
        private resetDialogService: ResetDialogService,
        private fehlermeldungenService: FehlermeldungenService
    ) {
        super();
        this.formGroup = handler.reactiveForm.formGroup;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.formMode.changeMode(this.strukturelementData.formMode);

        this.formMode.mode$.pipe(takeUntil(this.unsubscribe)).subscribe(currentMode => {
            this.currentMode = currentMode;
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.strukturelementData.currentValue) {
            this.spracheOptions = this.handler.mapOptions(this.strukturelementData.spracheOptions);

            switch (this.currentMode) {
                case FormModeEnum.CREATE:
                    this.checkAusgleichsstelleField();

                    this.handler.mapToForm(this.strukturelementData.strukturelement);
                    break;
                case FormModeEnum.EDIT:
                case FormModeEnum.READONLY:
                    this.checkAusgleichsstelleField();

                    this.showKbArtAsal = this.strukturelementData.selectedCategory.kategorie === AmmConstants.AMM_ELEMENTKATEGORIE_AUSGLEICHSTELLE;

                    this.handler.mapToForm(this.strukturelementData.strukturelement);
                    break;
                default:
                    break;
            }
        }
    }

    openModal() {
        const modalRef = this.modalService.open(MassnahmenartWaehlenModalComponent, {
            ariaLabelledBy: 'modal-basic-title',
            windowClass: 'avam-modal-xl',
            backdrop: 'static',
            centered: true
        });
        modalRef.componentInstance.queryParams = {
            type: StrukturElementType.AUSGLEICHSSTELLE,
            rootAbGesetzVonId:
                this.currentMode === FormModeEnum.CREATE
                    ? this.strukturelementData.strukturelement.vorgaengerObject.strukturelementId
                    : this.strukturelementData.strukturelement.strukturelementId,
            anzeigeDatum: this.formGroup.controls.gueltigVon.value ? this.formGroup.controls.gueltigVon.value : new Date()
        };
        modalRef.componentInstance.getPaths = true;
        modalRef.componentInstance.onSelect.pipe(takeUntil(this.unsubscribe)).subscribe(event => {
            this.handler.selectAusgleichsstelle(event);
        });
    }

    checkAusgleichsstelleField() {
        this.showAusgleichsstelle =
            this.strukturelementData.selectedCategory.kategorie !== AmmConstants.AMM_ELEMENTKATEGORIE_AUSGLEICHSTELLE &&
            this.strukturelementData.selectedCategory.kategorie !== AmmConstants.AMM_ELEMENTKATEGORIE_GESETZ;

        if (this.showAusgleichsstelle) {
            this.formService.setAusgleichsstelleRequired();
            this.handler.setSelectedAusgleichsstellePath(this.strukturelementData.ausgleichsstellePath);
        }
    }

    mapToDTO(): StrukturElementDTO {
        return this.handler.mapToDTO(this.strukturelementData.strukturelement);
    }

    reset() {
        if (this.formGroup.dirty) {
            this.resetDialogService.reset(() => {
                this.fehlermeldungenService.closeMessage();
                this.handler.mapToForm(this.strukturelementData.strukturelement);
            });
        }
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
