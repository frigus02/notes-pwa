import {
    render as litRender,
    directive,
    type Part,
    type TemplateResult,
} from "lit-html/lit-html.js";
import router from "./utils/router.js";

export { html } from "lit-html/lit-html.js";
export { repeat } from "lit-html/directives/repeat.js";
export { unsafeHTML } from "lit-html/directives/unsafe-html";
export { until } from "lit-html/directives/until.js";

function handleLink(e: Event) {
    e.preventDefault();
    router.navigate((e.currentTarget as HTMLAnchorElement).pathname);
}

function handleRelativeLinksWithRouter(element: Element | DocumentFragment) {
    const links = element.querySelectorAll('a[href^="/"]');
    for (const link of links) {
        link.removeEventListener("click", handleLink);
        link.addEventListener("click", handleLink);
    }
}

function render(
    templatePart: TemplateResult,
    element: Element | DocumentFragment,
) {
    litRender(templatePart, element);
    handleRelativeLinksWithRouter(element);
}

const dynamicElement = directive((elementName, properties) => (part: Part) => {
    const element = document.createElement(elementName);
    for (const prop in properties) {
        element[prop] = properties[prop];
    }

    part.setValue(element);
});

export { render, dynamicElement };
