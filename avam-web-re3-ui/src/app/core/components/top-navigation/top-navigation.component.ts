import { Component, ElementRef, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as uuid from 'uuid';
import { TopNavigationInterface } from './top-navigation.interface';
import { NavigationStart, Router } from '@angular/router';
import { NavigationDto } from '@shared/models/dtos/navigation-dto';
import { RedirectService } from '@shared/services/redirect.service';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';

@Component({
    selector: 'avam-top-navigation',
    templateUrl: './top-navigation.component.html',
    styleUrls: ['./top-navigation.component.scss']
})
export class TopNavigationComponent implements OnInit, OnChanges {
    @Input('navigation') navigation: TopNavigationInterface[];

    navigationTitleClassName = 'navbar-primary-section-title';
    titleClass: any = {};

    constructor(private eRef: ElementRef, private router: Router, private redirectService: RedirectService, private searchSession: SearchSessionStorageService) {}

    ngOnInit() {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                const itemSelected = this.navigation.find(item => item.path === event.url.split('/')[1]);
                if (itemSelected) {
                    this.navigation.forEach(item => {
                        if (item.id !== itemSelected.id) {
                            item.pathSelected = false;
                        } else {
                            item.pathSelected = true;
                        }
                    });
                } else if (!itemSelected && this.navigation.some(item => item.pathSelected)) {
                    this.navigation.find(item => item.pathSelected).pathSelected = false;
                }
            }
        });
        this.navigation.forEach(item => {
            item.selected = false;
            item.id = uuid.v4();
        });
        this.titleClass = {
            [this.navigationTitleClassName]: true
        };
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.checkMenu(changes.navigation.previousValue, changes.navigation.currentValue)) {
            this.navigation.forEach(item => {
                item.selected = false;
                item.id = uuid.v4();
            });
        }
    }

    checkMenu(prvious, current) {
        let menusAreSame = true;
        for (let item in prvious) {
            if (prvious[item] !== current[item]) {
                menusAreSame = false;
                break;
            }
        }
        return menusAreSame;
    }

    onItemClick(currentItem, event?: any) {
        if (event && event.target && event.target.matches(`.${this.navigationTitleClassName}`)) {
            return;
        }

        if (currentItem.children) {
            currentItem.selected = !currentItem.selected;
        }

        this.navigation.forEach(item => {
            if (item.id !== currentItem.id) {
                item.selected = false;
                item.pathSelected = false;
            }
        });
    }

    onItemLinkClick(currentItem) {
        this.searchSession.clearStorageByKey(currentItem.clearStateWithKey);
        this.searchSession.restoreDefaultValues(currentItem.restoreDefaultStateWithKey);
    }

    onItemEnter(currentItem) {
        this.onItemClick(currentItem);
    }

    @HostListener('document:click') clickout() {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.navigation.forEach(item => {
                item.selected = false;
            });
        }
    }

    navigateToPath(item) {
        this.searchSession.clearStorageByKey(item.clearStateWithKey);
        this.searchSession.restoreDefaultValues(item.restoreDefaultStateWithKey);

        const path = item.path;
        const navigationDto: NavigationDto = {
            commands: [path]
        };
        this.redirectService.navigate(navigationDto);
    }

    onHomeClick() {
        this.redirectService.navigate({
            commands: ['/home']
        });
    }
}
