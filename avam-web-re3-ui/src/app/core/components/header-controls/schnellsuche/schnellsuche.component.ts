import { AfterViewInit, Component, ElementRef, forwardRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { SchnellsucheDataService } from '@core/services/schnellsuche-data.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '@core/services/authentication.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { JwtDTO } from '@shared/models/dtos-generated/jwtDTO';
import { BenutzerstelleAendernService } from '@myAvam/services/benutzerstelle-aendern.service';
import { UserDto } from '@dtos/userDto';

@Component({
    selector: 'app-schnellsuche',
    templateUrl: './schnellsuche.component.html',
    styleUrls: ['./schnellsuche.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SchnellsucheComponent),
            multi: true
        }
    ]
})
export class SchnellsucheComponent implements OnInit, AfterViewInit {
    dropDownOptions: {
        path: any;
        id: number;
        label: string;
    }[];
    searchText = new FormControl('');
    selectedOption = new FormControl('');
    searching = false;
    searchFailed = false;
    disabled: boolean;

    @ViewChild('inputField') inputField: ElementRef;
    @ViewChild('areaSelect') areaSelect: ElementRef;
    @ViewChild('searchButton') searchButton: ElementRef;

    constructor(
        private schnellsucheService: SchnellsucheDataService,
        private router: Router,
        private authService: AuthenticationService,
        private benutzerstelleAendernService: BenutzerstelleAendernService
    ) {}

    ngOnInit(): void {
        this.loadData();
        this.subscribeToBenutzerstelleChanges();
    }

    ngAfterViewInit(): void {
        this.disableFields();
    }

    inputFormatter = () => '';

    search = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200), // time for query
            distinctUntilChanged(),
            tap(() => (this.searching = true)),
            switchMap(term => {
                if (term) {
                    return this.searchByArea(term).pipe(
                        tap(() => (this.searchFailed = false)),
                        map(elemList => {
                            return elemList.sort((e1, e2) => this.compareUnternehmen(e1, e2));
                        }),
                        catchError(() => {
                            this.searchFailed = true;
                            return of([]);
                        })
                    );
                } else {
                    return of([]);
                }
            }),
            tap(() => (this.searching = false))
        );

    navigateToSearch(): void {
        const selectedSearch = this.dropDownOptions.find(resp => resp.id === this.selectedOption.value);
        if (!!this.selectedOption.value) {
            this.router.navigate([selectedSearch.path]);
        } else {
            this.router.navigate([this.dropDownOptions[0].path]);
        }
    }

    searchByArea(term: string): Observable<any> {
        switch (this.selectedOption.value) {
            case '0':
                return this.schnellsucheService.searchForStes(term);
            case '1':
                return this.schnellsucheService.searchForArbeitgeber(term);
            case '2':
                return this.schnellsucheService.searchForAnbieter(term);
            case '3':
                return this.schnellsucheService.searchForFachberatung(term);
            default:
                return this.schnellsucheService.searchForStes(term);
        }
    }

    onBlur(): void {
        this.searching = false;
    }

    showDetails(data): void {
        switch (this.selectedOption.value) {
            case '0':
                this.navigate(`stes/details/${data.stesId}`);
                break;
            case '1':
                this.navigate(`arbeitgeber/details/${data.unternehmenId}`);
                break;
            case '2':
                this.navigate(`amm/anbieter/${data.unternehmenId}`);
                break;
            case '3':
                this.navigate(`stes/fachberatung/${data.unternehmenId}`);
                break;
            default:
                this.navigate(`stes/details/${data.stesId}`);
                break;
        }
    }

    term(search: string, result: string): string {
        return search
            .trim()
            .split(' ')
            .filter(str => SchnellsucheComponent.includesCaseInsensitive(str, result))[0];
    }

    termOrt(search: string, result: any): string {
        return this.term(search, this.schnellsucheService.translate(result, 'ort'));
    }

    private navigate(command: string): void {
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => this.router.navigate([command]));
    }

    private static includesCaseInsensitive(str: string, str2: string): boolean {
        if (str === null || str2 === null) {
            return false;
        }
        return str.toLowerCase().includes(str2.toLowerCase()) || str2.toLowerCase().includes(str.toLowerCase());
    }

    private loadData() {
        this.dropDownOptions = this.getSearchOption();
        this.disabled = this.dropDownOptions.length === 0;
        this.selectedOption.setValue(this.disabled ? null : this.dropDownOptions[0].id);
    }

    private disableFields() {
        this.inputField.nativeElement.disabled = this.disabled;
        this.areaSelect.nativeElement.disabled = this.disabled;
        this.searchButton.nativeElement.disabled = this.disabled;
    }

    private getSearchOption() {
        // This variable temporarly disable the Schnellsuche if the user in Sozialhilfestelle
        // (See AVB-16819). Remove this after the problem is solved in RE3.5
        if (this.isUserInSozialhilfestelle()) {
            return [];
        }

        const searchOptions = [];
        if (this.authService.hasAllPermissions([Permissions.STES_SUCHEN_SICHTEN])) {
            searchOptions.push({
                id: '0',
                label: 'stes.label.stellensuchende',
                path: 'stes/search'
            });
        }
        if (this.authService.hasAllPermissions([Permissions.ARBEITGEBER_SUCHEN, Permissions.FEATURE_33])) {
            searchOptions.push({
                id: '1',
                label: 'unternehmen.label.suchen.arbeitgeber',
                path: 'arbeitgeber/details/suchen'
            });
        }
        if (this.authService.hasAllPermissions([Permissions.ANBIETER_SUCHEN, Permissions.FEATURE_34])) {
            searchOptions.push({
                id: '2',
                label: 'unternehmen.label.suchen.anbieter',
                path: 'amm/anbieter/suchen'
            });
        }
        if (this.authService.hasAllPermissions([Permissions.STES_FACHBERATUNG_SUCHEN, Permissions.FEATURE_33])) {
            searchOptions.push({
                id: '3',
                label: 'unternehmen.label.suchen.fachberatung',
                path: '/stes/fachberatung/suchen'
            });
        }
        return searchOptions;
    }

    private isUserInSozialhilfestelle(): boolean {
        const currentUser: UserDto = this.getCurrentUser();
        return currentUser.userInSozialhilfestelle;
    }

    private getCurrentUser(): UserDto {
        const currentUser: JwtDTO = JSON.parse(localStorage.getItem('currentUser'));
        return currentUser.userDto;
    }

    private subscribeToBenutzerstelleChanges() {
        this.benutzerstelleAendernService.subject.subscribe(() => {
            this.loadData();
            this.disableFields();
        });
    }

    private compareUnternehmen(e1: any, e2: any): number {
        if (e1.hasOwnProperty('burNr')) {
            return this.compareByNameThenPlzOrt(e1, e2);
        }
        return 1;
    }

    private compareByNameThenPlzOrt(e1: any, e2: any): number {
        if (e1.name === e2.name) {
            if (e1.ort === e2.ort) {
                return e1.plz.localeCompare(e2.plz);
            }
            return e1.ort.localeCompare(e2.ort);
        }
        return e1.name.localeCompare(e2.name);
    }
}
