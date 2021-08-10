import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable()
export class MessageBus {

    private static subject = new Subject<any>();

    /**
     * What about using the shortcut: buildAndSend(type, data)
     *
     * Example for (built) messages:
     * {
     *   type: 'stes-details-content'
     *   data: { contentNumber: 27, ueberschriftAddition: 'at the 25.06.2019'}
     * }
     *
     * Caution - please carefully setup types
     * - your-component-name      - keep in sync with receiver component, DON'T write 'app' or 'component'
     * - your-component-name.xyz  - 2nd message type in same component
     *
     * - unternehmenDTO           - the DTOs received from the server (any is ok)
     * - unternehmenGuiEntry      - the bad stuff which is needed for tables and autosuggests
     *
     * - keep your types in the related files only!
     * - please no additional features in this file!
     *
     * Sometimes data NEEDS to be wiped on screen leave
     */
    sendData(message: any) {
        MessageBus.subject.next(message);
    }

    buildAndSend(type: string, data: any) {
        MessageBus.subject.next({'type': type, 'data': data});
    }

    getData(): Observable<any> {
        return MessageBus.subject.asObservable();
    }
}
