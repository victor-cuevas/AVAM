import { ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { ToolboxService } from '@app/shared';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { MassnahmenQueryParams, NodeData, StrukturElementType } from '@app/shared/components/massnahmenart-waehlen-modal/massnahmenart-tree-models';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';

import { BaseResponseWrapperListStesWdgZielElListeDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListStesWdgZielElListeDTOWarningMessages';
import { BaseResponseWrapperStesWdgAktionDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperStesWdgAktionDTOWarningMessages';
import { StesWdgAktionDTO } from '@app/shared/models/dtos-generated/stesWdgAktionDTO';
import { StesWdgZielElListeDTO } from '@app/shared/models/dtos-generated/stesWdgZielElListeDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Permissions } from '@shared/enums/permissions.enum';
import PrintHelper from '@shared/helpers/print.helper';
import { MessageBus } from '@shared/services/message-bus';
import { SpinnerService } from 'oblique-reactive';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { AktionFormHandler } from './wdgaktionen-form-handler';

export abstract class AktionAbstract implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('pberater') pberater: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('wdgAktionenBtn') wdgAktionenBtn;

    isWgdAktionenSelect = true;
    selectionChanged = false;
    dropDownOptions = [];

    toolboxClickSubscription: Subscription;

    stesId: string;

    wdgAktionId: string;

    lastUpdate: StesWdgAktionDTO;

    aktionErfassenForm: FormGroup;

    bearbeitungSuchenTokens: {};
    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;

    aktionenToolboxId = 'wiedereingliederungsaktion-erfassen';
    wdgAktionenChannel = 'wdgAktionen';

    massnahmenQueryParams: MassnahmenQueryParams = { type: StrukturElementType.AUSGLEICHSSTELLE };

    constructor(
        protected aktionFormHandler: AktionFormHandler,
        protected dataService: StesDataRestService,
        protected dbTranslateService: DbTranslateService,
        protected fehlermeldungenService: FehlermeldungenService,
        protected formBuilder: FormBuilder,
        protected modalService: NgbModal,
        protected route: ActivatedRoute,
        protected spinnerService: SpinnerService,
        protected toolboxService: ToolboxService,
        protected authService: AuthenticationService,
        protected messageBus: MessageBus,
        protected stesInfobarService: AvamStesInfoBarService
    ) {}

    ngOnInit(): void {
        this.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                this.closeComponent(message);
            }
        });
    }

    closeComponent(message) {}

    initialiseBenuStelleId() {
        const currentUser = this.authService.getLoggedUser();

        if (currentUser) {
            this.bearbeitungSuchenTokens = {
                berechtigung: Permissions.STES_ANMELDEN_BEARBEITEN,
                myBenutzerstelleId: `${currentUser.benutzerstelleId}`,
                myVollzugsregionTyp: DomainEnum.STES
            };
        }
    }

    changeInputStatus() {
        this.selectionChanged = true;
        this.isWgdAktionenSelect = !this.isWgdAktionenSelect;
        if (!this.isWgdAktionenSelect) {
            this.aktionErfassenForm.controls.wgdAktionen.setValue(null);
        } else {
            this.aktionErfassenForm.controls.wgdAktionenText.setValue(null);
        }
    }

    subscribeToToolbox(): Subscription {
        return this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(this.wdgAktionId, AvamCommonValueObjectsEnum.T_WDGAKTION);
            }
        });
    }

    openHistoryModal(objId: string, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId;
        comp.type = objType;
    }

    getRouteParams() {
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });
    }

    getZielOptions(): Observable<BaseResponseWrapperListStesWdgZielElListeDTOWarningMessages> {
        return this.dataService.getWdgZielListeById(this.stesId);
    }

    setAdditionalRouteParams() {
        this.route.queryParamMap.subscribe(params => {
            this.wdgAktionId = params.get('wdgAktionId');
        });
    }

    loadData() {
        this.spinnerService.activate(this.wdgAktionenChannel);
        this.fehlermeldungenService.closeMessage();
        forkJoin<BaseResponseWrapperListStesWdgZielElListeDTOWarningMessages, BaseResponseWrapperStesWdgAktionDTOWarningMessages>([
            this.getZielOptions(),
            this.loadAktion()
        ]).subscribe(
            ([zielOptions, aktion]) => {
                if (zielOptions && zielOptions.data) {
                    this.dropDownOptions = zielOptions.data.map(element => this.mapToDropdown(element));
                }
                if (!this.wdgAktionId) {
                    this.pberater.appendCurrentUser();
                }
                if (aktion) {
                    this.lastUpdate = aktion.data;
                    this.authService.setOwnerPermissionContext(this.lastUpdate.stesID, this.lastUpdate.ownerId);
                    this.populateZiele(this.lastUpdate.stesWdgZielIds);
                    this.aktionErfassenForm.reset(this.aktionFormHandler.mapToForm(aktion.data));
                    this.setUeberschrift();
                    this.setInfoIconData();
                }
                this.initWdgAktionenRadioState();
                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    setInfoIconData() {
        this.stesInfobarService.sendLastUpdate(this.lastUpdate);
    }

    loadAktion(): Observable<any> {
        return of(null);
    }

    populateZiele(zielElListe: Array<number>): void {
        const formarr = this.aktionErfassenForm.get('ziel') as FormArray;
        while (formarr.controls.length > 0) {
            formarr.removeAt(0);
        }
        if (zielElListe && zielElListe.length > 0) {
            zielElListe.forEach(ziel => {
                formarr.push(this.formBuilder.control(ziel));
            });
        } else {
            formarr.push(this.formBuilder.control(''));
        }
    }

    subscribeToLangChange(): Subscription {
        return this.dbTranslateService.getEventEmitter().subscribe(() => {
            this.setUeberschrift();
        });
    }

    setUeberschrift(): void {}

    initWdgAktionenRadioState(): void {}

    mapToDropdown(object: StesWdgZielElListeDTO) {
        return {
            value: object.stesWdgZielId,
            labelDe: object.zielDe,
            labelFr: object.zielFr,
            labelIt: object.zielIt
        };
    }

    canDeactivate(): boolean {
        return this.aktionErfassenForm.dirty || this.selectionChanged;
    }

    openModal(content, windowClass, massnahmen = false) {
        if (massnahmen) {
            this.massnahmenQueryParams.anzeigeDatum = this.aktionErfassenForm.controls.wdgDatumVon.value ? this.aktionErfassenForm.controls.wdgDatumVon.value : new Date();
            this.wdgAktionenBtn.nativeElement.blur();
        }
        this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', windowClass, backdrop: 'static' }).result.then(
            result => {},
            reason => {
                ToolboxService.CHANNEL = this.aktionenToolboxId;
            }
        );
    }

    selectMassnahmenart(element: NodeData) {
        const control = this.aktionErfassenForm.controls.wgdAktionen as FormControl;
        control.setValue(element.getPath(this.dbTranslateService));
        control.markAsDirty();
    }

    deactivateSpinnerAndScrollTop() {
        this.spinnerService.deactivate(this.wdgAktionenChannel);
        OrColumnLayoutUtils.scrollTop();
    }

    cancel() {}

    resetSideNav() {}

    ngOnDestroy() {
        this.stesInfobarService.sendLastUpdate({}, true);
        this.authService.removeOwnerPermissionContext();
        this.fehlermeldungenService.closeMessage();
    }
}
