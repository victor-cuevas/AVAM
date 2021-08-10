import { Unsubscribable } from 'oblique-reactive';
import { ChangeDetectorRef, ViewChild } from '@angular/core';
import { ErweiterteSucheComponent } from '@app/shared';
import { FormGroup } from '@angular/forms';

export abstract class KaeSweSuchenAbstractComponent extends Unsubscribable {
    @ViewChild('erweiterteSucheComponent') erweiterteSucheComponent: ErweiterteSucheComponent;

    protected constructor(protected changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    onClickErweiterteSucheBase(initialExtraCriteria: any): void {
        if (this.hasNewErweiterteSucheChildElements()) {
            let updated = false;
            const extraCriterias = this.erweiterteSucheComponent.getExtraCriteria() as FormGroup[];
            extraCriterias.forEach((extraCriteria: FormGroup) => {
                if (extraCriteria.controls.comparatorId.value === '') {
                    extraCriteria.controls.searchFieldId.setValue(initialExtraCriteria.searchFieldId);
                    extraCriteria.controls.searchLevel1.setValue(initialExtraCriteria.searchLevel1);
                    updated = true;
                }
            });
            if (updated) {
                this.changeDetectorRef.detectChanges();
            }
        }
    }

    private hasNewErweiterteSucheChildElements(): boolean {
        return this.erweiterteSucheComponent && this.erweiterteSucheComponent.criteria.controls.length > 0;
    }
}
