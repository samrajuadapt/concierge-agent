import { Action } from "@ngrx/store";
import { IVariable } from "src/models/IVariable";


export const FETCH_VARIABLES = '[Variables] FETCH_VARIABLES';
export const FETCH_VARIABLES_FAIL = '[Variables] FETCH_VARIABLES_FAIL';
export const FETCH_VARIABLES_SUCCESS = '[Variables] FETCH_VARIABLES_SUCCESS';

export class FetchVariables implements Action {
    readonly type = FETCH_VARIABLES;
  }
  
  export class FetchVariablesFail implements Action {
    readonly type = FETCH_VARIABLES_FAIL;
    constructor(public payload: Object) {}
  }
  
  export class FetchVariablesSuccess implements Action {
    readonly type = FETCH_VARIABLES_SUCCESS;
    constructor(public payload: IVariable[]) {}
  }

  export type AllVariablesActions = FetchVariables |
                                FetchVariablesFail |
                                FetchVariablesSuccess;