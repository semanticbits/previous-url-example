import { HistoryEntry } from './history-event';
import { NavigationTrigger } from './navigation-trigger';

import { NavigationStart, NavigationEnd } from '@angular/router';

export interface RouterHistory {
  history: HistoryEntry[];
  currentIndex: number;

  event: NavigationStart | NavigationEnd;
  trigger: NavigationTrigger;
  id: number;
  idToRestore: number;
}
