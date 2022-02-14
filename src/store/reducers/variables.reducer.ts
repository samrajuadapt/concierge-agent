
import { IVariable } from 'src/models/IVariable';
import * as VariablesAction from '../actions';

export interface IVariablesState {
    variables: IVariable[];
    loading: boolean;
    loaded: boolean;
    error: Object;
  }
  
  export const initialState: IVariablesState = {
    variables: [],
    loading: false,
    loaded: false,
    error: null
  };
  
  export function reducer (
    state: IVariablesState = initialState,
    action: VariablesAction.AllVariablesActions
  ): IVariablesState {
    switch (action.type) {
      case VariablesAction.FETCH_VARIABLES: {
        return {
          ...state,
          loading: true,
          error: null
        };
      }
      case VariablesAction.FETCH_VARIABLES_SUCCESS: {
        return {
          ...state,
          variables: action.payload,
          loading: false,
          loaded: true,
          error: null
        };
      }
  
      case VariablesAction.FETCH_VARIABLES_FAIL: {
        return {
          ...state,
          loading: false,
          error: action.payload
        };
      }
      default: {
        return state;
      }
    }
  }
  
  