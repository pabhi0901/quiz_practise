import { useState, useEffect, useMemo } from 'react';
import './SetupScreen.css';

const TOPIC_CATEGORIES = [
  {
    name: 'Aptitude & Reasoning',
    topics: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability']
  },
  {
    name: 'Core CS Subjects',
    topics: ['DBMS', 'OS', 'CN', 'OOPs', 'Software Engineering', 'SQL', 'Computer Architecture', 'Compiler Design', 'TOC']
  }
];

const DIFFICULTIES = [
  { key: 'easy', label: 'Easy', color: 'var(--success)' },
  { key: 'medium', label: 'Medium', color: 'var(--warning)' },
  { key: 'hard', label: 'Hard', color: 'var(--danger)' },
  { key: 'mix', label: 'Mix', color: 'var(--purple)' },
];

export default function SetupScreen({ onComplete, initialConfig }) {
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('userName') || 'Radhe';
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [topics, setTopics] = useState(initialConfig.topics || []);
  const [topicInput, setTopicInput] = useState('');
  const [numQuestions, setNumQuestions] = useState(initialConfig.numQuestions || '');
  const [time, setTime] = useState(initialConfig.time || '');
  const [difficulties, setDifficulties] = useState(initialConfig.difficulties || []);
  const [negativeEnabled, setNegativeEnabled] = useState(
    initialConfig.negativeMarking?.enabled || false
  );
  const [negativePenalty, setNegativePenalty] = useState(
    initialConfig.negativeMarking?.penalty || 0.25
  );
  const [history, setHistory] = useState([]);

  const updateName = (val) => {
    setUserName(val);
    localStorage.setItem('userName', val);
  };

  // Load quiz history
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('quizHistory') || '[]');
      setHistory(saved);
    } catch {
      setHistory([]);
    }
  }, []);

  // Performance calculations for dashboard
  const avgScore = useMemo(() => {
    if (history.length === 0) return 0;
    const sum = history.reduce((acc, curr) => acc + curr.percent, 0);
    return Math.round(sum / history.length);
  }, [history]);

  const bestScore = useMemo(() => {
    if (history.length === 0) return 0;
    return Math.max(...history.map(h => h.percent));
  }, [history]);

  const totalQuestionsSolved = useMemo(() => {
    return history.reduce((acc, curr) => acc + curr.total, 0);
  }, [history]);

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all simulation logs?')) {
      localStorage.removeItem('quizHistory');
      setHistory([]);
    }
  };

  const addTopic = () => {
    const val = topicInput.trim();
    if (val && !topics.includes(val)) {
      setTopics([...topics, val]);
    }
    setTopicInput('');
  };

  const removeTopic = (idx) => {
    setTopics(topics.filter((_, i) => i !== idx));
  };

  const quickAdd = (t) => {
    if (!topics.includes(t)) {
      setTopics([...topics, t]);
    }
  };

  const toggleDiff = (key) => {
    setDifficulties((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  };

  const handleSubmit = () => {
    if (topics.length === 0) {
      alert('Please add at least one topic.');
      return;
    }
    if (difficulties.length === 0) {
      alert('Please select at least one difficulty level.');
      return;
    }
    if (numQuestions < 1) {
      alert('Please enter a valid number of questions.');
      return;
    }
    if (time < 1) {
      alert('Please enter a valid time duration.');
      return;
    }
    onComplete({
      topics,
      numQuestions,
      time,
      difficulties,
      negativeMarking: { enabled: negativeEnabled, penalty: negativePenalty },
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTopic();
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const launchCustomTest = () => {
    setShowConfig(true);
  };

  const launchTcsNqtPreset = () => {
    setTopics(['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'OOPs', 'DBMS']);
    setNumQuestions(40);
    setTime(40);
    setDifficulties(['medium', 'hard']);
    setNegativeEnabled(true);
    setNegativePenalty(0.25);
    setShowConfig(true);
  };

  const launchInfosysPreset = () => {
    setTopics(['DBMS', 'OS', 'OOPs', 'SQL', 'Compiler Design', 'TOC']);
    setNumQuestions(30);
    setTime(35);
    setDifficulties(['medium', 'hard']);
    setNegativeEnabled(false);
    setShowConfig(true);
  };

  // SVG Gauge calculations
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (avgScore / 100) * circumference;

  return (
    <div className="setup-screen">
      <div className="glow-blob blob-1"></div>
      <div className="glow-blob blob-2"></div>

      {/* Top Navbar */}
      <nav className="dashboard-nav">
        <div className="nav-left">
          <div className="nav-logo">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <span>PRACTICE.TEST</span>
          </div>
          <div className="nav-links">
            <span className="nav-link active">Home</span>
            <span className="nav-link" onClick={() => {
              const el = document.getElementById('history-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}>Simulations</span>
            <span className="nav-link" onClick={launchCustomTest}>Customizer</span>
          </div>
        </div>
        <div className="nav-right">
          <div className="profile-badge">
            <div className="avatar-placeholder">
              {userName ? userName.charAt(0).toUpperCase() : 'R'}
            </div>
            {isEditingName ? (
              <input
                type="text"
                className="name-edit-input"
                value={userName}
                onChange={(e) => updateName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingName(false);
                }}
                autoFocus
              />
            ) : (
              <span className="profile-name-editable" onClick={() => setIsEditingName(true)} title="Click to rename">
                {userName} <span className="edit-pencil-icon">✎</span>
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Dashboard Body Container */}
      <div className="dashboard-container fade-up">
        {/* Left Side: Brand Hero & simulation list */}
        <div className="dashboard-main">
          <div className="hero-row">
            {/* Hero text */}
            <div className="hero-content">
              <div className="welcome-tag">Welcome back, {userName} 🙏</div>
              <h1 className="hero-title">
                Practice Smarter.<br />
                <span className="gradient-text">Score Higher.</span>
              </h1>
              <p className="hero-desc">
                Prepare for TCS NQT, Infosys SP/DSE, and other top IT recruitment exams with real-time adaptive simulations and comprehensive performance diagnostics.
              </p>
              <div className="hero-actions">
                <button className="btn btn-primary" onClick={launchCustomTest}>
                  Start Test →
                </button>
                <button className="btn btn-secondary" onClick={() => {
                  const el = document.getElementById('history-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}>
                  View History
                </button>
              </div>
            </div>

            {/* Central Animated Illustration (Document stack) */}
            <div className="hero-illustration">
              <div className="doc-stack">
                <div className="doc-page page-1">
                  <div className="doc-line short"></div>
                  <div className="doc-line long"></div>
                  <div className="doc-line long"></div>
                  <div className="doc-line short"></div>
                </div>
                <div className="doc-page page-2">
                  <div className="doc-line short"></div>
                  <div className="doc-line long"></div>
                  <div className="doc-line long"></div>
                  <div className="doc-line short"></div>
                </div>
                <div className="doc-page page-3">
                  <div className="doc-line short"></div>
                  <div className="doc-line long"></div>
                  <div className="doc-line long"></div>
                  <div className="doc-line short"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick highlights */}
          <div className="highlights-row">
            <div className="hl-card">
              <span className="hl-icon blue">⚡</span>
              <div className="hl-info">
                <h4>Real Exam Pattern</h4>
                <p>Timed tests matching TCS &amp; Infosys console structure</p>
              </div>
            </div>
            <div className="hl-card">
              <span className="hl-icon purple">📊</span>
              <div className="hl-info">
                <h4>Detailed Analytics</h4>
                <p>Granular breakdown of scores and pacing stats</p>
              </div>
            </div>
            <div className="hl-card">
              <span className="hl-icon green">🎯</span>
              <div className="hl-info">
                <h4>Subject Coverage</h4>
                <p>Practice aptitude and CS core topics evenly</p>
              </div>
            </div>
          </div>

          {/* Simulation History list */}
          <div className="dashboard-section" id="history-section">
            <div className="section-header-row">
              <h2>Recent Simulations</h2>
              {history.length > 0 && (
                <button className="clear-btn" onClick={clearHistory}>
                  Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="simulation-empty">
                No past simulations logged. Pick a test parameters configuration to start.
              </div>
            ) : (
              <div className="simulation-list">
                {history
                  .slice()
                  .reverse()
                  .map((h, i) => (
                    <div className="sim-row-card" key={i}>
                      <div className="sim-icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polygon points="12 2 2 7 12 12 22 7 12 2" />
                          <polyline points="2 17 12 22 22 17" />
                        </svg>
                      </div>
                      <div className="sim-details">
                        <div className="sim-topics" title={h.topics}>{h.topics}</div>
                        <div className="sim-meta">{h.total} Questions • {h.timeTaken}</div>
                      </div>
                      <div className="sim-results">
                        <div className="sim-score-pct" style={{ color: h.percent >= 60 ? 'var(--success)' : h.percent >= 40 ? 'var(--warning)' : 'var(--danger)' }}>
                          {h.percent}%
                        </div>
                        <div className="sim-raw">{h.correct}/{h.total} correct</div>
                      </div>
                      <div className="sim-date">{formatDate(h.date)}</div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick start preset cards & performance analytics */}
        <div className="dashboard-sidebar">
          {/* Quick Start Card */}
          <div className="sidebar-widget">
            <h3 className="widget-title">Quick Start</h3>
            <p className="widget-subtitle">Choose a pre-configured template</p>

            <div className="preset-cards">
              <div className="preset-card" onClick={launchTcsNqtPreset}>
                <div className="preset-icon blue-bg">T</div>
                <div className="preset-info">
                  <h4>TCS NQT Simulation</h4>
                  <p>40 Questions • 40 Mins • Negative marking</p>
                </div>
                <span className="arrow">›</span>
              </div>

              <div className="preset-card" onClick={launchInfosysPreset}>
                <div className="preset-icon purple-bg">I</div>
                <div className="preset-info">
                  <h4>Infosys Prep Set</h4>
                  <p>30 Questions • 35 Mins • CS Core subjects</p>
                </div>
                <span className="arrow">›</span>
              </div>

              <div className="preset-card" onClick={launchCustomTest}>
                <div className="preset-icon green-bg">C</div>
                <div className="preset-info">
                  <h4>Custom Parameters</h4>
                  <p>Define topics, counts, time, and marking</p>
                </div>
                <span className="arrow">›</span>
              </div>
            </div>
          </div>

          {/* Performance Overview widget */}
          <div className="sidebar-widget">
            <h3 className="widget-title">Performance Analytics</h3>
            <div className="performance-overview-widget">
              {/* Circular accuracy meter */}
              <div className="accuracy-meter">
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={strokeWidth} />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                  <text x="50" y="47" textAnchor="middle" dominantBaseline="middle" className="accuracy-val">
                    {history.length > 0 ? `${avgScore}%` : '—'}
                  </text>
                  <text x="50" y="65" textAnchor="middle" dominantBaseline="middle" className="accuracy-label">
                    Avg. Score
                  </text>
                </svg>
              </div>

              {/* Stats parameters */}
              <div className="stats-list">
                <div className="sidebar-stat-item">
                  <span className="lbl">Tests Completed</span>
                  <span className="val">{history.length}</span>
                </div>
                <div className="sidebar-stat-item">
                  <span className="lbl">Best Simulation</span>
                  <span className="val">{history.length > 0 ? `${bestScore}%` : '—'}</span>
                </div>
                <div className="sidebar-stat-item">
                  <span className="lbl">Questions Solved</span>
                  <span className="val">{totalQuestionsSolved}</span>
                </div>
              </div>
            </div>
            
            {history.length > 0 && (
              <div className="performance-motivation">
                <span className="trophy">🏆</span>
                <div className="motivation-text">
                  <strong>Keep it up!</strong>
                  <p>You are consistently logging and reviewing simulations.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PARAMETER CONFIGURATION MODAL OVERLAY */}
      {showConfig && (
        <div className="modal-overlay" onClick={() => setShowConfig(false)}>
          <div className="modal-card fade-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Simulation Configurations</h3>
              <button className="close-modal" onClick={() => setShowConfig(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* Topics */}
              <div className="form-group">
                <label className="form-label">Subject Topics</label>

                {topics.length > 0 && (
                  <div className="topic-chips">
                    {topics.map((t, i) => (
                      <span className="topic-chip" key={i}>
                        {t}
                        <span className="remove" onClick={() => removeTopic(i)}>
                          ×
                        </span>
                      </span>
                    ))}
                  </div>
                )}

                <div className="topic-input-row">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Add custom topic (e.g. OS, DBMS)..."
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button className="btn btn-secondary btn-sm" onClick={addTopic}>
                    + Add
                  </button>
                </div>

                <div className="category-group-container">
                  {TOPIC_CATEGORIES.map((cat) => (
                    <div key={cat.name} className="category-group">
                      <span className="category-group-title">{cat.name}</span>
                      <div className="quick-topics">
                        {cat.topics.map((t) => (
                          <span
                            className={`quick-topic ${topics.includes(t) ? 'added' : ''}`}
                            key={t}
                            onClick={() => quickAdd(t)}
                          >
                            {topics.includes(t) ? '✓ ' : ''}
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions & Time */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Questions</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    max="200"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value) || 0)}
                    placeholder="30"
                  />
                  <div className="preset-chips">
                    {[10, 20, 30, 50].map((n) => (
                      <span
                        key={n}
                        className={`preset-chip ${numQuestions === n ? 'active' : ''}`}
                        onClick={() => setNumQuestions(n)}
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (Min)</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    max="300"
                    value={time}
                    onChange={(e) => setTime(parseInt(e.target.value) || 0)}
                    placeholder="30"
                  />
                  <div className="preset-chips">
                    {[15, 30, 45, 60].map((t) => (
                      <span
                        key={t}
                        className={`preset-chip ${time === t ? 'active' : ''}`}
                        onClick={() => setTime(t)}
                      >
                        {t}m
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Difficulty */}
              <div className="form-group">
                <label className="form-label">Target Difficulty</label>
                <div className="diff-group">
                  {DIFFICULTIES.map((d) => (
                    <label
                      className={`diff-chip ${difficulties.includes(d.key) ? 'selected' : ''}`}
                      key={d.key}
                      onClick={() => toggleDiff(d.key)}
                    >
                      <span className="dot" style={{ background: d.color }}></span>
                      {d.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Negative Marking */}
              <div className="form-group">
                <label className="form-label">Negative Evaluation</label>
                <div className="negative-marking-row">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={negativeEnabled}
                      onChange={(e) => setNegativeEnabled(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="toggle-label">{negativeEnabled ? 'Active' : 'Inactive'}</span>
                  {negativeEnabled && (
                    <select
                      className="penalty-select"
                      value={negativePenalty}
                      onChange={(e) => setNegativePenalty(parseFloat(e.target.value))}
                    >
                      <option value={0.25}>-0.25 per incorrect</option>
                      <option value={0.33}>-0.33 per incorrect</option>
                      <option value={0.5}>-0.50 per incorrect</option>
                      <option value={1}>-1.00 per incorrect</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowConfig(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Configure Simulation Prompt →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
