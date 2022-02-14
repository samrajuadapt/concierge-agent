import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AutoClose } from '../../../../util/services/autoclose.service';
import { UserSelectors, CustomerDispatchers, CustomerDataService, CustomerSelector, ServicePointSelectors, SystemInfoSelectors, BarcodeSelectors, EmiratesIdDispatchers, EmiratesIdSelectors, BarcodeDispatchers } from '../../../../store';
import { FormGroup, FormControl, FormBuilder, FormArray, FormGroupDirective, Validators, AbstractControl, } from '@angular/forms';
import { ICustomer } from '../../../../models/ICustomer';
import { first } from '../../../../../node_modules/rxjs/operators';
import { whiteSpaceValidator } from '../../../../util/custom-form-validators';
import { Util } from '../../../../util/util';
import { NgOption } from '@ng-select/ng-select';
import { TranslateService } from '@ngx-translate/core';
import { ThrowStmt } from '@angular/compiler';
import { IUTTParameter } from 'src/models/IUTTParameter';
import { LanguageDispatchers, LanguageSelectors } from 'src/store/services/language';
import { ILanguage } from 'src/models/ILanguage';
import { FLOW_TYPE } from 'src/util/flow-state';
import { BroadcastService } from 'src/util/services/brodcast.service';
import { IBarcode } from 'src/models/IBarcode';
import { BROADCAST } from 'src/util/broadcast-state';
import { USER_IMG } from 'src/util/url-helper';
import { IEidCustomer } from 'src/models/IEidCustomer';
import { ConfigServices } from 'src/util/services/config-service';
import { WebsocketService } from 'src/util/services/websocket.service';

@Component({
  selector: 'qm-inputbox',
  templateUrl: './qm-inputbox.component.html',
  styleUrls: ['./qm-inputbox.component.scss']
})
export class QmInputboxComponent implements OnInit {
  @Input() flowType: FLOW_TYPE;
  customerCreateForm: FormGroup;
  countrycode: string;
  dobRequired: boolean;
  editCustomer: ICustomer;
  editCustomer$: Observable<ICustomer>;
  userDirection$: Observable<string>;
  isButtonPressed: boolean = false;
  customers: ICustomer[];
  customers$: Observable<ICustomer[]>
  private subscriptions: Subscription = new Subscription();
  countryCodeNumber: string;
  day: number;
  controls: any;
  currentCustomer: ICustomer
  editMode: boolean;
  isExpanded = false;
  isLangExpanded = false;
  dateError = {
    days: '',
    month: ''
  };
  public isLanguageSelectEnabled: boolean = true;
  public dobOrder = { month: 0, day: 1, year: 2 };
  public languages: NgOption[] = [];
  uttParameters$: Observable<IUTTParameter>;
  languages$: Observable<ILanguage[]>;
  supportedLanguagesArray: ILanguage[];

  @Output()
  onFlowNext: EventEmitter<any> = new EventEmitter();

  date = {
    day: '',
    month: '',
    year: ''
  };

  isMonthFocus = false;
  isLanguageFocus = false;

  firstName: string

  barcodeRequired = false;
  currentBarcode: IBarcode

  profileImage = USER_IMG
  currentEidCustomer: IEidCustomer;
  isCustomerFromCard = false

  private dateLabelKeys: string[] = [
    'calendar.month.none',
    'calendar.month.january',
    'calendar.month.february',
    'calendar.month.march',
    'calendar.month.april',
    'calendar.month.may',
    'calendar.month.june',
    'calendar.month.july',
    'calendar.month.august',
    'calendar.month.september',
    'calendar.month.october',
    'calendar.month.november',
    'calendar.month.december'
  ];


  public months: NgOption[];

  constructor(
    private servicePointSelectors: ServicePointSelectors,
    public autoCloseService: AutoClose,
    private userSelectors: UserSelectors,
    private fb: FormBuilder,
    private customerDispatchers: CustomerDispatchers,
    private customerSelectors: CustomerSelector,
    private util: Util,
    private translateService: TranslateService,
    public LanguageSelectors: LanguageSelectors,
    public languageDispatchers: LanguageDispatchers,
    public systemInfoSelectors: SystemInfoSelectors,
    private barcodeSelectors:BarcodeSelectors,
    private barcodeDispatchers:BarcodeDispatchers,
    private broadcast:BroadcastService,
    private emiratesIdDispatchers:EmiratesIdDispatchers,
    private emiratesIdSelectors:EmiratesIdSelectors,
    private configService:ConfigServices,
    private websocket:WebsocketService
  ) {
    // this.editCustomer$ = this.customerSelectors.editCustomer$;
    this.userDirection$ = this.userSelectors.userDirection$;
    this.languages$ = this.LanguageSelectors.languages$;
  }

