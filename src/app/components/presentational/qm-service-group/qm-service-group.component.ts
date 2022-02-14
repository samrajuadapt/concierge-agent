import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { IBarcode } from 'src/models/IBarcode';
import { IService } from 'src/models/IService';
import { IServiceGroups } from 'src/models/IServiceGroups';
import { BarcodeDispatchers, BarcodeSelectors, NoteDispatchers, ServiceDispatchers, ServiceSelectors, UserSelectors, VariableSelectors } from 'src/store';
import { ConfigServices } from '../../../../util/services/config-service';
import { GlobalNotifyDispatchers } from 'src/store/services/global-notify';
import { FLOW_TYPE } from 'src/util/flow-state';
import { BroadcastService } from 'src/util/services/brodcast.service';
import { BROADCAST } from 'src/util/broadcast-state';
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


  allServices: IService[]
  serviceGroups: IServiceGroups[]
  selectedServices: IService[]

  mainCategory = []
  mainItem = []
  selected = []
  sortedServiceGroup = []
  selectedNameArray = new Map()
  selectedServiceGroupName = ""

  currentBarcode: IBarcode
  barcodeKeyword = "Pre"

  constructor(
    private userSelector: UserSelectors,
    private variableSelectors: VariableSelectors,
    private globalNotifyDispatchers: GlobalNotifyDispatchers,
    private noteDispatchers: NoteDispatchers,
    private serviceDispathers: ServiceDispatchers,
    private serviceSelectors: ServiceSelectors,
    private config: ConfigServices,
    private broadcast: BroadcastService,
    private barcodeDispatcher: BarcodeDispatchers,
    private barcodeSelectors: BarcodeSelectors
  ) {
    window["globalNotifyDispatchers"] = this.globalNotifyDispatchers;
    this.onServiceSubscribe()
    this.onServiceGroupSubcribe()
    this.onUserDirectionSubscribe()
    this.onBarcodeSubscribe()
    this.barcodeKeyword = config.getBarcodeKeyWord()
  }

  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  onBarcodeSubscribe() {
    const barcodeSubscribe = this.barcodeSelectors.barcode$.subscribe(barcode => {
      this.currentBarcode = barcode
    })
    this.subscriptions.add(barcodeSubscribe)
  }

  onServiceSubscribe() {
    const serviceSubscription = this.serviceSelectors.services$.subscribe(services => {
      this.allServices = services
    })
    this.subscriptions.add(serviceSubscription)
  }

  onServiceGroupSubcribe() {
    const variableSubscription = this.variableSelectors.variables$.subscribe(variables => {
      variables.forEach(v => {
        if (v.name == "servicesGroups") {
          this.serviceGroups = JSON.parse(v.value)
          this.buildServiceGroups(this.serviceGroups)
        }
      })
    })
    this.subscriptions.add(variableSubscription)
  }

  onUserDirectionSubscribe() {
    this.userDirection$ = this.userSelector.userDirection$
  }

  onMainCategoryClick(name, mi) {
    if (this.mainItem[mi]) {
      delete this.selected[name];
      delete this.mainItem[mi]
      this.selectedNameArray.delete(name)
      this.sortedServiceGroup[name].forEach(e => {
        e.disabled = true
        e.selected = false;
        e.forEach(e1 => {
          e1.disabled = true
          e1.selected = false;
        });
      });
    } else {
      this.mainItem[mi] = name
      this.selected[name] = [];
      for (let ind1 = 0; ind1 < this.sortedServiceGroup[name][0].length; ind1++) {
        this.sortedServiceGroup[name][0][ind1].disabled = false;
      }
      this.selectedNameArray.set(name, "")
    }
    // console.log(this.mainItem.)
  }

  onSubCategoryClick(name, i, j) {
    if (!this.sortedServiceGroup[name][i][j].disabled) {
      this.sortedServiceGroup[name][i].forEach(e => {
        e.selected = false
      });
      this.sortedServiceGroup[name][i][j].selected = true
      this.selected[name][i] = (this.sortedServiceGroup[name][i][j])
      if (this.sortedServiceGroup[name][i + 1]) {
        for (let ind1 = 0; ind1 < this.sortedServiceGroup[name][i + 1].length; ind1++) {
          this.sortedServiceGroup[name][i + 1][ind1].disabled = false;
        }
      }
    }

    // console.log(this.selected)
  }

  onSaveAndAddClick() {
    var name = ""
    for (var k in this.selected) {
      name = k
      this.selected[k].forEach(e => {
        name = `${name}-${e.name}`
      })

      if (this.sortedServiceGroup[k].length != this.selected[k].length) {
        var msg = `Select all category in ${k}`
        this.globalNotifyDispatchers.showWarning({ message: msg });
        setTimeout(() => {
          this.globalNotifyDispatchers.hideNotifications()
        }, 5000);
        return
      }
      this.selectedNameArray.set(k, name)
    }
    this.getSelectedServiceGroups()
  }

  getSelectedServiceGroups() {
    var isBarcodeRequired = false
    var tempArr = []
    var j = 1;
    this.selectedServiceGroupName = ""
    this.selectedServices = []
    if (this.selectedNameArray.size <= 0) {
      var msg = `Select atleast one category`
      this.globalNotifyDispatchers.showWarning({ message: msg });
      setTimeout(() => {
        this.globalNotifyDispatchers.hideNotifications()
      }, 5000);
      return;
    }

    this.selectedNameArray.forEach((v, k) => {
      if (v.includes(this.barcodeKeyword)) {
        isBarcodeRequired = true
      }
      this.selectedServiceGroupName += v.replace(/(\_)/g, "-").replace("-Typing", "")
      if (this.selectedNameArray.size > j || this.selectedNameArray.size < j) {
        this.selectedServiceGroupName += "-And-"
        j++;
      }
      this.serviceGroups.forEach(sg => {
        if (sg.id == v) {
          sg.services.forEach(service => {
            if (tempArr.indexOf(service.id) == -1) {
              tempArr.push(service.id);
              this.selectedServices.push(this.getServiceById(service.id))
            }
          })
        }
      })
    })

    // console.log(this.barcodeKeyword)
    if (this.currentBarcode.value != undefined) {
      isBarcodeRequired = true
    }

    this.noteDispatchers.saveNote({ text: this.selectedServiceGroupName })
    this.serviceDispathers.setSelectedServices(this.selectedServices)

    this.currentBarcode.requird = isBarcodeRequired
    this.barcodeDispatcher.saveBarcode(this.currentBarcode)
    this.broadcast.boradcast(BROADCAST.BARCODE_UPDATE, true)

    this.onFlowNext.emit()

  }

  buildServiceGroups(serviceGroups: IServiceGroups[]) {
    var nameArrays = []
    var group = []
    serviceGroups.forEach(sg => {
      nameArrays = sg.id.split("-")
      if (!this.mainCategory.includes(nameArrays[0])) {
        this.mainCategory.push(nameArrays[0])
      }
      for (let j = 0; j < nameArrays.length - 1; j++) {
        if (group[nameArrays[0]]) {
          if (group[nameArrays[0]][j] == undefined) {
            group[nameArrays[0]][j] = []
          }
          if (!group[nameArrays[0]][j].includes(nameArrays[j + 1])) {
            group[nameArrays[0]][j].push(nameArrays[j + 1])
          }
        } else {
          group[nameArrays[0]] = [[nameArrays[1]]]
        }
      }
      for (var k in group) {
        let data = [];
        let j = 0;
        group[k].forEach((e) => {
          e.forEach((i) => {
            if (data[j] != undefined) {
              data[j].push({ name: i, selected: false, disabled: true });
            }
            else {
              data[j] = [];
              data[j] = [{ name: i, selected: false, disabled: true }];
            }
          });
          j = j + 1;
        });

        this.sortedServiceGroup[k] = data;
      }
    })

    // console.log(this.sortedServiceGroup)
  }

  getServiceById(id: any) {
    var service: IService;
    this.allServices.forEach(s => {
      if (s.id == id) {
        service = s
      }
    })
    return service;
  }


}
