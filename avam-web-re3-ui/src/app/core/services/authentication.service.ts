import { UserDto } from './../../shared/models/dtos-generated/userDto';
import { Injectable, OnDestroy } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';
import { AuthenticationRestService } from '../http/authentication-rest.service';
import { Router } from '@angular/router';
import { ChangePasswordDto } from '@auth/pages/login/login.component';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { LoginDTO } from '@shared/models/dtos-generated/loginDTO';
import { BaseResponseWrapperBooleanWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperBooleanWarningMessages';
import { JwtDTO } from '@shared/models/dtos-generated/jwtDTO';
import { BaseResponseWrapperJwtDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperJwtDTOWarningMessages';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class AuthenticationService implements OnDestroy {
    loginSubject: Subject<boolean> = new Subject<boolean>();
    sideNavigationPermissionSubject: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(this.getUserPermissions());
    buttonsPermissionSubject: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(this.getUserPermissions());

    sideNavigationPermissionSubjectSub: Subscription;
    buttonsPermissionSubjectSub: Subscription;

    constructor(private authRestService: AuthenticationRestService, private router: Router, private dbTransateService: DbTranslateService, private modalService: NgbModal) {}

    login(userName: string, pwd: string): Observable<BaseResponseWrapperJwtDTOWarningMessages> {
        return this.authRestService.login({ username: userName, password: pwd, language: this.dbTransateService.getCurrentLang() } as LoginDTO).pipe(
            map((response: BaseResponseWrapperJwtDTOWarningMessages) => {
                // login successful if there's a jwt token in the response
                const user = response.data;
                if (user && user.accessToken) {
                    // store user details and jwt token in session storage to keep user logged in ONLY in current page
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    const userPermission = this.getUserPermissions();
                    this.sideNavigationPermissionSubject.next(userPermission);
                    this.buttonsPermissionSubject.next(userPermission);
                }

                return response;
            })
        );
    }

    changePassword(changePasswordDto: ChangePasswordDto): Observable<BaseResponseWrapperBooleanWarningMessages> {
        return this.authRestService.changePassword(changePasswordDto);
    }

    logout(): void {
        sessionStorage.clear();
        this.modalService.dismissAll('Not logged in');
        if (this.isLoggedIn()) {
            this.authRestService
                .logout()
                .toPromise()
                .then(() => this.clearLocalStorageAndGoToLoginPage(), () => this.clearLocalStorageAndGoToLoginPage());
        } else {
            this.clearLocalStorageAndGoToLoginPage();
        }
    }

    isLoggedIn(): boolean {
        if (localStorage.getItem('currentUser')) {
            // logged in so return true
            return true;
        }
        return false;
    }

    getLoginObservable(): Observable<boolean> {
        return this.loginSubject.asObservable();
    }

    emitLoginEvent(): void {
        this.loginSubject.next(true);
    }

    hasAnyPermission(permissions: any[], userPermissions?: string[]): boolean {
        userPermissions = userPermissions || this.getUserPermissions();

        return permissions.some(p => this.hasPermission(p, userPermissions));
    }

    hasAllPermissions(permissions: any[], userPermissions?: string[]): boolean {
        userPermissions = userPermissions || this.getUserPermissions();

        return permissions.every(p => this.hasPermission(p, userPermissions));
    }

    filterWithDeepCopy(navigationMenus: any[], userPermissions?: string[]): any[] {
        // slower than filter, but no impact or data loss to origin array, which is important for side nav menus
        // not suitable for pipes, since they call methods multiple times and crash the performance
        const data = JSON.parse(JSON.stringify(navigationMenus));
        return this.filter(data, userPermissions);
    }

    filter(navigationMenus: any[], userPermissions?: string[]): any[] {
        return this.traverseMenus(navigationMenus, userPermissions || this.getUserPermissions());
    }

    setStesPermissionContext(stesId: number) {
        this.sideNavigationPermissionSubjectSub = this.authRestService.getContextPermissionsWithStesId(stesId).subscribe((stesPermissions: string[]) => {
            this.sideNavigationPermissionSubject.next(stesPermissions);
            this.buttonsPermissionSubject.next(stesPermissions);
        });
    }

    removeStesPermissionContext() {
        this.sideNavigationPermissionSubject.next(this.getUserPermissions());
    }

    setOwnerPermissionContext(stesId: number, ownerId: number) {
        // Check if the first subscription is not still active, beacuse the emited values will be not in order.
        // The order is:
        // 1. Update stes
        // 2. Update buttons
        if (this.sideNavigationPermissionSubjectSub.closed) {
            this.buttonsPermissionSubjectSub = this.authRestService.getContextPermissionsWithBenutzerstelleId(ownerId).subscribe((buttonsPermissions: string[]) => {
                this.buttonsPermissionSubject.next(buttonsPermissions);
            });
        } else {
            this.sideNavigationPermissionSubjectSub.unsubscribe();
            const stesObs: Observable<any> = this.authRestService.getContextPermissionsWithStesId(stesId);
            this.sideNavigationPermissionSubjectSub = stesObs.subscribe(stesPermissions => {
                this.sideNavigationPermissionSubject.next(stesPermissions);
                const ownerObs: Observable<any> = this.authRestService.getContextPermissionsWithBenutzerstelleId(ownerId);
                this.buttonsPermissionSubjectSub = ownerObs.subscribe(buttonsPermissions => {
                    this.buttonsPermissionSubject.next(buttonsPermissions);
                });
            });
        }
    }

    removeOwnerPermissionContext() {
        this.buttonsPermissionSubject.next(this.sideNavigationPermissionSubject.getValue());
    }

    clearSideNavigationPermissionContext() {
        this.sideNavigationPermissionSubject.next([]);
    }

    clearButtonsPermissionContext() {
        this.buttonsPermissionSubject.next([]);
    }

    getLoggedUser(): UserDto {
        try {
            return JSON.parse(localStorage.getItem('currentUser')).userDto;
        } catch {
            return null;
        }
    }

    ngOnDestroy() {
        if (this.sideNavigationPermissionSubjectSub) {
            this.sideNavigationPermissionSubjectSub.unsubscribe();
        }
        if (this.buttonsPermissionSubjectSub) {
            this.buttonsPermissionSubjectSub.unsubscribe();
        }
    }

    private clearLocalStorageAndGoToLoginPage(): void {
        // remove user from session storage to log user out
        localStorage.removeItem('currentUser');
        localStorage.removeItem('startPageModel');
        this.loginSubject.next(false);
        this.clearSideNavigationPermissionContext();
        this.clearButtonsPermissionContext();
        this.router.navigate(['login']);
    }

    private traverseMenus(navigationMenus: any[], userPermissions: string[]): any[] {
        const permittedMenus = [];

        navigationMenus
            .filter(menu => this.hasAllPermissions(this.getNavigationPermissions(menu), userPermissions))
            .forEach(menu => {
                if (menu.items) {
                    menu.items = this.traverseMenus(menu.items, userPermissions);
                }
                if (menu.children) {
                    menu.children = this.traverseMenus(menu.children, userPermissions);
                }
                permittedMenus.push(menu);
            });

        return permittedMenus;
    }

    private hasPermission(permission: any, userPermissions: string[]): boolean {
        if (permission.or) {
            return this.hasAnyPermission(permission.or, userPermissions);
        }

        if (permission.and) {
            return this.hasAllPermissions(permission.and, userPermissions);
        }

        return userPermissions.includes(permission);
    }

    private getUserPermissions(): string[] {
        const currentUser: JwtDTO = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && !currentUser.userDto.userInSozialhilfestelle) {
            const userPermissions: string[] = currentUser.userDto.permissions;
            if (userPermissions) {
                return userPermissions;
            }
        }

        return [];
    }

    private getNavigationPermissions(navigationMenu) {
        if (navigationMenu.permissions) {
            return navigationMenu.permissions as Array<string>;
        }
        return [];
    }
}