  ngOnInit() {
    // get country code
    const broadcastSubscriptions = this.broadcast.subscribe(BROADCAST.BARCODE_UPDATE,isUpdated=>{
      if(isUpdated){
        this.barcodeSelectors.barcode$.subscribe(barcode => {
          this.currentBarcode = barcode;
          this.barcodeRequired = this.currentBarcode.requird
          this.customerCreateForm.patchValue({
            barcode: this.currentBarcode.value != undefined ? this.currentBarcode.value : "No Barcode"
          })
        }).unsubscribe()
      }
    })
    this.subscriptions.add(broadcastSubscriptions)
    const servicePointsSubscription = this.servicePointSelectors.uttParameters$.subscribe((params) => {
      if (params) {
        this.countrycode = params.countryCode;
        this.isLanguageSelectEnabled = params.notificationLanguage;
        this.dobRequired = params.birthdateRequired;
        this.isLanguageSelectEnabled = params.notificationLanguage;
        if (this.isLanguageSelectEnabled) {
          this.languageDispatchers.fetchLanguages();
        }
      }
    });
    this.subscriptions.add(servicePointsSubscription);

    const systemInfoDateSubscription = this.systemInfoSelectors.dateConvention$.subscribe(
      (val: string) => {
        if (val) {
          var objArr = val.split('-');
          if (objArr.length !== 3) {
            objArr = val.split('/');
          }
          this.dobOrder.day = objArr.indexOf('DD');
          this.dobOrder.month = objArr.indexOf('MM');
          this.dobOrder.year = objArr.indexOf('YY');
        }

      }
    );
    this.subscriptions.add(systemInfoDateSubscription);

    // patch values if current customer available
    const CurrentcustomerSubscription = this.customerSelectors.currentCustomer$.subscribe((customer) => {
      this.currentCustomer = customer;
      if (this.currentCustomer) {
        const dob: any = this.currentCustomer.properties.dateOfBirth;
        this.date = this.formatDate(
          dob.substring(8,10),
          parseInt(dob.substring(5,7)) - 1,
          dob.substring(0,4)
        );


        this.customerCreateForm.patchValue({
          firstName: this.currentCustomer.firstName,
          lastName: this.currentCustomer.lastName,
          phone: this.currentCustomer.properties.phoneNumber,
          email: this.currentCustomer.properties.email,
          card: this.currentCustomer.cardNumber,
          dateOfBirth: {
            month: this.date.month ? this.date.month : null,
            day: this.date.day ? this.date.day : '',
            year: this.date.year ? this.date.year : ''
          },
          language: this.currentCustomer.properties.lang
        })
      } else if ((this.customerCreateForm !== undefined) && !this.currentCustomer) {

        this.customerCreateForm.patchValue({
          firstName: '',
          lastName: '',
          phone: this.countrycode,
          card:'',
          email: '',
          dateOfBirth: {
            month: null,
            day: '',
            year: ''
          },
          language: ''
        })
      }
    });
    this.subscriptions.add(CurrentcustomerSubscription);

    const editModeSubscription = this.customerSelectors.editCustomerMode$.subscribe((status) => {
      this.editMode = status;
    })
    this.subscriptions.add(editModeSubscription);

    const eidCustomerSubscription = this.emiratesIdSelectors.emiratesIdCustomer$.subscribe(eidCustomer => {
      if (eidCustomer.cardNumber != undefined) {
        this.currentEidCustomer = eidCustomer
        this.customerDispatchers.fetchCustomersByCard(eidCustomer.cardNumber)
      }
    })
    this.subscriptions.add(eidCustomerSubscription)

    const searchEidCustomerSubscriptions = this.customerSelectors.cardCustomer$.subscribe(customers => {
      if (customers.length > 0) {
        this.isCustomerFromCard = true
        this.currentCustomer = customers[0]
        this.setCustomerData()
        // this.customerDispatchers.selectCustomer(this.currentCustomer)
      } else {
        this.setEidCustomer(this.currentEidCustomer)
      }
    })
    this.subscriptions.add(searchEidCustomerSubscriptions)

    const websocketsubscriptions = this.websocket.connect(this.configService.getWebSocketUrl()).subscribe(
      (response: MessageEvent) => {
        let data = JSON.parse(response.data);
        console.log("websocket data => "+ data);
        let splitData = data.split("\n");

        console.log(splitData);
        let firstLine = splitData[0].split(" ");
        let secondLine = splitData[1].split(":");
        let thirdLine = splitData[2].split(":");
        let fourthLine = splitData[3].split(":");
        let fifthLine = splitData[4].split(":");
        let sixthLine = splitData[5].split(":");
      
        let firstName = firstLine[0];
        let lastName = firstLine[firstLine.length - 1];
        let emiratesId = secondLine[1];
        let nationality = thirdLine[1];
        let dob = fourthLine[1];
        let expiryDate = fifthLine[1];
        let cardNumber = sixthLine[1];

        this.customerCreateForm.patchValue({
          firstName: firstName,
          lastName: lastName,
          card: cardNumber,
          dateOfBirth: dob
        })
      }
    );
    this.subscriptions.add(websocketsubscriptions)


    // Validators
    const today = new Date();
    const phoneValidators = this.util.phoneNoValidator();
    const emailValidators = this.util.emailValidator();
    let dayValidators = [Validators.maxLength(2), Validators.max(31), Validators.min(1), this.util.numberValidator()];
    let yearValidators = [Validators.maxLength(4), Validators.minLength(4), Validators.max(today.getFullYear()), Validators.min(today.getFullYear() - 125), this.util.numberValidator()];
    let monthValidators = [];
    if (this.dobRequired) {
      dayValidators.push(Validators.required);
      yearValidators.push(Validators.required);
      monthValidators.push(Validators.required);
    }
    //subscribe customer List 
    const customerSubscription = this.customerSelectors.customer$.subscribe((customer) => this.customers = customer);
    this.subscriptions.add(customerSubscription);

    this.customers$ = this.customerSelectors.customer$;

    // Customer creation form
    this.customerCreateForm = new FormGroup({
      firstName: new FormControl('', Validators.required, whiteSpaceValidator),
      lastName: new FormControl('', Validators.required, whiteSpaceValidator),
      phone: new FormControl(this.countrycode, phoneValidators),
      email: new FormControl('', emailValidators),
      barcode: new FormControl('',Validators.required, whiteSpaceValidator),
      card: new FormControl('',Validators.required, whiteSpaceValidator),
      dateOfBirth: this.fb.group(
        {
          month: [null, monthValidators],
          day: ['', dayValidators],
          year: ['', yearValidators]
        },
        {
          validator: this.isValidDOBEntered.bind(this)
        }
      ),
      language: new FormControl(''),
    })



    // Add month names to an array
    const translateSubscription = this.translateService
      .get(this.dateLabelKeys)
      .subscribe((dateLabels: string[]) => {
        this.months = [
          { value: '', label: dateLabels['calendar.month.none'] },
          { value: '01', label: dateLabels['calendar.month.january'] },
          { value: '02', label: dateLabels['calendar.month.february'] },
          { value: '03', label: dateLabels['calendar.month.march'] },
          { value: '04', label: dateLabels['calendar.month.april'] },
          { value: '05', label: dateLabels['calendar.month.may'] },
          { value: '06', label: dateLabels['calendar.month.june'] },
          { value: '07', label: dateLabels['calendar.month.july'] },
          { value: '08', label: dateLabels['calendar.month.august'] },
          { value: '09', label: dateLabels['calendar.month.september'] },
          { value: '10', label: dateLabels['calendar.month.october'] },
          { value: '11', label: dateLabels['calendar.month.november'] },
          { value: '12', label: dateLabels['calendar.month.december'] }
        ];
      });

    this.subscriptions.add(translateSubscription);

    // Add customer status place country code
    if (this.countrycode && !this.currentCustomer) {
      this.customerCreateForm.patchValue({
        phone: this.countrycode
      })
    }
    else if (this.countrycode && this.currentCustomer && !this.editCustomer.properties.phoneNumber) {
      this.customerCreateForm.patchValue({
        phone: this.countrycode
      })
    }

    let languagesSubscription = this.languages$.subscribe((languages) => {
      this.supportedLanguagesArray = languages;
      if (this.supportedLanguagesArray && (this.languages.length !== languages.length)) {
        this.supportedLanguagesArray = this.supportedLanguagesArray.filter(lang => lang.key !== 'defaultLanguage');
        this.languages = this.supportedLanguagesArray
          .map(language => ({
            value: language.key,
            label: language.value
          }));
        const langChangeSubscription = this.translateService
          .get('label.language.defaultlanguage')
          .subscribe(
            (languageText: string) => {
              this.languages.unshift({ value: '', label: languageText })
            }
          ).unsubscribe();

        this.subscriptions.add(langChangeSubscription);
      }
      if (languages === null) {
        const langChangeSubscription = this.translateService
          .get('label.language.defaultlanguage')
          .subscribe(
            (languageText: string) => {
              this.languages.unshift({ value: '', label: languageText })
            }
          ).unsubscribe();
      }
    })
    this.subscriptions.add(languagesSubscription);
  }

