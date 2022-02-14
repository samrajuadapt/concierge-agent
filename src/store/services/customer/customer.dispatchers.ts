import { Injectable } from "@angular/core";
import { IAppState } from "../../reducers";
import { Store } from "@ngrx/store"
import * as CustomerAction from '../../actions'
import { ICustomer } from "../../../models/ICustomer"

@Injectable()
export class CustomerDispatchers {
    constructor(private store: Store<IAppState>) { }

    fetchCustomers(searchText: string) {
        this.store.dispatch(new CustomerAction.FetchCustomers(searchText));
    }

    fetchAppointmentCustomers(searchText: string) {
        this.store.dispatch(new CustomerAction.FetchAppointmentCustomers(searchText));
    }

    resetCustomers() {
        this.store.dispatch(new CustomerAction.ResetCustomers);
    }

    selectCustomer(customer: ICustomer) {
        this.store.dispatch(new CustomerAction.SelectCustomer(customer));
    }
    editCustomerMode(state: boolean) {
        this.store.dispatch(new CustomerAction.EditCustomer(state));
    }

    createCustomer(customer: ICustomer) {
        this.store.dispatch(new CustomerAction.CreateCustomer(customer));
    }

    updateCustomer(customer: ICustomer) {
        this.store.dispatch(new CustomerAction.UpdateCustomer(customer));
    }

    resetCurrentCustomer() {
        this.store.dispatch(new CustomerAction.ResetCurrentCustomer);

    }

    updateCustomerSearchText(searchText: string) {
        this.store.dispatch(new CustomerAction.UpdateCustomerSearchText(searchText));
    }

    resetCustomerSearchText() {
        this.store.dispatch(new CustomerAction.ResetCustomerSearchText);
    }

    setTempCustomers(customer: ICustomer) {
        this.store.dispatch(new CustomerAction.SetTempCustomer(customer));
    }

    resetTempCustomer() {
        this.store.dispatch(new CustomerAction.ResetTempCustomer());
    }

    updateCustomerPartially(customer: ICustomer) {
        this.store.dispatch(new CustomerAction.UpdateCustomerPartially(customer));
    }

    fetchCustomersByCard(cardNumber: string) {
        this.store.dispatch(new CustomerAction.FetchCustomersCard(cardNumber));
    }
    resetCustomerCard() {
        this.store.dispatch(new CustomerAction.ResetCustomersCard);
    }

}

