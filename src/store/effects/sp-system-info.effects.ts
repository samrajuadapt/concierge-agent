import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store/src/models';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import * as SystemInfoActions from './../actions';
import { SystemInfoDataService } from '../services';

const toAction = SystemInfoActions.toAction();

@Injectable()
export class SystemInfoEffects {
  constructor(
    private actions$: Actions,
    private systemInfoDataService: SystemInfoDataService
  ) {}

  @Effect()
  getSystemInfo$: Observable<Action> = this.actions$
    .ofType(SystemInfoActions.FETCH_SP_SYSTEM_INFO)
    .pipe(
      switchMap(() =>
        toAction(
          this.systemInfoDataService.getServicePointSystemInfo(),
          SystemInfoActions.FetchSPSystemInfoSuccess,
          SystemInfoActions.FetchSPSystemInfoFail
        )
      )
    );
}