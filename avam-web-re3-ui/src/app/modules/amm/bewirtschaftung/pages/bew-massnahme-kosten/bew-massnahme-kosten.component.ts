import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, OnDestroy } from '@angular/core';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { ActivatedRoute } from '@angular/router';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import { Subscription, forkJoin } from 'rxjs';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { SessionKostenDTO } from '@app/shared/models/dtos-generated/sessionKostenDTO';
import { Permissions } from '@app/shared/enums/permissions.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { BewMassnahmeKostenFormComponent } from '../../components';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { FacadeService } from '@app/shared/services/facade.service';
import { ElementPrefixEnum } from '@app/shared/enums/domain-code/element-prefix.enum';

@Component({
    selector: 'avam-bew-massnahme-kosten',
    templateUrl: './bew-massnahme-kosten.component.html'
})
export class BewMassnahmeKostenComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('kostenFormComponent') kostenFormComponent: BewMassnahmeKostenFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    kostenData: any;
    channel = 'massnahme-kosten';
    massnahme: MassnahmeDTO;
    massnahmeId: number;
    zulassungstyp: string;
    toolboxSubscription: Subscription;
    organisationInfoBar: string;
    unternehmensname: string;
    kostenDto: SessionKostenDTO;
    permissions: typeof Permissions = Permissions;
    provBurNr: number;
    burNrToDisplay: number;
    unternehmenStatus: string;

    constructor(
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private route: ActivatedRoute,
        private infopanelService: AmmInfopanelService,
        private modalService: NgbModal,
        private dataService: StesDataRestService,
        private ammHelper: AmmHelper,
        private facade: FacadeService
    ) {}

    ngOnInit() {
        this.route.parent.queryParams.subscribe(params => {
            this.massnahmeId = +params['massnahmeId'];
        });

        this.facade.translateService.onLangChange.subscribe(() => {
            if (this.massnahme) {
                this.initInfopanel(this.massnahme);
            }
        });
    }

    ngAfterViewInit() {
        this.getData();
        this.infopanelService.appendToInforbar(this.infobarTemplate);
        this.configureToolbox();
        this.toolboxSubscription = this.subscribeToToolbox();
    }

    ngOnDestroy() {
        if (this.toolboxSubscription) {
            this.toolboxSubscription.unsubscribe();
        }

        this.infopanelService.removeFromInfobar(this.infobarTemplate);
        this.infopanelService.sendLastUpdate({}, true);
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin([
            this.bewirtschaftungRestService.getMassnahmeKosten(this.massnahmeId),
            this.bewirtschaftungRestService.getMassnahme(this.massnahmeId),
            this.dataService.getCode(DomainEnum.KURSKOSTEN_ZAHLUNG)
        ]).subscribe(
            ([kosten, massnahme, kurskostenZahlung]) => {
                if (kosten) {
                    this.kostenDto = kosten.data;
                }

                if (massnahme) {
                    this.massnahme = massnahme.data;
                    this.initInfopanel(this.massnahme);
                }

                this.kostenData = {
                    kurskostenZahlung,
                    kostenDto: this.kostenDto,
                    massnahmeDto: this.massnahme
                };

                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    save() {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.kostenFormComponent.isFormInvalid()) {
            this.kostenFormComponent.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.facade.spinnerService.activate(this.channel);

        this.bewirtschaftungRestService.saveMassnahmeKosten(this.massnahmeId, this.kostenFormComponent.mapToDto(this.kostenDto)).subscribe(
            kostenResponse => {
                if (kostenResponse.data) {
                    this.kostenData.kostenDto = kostenResponse.data;
                    this.kostenDto = kostenResponse.data;

                    this.infopanelService.sendLastUpdate(this.kostenDto);

                    this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                }

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    reset() {
        if (this.kostenFormComponent.formGroup.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.kostenFormComponent.resetFormWithLastUpdate();
            });
        }
    }

    zurMassnahmeplanung() {
        this.ammHelper.navigateToPlanungAnzeigen(this.massnahmeId, ElementPrefixEnum.MASSNAHME_PREFIX);
    }

    private initInfopanel(massnahme: MassnahmeDTO) {
        if (this.massnahme) {
            this.organisationInfoBar = this.ammHelper.getMassnahmenOrganisationTypKuerzel(
                this.massnahme.produktObject.elementkategorieAmtObject,
                this.massnahme.produktObject.strukturelementGesetzObject
            );
            this.unternehmensname = this.ammHelper.concatenateUnternehmensnamen(
                this.massnahme.ammAnbieterObject.unternehmen.name1,
                this.massnahme.ammAnbieterObject.unternehmen.name2,
                this.massnahme.ammAnbieterObject.unternehmen.name3
            );
            const massnahmeLabel = this.facade.translateService.instant('amm.massnahmen.subnavmenuitem.massnahme');
            const titelLabel = this.facade.dbTranslateService.translateWithOrder(this.massnahme, 'titel');
            this.zulassungstyp = this.facade.dbTranslateService.translateWithOrder(this.massnahme.zulassungstypObject, 'text');

            this.provBurNr = massnahme.ammAnbieterObject.unternehmen.provBurNr;
            this.burNrToDisplay = this.provBurNr ? this.provBurNr : massnahme.ammAnbieterObject.unternehmen.burNummer;
            this.unternehmenStatus = this.facade.dbTranslateService.translate(massnahme.ammAnbieterObject.unternehmen.statusObject, 'text');

            this.infopanelService.dispatchInformation({
                title: `${massnahmeLabel} ${titelLabel}`,
                subtitle: this.facade.translateService.instant('amm.nutzung.subnavmenuitem.kosten')
            });
            this.infopanelService.sendLastUpdate(this.kostenDto);
        }
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, ToolboxDataHelper.createForAmmMassnahme(this.massnahmeId));
    }

    private subscribeToToolbox(): Subscription {
        return this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            const sessionKostenId = this.kostenDto ? this.kostenDto.sessionKostenId : null;

            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(sessionKostenId, AvamCommonValueObjectsEnum.T_SESSION_KOSTEN);
            }
        });
    }

    private openHistoryModal(objId: number, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId.toString();
        comp.type = objType;
    }
}
