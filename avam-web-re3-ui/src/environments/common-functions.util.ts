export function getBaseLocation() {
    let pathChunks: string[] = location.pathname.split('/');
    let basePath: string = (pathChunks && pathChunks[1]) || '';
    return '/' + basePath;
}
