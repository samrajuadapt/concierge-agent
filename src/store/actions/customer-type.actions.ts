import { Action } from "@ngrx/store";
import { ICustomerType } from "src/models/ICustomerType";

export const FETCH_CUSTOMER_TYPE = '[CustomerType] FETCH_FETCH_CUSTOMER_TYPE';
export const FETCH_CUSTOMER_TYPE_FAIL = '[CustomerType] FETCH_CUSTOMER_TYPE_FAIL';
export const FETCH_CUSTOMER_TYPE_SUCCESS = '[CustomerType] FETCH_CUSTOMER_TYPE_SUCCESS';

export const SAVE_CUSTOMER_TYPE = '[CustomerType] SAVE_CUSTOMER_TYPE';
export const RESET_CUSTOMER_TYPE = '[CustomerType] RESET_CUSTOMER_TYPE';

export class FetchCustomerType implements Action {
    readonly type = FETCH_CUSTOMER_TYPE;
}

export class FetchCustomerTypeFail implements Action {
    readonly type = FETCH_CUSTOMER_TYPE_FAIL;
    constructor(public payload: Object) { }
}

export class FetchCustomerTypeSuccess implements Action {
    readonly type = FETCH_CUSTOMER_TYPE_SUCCESS;
    constructor(public payload: ICustomerType[]) { }
}

export class SaveCustomerType implements Action {
    readonly type = SAVE_CUSTOMER_TYPE;
    constructor(public payload: ICustomerType) { }
}

export class ResetCustomerType implements Action {
    readonly type = RESET_CUSTOMER_TYPE;
}


export type AllCustomerTypeActions = FetchCustomerType
    | FetchCustomerTypeSuccess
    | FetchCustomerTypeFail
    | SaveCustomerType
    | ResetCustomerType;