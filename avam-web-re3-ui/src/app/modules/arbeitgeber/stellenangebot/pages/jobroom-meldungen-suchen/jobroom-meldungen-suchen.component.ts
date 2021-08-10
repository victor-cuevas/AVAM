import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Permissions } from '@shared/enums/permissions.enum';
import { JobroomMeldungenSearchFormComponent } from '@modules/arbeitgeber/stellenangebot/components/jobroom-meldungen-search-form/jobroom-meldungen-search-form.component';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { FacadeService } from '@shared/services/facade.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxService } from '@app/shared';
import { filter, finalize, takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { Unsubscribable } from 'oblique-reactive';
import { DomainEnum } from '@shared/enums/domain.enum';
import { CodeDTO } from '@dtos/codeDTO';
import { JobroomSuchenParamDTO } from '@dtos/jobroomSuchenParamDTO';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { IOsteEgovDTO } from '@dtos/iOsteEgovDTO';
import { ActivatedRoute, Router } from '@angular/router';
import { JobroomMeldungenSearchTableComponent } from '@modules/arbeitgeber/stellenangebot/components/jobroom-meldungen-search-table/jobroom-meldungen-search-table.component';
import { HttpResponse } from '@angular/common/http';
import { HttpResponseHelper } from '@shared/helpers/http-response.helper';
import { ReloadHelper } from '@shared/helpers/reload.helper';

@Component({
    selector: 'avam-jobroom-meldungen-suchen',
    templateUrl: './jobroom-meldungen-suchen.component.html'
})
export class JobroomMeldungenSuchenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('jobroomMeldungenSearchComponent') jobroomMeldungenSearchComponent: JobroomMeldungenSearchFormComponent;
    @ViewChild('tableResult') tableResult: JobroomMeldungenSearchTableComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    permissions: typeof Permissions = Permissions;
    toolBoxId = 'jobroomMeldungenSuchen';
    channel = 'jobroom-meldungen-suchen';
    searchResult: IOsteEgovDTO[] = [];
    meldeartOptions;
    JOBROOM_ANMELDUNG_TEXT = '0';
    JOBROOM_ABMELDUNG_TEXT = '1';

    constructor(
        private infopanelService: AmmInfopanelService,
        private dataService: StesDataRestService,
        private unternehmenDataService: UnternehmenRestService,
        private facadeService: FacadeService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        super();
    }

    ngOnInit(): void {
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.onReset());
        this.infopanelService.updateInformation({
            title: '',
            subtitle: 'arbeitgeber.oste.subnavmenuitem.jobroom',
            tableCount: undefined,
            hideInfobar: true
        });
        this.initToolbox();
    }

    ngAfterViewInit(): void {
        this.getData();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.facadeService.fehlermeldungenService.closeMessage();
        this.infopanelService.updateInformation({
            title: '',
            subtitle: '',
            tableCount: undefined,
            hideInfobar: false
        });
        this.facadeService.toolboxService.sendConfiguration([]);
    }

    search(dto: JobroomSuchenParamDTO) {
        this.facadeService.spinnerService.activate(this.channel);
        this.unternehmenDataService
            .searchJobroomMeldungen(dto)
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.facadeService.spinnerService.deactivate(this.channel))
            )
            .subscribe(response => {
                this.searchResult = response.data;
                this.infopanelService.updateInformation({ tableCount: response.data.length });
            });
    }

    rowSelected(selectedRow) {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.facadeService.spinnerService.activate(this.channel);
        this.unternehmenDataService
            .getOsteByEgovId(selectedRow.additionalData.osteEgovId)
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.facadeService.spinnerService.deactivate(this.channel))
            )
            .subscribe(oste => {
                if (oste.warning && oste.warning.length) {
                    this.jobroomMeldungenSearchComponent.search(true, false);
                } else {
                    if (selectedRow.additionalData.detailangabenCode === this.JOBROOM_ANMELDUNG_TEXT) {
                        this.router.navigate(['./jobroom-meldungen/verifizieren'], {
                            queryParams: { osteEgovId: selectedRow.additionalData.osteEgovId },
                            relativeTo: this.route.parent
                        });
                    } else if (selectedRow.additionalData.detailangabenCode === this.JOBROOM_ABMELDUNG_TEXT) {
                        const queryParams = { osteId: oste.data.osteId };
                        if (selectedRow.additionalData.abmeldeDatum) {
                            queryParams['abmeldeDatum'] = selectedRow.additionalData.abmeldeDatum;
                        }
                        if (selectedRow.additionalData.abmeldeGrundCode) {
                            queryParams['abmeldeGrundCode'] = selectedRow.additionalData.abmeldeGrundCode;
                        }
                        this.router.navigate([`arbeitgeber/details/${oste.data.unternehmenId}/stellenangebote/stellenangebot/bewirtschaftung`], {
                            queryParams
                        });
                    }
                }
            });
    }

    onReset() {
        this.jobroomMeldungenSearchComponent.reset();
        this.searchResult = [];
        this.infopanelService.updateInformation({ tableCount: undefined });
    }

    private initToolbox() {
        ToolboxService.CHANNEL = this.channel;
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getJobroomMeldungenSuchenConfig(), this.toolBoxId);
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.facadeService.openModalFensterService.openPrintModal(this.modalPrint, this.searchResult));
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.EXCEL && this.tableResult.tableConfig.data.length))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.facadeService.spinnerService.activate(this.channel);
                this.unternehmenDataService
                    .getExcelReport(this.jobroomMeldungenSearchComponent.mapToDto())
                    .pipe(finalize(() => this.facadeService.spinnerService.deactivate(this.channel)))
                    .subscribe((res: HttpResponse<Blob>) => {
                        HttpResponseHelper.openBlob(res);
                    });
            });
    }

    private getData() {
        this.facadeService.spinnerService.activate(this.channel);
        this.dataService
            .getCode(DomainEnum.JOBROOM)
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.facadeService.spinnerService.deactivate(this.channel))
            )
            .subscribe((meldeartDomain: CodeDTO[]) => {
                const meldeartMappedDomain = meldeartDomain
                    .filter(item => item.code === this.JOBROOM_ABMELDUNG_TEXT || item.code === this.JOBROOM_ANMELDUNG_TEXT)
                    .map(this.customPropertyMapper);
                this.jobroomMeldungenSearchComponent.meldeartOptions = meldeartMappedDomain;
                this.meldeartOptions = meldeartMappedDomain;
            });
    }

    private customPropertyMapper(element: CodeDTO) {
        return {
            code: element.code,
            codeId: element.codeId,
            value: element.code,
            labelFr: element.kurzTextFr,
            labelIt: element.kurzTextIt,
            labelDe: element.kurzTextDe
        };
    }
}
