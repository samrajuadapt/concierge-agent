import { ActionReducerMap } from "@ngrx/store";
import * as fromSystemInfo from "./system-info.reducer";
import { Store } from "@ngrx/store";
import * as fromLicense from "./license.reducer";
import * as fromAccount from "./account.reducer";
import * as fromPlatform from "./platform.reducer";
import * as fromBranch from "./branch.reducer";
import * as fromServices from "./service.reducer";
import * as fromServicePoints from "./service-point.reducer";
import * as fromUserStatus from "./user-status.reducer";
import * as fromQueue from "./queue.reducer";
import * as fromCustomer from "./customer.reducer";
import * as fromCalendarSettings from "./calendar-settings.reducer";
import * as fromReservationTimer from "./reservation-expiry-timer.reducer";
import * as fromCalendarBranches from "./calendar-branch.reducer";
import * as fromCalendarServices from "./calendar-service.reducer";
import * as fromTimeslot from "./timeslot.reducer";
import * as fromReserve from './reserve.reducer';
import * as fromInfoMsgBox from './message-box.reducer';
import * as fromNotes from './note.reducer';
import * as fromAppointments from './appointment.reducer';
import * as fromArriveAppointment from './arrive-appointment.reducer';
import * as fromEditAppointment from './edit-appointment.reducer';
import * as fromQueueVisits from './queue-visits.reducer';
import * as fromServicePointPool from './service-point-pool.reducer';
import * as fromStaffPool from './staff-pool.reducer';
import * as fromNativeApi from './native.api.reducer'
import * as fromGlobalNotify from './global-notify.reducer'
import * as fromFlowOpen from './flow-open.reducer'
import * as fromAutoCloseState from './autoclose-status.reducer';
import * as fromJWTToken from './jwtToken.reducer';
import * as fromLanguage from './language.reducer';
import * as fromCustomerType from './customer-type.reducer';
import * as fromErpBranches from './erp-branch.reducer';
import * as fromBarcode from './barcode.reducer';
import * as fromVariables from './variables.reducer';
import * as fromEmiratesId from './emirates-id.reducer';


export interface IAppState {
  systemInfo: fromSystemInfo.ISystemInfoState;
  license: fromLicense.ILicenseState;
  account: fromAccount.IAccountState;
  platform: fromPlatform.IPlatformInfoState;
  branches: fromBranch.IBranchState;
  services: fromServices.IServiceState;
  servicePoints: fromServicePoints.IServicePointState;
  userStatus: fromUserStatus.IUserStatusState;
  customers: fromCustomer.ICustomerState;
  queue: fromQueue.IQueueState;
  calendarSettings: fromCalendarSettings.ICalendarSettingsState;
  reservationExpiryTimer: fromReservationTimer.IReservationTimerState;
  calendarBranches: fromCalendarBranches.ICalendarBranchState;
  calendarServices: fromCalendarServices.ICalendarServiceState;
  timeslot: fromTimeslot.ITimeslotState;
  reserved: fromReserve.IReserveState;
  infoMsgBox: fromInfoMsgBox.IMessageInfoState;
  note: fromNotes.INoteState
  appointments: fromAppointments.IAppointmentState,
  arriveAppointment: fromArriveAppointment.IArriveAppointmentState,
  editAppointment: fromEditAppointment.IEditAppointmentState,
  queueVisits:fromQueueVisits.IQueueVisitsState
  servicePointPool:fromServicePointPool.IServicePointPoolState,
  staffPool:fromStaffPool.IStaffPoolState,
  nativeApi:fromNativeApi.NativeApiState,
  globalNotify: fromGlobalNotify.IGlobalNotifyState,
  flowOpen:fromFlowOpen.IFlowOpenState,
  autoCloseState: fromAutoCloseState.IAutoCloseStatus,
  jwtToken: fromJWTToken.IJWTTokenState,
  language: fromLanguage.ILanguageState;
  customerType:fromCustomerType.ICustoemrTypeState;
  erp:fromErpBranches.IErpBranchState;
  barcode:fromBarcode.IBarcodeState;
  variables:fromVariables.IVariablesState;
  eid:fromEmiratesId.IEmiratesIdState
}

export const reducers: ActionReducerMap<IAppState> = {
  systemInfo: fromSystemInfo.reducer,
  license: fromLicense.reducer,
  account: fromAccount.reducer,
  platform: fromPlatform.reducer,
  branches: fromBranch.reducer,
  services: fromServices.reducer,
  servicePoints: fromServicePoints.reducer,
  userStatus: fromUserStatus.reducer,
  queue: fromQueue.reducer,
  customers: fromCustomer.reducer,
  calendarSettings: fromCalendarSettings.reducer,
  reservationExpiryTimer: fromReservationTimer.reducer,
  calendarBranches: fromCalendarBranches.reducer,
  calendarServices: fromCalendarServices.reducer,
  timeslot: fromTimeslot.reducer,
  reserved: fromReserve.reducer,
  infoMsgBox: fromInfoMsgBox.reducer,
  note: fromNotes.reducer,
  appointments: fromAppointments.reducer,
  arriveAppointment: fromArriveAppointment.reducer,
  editAppointment: fromEditAppointment.reducer,
  queueVisits:fromQueueVisits.reducer,
  servicePointPool:fromServicePointPool.reducer,
  staffPool:fromStaffPool.reducer,
  nativeApi: fromNativeApi.reducer,
  globalNotify: fromGlobalNotify.reducer,
  flowOpen: fromFlowOpen.reducer,
  autoCloseState: fromAutoCloseState.reducer,
  jwtToken: fromJWTToken.reducer,
  language: fromLanguage.reducer,
  customerType:fromCustomerType.reducer,
  erp:fromErpBranches.reducer,
  barcode:fromBarcode.reducer,
  variables:fromVariables.reducer,
  eid:fromEmiratesId.reducer
};
