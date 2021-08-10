import { Unsubscribable } from 'oblique-reactive';
import { FacadeService } from '@shared/services/facade.service';
import { ToolboxService } from '@app/shared';
import { ToolboxActionEnum, ToolboxConfiguration } from '@shared/services/toolbox.service';
import { filter, takeUntil } from 'rxjs/operators';
import PrintHelper from '@shared/helpers/print.helper';

export abstract class RahmenfristenModalenAbstract extends Unsubscribable {
    toolboxId: string;
    modalToolboxConfiguration: ToolboxConfiguration[];
    dataSource: any[] = [];

    protected constructor(protected facadeService: FacadeService) {
        super();
    }

    protected initModal(toolboxId: string): void {
        this.toolboxId = toolboxId;
        this.configureToolbox();
        this.observePrintAction();
    }

    close(): void {
        this.facadeService.openModalFensterService.dismissAll();
    }

    getBurNr(burNr: number) {
        if (burNr && burNr > 0) {
            return burNr;
        }
        return '';
    }

    private configureToolbox(): void {
        ToolboxService.CHANNEL = this.toolboxId;
        this.modalToolboxConfiguration = [new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false), new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)];
        this.facadeService.toolboxService
            .observeClickAction(this.toolboxId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(action => {
                if (action.message.action === ToolboxActionEnum.EXIT) {
                    this.close();
                }
            });
    }

    private observePrintAction(): void {
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(
                filter(action => action.message.action === ToolboxActionEnum.PRINT),
                takeUntil(this.unsubscribe)
            )
            .subscribe(() => {
                PrintHelper.print();
            });
    }
}
