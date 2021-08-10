import { Injectable } from '@angular/core';
import { FormUtilsService } from '@app/shared';
import { AmmAnbieterDTO } from '@app/shared/models/dtos-generated/ammAnbieterDTO';
import { AnbieterZertifikatDTO } from '@app/shared/models/dtos-generated/anbieterZertifikatDTO';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { AnbieterZertifikateReactiveFormsService } from './anbieter-zertifikate-reactive-forms.service';
import { TranslateService } from '@ngx-translate/core';
import { FacadeService } from '@shared/services/facade.service';

@Injectable()
export class AnbieterZertifikateHandlerService {
    constructor(private reactiveForms: AnbieterZertifikateReactiveFormsService, private facade: FacadeService, private translateService: TranslateService) {}

    mapToForm(dto: AmmAnbieterDTO) {
        return { ergaenzendeAngaben: dto.bemerkung };
    }

    mapZertifikateToForm(dto: AmmAnbieterDTO) {
        return dto.zertifikate.map((zertifkat: AnbieterZertifikatDTO) => {
            return {
                zertifikatId: zertifkat.zertifizierungId,
                zertifikatCode: zertifkat.zertifikatObject.codeId,
                gueltigBis: this.facade.formUtilsService.parseDate(zertifkat.zertifikatGueltigBis)
            };
        });
    }

    mapToDto(dto: AmmAnbieterDTO, zertifikate: any[]): AmmAnbieterDTO {
        return {
            ...dto,
            bemerkung: this.reactiveForms.zertifikateForm.value.ergaenzendeAngaben,
            zertifikate: this.mapZertifikateToDto(zertifikate)
        };
    }

    mapZertifikateToDto(zertifikate: any[]): AnbieterZertifikatDTO[] {
        return zertifikate.map(zertifikat => ({
            zertifizierungId: zertifikat.zertifikat,
            zertifikatGueltigBis: zertifikat.gueltigBis ? this.facade.formUtilsService.parseDate(zertifikat.gueltigBis) : new Date(),
            locale: this.translateService.currentLang
        }));
    }
}
