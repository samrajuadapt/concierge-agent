import { Injectable } from "@angular/core";
import { Effect, Actions, ofType } from "@ngrx/effects";
import { Action } from '@ngrx/store/src/models';
import { Observable } from "rxjs";
import { switchMap } from "rxjs/operators";

import * as AllActions from '../actions';
const toAction = AllActions.toAction();
import { ErpBranchDataService } from "../services/erp-branch/erp-branch-data.service";

@Injectable()
export class ErpBranchEffects {
    constructor(private actions$: Actions,
        private erpDataService: ErpBranchDataService
    ) { }

    @Effect()
    getErpBranches$: Observable<Action> = this.actions$
        .pipe(
            ofType(AllActions.FETCH_ERP_BRANCHES),
            switchMap(() =>
                toAction(
                    this.erpDataService.getErpBranches(),
                    AllActions.FetchErpBranchesSuccess,
                    AllActions.FetchErpBranchesFail
                )
            )
        );
}