import { Injectable } from '@angular/core';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { AusgangsLageFormData, SituationsbeurteilungColumns } from './ausgangslage-form.model';

@Injectable()
export class AusgangslageTableSortService {
    constructor(private dbTranslateService: DbTranslateService) {}

    sortData(array: any[], field: string, order: number, formData: AusgangsLageFormData): any[] {
        return array.sort((a, b) => {
            let optionA: string;
            let optionB: string;

            switch (field) {
                case SituationsbeurteilungColumns.BEURTEILUNGSKRITERIUM:
                    optionA = this.getOption(a[field]);
                    optionB = this.getOption(b[field]);
                    break;

                case SituationsbeurteilungColumns.HANDLUNGSBEDARF:
                    const hbA = formData.handlungsbedarfOptions.find(el => el.codeId === +a[field]);
                    const hbB = formData.handlungsbedarfOptions.find(el => el.codeId === +b[field]);
                    optionA = this.getOption(hbA);
                    optionB = this.getOption(hbB);
                    break;

                case SituationsbeurteilungColumns.PRIORITY:
                    const prA = formData.priorityOptions.find(el => el.codeId === +a[field]);
                    const prB = formData.priorityOptions.find(el => el.codeId === +b[field]);
                    optionA = this.getOption(prA);
                    optionB = this.getOption(prB);
                    break;

                default:
                    break;
            }
            return this.compareValues(optionA, optionB, order);
        });
    }

    getOption(codeDTO: CodeDTO): string {
        return codeDTO ? this.dbTranslateService.get(codeDTO, 'kurzText', this.dbTranslateService.getCurrentLang()) : '';
    }

    compareValues(a: string, b: string, order: number): number {
        if (a === '' && b === '') {
            return 0;
        }
        if (a === '') {
            return order === 1 ? -1 : 1;
        }
        if (b === '') {
            return order;
        }
        if (order === 1) {
            return a.localeCompare(b);
        }
        if (order === -1) {
            return b.localeCompare(a);
        }
        return 0;
    }
}
