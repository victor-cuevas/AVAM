function buildPath(base: string, id: string | number, path?: string): string {
    return path ? `${base}/${id}/${path}` : `${base}/${id}`;
}
export function buildStesPath(stesId: string, path?: string): string {
    return buildPath('stes/details', stesId, path);
}
export function buildArbeitgeberPath(unternehmenId: string, path?: string): string {
    return buildPath('arbeitgeber/details', unternehmenId, path);
}
export function buildAnbieterPath(unternehmenId: string, path?: string): string {
    return buildPath('amm/anbieter', unternehmenId, path);
}
export function buildFachberatungPath(unternehmenId: string, path?: string): string {
    return buildPath('stes/fachberatung', unternehmenId, path);
}
export function buildBenutzerstellePath(benutzerstellenId: string | number, path?: string): string {
    return buildPath('informationen/verzeichnisse/benutzerstelle', benutzerstellenId, path);
}
