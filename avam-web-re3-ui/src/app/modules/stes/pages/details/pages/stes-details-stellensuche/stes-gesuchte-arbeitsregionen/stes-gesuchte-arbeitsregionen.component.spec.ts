import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StesGesuchteArbeitsregionenComponent } from './stes-gesuchte-arbeitsregionen.component';
import { Arbeitsregionen } from 'src/app/shared/models/arbeitsregionen.model';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from 'src/app/shared/services/forms/form-personalien-helper.service.spec';
import { MessageBus } from '@shared/services/message-bus';

const formBuilder: FormBuilder = new FormBuilder();

export class NgbModalStub {
    public open(key: any, options?: any): any {
        return { result: of(key).toPromise() };
    }
}

describe('StesGesuchteArbeitsregionenComponent', () => {
    let component: StesGesuchteArbeitsregionenComponent;
    let fixture: ComponentFixture<StesGesuchteArbeitsregionenComponent>;
    let ngbModalStub: NgbModalStub;

    let arbeitsRegionen: Arbeitsregionen[] = [{ id: 1, selectedRegion: 'region 1' }, { id: 2, selectedRegion: 'region 2' }];

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StesGesuchteArbeitsregionenComponent, NgbTooltip],
            imports: [ReactiveFormsModule, HttpClientTestingModule, TranslateModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: NgbModal, useClass: NgbModal },
                StesDataRestService,
                { provide: TranslateService, useClass: TranslateServiceStub },
                { provide: FormBuilder, useValue: formBuilder },
                MessageBus
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        ngbModalStub = TestBed.get(NgbModal);
        fixture = TestBed.createComponent(StesGesuchteArbeitsregionenComponent);
        component = fixture.componentInstance;
        component.data = arbeitsRegionen;
        component.index = 1;
        component.parentForm = formBuilder.group({
            autosuggests: formBuilder.array([])
        });
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get reason resolve', () => {
        const closeString = 'Closed with: test';

        var fakeHttpPromise = {
            result: new Promise(function(resolve, reject) {
                resolve('test');
            })
        };

        spyOn(ngbModalStub, 'open').and.returnValue(fakeHttpPromise);
        component.open('Something');

        fakeHttpPromise.result
            .then(() => {
                expect(component.closeResult).toEqual(closeString);
            })
            .catch(err => {
                expect(component.closeResult).toEqual(closeString);
            });
    });

    it('should get reason reject', () => {
        const dismissString = 'Dismissed by pressing ESC';

        var fakeHttpPromise = {
            result: new Promise(function(resolve, reject) {
                reject(1);
            })
        };

        spyOn(ngbModalStub, 'open').and.returnValue(fakeHttpPromise);
        component.open('Something');

        fakeHttpPromise.result
            .then(() => {
                fail('should have failed');
            })
            .catch(err => {
                expect(component.closeResult).toEqual(dismissString);
            });
    });

    xit('should add ', () => {
        component.addItem(null);
        expect(component.data.length).toEqual(2);
    });
});
