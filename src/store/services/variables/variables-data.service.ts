
import { GlobalErrorHandler } from '../../../util/services/global-error-handler.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { restEndpoint } from '../data.service';
import { IVariable } from 'src/models/IVariable';

@Injectable()
export class VariablesDataService {
  constructor(private http: HttpClient, private errorHandler: GlobalErrorHandler) { }

  getVariables(): Observable<any[]> {
    return this.http
      .get<IVariable[]>(`${restEndpoint}/entrypoint/variables`)
      .pipe(catchError(this.errorHandler.handleError()));
  }
}