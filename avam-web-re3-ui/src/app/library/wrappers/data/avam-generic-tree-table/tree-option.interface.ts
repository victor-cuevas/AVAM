import { TemplateRef } from '@angular/core';
import { INodeState } from './node-state.interface';

export interface TreeOptionInterface {
    columnOrder?: string[];
    columnTitle?: any[];
    actions?: {
        template: TemplateRef<any>;
        columnWidth?: number;
    };
    firstColumnCustomWidth?: number;
    initialExpansionLevel?: number;
    shouldSaveExpansonState?: boolean;
    flatTreeState?: INodeState[];
}
