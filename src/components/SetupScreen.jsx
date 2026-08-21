import { useState, useEffect } from 'react';
import './SetupScreen.css';

const QUICK_TOPICS = [
  'Quantitative Aptitude',
  'Logical Reasoning',
  'Verbal Ability',
  'DBMS',
  'OS',
  'CN',
  'OOPs',
  'Software Engineering',
  'SQL',
  'Computer Architecture',
  'Compiler Design',
  'TOC',
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
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="setup-screen">
      <div className="setup-container fade-up">
        {/* Logo */}
        <div className="logo">
          <h1>Practice Test</h1>
          <p>Aptitude &amp; CSE subject practice — exam simulation</p>
        </div>

        <div className="form-card">
          {/* Topics */}
          <div className="form-group">
            <label className="form-label">Topics to Revise</label>

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
                placeholder="Type a topic and press Enter or Add"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="btn btn-secondary btn-sm" onClick={addTopic}>
                + Add
              </button>
            </div>

            <div className="quick-topics">
              {QUICK_TOPICS.map((t) => (
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

          {/* Questions & Time */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Number of Questions</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="200"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value) || 0)}
                placeholder="e.g. 30"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Total Time (minutes)</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="300"
                value={time}
                onChange={(e) => setTime(parseInt(e.target.value) || 0)}
                placeholder="e.g. 30"
              />
            </div>
          </div>

          {/* Difficulty */}
          <div className="form-group">
            <label className="form-label">Difficulty Levels</label>
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
            <label className="form-label">Negative Marking</label>
            <div className="negative-marking-row">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={negativeEnabled}
                  onChange={(e) => setNegativeEnabled(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="toggle-label">{negativeEnabled ? 'Enabled' : 'Disabled'}</span>
              {negativeEnabled && (
                <select
                  className="penalty-select"
                  value={negativePenalty}
                  onChange={(e) => setNegativePenalty(parseFloat(e.target.value))}
                >
                  <option value={0.25}>-0.25 per wrong</option>
                  <option value={0.33}>-0.33 per wrong</option>
                  <option value={0.5}>-0.50 per wrong</option>
                  <option value={1}>-1.00 per wrong</option>
                </select>
              )}
            </div>
          </div>

          {/* Submit */}
          <button className="btn btn-primary btn-lg btn-block" onClick={handleSubmit}>
            Generate AI Prompt →
          </button>
        </div>

        {/* Quiz History */}
        {history.length > 0 && (
          <div className="form-card history-card">
            <div className="history-header">
              <h3 className="section-title">Recent Attempts</h3>
              <button className="btn btn-secondary btn-sm" onClick={clearHistory}>
                Clear
              </button>
            </div>
            <div className="history-table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Topics</th>
                    <th>Score</th>
                    <th>Questions</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {history
                    .slice()
                    .reverse()
                    .map((h, i) => (
                      <tr key={i}>
                        <td>{formatDate(h.date)}</td>
                        <td className="history-topics">{h.topics}</td>
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
          </div>
        )}
      </div>
    </div>
  );
}
