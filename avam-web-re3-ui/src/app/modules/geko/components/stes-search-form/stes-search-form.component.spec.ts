import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StesSearchFormComponent } from './stes-search-form.component';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthenticationService } from '@core/services/authentication.service';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { UserDto } from '@shared/models/dtos-generated/userDto';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { GekoStesRestService } from '@core/http/geko-stes-rest.service';
import { GeKoGeschaeftSuchenDTO } from '@dtos/geKoGeschaeftSuchenDTO';
import { AvamPersonalberaterAutosuggestComponent } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { AvamBenutzerstelleAutosuggestComponent, DbTranslatePipe, FormUtilsService, SortByPipe, ToolboxService } from '@app/shared';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { CallbackHelperService } from '@shared/services/callback-helper.service';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { MessageBus } from '@shared/services/message-bus';
import { NavigationService } from '@shared/services/navigation-service';
import { OpenModalFensterService } from '@shared/services/open-modal-fenster.service';
import { ResetDialogService } from '@shared/services/reset-dialog.service';

describe('StesSearchFormComponent', () => {
    let component: StesSearchFormComponent;
    let fixture: ComponentFixture<StesSearchFormComponent>;
    let authenticationService: AuthenticationService;
    const formBuilder: FormBuilder = new FormBuilder();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StesSearchFormComponent, DbTranslatePipe, MockTranslatePipe, AvamPersonalberaterAutosuggestComponent, AvamBenutzerstelleAutosuggestComponent],
            imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule, NgbModule, FormsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                FormBuilder,
                AuthenticationService,
                AuthenticationRestService,
                SortByPipe,
                { provide: TranslateService, useClass: TranslateServiceStub },
                { provide: FormBuilder, useValue: formBuilder },
                GekoStesRestService,
                ObliqueHelperService,
                CallbackHelperService,
                StesDataRestService,
                NotificationService,
                SpinnerService,
                AuthenticationService,
                DbTranslateService,
                FehlermeldungenService,
                FormUtilsService,
                MessageBus,
                NavigationService,
                OpenModalFensterService,
                ResetDialogService,
                ToolboxService,
                { provide: TranslateService, useClass: TranslateServiceStub }
            ]
        }).compileComponents();
        authenticationService = TestBed.get(AuthenticationService);
        spyOn(authenticationService, 'getLoggedUser').and.returnValue({ benutzerstelleId: 1 } as UserDto);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesSearchFormComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        component.gekoStesSearchFormGroup = formBuilder.group({
            geschaeftsartId: null,
            sachstandId: null,
            geschaeftsterminVon: null,
            geschaeftsterminBis: null,
            erstelltAmVon: null,
            erstelltAmBis: null,
            fallbearbeiterId: null,
            istBerater: false,
            istBearbeiter: false,
            istFreigeber: false,
            benutzerstellenId: null,
            istFallbearbeiterLeer: false
        });
        component.gekoStesSearchFormGroup.setValue({
            geschaeftsartId: 1,
            sachstandId: 2,
            geschaeftsterminVon: new Date(3),
            geschaeftsterminBis: new Date(4),
            erstelltAmVon: new Date(5),
            erstelltAmBis: new Date(6),
            fallbearbeiterId: null,
            istBerater: true,
            istBearbeiter: true,
            istFreigeber: true,
            benutzerstellenId: null,
            istFallbearbeiterLeer: false
        });

        component.gekoStesSearchFormGroup.controls['fallbearbeiterId']['benutzerObject'] = {
            benutzerId: 7,
            benutzerDetailId: 77
        };
        component.gekoStesSearchFormGroup.controls['benutzerstellenId']['benutzerstelleObject'] = {
            benutzerstelleId: 9,
            code: 8
        };

        const request: GeKoGeschaeftSuchenDTO = component.getRequest();
        expect(request).not.toBeNull();
        expect(request.dateFrom).toEqual(new Date(3));
        expect(request.dateUntil).toEqual(new Date(4));
        expect(request.dateErfasstFrom).toEqual(new Date(5));
        expect(request.dateErfasstUntil).toEqual(new Date(6));
        expect(request.isBerater).toBe(true);
        expect(request.isBearbeiter).toBe(true);
        expect(request.isFreigeber).toBe(true);
        expect(request.isFallbearbeiterLeer).toBe(false);
        expect(request.geschaeftsartId).toBe(1);
        expect(request.sachstandId).toBe(2);
        expect(request.benutzerId).toBe(77);
        expect(request.benutzerstelleId).toBe(9);
    });
});
