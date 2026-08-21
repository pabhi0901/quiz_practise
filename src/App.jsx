import { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import PromptScreen from './components/PromptScreen';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import './App.css';

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function App() {
  const [screen, setScreen] = useState('setup');
  const [quizConfig, setQuizConfig] = useState({
    topics: [],
    numQuestions: 30,
    time: 30,
    difficulties: ['medium', 'hard'],
    negativeMarking: { enabled: false, penalty: 0.25 },
  });
  const [questions, setQuestions] = useState([]);
  const [originalQuestions, setOriginalQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizMeta, setQuizMeta] = useState({ timeTaken: 0, timePerQuestion: [] });

  const handleSetupComplete = (config) => {
    setQuizConfig(config);
    setScreen('prompt');
  };

  const handleQuestionsLoaded = (parsedQuestions) => {
    setOriginalQuestions(parsedQuestions);
    setQuestions(parsedQuestions);
    setUserAnswers(new Array(parsedQuestions.length).fill(null));
    setScreen('quiz');
  };

  const handleQuizSubmit = (answers, meta) => {
    setUserAnswers(answers);
    setQuizMeta(meta);
    setScreen('results');
  };

  const handleRetest = () => {
    const shuffled = shuffleArray(originalQuestions);
    setQuestions(shuffled);
    setUserAnswers(new Array(shuffled.length).fill(null));
    setQuizMeta({ timeTaken: 0, timePerQuestion: [] });
    setScreen('quiz');
  };

  const handleNewQuiz = () => {
    setQuestions([]);
    setOriginalQuestions([]);
    setUserAnswers([]);
    setQuizMeta({ timeTaken: 0, timePerQuestion: [] });
    setScreen('setup');
  };

  return (
    <div className="app">
      {screen === 'setup' && (
        <SetupScreen onComplete={handleSetupComplete} initialConfig={quizConfig} />
      )}
      {screen === 'prompt' && (
        <PromptScreen
          config={quizConfig}
          onBack={() => setScreen('setup')}
          onStart={handleQuestionsLoaded}
        />
      )}
      {screen === 'quiz' && (
        <QuizScreen
          key={Date.now()}
          questions={questions}
          timeMinutes={quizConfig.time}
          onSubmit={handleQuizSubmit}
        />
      )}
      {screen === 'results' && (
        <ResultsScreen
          questions={questions}
          userAnswers={userAnswers}
          meta={quizMeta}
          config={quizConfig}
          onRetest={handleRetest}
          onNewQuiz={handleNewQuiz}
        />
      )}
    </div>
  );
}

export default App;
