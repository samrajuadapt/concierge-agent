import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { IBarcode } from 'src/models/IBarcode';
import { IService } from 'src/models/IService';
import { IServiceGroups } from 'src/models/IServiceGroups';
import { BarcodeDispatchers, BarcodeSelectors, CustomerTypeSelectors, InfoMsgDispatchers, NoteDispatchers, ServiceDispatchers, ServiceSelectors, UserSelectors, VariableSelectors } from 'src/store';
import { ConfigServices } from '../../../../util/services/config-service';
import { GlobalNotifyDispatchers } from 'src/store/services/global-notify';
import { FLOW_TYPE } from 'src/util/flow-state';
import { BroadcastService } from 'src/util/services/brodcast.service';
import { BROADCAST } from 'src/util/broadcast-state';
import { ToastService } from 'src/util/services/toast.service';
import { ICustomerType } from 'src/models/ICustomerType';
// import { BROADCAST } from 'src/util/broadcast-state';

@Component({
  selector: 'qm-service-group',
  templateUrl: './qm-service-group.component.html',
  styleUrls: ['./qm-service-group.component.scss']
})
export class QmServiceGroupComponent implements OnInit {

  subscriptions: Subscription = new Subscription();
  userDirection$: Observable<string>;

  @Output()
  onFlowNext: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  flowType: FLOW_TYPE;


  allServices: IService[];
  waitingService:IService;

  serviceGroups: IServiceGroups[];
  selectedServices: IService[];

  currentCustomerType:ICustomerType

  mainCategory = [];
  mainItem = [];
  selected = [];
  sortedServiceGroup = [];
  selectedNameArray = new Map();
  selectedServiceGroupName = '';

  currentBarcode: IBarcode;
  barcodeKeyword = 'Pre';

  isProVisitCreated:boolean = false

  constructor(
    private userSelector: UserSelectors,
    private variableSelectors: VariableSelectors,
    private globalNotifyDispatchers: GlobalNotifyDispatchers,
    private toastService: ToastService,
    private noteDispatchers: NoteDispatchers,
    private serviceDispathers: ServiceDispatchers,
    private serviceSelectors: ServiceSelectors,
    private config: ConfigServices,
    private broadcast: BroadcastService,
    private barcodeDispatcher: BarcodeDispatchers,
    private barcodeSelectors: BarcodeSelectors,
    private customerTypeSelctors:CustomerTypeSelectors
  ) {
    window['globalNotifyDispatchers'] = this.globalNotifyDispatchers;
    this.onServiceSubscribe();
    this.onServiceGroupSubcribe();
    this.onUserDirectionSubscribe();
    this.onBarcodeSubscribe();
    this.onCustomerTypeSubscribe()
    this.onProVisitCreated()
    this.barcodeKeyword = config.getBarcodeKeyWord();
  }

  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onBarcodeSubscribe() {
    const barcodeSubscribe = this.barcodeSelectors.barcode$.subscribe(barcode => {
      this.currentBarcode = barcode;
    });
    this.subscriptions.add(barcodeSubscribe);
  }

  onServiceSubscribe() {
    const serviceSubscription = this.serviceSelectors.services$.subscribe(services => {
      this.allServices = services;
      this.waitingService = this.getServiceById(this.config.getWaitingServiceId())
    });
    this.subscriptions.add(serviceSubscription);
  }

  onServiceGroupSubcribe() {
    const variableSubscription = this.variableSelectors.variables$.subscribe(variables => {
      variables.forEach(v => {
        if (v.name == 'servicesGroups') {
          this.serviceGroups = JSON.parse(v.value);
          this.buildServiceGroups(this.serviceGroups);
        }
      });
    });
    this.subscriptions.add(variableSubscription);
  }


  onCustomerTypeSubscribe(){
    const customerTypeSubscription = this.customerTypeSelctors.currentCustomerType$.subscribe(customerType=>{
      // console.log("MFC","Service Group","Customer Type",customerType);
      this.currentCustomerType = customerType
    })
    this.subscriptions.add(customerTypeSubscription)
  }

  onProVisitCreated(){
    const provisitSubscriptions = this.broadcast.subscribe(BROADCAST.PRO_VISIT_CREATED,isCreated=>{
      if(isCreated){
        this.isProVisitCreated  = isCreated
      }
    })
    this.subscriptions.add(provisitSubscriptions)
  }

  onUserDirectionSubscribe() {
    this.userDirection$ = this.userSelector.userDirection$;
  }

  onMainCategoryClick(name, mi) {
    if (this.mainItem[mi]) {
      delete this.selected[name];
      delete this.mainItem[mi];
      this.selectedNameArray.delete(name);
      this.sortedServiceGroup[name].forEach(e => {
        e.disabled = true;
        e.selected = false;
        e.forEach(e1 => {
          e1.disabled = true;
          e1.selected = false;
        });
      });
    } else {
      this.mainItem[mi] = name;
      this.selected[name] = [];
      for (let ind1 = 0; ind1 < this.sortedServiceGroup[name][0].length; ind1++) {
        this.sortedServiceGroup[name][0][ind1].disabled = false;
      }
      this.selectedNameArray.set(name, '');
    }
    // console.log(this.mainItem.)
  }

