import { SortColumns } from "./sort-columns.enum";
import { IAppointment } from "./../../../../models/IAppointment";
import { ToastService } from "./../../../../util/services/toast.service";
import { IBranch } from "src/models/IBranch";
import { Subscription, Observable } from "rxjs";
import { OnDestroy, Input, ViewChild } from "@angular/core";
import { debounceTime, timeout } from "rxjs/operators";
import { Subject } from "rxjs";
import { FormControl } from "@angular/forms";
import * as moment from "moment";
import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { NgbTimeStruct } from "@ng-bootstrap/ng-bootstrap";
import { IDENTIFY_APPOINTMENT_ANIMATIONS } from "src/app/animations/identify-appointment.animations";
import {
  AppointmentDispatchers,
  BranchSelectors,
  AppointmentSelectors,
  ServicePointSelectors,
  CustomerDispatchers,
  CustomerSelector,
  UserSelectors,
  CalendarBranchSelectors,
  NativeApiSelectors,
  NativeApiDispatchers,
  QueueDispatchers,
  SystemInfoSelectors
} from "src/store";
import { ICustomer } from "src/models/ICustomer";
import { filter } from "rxjs/internal/operators/filter";
import { TranslateService } from "@ngx-translate/core";
import { Moment } from "moment-timezone";
import { CalendarDate } from "src/app/components/containers/qm-calendar/qm-calendar.component";
import { ICalendarBranch } from "src/models/ICalendarBranch";
import { NativeApiService } from "../../../../util/services/native-api.service";
import {
  APPOINTMENT_STATE_ID,
  APPOINTMENT_STATUS
} from "../../../../util/q-state";
import { Util } from "../../../../util/util";
import { QmModalService } from "../qm-modal/qm-modal.service";
import { start } from "repl";
import { timingSafeEqual } from "crypto";
import { Router } from "@angular/router";
import { QmClearInputDirective } from "src/app/directives/qm-clear-input.directive";
import { DEFAULT_LOCALE } from "src/constants/config";
import { GlobalNotifySelectors } from "src/store/services/global-notify";
import { ISystemInfo } from "src/models/ISystemInfo";
import { utils } from "protractor";

@Component({
  selector: "qm-identify-appointment",
  templateUrl: "./qm-identify-appointment.component.html",
  styleUrls: ["./qm-identify-appointment.component.scss"],

  animations: IDENTIFY_APPOINTMENT_ANIMATIONS
})
export class QmIdentifyAppointmentComponent implements OnInit, OnDestroy {
  selectedDate: CalendarDate;
  activeTab: number = 0;
  showModalBackDrop: boolean;
  searchedCustomers: ICustomer[] = [];
  defaultAppointmentCollection: IAppointment[];
  selectedSearchIcon: string;
  showSearchInput: boolean;
  searchText: string;
  inputAnimationState: string;
  isSearchInputOpen: boolean;
  fromTime: NgbTimeStruct;
  toTime: NgbTimeStruct;
  inputChanged: Subject<any> = new Subject<any>();
  customerInputChanged: Subject<any> = new Subject<any>();
  fromTimeController: FormControl;
  toTimeController: FormControl;
  subscriptions: Subscription = new Subscription();
  selectedAppointment: IAppointment;
  searchInputController = new FormControl();
  selectedBranch: IBranch;
  showAppointmentCollection: boolean = true;
  currentSearchState: string;
  previousSearchState: string;
  readonly INITIAL_ANIMATION_STATE = "out";
  isSearchInputReadOnly: boolean = false;
  showCustomerResults: boolean = false;
  enableAppointmentLoad: boolean = true;
  userDirection$: Observable<string> = new Observable<string>();
  customerNotFound: boolean = false;
  selectedCustomer: ICustomer;
  invalidDateSelected: boolean;
  isLoaded: boolean;
  isLoading: boolean;
  isSearchedCustomerLoaded: boolean;
  isSearchedCustomerLoading: boolean;
  uttToTime: Moment;
  selectedToTime: Moment;
  selectedFromTime: Moment;
  uttFromTime: Moment;
  isInDateDurationSelection: boolean = true;
  selectedCalendarBranch: ICalendarBranch;
  sortColumn: string = SortColumns.startTime;
  isDescending: boolean = false;
  showTimeLabel: boolean = false;
  selectedDates: CalendarDate[] = [
    {
      mDate: moment(),
      selected: true
    }
  ];
  qrCodeValue: string;
  qrCodeContent: any;
  userDirection: string;

  selectedBranchFormatted = { selectedBranch: "" };
  isMultiBranchEnable = false;
  isShowAppointmentNotFound = false;
  branchList: IBranch[];
  desktopQRCodeListnerTimer: any;
  flowType: string;
  editMode: boolean;
  currentCustomer: ICustomer;
  sortColumnPriorities: Array<string> = [];
  requestDelayed: boolean = false;
  requestDelayHandle: any;
  showSearchResultsArea = true;
  userLocale = DEFAULT_LOCALE;
  lastSearchAttempt: string;

  // Qr code related variables
  isQRReaderOpen = false;
  qrButtonVisible = false;
  isQRReaderClose = false;
  qrCodeListnerTimer: any;
  isQrCodeLoaded = false;
  hideCustomerdetails: boolean = false;

  // Search States
  readonly SEARCH_STATES = {
    DURATION: "duration",
    DURATION_WITH_DATE: "durationWithDate",
    INITIAL: "initial",
    CUSTOMER: "customer",
    REFRESH: "refresh",
    ID: "id",
    QR: "qr"
  };

  tabberMap = ['initial', 'id', 'customer'];

  sortState = {};

  readonly CREATED_APPOINTMENT_STATE = "CREATED";
  readonly CREATED_APPOINTMENT_STATE_ID = 20;
  readonly ARRIVED_APPOINTMENT_STATE_ID = 30;
  readonly ARRIVED_APPOINTMENT_STATE = "ARRIVED";

  isRefreshDisabled: boolean = false;
  isShowAppointmentInfo: boolean = false;

  showPriResource = false;
  showsecResource = false;

  // utt
  isPrResourceEnable = false;
  isSecResourceEnable = false;

  @ViewChild('clearInputDirective') clearInputDirective: QmClearInputDirective;

  @Output()
  onFlowNext: EventEmitter<any> = new EventEmitter<any>();
  @Input()
  useCalendarEndpoint: boolean = false;
  @Input()
  enableSearchByDay: boolean = false;
  @Output()
  appointmentSelected: EventEmitter<IAppointment> = new EventEmitter<IAppointment>();
  @Output()
  appointmentDeselected: EventEmitter<any> = new EventEmitter();

  appointments: IAppointment[] = [];
  timeConvention$: Observable<string> = new Observable<string>();
  timeConvention: string = "24";

  height: string;
  expandedAppointment: any;


  // date format related variables
  systemInformation: ISystemInfo;

