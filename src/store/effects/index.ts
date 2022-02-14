import { AppointmentEffects } from './appointment.effects';
import { QueueEffects } from './queue.effects';
import { ServicePointEffects } from './service-point.effects';
import { BranchEffects } from './branch.effects';
import { SystemInfoEffects } from './system-info.effects';
import { LicenseInfoEffects } from './license.effects';
import { UserEffects } from './user.effects';
import { UserStatusEffects } from './user-status.effects';
import { UserRoleEffects } from './user-role.effects';
import { AccountEffects } from './account.effects';
import { ServiceEffects } from './service.effects';
import { CalendarServiceEffects } from './calendar-service.effects';
import {CustomerEffects} from './customer.effects';
import { CalendarSettingsEffects } from './calendar-settings.effects';
import { CalendarSystemInfoEffects } from './calendar-system-info.effects';
import { TimeslotEffects } from './timeslot.effects';
import { CalendarBranchEffects } from './calendar-branch.effects';
import { ReserveEffects } from './reserve.effects';
import { QueueVisitsEffects } from './queue-visits.effects';
import { ServicePointPoolEffects } from './service-point-pool.effects';
import { StaffPoolEffects } from './staff-pool.effcts';
import { JWTTokenEffects } from './jwtToken.effects';
import { from } from 'rxjs';
import { LanguageEffects } from './language.effects';
import { CustomerTypeEffects } from './customer-type.effects';
import { ErpBranchEffects } from './erp-branches.effects';
import { VariablesEffects } from './variables.effects';
import { EmiratesIdEffetcs } from './emirates-id.effects';

export const effects: any[] = [
    SystemInfoEffects,
    LicenseInfoEffects,
    UserEffects,
    UserStatusEffects,
    UserRoleEffects,
    AccountEffects,
    BranchEffects,
    ServiceEffects,
    ServicePointEffects,
    ServicePointPoolEffects,
    QueueEffects,
    CalendarServiceEffects,
    CustomerEffects,
    CalendarSettingsEffects,
    TimeslotEffects,
    CalendarBranchEffects,
    ReserveEffects,
    AppointmentEffects,
    QueueVisitsEffects,
    StaffPoolEffects,
    JWTTokenEffects,
    LanguageEffects,
    CustomerTypeEffects,
    ErpBranchEffects,
    VariablesEffects,
    EmiratesIdEffetcs
];

export * from './language.effects';
