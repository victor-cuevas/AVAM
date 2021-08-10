import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FachberatungsangeboteFormComponent } from '@stes/pages/unternehmen/unternehmen-details/fachberatungsangebote/suchen/form/fachberatungsangebote-form.component';
import { FachberatungsangeboteResultComponent } from '@stes/pages/unternehmen/unternehmen-details/fachberatungsangebote/suchen/result/fachberatungsangebote-result.component';
import { Unsubscribable } from 'oblique-reactive';
import { Router } from '@angular/router';
import { ReloadHelper } from '@shared/helpers/reload.helper';

@Component({
    selector: 'avam-fachberatungsangebote-suchen',
    templateUrl: './fachberatungsangebote-suchen.component.html'
})
export class FachberatungsangeboteSuchenComponent extends Unsubscribable implements OnInit, AfterViewInit {
    @ViewChild('form') form: FachberatungsangeboteFormComponent;
    @ViewChild('result') result: FachberatungsangeboteResultComponent;
    constructor(private changeDetector: ChangeDetectorRef, private router: Router) {
        super();
    }

    ngOnInit(): void {
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.onReset());
    }

    ngAfterViewInit(): void {
        this.changeDetector.detectChanges();
    }

    onReset(): void {
        this.form.resetData();
        this.result.onReset();
    }
}
