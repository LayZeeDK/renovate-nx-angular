import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { filter, firstValueFrom, map, withLatestFrom } from 'rxjs';

import { RouterStore } from './router-store';
import { RouterStoreModule } from './router-store.module';

@Component({
  template: '<router-outlet></router-outlet>',
})
class DummyAppComponent {}

@Component({
  template: '',
})
class DummyLoginComponent {}

describe(`${RouterStore.name} selectors`, () => {
  beforeEach(async () => {
    const routes: Routes = [
      {
        path: 'login',
        children: [
          {
            path: ':id',
            component: DummyLoginComponent,
            data: { testData: 'test-data' },
          },
        ],
      },
    ];

    TestBed.configureTestingModule({
      declarations: [DummyAppComponent, DummyLoginComponent],
      imports: [
        RouterTestingModule.withRoutes(routes),
        RouterStoreModule.forRoot(),
      ],
    });

    const rootFixture = TestBed.createComponent(DummyAppComponent);
    rootFixture.autoDetectChanges(true);

    router = TestBed.inject(Router);
    store = TestBed.inject(RouterStore);
  });

  let router: Router;
  let store: RouterStore;

  it('exposes currentRoute$ selector for selecting the current route', async () => {
    const whenCurrentRoute = firstValueFrom(
      store.currentRoute$.pipe(
        withLatestFrom(store.routerStoreEvent$),
        filter(
          ([_, event]) =>
            event.type === '@ngworker/router-component-store/navigated'
        ),
        map(([currentRoute]) => currentRoute)
      )
    );

    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(whenCurrentRoute).resolves.toEqual({
      params: {
        id: 'etyDDwAAQBAJ',
      },
      data: {
        testData: 'test-data',
      },
      url: [
        {
          path: 'etyDDwAAQBAJ',
          parameters: {},
        },
      ],
      outlet: 'primary',
      routeConfig: {
        path: ':id',
      },
      queryParams: {
        ref: 'ngrx.io',
      },
      fragment: 'test-fragment',
      children: [],
    });
  });
});
