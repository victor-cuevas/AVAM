import * as moment from 'moment';
import { Moment } from 'moment';
import { Injectable } from '@angular/core';
import { InfotagRestService } from '@core/http/infotag-rest.service';
import { Observable, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// prettier-ignore
import {BaseResponseWrapperListInfotagMassnahmeDurchfuehrungseinheitDTOWarningMessages} from
        '@dtos/baseResponseWrapperListInfotagMassnahmeDurchfuehrungseinheitDTOWarningMessages';
import { InfotagMassnahmeDurchfuehrungseinheitRequestDTO } from '@dtos/infotagMassnahmeDurchfuehrungseinheitRequestDTO';
import { ElementKategorieEnum } from '@shared/enums/element-kategorie.enum';
import { ElementKategorieDTO } from '@shared/models/dtos-generated/elementKategorieDTO';
import { InfotagZuweisungSaveDTO } from '@shared/models/dtos-generated/infotagZuweisungSaveDTO';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import { CodeDTO } from '@shared/models/dtos-generated/codeDTO';
import { BaseResponseWrapperLongWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperLongWarningMessages';
import { NotificationService } from 'oblique-reactive';
import { BaseResponseWrapperInfotagBeschreibungDurchfuehrungsortDTOWarningMessages } from '@dtos/baseResponseWrapperInfotagBeschreibungDurchfuehrungsortDTOWarningMessages';
import { BaseResponseWrapperTeilnehmerBuchungSessionWithTitelDTOWarningMessages } from '@dtos/baseResponseWrapperTeilnehmerBuchungSessionWithTitelDTOWarningMessages';
import { UserDto } from '@shared/models/dtos-generated/userDto';
import { JwtDTO } from '@shared/models/dtos-generated/jwtDTO';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { BaseResponseWrapperListElementKategorieDTOWarningMessages } from '../models/dtos-generated/baseResponseWrapperListElementKategorieDTOWarningMessages';

@Injectable()
export class InfotagService {
    public massnahmeDurchfuehrungseinheiten: Subject<BaseResponseWrapperListInfotagMassnahmeDurchfuehrungseinheitDTOWarningMessages> = new Subject();
    public teilnehmerliste: Subject<BaseResponseWrapperTeilnehmerBuchungSessionWithTitelDTOWarningMessages> = new Subject();
    public buchenSubject: Subject<string> = new Subject();
    public geschaeftsfallSubject: Subject<number> = new Subject();
    public ortUndBeschreibungSubject: Subject<BaseResponseWrapperInfotagBeschreibungDurchfuehrungsortDTOWarningMessages> = new Subject();

    private value: BaseResponseWrapperListInfotagMassnahmeDurchfuehrungseinheitDTOWarningMessages;
    private buchenValue: string;
    private geschaeftsfallValue: number;
    private ortUndBeschreibungValue: BaseResponseWrapperInfotagBeschreibungDurchfuehrungsortDTOWarningMessages;

    constructor(
        private infotagRestService: InfotagRestService,
        private translateService: TranslateService,
        private ammRestService: AmmRestService,
        private stesDataRestService: StesDataRestService,
        private notificationService: NotificationService
    ) {}

    initRequest(initStesId: number, kategories?: ElementKategorieDTO[]): InfotagMassnahmeDurchfuehrungseinheitRequestDTO {
        const today: Moment = moment().startOf('day');
        return {
            language: this.translateService.currentLang,
            titel: null,
            durchfuehrungseinheitId: null,
            anbieterId: null,
            anbieterName: null,
            elementKategorieId: kategories ? '' + this.getElementKategorieIdByOrganisation(kategories) : '',
            plz: null,
            isImAngebotSichtbar: false,
            zeitraumVon: InfotagService.getZeitraumVon(today),
            zeitraumBis: InfotagService.getZeitraumBis(today),
            stesId: initStesId
        } as InfotagMassnahmeDurchfuehrungseinheitRequestDTO;
    }

    getDurchfuehrungseinheiten(request: InfotagMassnahmeDurchfuehrungseinheitRequestDTO): void {
        this.infotagRestService.getDurchfuehrungseinheiten(request).subscribe((response: BaseResponseWrapperListInfotagMassnahmeDurchfuehrungseinheitDTOWarningMessages) => {
            this.durchfuehrungseinheiten = response;
        });
    }

    loadTeilnehmerListe(isBuchung: boolean, stesId: string, geschaeftsfallId: string, language: string) {
        this.infotagRestService
            .getBuchungTeilnehmerListe(isBuchung, stesId, geschaeftsfallId, language)
            .subscribe((response: BaseResponseWrapperTeilnehmerBuchungSessionWithTitelDTOWarningMessages) => {
                this.teilnehmerliste.next(response);
            });
    }

    initBuchung(stesId: string, dfeId: any, buchungsstatusId: number): void {
        this.infotagRestService.buchen(this.createInitDto(stesId, dfeId, buchungsstatusId)).subscribe((response: BaseResponseWrapperLongWarningMessages) => {
            this.buchen = dfeId;
            this.geschaeftsfall = response.data;
            this.notificationService.success('common.message.datengespeichert');
        });
    }

    getKategories(): Observable<BaseResponseWrapperListElementKategorieDTOWarningMessages> {
        return this.ammRestService.getElementkategoriesByAuthorizationKeyScope(ElementKategorieEnum.KEY_AMM_INFOTAG_NUTZEN);
    }

    getBuchungsstatusCodes(): Observable<CodeDTO[]> {
        return this.stesDataRestService.getCode(DomainEnum.AMMINFOTAGBUCHUNGSTATUS);
    }

    getOrtUndBeschreibung(isBuchung: boolean, stesId: string, geschaeftsfallId: number): void {
        if (geschaeftsfallId === 0 || isNaN(geschaeftsfallId)) {
            return;
        }
        this.infotagRestService
            .getOrtUndBeschreibung(isBuchung, stesId, geschaeftsfallId, this.translateService.currentLang)
            .subscribe((response: BaseResponseWrapperInfotagBeschreibungDurchfuehrungsortDTOWarningMessages) => {
                this.ortUndBeschreibung = response;
            });
    }

    get buchen(): string {
        return this.buchenValue;
    }

    set buchen(dfeId: string) {
        this.buchenValue = dfeId;
        this.buchenSubject.next(dfeId);
    }

    get geschaeftsfall(): number {
        return this.geschaeftsfallValue;
    }

    set geschaeftsfall(geschaeftsfallId: number) {
        this.geschaeftsfallValue = geschaeftsfallId;
        this.geschaeftsfallSubject.next(geschaeftsfallId);
    }

    get durchfuehrungseinheiten(): BaseResponseWrapperListInfotagMassnahmeDurchfuehrungseinheitDTOWarningMessages {
        return this.value;
    }

    set durchfuehrungseinheiten(response: BaseResponseWrapperListInfotagMassnahmeDurchfuehrungseinheitDTOWarningMessages) {
        this.value = response;
        this.massnahmeDurchfuehrungseinheiten.next(response);
    }

    get ortUndBeschreibung(): BaseResponseWrapperInfotagBeschreibungDurchfuehrungsortDTOWarningMessages {
        return this.ortUndBeschreibungValue;
    }

    set ortUndBeschreibung(response: BaseResponseWrapperInfotagBeschreibungDurchfuehrungsortDTOWarningMessages) {
        this.ortUndBeschreibungValue = response;
        this.ortUndBeschreibungSubject.next(response);
    }

    public getElementKategorieIdByOrganisation(kategories: ElementKategorieDTO[]): number {
        const user: JwtDTO = JSON.parse(localStorage.getItem('currentUser'));
        const curentUser: UserDto = user.userDto;
        const category = kategories.find(k => curentUser.benutzerstelleCode.startsWith(k.organisation));
        return category ? category.elementkategorieId : null;
    }

    private static getZeitraumVon(momentDate: Moment): Date {
        return momentDate.add(1, 'days').toDate();
    }

    private static getZeitraumBis(momentDate: Moment): Date {
        return momentDate
            .add(2, 'months')
            .subtract(1, 'days')
            .toDate();
    }

    private createInitDto(stesId: string, dfeId: any, bsId: number): InfotagZuweisungSaveDTO {
        return {
            buchungsstatusId: bsId,
            geschaeftsfallId: 0,
            language: this.translateService.currentLang,
            ojbVersion: 0,
            ojbVersionPraesenzStatus: 0,
            originalStesId: +stesId,
            praesenzStatusId: 0,
            sessionId: dfeId,
            stesId: +stesId
        } as InfotagZuweisungSaveDTO;
    }
}
