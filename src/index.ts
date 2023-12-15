import { createWebsocketHook } from "@functions/websocket"
import { GameCode } from "@root/types"
import { getGameQuestions } from "@functions/utils"
import { Answerer } from "./questions/answering"

// Hook into the websocket to get the game code sent by the server

async function getGameCode(): Promise<GameCode> {
    const oldWebsocket = window.WebSocket as any
    let gameCode = ""

    const proxiedWebSocket = function (...args: any[]) {
        const ws = new oldWebsocket(...args)

        const hook = createWebsocketHook(ws, (code) => {
            gameCode = code
        })

        ws.addEventListener("message", hook)
        return ws
    }

    window.WebSocket = proxiedWebSocket as any

    // Wait until the game code is not empty
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (gameCode != "") {
                clearInterval(interval)
                resolve(gameCode)
            }
        }, 100)
    })
}

let code = await getGameCode()
let questions = await getGameQuestions(code)

let answerer = new Answerer(questions)

console.log(`Game ${code} found with ${questions.length} question(s)`)

let answeringQuestion = false

setInterval(async () => {
    if (answerer.questionActive() && answeringQuestion == false) {
        console.log("Answering question")

        answeringQuestion = true
        await answerer.answerCurrentQuestion()
    }

    if (answerer.questionActive() == false) {
        answeringQuestion = false
    }
}, 1)
