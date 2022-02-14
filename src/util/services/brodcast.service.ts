import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/map'
import { IBroadcastMessage } from 'src/models/IBroadcastMessage';


@Injectable({
  providedIn: 'root'
})
export class BroadcastService {

  constructor() { }
  
  private _handler: Subject<IBroadcastMessage> = new Subject<IBroadcastMessage>();

  boradcast(type: string, payload: any = null) {
    this._handler.next({ type, payload });
  }

  subscribe(type: string, callback: (payload: any) => void): Subscription {
    return this._handler
      .filter((message: { type: string; }) => message.type === type)
      .map((message: { payload: any; }) => message.payload)
      .subscribe(callback);
  } 
}