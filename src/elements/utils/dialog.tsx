import type { ComponentChildren, RefCallback } from "preact";
import { useState } from "preact/hooks";

interface Props {
    visible: boolean;
    dialogRef: RefCallback<HTMLDialogElement>;
    children?: ComponentChildren;
}

export function useDialog() {
    const [visible, setVisible] = useState(false);
    const dialogRef: RefCallback<HTMLDialogElement> = (dialog) => {
        if (!dialog) return;
        dialog.addEventListener("close", () => setVisible(false));
        dialog.showModal();
    };
    const props: Props = { visible, dialogRef };
    const open = () => void setVisible(true);
    return [props, open] as const;
}

export function Dialog({ visible, dialogRef, children }: Props) {
    return visible ? <dialog ref={dialogRef}>{children}</dialog> : null;
}
