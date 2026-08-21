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

JSON STRING ESCAPING — EXTREMELY IMPORTANT:
- The output MUST be valid, parseable JSON.
- Inside ANY JSON string value, all double quotes MUST be escaped as \\"
- This is especially critical for codeSnippet values that contain code with double quotes.
- WRONG: "codeSnippet": "cout << "Hello" << endl;"
- CORRECT: "codeSnippet": "cout << \\"Hello\\" << endl;"
- For newlines in code, use \\n
- Example of a properly escaped C++ code snippet:
  "codeSnippet": "#include <iostream>\\nusing namespace std;\\nint main() {\\n    cout << \\"Hello\\" << endl;\\n    return 0;\\n}"

ACCURACY — THIS IS THE MOST IMPORTANT RULE:
- EVERY answer MUST be mathematically and logically correct.
- The "answer" field MUST match the option letter that the explanation proves is correct.
- After generating each question, VERIFY: solve the problem yourself, confirm the correct option letter, and make sure the "answer" field contains THAT letter.
- Do NOT put one letter in "answer" and then describe a different letter as correct in the explanation.
- For numerical questions: actually compute the answer, check which option matches, and set that option letter.
- For code output questions: mentally trace the code execution and verify the output matches the selected option.

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
      "codeSnippet": "#include <iostream>\\nusing namespace std;\\nint main() {\\n    cout << \\"Hello\\" << endl;\\n    return 0;\\n}",
      "codeLanguage": "cpp",
      "options": {
        "A": "Hello",
        "B": "hello",
        "C": "Compilation Error",
        "D": "Runtime Error"
      },
      "answer": "A",
      "explanation": "The program prints Hello to stdout. The correct answer is A.",
      "topic": "OOPs",
      "difficulty": "easy"
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
      "explanation": "Explanation here. The correct answer is A.",
      "topic": "Quantitative Aptitude",
      "difficulty": "hard"
    }
  ]
}

Generate all ${numQuestions} questions now. Return ONLY the raw JSON object — no text before it, no text after it, no code fences, no markdown formatting. Do not start an interactive quiz or test session. Remember: escape all double quotes inside string values as \\", verify every answer is correct and consistent with its explanation.`;
}

/**
 * Attempts to fix unescaped double quotes inside JSON string values,
 * especially in codeSnippet fields that contain programming code.
 */
function fixBrokenJson(raw) {
  // Strategy: We know codeSnippet is always followed by codeLanguage.
  // Find each "codeSnippet": "..." section and escape internal quotes.
  // Also handle "question" fields that might contain quotes.

  let fixed = raw;

  // Fix codeSnippet fields (most common source of broken quotes)
  fixed = fixFieldQuotes(fixed, 'codeSnippet', 'codeLanguage');

  // Fix question fields (occasionally has quotes)
  fixed = fixFieldQuotes(fixed, 'question', 'codeSnippet');

  return fixed;
}

