import { Injectable } from "@angular/core";
import { IAppState } from '../../reducers';
import { createFeatureSelector, createSelector, Store } from "@ngrx/store";
import { ICustoemrTypeState } from "src/store/reducers/customer-type.reducer";


const getCustomerTypeState = createFeatureSelector<ICustoemrTypeState>('customerType');


const getCustomerType = createSelector(
    getCustomerTypeState,
    (state:ICustoemrTypeState)=>state.customerTypes
  );


  const getCurrentCustomerType = createSelector(
    getCustomerTypeState,
    (state:ICustoemrTypeState)=>state.currentCustomerType
  );


  const getCustomerCount = createSelector(
    getCustomerTypeState,
    (state:ICustoemrTypeState)=>state.customerCount
  )
  

@Injectable()
export class CustomerTypeSelectors {
  constructor(private store: Store<IAppState>) {}  

  customerType$ = this.store.select(getCustomerType)
  customerCount$ = this.store.select(getCustomerCount)
  currentCustomerType$ = this.store.select(getCurrentCustomerType)

}