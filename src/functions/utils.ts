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

export function getTextWidth(element: HTMLParagraphElement, text: string): number {
    const tempElement = document.createElement("div")
    tempElement.setAttribute(
        "style",
        `
        display: inline-block;
        visibility: hidden;
        font-size: ${getComputedStyle(element).fontSize};
        font-family: ${getComputedStyle(element).fontFamily};
        font-weight: ${getComputedStyle(element).fontWeight};
        font-style: ${getComputedStyle(element).fontStyle};
    `
    )

    tempElement.textContent = text
    document.body.appendChild(tempElement)

    const width = tempElement.getBoundingClientRect().width

    document.body.removeChild(tempElement)
    return width
}

// Checks if a string is at the start of another string
export function includesExactly(mainString: string, searchString: string) {
    const index = mainString.toLowerCase().indexOf(searchString.toLowerCase())
    return index !== -1 && index === 0
}