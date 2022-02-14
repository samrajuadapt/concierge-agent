import { Injectable } from "@angular/core";
import { Store } from '@ngrx/store';

import { IAppState } from '../../reducers';
import * as VariablesActions from '../../actions';

@Injectable()
export class VariablesDispathers{
    constructor(private store: Store<IAppState>) {}


    fetchVariables() {
        this.store.dispatch(new VariablesActions.FetchVariables());
      }
}