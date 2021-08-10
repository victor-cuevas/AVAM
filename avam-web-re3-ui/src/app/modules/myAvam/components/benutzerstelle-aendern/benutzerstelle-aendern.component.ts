import { BenutzerStelleTableRow } from '@shared/models/dtos/benutzerstelle-table-row.interface';
import { Component, OnInit, ViewChild } from '@angular/core';
import { BenutzerstellenComponent } from '@auth/pages/login/benutzerstellen/benutzerstellen.component';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@angular/common';
import { BenutzerstelleAendernService } from '../../services/benutzerstelle-aendern.service';
import { JwtDTO } from '@shared/models/dtos-generated/jwtDTO';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { StesDataService } from '@stes/services/stes-data.service';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-benutzerstelle-aendern',
    templateUrl: 'benutzerstelle-aendern.component.html'
})
export class BenutzerstelleAendernComponent extends Unsubscribable implements OnInit {
    readonly channel: string = 'benutzerstelle-aendern';
    @ViewChild('benutzerstellenModal') benutzerstellenModal: BenutzerstellenComponent;
    private readonly modalOptions = { ariaLabelledBy: 'modal-basic-title', windowClass: 'hugeModal', backdrop: 'static' } as NgbModalOptions;

    constructor(
        private router: Router,
        private readonly modalService: NgbModal,
        private location: Location,
        private benutzerstelleAendernService: BenutzerstelleAendernService,
        private spinnerService: SpinnerService,
        private stesDataService: StesDataService
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
    }

    ngOnInit(): void {
        this.benutzerstelleAendernService.subject.pipe(takeUntil(this.unsubscribe)).subscribe(
            (jwtDTO: JwtDTO) => {
                this.spinnerService.deactivate(this.channel);
                localStorage.setItem('currentUser', JSON.stringify(jwtDTO));
                this.modalService.dismissAll();
                this.router.navigate(['/home']);
            },
            () => this.spinnerService.deactivate(this.channel)
        );
        this.modalService.open(this.benutzerstellenModal, this.modalOptions);
    }

    public benutzerstelleSelected(benutzerstelle: BenutzerStelleTableRow): void {
        this.spinnerService.activate(this.channel);
        const user: JwtDTO = JSON.parse(localStorage.getItem('currentUser'));
        this.benutzerstelleAendernService.changeBenutzerstelle(user, benutzerstelle);
        this.stesDataService.clearResponseDTOs();
    }

    public closeBenutzerstelle(): void {
        this.modalService.dismissAll();
        this.location.back();
    }
}
