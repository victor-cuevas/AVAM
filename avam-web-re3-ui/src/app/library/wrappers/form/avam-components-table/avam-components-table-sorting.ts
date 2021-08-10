import * as moment from 'moment';

export let sort = {
    AvamLabelDropdownComponent: (event, options) => {
        sort.emptyValues(event, event.field);
        event.data.sort((value1, value2) => {
            if (value1[event.field] !== null && value2[event.field] !== null) {
                const optionValue1 = options[value1[event.field]] ? options[value1[event.field]].labelDe : '';
                const optionValue2 = options[value2[event.field]] ? options[value2[event.field]].labelDe : '';
                if (event.order === 1) {
                    return optionValue1.localeCompare(optionValue2);
                }

                if (event.order === -1) {
                    return optionValue2.localeCompare(optionValue1);
                }
            }
        });
    },

    AvamSpracheAutosuggestComponent: event => {
        sort.emptyValues(event, event.field);
        event.data.sort((value1, value2) => {
            const defValue1 = value1.language && value1.language.kurzTextDe !== null && value1.language.kurzTextDe !== undefined;
            const defValue2 = value2.language && value2.language.kurzTextDe !== null && value2.language.kurzTextDe !== undefined;

            if (defValue1 && defValue2) {
                if (event.order === 1) {
                    return value1.language.kurzTextDe.localeCompare(value2.language.kurzTextDe);
                }
                if (event.order === -1) {
                    return value2.language.kurzTextDe.localeCompare(value1.language.kurzTextDe);
                }
            }
        });
    },

    AvamLabelCalendarComponent: event => {
        sort.emptyValues(event, event.field);
        event.data.sort((value1, value2) => {
            if (value1[event.field] !== null && value2[event.field] !== null) {
                const date1 = moment(value1[event.field]);
                const date2 = moment(value2[event.field]);

                if (event.order === 1) {
                    if (date1.isValid() && date2.isValid()) {
                        return +new Date(date1.format('DD MMMM YYYY')) - +new Date(date2.format('DD MMMM YYYY'));
                    }
                }

                if (event.order === -1) {
                    if (date1.isValid() && date2.isValid()) {
                        return +new Date(date2.format('DD MMMM YYYY')) - +new Date(date1.format('DD MMMM YYYY'));
                    }
                }
            }
        });
    },

    AvamLabelInputComponent: event => {
        sort.emptyValues(event, event.field);
        event.data.sort((value1, value2) => {
            if (value1[event.field] !== null && value2[event.field] !== null) {
                if (event.order === 1) {
                    return value1[event.field].localeCompare(value2[event.field]);
                }

                if (event.order === -1) {
                    return value2[event.field].localeCompare(value1[event.field]);
                }
            }
        });
    },

    emptyValues: (event, field) => {
        event.data.sort((value1, value2) => {
            let val1 = value1[event.field];
            let val2 = value2[event.field];

            if (field === 'language') {
                val1 = value1[event.field].kurzTextDe;
                val2 = value2[event.field].kurzTextDe;
            }

            if (event.order === 1) {
                return ((val2 === null) as any) - ((val1 === null) as any);
            }

            if (event.order === -1) {
                return ((val1 === null) as any) - ((val2 === null) as any);
            }
        });
    }
};
