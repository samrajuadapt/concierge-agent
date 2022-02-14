import { GlobalErrorHandler } from '../../../util/services/global-error-handler.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigServices } from '../../../util/services/config-service';

import { ToastService } from "../../../util/services/toast.service";
import { TranslateService } from "../../../../node_modules/@ngx-translate/core";
import { IEidCustomer } from 'src/models/IEidCustomer';


@Injectable()
export class EmiratesIdDataService {

    constructor(private http: HttpClient,
        private errorHandler: GlobalErrorHandler,
        private config: ConfigServices,
        private toastService: ToastService,
        private translateService: TranslateService) {

    }

    getEidData(): Observable<IEidCustomer> {
        return this.http
            .get<IEidCustomer>(this.config.getEidUrl())
            .pipe(catchError(this.errorHandler.handleError()));
    }
}