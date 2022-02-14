import { Injectable } from "@angular/core";
import { Effect, Actions, ofType } from "@ngrx/effects";
import { Action } from '@ngrx/store/src/models';
import { Observable } from "rxjs";
import { switchMap } from "rxjs/operators";
import { CustomerTypeDataService } from "../services/customer-type/customer-type-data.service";

import * as AllActions from '../actions';

const toAction = AllActions.toAction();

@Injectable()
export class CustomerTypeEffects {

    constructor(
        private actions$: Actions,
        private customerTypeDataServices: CustomerTypeDataService
    ) { }

    @Effect()
    getCustomerType$: Observable<Action> = this.actions$
        .pipe(
            ofType(AllActions.FETCH_CUSTOMER_TYPE),
            switchMap(() =>
                toAction(
                    this.customerTypeDataServices.getCustomerType(),
                    AllActions.FetchCustomerTypeSuccess,
                    AllActions.FetchCustomerTypeFail
                )
            )
        );

}