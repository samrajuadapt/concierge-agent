
import { IBarcode } from 'src/models/IBarcode';
import * as AllNotections from '../actions';

const initialState: IBarcodeState = {
    barcode:{value:'',requird:false}
};
export interface IBarcodeState {
    barcode:IBarcode
}

export function reducer(state: IBarcodeState = initialState, action: AllNotections.SaveBarcode): IBarcodeState {
    switch (action.type) {
        case AllNotections.SAVE_BARCODE: {
            return {
                ...state,
                barcode:action.payload

            };
        }

        default: {
            return state;
        }
    }
}