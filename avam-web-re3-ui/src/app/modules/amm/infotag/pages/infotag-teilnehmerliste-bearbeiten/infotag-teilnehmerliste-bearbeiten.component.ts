import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { BuchungStatusEnum } from '@app/modules/amm/infotag/enums/buchung-status.enum';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { HttpResponseHelper } from '@app/shared/helpers/http-response.helper';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { AmmTeilnehmerBuchungSessionViewDTO } from '@app/shared/models/dtos-generated/ammTeilnehmerBuchungSessionViewDTO';
import { BaseResponseWrapperSessionDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperSessionDTOWarningMessages';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { SessionDTO } from '@app/shared/models/dtos-generated/sessionDTO';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { BaseResponseWrapperListAmmTeilnehmerBuchungSessionViewDTOWarningMessages } from '@dtos/baseResponseWrapperListAmmTeilnehmerBuchungSessionViewDTOWarningMessages';
import { TranslateService } from '@ngx-translate/core';
import { Permissions } from '@shared/enums/permissions.enum';
import * as moment from 'moment';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { forkJoin, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AmmInfotagRestService } from '../../services/amm-infotag-rest.service';

@Component({
    selector: 'avam-infotag-teilnehmerliste-bearbeiten',
    templateUrl: './infotag-teilnehmerliste-bearbeiten.component.html',
    styleUrls: ['./infotag-teilnehmerliste-bearbeiten.component.scss']
})
export class InfotagTeilnehmerlisteBearbeitenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;
    dataSource: AmmTeilnehmerBuchungSessionViewDTO[];
    channel = 'infotag-teilnehmerliste-bearbeiten';
    permissions: typeof Permissions = Permissions;
    dfeId: number;
    teilnehmerlisteForm: FormGroup;
    headerCheckboxSubscription: Subscription;
    rowCheckboxSubscription: Subscription;
    isDfVonInFuture = false;
    disableButton: boolean;
    annulliertId: number;
    statusOptions = [];
    teilnehmerList: AmmTeilnehmerBuchungSessionViewDTO[];
    unternehmen: UnternehmenDTO;
    massnahmeId: number;
    infotagDto: SessionDTO;

    constructor(
        private infotagRest: AmmInfotagRestService,
        private spinnerService: SpinnerService,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private stesDataService: StesDataRestService,
        private toolboxService: ToolboxService,
        private infopanelService: AmmInfopanelService,
        private translate: TranslateService,
        private dbTranslateService: DbTranslateService,
        private translateService: TranslateService
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.getRouteData();
        this.getData();
        this.createForm();
        this.configureToolbox();
        this.headerCheckboxSubscription = this.subscribeToCheckboxChanges();
        this.rowCheckboxSubscription = this.subscribeToRowCheckboxChanges();
        this.subscribeToLangChange();
        this.subscribeToToolbox();
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EXCEL, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.getToolboxConfigData(), true);
    }

    getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: null,
            vorlagenKategorien: null,
            entityIDsMapping: { DFE_ID: this.dfeId }
        };
    }

    subscribeToToolbox() {
        this.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.EXCEL) {
                    this.onExcelExport();
                }
            });
    }

    onExcelExport() {
        this.spinnerService.activate(this.channel);
        this.infotagRest.getTeilnehmerExport(this.dfeId).subscribe(
            (res: HttpResponse<any>) => {
                HttpResponseHelper.openBlob(res);
                this.spinnerService.deactivate(this.channel);
            },
            () => {
                this.spinnerService.deactivate(this.channel);
            }
        );
    }

    setupInfobar(dto: SessionDTO) {
        this.infopanelService.dispatchInformation({
            title: 'amm.infotag.subnavmenuitem.infotag',
            secondTitle: dto ? this.dbTranslateService.translateWithOrder(dto, 'titel') : undefined,
            subtitle: 'amm.infotag.subnavmenuitem.teilnehmerliste',
            hideInfobar: false,
            tableCount: undefined
        });
        this.unternehmen = dto.durchfuehrungsortObject ? dto.durchfuehrungsortObject.unternehmenObject : null;
        this.infopanelService.sendTemplateToInfobar(this.panelTemplate);
    }

    subscribeToLangChange() {
        this.translate.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.setupInfobar(this.infotagDto);
        });
    }

    createForm() {
        this.teilnehmerlisteForm = this.formBuilder.group({
            rowCheckboxes: this.formBuilder.array([]),
            headerCheckbox: false
        });
    }

    subscribeToCheckboxChanges(): Subscription {
        return this.teilnehmerlisteForm.controls.headerCheckbox.valueChanges.subscribe(headerCheckboxValue => {
            for (let i = 0; i < this.getRowCheckboxes().length; i++) {
                this.getRowCheckboxes()
                    .at(i)
                    .patchValue(headerCheckboxValue);
            }
        });
    }

    subscribeToRowCheckboxChanges(): Subscription {
        return this.teilnehmerlisteForm.controls.rowCheckboxes.valueChanges.subscribe(arr => {
            this.disableButton = arr.every(v => v === false);
        });
    }

    getRouteData() {
        this.route.parent.queryParams.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.dfeId = params['dfeId'];
        });
    }

    getData() {
        this.spinnerService.activate(this.channel);
        forkJoin<BaseResponseWrapperSessionDTOWarningMessages, BaseResponseWrapperListAmmTeilnehmerBuchungSessionViewDTOWarningMessages, CodeDTO[], CodeDTO[]>([
            this.infotagRest.getInfotag(this.dfeId),
            this.infotagRest.getTeilnehmerliste(this.dfeId),
            this.stesDataService.getCode(DomainEnum.AMMINFOTAGBUCHUNGSTATUS),
            this.stesDataService.getCode(DomainEnum.TLN_PRAESENZ_STATUS)
        ]).subscribe(
            ([infotag, teilnehmer, buchungStatus, praesentzStatus]) => {
                this.teilnehmerList = teilnehmer.data;
                this.statusOptions = praesentzStatus.map(option => this.dropdownButtonPropertyMapper(option));
                this.annulliertId = buchungStatus.find(v => v.code === BuchungStatusEnum.ANNULLIERT).codeId;
                this.massnahmeId = infotag.data.massnahmeObject.massnahmeId;
                this.infotagDto = infotag.data;
                this.isDfVonInFuture = this.getIsDfVonInFuture(infotag.data.gueltigVon);
                this.dataSource = teilnehmer.data.map(this.createTableRow);
                this.spinnerService.deactivate(this.channel);
                this.disableButton = true;
                this.setupInfobar(infotag.data);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.spinnerService.deactivate(this.channel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    dropdownButtonPropertyMapper(element: CodeDTO) {
        return {
            value: element.codeId,
            textDe: element.textDe,
            textFr: element.textFr,
            textIt: element.textIt
        };
    }

    onDropdownOptionClick(option: any) {
        const statusId = !!option ? option.value : option;

        const dtoArr = this.getRowCheckboxes()
            .controls.reduce((arr, cb, i) => (cb.value && arr.push(i), arr), [])
            .map(i => this.teilnehmerList.find(tn => +tn.buchungPlatz === i + 1));

        this.spinnerService.activate(this.channel);
        this.infotagRest.updateTeilnehmerListStatus(this.dfeId, statusId, dtoArr).subscribe(
            res => {
                if (res.data) {
                    this.createForm();
                    this.headerCheckboxSubscription.unsubscribe();
                    this.rowCheckboxSubscription.unsubscribe();
                    this.headerCheckboxSubscription = this.subscribeToCheckboxChanges();
                    this.rowCheckboxSubscription = this.subscribeToRowCheckboxChanges();
                    this.teilnehmerList = res.data;
                    this.dataSource = res.data.map(this.createTableRow);
                }
                this.spinnerService.deactivate(this.channel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.spinnerService.deactivate(this.channel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    getIsDfVonInFuture(date: Date): boolean {
        const today = moment();
        const durchfuehrungVon = moment(date);
        return durchfuehrungVon.isAfter(today, 'days');
    }

    createTableRow = (data: AmmTeilnehmerBuchungSessionViewDTO) => {
        const formArray = this.getRowCheckboxes();
        const shouldHideCheckbox = data.buchungStatusId !== this.annulliertId;
        if (shouldHideCheckbox) {
            formArray.push(this.formBuilder.control(false));
        }

        return {
            kanton: data.kanton,
            platz: shouldHideCheckbox ? data.buchungPlatz : '',
            teilnehmer: this.getTeilnehmerName(data),
            personenNr: data.stesPersonenNr,
            bearbeitung: this.getBearbeitung(data),
            buchungsdatum: data.erstellDatum,
            personalberater: this.getPersonalberater(data),
            statusCode: data.tlnPraesenz && shouldHideCheckbox ? data.tlnPraesenz.statusObject : '',
            hideCheckbox: shouldHideCheckbox
        };
    };

    getRowCheckboxes(): FormArray {
        return this.teilnehmerlisteForm.get('rowCheckboxes') as FormArray;
    }

    getTeilnehmerName(data: AmmTeilnehmerBuchungSessionViewDTO) {
        const name = data.stesName ? `${data.stesName}, ` : '';
        const vorname = data.stesVorname || '';
        return `${name} ${vorname}`;
    }

    getBearbeitung(data: AmmTeilnehmerBuchungSessionViewDTO) {
        const nachname = data.benutzerNachname ? `${data.benutzerNachname}, ` : '';
        const vorname = data.benutzerVorname || '';
        const username = data.benutzerLogin ? `${data.benutzerLogin}, ` : '';
        return `${username}${nachname}${vorname}`;
    }

    getPersonalberater(data: AmmTeilnehmerBuchungSessionViewDTO) {
        const nachname = data.stesPbNachname ? `${data.stesPbNachname}, ` : '';
        const vorname = data.stesPbVorname || '';
        const username = data.stesPbLogin ? `${data.stesPbLogin}, ` : '';
        return `${username}${nachname}${vorname}`;
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.headerCheckboxSubscription.unsubscribe();
        this.rowCheckboxSubscription.unsubscribe();
    }
}
