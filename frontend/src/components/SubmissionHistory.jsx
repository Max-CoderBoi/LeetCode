import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import { CheckCircle, XCircle, AlertCircle, Clock, Code2, Calendar, Zap, Database, X } from 'lucide-react';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        setSubmissions(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch submission history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'accepted':
        return {
          color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          icon: <CheckCircle size={14} />
        };
      case 'wrong':
        return {
          color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
          icon: <XCircle size={14} />
        };
      case 'error':
        return {
          color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          icon: <AlertCircle size={14} />
        };
      case 'pending':
        return {
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          icon: <Clock size={14} />
        };
      default:
        return {
          color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
          icon: <AlertCircle size={14} />
        };
    }
  };

  const formatMemory = (memory) => {
    if (memory < 1024) return `${memory} KB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1s'}}></div>
        </div>
        <p className="text-slate-400 mt-4">Loading submissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6 my-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-rose-500/20 rounded-full flex items-center justify-center">
            <XCircle className="text-rose-400" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-rose-400">Error</h3>
            <p className="text-slate-300 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Submission History
        </h2>
        <span className="px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300">
          {submissions.length} {submissions.length === 1 ? 'submission' : 'submissions'}
        </span>
      </div>
      
      {submissions.length === 0 ? (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center">
              <Code2 className="text-slate-500" size={32} />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Submissions Yet</h3>
          <p className="text-slate-400 text-sm">Your submission history will appear here once you submit a solution.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub, index) => {
            const statusConfig = getStatusConfig(sub.status);
            return (
              <div
                key={sub._id}
                className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-4 hover:border-purple-500/30 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  {/* Left Section - Status and Language */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-slate-800/50 rounded-lg text-slate-400 font-mono text-sm">
                      #{index + 1}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${statusConfig.color}`}>
                        {statusConfig.icon}
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </span>
                      
                      <span className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs font-mono text-slate-300">
                        {sub.language}
                      </span>
                    </div>
                  </div>

                  {/* Middle Section - Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Zap className="text-amber-400" size={16} />
                      <span className="text-slate-400">Runtime:</span>
                      <span className="font-mono text-white">{sub.runtime}s</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Database className="text-blue-400" size={16} />
                      <span className="text-slate-400">Memory:</span>
                      <span className="font-mono text-white">{formatMemory(sub.memory)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-emerald-400" size={16} />
                      <span className="text-slate-400">Tests:</span>
                      <span className="font-mono text-white">{sub.testCasesPassed}/{sub.testCasesTotal}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="text-purple-400" size={16} />
                      <span className="text-slate-400">{formatDate(sub.createdAt)}</span>
                    </div>
                  </div>

                  {/* Right Section - Action Button */}
                  <button 
                    onClick={() => setSelectedSubmission(sub)}
                    className="px-4 py-2 bg-slate-800/50 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 border border-slate-700/50 hover:border-transparent rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-all duration-200 flex items-center gap-2"
                  >
                    <Code2 size={16} />
                    View Code
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Code View Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-5xl">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-30 blur-xl"></div>
            
            {/* Modal content */}
            <div className="relative bg-slate-900 rounded-2xl border border-slate-800/50 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Submission Details</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm font-mono text-slate-300">
                      {selectedSubmission.language}
                    </span>
                    {(() => {
                      const config = getStatusConfig(selectedSubmission.status);
                      return (
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold border flex items-center gap-1.5 ${config.color}`}>
                          {config.icon}
                          {selectedSubmission.status}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="w-10 h-10 flex items-center justify-center bg-slate-800/50 hover:bg-slate-700/50 rounded-full transition-colors duration-200"
                >
                  <X className="text-slate-400" size={20} />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 p-6 border-b border-slate-800/50 bg-slate-800/30">
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Runtime</div>
                  <div className="text-lg font-mono font-semibold text-white">{selectedSubmission.runtime}s</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Memory</div>
                  <div className="text-lg font-mono font-semibold text-white">{formatMemory(selectedSubmission.memory)}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Test Cases</div>
                  <div className="text-lg font-mono font-semibold text-white">{selectedSubmission.testCasesPassed}/{selectedSubmission.testCasesTotal}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Submitted</div>
                  <div className="text-sm font-semibold text-white">{formatDate(selectedSubmission.createdAt)}</div>
                </div>
              </div>

              {/* Error Message */}
              {selectedSubmission.errorMessage && (
                <div className="mx-6 mt-6 bg-rose-500/10 border border-rose-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-rose-400 flex-shrink-0" size={20} />
                    <div>
                      <h4 className="font-semibold text-rose-400 mb-1">Error</h4>
                      <p className="text-sm text-slate-300">{selectedSubmission.errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Code */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="bg-slate-950/50 rounded-xl border border-slate-800/50 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-800/50">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <div className="ml-2 text-xs text-slate-400 font-mono">
                      {selectedSubmission.language}.{selectedSubmission.language === 'javascript' ? 'js' : selectedSubmission.language === 'cpp' ? 'cpp' : 'java'}
                    </div>
                  </div>
                  <pre className="p-6 text-sm overflow-x-auto">
                    <code className="text-slate-300 font-mono">{selectedSubmission.code}</code>
                  </pre>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-800/50 bg-slate-800/30">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/30"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

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

export default SubmissionHistory;