import { Directive, OnInit, OnDestroy, Input, Renderer2, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { PermissionContextService } from '../services/permission.context.service';
import { AuthenticationService } from '@app/core/services/authentication.service';

@Directive({
    selector: '[permissionContext]'
})
export class PermissionContextDirective implements OnInit, OnDestroy {
    @Input('permissionContext') permissions: string[];

    private authSub: Subscription;

    constructor(private permissionContextService: PermissionContextService, private element: ElementRef, private renderer2: Renderer2, public authService: AuthenticationService) {}

    ngOnInit(): void {
        this.authSub = this.permissionContextService.permissionSubject.subscribe(buttonPermissions => {
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
