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
        // only include NavigationStart and NavigationEnd events
        filter(
          event =>
            event instanceof NavigationStart || event instanceof NavigationEnd
        ),
        scan<NavigationStart | NavigationEnd, RouterHistory>(
          (acc, event) => {
            if (event instanceof NavigationStart) {
              // We need to track the trigger, id, and idToRestore from the NavigationStart events
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

            // NavigationEnd events
            const history = [...acc.history];
            let currentIndex = acc.currentIndex;

            // router events are imperative (router.navigate or routerLink)
            if (acc.trigger === 'imperative') {
              // remove all events in history that come after the current index
              history.splice(currentIndex + 1);

              // add the new event to the end of the history and set that as our current index
              history.push({ id: acc.id, url: event.urlAfterRedirects });
              currentIndex = history.length - 1;
            }

            // browser events (back/forward) are popstate events
            if (acc.trigger === 'popstate') {
              // get the history item that references the idToRestore
              const idx = history.findIndex(x => x.id === acc.idToRestore);

              // if found, set the current index to that history item and update the id
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
        // filter out so we only act when navigation is done
        filter(
          ({ event, trigger }) => event instanceof NavigationEnd && !!trigger
        )
      )
      .subscribe(({ history, currentIndex }) => {
        const previous = history[currentIndex - 1];
        const current = history[currentIndex];

        // update current and previous urls
        this.previousUrl$.next(previous ? previous.url : null);
        this.currentUrl$.next(current.url);
      });
  }
}
