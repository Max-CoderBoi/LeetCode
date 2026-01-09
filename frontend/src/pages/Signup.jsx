import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../authSlice';
import { Check, X } from 'lucide-react';

const signupSchema = z.object({
  firstName: z.string().min(3, "Min 3 characters"),
  emailId: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters")
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => dispatch(registerUser(data));

  const passwordChecks = {
    minLength: passwordValue.length >= 8,
    hasNumber: /\d/.test(passwordValue),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue),
    hasUpperCase: /[A-Z]/.test(passwordValue)
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-800/50">
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-3 mb-3 shadow-lg shadow-purple-500/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Create Account
              </h2>
            </div>

            <div className="space-y-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  className={`w-full px-4 py-2.5 bg-slate-800/50 border ${
                    errors.firstName ? 'border-red-500' : 'border-slate-700/50'
                  } text-white placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 focus:outline-none transition-all`}
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <span className="text-red-400 text-xs mt-1 block">{errors.firstName.message}</span>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className={`w-full px-4 py-2.5 bg-slate-800/50 border ${
                    errors.emailId ? 'border-red-500' : 'border-slate-700/50'
                  } text-white placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 focus:outline-none transition-all`}
                  {...register('emailId')}
                />
                {errors.emailId && (
                  <span className="text-red-400 text-xs mt-1 block">{errors.emailId.message}</span>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full px-4 py-2.5 pr-10 bg-slate-800/50 border ${
                      errors.password ? 'border-red-500' : 'border-slate-700/50'
                    } text-white placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 focus:outline-none transition-all`}
                    {...register('password', {
                      onChange: (e) => setPasswordValue(e.target.value)
                    })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmit(onSubmit)();
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-red-400 text-xs mt-1 block">{errors.password.message}</span>
                )}
                
                {/* Compact Password Checks */}
                {passwordValue && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {[
                      { key: 'minLength', label: '8+ chars' },
                      { key: 'hasNumber', label: 'Number' },
                      { key: 'hasSpecialChar', label: 'Special' },
                      { key: 'hasUpperCase', label: 'Uppercase' }
                    ].map(({ key, label }) => (
                      <span
                        key={key}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded transition-all ${
                          passwordChecks[key]
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-slate-700/50 text-slate-500'
                        }`}
                      >
                        {passwordChecks[key] ? <Check size={12} /> : <X size={12} />}
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit(onSubmit)}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            {/* Login Link */}
            <div className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <NavLink to="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                Sign in
              </NavLink>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-4">
          By signing up, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}

export default Signup;