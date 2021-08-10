import { Injectable } from '@angular/core';
import { FacadeService } from '@shared/services/facade.service';
import { GekoRegelRestService } from '@core/http/geko-regel-rest.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { BaseResponseWrapperListRegelGeKoDTOWarningMessages } from '@dtos/baseResponseWrapperListRegelGeKoDTOWarningMessages';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { KantonDTO } from '@dtos/kantonDTO';
import { UserDto } from '@dtos/userDto';
import { NavigationDto } from '@shared/models/dtos/navigation-dto';
import { RedirectService } from '@shared/services/redirect.service';
import { RegelGeKoDTO } from '@dtos/regelGeKoDTO';
import { BaseResponseWrapperRegelGeKoDTOWarningMessages } from '@dtos/baseResponseWrapperRegelGeKoDTOWarningMessages';
import { BaseResponseWrapperBooleanWarningMessages } from '@dtos/baseResponseWrapperBooleanWarningMessages';
import { Params } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class GekoRegelService {
    private benutzerstelleKanton: KantonDTO;
    private header$: BehaviorSubject<GeschaeftsregelHeader> = new BehaviorSubject<GeschaeftsregelHeader>({});

    constructor(public facade: FacadeService, private rest: GekoRegelRestService, private stesRest: StesDataRestService, private redirectService: RedirectService) {}

    search(): Observable<BaseResponseWrapperListRegelGeKoDTOWarningMessages> {
        return this.rest.search();
    }

    navigateToGeschaeftsregelBearbeiten(id: number): void {
        this.navigate('geko/geschaeftsregeln/bearbeiten', { regelId: id });
    }

    navigateToGeschaeftsregelErfassen(): void {
        this.navigate('geko/geschaeftsregeln/erfassen');
    }

    navigateToGeschaeftsregelnAnzeigen(): void {
        this.navigate('geko/geschaeftsregeln');
    }

    private navigate(url: string, queryParameters?: Params): void {
        const navigationDto: NavigationDto = {
            commands: [url],
            extras: { queryParams: queryParameters }
        };
        this.redirectService.navigate(navigationDto);
    }

    getLoggedUserBenutzerstelleKanton(channel?: string): void {
        const loggedUser: UserDto = this.facade.authenticationService.getLoggedUser();
        // we take the benutzerstelleCode.substr and not loggedUser.kantonKuerzel: we use same code/logic as RE2.
        const kantonsKuerzel = loggedUser.benutzerstelleCode.substr(0, 2);
        this.stesRest.getAllKantone(channel).subscribe((kantone: KantonDTO[]) => {
            if (kantone) {
                this.kanton = kantone.filter((k: KantonDTO) => k.kantonsKuerzel === kantonsKuerzel).pop();
            }
        });
    }

    set kanton(kanton: KantonDTO) {
        this.benutzerstelleKanton = kanton;
        this.dispatchHeader({ kanton });
    }

    pullHeader(): BehaviorSubject<GeschaeftsregelHeader> {
        return this.header$;
    }

    dispatchHeader(header: GeschaeftsregelHeader) {
        this.header$.next({ ...this.header$.getValue(), ...header });
    }
    create(dto: RegelGeKoDTO): Observable<BaseResponseWrapperRegelGeKoDTOWarningMessages> {
        return this.rest.create(dto);
    }

    loadGeschaeft(regelId: number): Observable<BaseResponseWrapperRegelGeKoDTOWarningMessages> {
        return this.rest.loadGeschaeft(regelId);
    }

    update(regelGeKoDTO: RegelGeKoDTO): Observable<BaseResponseWrapperRegelGeKoDTOWarningMessages> {
        return this.rest.update(regelGeKoDTO);
    }

    delete(regelId: number): Observable<BaseResponseWrapperBooleanWarningMessages> {
        return this.rest.delete(regelId);
    }
}

export interface GeschaeftsregelHeader {
    kanton?: KantonDTO;
    title?: string;
    tableCount?: number;
}
