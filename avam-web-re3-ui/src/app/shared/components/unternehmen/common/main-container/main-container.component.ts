import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageBus } from '@shared/services/message-bus';
import { NavigationService } from '@shared/services/navigation-service';
import { AvamNavBase } from '@shared/classes/avam-nav-base';

@Component({
    selector: 'avam-main-container',
    templateUrl: './main-container.component.html',
    styleUrls: ['./main-container.component.scss']
})
export class UnternehmenMainContainerComponent extends AvamNavBase implements OnInit {
    navPath: string;
    sideMenu: string;

    constructor(private activatedRoute: ActivatedRoute, protected messageBus: MessageBus, protected navigationService: NavigationService) {
        super(messageBus, navigationService);
    }

    ngOnInit() {
        this.navPath = this.activatedRoute.parent.snapshot.data['navPath'];
        this.sideMenu = this.navPath === 'stes' ? 'fachberatungNavItems' : '';
        super.ngOnInit();
    }
}
