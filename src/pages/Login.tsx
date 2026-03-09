import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Terminal, Mail, Lock, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) return;

        setStatus('loading');
        setErrorMsg('');

        let error;
        if (isSignUp) {
            const res = await signUp(email.trim(), password);
            error = res.error;
        } else {
            const res = await signIn(email.trim(), password);
            error = res.error;
        }

        if (error) {
            setStatus('error');
            setErrorMsg(error);
        } else {
            if (isSignUp) {
                setStatus('success');
            } else {
                setStatus('idle');
                navigate('/dashboard', { replace: true });
            }
        }
    };

    return (
        <div className="min-h-full flex items-center justify-center p-6 animate-fadeIn">
            <div className="w-full max-w-md">
                {/* Terminal Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-sm border border-forge-green/30 bg-forge-green/5 mb-4">
                        <Terminal className="w-8 h-8 text-forge-green" />
                    </div>
                    <h1 className="text-2xl font-bold text-forge-green glow-text-green tracking-wider">AlgoForge</h1>
                    <p className="text-xs text-forge-text mt-2 tracking-widest uppercase">
                        Competitive Programming Prep
                    </p>
                </div>

                {/* Login Card */}
                <div className="terminal-card">
                    {/* Terminal-style prompt */}
                    <div className="flex items-center gap-2 text-xs text-forge-text mb-6 pb-3 border-b border-forge-border">
                        <span className="text-forge-green">$</span>
                        <span>forge auth --method password --type {isSignUp ? 'signup' : 'signin'}</span>
                        <span className="animate-blink text-forge-green ml-1">▊</span>
                    </div>

                    {status === 'success' && isSignUp ? (
                        /* Success state */
                        <div className="text-center py-6">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-sm border border-forge-green/30 bg-forge-green/10 mb-4">
                                <CheckCircle className="w-6 h-6 text-forge-green" />
                            </div>
                            <h2 className="text-sm font-bold text-forge-green mb-2">Account Created!</h2>
                            <p className="text-xs text-forge-text leading-relaxed">
                                Please check your email inbox to verify your account before logging in.
                            </p>
                            <button
                                onClick={() => { setStatus('idle'); setIsSignUp(false); setPassword(''); }}
                                className="mt-4 px-4 py-2 border border-forge-border rounded-sm text-xs text-forge-text hover:text-forge-green transition-colors"
                            >
                                Return to Log In
                            </button>
                        </div>
                    ) : (
                        /* Form */
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="flex items-center gap-2 text-xs text-forge-text uppercase tracking-wider mb-2">
                                    <Mail className="w-3 h-3" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="terminal-input w-full"
                                    placeholder="you@university.edu"
                                    required
                                    disabled={status === 'loading'}
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-xs text-forge-text uppercase tracking-wider mb-2">
                                    <Lock className="w-3 h-3" />
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="terminal-input w-full font-mono"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    disabled={status === 'loading'}
                                />
                            </div>

                            {status === 'error' && (
                                <div className="flex items-center gap-2 p-2.5 bg-forge-red/10 border border-forge-red/30 rounded-sm text-xs text-forge-red">
                                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'loading' || !email.trim() || !password.trim()}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-forge-green/10 border border-forge-green text-forge-green rounded-sm hover:bg-forge-green/20 hover:shadow-glow-green transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {status === 'loading' ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {isSignUp ? 'Creating account...' : 'Authenticating...'}
                                    </>
                                ) : (
                                    <>
                                        {isSignUp ? 'Sign Up' : 'Sign In'}
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>

                            <p className="text-[10px] text-forge-text text-center leading-relaxed mt-2 pt-2 border-t border-forge-border/30">
                                {isSignUp ? 'Already have an account?' : 'Need an account?'}
                                <button
                                    type="button"
                                    onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
                                    className="ml-1 text-forge-blue hover:underline"
                                >
                                    {isSignUp ? 'Sign In' : 'Sign Up'}
                                </button>
                            </p>

                            {!isSupabaseConfigured() && (
                                <div className="flex items-start gap-2 p-2.5 bg-forge-amber/5 border border-forge-amber/20 rounded-sm text-[10px] text-forge-amber">
                                    <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                    <span>Supabase not configured — running in demo mode. Form validation works locally.</span>
                                </div>
                            )}
                        </form>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-[10px] text-forge-text mt-6">
                    <span className="text-forge-green">●</span> AlgoForge v1.0 — 100 curated problems loaded
                </p>
            </div>
        </div>
    );
}
