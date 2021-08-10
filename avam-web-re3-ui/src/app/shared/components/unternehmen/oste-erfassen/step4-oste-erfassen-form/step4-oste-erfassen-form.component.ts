import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { CodeDTO } from '@dtos/codeDTO';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { forkJoin, Subject } from 'rxjs';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import { takeUntil } from 'rxjs/operators';
import { NumberValidator } from '@shared/validators/number-validator';
import * as moment from 'moment';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { StatusEnum } from '@shared/classes/fixed-codes';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { DateValidator } from '@shared/validators/date-validator';
import { FormUtilsService } from '@app/shared';
import { OsteDTO } from '@dtos/osteDTO';
import { OsteSchlagwortDTO } from '@dtos/osteSchlagwortDTO';
import { UnternehmenDTO } from '@dtos/unternehmenDTO';
import { AuthenticationService } from '@core/services/authentication.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { BurOertlicheEinheitDTO } from '@dtos/burOertlicheEinheitDTO';
import { ButtonGroupBewirtschaftungComponent } from '@shared/components/unternehmen/oste-erfassen/step4-oste-erfassen-form/button-checkbox/button-group-bewirtschaftung.component';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-step4-oste-erfassen-form',
    templateUrl: './step4-oste-erfassen-form.component.html',
    styleUrls: ['./step4-oste-erfassen-form.component.scss']
})
export class Step4OsteErfassenFormComponent extends Unsubscribable implements OnInit, AfterViewInit {
    @ViewChild('stellenverantwortung') stellenverantwortung: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @Input() public isBearbeiten = false;

    public bewirtschaftungForm: FormGroup;

    @ViewChild('internButtons') internButtons: ButtonGroupBewirtschaftungComponent;
    @ViewChild('externButtons') externButtons: ButtonGroupBewirtschaftungComponent;
    @ViewChild('euresButtons') euresButtons: ButtonGroupBewirtschaftungComponent;

    public dataLoaded = new Subject<void>();
    public mapToFormEnded = new Subject<void>();
    public personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;
    public bearbeitungsstandOptions: CodeDTO[] = [];
    public abmeldegrundOptions: CodeDTO[] = [];
    public statusOptions: CodeDTO[] = [];
    public schlagworteOptions = [];
    public channel = 'bewirtschaftung';
    public stellenverantwortungTokens: any = {};
    private currentAuftraggeber: any;
    private readonly JA: boolean = true;
    private readonly NEIN: boolean = false;

    constructor(
        private fb: FormBuilder,
        private spinnerService: SpinnerService,
        private stesDataService: StesDataRestService,
        private unternehmenRestService: UnternehmenRestService,
        private facade: FacadeService,
        private authenticationService: AuthenticationService
    ) {
        super();
    }

    public getCurrentAuftraggeber(): any {
        return this.currentAuftraggeber;
    }

    public ngOnInit() {
        this.initForm();
        if (!this.isBearbeiten) {
            this.initRoomButton();
        }
        this.initToken();
    }

    public ngAfterViewInit() {
        this.getInitialData();
        this.stellenverantwortung.appendCurrentUser();
        this.setSubscriptions();
    }

