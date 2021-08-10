import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { CodeDTO } from '@dtos/codeDTO';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AfterViewInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SanktionSachverhaltDTO } from '@shared/models/dtos-generated/sanktionSachverhaltDTO';
import { FallbearbeitungFormComponent } from '@stes/pages/sanktionen/fallbearbeitung-form/fallbearbeitung-form.component';
import { SanktionSachverhalt } from '@shared/models/dtos-generated/sanktionSachverhalt';
import { PreviousRouteService } from '@shared/services/previous-route.service';
import { FacadeService } from '@shared/services/facade.service';

export abstract class SanktionErfassenAbstractComponent implements AfterViewInit, OnDestroy {
    abstract stesSanktionChannel: string;
    abstract loadGrundSanktionsOptions: string;
    abstract stesId: string;
    abstract sachverhaltTypeId: string;
    @ViewChild('fallbearbeitung') fallbearbeitung: FallbearbeitungFormComponent;
    public grundValue = '01';
    public isDisabled: boolean;
    public isBearbeiten: boolean;
    public path: string;
    public sachverhaltChanel = 'sanktionSachverhaltChannel';
    public sanktionsgrund: any[];
    public sachverhaltForm: FormGroup;
    public sachverhaltTypen: CodeDTO[];
    public sachverhaltTypeCode: number;
    @ViewChild('ngForm') public ngForm: FormGroupDirective;
    protected _sachverhaltDTO: SanktionSachverhaltDTO;
    protected unsubscribe$ = new Subject();

    protected constructor(
        protected dataRestService: StesDataRestService,
        protected changeDetector: ChangeDetectorRef,
        protected previousRouteService: PreviousRouteService,
        protected facade: FacadeService
    ) {
        this.dataRestService
            .getCode('SachverhaltGrund')
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(data => {
                this.sachverhaltTypen = data;
                this.sachverhaltTypeCode = +this.facade.formUtilsService.getCodeIdByCode(this.sachverhaltTypen, this.sachverhaltTypeId);
            });
    }

    public ngAfterViewInit(): void {
        if (!!this.isDisabled) {
            this.stellungnahmeViewDisable();
        }
    }

    public ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public stellungnahmeViewDisable(): void {
        this.sachverhaltForm.disable();
        this.fallbearbeitung.fallbearbeitungForm.controls.benutzerstellenId.disable();
        this.fallbearbeitung.fallbearbeitungForm.controls.bearbeitung.disable();
        this.changeDetector.detectChanges();
    }

    public mapToDto(): SanktionSachverhaltDTO {
        const fallbearbeitungControl = this.fallbearbeitung.fallbearbeitungForm.controls;
        const currentSachverhalt: SanktionSachverhaltDTO = new class implements SanktionSachverhaltDTO {
            grundId: number;
            sachverhaltID: number;
            sanktionSachverhalt: SanktionSachverhalt = new class implements SanktionSachverhalt {
                datumErfasstAm: Date;
                datumKontrollPeriode: Date;
                notizen: string;
                stesID: number;
                personalBeraterID: number;
                sachbearbeitungID: number;
                benutzerstelleID: number;
                sachverhaltTypID: number;
            }();
            type: string;
        }();
        currentSachverhalt.sanktionSachverhalt.stesID = Number(this.stesId);
        currentSachverhalt.sanktionSachverhalt.notizen = fallbearbeitungControl.notizen.value;
        currentSachverhalt.sanktionSachverhalt.benutzerstelleObject = {
            code: this.fallbearbeitung.benutzerCode
        };
        currentSachverhalt.sanktionSachverhalt.sachbearbeitungID =
            this.fallbearbeitung.bearbeitung && this.fallbearbeitung.bearbeitung.benutzerDetailId ? this.fallbearbeitung.bearbeitung.benutzerDetailId : null;
        currentSachverhalt.grundId = this.sachverhaltForm.controls.grundId.value;
        currentSachverhalt.sanktionSachverhalt.erfasstAm = this.sachverhaltForm.controls.datumErfasstAm.value;
        currentSachverhalt.sanktionSachverhalt.datumKontrollPeriode = this.sachverhaltForm.controls.datumKontrollPeriode.value;
        currentSachverhalt.type = this.sachverhaltTypeCode.toString();
        if (this.isBearbeiten) {
            currentSachverhalt.sanktionSachverhalt.sachverhaltID = this._sachverhaltDTO.sanktionSachverhalt.sachverhaltID;
        }
        return currentSachverhalt;
    }

    public existingEntscheidOrSachverhalt() {
        return !!(
            (this.isBearbeiten &&
                this._sachverhaltDTO &&
                ((this._sachverhaltDTO.entscheidList && this._sachverhaltDTO.entscheidList.length > 0) ||
                    (this._sachverhaltDTO.stellungnahmeList && this._sachverhaltDTO.stellungnahmeList.length > 0))) ||
            this.isDisabled
        );
    }

    protected setInitialValues(): void {
        this.sachverhaltForm.controls.grundId.setValue(this.sanktionsgrund.find(grundValue => grundValue.code === this.grundValue).value);
        this.sachverhaltForm.controls.datumErfasstAm.setValue(new Date());
    }

    protected loadGrundSanktionsOptionsFor() {
        this.facade.spinnerService.activate(this.stesSanktionChannel);
        this.dataRestService
            .getCode(this.loadGrundSanktionsOptions)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                (sanktionsgrund: CodeDTO[]) => {
                    if (sanktionsgrund) {
                        this.sanktionsgrund = this.facade.formUtilsService.mapDropdownKurztext(sanktionsgrund);
                        if (!this.isBearbeiten) {
                            this.setInitialValues();
                        }
                    }
                    this.facade.spinnerService.deactivate(this.stesSanktionChannel);
                },
                () => {
                    this.facade.spinnerService.deactivate(this.stesSanktionChannel);
                }
            );
    }

    protected mapToForm(sachverhalt: SanktionSachverhaltDTO): void {
        this.sachverhaltForm.patchValue({
            grundId: sachverhalt.grundId,
            datumKontrollPeriode: new Date(sachverhalt.sanktionSachverhalt.datumKontrollPeriode),
            datumErfasstAm: sachverhalt.sanktionSachverhalt.erfasstAm ? new Date(sachverhalt.sanktionSachverhalt.erfasstAm) : ''
        });

        this.fallbearbeitung.mapToForm(sachverhalt);
    }
}
