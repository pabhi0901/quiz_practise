import { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import PromptScreen from './components/PromptScreen';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import './App.css';

function App() {
  const [screen, setScreen] = useState('setup'); // setup | prompt | quiz | results
  const [quizConfig, setQuizConfig] = useState({
    topics: [],
    numQuestions: 30,
    time: 30,
    difficulties: ['medium', 'hard'],
  });
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizMeta, setQuizMeta] = useState({ timeTaken: 0 });

  const handleSetupComplete = (config) => {
    setQuizConfig(config);
    setScreen('prompt');
  };

  const handleQuestionsLoaded = (parsedQuestions) => {
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
    // Same questions, same config — just reset answers and go back to quiz
    setUserAnswers(new Array(questions.length).fill(null));
    setQuizMeta({ timeTaken: 0 });
    setScreen('quiz');
  };

  const handleNewQuiz = () => {
    setQuestions([]);
    setUserAnswers([]);
    setQuizMeta({ timeTaken: 0 });
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
          onRetest={handleRetest}
          onNewQuiz={handleNewQuiz}
        />
      )}
    </div>
  );
}

export default App;
