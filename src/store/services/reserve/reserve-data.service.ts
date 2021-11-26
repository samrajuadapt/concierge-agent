import { IBookingInformation } from './../../../models/IBookingInformation';
import { GlobalErrorHandler } from './../../../util/services/global-error-handler.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';

import {
  calendarPublicEndpointV2,
  calendarPublicEndpoint,
  DataServiceError
} from '../data.service';

import { IAppointment } from '../../../models/IAppointment';
import { SystemInfoSelectors } from '../system-info';
import { ICalendarService } from '../../../models/ICalendarService';
import { ServicePointSelectors } from '../../../store/services/service-point/service-point.selectors';


@Injectable()
export class ReserveDataService {
  hostAddress: string;
  private duplicateServices: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(private http: HttpClient, 
    private errorHandler: GlobalErrorHandler, 
    private systemInfoSelector: SystemInfoSelectors,
    private servicePointSelectors: ServicePointSelectors) {

    const hostSubscription = this.systemInfoSelector.centralHostAddress$.subscribe((info) => this.hostAddress = info);
    this.subscriptions.add(hostSubscription);

    
    const uttSubscription = this.servicePointSelectors.uttParameters$.subscribe(
      uttParameters => {
        if (uttParameters) {
          this.duplicateServices = uttParameters.duplicateServices;
        }
      }
    );
    this.subscriptions.add(uttSubscription);

  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  reserveAppointment(
    bookingInformation: IBookingInformation,
    appointment: IAppointment
  ): Observable<IAppointment> {

    let services = 
    appointment.services.map(x => Object.assign({}, x));
    services = services.map((service)=> {
      delete service.adult;
      delete service.showMoreActionsMostFrequent
      delete service.showMoreActions
      delete service.child;
      return service
    })
    let Customparameters = {"services":services}
    return this.http
      .post<IAppointment>(
        `${this.hostAddress}${calendarPublicEndpointV2}`
        + `/branches/${bookingInformation.branchPublicId}`
        + `/dates/${bookingInformation.date}`
        + `/times/${bookingInformation.time}/reserve;`
        + `numberOfCustomers=${bookingInformation.numberOfCustomers}`, Customparameters
      )
      .pipe(catchError(this.errorHandler.handleError(true, { bookingInformation, Customparameters })));
  }

  reserveAppointmentByVisitors(
    bookingInformation: IBookingInformation,
    appointment: IAppointment
  ): Observable<IAppointment> {

    let serviceViseVisitors = 
    appointment.services.map(x => Object.assign({}, x));
    serviceViseVisitors = serviceViseVisitors.map((service)=> {
      delete service.additionalCustomerDuration;
      delete service.duration;
      delete service.showMoreActionsMostFrequent
      delete service.showMoreActions
      delete service.custom;
      return service
    })

    if (this.duplicateServices) {
      var modifiedServices:ICalendarService[] = appointment.services.map(x => Object.assign({}, x));;
      for (var service of appointment.services) {
        if (service.adult + service.child > 1) {
          for (let i = 1; i < service.adult + service.child; i++) { 
            modifiedServices.push(service);
          }
        }
      }
      appointment.services = modifiedServices;
    }

    let services = 
    appointment.services.map(x => Object.assign({}, x));
    services = services.map((service)=> {
      delete service.adult;
      delete service.showMoreActionsMostFrequent
      delete service.showMoreActions
      delete service.child;
      return service
    })

    let Customparameters = {"services":services, "custom": `{\"peopleServices\": ${JSON.stringify(serviceViseVisitors)}`}
    return this.http
      .post<IAppointment>(
        `${this.hostAddress}${calendarPublicEndpointV2}`
        + `/branches/${bookingInformation.branchPublicId}`
        + `/dates/${bookingInformation.date}`
        + `/times/${bookingInformation.time}/reserve;`
        + `customSlotLength=${bookingInformation.customSlotLength}`, Customparameters
      )
      .pipe(catchError(this.errorHandler.handleError(true, { bookingInformation, Customparameters })));
  }

  unreserveAppointment(reservationPublicId: string) {
    return this.http
      .delete<IAppointment>(`${this.hostAddress}${calendarPublicEndpoint}/appointments/${reservationPublicId}`)
      .pipe(catchError(this.errorHandler.handleError(true)));
  }

  removerreserveAppointment(reservationPublicId: string) {
    return this.http
      .delete<IAppointment>(`${this.hostAddress}${calendarPublicEndpoint}/appointments/${reservationPublicId}`)
      .pipe(catchError(this.errorHandler.handleError()));
  }

  fetchReservableDates(bookingInformation: IBookingInformation): any {
    return this.http
      .get<IAppointment>(
        `${this.hostAddress}${calendarPublicEndpointV2}`
        + `/branches/${bookingInformation.branchPublicId}/`
        + `dates;`
        + `${bookingInformation.serviceQuery};`
        + `numberOfCustomers=${bookingInformation.numberOfCustomers}`
      )
      .pipe(catchError(this.errorHandler.handleError(true)));
  }

  fetchReservableDatesByVisitors(bookingInformation: IBookingInformation): any {
    return this.http
      .get<IAppointment>(
        `${this.hostAddress}${calendarPublicEndpointV2}`
        + `/branches/${bookingInformation.branchPublicId}/`
        + `dates;`
        + `${bookingInformation.serviceQuery};`
        + `customSlotLength=${bookingInformation.customSlotLength}`
      )
      .pipe(catchError(this.errorHandler.handleError(true)));
  }

  
}

