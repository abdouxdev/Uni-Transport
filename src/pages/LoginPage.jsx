import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { Bus, Shield, GraduationCap, Copy, Check, EyeOff, Eye, LogIn } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.prenom}!`);
      if (user.role === 'student') navigate('/student-dashboard');
      else navigate('/');
    } catch (err) {
      setError(t.auth.invalidCredentials);
      toast.error(t.auth.invalidCredentials);
    } finally {
      setLoading(false);
    }
  };

  const autofill = (e, p) => { setEmail(e); setPassword(p); };

  const CopyBtn = ({ text }) => {
    const [copied, setCopied] = useState(false);
    return (
      <button type="button" onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-muted hover:text-foreground">
        {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
      </button>
    );
  };

  return (
    <div className="min-h-screen flex">
      {/* Brand Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-primary to-accent flex-col justify-between p-12 relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
            <Bus size={24} />
          </div>
          <div>
            <div className="font-bold text-xl leading-none">UniTransport</div>
            <div className="text-blue-200 text-sm">USTHB — Faculté d'Informatique</div>
          </div>
        </div>
        
        <div className="relative z-10 space-y-6">
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight">University Transport<br />Management System</h1>
          <p className="text-blue-100 text-lg max-w-md leading-relaxed">Professional SaaS platform to manage student subscriptions, schedules, bus allocations, and real-time incidents.</p>
          
          <div className="space-y-3 pt-6">
            {[
              { icon: GraduationCap, text: 'Manage 30k+ student subscriptions' },
              { icon: Bus, text: 'Real-time bus & line monitoring' },
              { icon: Shield, text: 'Role-based access control (RBAC)' }
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/10 w-max">
                <f.icon size={18} className="text-blue-200" />
                <span className="font-medium text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-blue-200/80">
          Academic Year 2025–2026 · Supervised by Dr. LAHRECHE Abdelmadjid
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-background">
        <div className="w-full max-w-md">
          
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-foreground">{t.auth.signInTitle}</h2>
            <p className="text-muted mt-2">{t.auth.signInSub}</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-danger px-4 py-3 rounded-xl flex items-center gap-3 animate-slide-up">
              <AlertTriangle size={18} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">{t.auth.emailLabel}</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-alt border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                placeholder="nom.prenom@usthb.dz" />
            </div>
            
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-semibold text-foreground">{t.auth.passwordLabel}</label>
                <button type="button" className="text-xs text-primary font-medium hover:underline">{t.auth.forgotPassword}</button>
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-alt border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer" />
              <label htmlFor="remember" className="text-sm text-foreground cursor-pointer select-none">{t.auth.rememberMe}</label>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70">
              {loading ? <div className="spinner w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <><LogIn size={18} /> {t.auth.signIn}</>}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-10">
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-semibold text-muted uppercase tracking-wider">{t.auth.demoAccounts}</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <div className="space-y-3">
              {[
                { role: t.auth.admin, email: 'a.amrani@usthb.dz', pass: 'Admin@USTHB2026', icon: Shield, bg: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
                { role: t.auth.manager, email: 'n.ouali.manager@usthb.dz', pass: 'Manager@Trans26', icon: Bus, bg: 'bg-sky-50 border-sky-200 text-sky-700' },
                { role: t.auth.student, email: 'k.benali@etu.usthb.dz', pass: 'Student@2026!', icon: GraduationCap, bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' }
              ].map((acc, i) => (
                <div key={i} className={`p-3 rounded-xl border flex items-center justify-between transition-transform hover:-translate-y-0.5 cursor-pointer ${acc.bg}`} onClick={() => autofill(acc.email, acc.pass)}>
                  <div className="flex gap-3">
                    <div className="mt-0.5"><acc.icon size={16} /></div>
                    <div>
                      <div className="font-bold text-xs">{acc.role}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[10px] opacity-80">{acc.email}</span>
                        <CopyBtn text={acc.email} />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] opacity-80">••••••••</span>
                        <CopyBtn text={acc.pass} />
                      </div>
                    </div>
                  </div>
                  <button className="text-xs font-bold px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 transition-colors">Use</button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
