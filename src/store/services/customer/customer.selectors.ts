import { Injectable } from "@angular/core";
import { Store, createFeatureSelector, createSelector } from "@ngrx/store";
import { IAppState } from "../../reducers";
import { ICustomerState } from "../../reducers/customer.reducer";

//selectors
const getCustomerState = createFeatureSelector<ICustomerState>('customers');

const getAllCustomers = createSelector(
    getCustomerState,
    (state:ICustomerState)=> state.customers
);

export const getCurrentCustomer= createSelector(
    getCustomerState,
    (state:ICustomerState)=> state.currentCustomer
)

export const getAppointmentSearchCustomers= createSelector(
    getCustomerState,
    (state:ICustomerState) => state.appointmentCustomers
)

export const getEditCustomer= createSelector(
    getCustomerState,
    (state:ICustomerState)=> state.editCustomer
)


const getSearchText = createSelector(
    getCustomerState,
    (state: ICustomerState) => state.searchText
);

const getCustomersLoading = createSelector(
    getCustomerState,
    (state:ICustomerState)=> state.loading
);

const getCustomersLoaded = createSelector(
    getCustomerState,
    (state:ICustomerState)=> state.loaded
);

export const getTempCustomer= createSelector(
    getCustomerState,
    (state:ICustomerState)=> state.tempCustomer
)

const getAllCardCustomers = createSelector(
    getCustomerState,
    (state:ICustomerState)=> state.cardCustomers
  );

@Injectable()
export class CustomerSelector{
    constructor(private store: Store<IAppState>){}
    //selectors$
    customer$ = this.store.select(getAllCustomers);
    customerLoading$ = this.store.select(getCustomersLoading);
    customerLoaded$ = this.store.select(getCustomersLoaded);
    currentCustomer$ = this.store.select(getCurrentCustomer);
    editCustomerMode$ = this.store.select(getEditCustomer);
    searchText$ = this.store.select(getSearchText);
    tempCustomer$ = this.store.select(getTempCustomer);
    appointmentSearchCustomers$ = this.store.select(getAppointmentSearchCustomers);
    cardCustomer$ = this.store.select(getAllCardCustomers);
}