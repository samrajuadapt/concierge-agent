import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { IAppState } from '../../reducers';
import * as CustomActions from '../../actions';

import { ICustomerType } from "src/models/ICustomerType";

@Injectable()
export class CustomerTypeDispatchers {

  constructor(private store: Store<IAppState>) { }

  fetchCustomerType() {
    this.store.dispatch(new CustomActions.FetchCustomerType)
  }

  saveCustomerType(customerType: ICustomerType) {
    this.store.dispatch(new CustomActions.SaveCustomerType(customerType))
  }

}