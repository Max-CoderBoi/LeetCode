import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all' 
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch = filters.status === 'all' || 
                      (filters.status === 'solved' && solvedProblems.some(sp => sp._id === problem._id));
    const searchMatch = searchQuery === '' || 
                       problem.title.toLowerCase().includes(searchQuery.toLowerCase());
    return difficultyMatch && tagMatch && statusMatch && searchMatch;
  });

  const stats = {
    total: problems.length,
    solved: solvedProblems.length,
    easy: problems.filter(p => p.difficulty === 'easy').length,
    medium: problems.filter(p => p.difficulty === 'medium').length,
    hard: problems.filter(p => p.difficulty === 'hard').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300">
      {/* Enhanced Navigation Bar */}
      <nav className="navbar bg-base-100 shadow-xl px-6 sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
        <div className="flex-1 min-w-0">
          <NavLink to="/" className="btn btn-ghost text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            LeetCode
          </NavLink>
        </div>
        
        <div className="flex-none mx-4 hidden md:flex">
          <div className="form-control w-96">
            <div className="flex">
              <input 
                type="text" 
                placeholder="Search problems..." 
                className="input input-bordered flex-1 rounded-r-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-square btn-primary rounded-l-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 flex justify-end">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                <span className="text-lg font-semibold">{user?.firstName?.charAt(0)}</span>
              </div>
            </div>
            <ul className="mt-3 p-2 shadow-xl menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-300">
              <li className="menu-title px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="avatar">
                    <div className="w-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
                      <span className="text-sm font-semibold">{user?.firstName?.charAt(0)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">{user?.firstName}</div>
                    <div className="text-xs opacity-60">{user?.email}</div>
                  </div>
                </div>
              </li>
              <div className="divider my-0"></div>
              <li><button onClick={handleLogout}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button></li>
              {user?.role === 'admin' && (
                <li><NavLink to="/admin">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Admin Panel
                </NavLink></li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body p-4">
              <div className="text-sm text-base-content/60">Total</div>
              <div className="text-3xl font-bold text-primary">{stats.total}</div>
            </div>
          </div>
          <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body p-4">
              <div className="text-sm text-base-content/60">Solved</div>
              <div className="text-3xl font-bold text-success">{stats.solved}</div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-success/10 to-success/5 shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body p-4">
              <div className="text-sm text-success font-medium">Easy</div>
              <div className="text-3xl font-bold text-success">{stats.easy}</div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-warning/10 to-warning/5 shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body p-4">
              <div className="text-sm text-warning font-medium">Medium</div>
              <div className="text-3xl font-bold text-warning">{stats.medium}</div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-error/10 to-error/5 shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body p-4">
              <div className="text-sm text-error font-medium">Hard</div>
              <div className="text-3xl font-bold text-error">{stats.hard}</div>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mb-4">
          <input 
            type="text" 
            placeholder="Search problems..." 
            className="input input-bordered w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Enhanced Filters */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body p-4">
            <div className="flex flex-wrap gap-3">
              <select 
                className="select select-bordered select-sm md:select-md flex-1 min-w-[150px]"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">All Status</option>
                <option value="solved">✓ Solved</option>
              </select>

              <select 
                className="select select-bordered select-sm md:select-md flex-1 min-w-[150px]"
                value={filters.difficulty}
                onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <select 
                className="select select-bordered select-sm md:select-md flex-1 min-w-[150px]"
                value={filters.tag}
                onChange={(e) => setFilters({...filters, tag: e.target.value})}
              >
                <option value="all">All Tags</option>
                <option value="array">Array</option>
                <option value="linkedList">Linked List</option>
                <option value="graph">Graph</option>
                <option value="dp">Dynamic Programming</option>
              </select>

              {(filters.status !== 'all' || filters.difficulty !== 'all' || filters.tag !== 'all' || searchQuery !== '') && (
                <button 
                  className="btn btn-ghost btn-sm md:btn-md"
                  onClick={() => {
                    setFilters({ difficulty: 'all', tag: 'all', status: 'all' });
                    setSearchQuery('');
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div className="space-y-3">
          {filteredProblems.length === 0 ? (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center py-16">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-base-content/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-base-content/60">No problems found matching your filters</p>
              </div>
            </div>
          ) : (
            filteredProblems.map(problem => (
              <div key={problem._id} className="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                <div className="card-body p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <NavLink 
                            to={`/problem/${problem._id}`} 
                            className="text-lg md:text-xl font-semibold hover:text-primary transition-colors"
                          >
                            {problem.title}
                          </NavLink>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <div className={`badge ${getDifficultyBadgeColor(problem.difficulty)} badge-lg font-medium`}>
                              {problem.difficulty}
                            </div>
                            <div className="badge badge-outline badge-lg">
                              {problem.tags}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {solvedProblems.some(sp => sp._id === problem._id) && (
                      <div className="badge badge-success gap-2 badge-lg font-medium self-start md:self-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Solved
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'badge-success';
    case 'medium': return 'badge-warning';
    case 'hard': return 'badge-error';
    default: return 'badge-neutral';
  }
};

export default Homepage;