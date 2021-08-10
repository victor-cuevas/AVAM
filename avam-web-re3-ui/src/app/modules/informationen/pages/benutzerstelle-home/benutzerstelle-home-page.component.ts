import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BaseResponseWrapperBenutzerstelleObjectDTOWarningMessages } from '@dtos/baseResponseWrapperBenutzerstelleObjectDTOWarningMessages';
import { BenutzerstelleService } from '@shared/services/benutzerstelle.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { BenutzerstelleObjectDTO } from '@dtos/benutzerstelleObjectDTO';
import { takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { ToolboxService } from '@app/shared';

@Component({
    selector: 'avam-benutzerstelle-home-page',
    templateUrl: './benutzerstelle-home-page.component.html'
})
export class BenutzerstelleHomePageComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('spacer') spacer: TemplateRef<any>;
    readonly navPath = 'informationen';
    readonly sideMenu = 'benutzerstelleNavItems';
    readonly channel = 'avam-benutzerstelle-home-page.channel';
    private benutzerstelleId: number;
    private dto: BenutzerstelleObjectDTO;

    constructor(private service: BenutzerstelleService, private route: ActivatedRoute) {
        super();
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit(): void {
        this.route.params.subscribe((params: ParamMap) => {
            this.benutzerstelleId = +params['benutzerstelleId'];
            this.initInfoLeiste();
            this.subscribeToLangChange();
        });
    }

    ngAfterViewInit(): void {
        this.service.infopanelService.sendTemplateToInfobar(this.spacer);
    }

    ngOnDestroy(): void {
        this.service.facade.toolboxService.resetConfiguration();
        this.service.facade.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    private initInfoLeiste(): void {
        this.service.rest.get(this.benutzerstelleId).subscribe((response: BaseResponseWrapperBenutzerstelleObjectDTOWarningMessages) => {
            this.dto = response.data;
            this.initInfopanel();
            this.service.infoBarPanelService.sendLastUpdate(this.dto);
        });
    }

    private initInfopanel(): void {
        const label = this.service.facade.translateService.instant('common.label.benutzerstelle');
        this.service.infopanelService.updateInformation({
            title: `${label} ${this.dto.code}`
        });
    }

    private subscribeToLangChange(): void {
        this.service.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.initInfopanel();
        });
    }
}
