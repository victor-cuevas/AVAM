import { HttpResponse } from '@angular/common/http';

export class HttpResponseHelper {
    static readonly CONTENT_DISPOSITION = 'Content-Disposition';
    static readonly CONTENT_TYPE = 'Content-Type';

    static openBlob(httpResponse: HttpResponse<Blob>, contentType?: string): void {
        if (!contentType) {
            contentType = HttpResponseHelper.getContentType(httpResponse);
        }
        const fileName = HttpResponseHelper.getFilename(httpResponse);
        const blob = new Blob([httpResponse.body], { type: contentType });
        const downloadURL = window.URL.createObjectURL(httpResponse.body);
        if (navigator.msSaveOrOpenBlob) {
            // IE 10+
            navigator.msSaveOrOpenBlob(blob, fileName);
        } else {
            const link = document.createElement('a');
            link.href = downloadURL;
            link.download = fileName;
            // this is necessary as link.click() does not work on the latest firefox
            link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
            setTimeout(function() {
                // For Firefox it is necessary to delay revoking the ObjectURL
                window.URL.revokeObjectURL(downloadURL);
                link.remove();
            }, 100);
        }
    }

    static openUrl(url: string, windowName?: string, windowConfig?: string) {
        let openWindow;
        windowName && windowConfig
            ? (openWindow = window.open(url, windowName, windowConfig))
            : !windowName && windowConfig
            ? (openWindow = window.open(url, windowConfig))
            : (openWindow = window.open(url, '_blank'));
        if (!!openWindow) {
            openWindow.focus();
        }
    }

    private static getContentType(httpResponse: HttpResponse<Blob>) {
        return httpResponse.headers.get(HttpResponseHelper.CONTENT_TYPE);
    }

    private static getFilename(httpResponse: HttpResponse<Blob>): string {
        const contentDispositionHeader = httpResponse.headers.get(HttpResponseHelper.CONTENT_DISPOSITION);
        const result = contentDispositionHeader
            .split(';')[1]
            .trim()
            .split('=')[1];
        return result.replace(/"/g, '');
    }
}