  constructor(
    private appointmentDispatchers: AppointmentDispatchers,
    private branchSelectors: BranchSelectors,
    private appointmentSelectors: AppointmentSelectors,
    private servicePointSelectors: ServicePointSelectors,
    private toastService: ToastService,
    private translateService: TranslateService,
    private customerDispatchers: CustomerDispatchers,
    private customerSelectors: CustomerSelector,
    private calendarBranchSelectors: CalendarBranchSelectors,
    private userSelectors: UserSelectors,
    public nativeApi: NativeApiService,
    private nativeApiSelector: NativeApiSelectors,
    private util: Util,
    private nativeApiDispatcher: NativeApiDispatchers,
    private modalService: QmModalService,
    private systemInfoSelectors: SystemInfoSelectors,
    private globalNotifySelectors: GlobalNotifySelectors
  ) {
    this.currentSearchState = this.SEARCH_STATES.INITIAL;
    this.userDirection$ = this.userSelectors.userDirection$;
    this.userDirection$.subscribe((ud) => {
      this.userDirection = ud;
    })
    this.timeConvention$ = this.systemInfoSelectors.timeConvention$;
  }

  ngOnInit() {

    if (this.useCalendarEndpoint) {
      this.selectedDate = { mDate: moment() };
    }
    this.initializeSortState();
    const customerSearchLoadedSubscription = this.customerSelectors.customerLoaded$.subscribe(
      value => {
        this.isSearchedCustomerLoaded = value;
      }
    );
    const customerSearchLoadingSubscription = this.customerSelectors.customerLoading$.subscribe(
      value => {
        this.isSearchedCustomerLoading = value;
      }
    );
    this.subscriptions.add(customerSearchLoadedSubscription);
    this.subscriptions.add(customerSearchLoadingSubscription);

    const userLocaleSubscription = this.userSelectors.userLocale$.subscribe((ul) => {
      this.userLocale = ul || DEFAULT_LOCALE;
    });
    this.subscriptions.add(userLocaleSubscription);


    const loadedSubscription = this.appointmentSelectors.appointmentsLoaded$.subscribe(
      load => {
        this.isLoaded = load;
      }
    );
    const loadingSubscription = this.appointmentSelectors.appointmentsLoading$.subscribe(
      load => {
        this.isLoading = load;
      }
    );
    this.subscriptions.add(loadingSubscription);
    this.subscriptions.add(loadedSubscription);



    const systemInfoSubscription = this.systemInfoSelectors.systemInfo$.subscribe(systemInfo => {
      this.systemInformation = systemInfo;
    });

    this.subscriptions.add(systemInfoSubscription)

    this.inputAnimationState = this.INITIAL_ANIMATION_STATE;
    this.setDefaultDuration();
    this.fromTimeController = new FormControl("", (control: FormControl) => {
      return this.getTimeSelectionValidity(control.value, this.toTime);
    });

    this.toTimeController = new FormControl("", (control: FormControl) => {
      return this.getTimeSelectionValidity(this.fromTime, control.value);
    });
    this.height = "calc(100vh - 230px)";
    this.inputChanged.subscribe(text => this.searchAppointments());

    this.customerInputChanged
      .pipe(debounceTime(500 || 0))
      .subscribe(text => this.showCustomerAutoComplete());

    const branchSubscription = this.branchSelectors.selectedBranch$.subscribe(
      br => {
        this.selectedBranch = br;
        this.selectedBranchFormatted.selectedBranch = br.name;
      }
    );

    if (this.useCalendarEndpoint) {
      const calendarAppointmentSubscription = this.appointmentSelectors.calendarAppointments$.subscribe(
        apps => {
          this.calendarBranchSelectors.branches$
            .subscribe(bs => {
              this.selectedCalendarBranch = bs.find(
                x => x.qpId == this.selectedBranch.id
              );
              this.handleAppointmentResponse(apps);
            })
            .unsubscribe();
        }
      );

      this.subscriptions.add(calendarAppointmentSubscription);
    } else {
      const appointmentSubscription = this.appointmentSelectors.appointments$.subscribe(
        apps => {
          this.calendarBranchSelectors.branches$
            .subscribe(bs => {
              this.selectedCalendarBranch = bs.find(
                x => x.qpId == this.selectedBranch.id
              );
              this.handleAppointmentResponse(apps);
            }
            )
            .unsubscribe();
        }
      );
      this.subscriptions.add(appointmentSubscription);

      const branchesSubscription = this.branchSelectors.branches$.subscribe(
        branches => {
          this.branchList = branches;
        }
      );
      this.subscriptions.add(branchesSubscription);
    }

    const uttSubscription = this.servicePointSelectors.uttParameters$.subscribe(
      uttParameters => {

        if (uttParameters) {

          this.isPrResourceEnable = uttParameters.primaryResource;
          this.isSecResourceEnable = uttParameters.secondaryResource;
          this.hideCustomerdetails = uttParameters.hideCustomerDetails
        // qr button enable depending on utt settngs
          if (uttParameters.appointmentQR) {
            this.qrButtonVisible = true;
          }
          this.enableAppointmentLoad = uttParameters.fetchAppointment;
          this.isMultiBranchEnable = uttParameters.mltyBrnch;
        }
      }
    );
    this.subscriptions.add(uttSubscription);

    // show appointment not found error in 404
    const appointmentErrorSub = this.appointmentSelectors.appointmentsError$.subscribe(
      (error: any) => {
        if (error && error.status && error.status === 404) {
          this.showAppointmentNotFoundError();
          this.appointmentDispatchers.resetError();
        }
      }
    );


    if (this.useCalendarEndpoint) {
      const customersFromAllDates = this.customerSelectors.customer$.subscribe(
        customers => {
          if (
            !customers ||
            (customers.length === 0 &&
              this.currentSearchState === this.SEARCH_STATES.CUSTOMER)
          ) {
            this.customerNotFound = true;
            this.showSearchResultsArea = false;
          } else {
            this.customerNotFound = false;
          }
          this.searchedCustomers = customers;
        }
      );
      this.subscriptions.add(customersFromAllDates);

    } else {
      const customerSearchSubscription = this.customerSelectors.appointmentSearchCustomers$.subscribe(
        customers => {
          if (
            !customers ||
            (customers.length === 0 &&
              this.currentSearchState === this.SEARCH_STATES.CUSTOMER)
          ) {
            this.customerNotFound = true;
            this.showSearchResultsArea = false;
          } else {
            this.customerNotFound = false;
          }
          this.searchedCustomers = customers;
        }
      );

      this.subscriptions.add(customerSearchSubscription);
    }

    this.subscriptions.add(branchSubscription);
    this.subscriptions.add(appointmentErrorSub);

    const servicePointsSubscription = this.servicePointSelectors.uttParameters$.subscribe(
      params => {
        this.readAppointmentFetchTimePeriodFromUtt(params);

        if (params.fetchAppointment) {
          this.enableAppointmentLoad = true;
          this.searchAppointments();
        }
        else {
          this.enableAppointmentLoad = false;
          this.showTimeLabel = false;
          this.appointments = [];
        }
      }
    );

    this.subscriptions.add(servicePointsSubscription);

    // if appointments are loaded and there is no appointment to show display no appointment message
    const appointmentsLoadedSub = this.appointmentSelectors.appointmentsLoaded$.subscribe(
      isLoaded => {
        if (
          isLoaded &&
          (this.currentSearchState === this.SEARCH_STATES.INITIAL || this.currentSearchState === this.SEARCH_STATES.DURATION) &&
          this.appointments.length === 0 && (this.enableAppointmentLoad || this.showTimeLabel)
        ) {
          this.translateService
            .get("no_appointments")
            .subscribe((noappointments: string) => {
              this.toastService.infoToast(noappointments);
            })
            .unsubscribe();
        }
      }
    );
    this.subscriptions.add(appointmentsLoadedSub);

    const calendarBranchsSub = this.calendarBranchSelectors.branches$.subscribe(
      bs => {
        this.selectedCalendarBranch = bs.find(
          x => x.qpId == this.selectedBranch.id
        );
      }
    );

    this.subscriptions.add(calendarBranchsSub);

    // sorting
    this.sortColumn = this.useCalendarEndpoint
      ? SortColumns.start
      : SortColumns.startTime;

    // QR code subscription - value comming from native or desktop qr reader 
    const qrCodeSubscription = this.nativeApiSelector.qrCode$.subscribe(
      value => {
        if (value != null) {
          // if  qr value not null
          this.qrCodeContent = value;
          this.isQrCodeLoaded = true;
          if (!this.nativeApi.isNativeBrowser()) {
            // not native-> remove the checking loop || native will auto remove the qr modal
            this.removeDesktopQRReader();
          }
        }
      }
    );
    this.subscriptions.add(qrCodeSubscription);

    // Qr Code Scanner modal subscription ** this is to show the qr modal -( value is a boolean value)
    const qrCodeScannerSubscription = this.nativeApiSelector.qrCodeScannerState$.subscribe(
      value => {
        // if the scanner value is true show the qr modal otherwise remove the qr modal
        if (value === true) {
          this.isQrCodeLoaded = false;
          this.qrCodeContent = null;
          this.isQRReaderOpen = true;
          this.isQRReaderClose = false;
          this.qrCodeListner();
          if (!this.nativeApi.isNativeBrowser()) {
            this.checkDesktopQRReaderValue();
          }
        } else {
          // removing qr modal

          // if desktop browser
          if (!this.nativeApi.isNativeBrowser()) {
            setTimeout(() => {
              this.removeQRCodeListner();
            }, 1000);
          }
          if (this.nativeApi.isNativeBrowser()) {
            this.getPreviousSearchState();
          }
          this.isQRReaderClose = true;
        }
      }
    );
    this.subscriptions.add(qrCodeScannerSubscription);

    const timeConventionSub = this.timeConvention$.subscribe(tc => {
      this.timeConvention = tc;
    });
    this.subscriptions.add(timeConventionSub);

    const customerSubscription = this.customerSelectors.currentCustomer$.subscribe((customer) => {
      this.currentCustomer = customer;
      if (this.currentCustomer && this.currentSearchState === this.SEARCH_STATES.CUSTOMER) {
        this.onCustomerSelect(customer);
      }
    });
    this.subscriptions.add(customerSubscription);

    const globalNotifySub = this.globalNotifySelectors.criticalError$.subscribe(() => {
      if (!this.nativeApi.isNativeBrowser()) {
        this.isLoaded = true;
        this.isLoading = false;
        this.appointments = [];
      }
    });

    this.subscriptions.add(globalNotifySub);
  }

