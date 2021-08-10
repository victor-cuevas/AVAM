import { Directive, Input, AfterViewInit, ElementRef } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { AvamGenericTreeTableService } from './avam-generic-tree-table.service';

@Directive({
    selector: '[avamConnectingLines]'
})
export class ConnectingLinesDirective implements AfterViewInit {
    @Input() onExpandRow: Subject<any>;
    @Input() onCollapseRow: Subject<any>;

    connectionLineMainElement: HTMLDivElement;
    connectionLinesContainer: HTMLDivElement;

    tableRowMap: { [key: string]: HTMLTableRowElement } = {};
    farElementMap: { [key: string]: HTMLDivElement } = {};

    lineElementMap: { [key: string]: HTMLDivElement } = {};

    constructor(private hostElement: ElementRef, private table: AvamGenericTreeTableService) {}

    ngAfterViewInit() {
        this.hostElement.nativeElement.style.position = 'relative';

        this.connectionLineMainElement = document.createElement('div');
        this.connectionLinesContainer = document.createElement('div');

        this.hostElement.nativeElement.appendChild(this.connectionLinesContainer);

        this.onCollapseRow.subscribe((data: any) => {
            this.removeChildren(data.node.children);
            this.treeChanges();
        });

        this.onExpandRow.subscribe(() => {
            this.treeChanges();
        });

        this.table.loadedTree$.subscribe(() => {
            this.truncateContainer();
            this.treeChanges();
        });
    }

    removeChildren(children) {
        children.forEach(childNode => {
            if (this.connectionLinesContainer.contains(this.lineElementMap[childNode.model.id])) {
                this.connectionLinesContainer.removeChild(this.lineElementMap[childNode.model.id]);
            }

            if (childNode.children && childNode.children.length) {
                this.removeChildren(childNode.children);
            }
        });
    }

    truncateContainer() {
        while (this.connectionLinesContainer.children.length) {
            this.connectionLinesContainer.removeChild(this.connectionLinesContainer.firstChild);
        }
    }

    treeChanges() {
        if (this.table.dataSource && this.table.dataSource.length) {
            setTimeout(this.drawConnectingLines.bind(this), 0);
        }
    }

    drawConnectingLines() {
        const parentElementMetrics = this.hostElement.nativeElement.getBoundingClientRect();

        this.table.dataSource.forEach(node => {
            if (node.parent) {
                this.tableRowMap[node.model.id] = this.getRowElementById(node.model.id);
                this.tableRowMap[node.parent.model.id] = this.getRowElementById(node.parent.model.id);

                this.farElementMap[node.model.id] = this.getFarElementById(node.model.id, this.tableRowMap[node.model.id]);
                this.farElementMap[node.parent.model.id] = this.getFarElementById(node.parent.model.id, this.tableRowMap[node.parent.model.id]);

                const farMetrics = this.farElementMap[node.model.id].getBoundingClientRect();
                const parentFarMetrics = this.farElementMap[node.parent.model.id].getBoundingClientRect();

                this.lineElementMap[node.model.id] = this.getLineElement(node.model.id, farMetrics, parentFarMetrics, parentElementMetrics);

                if (!this.connectionLinesContainer.contains(this.lineElementMap[node.model.id])) {
                    this.connectionLinesContainer.appendChild(this.lineElementMap[node.model.id]);
                }
            }
        });
    }

    getRowElementById(id: string) {
        return (
            (this.isParentContainsElement(id, this.tableRowMap, this.hostElement.nativeElement) && this.tableRowMap[id]) || this.hostElement.nativeElement.querySelector(`.a_${id}`)
        );
    }

    getFarElementById(id: string, rowElement: HTMLTableRowElement) {
        return (this.isParentContainsElement(id, this.farElementMap, this.hostElement.nativeElement) && this.farElementMap[id]) || rowElement.querySelector('.far');
    }

    getLineElement(id: string, farMetrics, parentFarMetrics, parentElementMetrics) {
        if (this.isParentContainsElement(id, this.lineElementMap, this.connectionLinesContainer) && this.lineElementMap[id]) {
            this.computeDashedElementSizes(this.lineElementMap[id], farMetrics, parentFarMetrics, parentElementMetrics);

            return this.lineElementMap[id];
        }

        const outputElement: HTMLDivElement = this.connectionLineMainElement.cloneNode() as HTMLDivElement;

        this.computeDashedElementSizes(outputElement, farMetrics, parentFarMetrics, parentElementMetrics);

        outputElement.style.position = 'absolute';
        outputElement.style.background = 'transparent';
        outputElement.style.borderLeft = '1px dashed black';
        outputElement.style.borderBottom = '1px dashed black';

        return outputElement;
    }

    computeDashedElementSizes(element: HTMLDivElement, farMetrics, parentFarMetrics, parentElementMetrics) {
        const proportion: number = parentFarMetrics.width / 4;

        const width: number = farMetrics.left - parentFarMetrics.left - proportion;
        const height: number = farMetrics.top - parentFarMetrics.bottom + proportion;
        const top: number = Math.abs(parentFarMetrics.bottom - parentElementMetrics.top);
        const left: number = parentFarMetrics.left + proportion - parentElementMetrics.left;

        if (
            top.toFixed(2) === parseFloat(element.style.top).toFixed(2) &&
            left.toFixed(2) === parseFloat(element.style.left).toFixed(2) &&
            width.toFixed(2) === parseFloat(element.style.width).toFixed(2) &&
            height.toFixed(2) === parseFloat(element.style.height).toFixed(2)
        ) {
            return;
        }

        element.style.top = `${top}px`;
        element.style.left = `${left}px`;
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
    }

    isParentContainsElement(id: string, containingMap: { [key: string]: HTMLElement }, parentElement: HTMLElement): boolean {
        if (parentElement.contains(containingMap[id])) {
            return true;
        }

        containingMap[id] = undefined;

        delete containingMap[id];

        return false;
    }
}
