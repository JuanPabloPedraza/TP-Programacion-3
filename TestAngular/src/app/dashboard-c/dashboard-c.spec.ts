import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardC } from './dashboard-c';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('DashboardC', () => {
  let component: DashboardC;
  let fixture: ComponentFixture<DashboardC>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardC],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardC);
    component = fixture.componentInstance;
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne(request => request.url.endsWith('/Usuarios'))
      .flush({ items: [], totalCount: 0, pageNumber: 1, pageSize: 5, totalPages: 0 });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
