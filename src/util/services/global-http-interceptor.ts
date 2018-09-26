import { filter } from 'rxjs/internal/operators/filter';
import { NativeApiService } from './native-api.service';
import { ERROR_CODE_TIMEOUT } from './../../app/shared/error-codes';
import { GlobalNotifyDispatchers } from './../../store/services/global-notify/global-notify.dispatchers';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, interval, of } from 'rxjs';
import { tap, catchError, flatMap, retry, map } from 'rxjs/operators';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { from } from 'rxjs/internal/observable/from';
import { retryWhen } from 'rxjs/internal/operators/retryWhen';
import { BLOCKED_URLS } from 'src/util/url-helper';
import { ServiceStateService } from 'src/app/service-state.service';
import { TranslateService } from '@ngx-translate/core';
import { NativeApiSelectors } from 'src/store';
import { timeout } from 'rxjs/internal/operators/timeout';
import { timeoutWith } from 'rxjs/internal/operators/timeoutWith';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';

@Injectable()
export class QmGlobalHttpInterceptor implements HttpInterceptor {

    private localTimeoutBeforeStartPingValue = 3000;
    private localTimeoutBeforeStartPing;
    private native_ping_period = 5000;
    private http_timeout = 5000;
    private native_max_ping_count_for_message = 2;
    private lastRequestAction = 'NONE';
    private isPingStarted = false;
    // Retry all get requests this many times before starting ping.
    private numberOfGetRetry = 3;

    constructor(private globalNotifyDispatchers: GlobalNotifyDispatchers, private serviceState: ServiceStateService,
        private translateService: TranslateService, private nativeApiService: NativeApiService) {

        window["globalNotifyDispatchers"] = this.globalNotifyDispatchers;
        window["qmGlobalHttpInterceptor"] = this;
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (
            ((this.isABlockedUrl(req.url))
            ) && !this.isAResourceFile(req)) {

            if (!this.serviceState.isActive()) {
                this.lastRequestAction = req.method;

                if (this.localTimeoutBeforeStartPing) {
                    clearTimeout(this.localTimeoutBeforeStartPing);
                }

                this.localTimeoutBeforeStartPing = setTimeout(() => {
                    // Show yellow network message only if not retrying get requesting...
                    if (this.serviceState.getCurrentTry() == 0) {
                        //networkMessageController.setMessage(R.NETWORK_STATUS_MSG.POOR_NETWORK_MSG);
                        //networkMessageController.showNetworkMessage();
                        this.translateService.get('poor_network_msg').subscribe((msg) => {
                            this.globalNotifyDispatchers.showWarning({ message: msg });
                        }).unsubscribe();

                    }

                }, this.localTimeoutBeforeStartPingValue);

                //if(config.method == R.SERVICE_ACTIONS.GET) //This is force block GET requests
                this.serviceState.setActive(true);
            }


            return next.handle(req).pipe(timeoutWith(this.http_timeout, throwError({ status: ERROR_CODE_TIMEOUT })), tap((response: any) => {

                if (response instanceof HttpResponse) {

                    if ((this.isABlockedUrl(response.url) || req.method != 'GET') && !this.isAResourceFile(response)) {
                        //networkMessageController.hideNetworkMessage();
                        this.globalNotifyDispatchers.hideNotifications();
                        if (this.localTimeoutBeforeStartPing) {
                            clearTimeout(this.localTimeoutBeforeStartPing);
                            this.localTimeoutBeforeStartPing = undefined;
                        }
                        this.serviceState.setActive(false);
                        this.serviceState.resetTryCounter();
                    } else if (response == null) {
                        try {
                            //var util = $injector.get('util');
                            //util.showMessage($injector.get('application').getTranslatedMessage(R.TRANSLATION_MESSAGE_KEYS.NULL_RESPONSE));
                        }
                        catch (e) {
                            console.log(e, { class: "httpResponseErrorInterceptor", func: "response", exception: e });
                        }
                    }
                }

            }), catchError((error: HttpErrorResponse) => {
                // when blocke url fails 

                if (error.status === ERROR_CODE_TIMEOUT) {
                    if (this.localTimeoutBeforeStartPing) {
                        clearTimeout(this.localTimeoutBeforeStartPing);
                        this.localTimeoutBeforeStartPing = undefined;
                    }

                    this.showNoNetworkMessage();

                    if (this.nativeApiService.isNativeBrowser()) {
                        this.nativeApiService.startPing(this.native_ping_period, this.native_max_ping_count_for_message);
                    }
                }

                return throwError('');
            }));
        }
        else {

            // handle retry logic when needed
            if (req.method === 'GET' && !this.isAResourceFile(req) && !this.isCentralAvailabilityChecking(req.url)) {

                return next.handle(req).pipe(timeoutWith(this.http_timeout, throwError({ status: ERROR_CODE_TIMEOUT })),
                    retryWhen(res => {
                        return interval(this.http_timeout).pipe(
                            flatMap((count) => {
                                if (count == (this.numberOfGetRetry - 1)) {
                                    if (this.nativeApiService.isNativeBrowser()) {
                                        this.nativeApiService.startPing(this.native_ping_period, this.native_max_ping_count_for_message);
                                    }
                                    return throwError("Giving up");
                                } else {
                                    if (this.serviceState.getCurrentTry() == 0) {
                                        this.showNoNetworkMessage();
                                    }
                                    this.serviceState.incrementTry();
                                    if (this.localTimeoutBeforeStartPing) {
                                        clearTimeout(this.localTimeoutBeforeStartPing);
                                        this.localTimeoutBeforeStartPing = undefined;
                                    }
                                    return of(count);
                                }
                            }),
                        )
                    }),
                    tap((res) => {
                        if (res instanceof HttpResponse) {
                            if (res.status === 200) {
                                this.globalNotifyDispatchers.hideNotifications();
                                if (this.localTimeoutBeforeStartPing) {
                                    clearTimeout(this.localTimeoutBeforeStartPing);
                                    this.localTimeoutBeforeStartPing = undefined;
                                }
                                this.serviceState.setActive(false);
                                this.serviceState.resetTryCounter();
                            }
                        }
                    })
                );

            }
            else {
                return next.handle(req);
            }
        }
    }

