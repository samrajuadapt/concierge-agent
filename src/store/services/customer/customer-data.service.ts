import { Injectable } from "../../../../node_modules/@angular/core";
import { HttpClient } from "@angular/common/http";
import { GlobalErrorHandler } from "../../../util/services/global-error-handler.service";
import { Observable, throwError, empty } from "../../../../node_modules/rxjs";
import { catchError } from "../../../../node_modules/rxjs/operators";
import { ICustomer } from "../../../models/ICustomer";
import { servicePoint, restEndpoint, DataServiceError } from '../data.service';
import { ToastService } from "../../../util/services/toast.service";
import { TranslateService } from "../../../../node_modules/@ngx-translate/core";
import { Injectable as Injectable_1 } from "@angular/core";

@Injectable_1()
@Injectable()
export class CustomerDataService{
    constructor(private http: HttpClient, private errorHandler: GlobalErrorHandler,
                private toastService: ToastService, private translateService: TranslateService){}

    getCustomers(searchText: string): Observable<ICustomer[]>{
         return this.http
        .get<ICustomer[]>(`${servicePoint}/customers/search?text=${encodeURIComponent(searchText)}`)
        .pipe(catchError(
            err => {
         const errorKey =  'no_central_access';
                const error = new DataServiceError(err, null);
                if (error.errorCode === "3123") {
                  //  this.toastService.errorToast("There is no WebSocket connection for requested name [null]");
                    this.translateService.get([errorKey],{}).subscribe(
                        (msgs: string[]) => {
                            this.toastService.errorToast(msgs[errorKey]);
                        }
                        ).unsubscribe();

                    this.errorHandler.handleError();
                    return empty();
                } else {
                    this.errorHandler.handleError();
                }
            }
        ));
    }

    getCustomersAdvanced(searchText: string): Observable<[ICustomer]> {
        if (searchText.indexOf('+') > -1) {
          searchText = encodeURIComponent(searchText);
        }
        let searchOption = /\s/g.test(searchText) ? 'CONTAINS' : 'STARTS_WITH';
        return this.http
          .get<[ICustomer]>(`${servicePoint}/customers/advancedSearch?text=${searchText}&option=${searchOption}`)
          .pipe(catchError(this.errorHandler.handleError()));
      }

    getAppointmentCustomers(searchText:string):Observable<ICustomer[]>{
        return this.http
       .get<ICustomer[]>(`${restEndpoint}/appointment/customers/search?text=${encodeURIComponent(searchText)}`)        
       .pipe(catchError(this.errorHandler.handleError()));
   }

    createCustomer(customer:ICustomer):Observable<ICustomer>{
        return this.http
        .post<ICustomer>(`${servicePoint}/customers`,customer)
        .pipe(
            catchError(this.errorHandler.handleError())
        );
    }

    updateCustomer(customer : ICustomer):Observable<ICustomer>{
        return this.http
        .put<ICustomer>(`${servicePoint}/customers/${customer.id}`,customer)
        .pipe(
            catchError(this.errorHandler.handleError())
        );
    }

    getCustomersByCard(cardNumber: string): Observable<ICustomer[]> {
        return this.http
          .get<ICustomer[]>(`${servicePoint}/customers;cardNumber=${encodeURIComponent(cardNumber)}`)
          .pipe(catchError(
            err => {
              const errorKey = 'no_central_access';
              const error = new DataServiceError(err, null);
              if (error.errorCode === "3123") {
                //  this.toastService.errorToast("There is no WebSocket connection for requested name [null]");
                this.translateService.get([errorKey], {}).subscribe(
                  (msgs: string[]) => {
                    this.toastService.errorToast(msgs[errorKey]);
                  }
                ).unsubscribe();
    
                this.errorHandler.handleError();
                return empty();
              } else {
                this.errorHandler.handleError();
              }
            }
          ));
      }

}