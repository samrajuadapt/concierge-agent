
import { GlobalErrorHandler } from '../../../util/services/global-error-handler.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { IErpBranch } from 'src/models/IErpBranch';
import { ConfigServices } from '../../../util/services/config-service';

@Injectable()
export class ErpBranchDataService {
    constructor(private http: HttpClient,
        private errorHandler: GlobalErrorHandler,
        private config: ConfigServices) { }

    getErpBranches(): Observable<IErpBranch[]> {
        return this.http
            .get<IErpBranch[]>(this.config.getErpUrl())
            .pipe(catchError(this.errorHandler.handleError()));
    }
}