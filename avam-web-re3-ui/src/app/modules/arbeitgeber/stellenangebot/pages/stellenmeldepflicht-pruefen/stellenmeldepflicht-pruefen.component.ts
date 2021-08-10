import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Unsubscribable } from 'oblique-reactive';
import { FacadeService } from '@shared/services/facade.service';
import { filter, finalize, takeUntil } from 'rxjs/operators';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { ToolboxService } from '@app/shared';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { MeldepflichtDTO } from '@dtos/meldepflichtDTO';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { KantonEnum } from '@shared/enums/kanton.enum';

@Component({
    selector: 'avam-stellenmeldepflicht-pruefen',
    templateUrl: './stellenmeldepflicht-pruefen.component.html',
    styleUrls: ['./stellenmeldepflicht-pruefen.component.scss']
})
export class StellenmeldepflichtPruefenComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    channel = 'meldepflicht-pruefen-channel';
    searchForm: FormGroup;
    pruefenForm: FormGroup;
    MEIListe: string;
    isKantonVisible = false;
    private msgInfo: string;

    constructor(private fb: FormBuilder, private facadeService: FacadeService, private stesDataRestService: StesDataRestService) {
        super();
    }

    ngOnInit() {
        this.generateForm();
        this.initToolBox();
    }

    ngAfterViewInit(): void {
        this.getDatum();
        this.subscribeToLangChange();
    }

    ngOnDestroy() {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.facadeService.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    reset() {
        this.searchForm.reset();
    }

    search() {
        this.facadeService.spinnerService.activate(this.channel);
        this.facadeService.fehlermeldungenService.closeMessage();
        this.facadeService.fehlermeldungenService.showMessage(this.msgInfo, 'info');
        this.stesDataRestService
            .searchMeldepflichtListeByBeruf(this.searchForm.controls.beruftaetigkeit['berufAutosuggestObject'])
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => {
                    this.facadeService.spinnerService.deactivate(this.channel);
                    OrColumnLayoutUtils.scrollTop();
                })
            )
            .subscribe(response => {
                if (response.data) {
                    this.mapToForm(response.data);
                } else {
                    this.pruefenForm.reset();
                    this.isKantonVisible = false;
                }
            });
    }

    isDisabled() {
        return this.searchForm.invalid;
    }

    private subscribeToLangChange(): void {
        this.facadeService.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.facadeService.fehlermeldungenService.closeMessage();
            const msg = this.facadeService.translateService.instant('arbeitgeber.oste.label.grundlageMeldepflicht', { '0': this.MEIListe });
            this.facadeService.fehlermeldungenService.showMessage(msg, 'info');
            const berufAutosuggestObject = this.searchForm.controls.beruftaetigkeit['berufAutosuggestObject'];
            if (+berufAutosuggestObject.berufId === -1) {
                this.searchForm.reset();
                this.pruefenForm.reset();
            } else {
                this.search();
            }
        });
    }

    private generateForm() {
        this.searchForm = this.fb.group({
            beruftaetigkeit: [null, Validators.required]
        });
        this.pruefenForm = this.fb.group({
            beruftaetigkeit: null,
            stellenmeldungen: null,
            kantone: null
        });
    }

    private getDatum() {
        this.facadeService.spinnerService.activate(this.channel);
        this.stesDataRestService
            .getMEIListeDatum()
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => {
                    this.facadeService.spinnerService.deactivate(this.channel);
                    OrColumnLayoutUtils.scrollTop();
                })
            )
            .subscribe(response => {
                if (response.data) {
                    this.MEIListe = response.data;
                    this.msgInfo = this.facadeService.translateService.instant('arbeitgeber.oste.label.grundlageMeldepflicht', { '0': this.MEIListe });
                    this.facadeService.fehlermeldungenService.showMessage(this.msgInfo, 'info');
                }
            });
    }

    private mapToForm(data: any) {
        if (data.length === 0) {
            this.bsp1();
        } else {
            const berufe: MeldepflichtDTO = data[0];
            this.pruefenForm.controls.beruftaetigkeit.setValue(berufe.bezeichnung);
            if (berufe.kantone.length === 1) {
                this.bsp2AndBsp3(berufe);
            } else {
                this.pruefenForm.controls.stellenmeldungen.setValue(this.facadeService.translateService.instant('arbeitgeber.oste.label.meldepflichtKantonal'));
                this.pruefenForm.controls.kantone.setValue(berufe.kantone.reduce((e1, e2) => `${e1}, ${e2}`));
                this.isKantonVisible = true;
            }
        }
    }

    private bsp2AndBsp3(berufe: MeldepflichtDTO) {
        const kanton = berufe.kantone[0];
        if (kanton === KantonEnum.SCHWEIZ) {
            this.pruefenForm.controls.stellenmeldungen.setValue(this.facadeService.translateService.instant('arbeitgeber.oste.label.meldepflichtganzeschweiz'));
            this.isKantonVisible = false;
        } else {
            this.pruefenForm.controls.stellenmeldungen.setValue(this.facadeService.translateService.instant('arbeitgeber.oste.label.meldepflichtKantonal'));
            this.pruefenForm.controls.kantone.setValue(berufe.kantone.reduce((e1, e2) => `${e1}, ${e2}`));
            this.isKantonVisible = true;
        }
    }

    private bsp1() {
        if (typeof this.searchForm.controls.beruftaetigkeit.value === 'object') {
            const berufBezeichnung = this.facadeService.dbTranslateService.translate(this.searchForm.controls.beruftaetigkeit.value, 'bezeichnungMa');
            this.pruefenForm.controls.beruftaetigkeit.setValue(berufBezeichnung);
        } else {
            this.pruefenForm.controls.beruftaetigkeit.setValue(this.searchForm.controls.beruftaetigkeit.value);
        }
        this.pruefenForm.controls.stellenmeldungen.setValue(this.facadeService.translateService.instant('arbeitgeber.oste.label.nichtmeldepflichtig'));
        this.isKantonVisible = false;
    }

    private initToolBox() {
        ToolboxService.CHANNEL = this.channel;
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getStellenmeldepflichtBerufPruefenConfig(), this.channel, null);

        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => PrintHelper.print());
    }
}
