import { Action } from '@ngrx/store';
import { IBarcode } from 'src/models/IBarcode';

export const SAVE_BARCODE = '[Barcode] SAVE_BARCODE';

export class SaveBarcode implements Action {
    readonly type = SAVE_BARCODE;
    constructor(public payload: IBarcode) {}
}