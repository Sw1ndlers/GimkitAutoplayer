import { getElement, getElementByText, getParent } from "@functions/elements"
import { getTextWidth, includesExactly } from "@functions/utils"
import { Question } from "@root/types"

function createTextOverlay(answerBox: HTMLElement, answer: string) {
    let answerBoxRect = answerBox.getBoundingClientRect()
    let anserBoxWidth = answerBoxRect.width
    let answerBoxHeight = answerBoxRect.height
    let answerBoxClasses = answerBox.getAttribute("class")

    let overlay = document.createElement("p")
    overlay.setAttribute("class", answerBoxClasses)
    overlay.setAttribute(
        "style",
        `
        position: fixed;
        z-index: 1;
        display: flex;
        border: none;

        align-items: center;
        padding-left: 21px;
        pointer-events: none;

        color: #838383;
        width: ${anserBoxWidth}px;
        height: ${answerBoxHeight}px;
        transform: translate(0px, 1.3px);
    `
    )

    answerBox.setAttribute("placeholder", "") // Remove placeholder text so no weird overlap
    overlay.textContent = answer

    answerBox.addEventListener("input", (event) => {
        let input = event.target as HTMLInputElement
        let currentText = input.value

        if (includesExactly(answer, currentText)) {
            let newText = answer
                .toLowerCase()
                .replace(currentText.toLowerCase(), "")
            let oldTextWidth = getTextWidth(overlay, currentText)

            overlay.style.transform = `translate(${oldTextWidth}px, 1.3px)`
            overlay.textContent = newText
        } else {
            overlay.textContent = ""
        }
    })

    answerBox.parentElement.insertBefore(overlay, answerBox)
}

function highlightMCAnswer(answerBox: HTMLElement) {
    let answersContainer = getParent(answerBox, 7)
    let choiceBoxes = answersContainer.children

    console.log(answerBox)
    console.log(answersContainer)

    for (let i = 0; i < choiceBoxes.length; i++) {
        let choiceBox = choiceBoxes[i].children[0] as HTMLElement // Child 1 contains the background color

        if (choiceBox.textContent != answerBox.textContent) {
            choiceBox.setAttribute("style", "background-color: #808080")
        }
    }
}

export class Answerer {
    private questionList: Question[]

    constructor(questionList: Question[]) {
        this.questionList = questionList
    }

    private getCurrentQuestion(): HTMLElement {
        return document.querySelector(".notranslate")
    }

    private getAnswerBox(): HTMLElement {
        return getElement("input", "placeholder", "Enter answer here...")
    }

    private getQuestion(questionText: string): Question | undefined {
        let question = this.questionList.find((question) => {
            return question.text === questionText
        })

        return question
    }

    private getTextAnswer(question: Question): string {
        return question.answers[0].text
    }

    private getMultipleChoiceAnswer(question: Question): string {
        let correctAnswer = question.answers.find((answer) => {
            return answer.correct
        })

        if (correctAnswer === undefined) {
            throw new Error(`No correct answer found for question ${question}`)
        }

        return correctAnswer.text
    }

    private getQuestionAnswer(question: Question): string {
        if (question.type == "text") {
            return this.getTextAnswer(question)
        } else if (question.type == "mc") {
            return this.getMultipleChoiceAnswer(question)
        }

        throw new Error(`Question type ${question.type} not supported`)
    }

    public questionActive(): boolean {
        let question = document.querySelector(".notranslate")

        if (question === null) {
            return false
        }

        // Check if the question text is in the question list
        let questionFound = this.getQuestion(question.textContent)

        if (questionFound === undefined) {
            return false
        }

        return true
    }

    private getCorrectAnswerBox(correctAnswer: string): HTMLElement {
        // Will return answer <p> if it has the same text as the correct answer
        return getElementByText("span", correctAnswer)
    }

    public async answerCurrentQuestion() {
        let questionElement = this.getCurrentQuestion()
        let questionText = questionElement.textContent

        let question = this.getQuestion(questionText)
        let answer = this.getQuestionAnswer(question)

        if (question.type == "text") {
            console.log("Answering text question")
            createTextOverlay(this.getAnswerBox(), answer.trim())
        } else if (question.type == "mc") {
            console.log("Answering multiple choice question")

            let correctBox = this.getCorrectAnswerBox(answer)
            highlightMCAnswer(correctBox)
        }
    }
}
