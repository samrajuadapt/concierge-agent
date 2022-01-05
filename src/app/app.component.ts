import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ISystemInfo } from './../models/ISystemInfo';
import { Observable, Subscription } from 'rxjs';
import { SystemInfoDispatchers } from './../store/services/system-info/system-info.dispatchers';
import { Component } from '@angular/core';
import { OnInit, OnDestroy, ViewChild } from '@angular/core';
import {
  SystemInfoSelectors, AccountDispatchers, LicenseDispatchers, BranchDispatchers,
  ServiceDispatchers, ServicePointDispatchers, UserStatusDispatchers, UserSelectors
} from '../store';
import { NativeApiService } from 'src/util/services/native-api.service';
import { QEvents } from 'src/util/services/qevents/qevents.service'
import { ToastService } from 'src/util/services/toast.service';
import { ToastContainerDirective } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  public systemInformation$: Observable<ISystemInfo>;
  hostAddress = "127.0.0.1";

  private subscriptions: Subscription = new Subscription();
  userDirection$: Observable<string>;
  userLocale$: Observable<string>;
  
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;

  constructor(private systemInfoDispatchers: SystemInfoDispatchers, private systemInfoSelectors: SystemInfoSelectors,
    private accountDispatchers: AccountDispatchers,
    private licenseDispatchers: LicenseDispatchers, private nativeApiService: NativeApiService,
    private router: Router, private branchDispatchers: BranchDispatchers, private userStatusDispatchers: UserStatusDispatchers, private servicePointDispatchers: ServicePointDispatchers, public qevents: QEvents,
    private translateService: TranslateService, private toastService: ToastService, private userSelectors: UserSelectors) {
  }

  ngOnInit() {
    this.qevents.handshake(this.qevents);
    this.systemInfoDispatchers.fetchSystemInfo();
    this.accountDispatchers.fetchAccountInfo();
    this.branchDispatchers.fetchBranches();
    this.userStatusDispatchers.fetchUserStatus();
    this.userDirection$ = this.userSelectors.userDirection$;
    this.userLocale$ = this.userSelectors.userLocale$;


    const userLocalSubscription = this.userLocale$.subscribe(locale => {
      if(locale) {
        document.documentElement.lang = locale;
      }
    });
    this.subscriptions.add(userLocalSubscription)
    const translateSubscription = this.translateService.get('branch').subscribe(
      (branchLabel: string) => {
        this.branchDispatchers.selectBranch({ id: -1, name: branchLabel });
      }
    );
    this.subscriptions.add(translateSubscription);
    //console.log('setting toast container', this.toastContainer);
    this.toastService.setToastContainer(this.toastContainer);

    this.systemInfoSelectors.systemInfoHost$.subscribe(host => {
      if (host && this.hostAddress != host) {
        this.systemInfoDispatchers.setDistributedAgent();
      }
    }

    )

    this.customizeConsole();

    this.systemInfoSelectors.systemInfo$.subscribe(
      systemInfo => {
        if (systemInfo && systemInfo.productName) {
          //console.log("Orchestra System Information – \n" + JSON.stringify(systemInfo));
        }
      }
    );

    this.userSelectors.user$.subscribe(
      user => {
        if (user && user.id) {
          //console.log("User –  \n" + JSON.stringify(user));
        }
      }
    );

  }

  customizeConsole() {
    if (window.console && console.log) {
      var defaultConsole = console.log;
      var context = this;
      console.log = function () {

        if (typeof arguments[1] === 'object' && arguments[1].class && arguments[1].func && arguments[1].exception) {

          arguments[0] = arguments[1].class + ", " + arguments[1].func + ", " + arguments[1].exception.stack;
        } else if (typeof arguments[1] === 'object' && arguments[1].class && arguments[1].func) {
          arguments[0] = arguments[1].class + ", " + arguments[1].func + ", " + arguments[0];
        }
        defaultConsole.apply(this, arguments);
        context.nativeApiService.setLogMessage(arguments[0]);

      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }



}

