import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StesDetailsInfoIconComponent } from './stes-details-info-icon.component';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbPopover, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Observable, of } from 'rxjs';
import { ToolboxService } from 'src/app/shared';
import { ToolboxActionEnum, ToolboxEvent } from '@shared/services/toolbox.service';

describe('StesDetailsInfoIconComponent', () => {
    let component: StesDetailsInfoIconComponent;
    let fixture: ComponentFixture<StesDetailsInfoIconComponent>;
    let serviceDataRestService: StesDataRestService;
    let serviceToolboxService: ToolboxService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StesDetailsInfoIconComponent],
            imports: [
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                }),
                NgbPopoverModule.forRoot(),
                HttpClientTestingModule
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {
                    provide: StesDataRestService,
                    useClass: StesDataRestService
                },
                {
                    provide: ToolboxService,
                    useClass: ToolboxService
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        ToolboxService.CHANNEL = 'test';
        serviceDataRestService = TestBed.get(StesDataRestService);
        serviceToolboxService = TestBed.get(ToolboxService);
        fixture = TestBed.createComponent(StesDetailsInfoIconComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not call toolbox actions and close', () => {
        let clickEvent: { channel: any; message: ToolboxEvent } = { channel: 'test', message: new ToolboxEvent(ToolboxActionEnum.HELP, component.id) };
        spyOn(serviceToolboxService, 'observeClickAction').and.returnValue(of(clickEvent));
        spyOn(component, 'close').and.callThrough();

        serviceToolboxService.sendClickAction(clickEvent);

        expect(component.close).not.toHaveBeenCalled();
    });

    it('should call toolbox actions and close', () => {
        let clickEvent: { channel: any; message: ToolboxEvent } = { channel: 'test', message: new ToolboxEvent(ToolboxActionEnum.EXIT, component.id) };
        spyOn(serviceToolboxService, 'observeClickAction').and.returnValue(of(clickEvent));
        spyOn(component, 'close').and.callThrough();

        serviceToolboxService.sendClickAction(clickEvent);

        expect(component.close).toHaveBeenCalled();
    });

    it('should unsubscribe on ngOnDestroy', () => {
        component['observeClickActionSub'] = new Observable().subscribe();

        component.ngOnDestroy();

        expect(component['observeClickActionSub'].closed).toBeTruthy();
    });

    it('should unsubscribe on ngOnDestroy', () => {
        component['observeClickActionSub'] = undefined;

        component.ngOnDestroy();

        expect(component['observeClickActionSub']).not.toBeDefined();
    });

    it('should not unsubscribe on close', () => {
        component['observeClickActionSub'] = undefined;

        component.close();

        expect(component['observeClickActionSub']).not.toBeDefined();
    });

    it('should check child component', () => {
        expect(component.popover).toBeInstanceOf(NgbPopover);
    });

    it('should check not set child component', () => {
        expect(component.popover).toBeInstanceOf(NgbPopover);
    });

    it('should check not set child component', () => {
        component.popover = undefined;
        expect(component.popover).not.toBeDefined();
    });
});
