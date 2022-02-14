import { Action } from "@ngrx/store";
import { IErpBranch } from "src/models/IErpBranch";

export const FETCH_ERP_BRANCHES = '[Erp] FETCH_ERP_BRANCHES';
export const FETCH_ERP_BRANCHES_FAIL = '[Erp] FETCH_ERP_BRANCHES_FAIL';
export const FETCH_ERP_BRANCHES_SUCCESS = '[Erp] FETCH_ERP_BRANCHES_SUCCESS';



export class FetchErpBranches implements Action {
    readonly type = FETCH_ERP_BRANCHES;
}

export class FetchErpBranchesFail implements Action {
    readonly type = FETCH_ERP_BRANCHES_FAIL;
    constructor(public payload: Object) { }
}

export class FetchErpBranchesSuccess implements Action {
    readonly type = FETCH_ERP_BRANCHES_SUCCESS;
    constructor(public payload: IErpBranch[]) { }
}

export type AllErpActions = FetchErpBranches |
    FetchErpBranchesFail |
    FetchErpBranchesSuccess;