  clearCustomerForm() {
    if (this.customerCreateForm !== undefined) {
      this.customerCreateForm.markAsPristine();
      this.customerCreateForm.controls.dateOfBirth.markAsPristine();
      this.profileImage = USER_IMG

      this.customerCreateForm.patchValue({
        firstName: '',
        lastName: '',
        phone: this.countrycode,
        email: '',
        barcode: '',
        card:'',
        dateOfBirth: {
          month: null,
          day: '',
          year: ''
        },
        language: ''
      });


    }
  }

  public accept() {
    if (this.customerCreateForm.valid) {
      if (this.currentCustomer) {
        this.customerDispatchers.updateCustomer(this.preparedCustomer());
        this.customerDispatchers.selectCustomer(this.preparedCustomer());
        this.customerDispatchers.editCustomerMode(false);
      } else {
        this.customerDispatchers.createCustomer(this.trimCustomer());
      }
    }
    this.customerCreateForm.markAsPristine()
  }

  // When customer edit and do not chage (add btn) 
  public next() {
    this.customerDispatchers.editCustomerMode(false);
    this.customerCreateForm.markAsPristine()
  }


  trimCustomer(): ICustomer {
    if (this.customerCreateForm.value.phone == this.countrycode) {
      this.customerCreateForm.value.phone = "";
    }
    const customerSave: ICustomer = {
      firstName: this.customerCreateForm.value.firstName.trim(),
      lastName: this.customerCreateForm.value.lastName.trim(),
      cardNumber:this.customerCreateForm.value.card.trim(),
      properties: this.customerCreateForm.value.language
        ? {
          phoneNumber: this.customerCreateForm.value.phone.trim(),
          email: this.customerCreateForm.value.email.trim(),
          dateOfBirth: this.getDateOfBirth(),
          profileImage: this.profileImage,
          lang: this.customerCreateForm.value.language,
        }
        : {
          phoneNumber: this.customerCreateForm.value.phone.trim(),
          email: this.customerCreateForm.value.email.trim(),
          profileImage: this.profileImage,
          dateOfBirth: this.getDateOfBirth(),
        }
    };
    return customerSave
  }


