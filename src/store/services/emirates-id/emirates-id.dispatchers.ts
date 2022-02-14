import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";

import { IAppState } from '../../reducers';
import * as CustomActions from '../../actions';


@Injectable()
export class EmiratesIdDispatchers{
    constructor(private store: Store<IAppState>) { }

  fetchEmiratesId() {
    this.store.dispatch(new CustomActions.FetchEmiratesId)
  }
  resetEmirateId(){
    this.store.dispatch(new CustomActions.ResetEmiratesId);
  }
}