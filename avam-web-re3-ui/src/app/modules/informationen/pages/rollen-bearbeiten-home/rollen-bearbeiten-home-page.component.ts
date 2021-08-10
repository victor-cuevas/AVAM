import { AfterViewInit, Component, TemplateRef, ViewChild } from '@angular/core';
import { BenutzerstelleService } from '@shared/services/benutzerstelle.service';

@Component({
    selector: 'avam-rollen-bearbeiten-home-page',
    templateUrl: './rollen-bearbeiten-home-page.component.html'
})
export class RollenBearbeitenHomePageComponent implements AfterViewInit {
    readonly navPath = 'informationen';
    readonly sideMenu = 'rolleNavItems';

    @ViewChild('spacer')
    spacer: TemplateRef<any>;

    constructor(private service: BenutzerstelleService) {}

    ngAfterViewInit(): void {
        this.service.infopanelService.sendTemplateToInfobar(this.spacer);
    }
}