  getShowPriResource(): boolean {
    return this.isPrResourceEnable && this.appointments[0]?.resourceServiceDecorators?.[0]?.primaryResource;
  }

  getShowSecResource(): boolean {
    return this.isSecResourceEnable &&
    this.appointments[0]?.resourceServiceDecorators?.[0]?.secondaryResources?.length;
  }

  initializeSortState() {
    for (const key in SortColumns) {
      this.sortState[key] = 0;
    }

    if (this.useCalendarEndpoint) {
      this.sortState[SortColumns.startTimeDate] = -1;
    } else {
      this.sortState[SortColumns.startTime] = -1;
    }
  }

  qrCodeListner() {
    this.qrCodeListnerTimer = setInterval(() => {
      if (this.isQrCodeLoaded) {
        this.nativeApiDispatcher.closeQRCodeScanner();
        this.isQrCodeLoaded = false;
        try {
          this.qrCodeContent = JSON.parse(this.qrCodeContent);
          if (this.qrCodeContent.appointment_id) {
            this.qrCodeValue = this.qrCodeContent.appointment_id;
            var branchId = this.qrCodeContent.branch_id;
            var date = this.qrCodeContent.appointment_date;
            var branchName = this.qrCodeContent.branch_name;

            this.currentSearchState = this.SEARCH_STATES.QR;
            this.searchAppointments();
          } else {
            if (isNaN(this.qrCodeContent)) {
              this.showQRCodeError();
            } else {
              this.qrCodeValue = this.util.qWebBookIdConverter(this.qrCodeContent.toString());
              if (this.qrCodeValue) {
                this.currentSearchState = this.SEARCH_STATES.QR;
                this.searchAppointments();
              } else {
                this.showQRCodeError();
              }
            }
          }
        } catch (err) {
          this.showQRCodeError();
        }
      }
      if (this.isQRReaderOpen && this.isQRReaderClose) {
        this.isQRReaderOpen = false;
        this.isQRReaderClose = false;
        this.clearInput();
        this.removeQRCodeListner();
      }
    }, 1000);
  }

  removeQRCodeListner() {
    if (this.qrCodeListnerTimer) {
      clearInterval(this.qrCodeListnerTimer);
    }
  }

  showQRCodeError() {
    this.clearInput();
    this.translateService
      .get("label.appointment_not_found_qr")
      .subscribe((noappointments: string) => {
        this.toastService.errorToast(noappointments);
      })
      .unsubscribe();
    if (this.currentSearchState === this.SEARCH_STATES.QR) {
      setTimeout(() => {
        this.getPreviousSearchState();
      }, 1000);
    }
  }

  getPreviousSearchState() {
    if (this.previousSearchState) {
      this.currentSearchState = this.previousSearchState;
      this.showSearchResultsArea = ((this.previousSearchState === this.SEARCH_STATES.INITIAL) || (this.currentSearchState === this.SEARCH_STATES.DURATION));
      if (this.currentSearchState === this.SEARCH_STATES.INITIAL || this.currentSearchState === this.SEARCH_STATES.DURATION) {
        this.onSearchButtonClick(this.currentSearchState);
      }
    }
  }




  showAppointmentNotFoundError() {
    if (this.SEARCH_STATES.QR === this.currentSearchState) {
      this.clearInput();
      if (this.qrCodeContent.appointment_id) {
        if (this.useCalendarEndpoint) {
          this.translateService.get('label.appointment_in_another_branch', { appointmentBranch: this.qrCodeContent.branch_name })
            .subscribe(msg => this.toastService.errorToast(msg)).unsubscribe();

        } else {
          if (this.qrCodeContent.branch_id !== String(this.selectedBranch.id)) {
            this.translateService
            this.translateService.get('label.appointment_in_another_branch', { appointmentBranch: this.qrCodeContent.branch_name })
              .subscribe(msg => this.toastService.errorToast(msg)).unsubscribe();
          } else {
            var dateOriginal = this.qrCodeContent.appointment_date.split("T");
            var appDate = dateOriginal[0];
            var todayDate = moment().format('YYYY-MM-DD');
            if (appDate != todayDate) {
              this.translateService
                .get("appointment_in_another_day")
                .subscribe((val: string) => {
                  this.toastService.infoToast(
                    val +
                    " " +
                    this.getDateTime(this.qrCodeContent.appointment_date)
                  );
                })
                .unsubscribe();
            } else {
              this.isShowAppointmentNotFound = true;
            }
          }
        }
      } else {
        this.translateService.get('label.appointment_not_found_qr')
          .subscribe(msg => this.toastService.errorToast(msg)).unsubscribe();
      }
    } else {
      this.isShowAppointmentNotFound = true;
    }
    if (this.currentSearchState === this.SEARCH_STATES.QR) {
      setTimeout(() => {
        this.getPreviousSearchState();
      }, 1000);
    }
  }

