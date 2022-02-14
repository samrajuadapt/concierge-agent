import { Injectable } from "@angular/core";
import { createFeatureSelector, createSelector, Store } from "@ngrx/store";
import { IEmiratesIdState } from "src/store/reducers/emirates-id.reducer";
import { IAppState } from '../../reducers';



// selectors
const getCustomState = createFeatureSelector<IEmiratesIdState>('eid');


const getEmiratesIdCustomer = createSelector(
  getCustomState,
  (state:IEmiratesIdState)=>state.emiratesIdCustomer
)


@Injectable()
export class EmiratesIdSelectors {
  constructor(private store: Store<IAppState>) {}  
  
  emiratesIdCustomer$ = this.store.select(getEmiratesIdCustomer)

}
