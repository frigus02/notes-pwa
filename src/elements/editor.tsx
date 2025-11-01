import { minimalSetup } from "codemirror";
import {
    autocompletion,
    completionKeymap,
    type CompletionContext,
    type CompletionResult,
} from "@codemirror/autocomplete";
import { bracketMatching, syntaxTree } from "@codemirror/language";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import {
    EditorView,
    dropCursor,
    keymap,
    highlightActiveLine,
} from "@codemirror/view";
import {
    EditorState,
    type TransactionSpec,
    type Transaction,
    type Text,
} from "@codemirror/state";
import type { SyntaxNode } from "@lezer/common";
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

        const markdownExt = markdown({
            base: markdownLanguage,
        });
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
                EditorState.transactionFilter.of(formatTableTransactionFilter),
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

const MIN_COLUMN_SIZE = " --- ".length;
const TABLE_TYPE = "Table";
const DELIMITER_TYPE = "TableDelimiter";
const HEADER_TYPE = "TableHeader";
const ROW_TYPE = "TableRow";
const CELL_TYPE = "TableCell";
const ROW_TYPES = new Set([HEADER_TYPE, ROW_TYPE]);

function isWithinCell(text: Text) {
    // TODO: Handle escaped pipes
    return text.lines === 1 && !text.sliceString(0).includes("|");
}

function formatTableTransactionFilter(
    transaction: Transaction,
): TransactionSpec | readonly TransactionSpec[] {
    if (!transaction.docChanged) return transaction;

    const tree = syntaxTree(transaction.startState);
    const doc = transaction.startState.doc;
    const newDoc = transaction.newDoc;

    const result: TransactionSpec[] = [transaction];
    transaction.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
        const deleted = doc.slice(fromA, toA);
        if (!isWithinCell(deleted) || !isWithinCell(inserted)) {
            return;
        }

        const node = tree.resolve(fromA);
        const table =
            node.name === CELL_TYPE
                ? node.parent?.parent
                : ROW_TYPES.has(node.name)
                  ? node.parent
                  : node;
        if (!table || table.name !== TABLE_TYPE) return;

        const lengthChange = toB - fromB - (toA - fromA);
        function getCellBounds(row: SyntaxNode) {
            const delimiters = row.getChildren(DELIMITER_TYPE);
            const line = doc.lineAt(row.from);
            if (delimiters.length === 0) return [];
            if (
                delimiters[0].from !== line.from ||
                delimiters.at(-1)!.to !== line.to
            ) {
                // TODO: Support tables without start and end column delimiter.
                return [];
            }

            const cells = [];
            for (let i = 1; i < delimiters.length; i++) {
                const from = delimiters[i - 1].to;
                const to = delimiters[i].from;
                const changed = fromA >= from && toA <= to;

                let newContent;
                if (changed) {
                    newContent = newDoc.sliceString(from, to + lengthChange);
                } else {
                    newContent = doc.sliceString(from, to);
                }

                // Plus 1 space at beginning and end of cell
                const requiredLength = newContent.trim().length + 2;
                cells.push({
                    from,
                    to,
                    newContent,
                    requiredLength,
                });
            }
            return cells;
        }

        const cells = [table.firstChild!, ...table.getChildren(ROW_TYPE)].map(
            getCellBounds,
        );

        const columnSizes = Array.from<number>({
            length: cells[0].length,
        }).fill(MIN_COLUMN_SIZE);
        for (const row of cells) {
            for (const [i, cell] of row.entries()) {
                columnSizes[i] = Math.max(columnSizes[i], cell.requiredLength);
            }
        }

        for (const row of cells) {
            for (const [i, cell] of row.entries()) {
                let length = cell.newContent.length;
                const leadingSpace = cell.newContent.search(/[^ ]/);
                if (leadingSpace === 0) {
                    // unshift helps when writing the first
                    // character in a 0-width cell. Push
                    // would result in the space being
                    // after the inserted character.
                    result.unshift({
                        changes: {
                            from: cell.from,
                            insert: " ",
                        },
                    });
                    length += 1;
                } else if (leadingSpace > 1) {
                    result.push({
                        changes: {
                            from: cell.from + 1,
                            to: cell.from + leadingSpace,
                        },
                    });
                    length -= leadingSpace - 1;
                }

                const diff = columnSizes[i] - length;
                if (diff > 0) {
                    result.push({
                        changes: {
                            from: cell.to,
                            insert: " ".repeat(diff),
                        },
                    });
                } else if (diff < 0) {
                    result.push({
                        changes: {
                            from: cell.to + diff,
                            to: cell.to,
                        },
                    });
                }
            }
        }
    });
    return result;
}