  preparedCustomer(): ICustomer {

    if (this.currentCustomer) {
      this.editCustomer = this.currentCustomer;
      const customerToSave: ICustomer = {
        ...this.editCustomer,
        ...this.trimCustomer(),
        id: this.editCustomer.id
      }
      return customerToSave
    } else {
      const customerToSave: ICustomer = {
        ...this.trimCustomer()
      }
      return customerToSave
    }

  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  Donothing(event) {
    event.stopPropagation();
  }
  // Date of Birth validation
  isValidDOBEntered(control: FormGroup) {
    let errors = null;
    if (control.value) {

    
      // invalid date check for leap year
      if (control.value.year && control.value.month && control.value.day) {
        const d = new Date(
          control.value.year,
          parseInt(control.value.month, 10) - 1,
          control.value.day
        );
        if (new Date() < d) {
          errors = { ...errors, futureDate: true };
        }

        if (d && d.getMonth() + 1 !== parseInt(control.value.month, 10)) {
          control.setErrors({
            invalidDay: true
          });
          errors = { ...errors, invalidDay: true };
        }
      } else if (
        control.value.year ||
        control.value.month ||
        control.value.day
      ) {
        control.setErrors({
          incompleteDay: true
        });
        errors = { ...errors, incompleteDob: true };
      }
    }
    return errors;
  }
  // restric input feild of birth date and year to numbers
  restrictNumbers($event) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode($event.charCode);

    if (!pattern.test(inputChar)) {
      $event.target.value = $event.target.value.replace(/[^0-9\+\s]/g, '');
      this.customerCreateForm.patchValue({ phone: $event.target.value })
    }
  }

