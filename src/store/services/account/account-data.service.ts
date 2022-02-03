import { UserRole } from './../../../models/UserPermissionsEnum';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { IAccount } from './../../../models/IAccount';
import { servicePoint, DataServiceError } from './../data.service';
import { GlobalErrorHandler } from '../../../util/services//global-error-handler.service';
import {  userRoleFactory } from 'src/helpers/user-role-factory';

const CONNECT_CONCIERGE = 'connectconcierge';
const CONCIERGE = 'concierge';
const STAFF_SUPER_ADMIN_ROLE = '*';

@Injectable()
export class AccountDataService {
  constructor(private http: HttpClient, private errorHandler: GlobalErrorHandler) { }

  getAccountInfo(): Observable<{ data: IAccount; userRole: UserRole }> {
    return this.http
      .get<IAccount>(`${servicePoint}/account`)
      .pipe(map((res: IAccount) => {

        let userRole = UserRole.None;
        userRole = userRoleFactory({modules: res.modules});
        // Remove boolean value(rtl or not) from the local
        res.locale = (res.locale && res.locale.split(':')[0]) || 'en';
        res.direction =  res.direction || 'ltr';
      //   if (res.direction == "rtl") {
      //     document.getElementsByTagName("html")[0].setAttribute("dir", "rtl");
      // }
        return { data: res, userRole };
      }))
      .pipe(catchError(this.errorHandler.handleError()));
  }
}
