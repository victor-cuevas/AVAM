import { environment } from './environment.prod';

describe('Environment', () => {
    it('should create', () => {
        expect(environment).toEqual({ baseUrl: '/_REST', helpBaseUrl: '/_RE2', production: true }); //IT tests only that the Backend Application runs under Context '<client_app_context>_REST'
    });
});
