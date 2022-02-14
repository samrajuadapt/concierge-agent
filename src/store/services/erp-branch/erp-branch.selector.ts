import { Injectable } from "@angular/core";
import { createFeatureSelector, createSelector, Store } from "@ngrx/store";
import { IErpBranchState } from "src/store/reducers/erp-branch.reducer";
import { IAppState } from '../../reducers';

const getErpBranchState = createFeatureSelector<IErpBranchState>('erp');

const getErpBranches = createSelector(
    getErpBranchState,
  (state: IErpBranchState) => state.erpBranches
);

@Injectable()
export class ErpBranchSelectors {
  constructor(private store: Store<IAppState>) {}  

  erpBranches$ = this.store.select(getErpBranches);
}

