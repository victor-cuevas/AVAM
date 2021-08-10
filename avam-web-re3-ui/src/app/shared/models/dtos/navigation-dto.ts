import { NavigationExtras } from '@angular/router';

export interface NavigationDto {
    commands: any[];
    extras?: NavigationExtras;
}
