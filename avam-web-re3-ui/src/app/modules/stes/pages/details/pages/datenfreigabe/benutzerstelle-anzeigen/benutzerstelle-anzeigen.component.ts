import { Component, OnInit, AfterViewInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { ToolboxConfiguration, ToolboxService, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { BenutzerstellenRestService } from '@app/core/http/benutzerstellen-rest.service';
import { Unsubscribable, SpinnerService } from 'oblique-reactive';
import { takeUntil } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BenutzerstelleResultDTO } from '@app/shared/models/dtos-generated/benutzerstelleResultDTO';
import { TranslateService } from '@ngx-translate/core';
import { StesBenutzerstelleSucheFormbuilder } from '@app/shared/formbuilders/stes-benutzerstelle-suche.formbuilder';
import { FormBuilder } from '@angular/forms';
import { BenutzerstelleSucheParamsModel } from '../benutzerstelle-suche-params.model';
import { Subscription } from 'rxjs';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';

@Component({
    selector: 'app-benutzerstelle-anzeigen',
    templateUrl: './benutzerstelle-anzeigen.component.html',
    styleUrls: ['./benutzerstelle-anzeigen.component.scss']
})
export class BenutzerstelleAnzeigenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @Input() uebergebeneDaten: BenutzerstelleSucheParamsModel;
    @Input() isMultiselect = false;
    @Output() emitBenutzerstelle = new EventEmitter();

    toolboxConfig: ToolboxConfiguration[] = [];
    benutzerstelleAnzeigenToolboxId = 'benutzerstelle-anzeigen-modal';
    benutzerstelleResultChannel = 'benutzerstelle-result';
    benutzerstellenData: BenutzerstelleResultDTO[] = [];
    searchFormBuilder: StesBenutzerstelleSucheFormbuilder;
    observeClickActionSub: Subscription;

    constructor(
        private toolboxService: ToolboxService,
        private benutzerstellenRestService: BenutzerstellenRestService,
        private modalService: NgbModal,
        private spinnerService: SpinnerService,
        private translateService: TranslateService,
        private formBuilder: FormBuilder
    ) {
        super();
        ToolboxService.CHANNEL = this.benutzerstelleAnzeigenToolboxId;
    }

    ngOnInit() {
        this.searchFormBuilder = new StesBenutzerstelleSucheFormbuilder(this.formBuilder);
        this.searchFormBuilder.initForm(this.uebergebeneDaten);

        this.loadData();

        this.observeClickActionSub = this.toolboxService
            .observeClickAction(this.benutzerstelleAnzeigenToolboxId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(action => {
                if (action.message.action === ToolboxActionEnum.EXIT) {
                    this.close();
                }
            });
    }

    ngOnDestroy() {
        this.observeClickActionSub.unsubscribe();
        super.ngOnDestroy();
    }

    ngAfterViewInit(): void {
        Promise.resolve().then(() => {
            this.configureToolbox();
        });
    }

    close() {
        this.modalService.dismissAll();
    }

    getFormNr(): string {
        return StesFormNumberEnum.BENUTZERSTELLE_ANZEIGEN;
    }

    receiveData(data) {
        this.emitBenutzerstelle.emit(data);
        this.close();
    }

    configureToolbox() {
        this.toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false));
        this.toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false));
        this.toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false));
    }

    loadData() {
        this.spinnerService.activate(this.benutzerstelleResultChannel);
        this.benutzerstellenData = [];

        this.benutzerstellenRestService
            .getBenutzerstellen(this.searchFormBuilder.mapToDTO(this.isMultiselect), this.translateService.currentLang)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                response => {
                    this.benutzerstellenData = response.data;
                    this.spinnerService.deactivate(this.benutzerstelleResultChannel);
                },
                () => {
                    this.spinnerService.deactivate(this.benutzerstelleResultChannel);
                }
            );
    }
}
