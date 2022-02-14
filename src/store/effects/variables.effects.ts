import { Injectable } from "@angular/core";
import { Effect,Actions, ofType } from "@ngrx/effects";
import { Action } from '@ngrx/store/src/models';
import { Observable } from "rxjs";
import { switchMap } from "rxjs/operators";

import { VariablesDataService } from "../services";
import * as AllActions from '../actions';

const toAction = AllActions.toAction();


@Injectable()
export class VariablesEffects {
    constructor(
      private actions$: Actions,
      private variablesDataService: VariablesDataService
    ) {}

    @Effect()
    getBranches$: Observable<Action> = this.actions$
    .pipe(
      ofType(AllActions.FETCH_VARIABLES),
        switchMap(() =>
          toAction(
            this.variablesDataService.getVariables(),
            AllActions.FetchVariablesSuccess,
            AllActions.FetchVariablesFail
          )
        )
      );
}
