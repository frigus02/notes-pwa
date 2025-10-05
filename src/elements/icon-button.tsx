import type { JSX } from "preact/jsx-runtime";

export interface Props extends JSX.ButtonHTMLAttributes {
    icon:
        | "cancel"
        | "close"
        | "delete"
        | "edit"
        | "list"
        | "more_vert"
        | "save";
}

export function IconButton({ icon, ...props }: Props) {
    return (
        <button
            {...props}
            title={icon}
            class="icon-button material-symbols-outlined"
        >
            {icon}
        </button>
    );
}
