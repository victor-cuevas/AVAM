import { Component, OnInit, OnDestroy, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { NavigationService } from '@app/shared/services/navigation-service';
import { ActivatedRoute, Router } from '@angular/router';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { ToolboxService } from '@app/shared';
import { Subscription } from 'rxjs';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-uebersicht',
    templateUrl: './uebersicht.component.html',
    styleUrls: ['./uebersicht.component.scss']
})
export class UebersichtComponent implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;

    stesId: string;
    individuelleOptions: any[] = [];
    spezielleOptions: any[] = [];
    permissions: typeof Permissions = Permissions;

    private observeClickActionSub: Subscription;
    private ammUebersichtChannel = 'ammUebersicht';

    constructor(
        private navigationService: NavigationService,
        private route: ActivatedRoute,
        private router: Router,
        private ammDataService: AmmRestService,
        private stesInfobarService: AvamStesInfoBarService,
        private facade: FacadeService
    ) {
        ToolboxService.CHANNEL = this.ammUebersichtChannel;
    }

    ngOnInit() {
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesAmm.ammUebersicht' });
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.setSideNavigation();
        this.getData();
        this.configureToolbox();
    }

    ngOnDestroy() {
        this.facade.toolboxService.sendConfiguration([]);
        this.observeClickActionSub.unsubscribe();
    }

    getData() {
        this.ammDataService.getStesAmmMassnahmen(this.stesId).subscribe(options => {
            this.setDropdownoptions(options);
        });
    }

    setDropdownoptions(options: any) {
        options.forEach(element => {
            if (element.code === AmmMassnahmenCode.INDIVIDUELL_KURS || element.code === AmmMassnahmenCode.INDIVIDUELL_AP || element.code === AmmMassnahmenCode.INDIVIDUELL_BP) {
                this.individuelleOptions.push(element);
            } else {
                this.spezielleOptions.push(element);
            }
        });
    }

    setSideNavigation() {
        this.navigationService.showNavigationTreeRoute(AMMPaths.UEBERSICHT);
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.ammUebersichtChannel, ToolboxDataHelper.createForAmmAuszugUebersicht(+this.stesId));

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(this.ammUebersichtChannel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });
    }

    onDropdownOptionClick(option) {
        this.router.navigate([`stes/${this.stesId}/ammnutzung/${option.code}/buchung/0`]);
    }

    onKolektiveAMMClick() {
        this.router.navigate([`stes/${this.stesId}/massnahme-buchen`], { state: { clearSearchState: true } });
    }

    spezielleAmmErfassen(option) {
        if (option.code === AmmMassnahmenCode.AZ) {
            this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.AZ_GESUCH}`]);
        } else if (option.code === AmmMassnahmenCode.FSE) {
            this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.FSE_GESUCH}`]);
        } else if (option.code === AmmMassnahmenCode.EAZ) {
            this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.EAZ_GESUCH}`]);
        } else if (option.code === AmmMassnahmenCode.PEWO) {
            this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.PEWO_GESUCH}`]);
        }
    }

    private openPrintModal(): void {
        this.facade.openModalFensterService.openXLModal(this.modalPrint);
    }
}
