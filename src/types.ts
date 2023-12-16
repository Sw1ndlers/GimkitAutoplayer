export type DecodedMessage = string
export type GameCode = string

/*
    Example Question:
    {
        "type": "text"
        "position": 0,
        "isActive": true,
        "_id": "656c11795bf47b002bb2d017",
        "game": "656c116f09902f00315bf571",
        "answers": [
            {
                "correct": true,
                "_id": "656c11795bf47b002bb2d018",
                "text": "false"
            }
        ],
        "source": "editor",
        "text": "Real",
        "__v": 0
    }
*/

export enum QuestionType {
    Text = "text",
    MultipleChoice = "mc",
}

export type Answer = {
    correct: boolean
    text: string
    _id: string
}

export type Question = {
    type: QuestionType
    answers: Answer[]
    position: number
    isActive: boolean
    game: string
    source: string
    text: string
    _id: string
    __v: number
}
