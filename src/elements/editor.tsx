import { minimalSetup } from "codemirror";
import {
    autocompletion,
    completionKeymap,
    type CompletionContext,
    type CompletionResult,
} from "@codemirror/autocomplete";
import { bracketMatching } from "@codemirror/language";
import { markdown } from "@codemirror/lang-markdown";
import {
    EditorView,
    dropCursor,
    keymap,
    highlightActiveLine,
} from "@codemirror/view";
import { useCallback, useRef } from "preact/hooks";
import { notes } from "./utils/notes";

export interface Props {
    name: string;
    defaultValue: string;
}

export function Editor({ name, defaultValue }: Props) {
    const input = useRef<HTMLInputElement>(null);
    const setupEditor = useCallback((container: HTMLDivElement | null) => {
        if (container === null) return;

        const markdownExt = markdown();
        const editor = new EditorView({
            doc: defaultValue,
            extensions: [
                minimalSetup,
                autocompletion(),
                dropCursor(),
                bracketMatching(),
                highlightActiveLine(),
                keymap.of([...completionKeymap]),
                markdownExt,
                markdownExt.language.data.of({
                    autocomplete: linkCompletions,
                }),
                EditorView.contentAttributes.of({
                    "aria-label": "Note content",
                }),
                EditorView.updateListener.of((update) => {
                    if (input.current && update.docChanged) {
                        input.current.value = update.state.doc.toString();
                    }
                }),
            ],
            parent: container,
        });

        return () => {
            editor.destroy();
        };
    }, []);

    return (
        <>
            <div class="editor" ref={setupEditor} />
            <input
                type="hidden"
                name={name}
                defaultValue={defaultValue}
                ref={input}
            />
        </>
    );
}

function linkCompletions(context: CompletionContext): CompletionResult | null {
    const match = context.matchBefore(/\[\w*/);
    if (!match) return null;
    if (match.to - match.from <= 1 && !context.explicit) return null;
    return {
        from: match.from,
        options: notes.value.map((note) => ({
            label: `[${note.title}](${encodeURI(note.path)})`,
        })),
    };
}
