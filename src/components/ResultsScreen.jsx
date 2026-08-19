import { useState, useEffect } from 'react';
import './ResultsScreen.css';

export default function ResultsScreen({ questions, userAnswers, meta, onRestart }) {
  const [filter, setFilter] = useState('all');
  const [animatedPercent, setAnimatedPercent] = useState(0);

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
    return { ...q, userAnswer: ua, status };
  });

  const total = questions.length;
  const percent = Math.round((correct / total) * 100);

  // Animate score ring
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercent(percent), 100);
    return () => clearTimeout(timer);
  }, [percent]);

  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (animatedPercent / 100) * circumference;
  const ringColor =
    percent >= 70 ? 'var(--success)' : percent >= 40 ? 'var(--warning)' : 'var(--danger)';

  const message =
    percent >= 80
      ? '🏆 Excellent Performance!'
      : percent >= 60
        ? '👍 Good Job! Keep Practicing!'
        : percent >= 40
          ? '📝 Need More Practice'
          : "💪 Don't Give Up!";

  // Format time taken
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  // Filter results
  const filteredResults = filter === 'all' ? results : results.filter((r) => r.status === filter);

  return (
    <div className="results-screen">
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
                {percent}%
              </span>
              <span className="score-label">Score</span>
            </div>
          </div>
          <h2>{message}</h2>
          <p className="score-summary">
            You scored {correct} out of {total} ({wrong} wrong, {skipped} skipped) in{' '}
            {formatTime(meta.timeTaken)}
          </p>
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

        {/* Detailed Review */}
        <div className="review-section">
          <h2>📖 Detailed Review</h2>
          <div className="review-filters">
            {['all', 'correct', 'wrong', 'skipped'].map((f) => (
              <button
                key={f}
                className={`review-filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' && 'All'}
                {f === 'correct' && '✓ Correct'}
                {f === 'wrong' && '✕ Wrong'}
                {f === 'skipped' && '— Skipped'}
              </button>
            ))}
          </div>

          <div className="review-list">
            {filteredResults.map((r, idx) => (
              <div key={r.id} className={`review-card ${r.status}`}>
                <div className="review-q-header">
                  <span className="review-q-num">Q{r.id}</span>
                  <span className={`review-result-badge ${r.status}`}>
                    {r.status === 'correct' ? 'Correct' : r.status === 'wrong' ? 'Wrong' : 'Skipped'}
                  </span>
                  <span className={`q-badge ${r.difficulty}`} style={{ marginLeft: 'auto' }}>
                    {r.difficulty}
                  </span>
                  <span className="q-badge topic-badge">{r.topic}</span>
                </div>

                <div className="review-q-text">{r.question}</div>

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
                          <span className="opt-tag correct-tag">✓ Correct</span>
                        )}
                        {r.userAnswer === letter && r.userAnswer !== r.answer && (
                          <span className="opt-tag wrong-tag">✕ Your answer</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="review-explanation">
                  <strong>💡 Explanation:</strong> {r.explanation}
                </div>
              </div>
            ))}

            {filteredResults.length === 0 && (
              <div className="empty-state">No questions match this filter.</div>
            )}
          </div>
        </div>

        {/* Restart */}
        <div className="results-footer">
          <button className="btn btn-primary btn-lg" onClick={onRestart}>
            🔄 Take Another Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
