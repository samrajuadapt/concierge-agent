import { IErpBranch } from "src/models/IErpBranch";

import * as ErpAction from '../actions';


export interface IErpBranchState {
    erpBranches: IErpBranch[];
    loading: boolean;
    loaded: boolean;
    error: Object;
}

export const initialState: IErpBranchState = {
    erpBranches: [],
    loading: false,
    loaded: false,
    error: null
};

export function reducer(
    state: IErpBranchState = initialState,
    action: ErpAction.AllErpActions
): IErpBranchState {
    switch (action.type) {
        case ErpAction.FETCH_ERP_BRANCHES: {
            return {
                ...state,
                loading: true,
                error: null
            };
        }
        case ErpAction.FETCH_ERP_BRANCHES_SUCCESS: {
            return {
                ...state,
                erpBranches: action.payload,
                loading: false,
                loaded: true,
                error: null
            };
        }

        case ErpAction.FETCH_ERP_BRANCHES_FAIL: {
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