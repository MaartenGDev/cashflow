import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendByCategoryComponent } from './trend-by-category.component';

describe('TrendByCategoryComponent', () => {
  let component: TrendByCategoryComponent;
  let fixture: ComponentFixture<TrendByCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrendByCategoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrendByCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
