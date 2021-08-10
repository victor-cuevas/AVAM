import { Injectable } from '@angular/core';
import { CodeDTO } from '@shared/models/dtos-generated/codeDTO';
import { SachverhaltStatusCodeEnum as StatusCode } from '@shared/enums/domain-code/sachverhaltstatus-code.enum';
import { FormUtilsService } from '@app/shared';

@Injectable()
export class StatusCodeService {
    constructor(private formUtils: FormUtilsService) {}

    public filterStatusOptionsByInitialStatus(options: CodeDTO[], initialStatus: number): CodeDTO[] {
        if (initialStatus.toString() === this.formUtils.getCodeIdByCode(options, StatusCode.STATUS_PENDENT)) {
            return options.filter(code => {
                return code.code === StatusCode.STATUS_PENDENT || code.code === StatusCode.STATUS_FREIGABEBEREIT;
            });
        } else if (initialStatus.toString() === this.formUtils.getCodeIdByCode(options, StatusCode.STATUS_UEBERARBEITUNG)) {
            return options.filter(code => {
                return code.code === StatusCode.STATUS_PENDENT || code.code === StatusCode.STATUS_FREIGABEBEREIT || code.code === StatusCode.STATUS_UEBERARBEITUNG;
            });
        } else {
            return options;
        }
    }
}
