import { Injectable } from '@angular/core';
import { NavigationDto } from '@shared/models/dtos/navigation-dto';
import { SpinnerService } from 'oblique-reactive';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class RedirectService {
    constructor(private spinnerService: SpinnerService, private router: Router) {}

    navigate(navigationDto: NavigationDto, spinnerChannel?: string): void {
        if (navigationDto && navigationDto.commands) {
            this.activateSpinner(spinnerChannel);
            let navigationPromise: Promise<boolean>;
            if (navigationDto.extras) {
                navigationPromise = this.router.navigate(navigationDto.commands, navigationDto.extras);
            } else {
                navigationPromise = this.router.navigate(navigationDto.commands);
            }
            this.deactivateSpinner(navigationPromise, spinnerChannel);
        }
    }

    navigateRelativeTo(commands: any, relativeTo?: ActivatedRoute, idKey?: string, idValue?: number): void {
        const navigationDto: NavigationDto = {
            commands: [commands],
            extras: {
                relativeTo,
                queryParams: {} as Params
            }
        } as NavigationDto;
        if (idKey && idValue) {
            navigationDto.extras.queryParams[idKey] = String(idValue);
        }
        this.navigate(navigationDto);
    }

    private activateSpinner(spinnerChannel?: string): void {
        if (spinnerChannel) {
            this.spinnerService.activate(spinnerChannel);
        }
    }

    private deactivateSpinner(navigationPromise: Promise<boolean>, spinnerChannel?: string): void {
        if (spinnerChannel) {
            navigationPromise.then(() => this.spinnerService.deactivate(spinnerChannel), () => this.spinnerService.deactivate(spinnerChannel));
        }
    }
}
