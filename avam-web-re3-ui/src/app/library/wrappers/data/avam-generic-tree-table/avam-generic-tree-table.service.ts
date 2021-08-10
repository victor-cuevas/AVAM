import { Injectable, Output, EventEmitter } from '@angular/core';
import * as TreeModel from 'tree-model';
import { Subject, BehaviorSubject } from 'rxjs';
import { TreeOptionInterface } from './tree-option.interface';
import { INodeState } from './node-state.interface';

@Injectable()
export class AvamGenericTreeTableService {
    @Output() onResize: EventEmitter<any> = new EventEmitter();

    /**
     * Data which is passed to Tree Table.
     *
     * @type {any[]}
     * @memberof CoreTreeTableService
     */
    dataSource: any[];
    /**
     * Collect tree roots
     *
     * @type {any[]}
     * @memberof CoreTreeTableService
     */
    roots: any[] = [];

    /**
     * flat tree's into a single one.
     *
     * @type {*}
     * @memberof CoreTreeTableService
     */
    flatTree: any[] = [];

    selectedRow: any;

    nowCollapse: boolean;

    clickedNodeId: string;

    shouldSaveExpansonState: boolean;

    collapse$: Subject<any> = new Subject();

    expand$: Subject<any> = new Subject();

    loadedTree$: BehaviorSubject<any> = new BehaviorSubject(true);

    constructor() {}

    setup(tree, options?: TreeOptionInterface) {
        this.roots = [];
        this.flatTree = [];
        this.shouldSaveExpansonState = options ? options.shouldSaveExpansonState : false;
        tree.forEach(root => {
            const treeModel = new TreeModel();
            this.roots.push(treeModel.parse(root));
        });

        this.flatTreeData(options && options.flatTreeState);

        if (options && !options.flatTreeState) {
            this.generateStates(options && options.initialExpansionLevel);
        }

        this.dataSource = this.generateDataSource();
        this.loadedTree$.next(true);
    }

    getFlatTreeState(): INodeState[] {
        return this.flatTree.map(node => {
            return node.isVisible || node.isExpanded || node.wasExpanded
                ? {
                      isVisible: node.isVisible,
                      isExpanded: node.isExpanded,
                      wasExpanded: node.wasExpanded
                  }
                : null;
        });
    }

    generateDataSource() {
        return this.flatTree.filter(x => {
            if (this.shouldSaveExpansonState) {
                const hasClickedParent: boolean = this.hasParentWithId(x, this.clickedNodeId);
                const shouldExpand: boolean = x.parent && !this.nowCollapse && hasClickedParent;

                if (shouldExpand && x.parent.isExpanded && x.wasExpanded) {
                    x.parent.isExpanded = true;
                    x.parent.wasExpanded = true;

                    x.isExpanded = true;
                    x.isVisible = true;

                    x.children.forEach((child: TreeModel.Node<any>) => {
                        child.isVisible = true;
                    });
                }
            }

            return x.isVisible;
        });
    }

    hasParentWithId(node: TreeModel.Node<any>, parentId: string) {
        if (node.model.id === parentId) {
            return true;
        }

        const nodePath: Array<TreeModel.Node<any>> = node.getPath();

        for (const parentNode of nodePath) {
            if (parentNode.model.id === parentId) {
                return true;
            }
        }

        return false;
    }

    flatTreeData(flatTreeState?: INodeState[]) {
        this.roots.forEach((root, rootIndex) => {
            root.all(node => {
                if (rootIndex === 0) {
                    node.firstRoot = true;
                }

                if (node && flatTreeState && flatTreeState[this.flatTree.length]) {
                    node = Object.assign(node, flatTreeState[this.flatTree.length]);
                }

                this.flatTree.push(node);
            });
        });
    }

    generateStates(initialExpansionLevel?: number) {
        this.flatTree.forEach(model => {
            if (!isNaN(initialExpansionLevel)) {
                if (model.getPath().length <= initialExpansionLevel) {
                    this.setVisibilityAndExpanded(model);
                }

                if (model.getPath().length === initialExpansionLevel + 1) {
                    this.setVisibilityAndExpanded(model, false, false);
                }
            }

            if ((isNaN(initialExpansionLevel) || !initialExpansionLevel) && initialExpansionLevel !== 0) {
                if (model.firstRoot) {
                    this.setVisibilityAndExpanded(model);
                }

                if (model.isRoot() && !model.firstRoot) {
                    this.setVisibilityAndExpanded(model, false, false);
                }
            }
        });
    }

    setVisibilityAndExpanded(model, isExpanded = true, wasExpanded = true, visibility = true) {
        model.isVisible = visibility;
        model.isExpanded = isExpanded;
        model.wasExpanded = wasExpanded;
    }

    collapse(clickedNode) {
        this.nowCollapse = true;
        clickedNode.isExpanded = false;
        clickedNode.wasExpanded = false;
        this.clickedNodeId = null;
        this.closeNodes(clickedNode.children);
        this.dataSource = this.generateDataSource();
        this.collapse$.next({ status: true, node: clickedNode });
    }

    expand(clickedNode) {
        this.nowCollapse = false;
        clickedNode.isExpanded = true;
        clickedNode.wasExpanded = true;
        this.clickedNodeId = clickedNode.model.id;
        if (clickedNode.children) {
            clickedNode.children.forEach(element => {
                element.isVisible = true;
            });
        }
        this.expand$.next({ status: true, node: clickedNode });
        this.dataSource = this.generateDataSource();
    }

    onRowClick(clickedNode) {
        clickedNode.isExpanded = !clickedNode.isExpanded;
        clickedNode.wasExpanded = !clickedNode.wasExpanded;
        this.nowCollapse = !clickedNode.isExpanded;
        this.clickedNodeId = clickedNode.isExpanded ? clickedNode.model.id : null;
        if (!clickedNode.isExpanded) {
            this.closeNodes(clickedNode.children);
            this.collapse$.next({ status: true, node: clickedNode });
        } else {
            if (clickedNode.children) {
                clickedNode.children.forEach(element => {
                    element.isVisible = true;
                });
            }
            this.expand$.next({ status: true, node: clickedNode });
        }

        this.dataSource = this.generateDataSource();
    }

    closeNodes(node) {
        node.forEach(element => {
            element.isVisible = false;
            element.isExpanded = false;

            if (element.children) {
                this.closeNodes(element.children);
            }
        });
    }
}