  onSubCategoryClick(name, i, j) {
    if (!this.sortedServiceGroup[name][i][j].disabled) {
      this.sortedServiceGroup[name][i].forEach(e => {
        e.selected = false;
      });
      this.sortedServiceGroup[name][i][j].selected = true;
      this.selected[name][i] = (this.sortedServiceGroup[name][i][j]);
      if (this.sortedServiceGroup[name][i + 1]) {
        for (let ind1 = 0; ind1 < this.sortedServiceGroup[name][i + 1].length; ind1++) {
          this.sortedServiceGroup[name][i + 1][ind1].disabled = false;
        }
      }
    }

    // console.log(this.selected)
  }

  onSaveAndAddClick() {
    let name = '';
    for (const k in this.selected) {
      name = k;
      this.selected[k].forEach(e => {
        name = `${name}-${e.name}`;
      });

      if (this.sortedServiceGroup[k].length != this.selected[k].length) {
        const msg = `Select all category in ${k}`;
        this.toastService.errorToast(msg);
        return;
      }
      this.selectedNameArray.set(k, name);
    }
    this.getSelectedServiceGroups();
  }

  getSelectedServiceGroups() {
    let isBarcodeRequired = false;
    const tempArr = [];
    let j = 1;
    this.selectedServiceGroupName = '';
    this.selectedServices = [];
    
    if (this.selectedNameArray.size <= 0) {
      const msg = `Select atleast one category`;
      this.toastService.errorToast(msg);
      return;
    }

    if(this.currentCustomerType.id != undefined && this.currentCustomerType.id == 2){
      this.selectedServices.push(this.waitingService)
      if(!this.isProVisitCreated){
        this.selectedNameArray.forEach((v, k) => {
          if (v.includes(this.barcodeKeyword)) {
            isBarcodeRequired = true;
          }
          this.selectedServiceGroupName += v.replace(/(\_)/g, '-').replace('-Typing', '');
          if (this.selectedNameArray.size > j || this.selectedNameArray.size < j) {
            this.selectedServiceGroupName += '-And-';
            j++;
          }
        });
        this.config.getProServiceIds().forEach(id=>{
          this.selectedServices.push(this.getServiceById(id));
        })
      }else{
        this.selectedNameArray.forEach((v, k) => {
          if (v.includes(this.barcodeKeyword)) {
            isBarcodeRequired = true;
          }
          this.selectedServiceGroupName += v.replace(/(\_)/g, '-').replace('-Typing', '');
          if (this.selectedNameArray.size > j || this.selectedNameArray.size < j) {
            this.selectedServiceGroupName += '-And-';
            j++;
          }
          this.serviceGroups.forEach(sg => {
            if (sg.id == v) {
              sg.services.forEach(service => {
                if (tempArr.indexOf(service.id) == -1) {
                  tempArr.push(service.id);
                  this.selectedServices.push(this.getServiceById(service.id));
                }
              });
            }
          });
        });
      }
    }else{
      this.selectedNameArray.forEach((v, k) => {
        if (v.includes(this.barcodeKeyword)) {
          isBarcodeRequired = true;
        }
        this.selectedServiceGroupName += v.replace(/(\_)/g, '-').replace('-Typing', '');
        if (this.selectedNameArray.size > j || this.selectedNameArray.size < j) {
          this.selectedServiceGroupName += '-And-';
          j++;
        }
        this.serviceGroups.forEach(sg => {
          if (sg.id == v) {
            sg.services.forEach(service => {
              if (tempArr.indexOf(service.id) == -1) {
                tempArr.push(service.id);
                this.selectedServices.push(this.getServiceById(service.id));
              }
            });
          }
        });
      });
    }

    // console.log("MFC","Service Group","Selected Service",this.selectedServices);
    if (this.currentBarcode.value != undefined && this.currentBarcode.value != "No Barcode") {
      isBarcodeRequired = true;
    }

    this.noteDispatchers.saveNote({ text: this.selectedServiceGroupName });
    this.serviceDispathers.setSelectedServices(this.selectedServices);

    this.currentBarcode.requird = isBarcodeRequired;
    this.barcodeDispatcher.saveBarcode(this.currentBarcode);
    this.broadcast.boradcast(BROADCAST.BARCODE_UPDATE, true);

    this.onFlowNext.emit();

  }

  buildServiceGroups(serviceGroups: IServiceGroups[]) {
    let nameArrays = [];
    const group = [];
    serviceGroups.forEach(sg => {
      nameArrays = sg.id.split('-');
      if (!this.mainCategory.includes(nameArrays[0])) {
        this.mainCategory.push(nameArrays[0]);
      }
      for (let j = 0; j < nameArrays.length - 1; j++) {
        if (group[nameArrays[0]]) {
          if (group[nameArrays[0]][j] == undefined) {
            group[nameArrays[0]][j] = [];
          }
          if (!group[nameArrays[0]][j].includes(nameArrays[j + 1])) {
            group[nameArrays[0]][j].push(nameArrays[j + 1]);
          }
        } else {
          group[nameArrays[0]] = [[nameArrays[1]]];
        }
      }
      for (const k in group) {
        const data = [];
        let j = 0;
        group[k].forEach((e) => {
          e.forEach((i) => {
            if (data[j] != undefined) {
              data[j].push({ name: i, selected: false, disabled: true });
            } else {
              data[j] = [];
              data[j] = [{ name: i, selected: false, disabled: true }];
            }
          });
          j = j + 1;
        });

        this.sortedServiceGroup[k] = data;
      }
    });

    // console.log(this.sortedServiceGroup)
  }

  getServiceById(id: any) {
    let service: IService;
    this.allServices.forEach(s => {
      if (s.id == id) {
        service = s;
      }
    });
    return service;
  }


}
