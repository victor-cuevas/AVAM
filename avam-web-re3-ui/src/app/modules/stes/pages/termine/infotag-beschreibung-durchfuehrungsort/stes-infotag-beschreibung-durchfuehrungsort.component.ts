import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToolboxService } from '@app/shared';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { StesTerminePaths } from '@shared/enums/stes-navigation-paths.enum';
import { AbstractBaseForm } from '@shared/classes/abstract-base-form';
import { SpinnerService } from 'oblique-reactive';
import { FormBuilder, FormGroupDirective } from '@angular/forms';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { filter, takeUntil } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InfotagBeschreibungDurchfuehrungsortDTO } from '@shared/models/dtos-generated/infotagBeschreibungDurchfuehrungsortDTO';
import { InfotagService } from '@shared/services/infotag.service';
// prettier-ignore
import {BaseResponseWrapperInfotagBeschreibungDurchfuehrungsortDTOWarningMessages} from
    '@shared/models/dtos-generated/baseResponseWrapperInfotagBeschreibungDurchfuehrungsortDTOWarningMessages';
import { StesInfotagDurchfuehrungsortDTO } from '@shared/models/dtos-generated/stesInfotagDurchfuehrungsortDTO';
import { AmmKontaktpersonDTO } from '@shared/models/dtos-generated/ammKontaktpersonDTO';
import { StringHelper } from '@shared/helpers/string.helper';
import PrintHelper from '@shared/helpers/print.helper';
import { StesTermineLabels } from '@shared/enums/stes-routing-labels.enum';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'app-stes-infotag-beschreibung-durchfuehrungsort',
    templateUrl: './stes-infotag-beschreibung-durchfuehrungsort.component.html',
    styleUrls: ['./stes-infotag-beschreibung-durchfuehrungsort.component.scss']
})
export class StesInfotagBeschreibungDurchfuehrungsortComponent extends AbstractBaseForm implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @Input() stesId: string;
    @Input() dfeId: string;
    @Input() geschaeftsfallID: number;
    @Input() isBuchung = true;
    @Input() updateInfobar = true;

    private channel = 'infotagBeschreibungDurchfuehrungsort';
    private letzteAktualisierung: InfotagBeschreibungDurchfuehrungsortDTO = {};
    private navigationPaths: string[] = [
        StesTerminePaths.INFOTAG,
        StesTerminePaths.INFOTAGGRUNDDATENBUCHUNG,
        StesTerminePaths.INFOTAGBESCHREIBUNGDURCHFUEHRUNGSORT,
        StesTerminePaths.INFOTAGTEILNEHMERLISTE
    ];

    constructor(
        modalService: NgbModal,
        private route: ActivatedRoute,
        private facade: FacadeService,
        private formBuilder: FormBuilder,
        private infotagService: InfotagService,
        private router: Router,
        private stesInfobarService: AvamStesInfoBarService
    ) {
        super('infotagBeschreibungDurchfuehrungsort', modalService, facade.spinnerService, facade.messageBus, facade.toolboxService, facade.fehlermeldungenService);
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    getChannel(): string {
        return this.channel;
    }

    ngOnInit(): void {
        this.setSubscriptions();
        if (this.route.parent) {
            this.configureToolbox(this.channel, ToolboxConfig.getStesInfotagBeschreibungDurchfuehrungsortConfig());
            this.showNavigationTreeRoute();
        }
        this.initForm();
        this.facade.messageBus
            .getData()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(message => {
                if (message.type === 'close-nav-item' && message.data) {
                    this.closeComponent(message);
                }
            });
    }

    closeComponent(message) {
        if (
            message.data.label === this.facade.dbTranslateService.instant(StesTermineLabels.INFOTAG) ||
            message.data.label === this.facade.dbTranslateService.instant(StesTermineLabels.INFOTAGGRUNDDATENBUCHUNG) ||
            message.data.label === this.facade.dbTranslateService.instant(StesTermineLabels.INFOTAGBESCHREIBUNGDURCHFUEHRUNGSORT) ||
            message.data.label === this.facade.dbTranslateService.instant(StesTermineLabels.INFOTAGTEILNEHMERLISTE)
        ) {
            this.cancel();
            this.facade.navigationService.hideNavigationTreeRoute(StesTerminePaths.INFOTAG);
        }
    }

    cancel() {
        if (this.router.url.includes(StesTerminePaths.INFOTAG)) {
            this.navigateToTermine();
        }
    }

    ngAfterViewInit(): void {
        this.getData();
    }

    defineToolboxActions(): void {
        this.facade.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter((action: any) => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => PrintHelper.print());
    }

    getData(): void {
        this.infotagService.getOrtUndBeschreibung(this.isBuchung, this.stesId, this.isBuchung ? this.geschaeftsfallID : Number(this.dfeId));
    }

    updateForm(data: InfotagBeschreibungDurchfuehrungsortDTO): void {
        this.ngForm.resetForm();
        this.letzteAktualisierung = data;
        this.mainForm.reset(this.mapToForm(data));
        this.getUeberschrift(data);
    }

    ngOnDestroy(): void {
        if (this.updateInfobar) {
            this.stesInfobarService.sendLastUpdate({}, true);
        }
        if (this.route.parent) {
            this.facade.toolboxService.resetConfiguration();
        }
        this.facade.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    createFooterActionMapper(): void {}

    defineFormGroups(): void {}

    reset(): void {}

    save(shouldFinish?: boolean): void {}

    getKontaktPersonNameVorname(): string {
        if (!this.letzteAktualisierung || this.letzteAktualisierung.ammKontaktpersonDTO === undefined) {
            return '';
        }
        return this.getFormattedName(
            StringHelper.isNotEmpty(this.letzteAktualisierung.ammKontaktpersonDTO.name),
            StringHelper.isNotEmpty(this.letzteAktualisierung.ammKontaktpersonDTO.vorname)
        );
    }

    private navigateToTermine(): void {
        this.router.navigate([`stes/details/${this.stesId}/termine`]);
    }

    private getFormattedName(nameExists: boolean, vornameExists: boolean) {
        if (nameExists && vornameExists) {
            return `${this.letzteAktualisierung.ammKontaktpersonDTO.name}, ${this.letzteAktualisierung.ammKontaktpersonDTO.vorname}`;
        } else if (nameExists && !vornameExists) {
            return this.letzteAktualisierung.ammKontaktpersonDTO.name;
        } else if (!nameExists && vornameExists) {
            return this.letzteAktualisierung.ammKontaktpersonDTO.vorname;
        }
        return '';
    }

    private getUeberschrift(data: InfotagBeschreibungDurchfuehrungsortDTO) {
        if (this.updateInfobar) {
            const screenTitle = this.facade.dbTranslateService.instant('stes.subnavmenuitem.stesTermine.beschreibungdurchfuehrungsort');
            const infoTag = this.facade.dbTranslateService.instant('amm.infotag.subnavmenuitem.infotag');
            const title = this.facade.dbTranslateService.translateWithOrder(data, 'titel');
            this.stesInfobarService.sendDataToInfobar({ title: `${infoTag} ${title} - ${screenTitle}` });
        }
    }

    private initForm(): void {
        this.mainForm = this.formBuilder.group({
            inhalt: null,
            methodik: null,
            massnahmenziel: null,
            durchfuehrungsortName: null,
            durchfuehrungsortStrasseNr: null,
            durchfuehrungsortRaum: null,
            durchfuehrungsortPlzOrt: null,
            durchfuehrungsortLand: null,
            kontaktPersonId: null,
            kontaktPersonName: null,
            kontaktPersonVorname: null,
            kontaktPersonTelefon: null,
            kontaktPersonMobile: null,
            kontaktPersonFax: null,
            kontaktPersonEmail: null
        });
    }

    private showNavigationTreeRoute(): void {
        const queryParams: any = { dfeId: this.dfeId, gfId: this.geschaeftsfallID };
        this.navigationPaths.forEach(path => {
            this.facade.navigationService.showNavigationTreeRoute(path, queryParams);
        });
    }

    private setSubscriptions(): void {
        this.facade.dbTranslateService
            .getEventEmitter()
            .asObservable()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.updateForm(this.letzteAktualisierung));
        if (this.route.parent) {
            this.route.parent.data.subscribe(() => {
                this.route.parent.params.subscribe(params => {
                    this.stesId = params['stesId'];
                });
                this.route.queryParamMap.subscribe(params => {
                    this.dfeId = params.get('dfeId');
                });
                this.route.queryParamMap.subscribe(params => {
                    this.geschaeftsfallID = Number(params.get('gfId'));
                });
            });
        }
        this.infotagService.ortUndBeschreibungSubject
            .asObservable()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperInfotagBeschreibungDurchfuehrungsortDTOWarningMessages) => this.updateForm(response.data),
                () => this.facade.spinnerService.deactivate()
            );
    }

    private mapToForm(dto: InfotagBeschreibungDurchfuehrungsortDTO): any {
        const form: any = {};
        this.addBeschreibung(dto, form);
        this.addDurchfuehrungsort(dto.durchfuehrungsortDTO, form);
        this.addKontakt(dto.ammKontaktpersonDTO, form);
        return form;
    }

    private addBeschreibung(dto: InfotagBeschreibungDurchfuehrungsortDTO, form: any): void {
        form.inhalt = this.facade.dbTranslateService.translateWithOrder(dto, 'inhalt');
        form.methodik = this.facade.dbTranslateService.translateWithOrder(dto, 'methodik');
        form.massnahmenziel = this.facade.dbTranslateService.translateWithOrder(dto, 'massnahmenZiel');
    }

    private addDurchfuehrungsort(ort: StesInfotagDurchfuehrungsortDTO, form: any): void {
        if (ort) {
            form.durchfuehrungsortName = ort.name;
            form.durchfuehrungsortStrasseNr = ort.addresse;
            form.durchfuehrungsortRaum = ort.raum;
            if (ort.plz) {
                form.durchfuehrungsortPlzOrt = `${ort.plz.postleitzahl} ${this.facade.dbTranslateService.translate(ort.plz, 'ort')}`;
            }
            form.durchfuehrungsortLand = ort.staat;
        }
    }

    private addKontakt(person: AmmKontaktpersonDTO, form: any): void {
        if (person) {
            form.kontaktPersonId = person.id;
            form.kontaktPersonName = person.name;
            form.kontaktPersonVorname = person.vorname;
            form.kontaktPersonTelefon = person.telefon;
            form.kontaktPersonMobile = person.mobile;
            form.kontaktPersonFax = person.fax;
            form.kontaktPersonEmail = person.email;
        }
    }
}
