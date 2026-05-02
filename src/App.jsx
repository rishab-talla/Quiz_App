import { useState, useEffect } from "react";
import { questions } from "./data/questions";

const STORAGE_KEY = "quizAppState";
const LOGIN_KEY = "quizAppUser";

// Background wrapper
function BackgroundVideoWrapper({ children }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-[-1]"
      >
        <source src="./bg_video.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/40 z-0"></div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function App() {
  // USER AUTH
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LOGIN_KEY));
    } catch {
      return null;
    }
  });

  const [isRegistering, setIsRegistering] = useState(false);

  // Register fields
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regError, setRegError] = useState("");

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // GET SAVED STATE
  const getSavedState = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  };

  const saved = getSavedState();

  // QUIZ STATES
  const [quizStarted, setQuizStarted] = useState(saved.quizStarted ?? false);
  const [currentQuestion, setCurrentQuestion] = useState(saved.currentQuestion ?? 0);

  const [answers, setAnswers] = useState(() =>
    Array.isArray(saved.answers)
      ? saved.answers
      : Array(questions.length).fill(null)
  );

  const [score, setScore] = useState(saved.score ?? 0);
  const [showResults, setShowResults] = useState(saved.showResults ?? false);
  const [timer, setTimer] = useState(saved.timer ?? 60);

  // SAVE STATE
  useEffect(() => {
    const safeAnswers = Array.isArray(answers)
      ? answers
      : Array(questions.length).fill(null);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        quizStarted,
        currentQuestion,
        answers: safeAnswers,
        score,
        showResults,
        timer,
      })
    );
  }, [quizStarted, currentQuestion, answers, score, showResults, timer]);

  // TIMER
  useEffect(() => {
    if (quizStarted && !showResults) {
      const t = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            nextQuestion();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(t);
    }
  }, [quizStarted, currentQuestion, showResults]);

  // SELECT ANSWER
  const handleAnswer = (optionIndex) => {
    const updated = Array.isArray(answers)
      ? [...answers]
      : Array(questions.length).fill(null);

    updated[currentQuestion] = optionIndex;
    setAnswers(updated);
  };

  // NEXT / SUBMIT
  const nextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((prev) => prev + 1);
      setTimer(60);
    } else {
      let finalScore = 0;

      if (Array.isArray(answers)) {
        answers.forEach((ans, i) => {
          if (ans === questions[i].correct) finalScore++;
        });
      }

      setScore(finalScore);
      setShowResults(true);
    }
  };

  // RESET QUIZ
  const restartQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestion(0);
    setAnswers(Array(questions.length).fill(null));
    setScore(0);
    setShowResults(false);
    setTimer(60);
    localStorage.removeItem(STORAGE_KEY);
  };

  // LOGOUT (clears everything)
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(LOGIN_KEY);
    localStorage.removeItem(STORAGE_KEY);
  };

  // REGISTER
  const handleRegister = (e) => {
    e.preventDefault();

    const email = regEmail.trim();
    const password = regPassword;

    if (!email || !password) {
      setRegError("Email and password required");
      return;
    }

    if (password !== regConfirmPassword) {
      setRegError("Passwords do not match");
      return;
    }

    if (localStorage.getItem(`user_${email}`)) {
      setRegError("User already exists");
      return;
    }

    localStorage.setItem(
      `user_${email}`,
      JSON.stringify({ email, password })
    );

    const loggedUser = { email };
    localStorage.setItem(LOGIN_KEY, JSON.stringify(loggedUser));
    setUser(loggedUser);

    setRegEmail("");
    setRegPassword("");
    setRegConfirmPassword("");
    setRegError("");
  };

  // LOGIN
  const handleLogin = (e) => {
    e.preventDefault();

    const email = loginEmail.trim();
    const password = loginPassword;

    if (!email || !password) {
      setLoginError("Email and password required");
      return;
    }

    const data = localStorage.getItem(`user_${email}`);
    if (!data) {
      setLoginError("No account found");
      return;
    }

    const parsed = JSON.parse(data);
    if (parsed.password !== password) {
      setLoginError("Invalid credentials");
      return;
    }

    const loggedUser = { email };
    localStorage.setItem(LOGIN_KEY, JSON.stringify(loggedUser));
    setUser(loggedUser);
    setLoginError("");
  };

  // LOGIN SCREEN
  if (!user) {
    return (
      <BackgroundVideoWrapper>
        <div className="flex flex-col items-center min-h-screen w-full p-6">
          <div className="bg-white shadow-md rounded-lg p-6 max-w-lg w-full text-center mt-6">
            {isRegistering ? (
              <>
                <h1 className="text-3xl font-bold mb-4">Register</h1>
                <form onSubmit={handleRegister} className="space-y-4">
                  <input type="email" placeholder="Email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full px-4 py-2 border rounded" />
                  <input type="password" placeholder="Password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="w-full px-4 py-2 border rounded" />
                  <input type="password" placeholder="Confirm Password" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} className="w-full px-4 py-2 border rounded" />
                  {regError && <div className="text-red-500">{regError}</div>}
                  <button className="px-6 py-2 bg-blue-500 text-white rounded">Register</button>
                </form>
                <p className="mt-4">
                  Already have an account?{" "}
                  <button onClick={() => setIsRegistering(false)} className="text-blue-400 underline">Login</button>
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-4">Login</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                  <input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full px-4 py-2 border rounded" />
                  <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-4 py-2 border rounded" />
                  {loginError && <div className="text-red-500">{loginError}</div>}
                  <button className="px-6 py-2 bg-blue-500 text-white rounded">Login</button>
                </form>
                <p className="mt-4">
                  Don’t have an account?{" "}
                  <button onClick={() => setIsRegistering(true)} className="text-blue-400 underline">Register</button>
                </p>
              </>
            )}
          </div>
        </div>
      </BackgroundVideoWrapper>
    );
  }

  // HOME
  if (!quizStarted) {
    return (
      <BackgroundVideoWrapper>
        <div className="flex flex-col items-center min-h-screen w-full p-6">
          <div className="bg-white rounded-lg p-10 shadow-md text-center w-full max-w-lg">
            
            {/* Logout */}
            <div className="flex justify-end mb-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Logout
              </button>
            </div>

            <h1 className="text-3xl font-bold mb-4">Quizify</h1>

            <button
              onClick={() => setQuizStarted(true)}
              className="px-6 py-2 bg-blue-500 text-white rounded"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </BackgroundVideoWrapper>
    );
  }

  // RESULTS
  if (showResults) {
    return (
      <BackgroundVideoWrapper>
        <div className="flex flex-col items-center min-h-screen w-full p-6">
          <div className="bg-white rounded-lg shadow-md p-10 text-center w-full max-w-lg">

            {/* Logout */}
            <div className="flex justify-end mb-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Logout
              </button>
            </div>

            <h2 className="text-3xl font-bold mb-4">Quiz Finished!</h2>
            <p>Your Score: {score}/{questions.length}</p>

            <button
              onClick={restartQuiz}
              className="mt-6 px-6 py-2 bg-blue-500 text-white rounded"
            >
              Restart
            </button>
          </div>
        </div>
      </BackgroundVideoWrapper>
    );
  }

  // QUIZ
  return (
    <BackgroundVideoWrapper>
      <div className="flex flex-col items-center min-h-screen w-full p-4">
        <div className="bg-white mt-6 shadow-md rounded-lg p-8 w-full max-w-lg">

          {/* Logout */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Logout
            </button>
          </div>

          <h2 className="text-xl mb-4">
            Q{currentQuestion + 1}: {questions[currentQuestion].question}
          </h2>

          <p className="text-red-500 mb-4">Time: {timer}s</p>

          {questions[currentQuestion].options.map((opt, i) => (
            <label key={i} className="block p-2 border rounded my-2">
              <input
                type="radio"
                checked={answers[currentQuestion] === i}
                onChange={() => handleAnswer(i)}
              />{" "}
              {opt}
            </label>
          ))}

          <button
            onClick={nextQuestion}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded"
          >
            {currentQuestion === questions.length - 1 ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </BackgroundVideoWrapper>
  );
}

