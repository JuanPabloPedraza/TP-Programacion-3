import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardB } from './dashboard-b';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('DashboardB', () => {
  let component: DashboardB;
  let fixture: ComponentFixture<DashboardB>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardB],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardB);
    component = fixture.componentInstance;
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne(request => request.url.endsWith('/Materia'))
      .flush({ items: [], totalCount: 0, pageNumber: 1, pageSize: 5, totalPages: 0 });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
