import { BenutzerStelleTableRow } from '@shared/models/dtos/benutzerstelle-table-row.interface';
import { Injectable } from '@angular/core';
import { BenutzerstelleAendernRestService } from '@core/http/benutzerstelle-aendern-rest.service';
import { JwtDTO } from '@shared/models/dtos-generated/jwtDTO';
import { Subject } from 'rxjs';
import { StartPageModel } from '@shared/models/start-page.model';
import { BaseResponseWrapperJwtDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperJwtDTOWarningMessages';
import { TranslateService } from '@ngx-translate/core';
import { HeaderService } from '@core/services/header.service';

@Injectable()
export class BenutzerstelleAendernService {
    public subject: Subject<JwtDTO> = new Subject();
    private changedBenutzer: JwtDTO;

    constructor(private benutzerstelleAendernRestService: BenutzerstelleAendernRestService, private translateService: TranslateService, private headerService: HeaderService) {}

    changeBenutzerstelle(user: JwtDTO, row: BenutzerStelleTableRow, isLogin?: boolean): void {
        const startPageModel: StartPageModel = {} as StartPageModel;
        startPageModel.isLogin = isLogin ? isLogin : false;
        if (user.userDto.benutzerstelleCode === row.benutzerstelleCode) {
            this.benutzer = user;
            startPageModel.currentUser = user;
            startPageModel.siteChanged = false;
            localStorage.setItem('startPageModel', JSON.stringify(startPageModel));
            this.headerService.getJobroomMeldungenCount();
        } else {
            this.benutzerstelleAendernRestService
                .changeBenutzerstelle(row.benutzerDetailId, this.translateService.currentLang)
                .subscribe((wrapper: BaseResponseWrapperJwtDTOWarningMessages) => {
                    user = wrapper.data;
                    startPageModel.currentUser = user;
                    startPageModel.siteChanged = true;
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    localStorage.setItem('startPageModel', JSON.stringify(startPageModel));
                    this.benutzer = user;
                    this.headerService.getJobroomMeldungenCount();
                });
        }
    }

    get benutzer(): JwtDTO {
        return this.changedBenutzer;
    }

    set benutzer(value: JwtDTO) {
        this.changedBenutzer = value;
        this.subject.next(value);
    }
}
