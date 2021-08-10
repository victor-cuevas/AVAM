import { getBaseLocation } from '@environments/common-functions.util';

export const environment = {
    production: true,
    baseUrl: getBaseLocation() + '_REST',
    helpBaseUrl: getBaseLocation() + '_RE2'
};
