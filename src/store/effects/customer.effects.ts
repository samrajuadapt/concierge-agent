import { Injectable } from "@angular/core";
import { Action } from '@ngrx/store/src/models';;
import { CustomerDataService } from "../services/customer/customer-data.service";
import { ToastService } from "../../util/services/toast.service";
import { TranslateService } from "@ngx-translate/core";
import { GlobalErrorHandler } from "../../util/services/global-error-handler.service";
import { Effect,Actions, ofType } from "@ngrx/effects";
import { Observable, Subscription } from 'rxjs';
import * as CustomerActions from './../actions'
import { switchMap,tap } from "../../../node_modules/rxjs/operators";
import { AdvancedSearchCompatible } from '../../util/compatible-helper';
import { SystemInfoSelectors } from '../services/system-info'
import { BLOCKED_ERROR_CODES } from "src/app/shared/error-codes";

const toAction = CustomerActions.toAction();
var isAdvanceSearchEnable = true;
@Injectable()
export class CustomerEffects{
  private subscriptions: Subscription = new Subscription();
    constructor( 
        private actions$ : Actions,
        private customerDataService:CustomerDataService,
        private systemInfoSelectors: SystemInfoSelectors,
        private toastService: ToastService,
        private translateService: TranslateService,
    ){
      const productVersionSubscription = systemInfoSelectors.systemInfoProductVersion$.subscribe(
        (version: string) => {
          isAdvanceSearchEnable = AdvancedSearchCompatible(version);
        }
      );
      this.subscriptions.add(productVersionSubscription);
    }

    @Effect()
    getCustomers$: Observable<Action> = this.actions$
      .pipe(
        ofType(CustomerActions.FETCH_CUSTOMERS),
        switchMap((action: CustomerActions.FetchCustomers) => {
            return toAction(
              isAdvanceSearchEnable ? this.customerDataService.getCustomersAdvanced(action.payload) : this.customerDataService.getCustomers(action.payload),
              CustomerActions.FetchCustomersSuccess,
              CustomerActions.FetchCustomersFail
            );
          }
        )
      );

      @Effect({ dispatch: false })
      getCustomersFailed$: Observable<Action> = this.actions$
      .pipe(
        ofType(CustomerActions.FETCH_CUSTOMERS_FAIL),
        tap((action: CustomerActions.FetchCustomersFail) => {
          if ((action.payload['errorCode'] == BLOCKED_ERROR_CODES.ERROR_CODE_INVALID_SEARCH_PARAMETER)) {
            this.translateService.get('label.customerSearch.results.error').subscribe(
              (label: string) => {
                this.toastService.errorToast(label);
              }
            ).unsubscribe();
          }
        }
        )
      );

      @Effect()
      getAppointmentCustomers$: Observable<Action> = this.actions$
        .pipe(
          ofType(CustomerActions.FETCH_APPOINTMENT_CUSTOMERS),
          switchMap((action: CustomerActions.FetchCustomers) => {
              return toAction(
                isAdvanceSearchEnable ? this.customerDataService.getCustomersAdvanced(action.payload) : this.customerDataService.getAppointmentCustomers(action.payload),
                CustomerActions.FetchAppointmentCustomersSuccess,
                CustomerActions.FetchAppointmentCustomersFail
              );
            }
          )
        );
    
      @Effect()
      createCustomer$: Observable<Action> = this.actions$
        .pipe(
          ofType(CustomerActions.CREATE_CUSTOMER),
          switchMap((action: CustomerActions.CreateCustomer) => {
              return toAction(
                this.customerDataService.createCustomer(action.payload),
                CustomerActions.CreateCustomerSuccess,
                CustomerActions.CreateCustomerFail
              );
            }
          )
        );
    
        @Effect()
        selectCustomerAfterCreation$: Observable<Action> = this.actions$
          .pipe(
            ofType(CustomerActions.CREATE_CUSTOMER_SUCCESS),
            switchMap((action:CustomerActions.CreateCustomerSuccess)=>
            [new CustomerActions.SelectCustomer(action.payload)]
          ));
        
        @Effect({dispatch:false})
        createCustomerFailed$: Observable<Action> = this.actions$
            .pipe(
              ofType(CustomerActions.CREATE_CUSTOMER_FAIL)
            )
        
        @Effect()
        updateCustomer$:Observable<Action> = this.actions$
        .pipe(
          ofType(CustomerActions.UPDATE_CUSTOMER),
            switchMap((action:CustomerActions.UpdateCustomer)=>{
                return toAction(
                    this.customerDataService.updateCustomer(action.payload),
                    CustomerActions.UpdateCUstomerSuccess,
                    CustomerActions.UpdateCustomerFail
                )
            })
        );

        @Effect()
        selectCustomerAfterUpdate$: Observable<Action> = this.actions$
        .pipe(
          ofType(CustomerActions.UPDATE_CUSTOMER_SUCCESS),
        switchMap((action:CustomerActions.UpdateCUstomerSuccess)=>
        []
        )
        );

  
        @Effect({dispatch:false})
        updateCustomerFailed$: Observable<Action> = this.actions$
        .pipe(
          ofType(CustomerActions.UPDATE_CUSTOMER_FAIL)
        );

        @Effect()
        updateCustomerPartailly$:Observable<Action> = this.actions$
        .pipe(
          ofType(CustomerActions.UPDATE_CUSTOMER_PARTIALLY),
            switchMap((action:CustomerActions.UpdateCustomerPartially)=>{
                return toAction(
                    this.customerDataService.updateCustomer(action.payload),
                    CustomerActions.UpdateCUstomerPartiallySuccess,
                    CustomerActions.UpdateCustomerPartiallyFail
                )
            })
        );

        @Effect()
        getCustomersCard$: Observable<Action> = this.actions$
          .pipe(
            ofType(CustomerActions.FETCH_CUSTOMERS_CARD),
            switchMap((action: CustomerActions.FetchCustomersCard) => {
                return toAction(
                  this.customerDataService.getCustomersByCard(action.payload),
                  CustomerActions.FetchCustomersCardSuccess,
                  CustomerActions.FetchCustomersCardFail
                );
              }
            )
          );

       
}