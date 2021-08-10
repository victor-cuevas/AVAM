import { Renderer2 } from "@angular/core";

export class MockRenderer extends Renderer2 {
    data: { [key: string]: any; }; destroy(): void {
        throw new Error("Method not implemented.");
    }
    createElement(name: string, namespace?: string) {
        throw new Error("Method not implemented.");
    }
    createComment(value: string) {
        throw new Error("Method not implemented.");
    }
    createText(value: string) {
        throw new Error("Method not implemented.");
    }
    appendChild(parent: any, newChild: any): void {
        throw new Error("Method not implemented.");
    }
    insertBefore(parent: any, newChild: any, refChild: any): void {
        throw new Error("Method not implemented.");
    }
    removeChild(parent: any, oldChild: any): void {
        throw new Error("Method not implemented.");
    }
    selectRootElement(selectorOrNode: any) {
        throw new Error("Method not implemented.");
    }
    parentNode(node: any) {
        throw new Error("Method not implemented.");
    }
    nextSibling(node: any) {
        throw new Error("Method not implemented.");
    }
    setAttribute(el: any, name: string, value: string, namespace?: string): void {
        throw new Error("Method not implemented.");
    }
    removeAttribute(el: any, name: string, namespace?: string): void {
        throw new Error("Method not implemented.");
    }
    addClass(el: any, name: string): void {
        throw new Error("Method not implemented.");
    }
    removeClass(el: any, name: string): void {
        throw new Error("Method not implemented.");
    }
    setStyle(el: any, style: string, value: any, flags?: import("@angular/core").RendererStyleFlags2): void {
        throw new Error("Method not implemented.");
    }
    removeStyle(el: any, style: string, flags?: import("@angular/core").RendererStyleFlags2): void {
        throw new Error("Method not implemented.");
    }
    setProperty(el: any, name: string, value: any): void {
        el[name] = value;
    }
    setValue(node: any, value: string): void {
        throw new Error("Method not implemented.");
    }
    listen(target: any, eventName: string, callback: (event: any) => boolean | void): () => void {
        throw new Error("Method not implemented.");
    }
}
