import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvamActionFooterComponent } from './avam-action-footer.component';

describe('AvamActionFooterComponent', () => {
  let component: AvamActionFooterComponent;
  let fixture: ComponentFixture<AvamActionFooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvamActionFooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvamActionFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
