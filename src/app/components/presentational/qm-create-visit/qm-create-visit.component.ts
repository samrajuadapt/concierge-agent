import { Component, OnInit, ViewChild } from '@angular/core';
import { ServicePointSelectors, ServiceSelectors, CustomerSelector, TimeslotDispatchers, CustomerTypeDispatchers,ErpBranchDispatcher,VariablesDispathers, CustomerDispatchers, EmiratesIdDispatchers
 } from 'src/store/services';
import { Subscription } from 'rxjs';
import { FLOW_TYPE } from '../../../../util/flow-state';
import { IService } from '../../../../models/IService';
import { ICustomer } from '../../../../models/ICustomer';
import { LocalStorage, STORAGE_SUB_KEY } from '../../../../util/local-storage';

export enum CUSTOMER_SAVE_OPTION {
  DB = 'db',
  VISIT = 'visit'
}

@Component({
  selector: 'qm-qm-create-visit',
  templateUrl: './qm-create-visit.component.html',
  styleUrls: ['./qm-create-visit.component.scss']
})
export class QmCreateVisitComponent implements OnInit {

  @ViewChild('f', { static: true }) f: any;
  @ViewChild('pc') pc: any;
  @ViewChild('px', { static: true }) px: any;

  private subscriptions: Subscription = new Subscription();
  private _isFlowSkip: boolean = false;
  isCustomerFlowHidden: boolean;
  flowType = FLOW_TYPE.CREATE_VISIT;
  selectedServices: IService[];
  currentCustomer: ICustomer;
  isCustomerStoreDB: boolean;

  get isFlowSkip(): boolean {
    return this.localStorage.getSettingForKey(STORAGE_SUB_KEY.CUSTOMER_SKIP);
  }

  isCustomerHeaderVisible: boolean = false;

  constructor(
    private servicePointSelectors: ServicePointSelectors,
    private serviceSelectors: ServiceSelectors,
    private customerSelectors: CustomerSelector,
    private localStorage: LocalStorage,
    private timeSlotDispatchers: TimeslotDispatchers,
    private customerTypeDispatchers:CustomerTypeDispatchers,
    private erpBranchDispatcher:ErpBranchDispatcher,
    private variableDisaptcher:VariablesDispathers,
    private customerDispatcher:CustomerDispatchers,
    private emiratesIdDispatcher:EmiratesIdDispatchers
  ) {

    const servicePointsSubscription = this.servicePointSelectors.uttParameters$.subscribe((params) => {
      if (params !== null && params !== undefined) {
        this.isCustomerFlowHidden = params.hideCustomer;
        if (params.saveCustomerOption === CUSTOMER_SAVE_OPTION.VISIT) {
          this.isCustomerStoreDB = false;
        } else {
          this.isCustomerStoreDB = true;
        }
      }
    });
    this.subscriptions.add(servicePointsSubscription);

    const servicesSubscription = this.serviceSelectors.selectedServices$.subscribe((services) => {
      if (services !== null) {
        this.selectedServices = services;
      }
    });
    this.subscriptions.add(servicesSubscription);

    const customerSubscription = this.customerSelectors.currentCustomer$.subscribe((customer) => {
      this.currentCustomer = customer;
      if (this.isCustomerStoreDB) {
        this.currentCustomer = customer;
      }
    });
    this.subscriptions.add(customerSubscription);

    const tempCustomerSubscription = this.customerSelectors.tempCustomer$.subscribe((customer) => {
      if (!this.isCustomerStoreDB) {
        this.currentCustomer = customer;
      }
    });
    this.subscriptions.add(tempCustomerSubscription);
  }

  ngOnInit() {
    this.emiratesIdDispatcher.resetEmirateId()
    this.customerDispatcher.resetCustomerCard()
    this.customerTypeDispatchers.fetchCustomerType()
    this.erpBranchDispatcher.fetchErpBranches()
    this.variableDisaptcher.fetchVariables()
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  setPanelClick() {
    if (this.isCustomerFlowHidden || this.isFlowSkip) {
      this.f.onFlowNext(this.px);
      if (!(this.isCustomerFlowHidden)) {
        this.isCustomerHeaderVisible = true;
      }
    }
    else {
      this.f.onFlowNext(this.pc);
    }
  }
  // deselectTime(){
  //   this.timeSlotDispatchers.deselectTimeslot();
  // }
}
