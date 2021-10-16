const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const url = 'https://wpr-quiz-api.herokuapp.com/attempts';
let answers = {},
	attemptsID = '';

// Start Quiz
const startQuiz = () => {
	fetch(url, { method: 'POST', })
		.then(response => response.json())
		.then(data => {
			const questionArray = data.questions;
			attemptsID = data._id;
			renderQuiz(questionArray);
		})
		.catch((err) => console.log('Error: ' + err))
	const quiz = $('.quiz');
	const description = $('.description');

	quiz.classList.add('active');
	submitBtn.classList.add('active');
	description.classList.add('hide');
}
const startBtn = $('.start-btn');
startBtn.addEventListener('click', startQuiz);

// Render Quiz
const renderQuiz = questionArray => {
	const quizContainer = questionArray.map((question, index) => questionContainer(question, index, questionArray.length));
	quiz.innerHTML = quizContainer.join('');

	const answers = $$('.answer');
	answers.forEach(answer => {
		const inputElement = answer.querySelector('input');
		inputElement.onclick = e => selectedAnswer(e);
	})
}

// Show Questions
const questionContainer = (question, questionIndex, numOfQuestions) => {
	return `
		<div class='question'>
			<h1>Question ${questionIndex + 1} of ${numOfQuestions}</h1>
			<p>${formatText(question.text)}</p>
			<div class='answer-block'>
				${answerContainer(question)}
			</div>
		</div>
	`;
}

// Show Answers
const answerContainer = question => {
	const questionID = question._id
	return `
		${question.answers.map((answer, index) => {
		return `
				<div class='answer'>
					<input type='radio' id='${index}${questionID}' name='${questionID}' value='${index}'>
					<label for='${index}${questionID}'>${formatText(answer)}</label>
				</div>
			`
	}).join('')
		}`;
}

const formatText = text => {
	return text.replace(/</g, '&lt').replace(/>/g, '&gt');
}

const selectedAnswer = e => {
	const inputElement = e.target;
	const answerElement = inputElement.parentElement;
	const answerBlock = answerElement.parentElement;
	const selectedAnswer = answerBlock.querySelector('.selected');
	const checkedInput = answerBlock.querySelector('.selected input');
	const answerId = inputElement.id.slice(1);
	const userSelectedAnswerIndex = inputElement.value;
	answers[answerId] = parseInt(userSelectedAnswerIndex);

	if (inputElement.checked === true) {
		answerElement.classList.add('selected');
	}

	if (checkedInput !== null) {
		checkedInput.checked = false;
		selectedAnswer.classList.remove('selected');
	}
}

// Submit quiz
const submitBtn = $('.submit');
const submitQuiz = () => {
	const data = {
		answers: answers
	};

	fetch(url + '/' + attemptsID + '/submit', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data)
	})
		.then(response => response.json())
		.then(data => {
			const correctAnswers = data.correctAnswers;
			const score = data.score;
			const scoreText = data.scoreText;
			const numOfQuestions = data.questions.length;

			showScore(score, numOfQuestions, scoreText);
			handleCorrectAnswers(correctAnswers);
		})
}
submitBtn.addEventListener('click', submitQuiz);

const handleCorrectAnswers = (correctAnswers) => {
	const answers = $$('.answer.selected');
	answers.forEach(answer => {
		const input = answer.querySelector('input');
		const label = answer.querySelector('label');
		const span = document.createElement('span');
		for (let key in correctAnswers) {
			// Correct answer
			if (input.id.slice(1) === key && input.value == correctAnswers[key]) {
				label.setAttribute('class', 'correct');
				span.innerText = 'Correct answer';
				answer.appendChild(span);
			}

			// Incorrect answer
			if (input.id.slice(1) === key && input.value != correctAnswers[key]) {
				label.setAttribute('class', 'incorrect');
				span.innerText = 'Your answer';
				answer.appendChild(span);
			}
		}
	})

	// Correct answer for incorrect answer
	const answersContainer = $$('.answer');
	answersContainer.forEach(answer => {
		if (answer.classList.contains('selected')) {
			return;
		} else {
			const input = answer.querySelector('input');
			const label = answer.querySelector('label');
			const span = document.createElement('span');
			for (let key in correctAnswers) {
				if (input.id.slice(1) === key && input.value == correctAnswers[key]) {
					label.setAttribute('class', 'selected')
					span.innerText = 'Correct answer';
					answer.appendChild(span);
				}
			}
		}
	})

	$$('input').forEach((input) => input.disabled = true);
}


// Show quiz score
const showScore = (score, numOfQuestions, scoreText) => {
	const result = $('.result');
	const review = $('.review-quiz');

	if (confirm('Are you want to finish this quit?')) {
		review.classList.add('active');
		result.classList.add('active');
	} else {
		return false;
	}

	submitBtn.classList.remove('active');
	window.scrollTo({ top: 0 });
	$('#score').innerText = `${score}/${numOfQuestions}`;
	$('#percentage').innerText = `${(score / numOfQuestions) * 100}%`;
	$('#scoreText').innerText = `${scoreText}`;
}

// Try again
const tryAgainBtn = $('.result-btn');
tryAgainBtn.addEventListener('click', () => {
	window.location.reload();
})