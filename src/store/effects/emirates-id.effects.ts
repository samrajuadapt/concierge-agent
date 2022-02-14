import { Injectable } from "@angular/core";
import { Effect, Actions, ofType } from "@ngrx/effects";
import { Action } from '@ngrx/store/src/models';
import { Observable } from "rxjs";
import { switchMap } from "rxjs/operators";

import * as AllActions from '../actions';
import { EmiratesIdDataService } from "../services/emirates-id/emirates-id-data.service";

const toAction = AllActions.toAction();



@Injectable()
export class EmiratesIdEffetcs{

    constructor(
        private actions$ : Actions,
        private emiratesIdDataService:EmiratesIdDataService
    ){}

    @Effect()
    getEmiratesId$:Observable<Action> = this.actions$
    .pipe(
      ofType(AllActions.FETCH_EMIRATES_ID),
      switchMap(()=>
        toAction(
          this.emiratesIdDataService.getEidData(),
          AllActions.FetchEmiratesIdSucess,
          AllActions.FetchEmiratesIdFail
        )
      )
    );
}