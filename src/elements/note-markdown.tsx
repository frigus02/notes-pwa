import { useEffect, useRef } from "preact/hooks";
import { markdownToHtml } from "./utils/worker-request.js";

interface Props {
    value: string;
}

export function NoteMarkdown({ value }: Props) {
    const container = useRef<HTMLDivElement>(null);
    useEffect(() => {
        markdownToHtml(value).then((html) => {
            container.current!.innerHTML = html;
        });
    }, [value]);

    return <div ref={container} />;
}
