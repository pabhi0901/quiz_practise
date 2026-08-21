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
  const [topics, setTopics] = useState(initialConfig.topics || []);
  const [topicInput, setTopicInput] = useState('');
  const [numQuestions, setNumQuestions] = useState(initialConfig.numQuestions || 30);
  const [time, setTime] = useState(initialConfig.time || 30);
  const [difficulties, setDifficulties] = useState(initialConfig.difficulties || ['medium', 'hard']);
  const [negativeEnabled, setNegativeEnabled] = useState(
    initialConfig.negativeMarking?.enabled || false
  );
  const [negativePenalty, setNegativePenalty] = useState(
    initialConfig.negativeMarking?.penalty || 0.25
  );
  const [history, setHistory] = useState([]);

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

  const clearHistory = () => {
    localStorage.removeItem('quizHistory');
    setHistory([]);
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
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="setup-screen">
      <div className="glow-blob blob-1"></div>
      <div className="glow-blob blob-2"></div>
      <div className="setup-grid fade-up">
        {/* Left Side: Brand and Stats Dashboard */}
        <div className="setup-left">
          <div className="brand-header">
            <div className="brand-logo">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <div className="brand-info">
              <h1>PRACTICE.TEST</h1>
              <p>High-Fidelity Assessment Engine</p>
            </div>
          </div>

          <div className="intro-text">
            Prepare for TCS NQT, Infosys SP/DSE, and CS core subjects with real-time test simulations, fine-grained analytics, and adjustable negative marking parameters.
          </div>

          {/* Quick Analytics Cards */}
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-title">Simulations</span>
              <span className="stat-val">{history.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Average Score</span>
              <span className="stat-val" style={{ color: history.length > 0 ? (avgScore >= 60 ? 'var(--success)' : avgScore >= 40 ? 'var(--warning)' : 'var(--danger)') : 'inherit' }}>
                {history.length > 0 ? `${avgScore}%` : '—'}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Best Performance</span>
              <span className="stat-val" style={{ color: history.length > 0 ? (bestScore >= 60 ? 'var(--success)' : 'var(--warning)') : 'inherit' }}>
                {history.length > 0 ? `${bestScore}%` : '—'}
              </span>
            </div>
          </div>

          {/* Simulation History */}
          <div className="dashboard-history">
            <div className="history-header-row">
              <h3>Simulation Logs</h3>
              {history.length > 0 && (
                <button className="clear-btn" onClick={clearHistory}>
                  Clear Logs
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="history-empty">
                No past sessions recorded. Complete a simulation to log performance analytics.
              </div>
            ) : (
              <div className="history-table-wrap">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Topics Included</th>
                      <th>Score</th>
                      <th>Attempt</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history
                      .slice()
                      .reverse()
                      .map((h, i) => (
                        <tr key={i}>
                          <td>{formatDate(h.date)}</td>
                          <td className="history-topics" title={h.topics}>
                            {h.topics}
                          </td>
                          <td>
                            <span
                              className={`history-score ${h.percent >= 60 ? 'good' : h.percent >= 40 ? 'avg' : 'bad'}`}
                            >
                              {h.percent}%
                            </span>
                          </td>
                          <td>
                            {h.correct}/{h.total}
                          </td>
                          <td>{h.timeTaken}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Setup Controls */}
        <div className="setup-right">
          <div className="config-card">
            <h2 className="config-title">Test Parameters</h2>

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
                  placeholder="Add custom topic (e.g. DBMS, Verbal)..."
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

            {/* Submit */}
            <button className="btn btn-primary btn-lg btn-block" onClick={handleSubmit}>
              Generate Simulation Prompt →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