  readAppointmentFetchTimePeriodFromUtt(params: any) {
    if (params) {
      this.uttFromTime = moment().subtract(params.gapFromTime, "minutes");
      this.selectedFromTime = this.uttFromTime;

      if (!moment().isSame(this.selectedFromTime, 'day')) {
        this.selectedFromTime = moment().startOf('day');
      }

      this.uttToTime = moment().add(params.gapToTime, "minutes");
      this.selectedToTime = this.uttToTime;

      if (!moment().isSame(this.selectedToTime, 'day')) {
        this.selectedToTime = moment().endOf('day');
      }

      this.selectedDate = { mDate: this.selectedFromTime.clone().startOf('day') };
    }
  }

  applyAppointmentFilters(appointments: IAppointment[]) {
    if (this.useCalendarEndpoint) {
      return appointments.filter(
        ap => ap.status === this.CREATED_APPOINTMENT_STATE_ID
          && ap.blocking !== true && (this.isMultiBranchEnable || this.SEARCH_STATES.ID === this.currentSearchState
            || this.SEARCH_STATES.QR === this.currentSearchState ||
            ap.branch.qpId === this.selectedBranch.id)
      );
    } else {
      return appointments.filter(
        ap =>
          ap.status === this.CREATED_APPOINTMENT_STATE &&
          ap.branchId === this.selectedBranch.id
      );
    }
  }

  toggleDurationSelection(isDateHeaderClicked) {
    this.isInDateDurationSelection = !!isDateHeaderClicked;
  }

  handleQRCodeValidation(apps: IAppointment[]) {
    if (this.appointments.length === 1) {
      let appointment = apps[0];
      if (this.useCalendarEndpoint) {
        if (
          appointment.status === APPOINTMENT_STATE_ID.CREATED ||
          appointment.status === APPOINTMENT_STATE_ID.RESCHEDULED
        ) {
          if (
            this.qrCodeContent.branch_id !== this.selectedBranch.id &&
            this.qrCodeContent.branch_name !== this.selectedBranch.name &&
            !this.isMultiBranchEnable
          ) {
            this.clearSelection();

            this.translateService.get('label.appointment_in_another_branch', { appointmentBranch: this.qrCodeContent.branch_name })
              .subscribe(msg => this.toastService.errorToast(msg)).unsubscribe();
            setTimeout(() => {
              this.getPreviousSearchState();
            }, 1000);
          } else {
            // appointment.startTime = moment(appointment.start)
            //   .tz(appointment.branch.fullTimeZone)
            //   .format("YYYY-MM-DDTHH:mm");
            // appointment.endTime = moment(appointment.end)
            //   .tz(appointment.branch.fullTimeZone)
            //   .format("YYYY-MM-DDTHH:mm");
            // appointment.start = moment(appointment.start)
            //   .tz(appointment.branch.fullTimeZone)
            //   .format("YYYY-MM-DDTHH:mm");
            // appointment.end = moment(appointment.end)
            //   .tz(appointment.branch.fullTimeZone)
            //   .format("YYYY-MM-DDTHH:mm");

            this.selectedAppointment = appointment;
            this.inputAnimationState = this.INITIAL_ANIMATION_STATE;
            this.showAppointmentCollection = false;
            this.onAppointmentSelect(this.selectedAppointment);
            this.showModalBackDrop = false;
          }
        } else {
          this.clearSelection();
          this.translateService
            .get("appointment_arrived")
            .subscribe((noappointments: string) => {
              this.toastService.infoToast(noappointments);
            })
            .unsubscribe();
          setTimeout(() => {
            this.getPreviousSearchState();
          }, 1000);
        }
      } else {
        if (appointment.status === APPOINTMENT_STATUS.CREATED) {
          if (appointment.branchId !== this.selectedBranch.id) {
            var branch = this.branchList.filter(val => {
              return val.id === appointment.branchId;
            });
            var branchName = "";
            if (branch.length > 0) {
              branchName = branch[0].name;
            }
            this.clearSelection();
            this.translateService.get('label.appointment_in_another_branch', { appointmentBranch: this.appointments[0].branch.name })
              .subscribe(msg => this.toastService.errorToast(msg)).unsubscribe();
            this.getPreviousSearchState();
          } else {
            var dateOriginal = appointment.startTime.split("T");
            var appDate = dateOriginal[0];
            var todayDate = moment().format('YYYY-MM-DD');
            if (appDate != todayDate) {
              this.clearSelection();
              this.translateService
                .get("appointment_in_another_day")
                .subscribe((val: string) => {
                  this.toastService.infoToast(
                    val + " " + this.getDateTime(appointment.startTime)
                  );
                })
                .unsubscribe();
              this.getPreviousSearchState();
            } else {
              this.selectedAppointment = appointment;
              this.inputAnimationState = this.INITIAL_ANIMATION_STATE;
              this.showAppointmentCollection = false;
              this.onAppointmentSelect(this.selectedAppointment);
              this.showModalBackDrop = false;
            }
          }
        } else {
          this.clearSelection();
          this.translateService
            .get("appointment_arrived")
            .subscribe((noappointments: string) => {
              this.toastService.infoToast(noappointments);
            })
            .unsubscribe();
          setTimeout(() => {
            this.getPreviousSearchState();
          }, 1000);
        }
      }
    } else {
      this.clearInput();
      this.translateService
        .get("label.appointment_not_found_qr")
        .subscribe((noappointments: string) => {
          this.toastService.errorToast(noappointments);
        })
        .unsubscribe();
      setTimeout(() => {
        this.getPreviousSearchState();
      }, 1000);

    }
  }

  clearSelection() {
    this.appointments = [];
    this.onCancel();
  }