    isABlockedUrl(url) {
        if (url.match(/calendar-backend/g)) {
            url = url.split("/").splice(2);
        } else if (url.match(/rest\/servicepoint/g)) {
            url = url.split("/").splice(3);
        } else {
            url = url.split("/")
        }
        var service_call_string = "";
        for (var key in url) {
            if (url.hasOwnProperty(key)) {
                //url[key] = url[key].split("?")[0];
                if (!!!parseInt(url[key]) && url[key].length < 18 && url[key].indexOf("-") < 0)
                    service_call_string += url[key];
            }
        }
        try {
            var metaData = this.isStringInArray(service_call_string, BLOCKED_URLS);
            if (metaData.count > 1)
                throw "Sorry but your BLOCKED URLS seems to have duplicates or some serveres are made up of the same url parts."
        } catch (err) {
            //errorHandler.handleError(err, "spService is detecting duplicate entries in BLOCKED URLS");
        }
        var isBlockedUrl = false;
        if (metaData.exists) {
            isBlockedUrl = true;
        } else {
            isBlockedUrl = false;
        }
        return isBlockedUrl;
    }

    isAResourceFile(config) {
        if (config.url.match(/.html/g) || config.url.match(/.js/g) || config.url.match(/.properties/g) || config.url.match(/.otf/g) || config.url.match(/.ttf/g)) {
            return true;
        } else {
            return false;
        }
    }

    isStringInArray(string: any, array: any) {
        if (!string && !array)
            return;
        var isPresent = false;
        var numberOfStringsPresent = 0;
        for (var i = 0; i < array.length; i++) {
            if (array[i] == string) {
                numberOfStringsPresent++;
            }
        };

        if (numberOfStringsPresent > 0) {
            isPresent = true;
        } else {
            isPresent = false;
        }

        return { exists: isPresent, count: numberOfStringsPresent };
    }

    isCentralAvailabilityChecking(url) {
        var calendarUrl = "/calendar-backend/api/v1/branches/";
        if (url.includes(calendarUrl)) {
            var urlParts = url.split(calendarUrl);
            if (urlParts.length == 2) {
                var sndPart = urlParts[1];
                var sndPartArr = sndPart.split('/');
                if (sndPartArr.length == 1) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }

    resetState() {
        this.globalNotifyDispatchers.hideNotifications();
        this.serviceState.setActive(false);
    }

    retryFailedGetRequests() {

    }

    showNoNetworkMessage() {
        this.translateService.get('no_network_msg').subscribe((msg) => {
            this.globalNotifyDispatchers.showError({ message: msg });
        }).unsubscribe();
    }

    notifyNativePingStatus(val) {
        this.isPingStarted = val;
    }
}

window["removeWebModels"] = () => {
    window["qmGlobalHttpInterceptor"].resetState();
};

window["onPingSuccess"] = () => {
    const interceptor = window["qmGlobalHttpInterceptor"];
    interceptor.notifyNativePingStatus(false);
    interceptor.retryFailedGetRequests();
};
