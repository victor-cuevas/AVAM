export default class PrintHelper {
    static print(): void {
        // we remove the title temporarly
        const title: string = window.document.title;
        window.document.title = 'AVAM/PLASTA/COLSTA';
        // print
        window.print();
        // revert changes
        window.document.title = title;
    }
}
