import {environment} from '../../../environments/environment';

export function setBaseUrl(url: string): string {
    return environment.baseUrl + url;
}
