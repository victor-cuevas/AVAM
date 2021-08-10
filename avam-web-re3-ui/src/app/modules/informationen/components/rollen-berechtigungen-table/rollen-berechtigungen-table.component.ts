import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SysFunkRolleViewDTO } from '@dtos/sysFunkRolleViewDTO';
import { RollenBerechtigungenFormData } from '@modules/informationen/pages/rollen-berechtigungen-bearbeiten-page/rollen-berechtigungen-bearbeiten-page.component';
import { FormUtilsService } from '@app/shared';
import { DropdownOption } from '@shared/services/forms/form-utils.service';

@Component({
    selector: 'avam-rollen-berechtigungen-table',
    templateUrl: './rollen-berechtigungen-table.component.html'
})
export class RollenBerechtigungenTableComponent {
    private static readonly TOPNAVIGATION = 'topnavigation';
    private static readonly UNTERMENU1 = 'untermenu1';
    private static readonly UNTERMENU2 = 'untermenu2';
    private static readonly SUBNAVIGATION = 'subnavigation';
    private static readonly ACTIONBUTTON = 'actionbutton';
    private static readonly BERECHTIGUNG = 'berechtigung';

    tableColumns = [
        {
            columnDef: RollenBerechtigungenTableComponent.TOPNAVIGATION,
            header: 'benutzerverwaltung.label.topnavigation',
            cell: (dto: SysFunkRolleViewDTO) => dto.topnavigationDe,
            sortable: false
        },
        {
            columnDef: RollenBerechtigungenTableComponent.UNTERMENU1,
            header: 'benutzerverwaltung.label.untermenu1',
            cell: (dto: SysFunkRolleViewDTO) => dto.untermenue1De,
            sortable: false
        },
        {
            columnDef: RollenBerechtigungenTableComponent.UNTERMENU2,
            header: 'benutzerverwaltung.label.untermenu2',
            cell: (dto: SysFunkRolleViewDTO) => dto.untermenue2De,
            sortable: false
        },
        {
            columnDef: RollenBerechtigungenTableComponent.SUBNAVIGATION,
            header: 'benutzerverwaltung.label.subnavigation',
            cell: (dto: SysFunkRolleViewDTO) => dto.subnavigationDe,
            sortable: false
        },
        {
            columnDef: RollenBerechtigungenTableComponent.ACTIONBUTTON,
            header: 'benutzerverwaltung.label.actionbutton',
            cell: (dto: SysFunkRolleViewDTO) => dto.actionButtonDe,
            sortable: false
        },
        {
            columnDef: RollenBerechtigungenTableComponent.BERECHTIGUNG,
            header: 'benutzerverwaltung.label.berechtigung',
            cell: (dto: SysFunkRolleViewDTO) => dto.berechtigung,
            sortable: false
        }
    ];
    columnsDefs: string[] = this.tableColumns.map(c => c.columnDef);

    @Input()
    set dataSource(values: SysFunkRolleViewDTO[]) {
        this.originalDataSource = values;
        this.filteredDataSource = this.originalDataSource;
        this.originalDataSource.forEach(value => {
            const group = this.fb.group({
                scopeId: value.scopeId
            });
            this.scopeForm.push(group);
        });
    }

    get dataSource(): SysFunkRolleViewDTO[] {
        return this.filteredDataSource;
    }

    private originalDataSource: SysFunkRolleViewDTO[];
    private filteredDataSource: SysFunkRolleViewDTO[];

    @Input()
    set data(data: RollenBerechtigungenFormData) {
        if (!data) {
            return;
        }
        this.options = {
            topnavigation: this.mapOptions(data.dropdowns.topnavigation),
            untermenu1: this.mapOptions(data.dropdowns.untermenu1),
            untermenu2: this.mapOptions(data.dropdowns.untermenu2),
            subnavigation: this.mapOptions(data.dropdowns.subnavigation),
            actionbutton: this.mapOptions(data.dropdowns.actionButton),
            berechtigung: this.formUtil.mapDropdown(data.berechtigungScopes)
        };

        this.berechtigungScopes = this.formUtil.mapDropdown(data.berechtigungScopes);
    }

    scopeForm: FormArray;
    berechtigungScopes: DropdownOption[];

    filterForm: FormGroup;
    options = {
        topnavigation: [],
        untermenu1: [],
        untermenu2: [],
        subnavigation: [],
        actionbutton: [],
        berechtigung: []
    };

    constructor(private fb: FormBuilder, private formUtil: FormUtilsService) {
        this.filterForm = fb.group({
            topnavigation: '',
            untermenu1: '',
            untermenu2: '',
            subnavigation: '',
            actionbutton: '',
            berechtigung: ''
        });

        this.scopeForm = fb.array([]);
    }

    private mapOptions(values: string[]): any[] {
        // There is an empty item in the subnavigation column.
        // If we let it into the GUI, then the dropdown component tries to
        // translate it. Since the string is empty, the translation service
        // in the background incorrectly thinks that the translation key is
        // not set, and throws an exception. Which, in turn, prevents the
        // table to function properly. So, we filter out the empty values.
        // If that empty value will be removed from the database, then this
        // comment, nad the filter call can be also removed.
        return values
            .filter(value => value.length > 0)
            .map(value => ({
                labelDe: value,
                labelFr: value,
                labelIt: value,
                value
            }));
    }

    onFilterChange() {
        const filterFormValues = this.filterBerechtigungen();
        this.setFilteredValuesToScopeForm(filterFormValues);
        this.removeSurplusItemsFromScopeFrom();
    }

    private setFilteredValuesToScopeForm(filterFormValues: number[]) {
        filterFormValues.forEach((value, index) => {
            const valueForControl = { scopeId: value };
            if (this.scopeForm.controls[index]) {
                this.scopeForm.controls[index].setValue(valueForControl);
            } else {
                const group = this.fb.group(valueForControl);
                this.scopeForm.push(group);
            }
        });
    }

    private filterBerechtigungen() {
        this.filteredDataSource = [];
        const filterFormValues: number[] = [];
        for (let dto of this.originalDataSource) {
            if (this.filterRow(dto)) {
                this.filteredDataSource.push(dto);
                filterFormValues.push(dto.scopeId);
            }
        }
        return filterFormValues;
    }

    private removeSurplusItemsFromScopeFrom() {
        while (this.filteredDataSource.length !== this.scopeForm.length) {
            this.scopeForm.removeAt(this.scopeForm.length - 1);
        }
    }

    private filterRow(dto: SysFunkRolleViewDTO): boolean {
        const currentFilter = this.filterForm.value;
        return (
            this.filterField(currentFilter.topnavigation, dto.topnavigationDe) &&
            this.filterField(currentFilter.untermenu1, dto.untermenue1De) &&
            this.filterField(currentFilter.untermenu2, dto.untermenue2De) &&
            this.filterField(currentFilter.subnavigation, dto.subnavigationDe) &&
            this.filterField(currentFilter.actionbutton, dto.actionButtonDe) &&
            this.filterField(currentFilter.berechtigung, dto.scopeId.toString())
        );
    }

    private filterField(filterValue: string, valueFromDto: string): boolean {
        return filterValue === '' || valueFromDto === filterValue;
    }
}
