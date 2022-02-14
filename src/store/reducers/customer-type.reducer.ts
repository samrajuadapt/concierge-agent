import { ICustomerType } from "src/models/ICustomerType";

import * as CustoemrTypeActions from '../actions';


export interface ICustoemrTypeState {
    customerTypes: ICustomerType[];
    currentCustomerType: ICustomerType;
    loading: boolean;
    loaded: boolean;
    error: Object;
}

export const initialState: ICustoemrTypeState = {
    customerTypes: [],
    currentCustomerType: null,
    loading: false,
    loaded: false,
    error: null
};


export function reducer(
    state: ICustoemrTypeState = initialState,
    action: CustoemrTypeActions.AllCustomerTypeActions
): ICustoemrTypeState {
    switch (action.type) {
        case CustoemrTypeActions.FETCH_CUSTOMER_TYPE: {
            return {
                ...state,
                loading: true,
                error: null
            };
        }
        case CustoemrTypeActions.FETCH_CUSTOMER_TYPE_SUCCESS: {
            return {
                ...state,
                customerTypes: action.payload,
                loading: false,
                loaded: true,
                error: null
            };
        }

        case CustoemrTypeActions.FETCH_CUSTOMER_TYPE_FAIL: {
            return {
                ...state,
                loading: false,
                error: action.payload
            };
        }

        case CustoemrTypeActions.SAVE_CUSTOMER_TYPE: {
            return {
                ...state,
                currentCustomerType: action.payload
            }
        }

        default: {
            return state;
        }
    }
}