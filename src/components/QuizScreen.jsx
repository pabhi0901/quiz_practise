import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import './QuizScreen.css';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';

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
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [topicFilter, setTopicFilter] = useState('all');
  const [showLegend, setShowLegend] = useState(false);

  // Highlight code snippets when current question changes
  useEffect(() => {
    Prism.highlightAll();
  }, [currentQ]);

  // Time per question tracking
  const timePerQ = useRef(new Array(questions.length).fill(0));
  const lastTimestamp = useRef(Date.now());

  // Get unique topics for filter
  const uniqueTopics = useMemo(() => {
    const set = new Set(questions.map((q) => q.topic));
    return ['all', ...Array.from(set)];
  }, [questions]);

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
      doSubmit();
    }
  }, [timeLeft, submitted]);

  // Track time on current question
  const recordTimeOnCurrentQ = () => {
    const now = Date.now();
    const elapsed = (now - lastTimestamp.current) / 1000;
    timePerQ.current[currentQ] += elapsed;
    lastTimestamp.current = now;
  };

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e) => {
      if (showModal) return;

      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
        return;
      }

      if (showShortcuts) {
        if (e.key === 'Escape') setShowShortcuts(false);
        return;
      }

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
        default:
          break;
      }
    },
    [currentQ, showModal, showShortcuts]
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
    recordTimeOnCurrentQ();
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
  const doSubmit = () => {
    recordTimeOnCurrentQ();
    setSubmitted(true);
    setShowModal(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    onSubmit(answers, {
      timeTaken: totalTime - timeLeft,
      timePerQuestion: [...timePerQ.current],
    });
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
    if (answers[i] !== null && markedReview[i]) cls += ' answered-marked';
    else if (markedReview[i]) cls += ' review';
    else if (answers[i] !== null) cls += ' answered';
    else if (visited[i]) cls += ' not-answered';
    return cls;
  };

  // Filtered indices for palette
  const paletteIndices = questions
    .map((q, i) => ({ topic: q.topic, idx: i }))
    .filter((item) => topicFilter === 'all' || item.topic === topicFilter)
    .map((item) => item.idx);

  return (
    <div className="quiz-screen">
      {/* Top Bar */}
      <div className="quiz-topbar">
        <div className="quiz-title-section">
          <span className="quiz-live-badge">
            <span className="live-indicator-pulse"></span>
            LIVE
          </span>
          <div className="quiz-header-meta">
            <span className="quiz-meta-title">Practice.test</span>
            <span className="quiz-meta-subtitle">Simulation Mode</span>
          </div>
        </div>

        <div className="quiz-center-timer">
          <div className={timerClass}>
            <svg className="timer-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div className="timer-display">
              <span className="timer-val">{formatTime(timeLeft)}</span>
              <span className="timer-lbl">Time Left</span>
            </div>
          </div>
        </div>

        <div className="topbar-right">
          <button
            className="btn btn-secondary btn-sm shortcut-hint"
            onClick={() => setShowShortcuts(true)}
            title="Keyboard Shortcuts"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" className="shortcut-icon-svg">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="15" y1="3" x2="15" y2="21"></line>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="3" y1="15" x2="21" y2="15"></line>
            </svg>
            Shortcuts
          </button>
          <button className="btn-end-test" onClick={() => setShowModal(true)}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            End Test
          </button>
        </div>
      </div>

      {/* Quiz Body */}
      <div className="quiz-body">
        {/* Question Panel */}
        <div className="question-panel">
          <div className="q-header">
            <div className="q-title-meta">
              <span className="q-title-text">Question <span className="q-curr-num">{currentQ + 1}</span> of {questions.length}</span>
              <div className="q-meta">
                <span className={`q-badge ${q.difficulty}`}>
                  {q.difficulty.toUpperCase()}
                </span>
                <span className="q-badge topic-badge">{q.topic.toUpperCase()}</span>
              </div>
            </div>
            <button className={`btn-mark-review ${markedReview[currentQ] ? 'active' : ''}`} onClick={toggleReview}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              {markedReview[currentQ] ? 'Marked' : 'Mark for Review'}
            </button>
          </div>

          <div className="q-text">{q.question}</div>

          {/* Code Snippet */}
          {q.codeSnippet && (
            <div className="code-snippet-block">
              <div className="code-snippet-header">
                {q.codeLanguage && (
                  <span className="code-lang-name">{q.codeLanguage.toUpperCase()}</span>
                )}
                <button 
                  className="btn-copy-code"
                  onClick={() => {
                    navigator.clipboard.writeText(q.codeSnippet);
                  }}
                  title="Copy Code"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              </div>
              <pre className="code-snippet-pre">
                <code className={`language-${(q.codeLanguage || 'clike').toLowerCase()}`}>
                  {q.codeSnippet}
                </code>
              </pre>
            </div>
          )}

          {/* Options */}
          <div className="options-list">
            {optionLetters.map((letter) => (
              <div
                key={letter}
                className={`option-item ${answers[currentQ] === letter ? 'selected' : ''}`}
                onClick={() => selectOption(letter)}
              >
                <div className="option-checkbox">
                  <div className="option-letter">{letter}</div>
                </div>
                <div className="option-text">{q.options[letter]}</div>
                {answers[currentQ] === letter && (
                  <span className="option-checked-mark">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="q-actions">
            <div className="q-actions-left">
              <button className="btn btn-secondary btn-sm" onClick={goPrev} disabled={currentQ === 0}>
                ← Previous
              </button>
              <button className="btn btn-secondary btn-sm" onClick={clearResponse}>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" className="btn-icon">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                Clear Response
              </button>
            </div>
            <div className="q-actions-right">
              {currentQ < questions.length - 1 ? (
                <button className="btn btn-primary btn-sm" onClick={goNext}>
                  Next →
                </button>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                  Submit Test
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="side-panel">
          <div className="side-panel-section">
            <div className="palette-header">
              <span>Question Palette</span>
              <span className="legend-dropdown-trigger" onClick={() => setShowLegend(!showLegend)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Legend <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" style={{ transform: showLegend ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </div>
            {showLegend && (
              <div className="palette-legend">
                <div className="legend-item">
                  <div className="legend-dot not-visited"></div>
                  <span>Not Visited</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot not-answered-dot"></div>
                  <span>Not Answered</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot answered"></div>
                  <span>Answered</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot review-dot"></div>
                  <span>Marked for Review</span>
                </div>
                <div className="legend-item span-two">
                  <div className="legend-dot answered-marked"></div>
                  <span>Answered & Marked</span>
                </div>
              </div>
            )}

            {/* Topic Filter */}
            {uniqueTopics.length > 2 && (
              <div className="palette-filter">
                <select
                  className="topic-filter-select"
                  value={topicFilter}
                  onChange={(e) => setTopicFilter(e.target.value)}
                >
                  {uniqueTopics.map((t) => (
                    <option key={t} value={t}>
                      {t === 'all' ? 'All Topics' : t.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="palette-grid">
              {paletteIndices.map((i) => (
                <button key={i} className={getPaletteClass(i)} onClick={() => goToQuestion(i)}>
                  {i + 1}
                  {answers[i] !== null && !markedReview[i] && <span className="answered-dot"></span>}
                  {answers[i] !== null && markedReview[i] && <span className="answered-marked-dot"></span>}
                </button>
              ))}
            </div>
          </div>

          <div className="side-panel-footer">
            <div className="progress-section">
              <div className="progress-label-row">
                <span className="progress-lbl">Progress</span>
                <span className="progress-pct-val">{Math.round((answeredCount / questions.length) * 100)}%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${Math.round((answeredCount / questions.length) * 100)}%` }}></div>
              </div>
            </div>

            <div className="stats-counters-grid">
              <div className="counter-item card-green">
                <span className="count-lbl">Ans:</span>
                <span className="count-val">{answeredCount}</span>
              </div>
              <div className="counter-item card-red">
                <span className="count-lbl">Unans:</span>
                <span className="count-val">{questions.length - answeredCount}</span>
              </div>
              <div className="counter-item card-yellow">
                <span className="count-lbl">Marked:</span>
                <span className="count-val">{reviewCount}</span>
              </div>
            </div>

            <div className="palette-footer-actions">
              <button className="btn btn-submit-test" onClick={() => setShowModal(true)}>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" className="btn-icon">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                Submit Test
              </button>
              <div className="submission-disclaimer">
                You can submit the test anytime before the timer ends.
              </div>
            </div>

            <div className="quiz-sidebar-branding">
              Made by <a href="https://www.linkedin.com/in/abhishek-pandey-45b215296/" target="_blank" rel="noreferrer">Abhi</a> 
              <span className="br-dot">•</span>
              <a href="https://www.instagram.com/__abhishekpandey_/" target="_blank" rel="noreferrer">Instagram</a> 
              <span className="br-dot">/</span>
              <a href="https://www.linkedin.com/in/abhishek-pandey-45b215296/" target="_blank" rel="noreferrer">LinkedIn</a>
            </div>
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
              <button className="btn btn-danger" onClick={doSubmit}>
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Overlay */}
      {showShortcuts && (
        <div className="modal-overlay" onClick={() => setShowShortcuts(false)}>
          <div className="modal-box shortcuts-box fade-up" onClick={(e) => e.stopPropagation()}>
            <div className="shortcuts-header">
              <h3>Keyboard Shortcuts</h3>
              <button className="shortcuts-close" onClick={() => setShowShortcuts(false)}>
                ×
              </button>
            </div>
            <div className="shortcuts-grid">
              <div className="shortcut-row">
                <kbd>A</kbd> <kbd>B</kbd> <kbd>C</kbd> <kbd>D</kbd>
                <span>Select option</span>
              </div>
              <div className="shortcut-row">
                <kbd>←</kbd> or <kbd>P</kbd>
                <span>Previous question</span>
              </div>
              <div className="shortcut-row">
                <kbd>→</kbd> or <kbd>N</kbd>
                <span>Next question</span>
              </div>
              <div className="shortcut-row">
                <kbd>R</kbd>
                <span>Mark / Unmark for review</span>
              </div>
              <div className="shortcut-row">
                <kbd>X</kbd>
                <span>Clear response</span>
              </div>
              <div className="shortcut-row">
                <kbd>?</kbd>
                <span>Toggle this help</span>
              </div>
              <div className="shortcut-row">
                <kbd>Esc</kbd>
                <span>Close overlay</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
