import { Injectable } from '@angular/core';
import { Store,createSelector,createFeatureSelector } from '@ngrx/store';
import { IBarcodeState } from 'src/store/reducers/barcode.reducer';

import { IAppState } from '../../reducers';

// selectors

const getBarcodeState = createFeatureSelector<IBarcodeState>(
  'barcode'
);


const getBarcode = createSelector(
  getBarcodeState,
  (state: IBarcodeState) => state.barcode
);



@Injectable()
export class BarcodeSelectors {
  constructor(private store: Store<IAppState>) {}
  // selectors$
 
  barcode$ = this.store.select(getBarcode);
}
