import { PropertiesMixin } from "@polymer/polymer/lib/mixins/properties-mixin.js";
import { render } from "lit-html/lib/shady-render.js";
import { directive } from "lit-html/lit-html.js";
import router from "./utils/router.js";

export { html } from "lit-html/lib/shady-render.js";
export { repeat } from "lit-html/directives/repeat.js";
export { until } from "lit-html/directives/until.js";

function handleLink(e) {
  e.preventDefault();
  router.navigate(e.currentTarget.pathname);
}

class NotesBaseElement extends PropertiesMixin(HTMLElement) {
  ready() {
    if (window.ShadyCSS) {
      ShadyCSS.styleElement(this);
    }

    this.attachShadow({ mode: "open" });
    super.ready();
  }

  _shouldPropertiesChange(/*props, changedProps, prevProps*/) {
    return true;
  }

  _propertiesChanged(props, changedProps, prevProps) {
    super._propertiesChanged(props, changedProps, prevProps);
    const result = this.render(props);
    if (result) {
      render(result, this.shadowRoot, this.constructor.is);
      this._handleRelativeLinksWithRouter();
    }
  }

  _handleRelativeLinksWithRouter() {
    const links = this.shadowRoot.querySelectorAll('a[href^="/"]');
    for (const link of links) {
      link.removeEventListener("click", handleLink);
      link.addEventListener("click", handleLink);
    }
  }

  invalidate() {
    this._invalidateProperties();
  }

  render(/*props*/) {
    throw new Error("render() not implemented");
  }
}

const dynamicElement = directive((elementName, properties) => part => {
  const element = document.createElement(elementName);
  for (const prop in properties) {
    element[prop] = properties[prop];
  }

  part.setValue(element);
});

export default NotesBaseElement;
export { dynamicElement };
