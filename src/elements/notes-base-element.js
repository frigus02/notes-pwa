import { PropertiesMixin } from '@polymer/polymer/lib/mixins/properties-mixin.js';
import { render } from 'lit-html/lib/shady-render.js';

export { html } from 'lit-html/lib/lit-extended.js';

class NotesBaseElement extends PropertiesMixin(HTMLElement) {
    ready() {
        if (window.ShadyCSS) {
            ShadyCSS.styleElement(this);
        }

        this.attachShadow({ mode: 'open' });
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
        }
    }

    invalidate() {
        this._invalidateProperties();
    }

    render(/*props*/) {
        throw new Error('render() not implemented');
    }
}

export default NotesBaseElement;
