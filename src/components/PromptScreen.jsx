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
Pattern: Before generating questions, internally identify recurring patterns from actual/reported TCS NQT and Infosys recruitment PYQs, including question structure, concept combinations, calculation intensity, distractor design, and difficulty. Generate original questions based on those patterns. Do not copy exact PYQs.
${distributionNote}

IMPORTANT RULES:
1. Each question MUST have exactly 4 options labeled A, B, C, D.
2. The "answer" field must contain ONLY the correct option letter (A, B, C, or D).
3. Provide a brief explanation for each answer.
4. Include the topic and difficulty for each question.
5. Questions should NOT be from Data Structures & Algorithms (DSA).
6. For programming-related topics (SQL, OOPs, C, Java, Python, etc.), include a "codeSnippet" field with relevant code and set "codeLanguage" to the programming language. For non-programming questions, set these fields to null.
7. Make questions tricky and exam-realistic — not textbook definitions.
8. At least 60% of questions should contain a plausible distractor based on a common candidate mistake, such as ignoring successive percentage effects, confusing WHERE and HAVING, confusing overloading with overriding, mishandling NULL in SQL, or applying an incorrect logical inference.
9. 25% - 35% of questions should combine two related concepts rather than testing a single isolated formula or definition.
10. Do not make questions difficult merely by using unnecessarily large numbers or lengthy calculations. Difficulty should come from reasoning, concept interaction, ambiguity resolution, or carefully designed distractors.
11. Before producing the final JSON, internally perform a second independent verification of every question. For numerical questions, recompute using a different method where possible. For code questions, trace execution statement-by-statement. For reasoning questions, test every option against the given conditions. For SQL questions, evaluate the query semantics including NULL behavior, duplicates, grouping, and join cardinality.
12. Use actual/reported PYQs as a pattern reference when available. If web access is available, research recent TCS NQT and Infosys recruitment PYQs before generation. Do not claim a generated question is a PYQ unless it has been verified as one.
13. Ensure broad subtopic coverage within each topic. Do not generate more than 2 questions testing essentially the same underlying concept/pattern.
14. Hard questions should resemble difficult recruitment-test questions: the difficulty should arise from combining concepts, interpreting conditions, identifying traps, or tracing non-obvious behavior—not from obscure facts.

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

