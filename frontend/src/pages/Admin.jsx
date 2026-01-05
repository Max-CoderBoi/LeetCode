import React, { useState } from 'react';
import { Plus, Edit, Trash2, Video, Shield, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router';

function Admin() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform',
      icon: Plus,
      gradient: 'from-emerald-600 to-teal-600',
      hoverGradient: 'from-emerald-500 to-teal-500',
      glowColor: 'emerald',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems and their details',
      icon: Edit,
      gradient: 'from-amber-600 to-orange-600',
      hoverGradient: 'from-amber-500 to-orange-500',
      glowColor: 'amber',
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Remove problems from the platform',
      icon: Trash2,
      gradient: 'from-rose-600 to-pink-600',
      hoverGradient: 'from-rose-500 to-pink-500',
      glowColor: 'rose',
      route: '/admin/delete'
    },
    {
      id: 'video',
      title: 'Video Management',
      description: 'Upload and manage video tutorials',
      icon: Video,
      gradient: 'from-purple-600 to-blue-600',
      hoverGradient: 'from-purple-500 to-blue-500',
      glowColor: 'purple',
      route: '/admin/video'
    }
  ];

  const getGlowClass = (color) => {
    const glowMap = {
      emerald: 'shadow-emerald-500/30 hover:shadow-emerald-500/50',
      amber: 'shadow-amber-500/30 hover:shadow-amber-500/50',
      rose: 'shadow-rose-500/30 hover:shadow-rose-500/50',
      purple: 'shadow-purple-500/30 hover:shadow-purple-500/50'
    };
    return glowMap[color] || 'shadow-purple-500/30 hover:shadow-purple-500/50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16 relative">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -z-10"></div>
          
          {/* Shield Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-50"></div>
              <div className="relative w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
                <Shield className="text-white" size={40} />
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Manage coding problems, video tutorials, and platform content with powerful admin tools
          </p>
          
        
         
        </div>

        {/* Admin Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {adminOptions.map((option) => {
            const IconComponent = option.icon;
            const isHovered = hoveredCard === option.id;
            
            return (
              <div
                key={option.id}
                onMouseEnter={() => setHoveredCard(option.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group relative"
              >
                {/* Glow effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${option.gradient} rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500`}></div>
                
                {/* Card */}
                <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/50 overflow-hidden transition-all duration-300 hover:border-slate-700/50 h-full">
                  {/* Animated background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  
                  <div className="relative p-8">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                      <div className={`relative w-20 h-20 bg-gradient-to-br ${option.gradient} rounded-2xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${getGlowClass(option.glowColor)} shadow-xl`}>
                        <IconComponent className="text-white" size={36} />
                        
                        {/* Sparkle effect on hover */}
                        {isHovered && (
                          <div className="absolute -top-1 -right-1 animate-ping">
                            <Sparkles className="text-white" size={16} />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-white mb-3">
                        {option.title}
                      </h2>
                      <p className="text-slate-400 leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                    
                    {/* Action Button */}
                    <NavLink 
                      to={option.route}
                      className={`block w-full px-6 py-3 bg-gradient-to-r ${isHovered ? option.hoverGradient : option.gradient} text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 text-center ${getGlowClass(option.glowColor)} shadow-lg`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        Get Started
                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </NavLink>
                  </div>

                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-400">All systems operational</span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 max-w-3xl mx-auto">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Shield className="text-blue-400" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-blue-400 mb-2">Security Notice</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  All admin actions are logged and monitored. Please ensure you have proper authorization before making changes to the platform. Unauthorized access or misuse may result in account suspension.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}

export default Admin;