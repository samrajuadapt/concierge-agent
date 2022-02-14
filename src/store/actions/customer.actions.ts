import { Action } from '@ngrx/store';
import { ICustomer } from '../../models/ICustomer';


//customer actions

export const UPDATE_CUSTOMER_SEARCH_TEXT = '[Customer] UPDATE_CUSTOMER_SEARCH_TEXT';
export const RESET_CUSTOMER_SEARCH_TEXT = '[Customer] RESET_CUSTOMER_SEARCH_TEXT';
export const SELECT_CUSTOMER = '[Customer] SELECT_CUSTOMER';
export const EDIT_CUSTOMER = '[Customer] EDIT_CUSTOMER';
export const RESET_CURRENT_CUSTOMER = '[Customer] RESET_CURRENT_CUSTOMER';
export const FETCH_CUSTOMERS= '[Customer] FETCH_CUSTOMERS';
export const FETCH_CUSTOMERS_FAIL= '[Customer] FETCH_CUSTOMERS_FAIL';
export const FETCH_CUSTOMERS_SUCCESS= '[Customer] FETCH_CUSTOMERS_SUCCESS';
export const RESET_CUSTOMERS= '[Customer] RESET_CUSTOMERS';
export const CREATE_CUSTOMER= '[Customer] CREATE_CUSTOMER';
export const CREATE_CUSTOMER_FAIL= '[Customer] CREATE_CUSTOMER_FAIL';
export const CREATE_CUSTOMER_SUCCESS= '[Customer] CREATE_CUSTOMER_SUCCESS';
export const UPDATE_CUSTOMER= '[Customer] UPDATE_CUSTOMER';
export const UPDATE_CUSTOMER_FAIL= '[Customer] UPDATE_CUSTOMER_FAIL';
export const UPDATE_CUSTOMER_SUCCESS= '[Customer] UPDATE_CUSTOMER_SUCCESS';
export const SET_TEMP_CUSTOMER = '[Customer] SET_TEMP_CUSTOMER';
export const RESET_TEMP_CUSTOMER = '[Customer] RESET_TEMP_CUSTOMER';
export const UPDATE_CUSTOMER_PARTIALLY = '[Customer] UPDATE_CUSTOMER_PARTIALLY';
export const UPDATE_CUSTOMER_PARTIALLY_SUCCESS = '[Customer] UPDATE_CUSTOMER_PARTIALLY_SUCCESS';
export const UPDATE_CUSTOMER_PARTIALLY_FAIL = '[Customer] UPDATE_CUSTOMER_PARTIALLY_FAIL';

export const FETCH_APPOINTMENT_CUSTOMERS = '[Customer] FETCH_APPOINTMENT_CUSTOMERS';
export const FETCH_APPOINTMENT_CUSTOMERS_SUCCESS = '[Customer] FETCH_APPOINTMENT_CUSTOMERS_SUCCESS';
export const FETCH_APPOINTMENT_CUSTOMERS_FAIL = '[Customer] FETCH_APPOINTMENT_CUSTOMERS_FAIL';

export const FETCH_CUSTOMERS_CARD = '[Customer] FETCH_CUSTOMERS_CARD';
export const FETCH_CUSTOMERS_CARD_FAIL = '[Customer] FETCH_CUSTOMERS_CARD_FAIL';
export const FETCH_CUSTOMERS_CARD_SUCCESS = '[Customer] FETCH_CUSTOMERS_CARD_SUCCESS';
export const RESET_CUSTOMERS_CARD = '[Customer] RESET_CUSTOMERS_CARD_';

export class UpdateCustomerSearchText implements Action{
    readonly type = UPDATE_CUSTOMER_SEARCH_TEXT;
    constructor(public payload:string){}
}

export class ResetCustomerSearchText implements Action{
    readonly type = RESET_CUSTOMER_SEARCH_TEXT;
}

export class SelectCustomer implements Action{
    readonly type = SELECT_CUSTOMER;
    constructor(public payload: ICustomer) {}

}

export class EditCustomer implements Action{
    readonly type = EDIT_CUSTOMER;
    constructor(public payload: boolean) {}

}
export class ResetCurrentCustomer implements Action{
    readonly type = RESET_CURRENT_CUSTOMER
}

