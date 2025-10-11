import { useState, useEffect } from "react";
import { questions } from "./data/questions";

export default function App() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (quizStarted && !showResults) {
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            handleTimeout();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [quizStarted, currentQuestion]);

  const handleTimeout = () => {
    setScore((prev) => prev); // change is prev - 1  --> prev
    nextQuestion();
  };

  const handleAnswer = (index) => {
    setSelectedAnswer(index);
    if (index === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTimer(60);
    } else {
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResults(false);
    setTimer(60);
  };

  if (!quizStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full  bg-gray-100">
        <div className="text-black bg-white shadow-md rounded-lg p-6 w-full max-w-lg text-center">
          <h1 className="text-3xl font-bold mb-4">React Quiz App</h1>
          <p className="mb-6 text-gray-700">
            Test your knowledge with this fun quiz!
          </p>
          <button
            onClick={() => setQuizStarted(true)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-green-100">
        <div className="text-black bg-white shadow-md rounded-lg p-6 w-full max-w-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz Finished!</h2>
          <p className="mb-4 text-lg">
            Your Score: {score} / {questions.length}
          </p>
          <button
            onClick={restartQuiz}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Restart Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-100 p-4">
      <div className="text-black bg-white shadow-md rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-2">Question {currentQuestion + 1}</h2>
        <p className="mb-4">{questions[currentQuestion].question}</p>
        <div className="mb-4 font-semibold text-red-500">Time left: {timer}s</div>

        {questions[currentQuestion].options.map((option, index) => {
          const isCorrect = index === questions[currentQuestion].correct;
          const isSelected = index === selectedAnswer;

          let btnClass = "bg-gray-200";
          if (selectedAnswer !== null) {
            if (isSelected && isCorrect) btnClass = "bg-green-400";
            else if (isSelected && !isCorrect) btnClass = "bg-red-400";
            else if (isCorrect) btnClass = "bg-green-200";
          }

          return (
            <button
              key={index}
              className={`block w-full text-left px-4 py-2 my-2 rounded ${btnClass} hover:bg-gray-300`}
              onClick={() => selectedAnswer === null && handleAnswer(index)}
            >
              {option}
            </button>
          );
        })}

        
          <button
            onClick={nextQuestion}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Next Question
          </button>
        

        {/* {selectedAnswer !== null && (
          <button
            onClick={nextQuestion}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Next Question
          </button>
        )} */}
      </div>
    </div>
  );
}
