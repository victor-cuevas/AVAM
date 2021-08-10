import { JwtDTO } from '@shared/models/dtos-generated/jwtDTO';

export interface StartPageModel {
    currentUser: JwtDTO;
    siteChanged: boolean;
    isLogin: boolean;
}