  handleAppointmentResponse(apps: IAppointment[]) {
    if (this.currentSearchState != this.lastSearchAttempt) {
      return;
    }

    if (this.requestDelayHandle) {
      clearTimeout(this.requestDelayHandle);
    }
    this.requestDelayed = false;

    if (apps && apps.length > 0) {
      apps = apps.map(a => {

        a.custName = '';
        if (this.hideCustomerdetails) {
          a.custName = a.customers[0].id.toString();
        } else if (a.customers[0]) {
          a.custName = `${a.customers[0] ? a.customers[0].firstName : ""} ${a.customers[0] ? a.customers[0].lastName : ""
            }`;
        }

        a.servicesDisplayLabel = '';

        if (a.services && a.services.length > 0) {
          a.servicesDisplayLabel =
            a.services.length > 1
              ? `${a.services[0].name} +${a.services.length - 1}`
              : a.services[0].name;
        }

        a.branchDisplayLabel = '';

        if (this.useCalendarEndpoint) {
          a.branchDisplayLabel = a.branch.name;
        }

        return a;
      });
      this.appointments = this.applyAppointmentFilters(apps);
      this.showSearchResultsArea = true;
    } else {
      this.appointments = [];
    }

    if (this.SEARCH_STATES.QR === this.currentSearchState) {
      this.handleQRCodeValidation(apps);
    }

    // in id search handle id search cases
    else if (this.SEARCH_STATES.ID == this.currentSearchState) {

      if (this.appointments.length === 1 && this.appointments[0].status === this.CREATED_APPOINTMENT_STATE_ID
        && ((this.useCalendarEndpoint === false && this.appointments[0].branch.id !== this.selectedBranch.id) ||
          (this.useCalendarEndpoint && this.appointments[0].branch.qpId !== this.selectedBranch.id)) && !this.isMultiBranchEnable) {
        this.translateService.get('label.appointment_in_another_branch', { appointmentBranch: this.appointments[0].branch.name })
          .subscribe(msg => this.toastService.errorToast(msg)).unsubscribe();
      }
      else if (this.appointments.length === 1) {
        this.selectedAppointment = apps[0];
        this.inputAnimationState = this.INITIAL_ANIMATION_STATE;
        this.showAppointmentCollection = false;
        this.showSearchResultsArea = false;
        this.onAppointmentSelect(this.selectedAppointment);
        this.showModalBackDrop = false;
        this.searchText = '';
        this.clearInputDirective.update(this.searchText);
      }

      // search appointment is already arrived? then notifiy user
      if (
        apps.filter(ap => ap.status === this.ARRIVED_APPOINTMENT_STATE).length >
        0 ||
        (this.useCalendarEndpoint &&
          apps.filter(ap => ap.status === this.ARRIVED_APPOINTMENT_STATE_ID)
            .length > 0)
      ) {
        this.translateService
          .get("appointment_arrived")
          .subscribe((noappointments: string) => {
            this.toastService.infoToast(noappointments);
          })
          .unsubscribe();
      }
    } else if (
      this.currentSearchState === this.SEARCH_STATES.INITIAL ||
      this.currentSearchState == this.SEARCH_STATES.REFRESH
    ) {
      this.defaultAppointmentCollection = this.appointments;
    }

    if (!this.appointments || !this.appointments.length) {
      if (this.currentSearchState === this.SEARCH_STATES.CUSTOMER) {
        this.translateService
          .get("no_appointments_for_customer")
          .subscribe((noappointments: string) => {
            this.toastService.infoToast(noappointments);
          })
          .unsubscribe();
      } else if (
        this.currentSearchState === this.SEARCH_STATES.DURATION ||
        this.currentSearchState == this.SEARCH_STATES.REFRESH
      ) {
        this.translateService
          .get("no_appointments")
          .subscribe((noappointments: string) => {
            this.toastService.infoToast(noappointments);
          })
          .unsubscribe();
      } else if (
        this.currentSearchState === this.SEARCH_STATES.ID &&
        this.useCalendarEndpoint &&
        apps.filter(ap => ap.status === this.ARRIVED_APPOINTMENT_STATE_ID)
          .length === 0
      ) {
        this.isShowAppointmentNotFound = true;
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.customerInputChanged.unsubscribe();
    this.inputChanged.unsubscribe();
  }

  setDefaultDuration() {
    let currentTime = moment();
    this.fromTime = {
      hour: parseInt(currentTime.format("HH")),
      minute: parseInt(currentTime.format("mm")),
      second: 0
    };
    this.toTime = {
      hour: parseInt(currentTime.format("HH")) + 1,
      minute: parseInt(currentTime.format("mm")),
      second: 0
    };
    this.invalidDateSelected = false;
    this.selectedDates = [{ mDate: moment(), selected: true }];
  }

  getTime(timeString, fullTimeZone) {
    if (fullTimeZone) {
      return moment(timeString)
        .tz(fullTimeZone)
        .format("HH:mm");
    } else {
      return moment(timeString).format("HH:mm");
    }
  }

  getDate(timeString, fullTimeZone) {
    if (fullTimeZone) {
      return moment(timeString)
        .tz(fullTimeZone)
        .format(this.systemInformation.dateConvention);
    } else {
      return moment(timeString).format(this.systemInformation.dateConvention);
    }
  }

  getDateTime(dateString) {
    return moment(dateString).format(this.systemInformation.dateConvention +
      ', ' + (this.systemInformation.timeConvention.indexOf('24') !== -1 ? 'HH:mm' : 'hh:mm A'));
  }

  getTimeSelectionValidity(fromTime, toTime, isFromTime = true) {
    let validationConfig = null;
    if (fromTime.hour > toTime.hour) {
      validationConfig = { invalidTime: true };
      this.invalidDateSelected = true;
    } else if (
      fromTime.hour == toTime.hour &&
      fromTime.minute >= toTime.minute
    ) {
      validationConfig = { invalidTime: true };
      this.invalidDateSelected = true;
    } else {
      this.invalidDateSelected = false;
    }
    return validationConfig;
  }

  // loop when the qr scanner is turned on on desktop browsers
  checkDesktopQRReaderValue() {
    var count = 0;
    var text = "";
    this.desktopQRCodeListnerTimer = setInterval(() => {
      this.foucusInput(); 
      if (this.searchText && this.searchText.length > 0) {
        count = count + 1;
        if (text === this.searchText) {
          // get info related to the QR code 
          this.nativeApiDispatcher.fetchQRCodeInfo(this.searchText);
          this.searchText = "";
          this.clearInput();
        }
        text = this.searchText;
      }
    }, 200);
  }



  // remove the loop for desktop scanner
  removeDesktopQRReader() {
    if (this.desktopQRCodeListnerTimer) {
      clearInterval(this.desktopQRCodeListnerTimer);
    }
  }

  onSearchButtonClick(searchButton) {
    this.showSearchResultsArea = (searchButton === this.SEARCH_STATES.INITIAL) || (searchButton === this.SEARCH_STATES.DURATION);
    this.isSearchInputOpen = !this.isSearchInputOpen;
    this.showAppointmentCollection = true;

    if (searchButton == this.SEARCH_STATES.INITIAL) {
      this.activeTab = 0;
    }
    else if (searchButton == this.SEARCH_STATES.ID) {
      this.activeTab = 1;
    } else if (searchButton === this.SEARCH_STATES.CUSTOMER) {
      this.showSearchResultsArea = false;
      this.activeTab = 2;
    } else if (searchButton === this.SEARCH_STATES.DURATION) {
      this.setDefaultDuration();
      if (this.enableSearchByDay) {
        this.isInDateDurationSelection = true;
      }
    }

    else if (searchButton === this.SEARCH_STATES.QR) {
      this.previousSearchState = this.currentSearchState;
      if (this.currentSearchState == this.SEARCH_STATES.REFRESH) {
        this.previousSearchState = this.SEARCH_STATES.DURATION;
      }

      this.currentSearchState = this.SEARCH_STATES.QR;
      if (this.nativeApi.isNativeBrowser()) {
        this.nativeApi.openQRScanner();

      } else {
        this.isQRReaderOpen = true;
        setTimeout(() => {
          var searchBox = document.getElementById("idField") as any;
          searchBox.focus();
        }, 100);
        this.nativeApiDispatcher.openQRCodeScanner();
      }
    }

    if (
      this.inputAnimationState == searchButton ||
      (this.inputAnimationState == this.SEARCH_STATES.DURATION_WITH_DATE &&
        searchButton == this.SEARCH_STATES.DURATION)
    ) {
      this.inputAnimationState = this.INITIAL_ANIMATION_STATE;
    } else {
      this.inputAnimationState =
        this.enableSearchByDay && searchButton === this.SEARCH_STATES.DURATION
          ? this.SEARCH_STATES.DURATION_WITH_DATE
          : searchButton;
    }

    if (this.selectedSearchIcon != searchButton) {
      this.showModalBackDrop = true;
      this.selectedSearchIcon = searchButton;
      this.currentSearchState = searchButton;
    } else if (
      this.selectedSearchIcon === searchButton &&
      this.searchText.trim()
    ) {
      this.showModalBackDrop = true;
      this.currentSearchState = searchButton;
      this.inputAnimationState = searchButton;
    } else {
      this.showModalBackDrop = false;
      this.selectedSearchIcon = "";
    }

    this.searchText = "";
    // this.selectedAppointment = null;
    this.isSearchInputReadOnly = false;
    this.customerNotFound = false;
    this.showCustomerResults = false;
    this.searchedCustomers = [];
    // this.appointmentDeselected.emit();
    if (this.currentSearchState === this.SEARCH_STATES.INITIAL || this.currentSearchState === this.SEARCH_STATES.DURATION) {

      this.servicePointSelectors.uttParameters$.subscribe((params) => {
        this.readAppointmentFetchTimePeriodFromUtt(params);
      });
      this.searchAppointments();
    }
    else {
      this.appointmentDispatchers.resetLoading();
      this.appointments = this.defaultAppointmentCollection;
    }

    this.selectedCustomer = null;
    //this.arriveAppointmentDispatchers.deselectAppointment();
  }

  onSelectTime() {
    this.isSearchInputOpen = true;
    let formattedTime = `${this.pad(this.fromTime.hour, 2)}:${this.pad(
      this.fromTime.minute,
      2
    )} - ${this.pad(this.toTime.hour, 2)}:${this.pad(this.toTime.minute, 2)}`;
    if (this.enableSearchByDay) {
      formattedTime =
        this.selectedDate.mDate.format("YYYY-MM-DD") + " / " + formattedTime;
    }

    this.searchText = formattedTime;
    this.inputAnimationState = "input";
    this.selectedSearchIcon = "";
    this.searchInputController.setValue(formattedTime);
    this.searchAppointments();
    this.showModalBackDrop = false;
  }

  clearInput() {
    this.searchText = "";
    this.showModalBackDrop = false;
    this.isSearchInputOpen = false;
    this.inputAnimationState = this.INITIAL_ANIMATION_STATE;
    this.selectedSearchIcon = "";
    this.isSearchInputReadOnly = false;
    this.customerNotFound = false;
    this.appointments = this.defaultAppointmentCollection;
    this.showCustomerResults = false;
  }

  searchAppointments() {
    this.showTimeLabel = true;
    this.appointments = [];
    this.lastSearchAttempt = this.currentSearchState;
    let searchQuery: any = {
      branchId: this.useCalendarEndpoint
        ? this.selectedCalendarBranch.id
        : this.selectedBranch.id,
      useCalendarEndpoint: this.useCalendarEndpoint
    };

    if (this.currentSearchState === this.SEARCH_STATES.DURATION) {
      let now = moment();
      searchQuery = {
        ...searchQuery,
        fromDate: this.getformattedTimeForDurationSearch(true),
        toDate: this.getformattedTimeForDurationSearch(false)
      };
    } else if (
      this.currentSearchState === this.SEARCH_STATES.INITIAL ||
      this.currentSearchState === this.SEARCH_STATES.REFRESH
    ) {
      searchQuery = {
        ...searchQuery,
        fromDate: this.getformattedTimeForDurationSearch(true),
        toDate: this.getformattedTimeForDurationSearch(false)
      };
    } else if (this.currentSearchState === this.SEARCH_STATES.ID) {
      if (this.isTooLargeNumber()) {
        this.translateService.get('error.toolarge.appointmentId').subscribe((x) => {
          this.toastService.errorToast(x);
        }).unsubscribe();
        return;
      }
      searchQuery = {
        ...searchQuery,
        id: (this.searchText || "").trim()
      };
    } else if (this.currentSearchState === this.SEARCH_STATES.QR) {
      searchQuery = {
        ...searchQuery,
        id: (this.qrCodeValue || "").trim()
      };
    }

    if (this.requestDelayHandle) {
      clearTimeout(this.requestDelayHandle);
    }
    this.requestDelayed = false;
    this.requestDelayHandle = setTimeout(() => {
      this.requestDelayed = true;
    }, 3000);

    if (this.useCalendarEndpoint) {
      this.appointmentDispatchers.searchCalendarAppointments(searchQuery);
    } else {
      this.appointmentDispatchers.searchAppointments(searchQuery);
    }

  }

  getUttDefaultTimeForSearch(uttTime: Moment) {
    let formattedDate = `${uttTime.format("YYYY-MM-DD")}T${uttTime.format(
      "HH"
    )}:${uttTime.format("mm")}`;

    // adjust the time zone for calendar endpoint
    if (this.useCalendarEndpoint) {
      formattedDate = moment(formattedDate)
        .tz(this.selectedCalendarBranch.fullTimeZone)
        .utc()
        .format("YYYY-MM-DD HH:mm")
        .replace(" ", "T");
    }

    return formattedDate;
  }

  getformattedTimeForDurationSearch(isFromTime: boolean) {
    let formattedDate: string;
    if (this.enableSearchByDay) {
      if (isFromTime) {
        formattedDate = `${this.selectedDate.mDate.format(
          "YYYY-MM-DD"
        )}T${this.selectedFromTime.format('HH:mm')}`;
      } else {
        formattedDate = `${this.selectedDate.mDate.format(
          "YYYY-MM-DD"
        )}T${this.selectedToTime.format('HH:mm')}`;
      }
    } else {
      let now = moment();
      if (isFromTime) {
        formattedDate = `${now.format("YYYY-MM-DD")}T${this.selectedFromTime.format('HH:mm')}`;
      } else {
        formattedDate = `${now.format("YYYY-MM-DD")}T${this.selectedToTime.format('HH:mm')}`;
      }
    }
    // adjust the time zone for calendar endpoint
    if (this.useCalendarEndpoint) {
      formattedDate = moment(formattedDate)
        .tz(this.selectedCalendarBranch.fullTimeZone)
        .utc()
        .format("YYYY-MM-DD, HH:mm")
        .replace(", ", "T");
    }

    return formattedDate;
  }

  onSelectDate(selectedDate: CalendarDate) {
    this.selectedDate = selectedDate;
  }

  isTooLargeNumber() {
    let isTooLarge = false;

    if (parseInt((this.searchText || '').trim(), 10) > 999999999) {
      isTooLarge = true;
    }

    return isTooLarge;
  }

  onEnterPressed() {
    if (
      this.currentSearchState !== this.SEARCH_STATES.CUSTOMER ||
      this.currentSearchState !== this.SEARCH_STATES.QR
    ) {
      let trimmedSearchText = (this.searchText || "").trim();
      if (trimmedSearchText) {
        if (this.currentSearchState === this.SEARCH_STATES.ID) {
          trimmedSearchText = trimmedSearchText.replace(/[^0-9]/g, "");
        }
        this.searchText = trimmedSearchText;
        this.inputChanged.next(trimmedSearchText);

      } else if (this.currentSearchState === this.SEARCH_STATES.ID) {
        // this.translateService
        //   .get("please_enter_id_and_press_enter")
        //   .subscribe(msg => {
        //     this.toastService.infoToast(msg);
        //   })
        //   .unsubscribe();
      }
    }
  }

  onSeachTextChanged() {
    if (this.currentSearchState === this.SEARCH_STATES.CUSTOMER) {
      this.customerNotFound = false;
      if ((this.searchText || "").trim().length >= 2) {
        this.customerInputChanged.next();
      }
    }
  }

  showCustomerAutoComplete() {
    this.showCustomerResults = true;
    if (this.useCalendarEndpoint) {
      this.customerDispatchers.fetchCustomers((this.searchText || ""));
    } else {
      this.customerDispatchers.fetchAppointmentCustomers(
        (this.searchText || "")
      );
    }
  }
  onSearchInputChange() {
    this.inputChanged.next(this.searchText);
  }

  pad(n, width, z = "0") {
    n = n + "";
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  onAppointmentSelect(appointment: IAppointment) {

    if (this.currentSearchState == this.SEARCH_STATES.CUSTOMER) {
      this.customerDispatchers.resetCustomerSearchText();
      this.showSearchResultsArea = false;
    }
    //this.arriveAppointmentDispatchers.selectAppointment(appointment);
    this.selectedAppointment = appointment;
    this.inputAnimationState = this.INITIAL_ANIMATION_STATE;
    this.selectedSearchIcon = "";
    this.onFlowNext.emit();
    this.appointmentSelected.emit(appointment);
    this.selectedCustomer = appointment.customers[0];
    if (this.expandedAppointment) {
      this.expandedAppointment.showInfo = false;
    }
  }

  getSelectedAppointmentInfo() {
    let appointmentInfo = "";

    if (this.selectedAppointment) {
      let timeformat = "hh:mm A   DD/MM/YYYY";
      if (this.timeConvention === "24") {
        timeformat = "HH:mm   DD/MM/YYYY";
      }

      //time data 
      if (this.useCalendarEndpoint) {
        appointmentInfo += moment(this.selectedAppointment.start)
          .tz(
            this.selectedAppointment.branch.fullTimeZone ||
            this.selectedCalendarBranch.fullTimeZone
          )
          .format(timeformat);
      } else {
        appointmentInfo += moment(this.selectedAppointment.startTime)
          .format(timeformat);
      }

      appointmentInfo += `${this.selectedAppointment.customers[0] ? this.selectedAppointment.customers[0].firstName : ''} `;
      appointmentInfo += `${this.selectedAppointment.customers[0] ? this.selectedAppointment.customers[0].lastName : ''}`;
    }
    return appointmentInfo;
  }

  getSelectedAppointmentInfoTime() {
    let appointmentInfo = "";
    let timeformat = "hh:mm A";
    if (this.timeConvention === "24") {
      timeformat = "HH:mm";
    }

    if (this.selectedAppointment) {
      //time data 
      if (this.useCalendarEndpoint) {
        appointmentInfo += moment(this.selectedAppointment.start)
          .tz(
            this.selectedAppointment.branch.fullTimeZone ||
            this.selectedCalendarBranch.fullTimeZone
          )
          .format(timeformat);
      } else {
        appointmentInfo += moment(this.selectedAppointment.startTime)
          .format(timeformat);
      }

    }

    return appointmentInfo;
  }

  getSelectedAppointmentInfoDate() {
    let appointmentInfo = "";

    if (this.selectedAppointment) {
      //time data 
      if (this.useCalendarEndpoint) {
        appointmentInfo += moment(this.selectedAppointment.start)
          .tz(
            this.selectedAppointment.branch.fullTimeZone ||
            this.selectedCalendarBranch.fullTimeZone
          )
          .format(this.systemInformation.dateConvention);
      } else {
        appointmentInfo += moment(this.selectedAppointment.startTime)
          .format(this.systemInformation.dateConvention);
      }

    }

    return appointmentInfo;
  }


  getSelectedAppointmentInfoCustomer() {
    let appointmentInfo = "";

    if (this.selectedAppointment && this.selectedAppointment.customers[0]) {

      appointmentInfo += `${this.selectedAppointment.customers[0].firstName} `;
      appointmentInfo += `${this.selectedAppointment.customers[0].lastName}`;
    }

    return appointmentInfo;
  }



  deselectAppointment() {
    this.selectedAppointment = null;
    //this.arriveAppointmentDispatchers.deselectAppointment();
    this.showAppointmentCollection = true;
    this.selectedCustomer = null;
    this.appointments = this.defaultAppointmentCollection;
    this.appointmentDeselected.emit();
    this.showSearchResultsArea = true;
    const servicePointsSubscription = this.servicePointSelectors.uttParameters$
      .subscribe(params => {
        this.readAppointmentFetchTimePeriodFromUtt(params);
        this.currentSearchState = this.SEARCH_STATES.DURATION;
        this.searchAppointments();
      })
      .unsubscribe();

  }

  onCustomerSelect(customer: ICustomer) {
    this.customerSelectors.searchText$.subscribe((text) => {
      if (text) {
        this.searchText = `${customer.firstName} ${customer.lastName}`;
        this.showCustomerResults = false;
        this.showModalBackDrop = false;
        this.isSearchInputReadOnly = true;
        this.lastSearchAttempt = this.currentSearchState;

        if (this.useCalendarEndpoint) {
          this.appointmentDispatchers.searchCalendarAppointments({
            customerId: customer.id
          });
        } else {
          this.appointmentDispatchers.searchAppointments({
            customerId: customer.id
          });
        }
      }
    }).unsubscribe();

  }

  refreshAppointments() {
    if (this.isRefreshDisabled === false) {
      this.selectedSearchIcon = "";
      this.inputAnimationState = this.INITIAL_ANIMATION_STATE;
      const servicePointsSubscription = this.servicePointSelectors.uttParameters$
        .subscribe(params => {
          this.readAppointmentFetchTimePeriodFromUtt(params);

          this.currentSearchState = this.SEARCH_STATES.REFRESH;
          this.searchAppointments();
          setTimeout(() => {
            //<<<---    using ()=> syntax
            this.isRefreshDisabled = false;
          }, 30000);

          this.isRefreshDisabled = true;
        })
        .unsubscribe();
    }
  }

  doneButtonClick() {
    this.onFlowNext.emit();
  }

  onCancel() {
    this.inputAnimationState = "";
    this.selectedSearchIcon = "";
    this.showModalBackDrop = false;
  }

  showLoading() {
    return !this.isLoaded && this.isLoading;
  }

  showLoadingCustomers() {
    return !this.isSearchedCustomerLoaded && this.isSearchedCustomerLoading;
  }

  getSortIcons(sortColumn) {
    let sortConfig = {
      "icon-caret-up": this.sortColumn === sortColumn && this.isDescending,
      "icon-caret-down": ((this.sortColumn === sortColumn && !this.isDescending) || (this.sortColumn !== sortColumn)) ? true : false,
      "active-sort-column": this.sortColumn === sortColumn
    };

    return sortConfig;
  }

  openAppointmentInfoModal() {
    this.isShowAppointmentInfo = !this.isShowAppointmentInfo;
    if (this.expandedAppointment) {
      this.expandedAppointment.showInfo = false;
    }
  }

  showTimeFilter() {
    this.translateService
      .get(["heading.timefilter", "subheading.timefilter", "heading.date.timefilter"])
      .subscribe(messages => {
        this.modalService
          .openTimeFilter(
            this.useCalendarEndpoint ? messages["heading.date.timefilter"] : messages["heading.timefilter"],
            messages["subheading.timefilter"],
            false,
            this.useCalendarEndpoint,
            this.selectedFromTime,
            this.selectedToTime
          )
          .result.then((tfs: { start: moment.Moment; end: moment.Moment, date?: CalendarDate }) => {
            if (tfs && tfs.start && tfs.end) {
              this.fromTime = {
                hour: tfs.start.hour(),
                minute: 0,
                second: 0
              };

              this.toTime = {
                hour: tfs.end.hour(),
                minute: 0,
                second: 0
              };

              this.selectedFromTime = tfs.start;
              this.selectedToTime = tfs.end;
              this.selectedDate = tfs.date;
              this.currentSearchState = this.SEARCH_STATES.DURATION;
              this.searchAppointments();
            }
          });
      });
  }

  getSelectedAppointmentDetails(): string {
    return "";
  }

  onKeypressForTabComponent($event: KeyboardEvent) {

    switch ($event.keyCode) {

      case 39: //move next

        let nextTab = 0;
        if (this.activeTab < 2) {
          nextTab = this.activeTab + 1;
        }



        let tabLabel = this.tabberMap[nextTab];
        this.onSearchButtonClick(tabLabel);
        this.moveTabFocus(nextTab);
        break;

      case 37: //move previous

        let previousTab = 2;
        if (this.activeTab > 0) {
          previousTab = this.activeTab - 1;
        }

        let previousTabLabel = this.tabberMap[previousTab];
        this.onSearchButtonClick(previousTabLabel);
        this.moveTabFocus(previousTab);
        break;

      default:
        break;
    }
  }

  moveTabFocus(indexToFocus: number) {
    let tabObjects: any = document.querySelectorAll('[role="tab"]');
    if (tabObjects && tabObjects[indexToFocus]) {
      setTimeout(() => {
        tabObjects[indexToFocus].focus();
      });
    }
  }

  restrictNumbers($event) {
    if (this.isShowAppointmentNotFound) {
      this.isShowAppointmentNotFound = false;
    }

    if ($event.keyCode === 13 && this.searchText) {
      this.searchText = this.removeNonNumeric(this.searchText);
      this.onEnterPressed();
    }

    this.searchText = this.removeNonNumeric($event.target.value);
    this.clearInputDirective.update(this.searchText);
  }

  removeNonNumeric(input: String = '') {
    if (!input) {
      return '';
    }

    let targetString = '';
    for (var i = 0; i < input.length; i++) {
      if ("0123456789".indexOf(input.charAt(i)) !== -1) {
        targetString += input.charAt(i);
      }
    }

    return targetString;
  }

  sortAppointments(sortColumn: string) {
    /*this.sortState[sortColumn] =
      this.sortState[sortColumn] === 0 ? -1 : this.sortState[sortColumn] * -1;
      
    var index = this.sortColumnPriorities.indexOf(sortColumn);
    if (index > -1) {
      this.sortColumnPriorities.splice(index, 1);
    }

    this.sortColumnPriorities.unshift(sortColumn);
    //old code TBR

    if (!this.useCalendarEndpoint && sortColumn === SortColumns.startTimeDate) {
      return;
    }

    */

    if (this.sortColumn === sortColumn) {
      this.isDescending = !this.isDescending;
    } else {
      this.isDescending = false;
    }
    this.sortColumn = sortColumn;
  }
  foucusInput() {
    var searchBox = document.getElementById("idField") as any;
    searchBox.focus();
  }

  // not sure whether this is needed
  // onSearchChange(searchValue: string) {
  //   this.qrCodeValue = searchValue;
  // }

  // close qr view - when user pressed close button on QR modal 
  closeqr() {
    this.qrCodeValue = '';
    this.isQRReaderOpen = false;
    this.removeQRCodeListner();
    this.nativeApiDispatcher.closeQRCodeScanner();
    this.removeDesktopQRReader();
    this.getPreviousSearchState();
  }

  keydown($event) {
    const inputChar = String.fromCharCode($event.keyCode);
    $event.target.value.replace(/[^0-9]/g, "");
  }

  onAppointmentInfoClose($event: boolean) {
    if ($event) {
      this.isShowAppointmentInfo = false;
    }
  }

  expandAppointment(app) {
    if (this.expandedAppointment && this.expandedAppointment.id != app.id) {
      this.expandedAppointment.showInfo = false;
    }

    if (app) {
      app.showInfo = !app.showInfo;
    }
    this.expandedAppointment = app;
  }

  flowExitInvoked() {
    if (this.expandedAppointment) {
      this.expandedAppointment.showInfo = false;
    }
  }

  searchFieldValidation() {
    const regex = this.util.numberRegEx();
    const isValid = regex.test(this.searchText);
    return isValid;
  }
  // Arrow key functions
  onDownButttonPressed(i: number) {
    if (document.getElementById(`${i + 1}-appointment`)) {
      document.getElementById(`${i + 1}-appointment`).focus();
    }
  }
  onUpButttonPressed(i: number) {
    if (document.getElementById(`${i - 1}-appointment`)) {
      document.getElementById(`${i - 1}-appointment`).focus();
    }
  }
  onLeftButttonPressed(i: number) {
    if (this.userDirection.toLowerCase() == 'rtl') {
      if (document.getElementById(`${i}-more-info`)) {
        document.getElementById(`${i}-more-info`).focus();
      }
    }
  }
  onRightButttonPressed(i: number) {
    if (this.userDirection.toLowerCase() == 'ltr') {
      if (document.getElementById(`${i}-more-info`)) {
        document.getElementById(`${i}-more-info`).focus();
      }
    }
  }
  onLeftButttonPressedinInfo(i: number) {
    if (this.userDirection.toLowerCase() == 'ltr') {
      if (document.getElementById(`${i}-appointment`)) {
        document.getElementById(`${i}-appointment`).focus();
      }
    }
  }
  onRightButttonPressedinInfo(i: number) {
    if (this.userDirection.toLowerCase() == 'rtl') {
      if (document.getElementById(`${i}-appointment`)) {
        document.getElementById(`${i}-appointment`).focus();
      }
    }
  }

}