  formatDate(day, month, year) {
    let newDay, newMonth;
    if (day !== '' || day !== undefined) {
      const intDay = parseInt(day, 10);
      newDay = intDay;
      if (intDay < 10) {
        newDay = '0' + intDay;
      }
    }

    if (month !== '' || month !== undefined) {
      const intMonth = parseInt(month, 10) + 1;
      if (intMonth < 10) {
        newMonth = '0' + intMonth;
      } else {
        newMonth = intMonth.toString();
      }
    }

    return {
      day: newDay,
      month: newMonth,
      year: year
    };
  }

  // Format date of birth to be sent in the API
  getDateOfBirth(): string {
    const formModel = this.customerCreateForm.value;
    let year = String(formModel.dateOfBirth.year);
    const month = formModel.dateOfBirth.month as string;
    let day = formModel.dateOfBirth.day as string;

    if (day && parseInt(day, 10)) {
      const intDay = parseInt(day, 10);
      if (intDay < 10) {
        day = '0' + intDay;
      }
    }
    year = this.leftPadWithZeros(year, 4);
    return year && month && day ? year + '-' + month + '-' + day : '';
  }

  // Add 0 to make the year as 4 digits
  leftPadWithZeros(sourceString, length) {
    while (sourceString.length < length) {
      sourceString = '0' + sourceString;
    }
    return sourceString;
  }


  cancel() {
    this.customerDispatchers.resetCurrentCustomer();
    this.customerDispatchers.editCustomerMode(false);
  }

  update() {
    this.currentBarcode.value = this.customerCreateForm.value.barcode
    this.barcodeDispatchers.saveBarcode(this.currentBarcode)
    this.broadcast.boradcast(BROADCAST.BARCODE_UPDATE,true)
    if (
      this.customerCreateForm.valid &&
      (this.currentCustomer.firstName != this.customerCreateForm.value.firstName ||
        this.currentCustomer.lastName != this.customerCreateForm.value.lastName ||
        this.currentCustomer.properties.phoneNumber != this.customerCreateForm.value.phone ||
        this.currentCustomer.properties.email != this.customerCreateForm.value.email ||
        (this.date.year && this.date.year != this.customerCreateForm.value.dateOfBirth.year) ||
        (!this.date.year && this.customerCreateForm.value.dateOfBirth.year) ||
        (this.date.day && this.date.day != this.customerCreateForm.value.dateOfBirth.day) ||
        (!this.date.day && this.customerCreateForm.value.dateOfBirth.year) ||
        this.date.month != this.customerCreateForm.value.dateOfBirth.month) ||
      this.currentCustomer.properties.lang != this.customerCreateForm.value.language
    ) {
      this.accept();
    } else if (this.customerCreateForm.valid && this.customerCreateForm.dirty) {
      if(this.isCustomerFromCard){
        this.customerDispatchers.selectCustomer(this.preparedCustomer());
      }
      this.onFlowNext.emit();
      this.customerCreateForm.markAsPristine();
    }
  }
  discard() {
    this.onFlowNext.emit();
    this.customerCreateForm.markAsPristine()
    this.customerCreateForm.patchValue({
      firstName: this.currentCustomer.firstName,
      lastName: this.currentCustomer.lastName,
      phone: this.currentCustomer.properties.phoneNumber,
      email: this.currentCustomer.properties.email,
      barcode:this.currentBarcode.value,
      card:this.currentCustomer.cardNumber,
      dateOfBirth: {
        month: this.date.month ? this.date.month : null,
        day: this.date.day ? this.date.day : '',
        year: this.date.year ? this.date.year : ''
      }
    })

  }

