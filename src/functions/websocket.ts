import { DecodedMessage, GameCode } from "@root/types"
import { isNormalChar } from "@functions/utils"
import { decodeArrayBuffer } from "@functions/utils"
import { isCode } from "@functions/codes"

/*
    The decoded websocket message returns an encoded string.
    Most content is still included in the encoded string.
    We can use this function to split the actual content from the encoded string.
    
    Example of encoded string:
        "...�gameId�65786a52907381002b1ba47a��..."
    Example of output:
        [..., "gameId", "65786a52907381002b1ba47a", ...]
*/

export function splitDecoded(input: DecodedMessage): string[] {
    let output: string[] = []
    let currentDecoded = ""

    for (let i = 0; i < input.length; i++) {
        let value = input[i]

        if (isNormalChar(value)) {
            currentDecoded += value
        } else {
            if (currentDecoded.length > 0) {
                output.push(currentDecoded)
                currentDecoded = ""
            }
        }
    }

    // Add any remaining characters
    if (currentDecoded.length > 0) {
        output.push(currentDecoded)
    }

    return output
}

export function createWebsocketHook(
    websocket: WebSocket,
    callback: (code: GameCode) => void
) {
    return async function websocketHook(e: MessageEvent) {
        if (e.data instanceof ArrayBuffer === false) {
            return
        } // Not an array buffer

        let message: DecodedMessage = decodeArrayBuffer(e.data as ArrayBuffer)
        let split: string[] = splitDecoded(message)

        let previousValue = ""

        for (let i = 0; i < split.length; i++) {
            let currentValue = split[i]
            let validCode = await isCode(currentValue, previousValue)

            if (validCode) {
                websocket.removeEventListener("message", websocketHook)

                callback(currentValue)
                break
            }

            previousValue = currentValue
        }
    }
}
