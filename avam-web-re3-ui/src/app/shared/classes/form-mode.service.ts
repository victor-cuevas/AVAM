import { BehaviorSubject } from 'rxjs';
import { FormModeEnum } from '../enums/form-mode.enum';

export class FormMode {
    private readonly _mode = new BehaviorSubject(FormModeEnum.CREATE);

    constructor() {}

    readonly mode$ = this._mode.asObservable();

    private get mode() {
        return this._mode.getValue();
    }

    private set mode(mode) {
        this._mode.next(mode);
    }

    changeMode(mode) {
        this.mode = mode;
    }
}
