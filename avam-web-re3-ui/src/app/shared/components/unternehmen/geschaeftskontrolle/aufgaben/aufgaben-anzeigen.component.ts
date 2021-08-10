import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AufgabenTableComponent, AufgabeTableRow } from '@shared/components/aufgaben-table/aufgaben-table.component';
import { GekoAufgabenService } from '@shared/services/geko-aufgaben.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { AbstractAufgabenResult } from '@shared/classes/abstract-aufgaben-result';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { GeKoAufgabeDTO } from '@dtos/geKoAufgabeDTO';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { UnternehmenTypes } from '@shared/enums/unternehmen.enum';
import { FacadeService } from '@shared/services/facade.service';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';

@Component({
    selector: 'avam-aufgaben-anzeigen',
    templateUrl: './aufgaben-anzeigen.component.html'
})
export class AufgabenAnzeigenComponent extends AbstractAufgabenResult implements OnInit, OnDestroy {
    @Output() onOpenAufgabe: EventEmitter<any> = new EventEmitter();
    @ViewChild('aufgabenTable') aufgabenTable: AufgabenTableComponent;
    permissions: typeof Permissions = Permissions;
    readonly toolboxChannel = 'gekoAufgabenSearchResults';
    readonly toolboxId = 'gekoAufgaben';
    readonly resultSpinnerChannel = 'aufgabenResult';
    stateKey = 'aufgaben-search';
    private type: string;
    private unternehmenId: number;

    constructor(private infopanelService: AmmInfopanelService, private route: ActivatedRoute, protected facade: FacadeService, protected gekoAufgabenService: GekoAufgabenService) {
        super(gekoAufgabenService, facade);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.type = this.route.parent.snapshot.data['type'];
        this.gekoAufgabenService.clearMessages();
        this.infopanelService.updateInformation({ subtitle: 'geko.pfad.aufgaben.uebersicht' });
        this.gekoAufgabenService.aufgabenSubject.pipe(takeUntil(this.unsubscribe)).subscribe((dtos: GeKoAufgabeDTO[]) => {
            if (dtos) {
                this.infopanelService.updateInformation({ tableCount: dtos.length });
            }
        });
        this.route.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.unternehmenId = params['unternehmenId'];
            this.refreshResults();
        });
        this.configureToolbox(ToolboxConfig.getUnternehmenAufgabenConfig(), this.stateKey, ToolboxDataHelper.createByUnternehmenId(this.unternehmenId));
    }

    ngOnDestroy() {
        this.gekoAufgabenService.clearMessages();
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.facade.toolboxService.resetConfiguration();
        super.ngOnDestroy();
    }

    openAufgabe(row: AufgabeTableRow): void {
        switch (this.type) {
            case UnternehmenTypes.ARBEITGEBER:
                this.gekoAufgabenService.navigateToArbeitgeberAufgabenBearbeiten(String(this.unternehmenId), row.aufgabeId, this.resultSpinnerChannel);
                break;
            case UnternehmenTypes.ANBIETER:
                this.gekoAufgabenService.navigateToAnbieterAufgabenBearbeiten(String(this.unternehmenId), row.aufgabeId, this.resultSpinnerChannel);
                break;
            case UnternehmenTypes.FACHBERATUNG:
                this.gekoAufgabenService.navigateToFachberatungAufgabenBearbeiten(String(this.unternehmenId), row.aufgabeId, this.resultSpinnerChannel);
                break;
        }
    }

    aufgabeErfassen(): void {
        switch (this.type) {
            case UnternehmenTypes.ARBEITGEBER:
                this.gekoAufgabenService.navigateToArbeitgeberAufgabenErfassen(String(this.unternehmenId), this.resultSpinnerChannel);
                break;
            case UnternehmenTypes.ANBIETER:
                this.gekoAufgabenService.navigateToAnbieterAufgabenErfassen(String(this.unternehmenId), this.resultSpinnerChannel);
                break;
            case UnternehmenTypes.FACHBERATUNG:
                this.gekoAufgabenService.navigateToFachberatungAufgabenErfassen(String(this.unternehmenId), this.resultSpinnerChannel);
                break;
        }
    }

    refreshResults(): void {
        switch (this.type) {
            case UnternehmenTypes.ARBEITGEBER:
                this.gekoAufgabenService.getArbeitgeberAufgaben(this.unternehmenId, this.resultSpinnerChannel);
                break;
            case UnternehmenTypes.ANBIETER:
                this.gekoAufgabenService.getAnbieterAufgaben(this.unternehmenId, this.resultSpinnerChannel);
                break;
            case UnternehmenTypes.FACHBERATUNG:
                this.gekoAufgabenService.getFachberatungAufgaben(this.unternehmenId, this.resultSpinnerChannel);
                break;
        }
    }
}
