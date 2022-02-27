import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ICustomerType } from 'src/models/ICustomerType';
import { IErpBranch } from 'src/models/IErpBranch';
import { BarcodeDispatchers, CustomerDispatchers, CustomerTypeDispatchers, CustomerTypeSelectors, ErpBranchSelectors, UserSelectors } from 'src/store';
import { whiteSpaceValidator } from 'src/util/custom-form-validators';
import { FLOW_TYPE } from 'src/util/flow-state';

@Component({
  selector: 'qm-customer-type',
  templateUrl: './qm-customer-type.component.html',
  styleUrls: ['./qm-customer-type.component.scss']
})
export class QmCustomerTypeComponent implements OnInit {
  customerTypeForm: FormGroup;
  private subscriptions: Subscription = new Subscription();

  customerTypes: ICustomerType[] = new Array<ICustomerType>();
  erpBranches: IErpBranch[] = new Array<IErpBranch>();

  selectedCustomerType: ICustomerType
  selectedErpBranch: IErpBranch
  viewStatus = { isCorporateSelected: false, isBarcodeSelected: false }

  // currentCustomerType: ICustomerType;
  numberOfCustomer: any;
  barcode: any

  isButtonEnabled = false
  userDirection$: Observable<string>;

  @Output()
  onFlowNext: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  flowType: FLOW_TYPE;

  inputText: string;

  constructor(
    private userSelector: UserSelectors,
    private customerTypeSelectors:CustomerTypeSelectors,
    private customerTypeDispatcher:CustomerTypeDispatchers,
    private barcodeDispatchers:BarcodeDispatchers,
    private erpBranchSelectors:ErpBranchSelectors
  ) {
    this.setDefault()
    this.onUserDirectionSubscribe()
    this.onCustomerTypeSubscriptions()
    this.onErpBranchSubscriptions()
   }

  ngOnInit(): void {
    // this.initCustomerTypeForm()
  }

  setDefault() {
    this.selectedCustomerType = {
      name: 'label.customer.type.select',
      id: -1
    }
    this.selectedErpBranch = {
      name: 'label.customer.type.select',
      id: -1
    }
  }

  onUserDirectionSubscribe() {
    this.userDirection$ = this.userSelector.userDirection$
  }
  onCustomerTypeSubscriptions() {
    const customerTypeSubscriptions = this.customerTypeSelectors.customerType$.subscribe(customerTypes => {
      this.customerTypes = customerTypes
    });
    this.subscriptions.add(customerTypeSubscriptions)
  }
  onErpBranchSubscriptions() {
    const erpBranchSubscriptions = this.erpBranchSelectors.erpBranches$.subscribe(bs => {
      this.erpBranches = bs
    })

    this.subscriptions.add(erpBranchSubscriptions)
  }

  onCustomerTypeSelect(customerType: ICustomerType) {
    if (customerType != null) {
      this.selectedCustomerType = customerType//{ id: customerType.id, name: customerType.name }
      // if (this.selectedCustomerType.id != customerType.id) {
      //   this.selectedCustomerType = customerType;
      // }
      if (customerType.id == 2) {
        // this.customDispatcher.fetchErpBranches()
        this.viewStatus.isCorporateSelected = true
        this.viewStatus.isBarcodeSelected = false
        this.isButtonEnabled = false
      } else if (customerType.id == 3) {
        this.viewStatus.isBarcodeSelected = true
        this.viewStatus.isCorporateSelected = false
        this.isButtonEnabled = false
      } else {
        this.isButtonEnabled = true
        this.viewStatus.isBarcodeSelected = false
        this.viewStatus.isCorporateSelected = false
      }
    }
  }

  onCompanyTypeSelect(erpBranch: IErpBranch) {
    this.selectedErpBranch.name = erpBranch.name
    this.selectedCustomerType.companyName = erpBranch.name
  }
  onNumberOfCustomerChange(event: any) {
    this.numberOfCustomer = event.target.value
    this.isButtonEnabled = this.numberOfCustomer != undefined && this.numberOfCustomer != ""
  }

  onBarcodeChange(event: any) {
    this.barcode = event.target.value
    this.isButtonEnabled = this.barcode != undefined && this.barcode != ""
  }

  goToNext() {
    if (this.isButtonEnabled) {
      this.selectedCustomerType.numberOfCustomer = this.numberOfCustomer
      this.customerTypeDispatcher.saveCustomerType(this.selectedCustomerType)
      this.barcodeDispatchers.saveBarcode({ value: this.barcode, requird: this.selectedCustomerType.id == 3 })
      this.onFlowNext.emit();
    }
  }

  collapseSiblingDropDowns(dd: any) {
    dd.isExpanded = false;
  }

  /**
   Donothing(event) {
    event.stopPropagation();
  }
  clearInputFeild(name) {
    this.customerTypeForm.markAsDirty();
    switch (name) {
      case "firstName": this.customerTypeForm.patchValue({ firstName: '' }); break;
      case "lastName": this.customerTypeForm.patchValue({ lastName: '' }); break;
      case "phone": this.customerTypeForm.patchValue({ phone: '' }); break;
      case "email": this.customerTypeForm.patchValue({ email: '' }); break;
    }
  }

  initCustomerTypeForm(){
    this.customerTypeForm = new FormGroup({
      phone: new FormControl('', Validators.required, whiteSpaceValidator),
    })
  }

  handleInput($event) {
    if ($event.target.value.length == 0) {
      
    }
  }
  keyDownFunction(event, visitSearchText: string) {
  
  }
   */

}
