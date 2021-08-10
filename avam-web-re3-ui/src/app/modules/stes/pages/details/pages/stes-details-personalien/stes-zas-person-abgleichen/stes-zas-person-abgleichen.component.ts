import {
    AfterViewChecked,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormUtilsService } from '@app/shared';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { PersonVersichertenNrDTO } from '@dtos/personVersichertenNrDTO';
import { ZasAbgleichRequest } from '@shared/models/dtos/stes-zas-abgleich-request';
import { ZasAbgleichResponse } from '@shared/models/dtos/stes-zas-abgleich-response';
import { StesZasAbgleichService } from '@app/modules/stes/services/stes-zas-abgleich.service';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { StringHelper } from '@shared/helpers/string.helper';
import { ActivatedRoute, Router } from '@angular/router';
import PrintHelper from '@shared/helpers/print.helper';
import { StesZasDTO } from '@shared/models/dtos-generated/stesZasDTO';
import { BaseResponseWrapperListStesZasDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperListStesZasDTOWarningMessages';
import { resizeTextArea } from '@shared/helpers/autosize.helper';

@Component({
    selector: 'app-stes-zas-person-abgleichen',
    templateUrl: './stes-zas-person-abgleichen.component.html',
    styleUrls: ['./stes-zas-person-abgleichen.component.scss']
})
export class StesZasPersonAbgleichenComponent extends Unsubscribable implements OnInit, AfterViewChecked, OnDestroy {
    static readonly CHANNEL: string = 'zasMoadalSpinner-modal';
    static readonly MIN_DATE: string = '01.01.1900';
    static readonly TOOLBOX_ID: string = 'zasAbgleichenModal';
    @Input() zasAbgleichRequest: ZasAbgleichRequest;
    @Input() zasResponse: BaseResponseWrapperListStesZasDTOWarningMessages;
    @Output() emitTakeOver: EventEmitter<ZasAbgleichResponse>;
    @ViewChild('zasPreviousSvNrs') zasPreviousSvNrs: ElementRef;
    @ViewChild('stesPreviousSvNrs') stesPreviousSvNrs: ElementRef;
    modalToolboxConfiguration: ToolboxConfiguration[];
    personalienForm: FormGroup;
    zasPersonalienForm: FormGroup;
    stesZasDTO: StesZasDTO;
    isTakeOverButtonDisabled: boolean;
    warnings: string[] = [];
    normalHeight = false;
    private readonly originalChannel: string;
    private observeExit: Subscription;
    private minDate: Date;
    private formNumber: string = null;
    private visibleMaxRows = 5;

    constructor(
        private readonly modalService: NgbModal,
        private toolboxService: ToolboxService,
        private formBuilder: FormBuilder,
        private formUtils: FormUtilsService,
        private spinnerService: SpinnerService,
        private readonly notificationService: NotificationService,
        private translateService: TranslateService,
        private dbTranslateService: DbTranslateService,
        private abgleichService: StesZasAbgleichService,
        private router: Router,
        private route: ActivatedRoute,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        super();
        this.isTakeOverButtonDisabled = true;
        this.originalChannel = ToolboxService.CHANNEL;
        ToolboxService.CHANNEL = 'zasMoadalSpinner';
    }

    ngOnInit(): void {
        this.spinnerService.activate(this.getChannel());
        this.minDate = this.formUtils.parseDate(this.formUtils.transformDateToTimestamps(StesZasPersonAbgleichenComponent.MIN_DATE));
        this.initToolboxConfiguration();
        this.initPersonenstammdaten();
        this.initZasstammdaten();
        this.getRouteFormNumber();
    }

    ngAfterViewChecked(): void {
        let textarea: HTMLTextAreaElement = this.stesPreviousSvNrs.nativeElement;
        let baseScrollHeight: string = getComputedStyle(textarea).lineHeight;
        resizeTextArea(textarea, baseScrollHeight, this.visibleMaxRows);
        this.normalHeight = textarea.offsetHeight !== 120;
        textarea = this.zasPreviousSvNrs.nativeElement;
        baseScrollHeight = getComputedStyle(textarea).lineHeight;
        resizeTextArea(textarea, baseScrollHeight, this.visibleMaxRows);
        this.changeDetectorRef.detectChanges();
    }

    ngOnDestroy(): void {
        if (this.observeExit) {
            this.observeExit.unsubscribe();
        }
        ToolboxService.CHANNEL = this.originalChannel;
        super.ngOnDestroy();
    }

    close(): void {
        this.modalService.dismissAll();
    }

    getRouteFormNumber(): void {
        let tmpRoute = this.route;
        while (tmpRoute.children && !this.formNumber) {
            if (tmpRoute.children.length > 0) {
                tmpRoute.children.shift().data.subscribe(data => {
                    this.formNumber = data.formNumber ? data.formNumber : null;
                    if (!this.formNumber) {
                        tmpRoute = tmpRoute.children.shift();
                    }
                });
            }
        }
    }

    takeOver(): void {
        this.zasAbgleichRequest.personenstammdaten.setValue({
            svNr: this.zasPersonalienForm.controls.zasSvNr.value,
            zasName: this.stesZasDTO.namePersReg,
            zasVorname: this.stesZasDTO.vornamePersReg,
            zivilstand: this.zasAbgleichRequest.personenstammdaten.controls.zivilstand.value,
            geschlecht: this.stesZasDTO.geschlechtId,
            nationalitaet: this.stesZasDTO.nationalitaetObject ? this.stesZasDTO.nationalitaetObject : null,
            geburtsdatum: this.formUtils.formatDateNgx(this.stesZasDTO.geburtsDatum, FormUtilsService.GUI_DATE_FORMAT),
            versichertenNrList: this.stesZasDTO.versichertenNrList
        });
        this.abgleichService.takeOverZas({
            personenNr: this.stesZasDTO.personenNr,
            personenstammdaten: this.zasAbgleichRequest.personenstammdaten,
            stesId: this.zasAbgleichRequest.stesId,
            nationalitaetId: this.zasAbgleichRequest.nationalitaetId,
            nationalitaet: this.stesZasDTO.nationalitaetObject,
            letzterZASAbgleich: this.formUtils.transformDateToTimestamps(this.stesZasDTO.letzterZASAbgleich),
            versichertenNrList: this.stesZasDTO.versichertenNrList,
            ahvAk: this.stesZasDTO.ahvAk
        } as ZasAbgleichResponse);
        this.close();
    }

    getFormNr(): string {
        return StesFormNumberEnum.ZAS_ABGLEICH;
    }

    getChannel(): string {
        return StesZasPersonAbgleichenComponent.CHANNEL;
    }

    getToolboxId(): string {
        return StesZasPersonAbgleichenComponent.TOOLBOX_ID;
    }

    getNationalitaet(nationalitaet: any): string {
        return nationalitaet ? (nationalitaet.nameDe ? this.dbTranslateService.translate(nationalitaet, 'name') : nationalitaet.value) : null;
    }

    formatDate(date: Date | number): string {
        return this.formUtils.formatDateNgx(date, FormUtilsService.GUI_DATE_FORMAT);
    }

    private static getAktiveVersichertenNr(stesZasDTO: StesZasDTO): string {
        const aktiveVersicherterNrs: string[] = stesZasDTO.versichertenNrList
            ? stesZasDTO.versichertenNrList.filter((n: PersonVersichertenNrDTO) => n.istAktuelleVersichertenNr).map((n: PersonVersichertenNrDTO) => n.versichertenNr)
            : null;
        return aktiveVersicherterNrs ? aktiveVersicherterNrs[0] : null;
    }

    /**
     * collect all nicht-aktuelle versicherten nr and join them with line breaks
     */
    private static previousSvNrs(list: any): string {
        if (list instanceof Array) {
            return list
                .filter((n: PersonVersichertenNrDTO) => !n.istAktuelleVersichertenNr)
                .map((n: PersonVersichertenNrDTO) => n.versichertenNr)
                .join('\n');
        } else {
            return list;
        }
    }

    private initToolboxConfiguration(): void {
        this.modalToolboxConfiguration = [
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)
        ];

        this.observeExit = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((event: any) => {
            if (event.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            } else if (event.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
        });
    }

    private initPersonenstammdaten(): void {
        this.personalienForm = this.formBuilder.group({
            stesSvNr: null,
            stesName: null,
            stesVorname: null,
            stesGeschlecht: null,
            stesNationalitaet: null,
            stesGeburtsdatum: null,
            stesPreviousSvNrs: null
        } as PersonstammdatenForm);
        this.personalienForm.setValue(this.initPersonenstammdatenValues());
    }

    private initPersonenstammdatenValues(): PersonstammdatenForm {
        const controls: any = this.zasAbgleichRequest.personenstammdaten.controls;
        return {
            stesSvNr: controls.svNr.value,
            stesName: controls.zasName.value,
            stesVorname: controls.zasVorname.value,
            stesGeschlecht: Number(controls.geschlecht.value),
            stesNationalitaet: controls.nationalitaet.value,
            stesGeburtsdatum: controls.geburtsdatum.value,
            stesPreviousSvNrs: controls.versichertenNrList.value ? StesZasPersonAbgleichenComponent.previousSvNrs(controls.versichertenNrList.value) : ''
        } as PersonstammdatenForm;
    }

    private initZasstammdaten(): void {
        this.zasPersonalienForm = this.formBuilder.group({
            zasSvNr: null,
            zasName: null,
            zasVorname: null,
            zasGeschlecht: null,
            zasNationalitaet: null,
            zasGeburtsdatum: null,
            zasPreviousSvNrs: null
        } as ZasstammdatenForm);
        this.initZasstammdatenValues(this.zasResponse);
    }

    private initZasstammdatenValues(response: BaseResponseWrapperListStesZasDTOWarningMessages): void {
        if (response.data.length === 1) {
            this.stesZasDTO = response.data[0];
            this.zasPersonalienForm.setValue(this.initZasFormValues(this.stesZasDTO));
            this.isTakeOverButtonDisabled = this.hasNoZasData() || this.isZasDataGeburtsDatumBeforeMinDate();
        }
        if (response.warning) {
            this.isTakeOverButtonDisabled = true;
            response.warning.forEach(warning => {
                if (warning.values.key) {
                    let warningMessage = this.translateService.instant(warning.values.key);
                    if (warning.values.values) {
                        warningMessage = StringHelper.stringFormatter(
                            warningMessage,
                            [...warning.values.values].map((v: string) => {
                                try {
                                    return this.translateService.instant(v);
                                } catch (error) {
                                    return v;
                                }
                            })
                        );
                    }
                    this.warnings.push(warningMessage);
                }
            });
        }
        this.spinnerService.deactivate(this.getChannel());
    }

    private initZasFormValues(stesZasDTO: StesZasDTO): ZasstammdatenForm {
        return {
            zasSvNr: StesZasPersonAbgleichenComponent.getAktiveVersichertenNr(stesZasDTO),
            zasName: stesZasDTO.namePersReg,
            zasVorname: stesZasDTO.vornamePersReg,
            zasGeschlecht: stesZasDTO.geschlechtId,
            zasNationalitaet: {
                id: stesZasDTO.nationalitaetObject.staatId,
                iso2Code: stesZasDTO.nationalitaetObject.iso2Code,
                value: this.getNationalitaet(stesZasDTO.nationalitaetObject)
            } as Nationalitaet,
            zasGeburtsdatum: this.formUtils.formatDateNgx(stesZasDTO.geburtsDatum, FormUtilsService.GUI_DATE_FORMAT),
            zasPreviousSvNrs: StesZasPersonAbgleichenComponent.previousSvNrs(stesZasDTO.versichertenNrList)
        } as ZasstammdatenForm;
    }

    private hasNoZasData(): boolean {
        return !this.stesZasDTO;
    }

    private isZasDataGeburtsDatumBeforeMinDate(): boolean {
        const geburtsDatum: Date = this.formUtils.parseDate(this.stesZasDTO.geburtsDatum);
        return !geburtsDatum || geburtsDatum < this.minDate;
    }
}

interface Nationalitaet {
    id: number;
    iso2Code: string;
    value: string;
}

interface PersonstammdatenForm {
    stesSvNr: string;
    stesName: string;
    stesVorname: string;
    stesGeschlecht: number;
    stesNationalitaet: Nationalitaet;
    stesGeburtsdatum: string;
    stesPreviousSvNrs: string;
}

interface ZasstammdatenForm {
    zasSvNr: string;
    zasName: string;
    zasVorname: string;
    zasGeschlecht: number;
    zasNationalitaet: Nationalitaet;
    zasGeburtsdatum: string;
    zasPreviousSvNrs: string;
}
