import { DecodedMessage, GameCode, Question } from "@root/types"

// Checks if a character is Aa-Zz or 0-9
export function isNormalChar(char: string): boolean {
    return /[A-Za-z0-9]/.test(char)
}

export function decodeArrayBuffer(input: ArrayBuffer): DecodedMessage {
    const decoder = new TextDecoder()
    return decoder.decode(input)
}

export async function getGameQuestions(code: GameCode) {
    const response = await fetch(
        `https://www.gimkit.com/api/games/fetch/${code}`
    )
    const json = await response.json()

    return json.kit.questions as Question[]
}

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
    return getElement(tag, "text()", text)
}
