import { render as litRender, directive } from "lit-html/lit-html.js";
import router from "./utils/router.js";

export { html } from "lit-html/lit-html.js";
export { repeat } from "lit-html/directives/repeat.js";
export { unsafeHTML } from "lit-html/directives/unsafe-html";
export { until } from "lit-html/directives/until.js";

function handleLink(e) {
    e.preventDefault();
    router.navigate(e.currentTarget.pathname);
}

function handleRelativeLinksWithRouter(element) {
    const links = element.querySelectorAll('a[href^="/"]');
    for (const link of links) {
        link.removeEventListener("click", handleLink);
        link.addEventListener("click", handleLink);
    }
}

function render(templatePart, element) {
    litRender(templatePart, element);
    handleRelativeLinksWithRouter(element);
}

const dynamicElement = directive((elementName, properties) => (part) => {
    const element = document.createElement(elementName);
    for (const prop in properties) {
        element[prop] = properties[prop];
    }

    part.setValue(element);
});

export { render, dynamicElement };