function generateCustomExamPrompt(config) {
  const { topics = [], numQuestions = 20, difficulties = ['medium'], examName = 'Competitive Exam', language = 'english' } = config;
  const diffStr = difficulties.join(', ');
  const topicStr = topics.join(', ');
  const perTopic = Math.floor(numQuestions / (topics.length || 1));
  const remainder = numQuestions % (topics.length || 1);

  let distributionNote = '';
  if (topics.length > 1) {
    distributionNote = `\nQUESTION DISTRIBUTION: Distribute questions EVENLY across topics/subjects. Each topic should get approximately ${perTopic} questions${remainder > 0 ? ` (assign ${remainder} extra question(s) to any topic)` : ''}. Total must be exactly ${numQuestions}.`;
  }

  // Language Instruction
  let langInstruction = '';
  if (language === 'hindi') {
    langInstruction = `\nLANGUAGE REQUIREMENT: Generate ALL questions, options, explanations, and text strictly in HINDI (हिंदी). Use standard, formal Hindi terminology suitable for Indian competitive exams (${examName}).`;
  } else if (language === 'bilingual') {
    langInstruction = `\nLANGUAGE REQUIREMENT: Generate ALL questions, options, and explanations in BILINGUAL format (English + Hindi, e.g., "What is the capital of India? / भारत की राजधानी क्या है?"). Both languages must be clear and accurate.`;
  } else {
    langInstruction = `\nLANGUAGE REQUIREMENT: Generate all questions, options, and explanations in ENGLISH.`;
  }

  // Detect if subjects test programming
  const progKeywords = ['sql', 'c', 'cpp', 'c++', 'java', 'python', 'oops', 'dbms', 'os', 'cn', 'coding', 'programming', 'software', 'compiler', 'toc', 'dsa', 'data structures'];
  const hasProgramming = topics.some(t => progKeywords.some(kw => t.toLowerCase().includes(kw))) ||
                         progKeywords.some(kw => examName.toLowerCase().includes(kw));

  let codingRule = '';
  let distractorRule = '';

  if (hasProgramming) {
    codingRule = `6. For programming-related topics (SQL, OOPs, C, Java, Python, etc.), include a "codeSnippet" field with relevant code and set "codeLanguage" to the programming language. For non-programming questions, set these fields to null.`;
    distractorRule = `8. At least 60% of questions should contain a plausible distractor based on a common candidate mistake, such as ignoring syntax rules, confusing WHERE and HAVING in SQL, confusing overloading with overriding, or applying an incorrect logical inference.`;
  } else {
    codingRule = `6. This is a non-programming examination (${examName} - ${topicStr}). Set "codeSnippet" and "codeLanguage" to null for ALL questions. Do NOT generate programming or code output questions.`;
    distractorRule = `8. At least 60% of questions should contain a plausible distractor based on a common candidate mistake for ${examName} (e.g., misinterpreting formulas, confusing historical events or constitutional articles, miscalculating percentages/ratios, or subtle conceptual traps).`;
  }

  return `You are an expert question paper setter for the "${examName}" examination.

Generate exactly ${numQuestions} multiple-choice questions (MCQs) for the following topics/subjects:
Topics/Subjects: ${topicStr}

Target Exam: ${examName}
Difficulty Level(s): ${diffStr}
Pattern: Before generating questions, internally identify recurring patterns from actual/reported ${examName} previous year papers (PYQs), including question structure, concept combinations, calculation intensity, distractor design, and difficulty. Generate original questions based on those patterns. Do not copy exact PYQs.
${distributionNote}
${langInstruction}

IMPORTANT RULES:
1. Each question MUST have exactly 4 options labeled A, B, C, D.
2. The "answer" field must contain ONLY the correct option letter (A, B, C, or D).
3. Provide a brief explanation for each answer.
4. Include the topic and difficulty for each question.
5. Questions must be strictly relevant to the syllabus and style of ${examName}.
${codingRule}
7. Make questions tricky and exam-realistic for ${examName} — not textbook definitions.
${distractorRule}
9. 25% - 35% of questions should combine two related concepts rather than testing a single isolated formula or definition.
10. Do not make questions difficult merely by using unnecessarily large numbers or lengthy calculations. Difficulty should come from reasoning, concept interaction, ambiguity resolution, or carefully designed distractors.
11. Before producing the final JSON, internally perform a second independent verification of every question. Solve the problem yourself, verify the reasoning, and confirm that the selected answer option is 100% accurate.
12. Use actual/reported ${examName} PYQs as a pattern reference when available. If web access is available, research recent ${examName} PYQs before generation. Do not claim a generated question is a PYQ unless it has been verified as one.
13. Ensure broad subtopic coverage within each topic/subject. Do not generate more than 2 questions testing essentially the same underlying concept/pattern.
14. Hard questions should resemble difficult ${examName} exam questions: the difficulty should arise from combining concepts, interpreting conditions, identifying traps, or tracing non-obvious behavior—not from obscure facts.

JSON STRING ESCAPING — EXTREMELY IMPORTANT:
- The output MUST be valid, parseable JSON.
- Inside ANY JSON string value, all double quotes MUST be escaped as \\"
- WRONG: "question": "Who wrote "Gitanjali"?"
- CORRECT: "question": "Who wrote \\"Gitanjali\\"?"
- For newlines in code or text, use \\n

ACCURACY — THIS IS THE MOST IMPORTANT RULE:
- EVERY answer MUST be mathematically, historically, and logically correct.
- The "answer" field MUST match the option letter that the explanation proves is correct.
- After generating each question, VERIFY: solve the problem yourself, confirm the correct option letter, and make sure the "answer" field contains THAT letter.
- Do NOT put one letter in "answer" and then describe a different letter as correct in the explanation.

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
      "question": "Sample question text for ${examName}?",
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
      "topic": "${topics[0] || 'General'}",
      "difficulty": "medium"
    }
  ]
}

Generate all ${numQuestions} questions for ${examName} now in ${language.toUpperCase()} language. Return ONLY the raw JSON object — no text before it, no text after it, no code fences, no markdown formatting. Do not start an interactive quiz or test session. Remember: escape all double quotes inside string values as \\", verify every answer is correct and consistent with its explanation.`;
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

function formatCodeSnippet(code, lang) {
  if (!code) return code;

  // Normalize string: replace literal backslash-n and backslash-t
  let cleaned = code.replace(/\\n/g, '\n').replace(/\\t/g, '    ');

  // If the code snippet already has multiple lines, respect the existing formatting
  if ((cleaned.match(/\n/g) || []).length >= 2) {
    return cleaned;
  }

  const l = (lang || '').toLowerCase();

  // C, C++, Java, JavaScript Formatter
  if (['c', 'cpp', 'java', 'javascript', 'js'].includes(l)) {
    let formatted = '';
    let indent = 0;
    let inString = false;
    let stringChar = null;

    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];

      // Handle string literals to prevent splitting inside quotes
      if ((char === '"' || char === "'") && cleaned[i - 1] !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = null;
        }
      }

      if (inString) {
        formatted += char;
        continue;
      }

      if (char === '{') {
        formatted += ' {\n' + ' '.repeat((indent + 1) * 4);
        indent++;
      } else if (char === '}') {
        indent = Math.max(0, indent - 1);
        formatted = formatted.trimEnd();
        formatted += '\n' + ' '.repeat(indent * 4) + '}';
        if (cleaned[i + 1] !== ';') {
          formatted += '\n' + ' '.repeat(indent * 4);
        }
      } else if (char === ';') {
        formatted += ';\n' + ' '.repeat(indent * 4);
      } else {
        // Prevent duplicate consecutive spaces
        if (char === ' ' && formatted[formatted.length - 1] === ' ') {
          continue;
        }
        formatted += char;
      }
    }

    return formatted
      .split('\n')
      .map(line => line.trimEnd())
      .filter((line, idx, arr) => line !== '' || (idx > 0 && arr[idx - 1] !== ''))
      .join('\n')
      .trim();
  }

  // SQL Formatter
  if (l === 'sql') {
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING',
      'ORDER BY', 'LIMIT', 'LEFT JOIN', 'RIGHT JOIN',
      'INNER JOIN', 'JOIN', 'UNION', 'ON'
    ];

    let temp = cleaned;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      temp = temp.replace(regex, (match) => `\n${match.toUpperCase()}`);
    });

    return temp
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  }

  return cleaned;
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

    const codeSnippet = q.codeSnippet
      ? formatCodeSnippet(q.codeSnippet, q.codeLanguage)
      : null;

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
  const [validationLogs, setValidationLogs] = useState({
    syntax: 'idle', // idle | success | error
    pattern: 'idle', // idle | success | error
    keys: 'idle', // idle | success | warning
  });

  const promptText = (config.examMode === 'custom-exam' || config.examName)
    ? generateCustomExamPrompt(config)
    : generatePromptText(config);

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleTextareaChange = (val) => {
    setJsonInput(val);
    setError('');
    setWarnings([]);

    if (!val.trim()) {
      setValidationLogs({ syntax: 'idle', pattern: 'idle', keys: 'idle' });
      return;
    }

    try {
      let rawJson = val.trim();
      const fenceMatch = rawJson.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fenceMatch) rawJson = fenceMatch[1].trim();

      let data;
      try {
        data = JSON.parse(rawJson);
      } catch {
        const fixed = fixBrokenJson(rawJson);
        data = JSON.parse(fixed);
      }

      setValidationLogs(prev => ({ ...prev, syntax: 'success' }));

      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setValidationLogs(prev => ({ ...prev, pattern: 'success' }));
      } else {
        setValidationLogs(prev => ({ ...prev, pattern: 'error' }));
        return;
      }

      const w = [];
      data.questions.forEach((q, i) => {
        const answer = (q.answer || '').toString().trim().toUpperCase();
        const explanation = q.explanation || '';
        const mismatchPatterns = [
          /correct (?:option|answer) is ([A-D])/i,
          /therefore[,]? (?:the )?(?:correct )?(?:option|answer) is ([A-D])/i,
          /option ([A-D]) is correct/i,
        ];
        for (const pattern of mismatchPatterns) {
          const match = explanation.match(pattern);
          if (match && match[1].toUpperCase() !== answer) {
            w.push(`Q${i + 1}: Expected '${match[1].toUpperCase()}', got '${answer}'`);
            break;
          }
        }
      });

      if (w.length > 0) {
        setWarnings(w);
        setValidationLogs(prev => ({ ...prev, keys: 'warning' }));
      } else {
        setValidationLogs(prev => ({ ...prev, keys: 'success' }));
      }

    } catch (e) {
      setValidationLogs({
        syntax: 'error',
        pattern: 'idle',
        keys: 'idle'
      });
    }
  };

  const handleStart = (forceStart = false) => {
    setError('');
    if (!jsonInput.trim()) {
      setError('Please paste the JSON response from the AI.');
      return;
    }
    try {
      const { questions } = parseQuestions(jsonInput);
      onStart(questions);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="prompt-screen">
      <div className="console-layout fade-up">
        {/* Left Side: Prompt Console */}
        <div className="console-column">
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="window-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <span className="terminal-title">PROMPT_GENERATOR.SH</span>
              <button className={`copy-terminal-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
                {copied ? 'Copied ✓' : 'Copy Prompt'}
              </button>
            </div>
            <div className="terminal-body prompt-terminal">
              <div className="terminal-welcome">
                // COPY THIS COMMAND AND PASTE TO GEMINI/GPT/CLAUDE TO FETCH QUESTIONS
              </div>
              <pre className="terminal-code-box">
                <code>{promptText}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Right Side: Parsing & Executing Terminal */}
        <div className="console-column">
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="window-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <span className="terminal-title">SCHEMA_COMPILER.EXE</span>
              <span className="terminal-status">// LIVE PARSER</span>
            </div>
            <div className="terminal-body code-terminal">
              <div className="terminal-welcome">
                // PASTE THE AI OUTPUT BELOW (JSON FORMAT ONLY)
              </div>
              <textarea
                className="terminal-textarea"
                value={jsonInput}
                onChange={(e) => handleTextareaChange(e.target.value)}
                placeholder={`Paste raw JSON data here...`}
              />

              {/* Live Compiler Status */}
              <div className="compiler-logs">
                <div className="log-line">
                  <span className={`status-icon ${validationLogs.syntax}`}>
                    {validationLogs.syntax === 'success' ? '✓' : validationLogs.syntax === 'error' ? '×' : '○'}
                  </span>
                  <span className="log-text">JSON Syntax Check</span>
                </div>
                <div className="log-line">
                  <span className={`status-icon ${validationLogs.pattern}`}>
                    {validationLogs.pattern === 'success' ? '✓' : validationLogs.pattern === 'error' ? '×' : '○'}
                  </span>
                  <span className="log-text">Assessment Pattern Check (TCS/Infosys Schema)</span>
                </div>
                <div className="log-line">
                  <span className={`status-icon ${validationLogs.keys}`}>
                    {validationLogs.keys === 'success' ? '✓' : validationLogs.keys === 'warning' ? '!' : validationLogs.keys === 'error' ? '×' : '○'}
                  </span>
                  <span className="log-text">Answer Key Integrity Scan</span>
                </div>
              </div>

              {/* Error Output */}
              {error && (
                <div className="compiler-error-trace">
                  <span className="trace-header">SYSTEM_ERROR_TRACE:</span>
                  <pre className="trace-body">{error}</pre>
                </div>
              )}

              {/* Warning Mismatches Box */}
              {warnings.length > 0 && (
                <div className="compiler-warning-trace">
                  <span className="trace-header">COMPILER_WARNING_LOG:</span>
                  <div className="warning-scroll-box">
                    {warnings.map((w, idx) => (
                      <div key={idx} className="trace-warning-line">
                        [WARN] {w}
                      </div>
                    ))}
                  </div>
                  <div className="warning-action-row">
                    <button className="btn btn-secondary btn-sm" onClick={() => setWarnings([])}>
                      Re-parse
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => handleStart(true)}>
                      Execute Mismatched Test
                    </button>
                  </div>
                </div>
              )}

              {/* Action Footer */}
              {warnings.length === 0 && (
                <div className="console-footer-actions">
                  <button className="btn btn-secondary" onClick={onBack}>
                    ← Config Parameters
                  </button>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => handleStart(false)}
                    disabled={validationLogs.syntax !== 'success' || validationLogs.pattern !== 'success'}
                  >
                    Start Test
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
