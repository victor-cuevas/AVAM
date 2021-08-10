import { Directive, Input, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { Subscription } from 'rxjs';

/**
 * Directive that shows or hides an element dynamically from DOM according to the stes permissions.
 *
 * @export
 * @class PermissionDirective
 * @implements {OnInit}
 */
@Directive({
    selector: '[permissions]'
})
export class PermissionDirective implements OnInit {
    @Input('permissions') permissions: string[];
    private authSub: Subscription;

    constructor(private element: ElementRef, public authService: AuthenticationService, private renderer2: Renderer2) {}

    ngOnInit(): void {
        this.setDisplay(false);
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