  clearInputFeild(name) {
    this.customerCreateForm.markAsDirty();
    switch (name) {

      case "firstName": this.customerCreateForm.patchValue({ firstName: '' }); break;
      case "lastName": this.customerCreateForm.patchValue({ lastName: '' }); break;
      case "phone": this.customerCreateForm.patchValue({ phone: '' }); break;
      case "email": this.customerCreateForm.patchValue({ email: '' }); break;
      case "barcode": this.customerCreateForm.patchValue({ barcode: '' }); break;
      case "card": this.customerCreateForm.patchValue({ card: '' }); break;

    }
  }
  ScrollToBottom() {
    var searchBox = document.getElementById("birthday_select");
    searchBox.scrollIntoView();

  }
  DropDownStatus(value: boolean) {
    this.isExpanded = value;
  }
  LangDropDownStatus(value: boolean) {
    this.isLangExpanded = value;
  }

  clearDob() {
    this.customerCreateForm.patchValue({
      dateOfBirth: {
        month: null,
        day: '',
        year: ''
      }
    })
    if (this.currentCustomer) {
      this.customerCreateForm.get("dateOfBirth").markAsDirty();
    } else {
      this.customerCreateForm.get("dateOfBirth").markAsPristine();
    }

  }
  monthFiledSelection(value: boolean) {
    this.isMonthFocus = value;
  }
  languageFiledSelection(value: boolean) {
    this.isLanguageFocus = value;
  }

  fetchEid() {
    this.emiratesIdDispatchers.fetchEmiratesId()
  }

  setCustomerData() {
    if (this.currentCustomer) {
      const dob: any = this.currentCustomer.properties.dateOfBirth;
      this.date = this.formatDate(
        dob.substring(8, 10),
        parseInt(dob.substring(5, 7)) - 1,
        dob.substring(0, 4)
      );
      this.profileImage = this.getProfileImage(this.currentCustomer.properties.profileImage)
      this.customerCreateForm.patchValue({
        firstName: this.currentCustomer.firstName,
        lastName: this.currentCustomer.lastName,
        phone: this.currentCustomer.properties.phoneNumber,
        email: this.currentCustomer.properties.email,
        card:this.currentCustomer.cardNumber,
        dateOfBirth: {
          month: this.date.month ? this.date.month : null,
          day: this.date.day ? this.date.day : '',
          year: this.date.year ? this.date.year : ''
        },
        language: this.currentCustomer.properties.lang
      })
      this.customerCreateForm.markAsDirty()
    } else if ((this.customerCreateForm !== undefined) && !this.currentCustomer) {

      this.customerCreateForm.patchValue({
        firstName: '',
        lastName: '',
        phone: this.countrycode,
        email: '',
        card:'',
        dateOfBirth: {
          month: null,
          day: '',
          year: ''
        },
        language: ''
      })
    }
  }

  setEidCustomer(eidCustomer: IEidCustomer) {
    if (eidCustomer != undefined) {
      this.profileImage = this.getProfileImage(eidCustomer.photo)
      var phNumber = "";
      if (eidCustomer.phoneNumber.startsWith("0") && eidCustomer.phoneNumber.length == 10) {
        phNumber = "971";
        phNumber += eidCustomer.phoneNumber.substring(1, eidCustomer.phoneNumber.length);
      } else {
        phNumber = eidCustomer.phoneNumber
      }
      var dobDate: Date;
      let dob = eidCustomer.dateOfBirth.split('-');
      if (this.isValidDate(eidCustomer.dateOfBirth)) {
        dobDate = new Date(dob[0] + "-" + dob[1] + "-" + dob[2]);
      } else {
        dobDate = new Date(dob[1] + "-" + dob[0] + "-" + dob[2]);
      }

      this.date = this.formatDate(
        dobDate.getDate(),
        dobDate.getMonth(),
        dobDate.getFullYear()
      );

      this.customerCreateForm.patchValue({
        firstName: eidCustomer.firstName,
        lastName: eidCustomer.lastName,
        phone: phNumber,
        email: "",
        card: eidCustomer.cardNumber,
        dateOfBirth: {
          day: this.date.day ? this.date.day : null,
          month: this.date.month ? this.date.month : '',
          year: this.date.year ? this.date.year : ''
        },
        language: "en"
      })
    }
  }

  isValidDate(date: any) {
    var date_regex = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
    return date_regex.test(date)
  }
  getProfileImage(base64: string) {
    if (base64.includes('data:image/png;base64,')) {
      return base64
    }
    return `data:image/png;base64,${base64}`
  }
}

