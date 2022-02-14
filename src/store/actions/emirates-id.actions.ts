import { Action } from "@ngrx/store";
import { IEidCustomer } from "src/models/IEidCustomer";

export const FETCH_EMIRATES_ID = '[Eid] FETCH_EMIRATES_ID';
export const FETCH_EMIRATES_ID_FAIL = '[Eid] FETCH_EMIRATES_ID_FAIL';
export const FETCH_EMIRATES_ID_SUCCESS = '[Eid] FETCH_EMIRATES_ID_SUCCESS';
export const RESET_EMIRATES_ID = '[Eid] RESET_EMIRATES_ID';

export class FetchEmiratesId implements Action {
    readonly type = FETCH_EMIRATES_ID
}
export class FetchEmiratesIdSucess implements Action {
    readonly type = FETCH_EMIRATES_ID_SUCCESS
    constructor(public payload: IEidCustomer) { }
}
export class FetchEmiratesIdFail implements Action {
    readonly type = FETCH_EMIRATES_ID_FAIL
    constructor(public payload: Object) { }
}

export class ResetEmiratesId implements Action {
    readonly type = RESET_EMIRATES_ID;
}

export type EmiratesIdActions = FetchEmiratesId |
    FetchEmiratesIdSucess |
    FetchEmiratesIdFail
    | ResetEmiratesId;