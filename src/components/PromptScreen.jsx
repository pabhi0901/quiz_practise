import { useState } from 'react';
import './PromptScreen.css';

function generatePromptText(config) {
  const { topics, numQuestions, difficulties } = config;
  const diffStr = difficulties.join(', ');
  const topicStr = topics.join(', ');

  return `You are an expert question paper setter for IT company recruitment exams like TCS NQT, Infosys SP & DSE, Wipro NLTH, and similar competitive exams.

Generate exactly ${numQuestions} multiple-choice questions (MCQs) for the following topics:
📚 Topics: ${topicStr}

🎯 Difficulty Level(s): ${diffStr}
📝 Pattern: Questions should follow the pattern and style of previous year papers (PYQs) from TCS NQT and Infosys recruitment exams. Focus on conceptual understanding, tricky options, and real exam-like scenarios.

⚠️ IMPORTANT RULES:
1. Each question MUST have exactly 4 options labeled A, B, C, D.
2. The "answer" field must contain ONLY the correct option letter (A, B, C, or D).
3. Provide a brief explanation for each answer.
4. Include the topic and difficulty for each question.
5. Questions should NOT be from Data Structures & Algorithms (DSA).
6. Mix the topics proportionally across the ${numQuestions} questions.
7. Make questions tricky and exam-realistic — not textbook definitions.

📤 OUTPUT FORMAT: Return ONLY valid JSON in the exact format below. No extra text, no markdown, no code fences — just the raw JSON object:

{
  "questions": [
    {
      "id": 1,
      "question": "Your question text here?",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "answer": "B",
      "explanation": "Brief explanation of why B is correct.",
      "topic": "Topic Name",
      "difficulty": "medium"
    },
    {
      "id": 2,
      "question": "...",
      "options": {
        "A": "...",
        "B": "...",
        "C": "...",
        "D": "..."
      },
      "answer": "A",
      "explanation": "...",
      "topic": "...",
      "difficulty": "hard"
    }
  ]
}

Generate all ${numQuestions} questions now. Remember: output ONLY the JSON, nothing else.`;
}

function parseQuestions(raw) {
  let jsonStr = raw.trim();

  // Extract from markdown code fences if present
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonStr = fenceMatch[1].trim();

  const data = JSON.parse(jsonStr);

  if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
    throw new Error('JSON must contain a "questions" array with at least 1 question.');
  }

  return data.questions.map((q, i) => {
    if (!q.question) throw new Error(`Question ${i + 1} is missing the "question" field.`);

    // Normalize options: support both array and object formats
    let opts = {};
    if (Array.isArray(q.options)) {
      const letters = ['A', 'B', 'C', 'D'];
      q.options.forEach((o, j) => {
        if (j < 4) opts[letters[j]] = o;
      });
    } else if (typeof q.options === 'object') {
      opts = q.options;
    } else {
      throw new Error(`Question ${i + 1} has invalid options format.`);
    }

    if (Object.keys(opts).length < 2) {
      throw new Error(`Question ${i + 1} must have at least 2 options.`);
    }

    const answer = (q.answer || '').toString().trim().toUpperCase();
    if (!['A', 'B', 'C', 'D'].includes(answer)) {
      throw new Error(`Question ${i + 1} has invalid answer "${q.answer}". Must be A, B, C, or D.`);
    }

    return {
      id: q.id || i + 1,
      question: q.question,
      options: opts,
      answer,
      explanation: q.explanation || 'No explanation provided.',
      topic: q.topic || 'General',
      difficulty: (q.difficulty || 'medium').toLowerCase(),
    };
  });
}

export default function PromptScreen({ config, onBack, onStart }) {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const promptText = generatePromptText(config);

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleStart = () => {
    setError('');
    if (!jsonInput.trim()) {
      setError('Please paste the JSON response from the AI.');
      return;
    }
    try {
      const parsedQuestions = parseQuestions(jsonInput);
      onStart(parsedQuestions);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="prompt-screen">
      <div className="prompt-container fade-up">
        {/* Step Indicator */}
        <div className="step-indicator">
          <span className="step-num step-done">✓</span>
          <span className="step-text">Setup Complete</span>
          <span className="step-arrow">→</span>
          <span className="step-num">2</span>
          <span className="step-text">Copy prompt &amp; paste questions</span>
        </div>

        {/* Prompt Section */}
        <div className="form-card prompt-section">
          <div className="prompt-header">
            <h3 className="section-title">📋 AI Prompt</h3>
            <div className="prompt-actions">
              {copied && <span className="copy-status">✓ Copied!</span>}
              <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
                📋 Copy Prompt
              </button>
            </div>
          </div>
          <p className="section-desc">
            Copy this prompt and paste it into ChatGPT, Gemini, Claude, or any AI chatbot to generate
            your questions.
          </p>
          <div className="prompt-box">{promptText}</div>
        </div>

        {/* JSON Input Section */}
        <div className="form-card json-section">
          <h3 className="section-title">📥 Paste AI Response</h3>
          <p className="section-desc">Paste the JSON output you received from the AI below.</p>
          <textarea
            className="json-input-area"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`Paste the JSON here... It should look like:
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "answer": "B",
      "explanation": "...",
      "topic": "...",
      "difficulty": "medium"
    }
  ]
}`}
          />
          {error && <div className="error-msg">{`❌ ${error}`}</div>}
          <div className="btn-group">
            <button className="btn btn-secondary" onClick={onBack}>
              ← Back
            </button>
            <button className="btn btn-primary btn-lg" onClick={handleStart}>
              🚀 Start Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
