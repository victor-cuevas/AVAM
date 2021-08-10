import { of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

export class NgbModalStub extends NgbModal {
    public open(key: any, options?: any): any {
        return { result: of(key).toPromise() };
    }
}
