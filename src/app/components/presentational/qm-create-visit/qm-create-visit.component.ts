import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { ServicePointSelectors, ServiceSelectors, CustomerSelector, TimeslotDispatchers, CustomerTypeDispatchers, ErpBranchDispatcher, VariablesDispathers, CustomerDispatchers, EmiratesIdDispatchers, CustomerTypeSelectors
 } from 'src/store/services';
import { Subscription } from 'rxjs';
import { FLOW_TYPE } from '../../../../util/flow-state';
import { IService } from '../../../../models/IService';
import { ICustomer } from '../../../../models/ICustomer';
import { LocalStorage, STORAGE_SUB_KEY } from '../../../../util/local-storage';
import { ICustomerType } from 'src/models/ICustomerType';

export enum CUSTOMER_SAVE_OPTION {
  DB = 'db',
  VISIT = 'visit'
}

@Component({
  selector: 'qm-qm-create-visit',
  templateUrl: './qm-create-visit.component.html',
  styleUrls: ['./qm-create-visit.component.scss']
})
export class QmCreateVisitComponent implements OnInit, OnDestroy {

  @ViewChild('f', { static: true }) f: any;
  @ViewChild('pc') pc: any;
  @ViewChild('px', { static: true }) px: any;
  @ViewChild('psg', { static: true }) psg: any;

  private subscriptions: Subscription = new Subscription();
  private _isFlowSkip = false;
  isCustomerFlowHidden: boolean;
  flowType = FLOW_TYPE.CREATE_VISIT;
  selectedServices: IService[];
  currentCustomer: ICustomer;
  isCustomerStoreDB: boolean;

  currentCustomerType:ICustomerType
  currentCustomerCount:number

  get isFlowSkip(): boolean {
    return this.localStorage.getSettingForKey(STORAGE_SUB_KEY.CUSTOMER_SKIP);
  }

  isCustomerHeaderVisible = false;

  constructor(
    private servicePointSelectors: ServicePointSelectors,
    private serviceSelectors: ServiceSelectors,
    private customerSelectors: CustomerSelector,
    private localStorage: LocalStorage,
    private timeSlotDispatchers: TimeslotDispatchers,
    private customerTypeDispatchers: CustomerTypeDispatchers,
    private erpBranchDispatcher: ErpBranchDispatcher,
    private variableDisaptcher: VariablesDispathers,
    private customerDispatcher: CustomerDispatchers,
    private emiratesIdDispatcher: EmiratesIdDispatchers,
    private customerTypeSelectors:CustomerTypeSelectors
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

    const customerTypeSubscriptions = this.customerTypeSelectors.currentCustomerType$.subscribe((customerType) => {
      // console.log("MFC","Create Visit","Customer Type",customerType);
      this.currentCustomerType = customerType
    });
    this.subscriptions.add(customerTypeSubscriptions);

  }

  ngOnInit() {
    this.emiratesIdDispatcher.resetEmirateId()
    this.customerDispatcher.resetCustomerCard()

    this.customerTypeDispatchers.restCustomerType()
    this.customerTypeDispatchers.fetchCustomerType();
    this.erpBranchDispatcher.fetchErpBranches();
    this.variableDisaptcher.fetchVariables();
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
    } else {
      this.f.onFlowNext(this.pc);
    }
  }
  onVisitCreateComplete(){
    if(this.currentCustomerType.id == 2){
      // this.f.onFlowNext(this.psg);
      this.checkCustomerCount()
    }else{
      this.f.onFlowExit(this.px,true);
    }
  }

  checkCustomerCount(){
    this.customerTypeSelectors.customerCount$.subscribe((c) => {
      // console.log("MFC","Create Visit","count",c);
      if(this.currentCustomerType.numberOfCustomer == c){
        this.f.onFlowExit(this.px,true);
      }else{
        this.f.onFlowNext(this.psg);
      }
    }).unsubscribe();
  }
  // deselectTime(){
  //   this.timeSlotDispatchers.deselectTimeslot();
  // }
}
