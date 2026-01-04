import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient"
import SubmissionHistory from "../components/SubmissionHistory"
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';

const langMap = {
        cpp: 'C++',
        java: 'Java',
        javascript: 'JavaScript'
};

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  let {problemId}  = useParams();

  const { handleSubmit } = useForm();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        const initialCode = response.data.startCode.find(sc => sc.language === langMap[selectedLanguage]).initialCode;
        setProblem(response.data);
        setCode(initialCode);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    if (problem) {
      const initialCode = problem.startCode.find(sc => sc.language === langMap[selectedLanguage]).initialCode;
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    monaco.editor.defineTheme('modernDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
      ],
      colors: {
        'editor.background': '#0a0e1a',
        'editor.foreground': '#e4e4e7',
        'editor.lineHighlightBackground': '#1a1f35',
        'editorCursor.foreground': '#a855f7',
        'editorLineNumber.activeForeground': '#a855f7',
      },
    });
    monaco.editor.setTheme('modernDark');
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });
      setRunResult(response.data);
      setLoading(false);
      setActiveRightTab('testcase');
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error: 'Internal server error'
      });
      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code:code,
        language: selectedLanguage
      });
      setSubmitResult(response.data);
      setLoading(false);
      setActiveRightTab('result');
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult(null);
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'hard': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1s'}}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col border-r border-slate-800/50">
        {/* Left Tabs */}
        <div className="flex gap-1 bg-slate-900/50 backdrop-blur-sm px-4 py-3 border-b border-slate-800/50">
          {['description', 'editorial', 'solutions', 'submissions', 'chatAI'].map((tab) => (
            <button 
              key={tab}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeLeftTab === tab 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
              onClick={() => setActiveLeftTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {problem.title}
                    </h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {problem.tags}
                    </span>
                  </div>

                  <div className="prose prose-invert max-w-none">
                    <div className="text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-900/50 p-6 rounded-xl border border-slate-800/50">
                      {problem.description}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-white">Examples</h3>
                    <div className="space-y-4">
                      {problem.visibleTestCases.map((example, index) => (
                        <div key={index} className="bg-slate-900/50 backdrop-blur-sm p-5 rounded-xl border border-slate-800/50 hover:border-purple-500/30 transition-colors duration-300">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <h4 className="font-semibold text-white">Example {index + 1}</h4>
                          </div>
                          <div className="space-y-2 text-sm font-mono">
                            <div className="flex">
                              <span className="text-purple-400 font-semibold w-24">Input:</span>
                              <span className="text-slate-300">{example.input}</span>
                            </div>
                            <div className="flex">
                              <span className="text-pink-400 font-semibold w-24">Output:</span>
                              <span className="text-slate-300">{example.output}</span>
                            </div>
                            <div className="flex">
                              <span className="text-blue-400 font-semibold w-24">Explain:</span>
                              <span className="text-slate-400">{example.explanation}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === 'editorial' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Editorial
                  </h2>
                  <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/50">
                    <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration}/>
                  </div>
                </div>
              )}

              {activeLeftTab === 'solutions' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Solutions
                  </h2>
                  <div className="space-y-4">
                    {problem.referenceSolution?.map((solution, index) => (
                      <div key={index} className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800/50 overflow-hidden hover:border-purple-500/30 transition-colors duration-300">
                        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-5 py-3 border-b border-slate-800/50">
                          <h3 className="font-semibold text-white">{problem?.title} - {solution?.language}</h3>
                        </div>
                        <div className="p-5">
                          <pre className="bg-slate-950/50 p-4 rounded-lg text-sm overflow-x-auto border border-slate-800/30">
                            <code className="text-slate-300">{solution?.completeCode}</code>
                          </pre>
                        </div>
                      </div>
                    )) || <p className="text-slate-500 text-center py-8">Solutions will be available after you solve the problem.</p>}
                  </div>
                </div>
              )}

              {activeLeftTab === 'submissions' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    My Submissions
                  </h2>
                  <SubmissionHistory problemId={problemId} />
                </div>
              )}

              {activeLeftTab === 'chatAI' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Chat with AI
                  </h2>
                  <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/50">
                    <ChatAi problem={problem}></ChatAi>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex flex-col">
        {/* Right Tabs */}
        <div className="flex gap-1 bg-slate-900/50 backdrop-blur-sm px-4 py-3 border-b border-slate-800/50">
          {['code', 'testcase', 'result'].map((tab) => (
            <button 
              key={tab}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeRightTab === tab 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
              onClick={() => setActiveRightTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col">
          {activeRightTab === 'code' && (
            <div className="flex-1 flex flex-col">
              {/* Language Selector */}
              <div className="flex justify-between items-center p-4 border-b border-slate-800/50 bg-slate-900/30">
                <div className="flex gap-2">
                  {['javascript', 'java', 'cpp'].map((lang) => (
                    <button
                      key={lang}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedLanguage === lang 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' 
                          : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor Container */}
              <div className="flex-1 p-4">
                <div className="relative group h-full">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
                  
                  <div className="relative h-full bg-slate-900/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl">
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors duration-200"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors duration-200"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors duration-200"></div>
                      </div>
                      <div className="ml-4 text-sm text-slate-400 font-mono">
                        {selectedLanguage}.{selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'java' ? 'java' : 'js'}
                      </div>
                    </div>

                    <div className="h-[calc(100%-100px)]">
                      <Editor
                        height="100%"
                        language={getLanguageForMonaco(selectedLanguage)}
                        value={code}
                        onChange={handleEditorChange}
                        onMount={handleEditorDidMount}
                        theme="modernDark"
                        options={{
                          fontSize: 15,
                          fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Consolas', monospace",
                          fontLigatures: true,
                          minimap: { enabled: true, scale: 1, showSlider: 'mouseover' },
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          tabSize: 2,
                          insertSpaces: true,
                          wordWrap: 'on',
                          lineNumbers: 'on',
                          glyphMargin: true,
                          folding: true,
                          lineDecorationsWidth: 5,
                          lineNumbersMinChars: 4,
                          renderLineHighlight: 'all',
                          selectOnLineNumbers: true,
                          roundedSelection: true,
                          readOnly: false,
                          cursorStyle: 'line',
                          cursorWidth: 2,
                          cursorBlinking: 'smooth',
                          cursorSmoothCaretAnimation: 'on',
                          mouseWheelZoom: true,
                          smoothScrolling: true,
                          padding: { top: 16, bottom: 16 },
                          bracketPairColorization: { enabled: true },
                          guides: { bracketPairs: true, indentation: true },
                          suggest: { preview: true, showIcons: true },
                          quickSuggestions: true,
                          parameterHints: { enabled: true },
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-t border-slate-700/50 text-xs text-slate-400">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          Ready
                        </span>
                        <span>Lines: {code.split('\n').length}</span>
                      </div>
                      <div>UTF-8</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-slate-800/50 flex justify-end gap-3 bg-slate-900/30">
                <button
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    loading 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                      : 'bg-slate-800 text-white hover:bg-slate-700 hover:shadow-lg hover:shadow-slate-700/30'
                  }`}
                  onClick={handleRun}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin"></div>
                      Running...
                    </span>
                  ) : 'Run'}
                </button>
                <button
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    loading 
                      ? 'bg-purple-600/50 text-slate-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30'
                  }`}
                  onClick={handleSubmitCode}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-purple-300 border-t-white rounded-full animate-spin"></div>
                      Submitting...
                    </span>
                  ) : 'Submit'}
                </button>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              <h3 className="text-xl font-semibold mb-4 text-white">Test Results</h3>
              {runResult ? (
                <div className={`rounded-xl p-6 border ${
                  runResult.success 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : 'bg-rose-500/10 border-rose-500/30'
                }`}>
                  {runResult.success ? (
                    <div>
                      <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                        <span className="text-2xl">✅</span>
                        All test cases passed!
                      </h4>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-900/50 p-3 rounded-lg">
                          <p className="text-xs text-slate-400">Runtime</p>
                          <p className="text-lg font-semibold text-white">{runResult.runtime} sec</p>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-lg">
                          <p className="text-xs text-slate-400">Memory</p>
                          <p className="text-lg font-semibold text-white">{runResult.memory} KB</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {runResult.testCases.map((tc, i) => (
                          <div key={i} className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/50">
                            <div className="font-mono text-sm space-y-2">
                              <div className="flex"><span className="text-purple-400 w-24">Input:</span><span className="text-slate-300">{tc.stdin}</span></div>
                              <div className="flex"><span className="text-pink-400 w-24">Expected:</span><span className="text-slate-300">{tc.expected_output}</span></div>
                              <div className="flex"><span className="text-blue-400 w-24">Output:</span><span className="text-slate-300">{tc.stdout}</span></div>
                              <div className="text-emerald-400 font-semibold">✓ Passed</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-lg font-bold text-rose-400 mb-4 flex items-center gap-2">
                        <span className="text-2xl">❌</span>
                        Test failed
                      </h4>
                      <div className="space-y-3">
                        {runResult.testCases.map((tc, i) => (
                          <div key={i} className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/50">
                            <div className="font-mono text-sm space-y-2">
                              <div className="flex"><span className="text-purple-400 w-24">Input:</span><span className="text-slate-300">{tc.stdin}</span></div>
                              <div className="flex"><span className="text-pink-400 w-24">Expected:</span><span className="text-slate-300">{tc.expected_output}</span></div>
                              <div className="flex"><span className="text-blue-400 w-24">Output:</span><span className="text-slate-300">{tc.stdout}</span></div>
                              <div className={tc.status_id === 3 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                                {tc.status_id === 3 ? '✓ Passed' : '✗ Failed'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚀</div>
                  <p className="text-slate-400">Click "Run" to test your code with the example test cases.</p>
                </div>
              )}
            </div>
          )}

          {activeRightTab === 'result' && (
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              <h3 className="text-xl font-semibold mb-4 text-white">Submission Result</h3>
              {submitResult ? (
                <div className={`rounded-xl p-6 border ${
                  submitResult.accepted 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : 'bg-rose-500/10 border-rose-500/30'
                }`}>
                  {submitResult.accepted ? (
                    <div>
                      <h4 className="text-2xl font-bold text-emerald-400 mb-6 flex items-center gap-3">
                        <span className="text-4xl">🎉</span>
                        Accepted
                      </h4>
                      <div className="space-y-4">
                        <div className="bg-slate-900/50 p-4 rounded-lg">
                          <p className="text-sm text-slate-400 mb-1">Test Cases</p>
                          <p className="text-xl font-semibold text-white">
                            {submitResult.passedTestCases} / {submitResult.totalTestCases} passed
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-900/50 p-4 rounded-lg">
                            <p className="text-sm text-slate-400 mb-1">Runtime</p>
                            <p className="text-lg font-semibold text-white">{submitResult.runtime} sec</p>
                          </div>
                          <div className="bg-slate-900/50 p-4 rounded-lg">
                            <p className="text-sm text-slate-400 mb-1">Memory</p>
                            <p className="text-lg font-semibold text-white">{submitResult.memory} KB</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-2xl font-bold text-rose-400 mb-6 flex items-center gap-3">
                        <span className="text-4xl">❌</span>
                        {submitResult.error}
                      </h4>
                      <div className="bg-slate-900/50 p-4 rounded-lg">
                        <p className="text-sm text-slate-400 mb-1">Test Cases</p>
                        <p className="text-xl font-semibold text-white">
                          {submitResult.passedTestCases} / {submitResult.totalTestCases} passed
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-slate-400">Click "Submit" to submit your solution for evaluation.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.4);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.6);
        }
      `}</style>
    </div>
  );
};

export default ProblemPage;