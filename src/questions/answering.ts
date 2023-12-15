import { getElement, getElementByText } from "@functions/utils"
import { Question } from "@root/types"

// Checks if a string is at the start of another string
function includesExactly(mainString: string, searchString: string) {
    const index = mainString.toLowerCase().indexOf(searchString.toLowerCase())
    return index !== -1 && index === 0
}

function getTextWidth(element: HTMLParagraphElement, text: string): number {
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

export class Answerer {
    private questionList: Question[]

    constructor(questionList: Question[]) {
        this.questionList = questionList
    }

    private getCurrentQuestion(): string {
        return document.querySelector(".notranslate").textContent
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

    public async answerCurrentQuestion() {
        let questionText = this.getCurrentQuestion()

        let question = this.getQuestion(questionText)
        let answer = this.getQuestionAnswer(question)

        if (question.type == "text") {
            console.log("Answering text question")
            createTextOverlay(this.getAnswerBox(), answer)
        }
    }
}
