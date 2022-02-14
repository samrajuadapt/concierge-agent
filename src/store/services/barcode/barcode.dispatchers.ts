import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { IAppState } from '../../reducers';

import * as Actions from '../../actions';
import { IBarcode } from 'src/models/IBarcode';

@Injectable()
export class BarcodeDispatchers {
  constructor(private store: Store<IAppState>) {}

  saveBarcode(barcode:IBarcode) {
    this.store.dispatch(new Actions.SaveBarcode(barcode));
  }

  
}
