import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';
import { DbTranslateService } from '@app/shared/services/db-translate.service';

interface ParticipationCalendar {
    startDate: any;
    endDate: any;
}

@Component({
    selector: 'avam-participation-places',
    templateUrl: './participation-places.component.html',
    styleUrls: ['./participation-places.component.scss']
})
export class ParticipationPlacesComponent implements OnInit {
    treeExpanded = false;

    @Input('dataSource') set dataSource(dataSource) {
        if (dataSource && dataSource.data) {
            dataSource.data.plaetze[0].isExpanded = false;

            dataSource.data.plaetze[0].buchungen.forEach((data, key, arr) => {
                data.isVisible = false;
                if (Object.is(arr.length - 1, key)) {
                    data.lastChild = true;
                }

                key = key + 1;
                data.panelPos = key * 50;
            });

            this._dataSource = dataSource.data;

            moment.locale(this.dbTranslateService.getCurrentLang());
            this.beginDate = moment(dataSource.data.zeitraumBeginn).format('MMMM YYYY');
            const weeks = this.getWeeksFromMonth(dataSource.data.zeitraumBeginn);
            this.weekDays = this.getAllWeekdaysBetweenDates(weeks);
            this.calcolateRangeBetweenDates(weeks);

            if (this.treeExpanded) {
                this.toggleTree();
            }
        }
    }

    _dataSource: any;

    status = { 0: 'white', 1: 'green', 2: 'orange', 3: 'red' };
    weekDays: any[] = [];
    calendar: ParticipationCalendar[] = [];
    beginDate: any;

    constructor(private dbTranslateService: DbTranslateService) {}

    ngOnInit() {}

    toggleTree() {
        this._dataSource.plaetze[0].isExpanded = !this._dataSource.plaetze[0].isExpanded;
        if (this._dataSource.plaetze[0].isExpanded) {
            this._dataSource.plaetze[0].buchungen.forEach(data => {
                data.isVisible = true;
            });
            this.treeExpanded = true;
        } else {
            this._dataSource.plaetze[0].buchungen.forEach(data => {
                data.isVisible = false;
            });
            this.treeExpanded = false;
        }
    }

    getAllWeekdaysBetweenDates(weeks) {
        const weekDays = [];
        for (const week of weeks) {
            for (const m = moment(week.startDate); m.diff(week.endDate, 'days') <= 0; m.add(1, 'days')) {
                weekDays.push(m.format('dd'));
            }
        }

        return weekDays;
    }

    calcolateRangeBetweenDates(weeks) {
        weeks.forEach((date: any) => {
            date.range = moment.duration(date.endDate.diff(date.startDate)).asDays() + 1;
        });
    }

    getWeeksFromMonth(dataTest) {
        const date: any = new Date(dataTest);
        const selectedMonth = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
        const selectedYear = date.getFullYear();
        const totalDays = new Date(selectedYear, Number(selectedMonth), 0).getDate();
        const firstDay = date.getDay(date.setDate(1));
        let weeks = 0;
        let i = 1;
        const generatedWeeks: ParticipationCalendar[] = [];

        if (firstDay !== 1) {
            const startDate = `${selectedYear} '-' ${selectedMonth} '-01'`;
            const endDate = `${selectedYear} '-' ${selectedMonth} '-'  ${8 - firstDay === 8 ? '01' : '0' + (8 - firstDay)}`;
            generatedWeeks.push({ startDate: moment(startDate, 'YYYY-MM-DD'), endDate: moment(endDate, 'YYYY-MM-DD') });
            weeks = 1;
            i = firstDay === 0 ? 2 : 8 - firstDay + 1;
        }

        for (; i <= totalDays; i = i + 7) {
            if (totalDays - i > 6) {
                const startDate = `${selectedYear} '-'  ${selectedMonth} '-' ${(i < 10 ? '0' : '') + i}`;
                const endDate = `${selectedYear}  '-'  ${selectedMonth}  '-'  ${(i < 4 ? '0' : '') + (i + 6)}`;
                generatedWeeks.push({ startDate: moment(startDate, 'YYYY-MM-DD'), endDate: moment(endDate, 'YYYY-MM-DD') });
            } else {
                const startDate = `${selectedYear} '-' ${selectedMonth} '-' ${i}`;
                const endDate = `${selectedYear} '-' ${selectedMonth} '-' ${totalDays}`;
                generatedWeeks.push({ startDate: moment(startDate, 'YYYY-MM-DD'), endDate: moment(endDate, 'YYYY-MM-DD') });
                weeks++;
            }
        }
        this.calendar = generatedWeeks;

        return generatedWeeks;
    }
}
