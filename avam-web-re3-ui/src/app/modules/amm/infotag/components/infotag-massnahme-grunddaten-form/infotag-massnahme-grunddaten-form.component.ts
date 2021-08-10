import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { SpracheEnum } from '@app/shared/enums/sprache.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { InfotagMassnahmeGrunddatenHandlerService } from './infotag-massnahme-grunddaten-handler.service';
import { InfotagMassnahmeGrunddatenModeService } from './infotag-massnahme-grunddaten-mode.service';
import { InfotagMassnahmeGrunddatenReactiveFormsService } from './infotag-massnahme-grunddaten-reactive-forms.service';
import { AmmHelper } from '@app/shared/helpers/amm.helper';

export interface InfotagMassnahmeGrunddatenData {
    dto?: MassnahmeDTO;
    spracheOptions?: CodeDTO[];
}

@Component({
    selector: 'avam-infotag-massnahme-grunddaten-form',
    templateUrl: './infotag-massnahme-grunddaten-form.component.html',
    styleUrls: ['./infotag-massnahme-grunddaten-form.component.scss'],
    providers: [InfotagMassnahmeGrunddatenHandlerService, InfotagMassnahmeGrunddatenModeService, InfotagMassnahmeGrunddatenReactiveFormsService]
})
export class InfotagMassnahmeGrunddatenFormComponent implements OnInit, OnChanges {
    @Input('grunddatenData') grunddatenData: InfotagMassnahmeGrunddatenData;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    public formGroup: FormGroup;

    dto: MassnahmeDTO;
    spracheOptions: any[];
    spracheEnum = SpracheEnum;
    benutzerType = BenutzerAutosuggestType.BENUTZER;
    benutzerSuchenTokens = {};
    hasSession = false;

    constructor(
        private route: ActivatedRoute,
        private handler: InfotagMassnahmeGrunddatenHandlerService,
        private authenticationService: AuthenticationService,
        private obliqueHelper: ObliqueHelperService,
        public formMode: InfotagMassnahmeGrunddatenModeService,
        private fehlermeldungenService: FehlermeldungenService,
        private resetDialogService: ResetDialogService,
        private ammHelper: AmmHelper
    ) {
        this.formGroup = handler.reactiveForms.grunddatenForm;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.grunddatenData.currentValue) {
            this.dto = this.grunddatenData.dto;
            this.hasSession = this.grunddatenData.dto.hasSession;
            this.spracheOptions = this.handler.mapOptions(this.grunddatenData.spracheOptions);
            this.initCreate(this.dto);
        }
    }

    initCreate(dto: MassnahmeDTO) {
        this.formGroup.reset(this.handler.mapToForm(dto));
        this.setBenutzerTokens(dto);

        if (!dto.verantwortlicherDetailObject) {
            this.formGroup.controls.massnahmenverantwortung.setValue(this.ammHelper.getCurrentUserForAutosuggestDto());
        }
    }

    setBenutzerTokens(grunddatenDto?: MassnahmeDTO) {
        const currentUser = this.authenticationService.getLoggedUser();
        const benutzerstelleId = grunddatenDto ? (grunddatenDto.ownerId ? grunddatenDto.ownerId : currentUser.benutzerstelleId) : currentUser.benutzerstelleId;

        if (currentUser) {
            this.benutzerSuchenTokens = {
                berechtigung: Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN,
                myBenutzerstelleId: benutzerstelleId,
                benutzerstelleId
            };
        }
    }

    reset() {
        if (this.formGroup.dirty) {
            this.resetDialogService.reset(() => {
                this.fehlermeldungenService.closeMessage();
                this.initCreate(this.dto);
            });
        }
    }

    mapToDto(): MassnahmeDTO {
        return this.handler.mapToDto(this.dto);
    }
}
