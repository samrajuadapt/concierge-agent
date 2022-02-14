import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";

import { IAppState } from '../../reducers';
import * as CustomActions from '../../actions';


@Injectable()
export class ErpBranchDispatcher{
    constructor(private store: Store<IAppState>) { }

    fetchErpBranches() {
        this.store.dispatch(new CustomActions.FetchErpBranches);
      }
}