const SKIP_NODE_NAMES = [
    'SPAN'
];

const nodeFilter = {
    acceptNode: node => NodeFilter.FILTER_ACCEPT
};

function htmlToMarkdown(node) {
    const treeWalker = document.createTreeWalker(
        node,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
        nodeFilter
    );

    const markdown = [];
    let removedInvalidNodes = false;

    function walkChildren(ignoreLineBreaks) {
        if (treeWalker.firstChild()) {
            do handleNode(ignoreLineBreaks); while (treeWalker.nextSibling());
            treeWalker.parentNode();
        }
    }

    function handleNode(ignoreLineBreaks) {
        if (treeWalker.currentNode instanceof Element && treeWalker.currentNode.hasAttribute('style')) {
            removedInvalidNodes = true;
        }

        switch (treeWalker.currentNode.nodeName) {
            case '#text':
                const text = treeWalker.currentNode.textContent.replace(/[\r\n]/g, ' ').replace(/  /g, ' ');
                if (text.trim()) {
                    markdown.push(text);
                }

                break;
            case 'A':
                markdown.push('[');
                walkChildren(true);
                markdown.push(`](${treeWalker.currentNode.href})`);
                break;
            case 'B':
            case 'STRONG':
                markdown.push('**');
                walkChildren();
                markdown.push('**');
                break;
            case 'I':
            case 'EM':
                markdown.push('*');
                walkChildren();
                markdown.push('*');
                break;
            case 'CODE':
                markdown.push('`');
                walkChildren();
                markdown.push('`');
                break;
            case 'DD':
            case 'DT':
            case 'LI':
                if (!ignoreLineBreaks && markdown.length > 0 && markdown[markdown.length - 1] !== '\n') {
                    markdown.push('\n');
                }

                if (treeWalker.currentNode.parentNode.nodeName === 'OL') {
                    markdown.push('1. ');
                } else {
                    markdown.push('* ');
                }

                walkChildren(true);
                if (!ignoreLineBreaks) {
                    markdown.push('\n');
                }

                break;
            case 'BR':
                if (!ignoreLineBreaks && treeWalker.currentNode.nextSibling) {
                    markdown.push('\n');
                }

                break;
            case 'DIV':
            case 'DL':
            case 'OL':
            case 'UL':
                if (!ignoreLineBreaks && markdown.length > 0 && markdown[markdown.length - 1] !== '\n') {
                    markdown.push('\n');
                }

                walkChildren();
                if (!ignoreLineBreaks) {
                    markdown.push('\n');
                }

                break;
            case 'P':
                if (!ignoreLineBreaks && markdown.length > 0 && markdown[markdown.length - 1] !== '\n') {
                    markdown.push('\n');
                }

                if (!ignoreLineBreaks && markdown.length > 0 && markdown[markdown.length - 2] !== '\n') {
                    markdown.push('\n');
                }

                walkChildren();
                if (!ignoreLineBreaks) {
                    markdown.push('\n');
                    markdown.push('\n');
                }

                break;
            case 'H1':
                markdown.push('# ');
                walkChildren(true);
                break;
            case 'H2':
                markdown.push('## ');
                walkChildren(true);
                break;
            case 'H3':
                markdown.push('### ');
                walkChildren(true);
                break;
            case 'SPAN':
                walkChildren(true);
                break;
            default:
                if (!SKIP_NODE_NAMES.includes(treeWalker.currentNode.nodeName)) {
                    removedInvalidNodes = true;
                }
        }
    }

    if (treeWalker.nextNode()) {
        do handleNode(); while (treeWalker.nextSibling());
    }

    return {
        markdown: markdown.join(''),
        removedInvalidNodes
    };
}

export default htmlToMarkdown;