export class FetchCustomers implements Action{
    readonly type = FETCH_CUSTOMERS;
    constructor(public payload:string){}
}

export class FetchCustomersFail implements Action{
    readonly type = FETCH_CUSTOMERS_FAIL;
    constructor(public payload:Object){}
}

export class FetchCustomersSuccess implements Action{
    readonly type = FETCH_CUSTOMERS_SUCCESS;
    constructor (public payload:ICustomer[]){}
}

export class FetchAppointmentCustomers implements Action{
    readonly type = FETCH_APPOINTMENT_CUSTOMERS;
    constructor(public payload:string){}
}

export class FetchAppointmentCustomersFail implements Action{
    readonly type = FETCH_APPOINTMENT_CUSTOMERS_FAIL;
    constructor(public payload:Object){}
}

export class FetchAppointmentCustomersSuccess implements Action{
    readonly type = FETCH_APPOINTMENT_CUSTOMERS_SUCCESS;
    constructor (public payload:ICustomer[]){}
}

export class ResetCustomers implements Action{
    readonly type= RESET_CUSTOMERS;
}

export class CreateCustomer implements Action{
    readonly type = CREATE_CUSTOMER;
    constructor (public payload:ICustomer){}
}
export class CreateCustomerFail implements Action{
    readonly type = CREATE_CUSTOMER_FAIL;
    constructor (public payload:object){}
}
export class CreateCustomerSuccess implements Action{
    readonly type = CREATE_CUSTOMER_SUCCESS;
    constructor(public payload:ICustomer){}
}
export class UpdateCustomer implements Action{
    readonly type = UPDATE_CUSTOMER;
    constructor (public payload:ICustomer){}
}
export class  UpdateCustomerFail implements Action{
    readonly type = UPDATE_CUSTOMER_FAIL;
    constructor (public payload:object){}
}
export class UpdateCUstomerSuccess implements Action{
    readonly type = UPDATE_CUSTOMER_SUCCESS;
    constructor (public payload:ICustomer){}
}

export class SetTempCustomer implements Action{
    readonly type = SET_TEMP_CUSTOMER;
    constructor(public payload: ICustomer) {}
}

export class ResetTempCustomer implements Action{
    readonly type = RESET_TEMP_CUSTOMER;
}

export class UpdateCustomerPartially implements Action{
    readonly type = UPDATE_CUSTOMER_PARTIALLY;
    constructor (public payload:ICustomer){}
}
export class  UpdateCustomerPartiallyFail implements Action{
    readonly type = UPDATE_CUSTOMER_PARTIALLY_FAIL;
    constructor (public payload:object){}
}
export class UpdateCUstomerPartiallySuccess implements Action{
    readonly type = UPDATE_CUSTOMER_PARTIALLY_SUCCESS;
    constructor (public payload:ICustomer){}
}

export class FetchCustomersCard implements Action {
    readonly type = FETCH_CUSTOMERS_CARD;
    constructor(public payload: string) { }
  }
  export class FetchCustomersCardFail implements Action {
    readonly type = FETCH_CUSTOMERS_CARD_FAIL;
    constructor(public payload: Object) { }
  }
  
  export class FetchCustomersCardSuccess implements Action {
    readonly type = FETCH_CUSTOMERS_CARD_SUCCESS;
    constructor(public payload: ICustomer[]) { }
  }
  
  export class ResetCustomersCard implements Action {
    readonly type = RESET_CUSTOMERS_CARD;
  }


export type AllCustomerActions = UpdateCustomerSearchText | ResetCustomerSearchText |SelectCustomer|EditCustomer |ResetCurrentCustomer
            |FetchCustomers|FetchCustomersFail|FetchCustomersSuccess | ResetCustomers| CreateCustomer | CreateCustomerFail | CreateCustomerSuccess
            |UpdateCustomer|UpdateCustomerFail|UpdateCUstomerSuccess
            | SetTempCustomer | ResetTempCustomer
            |FetchAppointmentCustomers | FetchAppointmentCustomersSuccess | FetchAppointmentCustomersFail
            | UpdateCustomerPartially
            | UpdateCustomerPartiallyFail
            | UpdateCUstomerPartiallySuccess
            | FetchCustomersCard
    | FetchCustomersCardSuccess
    | FetchCustomersCardFail
    |ResetCustomersCard ;
