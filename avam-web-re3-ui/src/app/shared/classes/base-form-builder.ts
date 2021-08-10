export interface BaseFormBuilder {
    /**
     * 3x footerButton actions
     * Step one: fehlermeldungenService.closeMessage()
     */
    reset(): void;
    cancel?(): void;
    save(shouldFinish?: boolean): void;

    /**
     * load business DTO and codes
     */
    getData(): void;

    /**
     * called during init
     */
    defineFormGroups?(): void;
    createFooterActionMapper?(): void;

    /**
     * applies data if present (return e.g. boolean isDataPresent to conditionally show success message)
     * Step one: reset of ngForm or <yourScreen>Form
     */
    updateForm?(data: any, onSave?: boolean): void;
}
