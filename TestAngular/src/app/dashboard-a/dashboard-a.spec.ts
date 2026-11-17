import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardA } from './dashboard-a';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('DashboardA', () => {
  let component: DashboardA;
  let fixture: ComponentFixture<DashboardA>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardA],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardA);
    component = fixture.componentInstance;
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne(request => request.url.endsWith('/Alumno'))
      .flush({ items: [], totalCount: 0, pageNumber: 1, pageSize: 5, totalPages: 0 });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
