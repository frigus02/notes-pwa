import { h } from "preact";
import { useState, useRef } from "preact/hooks";

// Copy of lazy from preact-iso but without reliance on suspend.
//
// The preact-iso function results in an error:
//
//     Missing Suspense
//
// It's not clear to me how to resolve that. Since we don't really need a
// fallback rendering in this case, returning null while loading seems fine.
//
// https://github.com/preactjs/preact-iso/blob/0c0a7fa8e8c8d77c083cc3545dfec547a46fca9f/src/lazy.js#L13
export function lazy<T>(load: () => Promise<T>): T {
    let p: Promise<void>;
    let c: T;

    const loadModule = async () => {
        c = await load();
    };

    const LazyComponent = (props: any) => {
        const [, update] = useState(0);
        const r = useRef<Promise<void>>();
        if (!p) p = loadModule();
        if (c !== undefined) return h(c as any, props);
        if (!r.current) r.current = p.then(() => update(1));
        return null;
    };

    return LazyComponent as any;
}
