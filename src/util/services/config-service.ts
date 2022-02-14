import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ICustomerType } from "src/models/ICustomerType";


@Injectable()
export class ConfigServices{
    private localUrl = 'assets/config/config.json'
    private config: any;

    constructor(private http: HttpClient) {
    }
    load() {
        return this.http.get(this.localUrl)
        .toPromise()
        .then(data=>{
            this.config = data
        })
    }
    public getConfig(key: any) {
        if (!this.config) {
            throw Error('Config file not loaded!');
          }
        return this.config[key].value;
    }

    public getErpUrl(){
        return this.getConfig("erp_url")
    }
    public getEidUrl(){
        return this.getConfig("eid_url")
    }
    public getWristBandUrl(){
        return this.getConfig("wrist_band_url")
    }

    public getCustomerType():ICustomerType[]{
        return this.getConfig("customerType")
    }

    public getBarcodeKeyWord():string{
        return this.getConfig("barcode")
    }

    public getWebSocketUrl():string{
        return this.getConfig("qr_code_url")
    }
}