    public setSubscriptions() {
        this.bewirtschaftungForm.controls.stellenmeldung.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
            if (value) {
                this.bewirtschaftungForm.controls.arbeitgeber.setValidators(Validators.required);
            } else {
                this.bewirtschaftungForm.controls.arbeitgeber.clearValidators();
                this.bewirtschaftungForm.controls.arbeitgeber.setValue(null);
            }
            this.bewirtschaftungForm.controls.arbeitgeber.updateValueAndValidity();
        });
        this.bewirtschaftungForm.controls.unbegrentz.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
            const validators = [DateValidator.dateFormatNgx, DateValidator.dateValidNgx];
            if (!this.isBearbeiten) {
                validators.push(DateValidator.val083);
            }
            if (value) {
                this.bewirtschaftungForm.controls.gueltigkeitsDatum.setValue(null);
            } else {
                validators.push(Validators.required);
            }
            this.bewirtschaftungForm.controls.gueltigkeitsDatum.setValidators(validators);
            this.bewirtschaftungForm.controls.gueltigkeitsDatum.updateValueAndValidity();
        });
        if (this.isBearbeiten) {
            this.bewirtschaftungForm.controls.abmeldung.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
                const validators = [DateValidator.dateFormatNgx, DateValidator.dateValidNgx];
                validators.push(DateValidator.checkDateSameOrBefore(new Date(this.bewirtschaftungForm.controls.anmeldeDatum.value), 'val084'), DateValidator.isDateInFutureNgx);
                this.bewirtschaftungForm.controls.abmeldung.setValidators(validators);
            });
        }
    }

    public reset() {
        this.bewirtschaftungForm.reset({
            anzhalstellen: 1,
            zuweisungMax: 10,
            anmeldeDatum: new Date(),
            gueltigkeitsDatum: moment()
                .add(30, 'days')
                .toDate()
        });
        this.initRoomButton();
        this.stellenverantwortung.appendCurrentUser();
        this.updateSchlagwortList([]);
        this.bewirtschaftungForm.get('schlagworte').setValue(this.schlagworteOptions);
    }

    setSperrfristbis(event) {
        const sperrfristbis = this.bewirtschaftungForm.controls.sperrfristbis as FormGroup;
        if (event) {
            const validators = [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx];
            sperrfristbis.setValidators(validators);
            if (!this.isBearbeiten) {
                sperrfristbis.setValue(
                    moment()
                        .add(7, 'days')
                        .toDate()
                );
            }
        } else {
            sperrfristbis.clearValidators();
            sperrfristbis.setValue(null);
        }
    }

    setForm(oste: OsteDTO) {
        this.bewirtschaftungForm.setValue(this.mapToForm(oste), { emitEvent: false, onlySelf: true });
        this.setRoomButtons(oste);
        this.updateSchlagwortList(!!oste ? oste.schlagwortList : []);
        this.bewirtschaftungForm.get('schlagworte').setValue(this.schlagworteOptions);
        this.currentAuftraggeber = !!oste.auftraggeberObject ? oste.auftraggeberObject : oste.auftraggeberBurObject;
        this.initToken(oste);
        this.mapToFormEnded.next();
        this.mapToFormEnded.complete();
    }

    mapToForm(oste: OsteDTO) {
        return {
            stellenverantwortung: oste.stellenverantwortlicherDetailObject,
            meldepflicht: oste.meldepflicht,
            bearbeitungsstand: oste.meldepflichtBearbeitungId,
            meldungBeiVermittlung: oste.meldung,
            vermittlungenFreigegeben: oste.zuweisungFreigeben,
            vorselektion: oste.vorselektion,
            vermittlungsstop: oste.zuweisungStop,
            anzhalstellen: oste.gleicheOste,
            zuweisungMax: oste.zuweisungMax,
            stellenmeldung: oste.auftraggeberObject !== null || oste.auftraggeberBurObject !== null,
            arbeitgeber: !!oste.auftraggeberObject ? this.getArbeitgeber(oste.auftraggeberObject) : this.getBurArbeitgeber(oste.auftraggeberBurObject),
            weitereAngaben: oste.angabenBewirt,
            schlagworte: [],
            jobroomInternPublikation: null,
            jobroomExternPublikation: null,
            eures: null,
            sperrfristbis: this.facade.formUtilsService.parseDate(oste.sperrfrist),
            anmeldeDatum: this.facade.formUtilsService.parseDate(oste.anmeldeDatum),
            gueltigkeitsDatum: !this.isGueltigkeitUnbegrenzt(oste.gueltigkeit) ? this.facade.formUtilsService.parseDate(oste.gueltigkeit) : null,
            unbegrentz: this.isGueltigkeitUnbegrenzt(oste.gueltigkeit),
            abmeldung: this.facade.formUtilsService.parseDate(oste.abmeldeDatum),
            grund: oste.abmeldeGrund,
            status: oste.statusId
        };
    }

    selectedUnternehmen(unternehmen: any) {
        this.currentAuftraggeber = unternehmen;
    }

    clearUnternehmen() {
        this.currentAuftraggeber = null;
    }

    initToken(osteDTO?: OsteDTO) {
        const currentUser = this.authenticationService.getLoggedUser();
        const benutzerstelleId = osteDTO ? osteDTO.ownerId : currentUser.benutzerstelleId;

        this.stellenverantwortungTokens = {
            berechtigung: Permissions.KEY_AG_OSTE_BEARBEITEN,
            benutzerstelleId,
            myBenutzerstelleId: currentUser.benutzerstelleId
        };
    }

    initForm() {
        const currentUser = this.authenticationService.getLoggedUser();
        const gueltigbisValidators = [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx];
        if (!this.isBearbeiten) {
            gueltigbisValidators.push(DateValidator.val083);
        }
        this.bewirtschaftungForm = this.fb.group(
            {
                stellenverantwortung: [
                    {
                        benutzerId: currentUser.benutzerId,
                        benutzerDetailId: Number(currentUser.benutzerDetailId),
                        benutzerLogin: currentUser.benutzerLogin,
                        nachname: currentUser.name,
                        vorname: currentUser.vorname,
                        benuStelleCode: currentUser.benutzerstelleCode,
                        benutzerstelleId: currentUser.benutzerstelleId
                    },
                    Validators.required
                ],
                meldepflicht: false,
                bearbeitungsstand: false,
                meldungBeiVermittlung: false,
                vermittlungenFreigegeben: false,
                vorselektion: false,
                vermittlungsstop: false,
                anzhalstellen: [
                    1,
                    [
                        Validators.required,
                        NumberValidator.isPositiveInteger,
                        NumberValidator.isNumberWithinRage(0, 100, 'val078', 'warning', false),
                        NumberValidator.isNumberWithinRage(1, 999, 'val079')
                    ]
                ],
                zuweisungMax: [10, [Validators.required, NumberValidator.isPositiveInteger, NumberValidator.isNumberWithinRage(0, 999, 'val279')]],
                stellenmeldung: false,
                arbeitgeber: null,
                weitereAngaben: null,
                schlagworte: null,
                sperrfristbis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                jobroomInternPublikation: null,
                jobroomExternPublikation: null,
                eures: null,
                anmeldeDatum: [new Date(), [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                gueltigkeitsDatum: [
                    moment()
                        .add(30, 'days')
                        .toDate(),
                    gueltigbisValidators
                ],
                unbegrentz: false,
                abmeldung: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                grund: false,
                status: false
            },
            {
                validators: !this.isBearbeiten ? [DateValidator.rangeBetweenDates('anmeldeDatum', 'gueltigkeitsDatum', 'val084')] : []
            }
        );
    }

    public disableAllForm() {
        for (const control in this.bewirtschaftungForm.controls) {
            this.bewirtschaftungForm.controls[control].disable();
        }
        this.internButtons.disableComponent(true);
        this.externButtons.disableComponent(true);
        this.euresButtons.disableComponent(true);
    }

    public enableAllForms() {
        for (const control in this.bewirtschaftungForm.controls) {
            this.bewirtschaftungForm.controls[control].enable();
        }
        this.internButtons.disableComponent(false);
        this.externButtons.disableComponent(false);
        this.euresButtons.disableComponent(false);
    }

    private getInitialData() {
        this.spinnerService.activate(this.channel);
        forkJoin<CodeDTO[], CodeDTO[], any, CodeDTO[]>([
            this.stesDataService.getCode(DomainEnum.MELDEPFLICHTBEARBEITUNG),
            this.stesDataService.getCode(DomainEnum.ABMELDEGRUND_OSTE),
            this.unternehmenRestService.getSchlagworteFromOste(StatusEnum.AKTIV),
            this.stesDataService.getCode(DomainEnum.STATUS_OSTE)
        ])
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                ([bearbeitungsstand, abmeldegrund, schlagworte, status]) => {
                    this.bearbeitungsstandOptions = this.facade.formUtilsService.mapDropdownKurztext(bearbeitungsstand);
                    this.abmeldegrundOptions = this.facade.formUtilsService.mapDropdownKurztext(abmeldegrund).filter(item => item.code !== '8');
                    this.schlagworteOptions = schlagworte.data.map(this.mapMultiselect);
                    this.statusOptions = this.facade.formUtilsService.mapDropdownKurztext(status);
                    this.spinnerService.deactivate(this.channel);
                    this.dataLoaded.next();
                    this.dataLoaded.complete();
                },
                () => {
                    this.spinnerService.activate(this.channel);
                }
            );
    }

    private mapMultiselect = (schlagwort: any) => {
        const element = schlagwort;

        return {
            id: element.schlagwortId,
            textDe: element.schlagwortDe,
            textIt: element.schlagwortIt,
            textFr: element.schlagwortFr,
            value: false
        };
    };

    private getArbeitgeber(unternehmen: UnternehmenDTO) {
        return unternehmen
            ? {
                  name1: unternehmen.name1,
                  unternehmenId: unternehmen.unternehmenId
              }
            : null;
    }

    private updateSchlagwortList(schlagworteList: Array<OsteSchlagwortDTO>) {
        this.schlagworteOptions.forEach(item => {
            item.value = !!schlagworteList.find(schlagworte => schlagworte.schlagwortId === item.id);
        });
    }

    private isGueltigkeitUnbegrenzt(date: Date): boolean {
        const gueltigkeitsDatum = moment(date).format('DD.MM.YYYY');
        const maxDate = moment('9999-12-31').format('DD.MM.YYYY');
        return !moment(gueltigkeitsDatum, 'DD.MM.YYYY').isBefore(moment(maxDate, 'DD.MM.YYYY'));
    }

    applyBsp84() {
        if (this.externButtons.getCurrentValue().isYesSelected || this.euresButtons.getCurrentValue().isYesSelected) {
            this.internButtons.updateSelectedButton(this.JA);
            this.internButtons.disableComponent(true, false);
        } else if (this.internButtons.getCurrentValue().isYesSelected) {
            this.internButtons.disableComponent(false);
        } else {
            this.internButtons.disableComponent(false, true);
        }
    }

    private getBurArbeitgeber(auftraggeberBurObject: BurOertlicheEinheitDTO) {
        return auftraggeberBurObject
            ? {
                  name1: auftraggeberBurObject.letzterAGName1,
                  burOrtEinheitId: auftraggeberBurObject.burOrtEinheitId
              }
            : null;
    }

    private setRoomButtons(oste: OsteDTO) {
        this.internButtons.updateSelectedButton(oste.jobroomInternPublikation, oste.jobroomInternAnonym);
        this.externButtons.updateSelectedButton(oste.jobroomExternPublikation, oste.jobroomExternAnonym);
        this.euresButtons.updateSelectedButton(oste.eures, oste.euresAnonym);
        this.applyBsp84();
    }

    private initRoomButton() {
        this.internButtons.updateSelectedButton(this.JA, this.NEIN);
        this.externButtons.updateSelectedButton(this.bewirtschaftungForm.controls.meldepflicht.value ? this.NEIN : this.JA, this.NEIN);
        this.euresButtons.updateSelectedButton(this.NEIN, this.NEIN);
        this.applyBsp84();
    }
}
