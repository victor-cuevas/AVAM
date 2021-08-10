import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { DomainEnum } from 'src/app/shared/enums/domain.enum';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { FormUtilsService } from 'src/app/shared';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from 'src/app/shared/services/toolbox.service';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';
import { ZasAbgleichRequest } from '@app/shared/models/dtos/stes-zas-abgleich-request';
import { StesZasAbgleichService } from '@app/modules/stes/services/stes-zas-abgleich.service';
import { WizardService } from '@app/shared/components/new/avam-wizard/wizard.service';
import { ZasAbgleichResponse } from '@app/shared/models/dtos/stes-zas-abgleich-response';
import { SvNummerValidator } from '@app/shared/validators/sv-nummer-validator';
import { DateValidator } from '@app/shared/validators/date-validator';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { TranslateService } from '@ngx-translate/core';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { PersonVersichertenNrDTO } from '@dtos/personVersichertenNrDTO';
import * as moment from 'moment';
import PrintHelper from '@shared/helpers/print.helper';
import { GeburtsdatumValidator } from '@shared/validators/geburtsdatum-validator';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { StesStoreService } from '@stes/stes-store.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'app-stes-details-personenstammdaten',
    templateUrl: './stes-details-personenstammdaten.component.html',
    styleUrls: ['./stes-details-personenstammdaten.component.scss']
})
export class StesDetailsPersonenstammdatenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    personenstammdatenForm: FormGroup;
    isAnmeldung: boolean;
    geschlechtDropdownData: any[] = [];
    zivilstandDropdownData: any[] = [];
    state: any;
    toolboxConfig: ToolboxConfiguration[] = [];
    personenstammdatenChannel = 'personenstammdaten';
    versichertenNrList = '';
    aktuelleVersichertenNrList = '';
    versichertenNrListArray: [];
    letzterZASAbgleich: string;
    zasDataSubscription: Subscription;
    headerVorname: string;
    headerName: string;
    private state$: Observable<object>;
    private svNrOriginal;
    private versichertenNrListOriginal;
    private letzterZASAbgleichOriginal;
    private ahvAkOriginal;

    constructor(
        private fb: FormBuilder,
        private dataService: StesDataRestService,
        private facade: FacadeService,
        private router: Router,
        private spinnerService: SpinnerService,
        private stesZasAbgleichService: StesZasAbgleichService,
        private wizardService: WizardService,
        private toolboxService: ToolboxService,
        private fehlermeldungenService: FehlermeldungenService,
        private notificationService: NotificationService,
        private translateService: TranslateService,
        private resetDialogService: ResetDialogService,
        private stesStoreService: StesStoreService
    ) {
        super();
        SpinnerService.CHANNEL = this.personenstammdatenChannel;
        ToolboxService.CHANNEL = this.personenstammdatenChannel;
    }

    ngOnInit() {
        this.spinnerService.activate(this.personenstammdatenChannel);
        this.state = window.history.state;
        this.svNrOriginal = this.state ? this.state.svNrFromZas : null;
        this.versichertenNrListOriginal = this.state ? this.state.versichertenNrList : null;
        this.letzterZASAbgleichOriginal = this.state ? this.state.letzterZASAbgleich : null;
        this.ahvAkOriginal = this.state ? this.state.ahvAk : null;
        this.createForm();
        this.configureToolbox();
        this.getData();

        this.zasDataSubscription = this.stesZasAbgleichService.getTakeOverZasEventEmitter().subscribe((response: ZasAbgleichResponse) => {
            this.updatePersonenstammdatenForm(response);
        });

        this.toolboxService
            .observeClickAction(this.personenstammdatenChannel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(action => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                }
            });

        this.subscribeToWizard();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.fehlermeldungenService.closeMessage();
    }

    mapToForm(dto) {
        this.setVersichertenNrList(dto.versichertenNrList);
        this.letzterZASAbgleich = dto.letzterZASAbgleich ? this.facade.formUtilsService.formatDateNgx(dto.letzterZASAbgleich, 'DD.MM.YYYY') : null;

        return {
            svNr: dto.svNrFromZas ? dto.svNrFromZas : null,
            versichertenNrList: this.versichertenNrList,
            zasName: dto.namePersReg ? dto.namePersReg : null,
            zasVorname: dto.vornamePersReg ? dto.vornamePersReg : null,
            geburtsdatum: dto.geburtsDatum ? dto.geburtsDatum : null,
            geschlecht: dto.geschlechtObject ? dto.geschlechtObject.codeId : null,
            zivilstand: dto.zivilstandObject ? dto.zivilstandObject.codeId : null,
            nationalitaet: dto.nationalitaetObject ? dto.nationalitaetObject : null
        };
    }

    formatWithDots() {
        this.facade.formUtilsService.formatDateWithDots(this.personenstammdatenForm.controls.geburtsdatum);
    }

    setVersichertenNrList(versichertenNrList: any) {
        this.versichertenNrList = '';
        this.versichertenNrListArray = null;
        if (versichertenNrList) {
            this.versichertenNrListArray = versichertenNrList.splice();
            versichertenNrList.forEach(element => {
                if (element.istAktuelleVersichertenNr) {
                    this.aktuelleVersichertenNrList = element.versichertenNr;
                } else {
                    this.versichertenNrList += element.versichertenNr + '\n';
                }
            });
            this.versichertenNrList = this.versichertenNrList.trim();
        }
    }

    openZasAbgleichen() {
        this.fehlermeldungenService.closeMessage();
        const personenstammdaten = this.personenstammdatenForm;

        if (!personenstammdaten.controls.svNr.value || !personenstammdaten.controls.svNr.valid) {
            this.fehlermeldungenService.showMessage('stes.error.anmeldung.keinesvnr', 'danger');
            return;
        }
        personenstammdaten.controls.svNr.setValue(personenstammdaten.value.svNr.trim());

        if (personenstammdaten.value.nationalitaet && !personenstammdaten.value.nationalitaet.staatId) {
            this.dataService.getStaaten(this.translateService.currentLang, personenstammdaten.value.nationalitaet).subscribe(staat => {
                personenstammdaten.value.nationalitaet = staat.shift();
                personenstammdaten.value.nationalitaet.id = personenstammdaten.value.nationalitaet.staatId;
                this.prepareZasAbgleich(personenstammdaten);
            });
        } else {
            if (personenstammdaten.value.nationalitaet) {
                personenstammdaten.value.nationalitaet.id = personenstammdaten.value.nationalitaet.staatId;
            }
            this.prepareZasAbgleich(personenstammdaten);
        }
    }

    prepareZasAbgleich(personenstammdaten) {
        const zasAbgleichRequest: ZasAbgleichRequest = {
            stesId: this.state.personStesId ? this.state.personStesId : null,
            personenNr: this.state.personenNr ? this.state.personenNr : null,
            nationalitaetId: personenstammdaten.value.nationalitaet ? personenstammdaten.value.nationalitaet.id : null,
            nationalitaet: personenstammdaten.value.nationalitaet ? personenstammdaten.value.nationalitaet : null,
            geschlechtDropdownLables: this.geschlechtDropdownData,
            personenstammdaten,
            letzterZASAbgleich: this.letzterZASAbgleich ? this.letzterZASAbgleich : null,
            bisherigeVersichertenNr: this.versichertenNrListArray
        } as ZasAbgleichRequest;

        this.stesZasAbgleichService.createZasAbgleich(zasAbgleichRequest);
    }

    subscribeToWizard() {
        this.wizardService.setFormIsDirty(this.personenstammdatenForm.dirty);
        this.personenstammdatenForm.valueChanges.subscribe(() => {
            this.wizardService.setFormIsDirty(this.personenstammdatenForm.dirty);
        });
    }

    reset() {
        if (this.personenstammdatenForm.dirty) {
            this.resetDialogService.reset(() => {
                this.state.svNrFromZas = this.svNrOriginal;
                this.state.versichertenNrList = this.versichertenNrListOriginal;
                this.state.letzterZASAbgleich = this.letzterZASAbgleichOriginal;
                this.state.ahvAk = this.ahvAkOriginal;
                this.personenstammdatenForm.reset(this.mapToForm(this.state));
            });
        }
    }

    cancel() {
        this.fehlermeldungenService.closeMessage();
        this.router.navigate(['/home/start-page']);
    }

    getData() {
        forkJoin(this.dataService.getCode(DomainEnum.GESCHLECHT), this.dataService.getCode(DomainEnum.ZIVILSTAND))
            .pipe(
                map(([geschlechtDropdown, zivilstandDropdown]) => {
                    this.geschlechtDropdownData = this.facade.formUtilsService.mapDropdownKurztext(geschlechtDropdown);
                    this.zivilstandDropdownData = this.facade.formUtilsService.mapDropdownKurztext(zivilstandDropdown);
                })
            )
            .subscribe(() => {
                if (this.state) {
                    this.personenstammdatenForm.setValue(this.mapToForm(this.state));

                    this.headerName = this.state.namePersReg ? this.state.namePersReg : null;
                    this.headerVorname = this.state.vornamePersReg ? this.state.vornamePersReg : null;
                }
                this.spinnerService.deactivate(this.personenstammdatenChannel);
            });
    }

    createForm() {
        this.personenstammdatenForm = this.fb.group({
            svNr: ['', SvNummerValidator.svNummberValid],
            versichertenNrList: '',
            zasName: ['', Validators.required],
            zasVorname: ['', Validators.required],
            geburtsdatum: [
                '',
                [DateValidator.dateFormatNgx, DateValidator.isDateInFutureNgx, DateValidator.dateRangeBiggerCenturyNgx, Validators.required, GeburtsdatumValidator.dateValidator]
            ],
            geschlecht: ['', Validators.required],
            zivilstand: ['', Validators.required],
            nationalitaet: ['', Validators.required]
        });
    }

    configureToolbox() {
        this.toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        this.toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
    }

    updatePersonenstammdatenForm(zasAbgleichResponse: ZasAbgleichResponse) {
        this.letzterZASAbgleich = this.facade.formUtilsService.formatDateNgx(new Date(), 'DD.MM.YYYY').valueOf();

        const personenstammdatenFormUpdated = {
            svNr: this.getAktiveVersichertenNr(zasAbgleichResponse.versichertenNrList),
            nationalitaet: zasAbgleichResponse.nationalitaet ? zasAbgleichResponse.nationalitaet : null,
            versichertenNrList: zasAbgleichResponse.versichertenNrList ? this.previousSvNrs(zasAbgleichResponse.versichertenNrList) : null,
            zasVorname: zasAbgleichResponse.personenstammdaten.value.zasVorname,
            zasName: zasAbgleichResponse.personenstammdaten.value.zasName,
            geburtsdatum: zasAbgleichResponse.personenstammdaten.value.geburtsdatum,
            geschlecht: zasAbgleichResponse.personenstammdaten.value.geschlecht,
            zivilstand: zasAbgleichResponse.personenstammdaten.value.zivilstand
        };

        this.personenstammdatenForm.setValue(personenstammdatenFormUpdated);
        this.personenstammdatenForm.markAsDirty();
        this.state.istZASAbgleichErforderlich = false;
        this.state.svNrFromZas = personenstammdatenFormUpdated.svNr;
        this.state.versichertenNrList = zasAbgleichResponse.versichertenNrList;
        this.state.letzterZASAbgleich = new Date();
        this.state.ahvAk = zasAbgleichResponse.ahvAk;
    }

    getAktiveVersichertenNr(versichertenNrList: PersonVersichertenNrDTO[]): string {
        const aktiveVersicherterNrs: string[] = versichertenNrList
            ? versichertenNrList.filter((n: PersonVersichertenNrDTO) => n.istAktuelleVersichertenNr).map((n: PersonVersichertenNrDTO) => n.versichertenNr)
            : null;
        return aktiveVersicherterNrs ? aktiveVersicherterNrs[0] : null;
    }

    save(onSuccess?, onFailure?) {
        this.fehlermeldungenService.closeMessage();
        if (this.personenstammdatenForm.valid) {
            this.spinnerService.activate(this.personenstammdatenChannel);
            this.dataService
                .createPersonenstammdaten(this.mapToDTO())
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(
                    response => {
                        if (response.data) {
                            this.wizardService.stesId = response.data.stesID;
                            this.personenstammdatenForm.setValue(this.mapToForm(response.data));
                            this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                            if (onSuccess) {
                                onSuccess();
                            }
                        } else if (response.warning) {
                            if (onFailure) {
                                onFailure();
                            }
                        }
                        OrColumnLayoutUtils.scrollTop();
                        this.spinnerService.deactivate(this.personenstammdatenChannel);
                    },
                    () => {
                        this.spinnerService.deactivate(this.personenstammdatenChannel);
                        OrColumnLayoutUtils.scrollTop();
                        if (onFailure) {
                            onFailure();
                        }
                    }
                );
        } else {
            this.ngForm.onSubmit(undefined);
            if (onFailure) {
                onFailure();
            }
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    mapToDTO() {
        const personenstammdatenDTO = {
            personStesId: this.state.personStesId,
            personenNr: this.state.personenNr,
            nationalitaetObject: this.personenstammdatenForm.controls.nationalitaet['landAutosuggestObject'],
            letzterZASAbgleich: this.facade.formUtilsService.transformDateToTimestamps(this.letzterZASAbgleich),
            versichertenNrList: this.state.svNrFromZas ? this.state.versichertenNrList : null,
            vornamePersReg: this.personenstammdatenForm.value.zasVorname,
            namePersReg: this.personenstammdatenForm.value.zasName,
            geburtsDatum: this.personenstammdatenForm.value.geburtsdatum,
            zivilstandId: this.personenstammdatenForm.value.zivilstand,
            geschlechtId: this.personenstammdatenForm.value.geschlecht,
            ojbVersion: this.state.ojbVersion,
            istZASAbgleichErforderlich: this.state.istZASAbgleichErforderlich,
            ahvAk: this.state.ahvAk
        };
        this.storeStesGeschlecht(personenstammdatenDTO.geschlechtId);
        return personenstammdatenDTO;
    }

    next() {
        if (this.validatePersonenstammdaten()) {
            this.wizardService.deactiveWizard();
            this.save(
                onSuccess => {
                    this.wizardService.activeWizard();
                    this.wizardService.moveNext();
                },
                onFailure => {
                    this.wizardService.activeWizard();
                }
            );
        }
    }

    prev() {
        this.wizardService.movePrevStammD();
    }

    validatePersonenstammdaten() {
        if (this.personenstammdatenForm.controls.svNr.value && !this.letzterZASAbgleich) {
            this.fehlermeldungenService.closeMessage();
            this.fehlermeldungenService.showMessage('stes.error.anmeldung.svnrohnezasabgleich', 'danger');

            return false;
        }
        if (
            this.state.istZASAbgleichErforderlich != null &&
            !this.state.istZASAbgleichErforderlich &&
            this.state.letzterZASAbgleich &&
            moment(this.state.letzterZASAbgleich).isBefore(moment(), 'date') &&
            !this.state.ahvAk
        ) {
            this.fehlermeldungenService.closeMessage();
            this.fehlermeldungenService.showMessage('stes.error.anmeldung.ahvnrzasabgleich', 'danger');

            return false;
        }

        return true;
    }

    isReadOnly(): boolean {
        if (this.state && this.state.svNrFromZas) {
            return true;
        }
        return false;
    }

    private previousSvNrs(list: PersonVersichertenNrDTO[]): string {
        return list
            .filter((n: PersonVersichertenNrDTO) => !n.istAktuelleVersichertenNr)
            .map((n: PersonVersichertenNrDTO) => n.versichertenNr)
            .join('\n');
    }

    private storeStesGeschlecht(geschlechtId: string) {
        const geschlectCode = this.facade.formUtilsService.getCodeByCodeId(this.geschlechtDropdownData, geschlechtId);
        this.stesStoreService.stesAnmeldungGeschlecht = geschlectCode;
    }
}
