import { Component, OnInit, Input } from '@angular/core';
import { ICustomer } from '../../../../models/ICustomer';
import { Subscription, Observable } from 'rxjs';
import { CustomerDispatchers, CustomerSelector, UserSelectors, SystemInfoSelectors, } from '../../../../store';
import { ISystemInfo } from 'src/models/ISystemInfo';

@Component({
  selector: 'qm-customer-search',
  templateUrl: './qm-customer-search.component.html',
  styleUrls: ['./qm-customer-search.component.scss']
})
export class QmCustomerSearchComponent implements OnInit {
  customersLoading: boolean;
  customerLoading$: Observable<boolean>;
  customerLoaded: boolean;
  customerLoaded$: Observable<boolean>;
  currentCustomer: ICustomer;
  currentCustomer$: Observable<ICustomer>;
  black: string = "black"
  customers: ICustomer[];
  customers$: Observable<ICustomer[]>
  private subscriptions: Subscription = new Subscription();
  userDirection$: Observable<string>;
  searchText: string;
  userDirection: string;


  // date format related variables
  systemInformation: ISystemInfo;
  dateType: string;
  separator: string;
  firstDateString: string;
  secondDateString: string;
  thirdDateString: string;



  @Input() public noCustomerFeedback: string = null;
  @Input() public isInArriveFlow: boolean = false;
  @Input() public isCustomerEditable: boolean = true;
  @Input() f: any;

  constructor(
    private CustomerDispatchers: CustomerDispatchers,
    private CustomerSelectors: CustomerSelector,
    private userSelectors: UserSelectors,
    private systemInfoSelectors: SystemInfoSelectors
  ) {
    this.userDirection$ = this.userSelectors.userDirection$;
    this.userDirection$.subscribe((ud) => {
      this.userDirection = ud;
    })
    this.customerLoading$ = this.CustomerSelectors.customerLoading$;
    this.customerLoaded$ = this.CustomerSelectors.customerLoaded$;
    this.currentCustomer$ = this.CustomerSelectors.currentCustomer$;

  }
  ngOnInit() {

    const searchTextSubscription = this.CustomerSelectors.searchText$.subscribe((searchText) => {
      this.searchText = searchText;
    })
    this.subscriptions.add(searchTextSubscription);
    const currentCustomerSubscription = this.CustomerSelectors.currentCustomer$.subscribe((customer) => {
      this.currentCustomer = customer;
    });
    this.subscriptions.add(currentCustomerSubscription);

    const customerSubscription = this.CustomerSelectors.customer$.subscribe((customer) => this.customers = customer);
    this.subscriptions.add(customerSubscription);

    if (this.isInArriveFlow) {
      const customerSubscription = this.CustomerSelectors.appointmentSearchCustomers$.subscribe((customer) => this.customers = customer);
      this.subscriptions.add(customerSubscription);
    } else {
      const customerSubscription = this.CustomerSelectors.customer$.subscribe((customer) => {
        this.customers = customer
      });
      this.subscriptions.add(customerSubscription);
    }

    this.customers$ = this.CustomerSelectors.customer$;

    const systemInfoSubscription = this.systemInfoSelectors.systemInfo$.subscribe(systemInfo => {
      this.systemInformation = systemInfo;
    });

    this.subscriptions.add(systemInfoSubscription)


    this.dateType = this.systemInformation.dateConvention;
    this.separator = this.dateType.substring(2, 3);
    this.firstDateString = this.dateType.substring(0, 1);
    this.secondDateString = this.dateType.substring(3, 4);
    this.thirdDateString = this.dateType.substring(6, 7);


    const customerLoadedSubscription = this.customerLoaded$.subscribe(
      (customerLoaded: boolean) => (this.customerLoaded = customerLoaded)
    )
    const customersLoadingSubscription = this.customerLoading$.subscribe(
      (customersLoading: boolean) => (this.customersLoading = customersLoading)
    )
    this.subscriptions.add(customerLoadedSubscription);
    this.subscriptions.add(customersLoadingSubscription);
  }


  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  editCustomer(customer: ICustomer) {
    this.CustomerDispatchers.editCustomerMode(true);
    this.CustomerDispatchers.selectCustomer(customer);
    setTimeout(() => {
      document.getElementById('panel-title').focus();
    }, 500);
    // this.CustomerDispatchers.resetCustomers();
  }

  showLoading() {
    return !this.customerLoaded && this.customersLoading;
  }

  showNoResults() {
    return this.customerLoaded && this.customers.length === 0;
  }

  selectCustomer(customer: ICustomer) {
    this.CustomerDispatchers.selectCustomer(customer);
    this.CustomerDispatchers.editCustomerMode(false);
    this.CustomerDispatchers.resetCustomers();
  }

  // Arrow key functions
  onDownButttonPressed(i: number) {
    if (document.getElementById(`${i + 1}-customer`)) {
      document.getElementById(`${i + 1}-customer`).focus();
    }
  }
  onUpButttonPressed(i: number) {
    if (document.getElementById(`${i - 1}-customer`)) {
      document.getElementById(`${i - 1}-customer`).focus();
    }
  }
  onLeftButttonPressed(i: number) {
    if (this.userDirection.toLocaleLowerCase() == 'rtl') {
      if (document.getElementById(`${i}-edit-btn`)) {
        document.getElementById(`${i}-edit-btn`).focus();
      }
    }
  }
  onRightButttonPressed(i: number) {
    if (this.userDirection.toLocaleLowerCase() == 'ltr') {
      if (document.getElementById(`${i}-edit-btn`)) {
        document.getElementById(`${i}-edit-btn`).focus();
      }
    }
  }
  onLeftButttonPressedinInfo(i: number) {
    if (this.userDirection.toLocaleLowerCase() == 'ltr') {
      if (document.getElementById(`${i}-customer`)) {
        document.getElementById(`${i}-customer`).focus();
      }
    }
  }
  onRightButttonPressedinInfo(i: number) {
    if (this.userDirection.toLocaleLowerCase() == 'rtl') {
      if (document.getElementById(`${i}-customer`)) {
        document.getElementById(`${i}-customer`).focus();
      }
    }
  }

  prepareDOB(dob: string) {


    var year = dob.substring(2, 4);
    var month = dob.substring(5, 7);
    var day = dob.substring(8, 10);

    if (this.firstDateString == "Y") {
      if (this.secondDateString == "M") {
        return year + this.separator + month + this.separator + day
      } else {
        return year + this.separator + day + this.separator + month
      }
    } else if (this.firstDateString == "M") {
      if (this.secondDateString == "D") {
        return month + this.separator + day + this.separator + year
      } else {
        return month + this.separator + year + this.separator + day
      }
    } else {
      if (this.secondDateString == "M") {
        return day + this.separator + month + this.separator + year
      } else {
        return day + this.separator + year + this.separator + month
      }
    }
  }
}
