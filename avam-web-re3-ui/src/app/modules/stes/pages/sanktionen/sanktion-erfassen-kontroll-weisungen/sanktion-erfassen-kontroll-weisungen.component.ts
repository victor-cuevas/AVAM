import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { SanktionErfassenAbstractComponent } from '@stes/pages/sanktionen/sanktion-erfassen-abstract/sanktion-erfassen-abstract.component';
import { StesSanktionen } from '@shared/enums/stes-navigation-paths.enum';
import { FormBuilder, Validators } from '@angular/forms';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { SanktionenSachverhaltCodeEnum } from '@shared/enums/domain-code/sanktionen-sachverhalts-code.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { SanktionSachverhaltKontrolWeisDTO } from '@shared/models/dtos-generated/sanktionSachverhaltKontrolWeisDTO';
import { DateValidator } from '@shared/validators/date-validator';
import { DomainEnum } from '@shared/enums/domain.enum';
import { SanktionSachverhaltDTO } from '@shared/models/dtos-generated/sanktionSachverhaltDTO';
import { PreviousRouteService } from '@shared/services/previous-route.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-sanktion-erfassen-kontroll-weisungen',
    templateUrl: './sanktion-erfassen-kontroll-weisungen.component.html',
    styleUrls: ['./sanktion-erfassen-kontroll-weisungen.component.scss']
})
export class SanktionErfassenKontrollWeisungenComponent extends SanktionErfassenAbstractComponent implements OnInit {
    @Input('sachverhaltDTO')
    set sachverhaltDTO(value: SanktionSachverhaltKontrolWeisDTO) {
        this._sachverhaltDTO = value;
        this.stesId = value.sanktionSachverhalt.stesID.toString();
        this.mapToForm(value);
    }

    get sachverhaltDTO(): SanktionSachverhaltKontrolWeisDTO {
        return this._sachverhaltDTO;
    }

    stesSanktionChannel = 'stesSanktionKontrollWeisungenChannel';
    loadGrundSanktionsOptions = DomainEnum.GRUND_KNTRL_WEIS;
    sachverhaltTypeId = SanktionenSachverhaltCodeEnum.SACHVERHALT_KTM;
    stesId: string;
    private currentkontrolPeriode: Date;
    private currentVorfall: Date;

    constructor(
        protected router: Router,
        protected formBuilder: FormBuilder,
        protected dataRestService: StesDataRestService,
        protected activatedRoute: ActivatedRoute,
        protected previousRouteService: PreviousRouteService,
        protected changeDetector: ChangeDetectorRef,
        protected facade: FacadeService
    ) {
        super(dataRestService, changeDetector, previousRouteService, facade);

        this.path = StesSanktionen.SANKTION_ERFASSEN_KONTROLL_WEISUNGEN;
    }

    public ngOnInit(): void {
        this.loadGrundSanktionsOptionsFor();
        this.generateForm();
    }

    kontrollPeriodeIsChanged(date: Date) {
        this.currentkontrolPeriode = this.isValidDate(date) ? date : null;
    }

    datumVorfallIsChanged(date: Date) {
        this.currentVorfall = this.isValidDate(date) ? date : null;
    }

    public mapToDto(): SanktionSachverhaltDTO {
        const sachverhaltControl = this.sachverhaltForm.controls;
        const sachverhaltKontrolWeis: SanktionSachverhaltKontrolWeisDTO = super.mapToDto();
        sachverhaltKontrolWeis.ergaenzAngaben = sachverhaltControl.ergazendeAngaben.value;
        sachverhaltKontrolWeis.datumVorfall = this.currentVorfall;
        sachverhaltKontrolWeis.sanktionSachverhalt.datumKontrollPeriode = this.currentkontrolPeriode;
        sachverhaltKontrolWeis.sanktionSachverhalt.geschaeftsfallID = this.sachverhaltDTO ? this.sachverhaltDTO.sanktionSachverhalt.geschaeftsfallID : null;
        return sachverhaltKontrolWeis;
    }

    protected mapToForm(sachverhaltKontrollWeisungen: SanktionSachverhaltKontrolWeisDTO) {
        super.mapToForm(sachverhaltKontrollWeisungen);
        this.sachverhaltForm.patchValue({
            datumVorfalls: !!sachverhaltKontrollWeisungen.datumVorfall ? new Date(sachverhaltKontrollWeisungen.datumVorfall) : null,
            ergazendeAngaben:
                !!sachverhaltKontrollWeisungen.ergaenzAngaben && sachverhaltKontrollWeisungen.ergaenzAngaben !== '' ? sachverhaltKontrollWeisungen.ergaenzAngaben : null
        });
    }

    private generateForm() {
        this.sachverhaltForm = this.formBuilder.group({
            grundId: [null, [Validators.required]],
            datumKontrollPeriode: [null, [Validators.required, DateValidator.dateFormatMonthYearNgx, DateValidator.dateValidMonthYearNgx]],
            datumVorfalls: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
            ergazendeAngaben: [null],
            datumErfasstAm: ''
        });
    }

    private isValidDate(d: any) {
        return d instanceof Date && !isNaN(d.getTime());
    }
}
