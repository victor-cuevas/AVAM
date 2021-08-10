import { environment } from '../../../environments/environment';

export function setHelpBaseUrl(url: string): string {
    return environment.helpBaseUrl + url;
}
