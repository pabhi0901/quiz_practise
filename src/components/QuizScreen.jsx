import { useState, useEffect, useCallback } from 'react';
import './QuizScreen.css';

export default function QuizScreen({ questions, timeMinutes, onSubmit }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState(() => new Array(questions.length).fill(null));
  const [visited, setVisited] = useState(() => {
    const arr = new Array(questions.length).fill(false);
    arr[0] = true;
    return arr;
  });
  const [markedReview, setMarkedReview] = useState(() => new Array(questions.length).fill(false));
  const [timeLeft, setTimeLeft] = useState(timeMinutes * 60);
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Enter fullscreen on mount
  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Timer
  useEffect(() => {
    if (submitted) return;
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted]);

  // Auto-submit on time up
  useEffect(() => {
    if (timeLeft === 0 && !submitted) {
      alert('Time is up! Your test will be submitted now.');
      handleSubmit();
    }
  }, [timeLeft, submitted]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e) => {
      if (showModal) return;
      switch (e.key) {
        case 'ArrowRight':
        case 'n':
          goNext();
          break;
        case 'ArrowLeft':
        case 'p':
          goPrev();
          break;
        case 'a':
        case 'A':
          selectOption('A');
          break;
        case 'b':
        case 'B':
          selectOption('B');
          break;
        case 'c':
        case 'C':
          selectOption('C');
          break;
        case 'd':
        case 'D':
          selectOption('D');
          break;
        case 'r':
        case 'R':
          toggleReview();
          break;
        case 'x':
        case 'X':
          clearResponse();
          break;
      }
    },
    [currentQ, showModal]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent accidental tab close
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // Navigation
  const goToQuestion = (idx) => {
    setCurrentQ(idx);
    setVisited((prev) => {
      const copy = [...prev];
      copy[idx] = true;
      return copy;
    });
  };

  const goNext = () => {
    if (currentQ < questions.length - 1) goToQuestion(currentQ + 1);
  };

  const goPrev = () => {
    if (currentQ > 0) goToQuestion(currentQ - 1);
  };

  // Answers
  const selectOption = (letter) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentQ] = letter;
      return copy;
    });
  };

  const clearResponse = () => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentQ] = null;
      return copy;
    });
  };

  const toggleReview = () => {
    setMarkedReview((prev) => {
      const copy = [...prev];
      copy[currentQ] = !copy[currentQ];
      return copy;
    });
  };

  // Timer formatting
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const totalTime = timeMinutes * 60;
  const timerClass =
    timeLeft <= totalTime * 0.1
      ? 'quiz-timer danger'
      : timeLeft <= totalTime * 0.25
        ? 'quiz-timer warning'
        : 'quiz-timer';

  // Submit
  const handleSubmit = () => {
    setSubmitted(true);
    setShowModal(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    onSubmit(answers, { timeTaken: totalTime - timeLeft });
  };

  // Stats for modal
  const answeredCount = answers.filter((a) => a !== null).length;
  const unansweredCount = answers.filter((a, i) => a === null && visited[i]).length;
  const reviewCount = markedReview.filter((r) => r).length;
  const notVisitedCount = visited.filter((v) => !v).length;

  const q = questions[currentQ];
  const optionLetters = Object.keys(q.options);

  // Palette button class
  const getPaletteClass = (i) => {
    let cls = 'palette-btn';
    if (i === currentQ) cls += ' current';
    if (markedReview[i]) cls += ' review';
    if (answers[i] !== null) cls += ' answered';
    else if (visited[i]) cls += ' not-answered';
    return cls;
  };

  return (
    <div className="quiz-screen">
      {/* Top Bar */}
      <div className="quiz-topbar">
        <div className="quiz-title">Practice Test</div>
        <div className="topbar-right">
          <div className={timerClass}>
            <span className="timer-icon">⏱</span>
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Quiz Body */}
      <div className="quiz-body">
        {/* Question Panel */}
        <div className="question-panel">
          {/* Question Header */}
          <div className="q-header">
            <div className="q-number">{currentQ + 1}</div>
            <div className="q-meta">
              <span className={`q-badge ${q.difficulty}`}>
                {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
              </span>
              <span className="q-badge topic-badge">{q.topic}</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="q-text">{q.question}</div>

          {/* Options */}
          <div className="options-list">
            {optionLetters.map((letter) => (
              <div
                key={letter}
                className={`option-item ${answers[currentQ] === letter ? 'selected' : ''}`}
                onClick={() => selectOption(letter)}
              >
                <div className="option-letter">{letter}</div>
                <div className="option-text">{q.options[letter]}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="q-actions">
            <div className="q-actions-left">
              <button className="btn btn-secondary btn-sm" onClick={toggleReview}>
                {markedReview[currentQ] ? 'Unmark Review' : 'Mark for Review'}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={clearResponse}>
                Clear
              </button>
            </div>
            <div className="q-actions-right">
              {currentQ > 0 && (
                <button className="btn btn-secondary btn-sm" onClick={goPrev}>
                  ← Prev
                </button>
              )}
              {currentQ < questions.length - 1 ? (
                <button className="btn btn-primary btn-sm" onClick={goNext}>
                  Next →
                </button>
              ) : (
                <button className="btn btn-success btn-sm" onClick={() => setShowModal(true)}>
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Side Panel — Question Palette */}
        <div className="side-panel">
          <div className="palette-header">Question Palette</div>
          <div className="palette-legend">
            <div className="legend-item">
              <div className="legend-dot not-visited"></div> Not Visited
            </div>
            <div className="legend-item">
              <div className="legend-dot answered"></div> Answered
            </div>
            <div className="legend-item">
              <div className="legend-dot not-answered-dot"></div> Not Answered
            </div>
            <div className="legend-item">
              <div className="legend-dot review-dot"></div> Marked Review
            </div>
          </div>
          <div className="palette-grid">
            {questions.map((_, i) => (
              <button key={i} className={getPaletteClass(i)} onClick={() => goToQuestion(i)}>
                {i + 1}
              </button>
            ))}
          </div>
          <div className="palette-footer">
            <button className="btn btn-danger btn-block btn-sm" onClick={() => setShowModal(true)}>
              Submit Test
            </button>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box fade-up" onClick={(e) => e.stopPropagation()}>
            <h3>Submit Test?</h3>
            <p className="modal-desc">Review your attempt summary before submitting.</p>
            <div className="modal-stats">
              <div className="modal-stat">
                <div className="num green">{answeredCount}</div>
                <div className="label">Answered</div>
              </div>
              <div className="modal-stat">
                <div className="num red">{unansweredCount}</div>
                <div className="label">Unanswered</div>
              </div>
              <div className="modal-stat">
                <div className="num yellow">{reviewCount}</div>
                <div className="label">Marked Review</div>
              </div>
              <div className="modal-stat">
                <div className="num">{notVisitedCount}</div>
                <div className="label">Not Visited</div>
              </div>
            </div>
            <div className="btn-group">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                ← Go Back
              </button>
              <button className="btn btn-danger" onClick={handleSubmit}>
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
