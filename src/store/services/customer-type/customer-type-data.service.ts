import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigServices } from '../../../util/services/config-service';
import { ICustomerType } from 'src/models/ICustomerType';

@Injectable()
export class CustomerTypeDataService{

    constructor(private config: ConfigServices){}


    getCustomerType(): Observable<ICustomerType[]> {
        var customerTypes = []
        this.config.getCustomerType().forEach(c=>{
          customerTypes.push(c)
        })
        const obs = new Observable<ICustomerType[]>(sub=>{
          sub.next(customerTypes)
        })
        return obs;
      }
}