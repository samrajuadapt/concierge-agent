import { ICustomer } from "../../models/ICustomer";
import * as CustomerActions from '../actions'

export interface ICustomerState {
    customers: ICustomer[];
    appointmentCustomers?: ICustomer[];
    cardCustomers: ICustomer[]
    currentCustomer: ICustomer;
    searchText: string;
    loading: boolean;
    loaded: boolean;
    error: Object;
    tempCustomer: ICustomer;
    editCustomer: boolean;
}

export const initialState: ICustomerState = {
    customers: [],
    appointmentCustomers: [],
    cardCustomers: [],
    currentCustomer: null,
    searchText: '',
    loading: false,
    loaded: false,
    error: null,
    tempCustomer: null,
    editCustomer: false
};

export function reducer(
    state: ICustomerState = initialState,
    action: CustomerActions.AllCustomerActions): ICustomerState {
    switch (action.type) {
        case CustomerActions.UPDATE_CUSTOMER_SEARCH_TEXT: {
            return {
                ...state,
                searchText: action.payload,
                customers: [],
                loaded: false
            }
        };
        case CustomerActions.RESET_CUSTOMER_SEARCH_TEXT: {
            return {
                ...state,
                searchText: '',
                loaded: false
            }
        }

        case CustomerActions.SELECT_CUSTOMER: {
            return {
                ...state,
                currentCustomer: action.payload
            };
        }


        case CustomerActions.EDIT_CUSTOMER: {
            return {
                ...state,
                editCustomer: action.payload
            };
        }

        case CustomerActions.RESET_CURRENT_CUSTOMER: {
            return {
                ...state,
                currentCustomer: null
            };
        }

        case CustomerActions.FETCH_CUSTOMERS: {
            return {
                ...state,
                loading: true,
                loaded: false,
                error: null
            };
        }

        case CustomerActions.FETCH_CUSTOMERS_SUCCESS: {
            return {
                ...state,
                customers: [
                    ...action.payload
                ],
                loading: false,
                loaded: true,
                error: null,
            };
        }

        case CustomerActions.FETCH_CUSTOMERS_FAIL: {
            return {
                ...state,
                loading: false,
                loaded: false,
                error: action.payload
            };
        }

        case CustomerActions.FETCH_APPOINTMENT_CUSTOMERS: {
            return {
                ...state,
                loading: true,
                loaded: false,
                error: null,
            };
        }


        case CustomerActions.FETCH_APPOINTMENT_CUSTOMERS_SUCCESS: {
            return {
                ...state,
                appointmentCustomers: [
                    ...action.payload
                ],
                loading: false,
                loaded: true,
                error: null,
            };
        }

        case CustomerActions.FETCH_APPOINTMENT_CUSTOMERS_FAIL: {
            return {
                ...state,
                loading: false,
                loaded: false,
                error: action.payload
            };
        }

        case CustomerActions.RESET_CUSTOMERS: {
            return {
                ...state,
                customers: [],
                appointmentCustomers: [],
                loading: false,
                loaded: false
            };
        }
        case CustomerActions.SET_TEMP_CUSTOMER: {
            return {
                ...state,
                tempCustomer: action.payload
            };
        }
        case CustomerActions.RESET_TEMP_CUSTOMER: {
            return {
                ...state,
                tempCustomer: null
            };
        }

        case CustomerActions.RESET_TEMP_CUSTOMER: {
            return {
                ...state,
                tempCustomer: null
            };
        }

        case CustomerActions.FETCH_CUSTOMERS_CARD: {
            return {
                ...state,
                loading: true,
                loaded: false,
                error: null
            };
        }

        case CustomerActions.FETCH_CUSTOMERS_CARD_SUCCESS: {
            return {
                ...state,
                cardCustomers: [
                    ...action.payload
                ],
                loading: false,
                loaded: true,
                error: null,
            };
        }

        case CustomerActions.FETCH_CUSTOMERS_CARD_FAIL: {
            return {
                ...state,
                loading: false,
                loaded: false,
                error: action.payload
            };
        }

        case CustomerActions.RESET_CUSTOMERS_CARD: {
            return {
                ...state,
                cardCustomers: []
            };
        }

        default: {
            return state;
        }

    }
}

