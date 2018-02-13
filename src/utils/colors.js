import { html } from '../elements/notes-base-element.js';

const cssColors = html`
    <style>
        :host {
            --primary-color: #5d4037;
            --light-primary-color: #8b6b61;
            --dark-primary-color: #321911;

            --secondary-color: #2196f3;
            --light-secondary-color: #6ec6ff;
            --dark-secondary-color: #0069c0;

            --primary-background-color: #ffffff;
            --primary-text-color: #212121;
            --primary-text-color-on-dark: #ffffff;
            --secondary-text-color: #737373;
            --secondary-text-color-on-dark: #bcbcbc;
            --disabled-text-color: #9b9b9b;
            --divider-color: #dbdbdb;
            --error-color: #ff6500;
        }
    </style>
`;

export { cssColors };
