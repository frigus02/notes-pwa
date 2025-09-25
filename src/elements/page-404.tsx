import { DefaultActions } from "./default-actions";
import { Toolbar } from "./toolbar";

export function NotFoundPage() {
    return (
        <>
            <Toolbar title="Not found">
                <DefaultActions />
            </Toolbar>
            <p class="not-found">
                Whooops. This page does not exist. I suggest you{" "}
                <a href="/">start again</a>.
            </p>
        </>
    );
}
