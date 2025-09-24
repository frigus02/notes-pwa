import type { ComponentChildren } from "preact";

interface Props {
    title: string;
    subTitle?: string;
    children?: ComponentChildren;
}

export function Toolbar({ title, subTitle, children }: Props) {
    return (
        <header class="toolbar">
            <div>
                <h1>{title}</h1>
                {subTitle && <div class="sub">{subTitle}</div>}
            </div>
            <div>{children}</div>
        </header>
    );
}
