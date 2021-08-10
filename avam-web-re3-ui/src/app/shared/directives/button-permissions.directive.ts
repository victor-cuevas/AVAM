import { Directive, Input, OnInit, ElementRef, OnDestroy, Renderer2 } from '@angular/core';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { Subscription } from 'rxjs';

/**
 * Directive that remove dynamically the element from DOM according to the permissions for the stes.
 *
 * @export
 * @class ButtonPermissionsDirective
 * @implements {OnInit}
 */
@Directive({
    selector: '[button-permissions]'
})
export class ButtonPermissionsDirective implements OnInit, OnDestroy {
    @Input('button-permissions') permissions: string[];
    private authSub: Subscription;

    constructor(private element: ElementRef, public authService: AuthenticationService, private renderer2: Renderer2) {}

    ngOnInit(): void {
        this.authSub = this.authService.buttonsPermissionSubject.subscribe(buttonPermissions => {
            if (this.permissions) {
                if (this.authService.hasAnyPermission(this.permissions, buttonPermissions)) {
                    this.setDisplay(true);
                } else {
                    this.setDisplay(false);
                }
            } else {
                this.setDisplay(true);
            }
        });
    }

    ngOnDestroy(): void {
        this.authSub.unsubscribe();
    }

    private setDisplay(display: boolean) {
        if (display) {
            this.renderer2.removeClass(this.element.nativeElement, 'permission-hidden');
        } else {
            this.renderer2.addClass(this.element.nativeElement, 'permission-hidden');
        }
    }
}
