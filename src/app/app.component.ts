import { BehaviorSubject } from 'rxjs';
import { filter, pairwise } from 'rxjs/operators';

import { Component } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RoutesRecognized,
  NavigationStart
} from '@angular/router';

import { RouterHistoryService, WindowService } from './services';

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

  // Via RouterHistoryService
  previousUrlViaRouterHistoryService$ = this.routerHistoryService.previousUrl$;
  currentUrlViaRouterHistoryService$ = this.routerHistoryService.currentUrl$;

  logs: { event: string; message: string }[] = [];

  constructor(
    router: Router,
    private routerHistoryService: RouterHistoryService,
    private windowService: WindowService
  ) {
    // Event logging only
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.logs.push({
          event: 'NavigationStart',
          message: JSON.stringify(event)
        });
      }

      if (event instanceof NavigationEnd) {
        this.logs.push({
          event: 'NavigationEnd',
          message: JSON.stringify(event)
        });
      }
    });

    // Via Navigation End Event
    this.currentUrlViaNavigationEnd$.next(router.url);
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousUrlViaNavigationEnd$.next(
          this.currentUrlViaNavigationEnd$.value
        );
        this.currentUrlViaNavigationEnd$.next(event.urlAfterRedirects);
      }
    });

    // Via RoutesRecognized
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

  onClick($event: MouseEvent): void {
    $event.preventDefault();
    this.windowService.nativeWindow.history.back();
  }
}
