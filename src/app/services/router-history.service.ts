import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { filter, scan } from 'rxjs/operators';
import { RouterHistory } from '../models/router-history';

@Injectable({
  providedIn: 'root'
})
export class RouterHistoryService {
  previousUrl$ = new BehaviorSubject<string>(null);
  currentUrl$ = new BehaviorSubject<string>(null);

  constructor(router: Router) {
    router.events
      .pipe(
        filter(
          event =>
            event instanceof NavigationStart || event instanceof NavigationEnd
        ),
        scan<NavigationStart | NavigationEnd, RouterHistory>(
          (acc, event) => {
            if (event instanceof NavigationStart) {
              return {
                ...acc,
                event,
                trigger: event.navigationTrigger,
                id: event.id,
                idToRestore:
                  (event.restoredState && event.restoredState.navigationId) ||
                  undefined
              };
            }

            const history = [...acc.history];
            let currentIndex = acc.currentIndex;

            if (acc.trigger === 'imperative') {
              history.splice(currentIndex + 1);

              history.push({ id: acc.id, url: event.urlAfterRedirects });
              currentIndex = history.length - 1;
            }

            if (acc.trigger === 'popstate') {
              const idx = history.findIndex(x => x.id === acc.idToRestore);

              if (idx > -1) {
                currentIndex = idx;
                history[idx].id = acc.id;
              } else {
                currentIndex = 0;
              }
            }

            return {
              ...acc,
              event,
              history,
              currentIndex
            };
          },
          {
            event: null,
            history: [],
            trigger: null,
            id: 0,
            idToRestore: 0,
            currentIndex: 0
          }
        ),
        filter(
          ({ event, trigger }) => event instanceof NavigationEnd && !!trigger
        )
      )
      .subscribe(({ history, currentIndex }) => {
        const previous = history[currentIndex - 1];
        const current = history[currentIndex];

        this.previousUrl$.next(previous ? previous.url : null);
        this.currentUrl$.next(current.url);
      });
  }
}
