import { ListDialogContent } from "./list-dialog";
import { Toolbar } from "./toolbar";
import { Dialog, useDialog } from "./utils/dialog";

export function NotFoundPage() {
    const [listDialogProps, openList] = useDialog();
    return (
        <>
            <Toolbar title="Not found">
                <button onClick={openList}>All</button>
            </Toolbar>
            <p class="not-found">
                Whooops. This page does not exist. I suggest you{" "}
                <a href="/">start again</a>.
            </p>
            <Dialog {...listDialogProps}>
                <ListDialogContent />
            </Dialog>
        </>
    );
}
