import { Injectable } from "@angular/core";
import { createFeatureSelector, createSelector, Store } from "@ngrx/store";
import { IVariablesState } from "src/store/reducers/variables.reducer";
import { IAppState } from '../../reducers';

const getVariablesState = createFeatureSelector<IVariablesState>('variables')

const getAllVariables = createSelector(
  getVariablesState,
    (state: IVariablesState) => state.variables
  );
  

  @Injectable()
  export class VariableSelectors{
    constructor(private store: Store<IAppState>) {}
    variables$ = this.store.select(getAllVariables);
  }