import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { Unsubscribable } from 'oblique-reactive';
import { ContentService } from '@shared/components/unternehmen/common/content/content.service';

@Component({
    selector: 'avam-unternehmen-content',
    templateUrl: './content.component.html',
    styleUrls: ['./content.component.scss']
})
export class UnternehmenContentComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;
    @Input() unternehmenId: any;

    constructor(public contentService: ContentService, private activatedRoute: ActivatedRoute, private infopanelService: AmmInfopanelService, private cd: ChangeDetectorRef) {
        super();
    }

    ngOnInit(): void {
        this.cd.detectChanges();
        this.activatedRoute.params.subscribe(params => {
            this.contentService.getUnternehmen(params['unternehmenId'] || this.unternehmenId);
            this.infopanelService.sendTemplateToInfobar(this.panelTemplate);
        });
    }

    ngOnDestroy(): void {
        this.infopanelService.resetTemplateInInfobar();
    }
}
