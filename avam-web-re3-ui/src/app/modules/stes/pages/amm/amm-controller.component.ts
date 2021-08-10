import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AmmStoreService } from './amm-store.service';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { AmmGeschaeftElementCode } from '@app/shared/enums/domain-code/amm-geschaeft-element-code.enum';

@Component({ template: '' })
export class AmmControllerComponent implements OnInit, OnDestroy {
    private ammStoreSubscription: Subscription;
    private ammTypeCode: string;
    private nodeData: any;
    private gfId: string;
    private entscheidId;
    constructor(private router: Router, private route: ActivatedRoute, private ammStore: AmmStoreService) {}

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.ammTypeCode = params['type'];
        });

        this.route.queryParams.subscribe(params => {
            this.gfId = params['gfId'];
            this.entscheidId = params['entscheidId'];
        });

        this.ammStoreSubscription = this.ammStore.data$.subscribe(data => {
            this.nodeData = data.nodeData;
            if (this.ammTypeCode !== ':type') {
                this.checkRouting();
            }

            this.navigate();
        });
    }

    ngOnDestroy() {
        this.ammStoreSubscription.unsubscribe();
    }

    private navigate() {
        const type = this.ammTypeCode !== ':type' ? this.ammTypeCode : this.nodeData.type;
        const gfId = this.gfId ? this.gfId : this.nodeData.gfId;
        const entscheidId = this.entscheidId ? this.entscheidId : this.nodeData.entscheidId;

        let target = `./amm/uebersicht/${type}/${this.nodeData.elementType}`;
        if (this.nodeData.elementType === AmmGeschaeftElementCode.AMM_GF_ELEM_BUCHUNG) {
            if (type === AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT) {
                target = `./amm/uebersicht/${type}/${this.nodeData.elementType}-angebot`;
            } else if (type === AmmMassnahmenCode.KURS) {
                target = `./amm/uebersicht/${type}/${this.nodeData.elementType}-kollektiv`;
            } else if (this.isTypePsAk(type)) {
                target = `./amm/uebersicht/${type}/${this.nodeData.elementType}-psak`;
            } else {
                target = `./amm/uebersicht/${type}/${this.nodeData.elementType}-individuell`;
            }
        } else if (this.nodeData.elementType === AmmGeschaeftElementCode.AMM_GF_ELEM_ENTSCHEID) {
            if (this.isTypeSpeziell(type)) {
                target = `./amm/uebersicht/${type}/speziell-${this.nodeData.elementType}`;
            } else {
                target = `./amm/uebersicht/${type}/bim-bem-${this.nodeData.elementType}`;
            }
        }

        this.router.navigate([target], {
            relativeTo: this.route.parent,
            queryParams: { gfId, entscheidId }
        });
    }

    private checkRouting() {
        if (this.isTypeSpeziell(this.ammTypeCode)) {
            this.nodeData.elementType = AmmGeschaeftElementCode.AMM_GF_ELEM_GESUCH;
        } else {
            this.nodeData.elementType = AmmGeschaeftElementCode.AMM_GF_ELEM_BUCHUNG;
        }
    }

    private isTypeSpeziell(type: string) {
        return type === AmmMassnahmenCode.AZ || type === AmmMassnahmenCode.EAZ || type === AmmMassnahmenCode.FSE || type === AmmMassnahmenCode.PEWO;
    }

    private isTypePsAk(type: string) {
        return (
            type === AmmMassnahmenCode.BP || type === AmmMassnahmenCode.AP || type === AmmMassnahmenCode.UEF || type === AmmMassnahmenCode.PVB || type === AmmMassnahmenCode.SEMO
        );
    }
}
