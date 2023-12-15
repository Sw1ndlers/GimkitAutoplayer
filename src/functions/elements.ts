export function getElementByXpath(path: string): HTMLElement {
    return document.evaluate(
        path,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue as HTMLElement
}

export function getElement(tag: string, attribute: string, value: string) {
    return getElementByXpath(`//${tag}[@${attribute}="${value}"]`)
}

export function getElementByText(tag: string, text: string) {
    return getElementByXpath(`//${tag}[text()="${text}"]`)
}

export function getParent(element: HTMLElement, repeat: number): HTMLElement {
    let parent = element

    for (let i = 0; i < repeat; i++) {
        parent = parent.parentElement
    }

    return parent
}
