import { Injectable } from '@angular/core';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { DurchfuehrungsortDTO } from '@app/shared/models/dtos-generated/durchfuehrungsortDTO';
import { KontakteViewDTO } from '@app/shared/models/dtos-generated/kontakteViewDTO';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { SessionDTO } from '@app/shared/models/dtos-generated/sessionDTO';
import { StaatDTO } from '@app/shared/models/dtos-generated/staatDTO';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';

@Injectable()
export class AmmInfotagHelperService {
    constructor(private ammHelper: AmmHelper, private fehlermeldungenService: FehlermeldungenService) {}

    checkDfOrtAdresse(durchfuehrungsortObject: DurchfuehrungsortDTO, switzerland: StaatDTO) {
        const isDifferent = this.ammHelper.isAddressDifferentFromAnbieter(durchfuehrungsortObject, switzerland);
        this.fehlermeldungenService.deleteMessage('amm.message.abweichungstandortadresse', 'info');

        if (isDifferent) {
            this.fehlermeldungenService.showMessage('amm.message.abweichungstandortadresse', 'info');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    checkKontaktperson(dto: SessionDTO | MassnahmeDTO, kpList: KontakteViewDTO[]) {
        const isDifferent = this.compareKontaktperson(dto, kpList);
        this.fehlermeldungenService.deleteMessage('amm.message.abweichungkontaktperson', 'info');

        if (isDifferent) {
            this.fehlermeldungenService.showMessage('amm.message.abweichungkontaktperson', 'info');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    private compareKontaktperson(dto: SessionDTO | MassnahmeDTO, kpList: KontakteViewDTO[]) {
        const populatedKP = dto.durchfuehrungsortObject.ammKontaktpersonObject;
        if (!populatedKP.kontaktId) {
            return false;
        }

        if (kpList.length === 0) {
            return true;
        }

        const originalKP = kpList.find(kontakt => kontakt.kontaktpersonId === populatedKP.kontaktId);

        if (!originalKP) {
            return true;
        }

        return (
            this.hasChanges(originalKP.name, populatedKP.name) ||
            this.hasChanges(originalKP.vorname, populatedKP.vorname) ||
            this.hasChanges(originalKP.telefonNr, populatedKP.telefon) ||
            this.hasChanges(originalKP.mobileNr, populatedKP.mobile) ||
            this.hasChanges(originalKP.telefaxNr, populatedKP.fax) ||
            this.hasChanges(originalKP.email, populatedKP.email)
        );
    }

    private hasChanges(originalValue: string, formValue: string): boolean {
        if (originalValue && formValue) {
            return originalValue !== formValue;
        } else if (!originalValue && !formValue) {
            return false;
        } else {
            return true;
        }
    }
}
