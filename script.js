const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const url = 'https://wpr-quiz-api.herokuapp.com/attempts'
const quiz = $('.quiz')
const result = $('.result')
const review = $('.review-quiz')
const description = $('.description')
let answers = {}
let	attemptsID = ''

// Start Quiz
const startQuiz = async () => {
	const response = await fetch(url, { method: 'POST' })
	const data = await response.json()
	const questions = data.questions
	attemptsID = data._id
    
	renderQuiz(questions)

	quiz.classList.add('active')
	submitBtn.classList.add('active')
	description.classList.remove('active')
}
const startBtn = $('.start-btn')
startBtn.addEventListener('click', startQuiz)

// Render Quiz
const renderQuiz = questions => {
	questions.forEach((question, index) => {
        const questionContainer = document.createElement('div')
        questionContainer.classList.add('question')

        const questionTitle = document.createElement('h1')
        questionTitle.textContent = `Question ${index + 1} of ${questions.length}`

        const questionText = document.createElement('p')
        questionText.textContent = question.text

        questionContainer.appendChild(questionTitle)
        questionContainer.appendChild(questionText)

        question.answers.forEach((answer, index) => {
            const answerContainer = document.createElement('div')
            answerContainer.classList.add('answer')

            const input = document.createElement('input')
            input.addEventListener('click', selectedAnswer)
            input.setAttribute('type', 'radio')
            input.setAttribute('id', `${index}${question._id}`)
            input.setAttribute('value', `${index}`)
            input.setAttribute('name', `${question._id}`)

            const label = document.createElement('label')
            label.setAttribute('for', `${index}${question._id}`)
            label.textContent = answer

            answerContainer.appendChild(label)
            answerContainer.appendChild(input)
            questionContainer.appendChild(answerContainer)
        })

        quiz.appendChild(questionContainer)
    })
}

const selectedAnswer = e => {
	const inputElement = e.target
	const answerElement = inputElement.parentElement
	const answerBlock = answerElement.parentElement
	const selectedAnswer = answerBlock.querySelector('.selected')
	const checkedInput = answerBlock.querySelector('.selected input')
	if (inputElement.checked === true) {
		answerElement.classList.add('selected')
	}

	if (checkedInput !== null) {
		checkedInput.checked = false
		selectedAnswer.classList.remove('selected')
	}
    
	// get user selected answer index
	const answerId = inputElement.id.slice(1)
	const userSelectedAnswerIndex = inputElement.value
	answers[answerId] = parseInt(userSelectedAnswerIndex)
}

// Submit quiz
const submitBtn = $('.submit')
const submitQuiz = async () => {
	const response = await fetch(url + '/' + attemptsID + '/submit', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ answers })
	})

	const data = await response.json()
	const correctAnswers = data.correctAnswers
	const score = data.score
	const scoreText = data.scoreText
	const numOfQuestions = data.questions.length

	showScore(score, numOfQuestions, scoreText)
	handleCorrectAnswers(correctAnswers)
}
submitBtn.addEventListener('click', submitQuiz)

// Show correct answers
const handleCorrectAnswers = (correctAnswers) => {
	const answers = $$('.answer.selected')
	answers.forEach(answer => {
		const input = answer.querySelector('input')
		const label = answer.querySelector('label')
		const span = document.createElement('span')
		for (let key in correctAnswers) {
			// Correct answer
			if (input.id.slice(1) === key && input.value == correctAnswers[key]) {
				label.setAttribute('class', 'correct')
				span.innerText = 'Correct answer'
				answer.appendChild(span)
			}

			// Incorrect answer
			if (input.id.slice(1) === key && input.value != correctAnswers[key]) {
				label.setAttribute('class', 'incorrect')
				span.innerText = 'Your answer'
				answer.appendChild(span)
			}
		}
	})

	// Correct answer for incorrect answer
	const answersContainer = $$('.answer')
	answersContainer.forEach(answer => {
		if (answer.classList.contains('selected')) {
			return
		} else {
			const input = answer.querySelector('input')
			const label = answer.querySelector('label')
			const span = document.createElement('span')
			for (let key in correctAnswers) {
				if (input.id.slice(1) === key && input.value == correctAnswers[key]) {
					label.setAttribute('class', 'selected')
					span.innerText = 'Correct answer'
					answer.appendChild(span)
				}
			}
		}
	})

	$$('input').forEach((input) => input.disabled = true)
}

// Show quiz score
const showScore = (score, numOfQuestions, scoreText) => {
	if (confirm('Are you want to finish this quit?')) {
		review.classList.add('active')
		result.classList.add('active')
	} else {
		return false
	}

	submitBtn.classList.remove('active')
	$('#score').innerText = `${score}/${numOfQuestions}`
	$('#percentage').innerText = `${(score / numOfQuestions) * 100}%`
	$('#scoreText').innerText = `${scoreText}`
}

// Try again
const tryAgainBtn = $('.result-btn')
tryAgainBtn.addEventListener('click', () => {
	quiz.classList.remove('active')
	review.classList.remove('active')
	submitBtn.classList.remove('active')
	description.classList.add('active')
	document.body.scrollIntoView()
    window.location.reload()
})