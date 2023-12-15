import { GameCode } from "@root/types"

const possiblePreviousValues: string[] = ["id", "game"]

/*
    The reason for previous value is that the game code is 
    usually preceded by one of the values in `possiblePreviousValues`.
*/

function isPossibleCode(code: GameCode, previousValue: string): boolean {
    // Iterate through possible previous values
    let previousPossible = false
    possiblePreviousValues.forEach((possible) => {
        let value = previousValue.toLowerCase()

        // Check if previous value contains possible previous value
        if (value.includes(possible)) {
            previousPossible = true
        }
    })

    let hasLetter = /[A-Za-z]/.test(code)
    let hasNumber = /[0-9]/.test(code)
    let correctLength = code.length === 24

    return hasLetter && hasNumber && correctLength && previousPossible
}

async function checkCode(code: GameCode): Promise<boolean> {
    const response = await fetch(
        `https://www.gimkit.com/api/games/fetch/${code}`
    )
    return response.status === 200
}

export async function isCode(
    code: GameCode,
    previousValue: string
): Promise<boolean> {
    let isPossible = isPossibleCode(code, previousValue)

    if (!isPossible) {
        return false
    }

    let requestValid = await checkCode(code)
    return requestValid
}
