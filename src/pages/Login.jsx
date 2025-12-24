import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { supabase } from '../supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  
  const { signIn, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/santri');
    } catch (err) {
      setError(err.message || 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat mengirim email reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="absolute inset-0 bg-grid-slate-800/[0.04] bg-[size:20px_20px]" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Glassmorphism Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Logo/Header */}
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-4xl text-white">📘</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {resetMode ? 'Reset Password' : 'Selamat Datang'}
            </h1>
            <p className="text-slate-300">
              {resetMode 
                ? 'Kami akan mengirim link reset ke email Anda' 
                : 'Silakan masuk ke akun Anda'
              }
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 animate-fade-in">
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-400 text-lg">!</span>
                </div>
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            </div>
          )}

          {resetSent && (
            <div className="mb-6 animate-fade-in">
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl backdrop-blur-sm">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-emerald-200 font-medium">Email Terkirim!</p>
                  <p className="text-emerald-300/80 text-sm mt-1">
                    Cek inbox email Anda untuk link reset password.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          {!resetMode ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 text-white placeholder-slate-400 transition-all duration-200"
                    placeholder="admin@pondok.com"
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 text-white placeholder-slate-400 transition-all duration-200 pr-12"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-white/90">Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk</span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setResetMode(true)}
                  className="w-full text-sm text-blue-300 hover:text-blue-200 font-medium transition-colors py-2"
                >
                  Lupa password?
                </button>
              </div>
            </form>
          ) : (
            /* Reset Password Form */
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 text-white placeholder-slate-400 transition-all duration-200"
                    placeholder="admin@pondok.com"
                    disabled={loading || resetSent}
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setResetMode(false);
                    setResetSent(false);
                    setResetEmail('');
                  }}
                  className="flex-1 py-3.5 border border-white/10 text-slate-300 font-medium rounded-xl hover:bg-white/5 transition-all duration-200 disabled:opacity-50"
                  disabled={loading}
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={loading || resetSent}
                  className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Mengirim...</span>
                    </>
                  ) : resetSent ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Terkirim</span>
                    </>
                  ) : (
                    'Kirim Link Reset'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Demo Info */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-3">
                Untuk demo, gunakan kredensial berikut:
              </p>
              <div className="p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-300 text-sm">Email:</span>
                  <code className="text-sm font-mono text-blue-300 bg-blue-500/10 px-3 py-1 rounded">
                    admin@pondok.com
                  </code>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-white/10">
                  <span className="text-slate-300 text-sm">Password:</span>
                  <code className="text-sm font-mono text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded">
                    app
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Pondok Pesantren. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}