import { getElement, getElementByText, getParent } from "@functions/elements"
import { getTextWidth, includesExactly } from "@functions/utils"
import { Question, QuestionType, Answer } from "@root/types"

function replaceAtStart(input: string, toReplace: string, replaceWith: string) {
    const esc = toReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
    const reg = new RegExp("^" + esc, "i")

    if (reg.test(input)) {
        return input.replace(reg, replaceWith)
    }

    return input
}

function createTextOverlay(answerBox: HTMLElement, answer: string) {
    let answerBoxRect = answerBox.getBoundingClientRect()
    let answerBoxWidth = answerBoxRect.width
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
        width: ${answerBoxWidth}px;
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
            let newText = replaceAtStart(answer, currentText, "")
            let oldTextWidth = getTextWidth(overlay, currentText)

            overlay.style.transform = `translate(${oldTextWidth}px, 1.3px)`
            overlay.textContent = newText
        } else {
            overlay.textContent = ""
        }
    })

    answerBox.parentElement.insertBefore(overlay, answerBox)
}

function highlightMCAnswers(answers: string[]) {
    let tempAnswerBox = getElementByText("span", answers[0]) // Use the get answer container
    let answersContainer = getParent(tempAnswerBox, 7)

    let choiceBoxes = answersContainer.children

    for (let i = 0; i < choiceBoxes.length; i++) {
        let choiceBox = choiceBoxes[i].children[0] as HTMLElement // Child 1 contains the background color

        if (answers.includes(choiceBox.textContent) == false) {
            choiceBox.setAttribute("style", "background-color: #808080")
        }
    }
}

export class Answerer {
    private questionList: Question[]

    constructor(questionList: Question[]) {
        this.questionList = questionList
    }

    private getCurrentQuestionElement(): HTMLElement | null {
        return document.querySelector(".notranslate")
    }

    private getAnswerInputElement(): HTMLElement | null {
        return getElement("input", "placeholder", "Enter answer here...")
    }

    private getCurrentQuestionType(): QuestionType {
        return this.getAnswerInputElement() == null
            ? QuestionType.MultipleChoice
            : QuestionType.Text
    }

    private getQuestionFromInfo(
        questionText: string,
        questionType: QuestionType
    ): Question {
        let question = this.questionList.find((question) => {
            return (
                question.text == questionText && question.type == questionType
            )
        })

        return question
    }

    private getTextAnswer(question: Question): string[] {
        return [question.answers[0].text]
    }

    private getMultipleChoiceAnswer(question: Question): string[] {
        // let correctAnswer = question.answers.find((answer) => {
        //     return answer.correct
        // })
        let correctAnswers: Answer[] = question.answers.filter((answer) => {
            return answer.correct
        })
        let correctTexts: string[] = correctAnswers.map((answer) => {
            return answer.text
        })

        return correctTexts
    }

    private getQuestionAnswer(question: Question): string[] {
        if (question.type == QuestionType.Text) {
            return this.getTextAnswer(question)
        } else if (question.type == QuestionType.MultipleChoice) {
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
        let questionType = this.getCurrentQuestionType()
        let questionFound = this.getQuestionFromInfo(
            question.textContent,
            questionType
        )

        if (questionFound === undefined) {
            return false
        }

        return true
    }

    public async answerCurrentQuestion() {
        let questionElement = this.getCurrentQuestionElement()
        let questionType = this.getCurrentQuestionType()
        let questionText = questionElement.textContent

        let question = this.getQuestionFromInfo(questionText, questionType)
        let answers = this.getQuestionAnswer(question).map((answer) => {
            return answer.trim()
        })

        console.log(this.getCurrentQuestionType())

        if (question.type == QuestionType.Text) {
            console.log("Answering text question")
            createTextOverlay(this.getAnswerInputElement(), answers[0])
        } else if (question.type == QuestionType.MultipleChoice) {
            console.log("Answering multiple choice question")

            // let correctBoxes = this.getCorrectAnswerBoxes(answers)
            highlightMCAnswers(answers)
        }
    }
}
