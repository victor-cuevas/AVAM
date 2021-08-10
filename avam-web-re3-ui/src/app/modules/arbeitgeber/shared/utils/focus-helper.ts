export class FocusHelper {
    static inputFocus(inputId: string): void {
        setTimeout(() => {
            const elementWrapper: HTMLElement = document.getElementById(inputId);
            const inputs: NodeListOf<HTMLElement> = elementWrapper.querySelectorAll<HTMLElement>('input');
            const firstInput = inputs.item(0);
            firstInput.focus();
        }, 800);
    }
}
