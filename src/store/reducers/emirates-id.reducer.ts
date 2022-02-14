import { IEidCustomer } from "src/models/IEidCustomer";


import * as CustomActions from '../actions';

export interface IEmiratesIdState {
    emiratesIdCustomer: IEidCustomer;
    loading: boolean;
    loaded: boolean;
    error: Object;
  }
  
  export const initialState: IEmiratesIdState = {
    emiratesIdCustomer: {},
    loading: false,
    loaded: false,
    error: null
  };

  export function reducer(
    state: IEmiratesIdState = initialState,
    action: CustomActions.EmiratesIdActions
  ): IEmiratesIdState {
    switch (action.type) {
      case CustomActions.FETCH_EMIRATES_ID: {
        return {
          ...state,
          loading: true,
          error: null
        };
      }
      case CustomActions.FETCH_EMIRATES_ID_SUCCESS: {
        return {
          ...state,
          emiratesIdCustomer: action.payload,
          loading: false,
          loaded: true,
          error: null
        };
      }
  
      case CustomActions.FETCH_EMIRATES_ID_FAIL: {
        return {
          ...state,
          loading: false,
          error: action.payload
        };
      }
  
      case CustomActions.RESET_EMIRATES_ID: {
        return {
          ...state,
          emiratesIdCustomer: {}
        };
      }
  
  
      default: {
        return state;
      }
    }
  }
  