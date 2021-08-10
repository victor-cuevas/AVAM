import { TranslateService } from '@ngx-translate/core';
import { StellungnahmeSanktionDTO } from '@dtos/stellungnahmeSanktionDTO';

export enum Status {
    AUSSTEHEND = 1,
    AKZEPTIERT = 2,
    ABGELEHNT = 3
}

const STATUS_LABELS = [
    { status: Status.AUSSTEHEND, label: 'stes.vermittlungsfaehigkeit.status.ausstehend' },
    { status: Status.AKZEPTIERT, label: 'stes.vermittlungsfaehigkeit.status.akzeptiert' },
    { status: Status.ABGELEHNT, label: 'stes.vermittlungsfaehigkeit.status.abgelehnt' }
];

export function getStatusOptions(translateService: TranslateService): any[] {
    const currentLang = translateService.currentLang;
    return STATUS_LABELS.map(s => {
        const translationDe = currentLang === 'de' ? translateService.instant(s.label) : '';
        const translationFr = currentLang === 'fr' ? translateService.instant(s.label) : '';
        const translationIt = currentLang === 'it' ? translateService.instant(s.label) : '';
        return { value: s.status, labelDe: translationDe, labelFr: translationFr, labelIt: translationIt };
    });
}

export function parseStatusToBegruendungAkzeptiert(statusValue: number): boolean {
    return statusValue === Status.AUSSTEHEND ? null : statusValue === Status.AKZEPTIERT;
}

export function mapStellungnahmeDtoToForm(dto: StellungnahmeSanktionDTO): any {
    return {
        stellungnahmeBis: !!dto.stellungnahmeBis ? new Date(dto.stellungnahmeBis) : null,
        eingangsdatum: !!dto.eingangsDatum ? new Date(dto.eingangsDatum) : null,
        statusCode: dto.begruendungAkzeptiert === null ? Status.AUSSTEHEND : dto.begruendungAkzeptiert ? Status.AKZEPTIERT : Status.ABGELEHNT
    };
}
