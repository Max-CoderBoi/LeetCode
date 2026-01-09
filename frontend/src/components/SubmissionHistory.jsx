import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import { CheckCircle, XCircle, AlertCircle, Clock, Code2, Calendar, Zap, Database, X, TrendingUp, Award } from 'lucide-react';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filter, setFilter] = useState('all');

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
    const configs = {
      accepted: {
        color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        icon: <CheckCircle size={14} />,
        label: 'Accepted'
      },
      wrong: {
        color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        icon: <XCircle size={14} />,
        label: 'Wrong Answer'
      },
      error: {
        color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        icon: <AlertCircle size={14} />,
        label: 'Runtime Error'
      },
      pending: {
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        icon: <Clock size={14} />,
        label: 'Pending'
      }
    };
    return configs[status] || configs.error;
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

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStats = () => {
    const total = submissions.length;
    const accepted = submissions.filter(s => s.status === 'accepted').length;
    const avgRuntime = submissions.reduce((acc, s) => acc + parseFloat(s.runtime), 0) / total;
    return { total, accepted, avgRuntime: avgRuntime.toFixed(3), successRate: total ? ((accepted / total) * 100).toFixed(1) : 0 };
  };

  const filteredSubmissions = filter === 'all' 
    ? submissions 
    : submissions.filter(s => s.status === filter);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 border-4 border-pink-500/30 border-b-pink-500 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
        </div>
        <p className="text-slate-400 mt-4 text-sm">Loading submissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center">
            <XCircle className="text-rose-400" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-rose-400">Error Loading Submissions</h3>
            <p className="text-slate-400 text-sm mt-0.5">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Submission History
          </h2>
          <span className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 font-medium">
            {stats.total} {stats.total === 1 ? 'submission' : 'submissions'}
          </span>
        </div>

        {/* Stats Cards */}
        {submissions.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Award size={14} />
                Success Rate
              </div>
              <div className="text-2xl font-bold text-emerald-400">{stats.successRate}%</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <CheckCircle size={14} />
                Accepted
              </div>
              <div className="text-2xl font-bold text-white">{stats.accepted}</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <TrendingUp size={14} />
                Avg Runtime
              </div>
              <div className="text-2xl font-bold text-amber-400">{stats.avgRuntime}s</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <XCircle size={14} />
                Failed
              </div>
              <div className="text-2xl font-bold text-rose-400">{stats.total - stats.accepted}</div>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        {submissions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {['all', 'accepted', 'wrong', 'error', 'pending'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === status
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {filteredSubmissions.length === 0 ? (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center">
              <Code2 className="text-slate-500" size={32} />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {filter === 'all' ? 'No Submissions Yet' : `No ${filter} submissions`}
          </h3>
          <p className="text-slate-400 text-sm">
            {filter === 'all' 
              ? 'Your submission history will appear here once you submit a solution.'
              : `You don't have any ${filter} submissions for this problem.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubmissions.map((sub, index) => {
            const statusConfig = getStatusConfig(sub.status);
            return (
              <div
                key={sub._id}
                className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-4 hover:border-purple-500/30 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedSubmission(sub)}
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  {/* Left - Status & Language */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-800/50 rounded-lg flex items-center justify-center text-slate-400 font-mono text-xs">
                      #{submissions.indexOf(sub) + 1}
                    </div>
                    
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${statusConfig.color}`}>
                      {statusConfig.icon}
                      {statusConfig.label}
                    </span>
                    
                    <span className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs font-mono text-slate-300">
                      {sub.language}
                    </span>
                  </div>

                  {/* Middle - Stats */}
                  <div className="flex items-center gap-4 text-xs flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Zap className="text-amber-400" size={14} />
                      <span className="text-slate-400">Runtime:</span>
                      <span className="font-mono text-white font-medium">{sub.runtime}s</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <Database className="text-blue-400" size={14} />
                      <span className="text-slate-400">Memory:</span>
                      <span className="font-mono text-white font-medium">{formatMemory(sub.memory)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="text-emerald-400" size={14} />
                      <span className="text-slate-400">Tests:</span>
                      <span className="font-mono text-white font-medium">{sub.testCasesPassed}/{sub.testCasesTotal}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar size={14} />
                      {formatDate(sub.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Code View Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-20 blur-xl"></div>
            
            <div className="relative bg-slate-900 rounded-2xl border border-slate-800/50 shadow-2xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-800/50 bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white">Submission Details</h3>
                  <span className="px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm font-mono text-slate-300">
                    {selectedSubmission.language}
                  </span>
                  {(() => {
                    const config = getStatusConfig(selectedSubmission.status);
                    return (
                      <span className={`px-3 py-1 rounded-lg text-sm font-semibold border flex items-center gap-1.5 ${config.color}`}>
                        {config.icon}
                        {config.label}
                      </span>
                    );
                  })()}
                </div>
                
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="w-10 h-10 flex items-center justify-center bg-slate-800/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="text-slate-400" size={20} />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 p-6 border-b border-slate-800/50 bg-slate-800/20">
                {[
                  { label: 'Runtime', value: `${selectedSubmission.runtime}s`, icon: <Zap size={16} className="text-amber-400" /> },
                  { label: 'Memory', value: formatMemory(selectedSubmission.memory), icon: <Database size={16} className="text-blue-400" /> },
                  { label: 'Test Cases', value: `${selectedSubmission.testCasesPassed}/${selectedSubmission.testCasesTotal}`, icon: <CheckCircle size={16} className="text-emerald-400" /> },
                  { label: 'Submitted', value: formatDate(selectedSubmission.createdAt), icon: <Calendar size={16} className="text-purple-400" /> }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mb-2">
                      {stat.icon}
                      {stat.label}
                    </div>
                    <div className="text-lg font-mono font-semibold text-white">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Error Message */}
              {selectedSubmission.errorMessage && (
                <div className="mx-6 mt-6 bg-rose-500/10 border border-rose-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-rose-400 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <h4 className="font-semibold text-rose-400 text-sm mb-1">Error Message</h4>
                      <p className="text-sm text-slate-300 font-mono">{selectedSubmission.errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Code */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="bg-slate-950/50 rounded-xl border border-slate-800/50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        solution.{selectedSubmission.language === 'javascript' ? 'js' : selectedSubmission.language === 'cpp' ? 'cpp' : 'java'}
                      </span>
                    </div>
                  </div>
                  <pre className="p-6 text-sm overflow-x-auto leading-relaxed">
                    <code className="text-slate-300 font-mono">{selectedSubmission.code}</code>
                  </pre>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-800/50 bg-slate-800/20">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition-all hover:shadow-lg hover:shadow-purple-500/30"
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
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(168, 85, 247, 0.4); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(168, 85, 247, 0.6); }
      `}</style>
    </div>
  );
};

export default SubmissionHistory;