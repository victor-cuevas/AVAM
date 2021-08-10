import { HttpResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import { BaseResponseWrapperListTeilnehmerDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListTeilnehmerDTOWarningMessages';
import { TeilnehmerDTO } from '@app/shared/models/dtos-generated/teilnehmerDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { RoboHelpService } from '@app/shared/services/robo-help.service';
import { DokumentVorlagenRestService } from '@core/http/dokument-vorlagen-rest.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DmsTemplatesConstants } from '@shared/components/dms-templates/dms-templates.constants';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { HttpResponseHelper } from '@shared/helpers/http-response.helper';
import { DokumentVorlageToolboxData } from '@shared/models/dokument-vorlage-toolbox-data.model';
import { BaseResponseWrapperStringWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperStringWarningMessages';
import { DokumentVorlageActionDTO } from '@shared/models/dtos-generated/dokumentVorlageActionDTO';
import { DokumentVorlagenDTO } from '@shared/models/dtos-generated/dokumentVorlagenDTO';
import { WarningMessages } from '@shared/models/dtos-generated/warningMessages';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import { NotificationConfig, SpinnerService, Unsubscribable } from 'oblique-reactive';
import { forkJoin, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DmsTypeConstants, Node, NodeData } from './dms-temp-kurs-lam.model';
import * as uuidv4 from 'uuid/v4';
import { TreeNodeInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-node.interface';
import { TreeOptionInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-option.interface';

@Component({
    selector: 'app-dms-templates',
    templateUrl: './dms-templates.component.html',
    styleUrls: ['./dms-templates.component.scss']
})
export class DmsTemplatesComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('actionColumnTemplate') actionColumnTemplate: TemplateRef<any>;
    vorlagen: DokumentVorlagenDTO[] = [];
    warnings: string[] = [];
    dokumentManagerForm: FormGroup;
    modalToolboxConfiguration: ToolboxConfiguration[] = ToolboxConfig.getDmsTemplatesConfig();
    dropDownOptions: { id: number; key: string }[] = DmsTemplatesConstants.LANG_OPTIONS;
    defaultSearchOption = this.dropDownOptions[0].id;
    tableData: DokumentVorlageRow[] = [];
    treeTableData: TreeNodeInterface[] = [];
    treeOptions: TreeOptionInterface;
    buchungTNList: TeilnehmerDTO[];
    tnListLen: number;
    toolboxChannel = 'dms-templates-toolbox';
    toolboxSubscription: Subscription;
    toolboxData: DokumentVorlageToolboxData;
    isDokGenerated = false;

    private readonly originalChannel: string;

    constructor(
        private formBuilder: FormBuilder,
        private activeModal: NgbActiveModal,
        private dokumentVorlagenRestService: DokumentVorlagenRestService,
        private roboHelpService: RoboHelpService,
        private facade: FacadeService,
        private ammBewRest: BewirtschaftungRestService
    ) {
        super();
        this.originalChannel = ToolboxService.CHANNEL;
        ToolboxService.CHANNEL = this.toolboxChannel;
        SpinnerService.CHANNEL = DmsTemplatesConstants.CHANNEL;
    }

    ngOnInit(): void {
        this.toolboxSubscription = this.subscribeToToolbox();
        this.initSelectedLanguage();
        if (this.toolboxData.kursLamErstelltEntscheide) {
            this.setTreeOptions();
            this.getDataForKursLam();
        } else {
            this.getData();
        }
    }

    ngOnDestroy() {
        ToolboxService.CHANNEL = this.originalChannel;
        this.toolboxSubscription.unsubscribe();
        super.ngOnDestroy();
    }

    getChannel(): string {
        return DmsTemplatesConstants.CHANNEL;
    }

    getFormNr(): string {
        return this.toolboxData.kursLamErstelltEntscheide ? StesFormNumberEnum.DMS_DISPLAY_DOC_TEMPLATES_KURS_LAM : StesFormNumberEnum.DMS_DISPLAY_DOC_TEMPLATES;
    }

    close(): void {
        this.activeModal.close(this.isDokGenerated);
    }

    changeLanguage(): void {
        let lang: string;
        switch (Number(this.dokumentManagerForm.controls.selectedLanguage.value).valueOf()) {
            case DmsTemplatesConstants.OPTION_DE:
                lang = DmsTemplatesConstants.DE;
                break;
            case DmsTemplatesConstants.OPTION_FR:
                lang = DmsTemplatesConstants.FR;
                break;
            case DmsTemplatesConstants.OPTION_IT:
                lang = DmsTemplatesConstants.IT;
                break;
            default:
                lang = null;
                break;
        }
        if (this.toolboxData.kursLamErstelltEntscheide) {
            this.treeTableData = this.buildKursLamTree(lang);
        } else {
            this.loadTableData(lang);
        }
    }

    setData(data: Array<DokumentVorlagenDTO>, toolboxData: DokumentVorlageToolboxData): void {
        if (data) {
            this.vorlagen = data;
        }
        if (toolboxData) {
            this.toolboxData = toolboxData;
        }
    }

    setWarnings(warnings: Array<WarningMessages>): void {
        if (warnings) {
            this.clearMessages();
            this.warnings = warnings.map((w: WarningMessages) => w.values.key);
        }
    }

    openDocument(item): void {
        const actionDTO = this.prepareAction(item);
        this.clearMessages();
        this.dokumentVorlagenRestService
            .openDocument(actionDTO)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (res: HttpResponse<Blob>) => {
                    this.isDokGenerated = true;
                    HttpResponseHelper.openBlob(res);
                    this.facade.spinnerService.deactivate(DmsTemplatesConstants.CHANNEL);
                },
                error => this.show(error)
            );
    }

    saveDocument(item): void {
        if (item.children && item.children.length > 0) {
            return;
        }

        const actionDTO = this.prepareAction(item);
        this.clearMessages();
        this.dokumentVorlagenRestService
            .saveDocument(actionDTO)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (res: BaseResponseWrapperStringWarningMessages) => {
                    this.isDokGenerated = true;
                    this.setWarnings(res.warning);
                    if (!res.warning) {
                        HttpResponseHelper.openUrl(res.data);
                    }
                    this.facade.spinnerService.deactivate(DmsTemplatesConstants.CHANNEL);
                },
                error => this.show(error)
            );
    }

    getDataForKursLam() {
        this.facade.spinnerService.activate(DmsTemplatesConstants.CHANNEL);
        const dfeId = this.toolboxData.entityIDsMapping.DFE_ID;

        forkJoin<BaseResponseWrapperListTeilnehmerDTOWarningMessages, BaseResponseWrapperListTeilnehmerDTOWarningMessages>(
            this.ammBewRest.getKursTeilnehmerlisteForDM(dfeId),
            this.ammBewRest.getKursWartelisteForDM(dfeId)
        ).subscribe(
            ([tnListeRes, wListeRes]) => {
                this.buchungTNList = [].concat(tnListeRes.data, wListeRes.data).filter(Boolean);
                this.tnListLen = tnListeRes.data.length;
                this.treeTableData = this.buildKursLamTree(this.facade.dbTranslateService.getCurrentLang());

                this.facade.spinnerService.deactivate(DmsTemplatesConstants.CHANNEL);
            },
            error => this.show(error)
        );
    }

    buildKursLamTree(lang: string): Node<NodeData>[] {
        const rows = [];

        this.vorlagen
            .filter(vorlage => (lang ? vorlage.language === lang : true))
            .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
            .forEach(vorlage => {
                if (vorlage.kategorie === VorlagenKategorie.ENTSCHEID_KURS) {
                    const dmsType = vorlage.dmsTypeCode;
                    if (
                        this.buchungTNList.length > 0 &&
                        (dmsType === DmsTypeConstants.DT_ENTSCHEID || dmsType === DmsTypeConstants.DT_KORRESPONDENZ || dmsType === DmsTypeConstants.DT_BESCHEINIGUNG)
                    ) {
                        rows.push(this.createTreeNode(vorlage, this.buchungTNList));
                    }
                } else {
                    rows.push(this.createTreeNode(vorlage));
                }
            });

        return rows;
    }

    createTreeNode(vorlage: DokumentVorlagenDTO, teilnehmer?: TeilnehmerDTO[]): Node<NodeData> {
        if (teilnehmer) {
            const node = new Node<NodeData>(uuidv4(), new NodeData(vorlage, this.facade));
            teilnehmer.forEach((tn, index) =>
                index < this.tnListLen
                    ? node.addChild(new Node(uuidv4(), new NodeData(vorlage, this.facade, tn)))
                    : node.addChild(new Node(uuidv4(), new NodeData(vorlage, this.facade, tn, true)))
            );
            return node;
        }
        return new Node(uuidv4(), new NodeData(vorlage, this.facade));
    }

    setTreeOptions() {
        this.treeOptions = {
            columnOrder: ['name', 'type', 'buchungPlatz', 'stesFullName', 'entscheidStatusKurzText', 'entscheidArtKurzText'],
            columnTitle: [
                'office.label.vorlagen',
                'dokmanager.label.dokumententyp',
                'amm.massnahmen.label.platz',
                'amm.massnahmen.label.teilnehmer',
                'amm.massnahmen.label.status',
                'amm.nutzung.label.entscheid'
            ],
            actions: {
                template: this.actionColumnTemplate,
                columnWidth: 110
            },
            firstColumnCustomWidth: 470,
            initialExpansionLevel: 1
        };
    }

    private initSelectedLanguage(): void {
        let num: number;
        switch (this.facade.dbTranslateService.getCurrentLang()) {
            case DmsTemplatesConstants.DE:
                num = DmsTemplatesConstants.OPTION_DE;
                break;
            case DmsTemplatesConstants.FR:
                num = DmsTemplatesConstants.OPTION_FR;
                break;
            case DmsTemplatesConstants.IT:
                num = DmsTemplatesConstants.OPTION_IT;
                break;
            default:
                num = DmsTemplatesConstants.OPTION_ALLE;
                break;
        }
        this.defaultSearchOption = this.dropDownOptions[num].id;
        this.dokumentManagerForm = this.formBuilder.group({ selectedLanguage: null });
        this.dokumentManagerForm.controls.selectedLanguage.setValue(num);
    }

    private subscribeToToolbox(): Subscription {
        return this.facade.toolboxService.observeClickAction(this.toolboxChannel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.tableData);
            }
            if (action.message.action === ToolboxActionEnum.HELP) {
                this.roboHelpService.help(StesFormNumberEnum.DMS_DISPLAY_DOC_TEMPLATES);
            }
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            }
        });
    }

    private getData(): void {
        this.loadTableData(this.facade.dbTranslateService.getCurrentLang());
    }

    private loadTableData(lang: string): void {
        this.tableData = this.filter(lang).map((dto: DokumentVorlagenDTO) => {
            return {
                id: dto.id,
                name: dto.name,
                type: this.facade.dbTranslateService.translate(dto, 'type'),
                lang: dto.language
            } as DokumentVorlageRow;
        });
    }

    private filter(lang: string): DokumentVorlagenDTO[] {
        return lang ? this.vorlagen.filter((dto: DokumentVorlagenDTO) => dto.language === lang) : this.vorlagen;
    }

    private prepareAction(item): DokumentVorlageActionDTO {
        this.facade.spinnerService.activate(DmsTemplatesConstants.CHANNEL);
        this.facade.notificationService.info('office.notification.text.dokument', 'i18n.notification.type.info', { channel: DmsTemplatesConstants.CHANNEL } as NotificationConfig);

        const result = {
            targetEntity: this.toolboxData.targetEntity,
            entityIDsMapping: this.toolboxData.entityIDsMapping,
            userLanguage: this.facade.dbTranslateService.getCurrentLang(),
            vorlageId: this.toolboxData.kursLamErstelltEntscheide ? item.model.data.vorlageId : item.id,
            language: this.toolboxData.kursLamErstelltEntscheide ? item.model.data.language : item.lang
        } as DokumentVorlageActionDTO;

        if (this.toolboxData.kursLamErstelltEntscheide) {
            result.entityIDsMapping['GF_ID'] = item.model.data.gfId;
        }

        return result;
    }

    private clearMessages(): void {
        this.warnings = [];
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.notificationService.clear(DmsTemplatesConstants.CHANNEL);
    }

    private show(error: any): void {
        this.facade.fehlermeldungenService.showMessage(error, 'danger');
        this.facade.spinnerService.deactivate(DmsTemplatesConstants.CHANNEL);
    }
}

interface DokumentVorlageRow {
    id: number;
    name: string;
    type: string;
    lang: string;
}
