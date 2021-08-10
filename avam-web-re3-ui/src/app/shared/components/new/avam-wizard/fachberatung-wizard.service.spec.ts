import { TestBed, async } from '@angular/core/testing';
import { FachberatungWizardService } from './fachberatung-wizard.service';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';

describe('FachberatungWizardService', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterModule.forRoot([])],
            providers: [
                { provide: APP_BASE_HREF, useValue: '/' }
            ]
        }).compileComponents();
    }));

    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: FachberatungWizardService = TestBed.get(FachberatungWizardService);
        expect(service).toBeTruthy();
    });
});