function fixFieldQuotes(jsonStr, fieldName, nextFieldName) {
  const fieldKey = `"${fieldName}"`;
  const nextKey = `"${nextFieldName}"`;
  const result = [];
  let searchFrom = 0;

  while (searchFrom < jsonStr.length) {
    const keyPos = jsonStr.indexOf(fieldKey, searchFrom);
    if (keyPos === -1) {
      result.push(jsonStr.substring(searchFrom));
      break;
    }

    // Push everything before this field
    result.push(jsonStr.substring(searchFrom, keyPos));

    // Find the colon after the key
    let j = keyPos + fieldKey.length;
    while (j < jsonStr.length && jsonStr[j] !== ':') j++;
    j++; // skip colon
    while (j < jsonStr.length && /\s/.test(jsonStr[j])) j++;

    // Check if value is null
    if (jsonStr.substring(j, j + 4) === 'null') {
      result.push(jsonStr.substring(keyPos, j + 4));
      searchFrom = j + 4;
      continue;
    }

    // Must be a string starting with "
    if (jsonStr[j] !== '"') {
      result.push(jsonStr.substring(keyPos, j + 1));
      searchFrom = j + 1;
      continue;
    }

    // Find the next field marker to know where this value ends
    const nextKeyPos = jsonStr.indexOf(nextKey, j + 1);
    if (nextKeyPos === -1) {
      // Can't find next field — try to use a generic end pattern
      // Fall back: just push as-is and move on
      result.push(jsonStr.substring(keyPos, j + 1));
      searchFrom = j + 1;
      continue;
    }

    // Work backwards from nextKeyPos to find the closing quote of this value
    // Pattern should be: "value",\n    "nextField"
    let endQuote = nextKeyPos - 1;
    while (endQuote > j && /\s/.test(jsonStr[endQuote])) endQuote--;
    if (jsonStr[endQuote] === ',') endQuote--;
    while (endQuote > j && /\s/.test(jsonStr[endQuote])) endQuote--;

    if (jsonStr[endQuote] === '"' && endQuote > j) {
      // Content is between j+1 and endQuote (exclusive)
      const content = jsonStr.substring(j + 1, endQuote);

      // Check if there are unescaped quotes
      const hasUnescaped = /(?<!\\)"/.test(content);
      if (hasUnescaped) {
        // Escape all unescaped double quotes
        const escaped = content
          .replace(/\\"/g, '\x00ESCQ\x00') // preserve already escaped
          .replace(/"/g, '\\"') // escape unescaped
          .replace(/\x00ESCQ\x00/g, '\\"'); // restore
        result.push(fieldKey + ': "' + escaped + '"');
      } else {
        result.push(jsonStr.substring(keyPos, endQuote + 1));
      }
      searchFrom = endQuote + 1;
    } else {
      result.push(jsonStr.substring(keyPos, j + 1));
      searchFrom = j + 1;
    }
  }

  return result.join('');
}

function parseQuestions(raw) {
  let jsonStr = raw.trim();

  // Extract from markdown code fences if present
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonStr = fenceMatch[1].trim();

  // Try parsing as-is first
  let data;
  try {
    data = JSON.parse(jsonStr);
  } catch (firstError) {
    // Try to fix broken JSON (unescaped quotes in code snippets)
    try {
      const fixed = fixBrokenJson(jsonStr);
      data = JSON.parse(fixed);
    } catch (secondError) {
      // If still fails, show the original error with a helpful hint
      throw new Error(
        `Invalid JSON: ${firstError.message}\n\nThis usually happens when the AI includes unescaped double quotes (") inside code snippets. Try asking the AI to "escape all double quotes in codeSnippet values as \\\"" or regenerate the questions.`
      );
    }
  }

  if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
    throw new Error('JSON must contain a "questions" array with at least 1 question.');
  }

  const warnings = [];

  const questions = data.questions.map((q, i) => {
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
      throw new Error(
        `Question ${i + 1} has invalid answer "${q.answer}". Must be A, B, C, or D.`
      );
    }

    // Detect answer-explanation mismatches
    const explanation = q.explanation || '';
    const mismatchPatterns = [
      /correct (?:option|answer) is ([A-D])/i,
      /therefore[,]? (?:the )?(?:correct )?(?:option|answer) is ([A-D])/i,
      /option ([A-D]) is correct/i,
    ];
    for (const pattern of mismatchPatterns) {
      const match = explanation.match(pattern);
      if (match && match[1].toUpperCase() !== answer) {
        warnings.push(
          `Q${i + 1}: Answer field says "${answer}" but explanation mentions "${match[1].toUpperCase()}" as correct`
        );
        break;
      }
    }

    let codeSnippet = q.codeSnippet || null;
    if (typeof codeSnippet === 'string') {
      codeSnippet = codeSnippet.replace(/\\n/g, '\n').replace(/\\t/g, '    ');
    }

    return {
      id: q.id || i + 1,
      question: q.question,
      codeSnippet,
      codeLanguage: q.codeLanguage || null,
      options: opts,
      answer,
      explanation: explanation || 'No explanation provided.',
      topic: q.topic || 'General',
      difficulty: (q.difficulty || 'medium').toLowerCase(),
    };
  });

  return { questions, warnings };
}

export default function PromptScreen({ config, onBack, onStart }) {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [copied, setCopied] = useState(false);

  const promptText = generatePromptText(config);

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleStart = (forceStart = false) => {
    setError('');
    setWarnings([]);
    if (!jsonInput.trim()) {
      setError('Please paste the JSON response from the AI.');
      return;
    }
    try {
      const { questions, warnings: w } = parseQuestions(jsonInput);

      if (w.length > 0 && !forceStart) {
        setWarnings(w);
        return;
      }

      onStart(questions);
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
            Copy this prompt and paste it into ChatGPT, Gemini, Claude, or any AI chatbot to
            generate your questions.
          </p>
          <div className="prompt-box">{promptText}</div>
        </div>

        <div className="form-card json-section">
          <h3 className="section-title">Paste AI Response</h3>
          <p className="section-desc">Paste the JSON output you received from the AI below.</p>
          <textarea
            className="json-input-area"
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              setWarnings([]);
              setError('');
            }}
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
          {error && <div className="error-msg">{error}</div>}

          {warnings.length > 0 && (
            <div className="warning-box">
              <div className="warning-title">
                Potential answer-explanation mismatches detected
              </div>
              <ul className="warning-list">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
              <p className="warning-note">
                The AI may have put the wrong letter in the "answer" field. You can still start
                the test, but some answers might be incorrect.
              </p>
              <div className="btn-group">
                <button className="btn btn-secondary" onClick={() => setWarnings([])}>
                  ← Fix JSON
                </button>
                <button className="btn btn-primary" onClick={() => handleStart(true)}>
                  Start Anyway
                </button>
              </div>
            </div>
          )}

          {warnings.length === 0 && (
            <div className="btn-group">
              <button className="btn btn-secondary" onClick={onBack}>
                ← Back
              </button>
              <button className="btn btn-primary btn-lg" onClick={() => handleStart(false)}>
                Start Test
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
