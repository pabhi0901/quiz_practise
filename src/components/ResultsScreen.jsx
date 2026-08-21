import { useState, useEffect, useMemo } from 'react';
import './ResultsScreen.css';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';

export default function ResultsScreen({ questions, userAnswers, meta, config, onRetest, onNewQuiz }) {
  const [filter, setFilter] = useState('all');
  const [animatedPercent, setAnimatedPercent] = useState(0);

  const negativeMarking = config?.negativeMarking || { enabled: false, penalty: 0.25 };

  // Highlight code snippets when review filter changes
  useEffect(() => {
    Prism.highlightAll();
  }, [filter]);

  // Calculate stats
  let correct = 0,
    wrong = 0,
    skipped = 0;
  const results = questions.map((q, i) => {
    const ua = userAnswers[i];
    let status;
    if (ua === null) {
      status = 'skipped';
      skipped++;
    } else if (ua === q.answer) {
      status = 'correct';
      correct++;
    } else {
      status = 'wrong';
      wrong++;
    }
    return { ...q, userAnswer: ua, status, timeSpent: meta.timePerQuestion?.[i] || 0 };
  });

  const total = questions.length;
  const rawScore = correct;
  const penalizedScore = negativeMarking.enabled
    ? Math.max(0, correct - wrong * negativeMarking.penalty)
    : correct;
  const percent = Math.round((correct / total) * 100);
  const penalizedPercent = Math.round((penalizedScore / total) * 100);
  const displayPercent = negativeMarking.enabled ? penalizedPercent : percent;

  // Topic-wise breakdown
  const topicBreakdown = useMemo(() => {
    const map = {};
    results.forEach((r) => {
      if (!map[r.topic]) map[r.topic] = { total: 0, correct: 0, wrong: 0, skipped: 0 };
      map[r.topic].total++;
      if (r.status === 'correct') map[r.topic].correct++;
      else if (r.status === 'wrong') map[r.topic].wrong++;
      else map[r.topic].skipped++;
    });
    return Object.entries(map)
      .map(([topic, stats]) => ({
        topic,
        ...stats,
        percent: Math.round((stats.correct / stats.total) * 100),
      }))
      .sort((a, b) => b.percent - a.percent);
  }, [results]);

  // Difficulty-wise breakdown
  const diffBreakdown = useMemo(() => {
    const map = {};
    results.forEach((r) => {
      const d = r.difficulty;
      if (!map[d]) map[d] = { total: 0, correct: 0, wrong: 0, skipped: 0 };
      map[d].total++;
      if (r.status === 'correct') map[d].correct++;
      else if (r.status === 'wrong') map[d].wrong++;
      else map[d].skipped++;
    });
    const order = ['easy', 'medium', 'hard', 'mix'];
    return Object.entries(map)
      .map(([diff, stats]) => ({
        diff,
        ...stats,
        percent: Math.round((stats.correct / stats.total) * 100),
      }))
      .sort((a, b) => order.indexOf(a.diff) - order.indexOf(b.diff));
  }, [results]);

  // Animate score ring
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercent(displayPercent), 100);
    return () => clearTimeout(timer);
  }, [displayPercent]);

  // Save to history on mount
  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
      const entry = {
        date: new Date().toISOString(),
        topics: questions
          .reduce((acc, q) => (acc.includes(q.topic) ? acc : [...acc, q.topic]), [])
          .join(', '),
        total,
        correct,
        wrong,
        skipped,
        percent: displayPercent,
        timeTaken: formatTime(meta.timeTaken),
        negativeMarking: negativeMarking.enabled
          ? `${penalizedScore.toFixed(1)}/${total}`
          : null,
      };
      history.push(entry);
      // Keep last 20
      if (history.length > 20) history.splice(0, history.length - 20);
      localStorage.setItem('quizHistory', JSON.stringify(history));
    } catch {
      // silently fail
    }
  }, []);

  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (animatedPercent / 100) * circumference;
  const ringColor =
    displayPercent >= 70
      ? 'var(--success)'
      : displayPercent >= 40
        ? 'var(--warning)'
        : 'var(--danger)';

  const message =
    displayPercent >= 80
      ? 'Excellent Performance!'
      : displayPercent >= 60
        ? 'Good Job! Keep Practicing!'
        : displayPercent >= 40
          ? 'Need More Practice'
          : "Don't Give Up! Keep Going!";

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}m ${s}s`;
  }

  function formatTimeShort(seconds) {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}m ${s}s`;
  }

  const filteredResults = filter === 'all' ? results : results.filter((r) => r.status === filter);

  const handlePrint = () => {
    window.print();
  };

  const diffColor = (d) => {
    if (d === 'easy') return 'var(--success)';
    if (d === 'medium') return 'var(--warning)';
    if (d === 'hard') return 'var(--danger)';
    return 'var(--purple)';
  };

  return (
    <div className="results-screen">
      <div className="glow-blob blob-1"></div>
      <div className="glow-blob blob-2"></div>
      <div className="results-container fade-up">
        {/* Score Hero */}
        <div className="score-hero">
          <div className="score-ring">
            <svg viewBox="0 0 120 120">
              <circle className="bg-ring" cx="60" cy="60" r="52" />
              <circle
                className="progress-ring"
                cx="60"
                cy="60"
                r="52"
                style={{
                  stroke: ringColor,
                  strokeDasharray: circumference,
                  strokeDashoffset: offset,
                }}
              />
            </svg>
            <div className="score-text">
              <span className="score-value" style={{ color: ringColor }}>
                {displayPercent}%
              </span>
              <span className="score-label">Score</span>
            </div>
          </div>
          <h2>{message}</h2>
          <p className="score-summary">
            You scored {correct} out of {total} ({wrong} wrong, {skipped} skipped) in{' '}
            {formatTime(meta.timeTaken)}
          </p>
          {negativeMarking.enabled && (
            <p className="score-penalty">
              Adjusted score with -{negativeMarking.penalty} negative marking:{' '}
              <strong>
                {penalizedScore.toFixed(1)} / {total}
              </strong>
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="results-stats">
          <div className="r-stat">
            <div className="r-num" style={{ color: 'var(--accent)' }}>
              {total}
            </div>
            <div className="r-label">Total</div>
          </div>
          <div className="r-stat">
            <div className="r-num" style={{ color: 'var(--success)' }}>
              {correct}
            </div>
            <div className="r-label">Correct</div>
          </div>
          <div className="r-stat">
            <div className="r-num" style={{ color: 'var(--danger)' }}>
              {wrong}
            </div>
            <div className="r-label">Wrong</div>
          </div>
          <div className="r-stat">
            <div className="r-num" style={{ color: 'var(--text-muted)' }}>
              {skipped}
            </div>
            <div className="r-label">Skipped</div>
          </div>
        </div>

        {/* Breakdowns */}
        <div className="breakdown-row">
          {/* Topic Breakdown */}
          <div className="breakdown-card">
            <h3 className="breakdown-title">Topic-wise Performance</h3>
            <div className="breakdown-list">
              {topicBreakdown.map((t) => (
                <div className="breakdown-item" key={t.topic}>
                  <div className="breakdown-info">
                    <span className="breakdown-name">{t.topic}</span>
                    <span className="breakdown-score">
                      {t.correct}/{t.total}
                    </span>
                  </div>
                  <div className="breakdown-bar">
                    <div
                      className="breakdown-fill"
                      style={{
                        width: `${t.percent}%`,
                        background:
                          t.percent >= 70
                            ? 'var(--success)'
                            : t.percent >= 40
                              ? 'var(--warning)'
                              : 'var(--danger)',
                      }}
                    ></div>
                  </div>
                  <span className="breakdown-percent">{t.percent}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Breakdown */}
          <div className="breakdown-card">
            <h3 className="breakdown-title">Difficulty-wise Performance</h3>
            <div className="breakdown-list">
              {diffBreakdown.map((d) => (
                <div className="breakdown-item" key={d.diff}>
                  <div className="breakdown-info">
                    <span className="breakdown-name" style={{ color: diffColor(d.diff) }}>
                      {d.diff.charAt(0).toUpperCase() + d.diff.slice(1)}
                    </span>
                    <span className="breakdown-score">
                      {d.correct}/{d.total}
                    </span>
                  </div>
                  <div className="breakdown-bar">
                    <div
                      className="breakdown-fill"
                      style={{
                        width: `${d.percent}%`,
                        background: diffColor(d.diff),
                      }}
                    ></div>
                  </div>
                  <span className="breakdown-percent">{d.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Review */}
        <div className="review-section">
          <div className="review-section-header">
            <h2>Detailed Review</h2>
            <button className="btn btn-secondary btn-sm no-print" onClick={handlePrint}>
              Export as PDF
            </button>
          </div>
          <div className="review-filters no-print">
            {['all', 'correct', 'wrong', 'skipped'].map((f) => (
              <button
                key={f}
                className={`review-filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' && 'All'}
                {f === 'correct' && 'Correct'}
                {f === 'wrong' && 'Wrong'}
                {f === 'skipped' && 'Skipped'}
              </button>
            ))}
          </div>

          <div className="review-list">
            {filteredResults.map((r) => (
              <div key={r.id} className={`review-card ${r.status}`}>
                <div className="review-q-header">
                  <span className="review-q-num">Q{r.id}</span>
                  <span className={`review-result-badge ${r.status}`}>
                    {r.status === 'correct'
                      ? 'Correct'
                      : r.status === 'wrong'
                        ? 'Wrong'
                        : 'Skipped'}
                  </span>
                  {r.timeSpent > 0 && (
                    <span
                      className={`time-badge ${r.timeSpent > 120 ? 'slow' : ''}`}
                    >
                      {formatTimeShort(r.timeSpent)}
                    </span>
                  )}
                  <span className={`q-badge ${r.difficulty}`} style={{ marginLeft: 'auto' }}>
                    {r.difficulty}
                  </span>
                  <span className="q-badge topic-badge">{r.topic}</span>
                </div>

                <div className="review-q-text">{r.question}</div>

                {/* Code Snippet in review */}
                {r.codeSnippet && (
                  <div className="code-snippet-block review-code">
                    {r.codeLanguage && (
                      <div className="code-lang-tag">{r.codeLanguage.toUpperCase()}</div>
                    )}
                    <pre className="code-snippet-pre">
                      <code className={`language-${(r.codeLanguage || 'clike').toLowerCase()}`}>
                        {r.codeSnippet}
                      </code>
                    </pre>
                  </div>
                )}

                <div className="review-options">
                  {Object.entries(r.options).map(([letter, text]) => {
                    let cls = 'review-opt';
                    if (letter === r.answer) cls += ' correct-answer';
                    if (r.userAnswer && r.userAnswer !== r.answer && letter === r.userAnswer)
                      cls += ' user-wrong';
                    return (
                      <div key={letter} className={cls}>
                        <strong>{letter}.</strong>
                        <span>{text}</span>
                        {letter === r.answer && (
                          <span className="opt-tag correct-tag">Correct Answer</span>
                        )}
                        {r.userAnswer === letter && r.userAnswer !== r.answer && (
                          <span className="opt-tag wrong-tag">Your Answer</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="review-explanation">
                  <strong>Explanation:</strong> {r.explanation}
                </div>
              </div>
            ))}

            {filteredResults.length === 0 && (
              <div className="empty-state">No questions match this filter.</div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="results-footer no-print">
          <button className="btn btn-primary btn-lg" onClick={onRetest}>
            Retest — Same Questions
          </button>
          <button className="btn btn-secondary btn-lg" onClick={onNewQuiz}>
            New Test
          </button>
        </div>
      </div>
    </div>
  );
}
