import { DefaultActions } from "./default-actions";
import { Toolbar } from "./toolbar";

export function NotFound() {
    return (
        <>
            <Toolbar title="Not found">
                <DefaultActions />
            </Toolbar>
            <p class="not-found">
                Whooops. This note does not exist. I suggest you{" "}
                <a href="#/">start again</a>.
            </p>
        </>
    );
}
