import { BehaviorSubject } from 'rxjs';
import { filter, pairwise } from 'rxjs/operators';

import { Component } from '@angular/core';
import { NavigationEnd, Router, RoutesRecognized, NavigationStart } from '@angular/router';

import { RouterHistoryService } from './services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'previous-url-example';

  previousUrlViaNavigationEnd$ = new BehaviorSubject<string>(null);
  currentUrlViaNavigationEnd$ = new BehaviorSubject<string>(null);

  previousUrlViaRoutesRecognized$ = new BehaviorSubject<string>(null);
  currentUrlViaRoutesRecognized$ = new BehaviorSubject<string>(null);

  previousUrlViaRouterHistoryService$ = this.routerHistoryService.previousUrl$;
  currentUrlViaRouterHistoryService$ = this.routerHistoryService.currentUrl$;

  constructor(
    router: Router,
    private routerHistoryService: RouterHistoryService
  ) {
    this.currentUrlViaNavigationEnd$.next(router.url);
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        console.log('NavigationStart', JSON.stringify(event));
      }

      if (event instanceof NavigationEnd) {
        console.log('NavigationEnd', JSON.stringify(event));
      }

      if (event instanceof NavigationEnd) {
        this.previousUrlViaNavigationEnd$.next(
          this.currentUrlViaNavigationEnd$.value
        );
        this.currentUrlViaNavigationEnd$.next(event.urlAfterRedirects);
      }
    });

    router.events
      .pipe(
        filter(evt => evt instanceof RoutesRecognized),
        pairwise()
      )
      .subscribe(
        ([previous, current]: [RoutesRecognized, RoutesRecognized]) => {
          this.previousUrlViaRoutesRecognized$.next(previous.urlAfterRedirects);
          this.currentUrlViaRoutesRecognized$.next(current.urlAfterRedirects);
        }
      );
  }
}
