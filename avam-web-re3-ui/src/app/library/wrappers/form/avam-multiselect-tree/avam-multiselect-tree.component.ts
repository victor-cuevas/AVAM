import { Component, OnInit, Input, ViewChild, TemplateRef, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AvamMultiselectTreeInterface } from './avam-multiselect-tree.interface';
import { CoreMultiselectComponent } from '@app/library/core/core-multiselect/core-multiselect.component';

@Component({
    selector: 'avam-multiselect-tree',
    templateUrl: './avam-multiselect-tree.component.html',
    styleUrls: ['./avam-multiselect-tree.component.scss']
})
export class AvamMultiselectTreeComponent implements AfterViewInit {
    /**
     * Wait for asyc options.
     *
     * @memberof AvamMultiselectComponent
     */
    @Input('options') set options(data: AvamMultiselectTreeInterface[]) {
        if (Array.isArray(data)) {
            const flatData = [];
            data.forEach(option => {
                option.isParent = true;
                flatData.push(option);
                if (option.children) {
                    option.children.forEach(child => {
                        flatData.push(child);
                    });
                }
            });
            this.data = flatData;
            this.selectParentOptions(data);
        }
    }

    @Input('parentForm') parentForm: FormGroup;
    @Input('controlName') controlName: string;
    @Input('enableSearch') enableSearch = true;
    @Input('dynamicTitleMaxItems') dynamicTitleMaxItems = 3;
    @Input('label') label: string;
    @Input('inputClass') inputClass: string;
    @Input('isDisabled') isDisabled: boolean;
    @Input('placeholder') placeholder = false;
    @ViewChild('multiSelectTemplate') multiSelectTemplate: TemplateRef<any>;
    @ViewChild('coreMultiselect') coreMultiselect: CoreMultiselectComponent;

    data: AvamMultiselectTreeInterface[];
    multiSelectElement: any;

    constructor() {}

    ngAfterViewInit() {
        this.multiSelectElement = this.coreMultiselect.orMultiselect.element.nativeElement;
    }

    selectParentOptions(options: AvamMultiselectTreeInterface[]) {
        if (options) {
            options.forEach(item => {
                if (item.isParent && item.value) {
                    this.removeParents();
                    if (item.children) {
                        item.children.forEach(child => {
                            child.value = true;
                        });
                    }
                }
            });
        }
    }

    removeElementFromSelectedList(currentElement: AvamMultiselectTreeInterface) {
        currentElement.value = false;
        // uncheck parent from multiselect dropdown.
        this.data.forEach(option => {
            if (option.isParent && currentElement.parentId === option.id) {
                option.value = false;
            }
        });
        this.data = [...this.data];
        this.parentForm.markAsDirty();
    }

    onLoaded(options: AvamMultiselectTreeInterface[]) {
        this.parentForm.controls[this.controlName].setValue(options);
    }

    styleOrMultiselectTemplate(padding: string) {
        const item = this.multiSelectElement.querySelectorAll('.dropdown-menu button.dropdown-item');
        this.data.forEach((element, index) => {
            if (!element.isParent) {
                if (item.length > 0 && item[index]) {
                    if (item[index].style) {
                        item[index].style.paddingLeft = padding;
                    }
                }
            }
        });
    }

    onDropdownClosed() {
        this.coreMultiselect['orMultiselect'].searchFilterText = '';
        this.styleOrMultiselectTemplate('50px');
    }

    onOpenDropdown() {
        if (this.coreMultiselect['orMultiselect'].filterBox) {
            this.coreMultiselect['orMultiselect'].filterBox.patternChange.subscribe(res => {
                this.styleOrMultiselectTemplate('1.5rem');
                if (res === '' || typeof res === 'undefined') {
                    setTimeout(() => {
                        this.styleOrMultiselectTemplate('50px');
                    }, 0);
                }
            });
        }
        this.styleOrMultiselectTemplate('50px');
    }

    onRemoveElement(item: AvamMultiselectTreeInterface) {
        const model = this.coreMultiselect.orMultiselect.model;
        if (item.children) {
            item.children.forEach(child => {
                child.value = false;
                for (let i = model.length - 1; i >= 0; --i) {
                    if (model[i].id === child.id) {
                        model.splice(i, 1);
                    }
                }
            });
        } else {
            this.data.forEach((element, index) => {
                if (element.id === item.parentId) {
                    model.forEach((modelItem, modelIndex) => {
                        if (modelItem.id === element.id) {
                            model.splice(modelIndex, 1);
                        }
                    });
                }
            });
        }
    }

    onAddedElement(item: AvamMultiselectTreeInterface) {
        const model = this.coreMultiselect.orMultiselect.model;
        if (item.children) {
            item.children.forEach(child => {
                child.value = true;
                model.forEach((element, index) => {
                    if (element.id === child.id) {
                        model.splice(index, 1);
                    }
                });
                model.push(child);
            });
        } else {
            this.data.forEach(element => {
                if (element.id === item.parentId) {
                    if (element.children.every(child => child.value)) {
                        model.push(element);
                    }
                }
            });
        }
        this.removeParents();
    }

    removeParents() {
        setTimeout(() => {
            const parentElements = this.coreMultiselect.multiselectBody.nativeElement.querySelectorAll('.isParent');
            for (const parent of parentElements) {
                parent.style.display = 'none';
            }
        }, 0);
    }
}
