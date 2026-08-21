import { useState } from 'react';
import './PromptScreen.css';

function generatePromptText(config) {
  const { topics, numQuestions, difficulties } = config;
  const diffStr = difficulties.join(', ');
  const topicStr = topics.join(', ');
  const perTopic = Math.floor(numQuestions / topics.length);
  const remainder = numQuestions % topics.length;

  let distributionNote = '';
  if (topics.length > 1) {
    distributionNote = `\nQUESTION DISTRIBUTION: Distribute questions EVENLY across topics. Each topic should get approximately ${perTopic} questions${remainder > 0 ? ` (assign ${remainder} extra question(s) to any topic)` : ''}. Total must be exactly ${numQuestions}.`;
  }

  return `You are an expert question paper setter for IT company recruitment exams like TCS NQT, Infosys SP & DSE, Wipro NLTH, and similar competitive exams.

Generate exactly ${numQuestions} multiple-choice questions (MCQs) for the following topics:
Topics: ${topicStr}

Difficulty Level(s): ${diffStr}
Pattern: Questions should follow the pattern and style of previous year papers (PYQs) from TCS NQT and Infosys recruitment exams. Focus on conceptual understanding, tricky options, and real exam-like scenarios.
${distributionNote}

IMPORTANT RULES:
1. Each question MUST have exactly 4 options labeled A, B, C, D.
2. The "answer" field must contain ONLY the correct option letter (A, B, C, or D).
3. Provide a brief explanation for each answer.
4. Include the topic and difficulty for each question.
5. Questions should NOT be from Data Structures & Algorithms (DSA).
6. For programming-related topics (SQL, OOPs, C, Java, Python, etc.), include a "codeSnippet" field with relevant code and set "codeLanguage" to the programming language. For non-programming questions, set these fields to null.
7. Make questions tricky and exam-realistic — not textbook definitions.

CRITICAL INSTRUCTIONS — READ CAREFULLY:
- Your ONLY job is to return the questions in the JSON format specified below.
- Do NOT start a quiz, test, or interactive session.
- Do NOT ask me to answer questions one by one.
- Do NOT display questions in any other format (numbered list, bullets, etc.).
- Do NOT add any commentary, introduction, or closing remarks.
- Do NOT wrap the JSON in markdown code fences or backticks.
- Just output the raw JSON object and NOTHING else.

OUTPUT FORMAT — Return ONLY this JSON structure:

{
  "questions": [
    {
      "id": 1,
      "question": "What will be the output of the following code?",
      "codeSnippet": "SELECT COUNT(*) FROM employees WHERE salary > 50000;",
      "codeLanguage": "sql",
      "options": {
        "A": "Returns total rows",
        "B": "Returns count of employees with salary > 50000",
        "C": "Syntax error",
        "D": "Returns NULL"
      },
      "answer": "B",
      "explanation": "COUNT(*) counts all rows matching the WHERE condition.",
      "topic": "SQL",
      "difficulty": "medium"
    },
    {
      "id": 2,
      "question": "A non-programming question example?",
      "codeSnippet": null,
      "codeLanguage": null,
      "options": {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      "answer": "A",
      "explanation": "Explanation here.",
      "topic": "Quantitative Aptitude",
      "difficulty": "hard"
    }
  ]
}

Generate all ${numQuestions} questions now. Return ONLY the raw JSON object — no text before it, no text after it, no code fences, no markdown formatting. Do not start an interactive quiz or test session.`;
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
      codeSnippet: q.codeSnippet || null,
      codeLanguage: q.codeLanguage || null,
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
        <div className="step-indicator">
          <span className="step-num step-done">✓</span>
          <span className="step-text">Setup Complete</span>
          <span className="step-arrow">→</span>
          <span className="step-num">2</span>
          <span className="step-text">Copy prompt &amp; paste questions</span>
        </div>

        <div className="form-card prompt-section">
          <div className="prompt-header">
            <h3 className="section-title">AI Prompt</h3>
            <div className="prompt-actions">
              {copied && <span className="copy-status">✓ Copied!</span>}
              <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
                Copy Prompt
              </button>
            </div>
          </div>
          <p className="section-desc">
            Copy this prompt and paste it into ChatGPT, Gemini, Claude, or any AI chatbot to generate
            your questions.
          </p>
          <div className="prompt-box">{promptText}</div>
        </div>

        <div className="form-card json-section">
          <h3 className="section-title">Paste AI Response</h3>
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
      "codeSnippet": "SELECT * FROM ...",
      "codeLanguage": "sql",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "answer": "B",
      "explanation": "...",
      "topic": "...",
      "difficulty": "medium"
    }
  ]
}`}
          />
          {error && <div className="error-msg">Error: {error}</div>}
          <div className="btn-group">
            <button className="btn btn-secondary" onClick={onBack}>
              ← Back
            </button>
            <button className="btn btn-primary btn-lg" onClick={handleStart}>
              Start Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
