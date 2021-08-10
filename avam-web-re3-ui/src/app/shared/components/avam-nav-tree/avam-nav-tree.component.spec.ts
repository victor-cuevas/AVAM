import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { AvamNavTreeItemModel } from '@shared/models/avam-nav-tree-item.model';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { AvamNavTreeComponent } from '@app/shared';

import {
    FakeMissingTranslationHandler,
    MissingTranslationHandler,
    TranslateCompiler,
    TranslateLoader,
    TranslateParser,
    TranslateService,
    TranslateStore,
    USE_DEFAULT_LANG,
    USE_STORE
} from '@ngx-translate/core';
import { MessageBus } from '@shared/services/message-bus';

class TranslateServiceStub extends TranslateService {
    public instant(key: any): any {
        return key;
    }
}

@Component({
    template: `
        <avam-nav-tree [items]="items" [variant]="variant" [labelFormatter]="labelFormatter"></avam-nav-tree>
    `
})
class TestComponent {
    items = [
        new AvamNavTreeItemModel({ id: 'A', label: 'A - Label', fragment: 'fragment', queryParams: { foo: 'bar' } }),
        new AvamNavTreeItemModel({
            id: 'B',
            label: 'B - Label',
            items: [
                new AvamNavTreeItemModel({ id: 'B-1', label: 'B.1 - Label' }),
                new AvamNavTreeItemModel({
                    id: 'B-2',
                    label: 'B.2 - Label',
                    items: [
                        new AvamNavTreeItemModel({ id: 'B2-1', label: 'B.2.1 - Label' }),
                        new AvamNavTreeItemModel({ id: 'B2-2', label: 'B.2.2 - Label' }),
                        new AvamNavTreeItemModel({ id: 'B2-3', label: 'B.2.3 - Label' })
                    ]
                }),
                new AvamNavTreeItemModel({ id: 'B-3', label: 'B.3 - Label' })
            ]
        }),
        new AvamNavTreeItemModel({
            id: 'C',
            label: 'C - Label',
            items: [
                new AvamNavTreeItemModel({ id: 'C-1', label: 'C.1 - Label' }),
                new AvamNavTreeItemModel({ id: 'C-2', label: 'C.2 - Label' }),
                new AvamNavTreeItemModel({ id: 'C-3', label: 'C.3 - Label' })
            ]
        })
    ];

    variant = AvamNavTreeComponent.DEFAULTS.VARIANT;

    labelFormatter(label: string): string {
        return `${label}`;
    }
}

xdescribe('AvamNavTreeComponent', () => {
    let testComponent: TestComponent;
    let component: AvamNavTreeComponent;
    let fixture: ComponentFixture<TestComponent>;
    let element: DebugElement;
    let translateStub: TranslateServiceStub;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [TestComponent, AvamNavTreeComponent, MockTranslatePipe],
            providers: [
                { provide: TranslateService, useClass: TranslateServiceStub },
                TranslateStore,
                TranslateLoader,
                TranslateCompiler,
                TranslateParser,
                MessageBus,
                { provide: MissingTranslationHandler, useClass: FakeMissingTranslationHandler },
                { provide: USE_DEFAULT_LANG },
                { provide: USE_STORE }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        translateStub = TestBed.get(TranslateService);
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        fixture.detectChanges();
        element = fixture.debugElement.query(By.directive(AvamNavTreeComponent));
        component = element.injector.get(AvamNavTreeComponent);
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('should create 4 navigation trees after recursive rendering', () => {
        const navTrees = fixture.debugElement.queryAll(By.css('ul'));
        expect(navTrees.length).toBe(4);
    });

    it('should create 12 navigation items after recursive rendering', () => {
        const navItems = fixture.debugElement.queryAll(By.css('li.nav-item'));
        expect(navItems.length).toBe(12);
    });

    it('should detect changes if another `NavTreeItemModel is added`', () => {
        testComponent.items.push(new AvamNavTreeItemModel({ id: 'X', label: 'X - Label' }));
        fixture.detectChanges();

        const navItems = fixture.debugElement.queryAll(By.css('li.nav-item'));
        expect(navItems.length).toBe(13);
    });

    it('should custom format item labels', () => {
        const suffix = '[custom]';
        component.labelFormatter = (item: AvamNavTreeItemModel) => `${item.label} - ${suffix}`;
        fixture.detectChanges();
        const firstNavItem = fixture.debugElement.query(By.css('li.nav-item'));
        expect(firstNavItem.nativeElement.innerHTML).toContain(suffix);
    });

    it('should add URL fragment to `href` attribute', () => {
        const fragment = '#' + testComponent.items[0].fragment;

        // [routerLink] directive adds `[href]` attribute to nav item links:
        const firstNavItem = fixture.debugElement.query(By.css('a.avam-nav-link'));
        expect(firstNavItem.nativeElement.attributes.getNamedItem('href')).toBeDefined();
        expect(firstNavItem.nativeElement.attributes.getNamedItem('href').value).toContain(fragment);
    });

    it('should add URL query params to `href` attribute', () => {
        const urlQueryParams = 'foo=' + testComponent.items[0].queryParams.foo;

        // [routerLink] directive adds `[href]` attribute to nav item links:
        const firstNavItem = fixture.debugElement.query(By.css('a.avam-nav-link'));
        expect(firstNavItem.nativeElement.attributes.getNamedItem('href')).toBeDefined();
        expect(firstNavItem.nativeElement.attributes.getNamedItem('href').value).toContain(urlQueryParams);
    });
});
