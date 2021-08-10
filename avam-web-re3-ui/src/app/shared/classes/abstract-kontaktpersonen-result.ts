import { Unsubscribable } from 'oblique-reactive';
import { OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { GenericConfirmComponent, KontaktpersonService } from '@app/shared';
import { takeUntil } from 'rxjs/operators';
import { KontakteViewDTO } from '@dtos/kontakteViewDTO';
import { UnternehmenTypes } from '@shared/enums/unternehmen.enum';
import { ActivatedRoute } from '@angular/router';
import { KontaktpersonenTableComponent, KontaktPersonTableRow } from '@shared/components/kontaktpersonen-table/kontaktpersonen-table.component';
import { KontaktpersonStatusCode } from '@shared/enums/domain-code/kontakptperson-status-code.enum';
import { DmsService } from '../services/dms.service';
import { DokumentVorlageToolboxData } from '../models/dokument-vorlage-toolbox-data.model';
import { VorlagenKategorie } from '../enums/vorlagen-kategorie.enum';
import { DokumentVorlageActionDTO } from '../models/dtos-generated/dokumentVorlageActionDTO';
import { FacadeService } from '@shared/services/facade.service';

export abstract class AbstractKontaktpersonenResult extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('kontaktpersonenTable') kontaktpersonenTable: KontaktpersonenTableComponent;
    resultsData: KontakteViewDTO[] = [];
    unternehmenType: UnternehmenTypes;
    footerDisabled = true;
    inactivePersonsUebernehmen: string;
    emailUrl: string;

    constructor(
        protected kontaktpersonService: KontaktpersonService,
        protected activatedRoute: ActivatedRoute,
        protected facadeService: FacadeService,
        protected dmsService: DmsService
    ) {
        super();
    }

    ngOnInit(): void {
        this.activatedRoute.data.pipe(takeUntil(this.unsubscribe)).subscribe(data => {
            this.unternehmenType = data['type'];
        });
        this.subscribeToData();
    }

    openKontaktperson(kontaktperson: KontakteViewDTO): void {
        this.kontaktpersonService.navigateToKontaktpersonBearbeiten(kontaktperson.unternehmenId, kontaktperson.kontaktpersonId, this.activatedRoute);
    }

    onEmail(row: KontaktPersonTableRow) {
        this.emailUrl = `mailto:${row.email}`;
        if (!row.statusCode || row.statusCode.trim() !== KontaktpersonStatusCode.ACTIVE) {
            // BSP4 SUC-0150-025
            const personName = this.addPersonName(null, row);
            this.inactivePersonsUebernehmen = this.facadeService.translateService.instant('common.label.inaktiveKontaktpersonenUebernehmen', { '0': personName });
            this.confirmEmailToInactive();
        } else {
            this.sendEmail();
        }
    }

    sendEmails() {
        if (this.kontaktpersonenTable) {
            this.checkForInactiveAndSend();
        }
    }

    addAllCheckedEmails() {
        this.emailUrl = '';
        this.kontaktpersonenTable.selectedRows.forEach(r => {
            if (this.emailUrl) {
                this.emailUrl += ';';
            } else {
                this.emailUrl = 'mailto:';
            }
            this.emailUrl += r.email;
        });
    }

    sendEmail() {
        if (this.emailUrl) {
            const link = document.createElement('a');
            link.href = this.emailUrl;
            const normalBrowser = typeof Event === 'function';
            let event;
            if (normalBrowser) {
                event = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
            } else {
                // IE
                event = document.createEvent('Event');
                event.initEvent('click', true, true);
            }
            link.dispatchEvent(event);
            if (normalBrowser) {
                // IE does not support remove()
                setTimeout(function() {
                    link.remove();
                }, 100);
            }
        }
    }

    onCheck(checked: boolean) {
        this.footerDisabled = !checked || !this.kontaktpersonenTable || this.kontaktpersonenTable.selectedRows.length > 50;
    }

    onDocumentManager(row: KontaktPersonTableRow) {
        const documentData: DokumentVorlageToolboxData = {
            vorlagenKategorien: [VorlagenKategorie.KONTAKTPERSON],
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.KONTAKTPERSONSUCHEN,
            entityIDsMapping: { KONTAKT_ID: row.kontaktId }
        };
        this.dmsService.displayDocumentTemplates(documentData);
    }

    protected subscribeToData(): void {
        this.kontaktpersonService.kontaktpersonListSubject.pipe(takeUntil(this.unsubscribe)).subscribe((dtos: KontakteViewDTO[]) => {
            this.resultsData = dtos;
        });
    }

    private checkForInactiveAndSend() {
        this.addAllCheckedEmails();
        const inactive = this.kontaktpersonenTable.selectedRows.filter(r => !r.statusCode || r.statusCode.trim() !== KontaktpersonStatusCode.ACTIVE);
        if (inactive.length > 0) {
            // BSP4 SUC-0150-025
            let personsList = '';
            inactive.forEach(p => (personsList = this.addPersonName(personsList, p)));
            this.inactivePersonsUebernehmen = this.facadeService.translateService.instant('common.label.inaktiveKontaktpersonenUebernehmen', { '0': personsList });
            this.confirmEmailToInactive();
        } else {
            this.sendEmail();
        }
    }

    private confirmEmailToInactive() {
        const modalRef = this.kontaktpersonService.openMdModal(GenericConfirmComponent);

        modalRef.result
            .then(result => {
                if (result) {
                    this.sendEmail();
                }
            })
            .catch(() => modalRef.close());
        const component: GenericConfirmComponent = modalRef.componentInstance as GenericConfirmComponent;
        component.titleLabel = 'common.label.inaktiveKontaktpersonen';
        component.promptLabel = this.inactivePersonsUebernehmen;
        component.secondaryButton = 'i18n.common.cancel';
        component.primaryButton = 'common.message.kontaktperson-inactive-uebernehmen';
    }

    private addPersonName(persons: string, row: KontaktPersonTableRow) {
        let res = persons ? `${persons}, ` : '';
        if (row.name) {
            res += row.name;
        }
        if (row.vorname) {
            res += ` ${row.vorname}`;
        }
        return res;
    }
}
