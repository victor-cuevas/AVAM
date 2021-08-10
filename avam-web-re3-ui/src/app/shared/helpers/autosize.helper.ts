export function resizeTextArea(textarea: HTMLTextAreaElement, baseScrollHeight: string, visibleMaxRows: number) {

    let currentScrollTop = textarea.scrollTop;

    textarea.style.overflowY = 'hidden';
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';

    if (baseScrollHeight) {
        textarea.style.maxHeight = visibleMaxRows * Number(baseScrollHeight.substring(0, baseScrollHeight.length - 2)) + 'px';

        const textareaSize = textarea.style.height.valueOf().substring(0, textarea.style.height.length - 2);
        if (Number(textareaSize) >= visibleMaxRows * Number(baseScrollHeight.substring(0, baseScrollHeight.length - 2))) {
            textarea.style.overflowY = 'scroll';
            if (navigator && navigator.userAgent && navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                if (textarea.textLength === textarea.selectionStart) {
                    textarea.scrollTop = textarea.scrollHeight;
                } else {
                    textarea.scrollTop = currentScrollTop;
                }
            }
        }
    }
}


