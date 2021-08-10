import {ErweiterteSucheIdLabelDTO} from './erweiterte-suche-id-label-dto.interface';

export interface ErweiterteSucheDTO {
	fieldGroupIdLabelBeans: Array<ErweiterteSucheIdLabelDTO>;
	idComparatorIdLabelBeans: Array<ErweiterteSucheIdLabelDTO>;
	numberComparatorIdLabelBeans: Array<ErweiterteSucheIdLabelDTO>;
	stringComparatorIdLabelBeans: Array<ErweiterteSucheIdLabelDTO>;
}
