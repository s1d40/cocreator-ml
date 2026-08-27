import React, { useState } from 'react';
import { Lock, Mail, KeyRound, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { signIn, signUp, signInGoogle, sendPasswordReset } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      if (isForgot) {
        if (!email.trim()) {
          throw new Error('Por favor, informe seu e-mail para recuperar a senha.');
        }
        await sendPasswordReset(email.trim());
        setInfoMessage('Instruções de recuperação enviadas para o seu e-mail.');
      } else if (isSignUp) {
        if (!email.trim() || !password.trim()) {
          throw new Error('Preencha todos os campos para se cadastrar.');
        }
        await signUp(email.trim(), password);
      } else {
        if (!email.trim() || !password.trim()) {
          throw new Error('Preencha seu e-mail e senha.');
        }
        await signIn(email.trim(), password);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Erro ao autenticar. Verifique suas credenciais.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) {
        msg = 'E-mail ou senha incorretos.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'Este e-mail já está cadastrado. Faça login.';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'A senha deve conter no mínimo 6 caracteres.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setInfoMessage(null);
    setLoading(true);
    try {
      await signInGoogle();
    } catch (err: any) {
      console.error('Google Auth error:', err);
      setError(err.message || 'Falha ao autenticar com o Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A10] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <div className="max-w-md w-full space-y-8 bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header Branding */}
        <div className="text-center space-y-3 relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-500 to-orange-500 shadow-xl shadow-amber-500/20 text-slate-950 mb-1">
            <Lock className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-amber-400">
              CoCreator Intelligence Hub
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Acesso restrito &middot; Plataforma Corporativa Protegida
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4 relative z-10" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              E-mail Corporativo
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu-email@dominio.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {!isForgot && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgot(true);
                    setError(null);
                    setInfoMessage(null);
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <span className="inline-block animate-spin w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full"></span>
            ) : (
              <>
                <span>{isForgot ? 'Enviar Link de Recuperação' : isSignUp ? 'Criar Conta de Acesso' : 'Entrar na Plataforma'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {!isForgot && (
            <>
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-800 w-full"></div>
                <span className="bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500 absolute">
                  ou
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 disabled:opacity-50 text-slate-200 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continuar com Google</span>
              </button>
            </>
          )}

          <div className="pt-4 text-center">
            {isForgot ? (
              <button
                type="button"
                onClick={() => {
                  setIsForgot(false);
                  setError(null);
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                Voltar para o Login
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-xs text-slate-400 hover:text-white transition"
              >
                {isSignUp ? (
                  <>Já tem acesso? <strong className="text-amber-400 font-bold">Faça login</strong></>
                ) : (
                  <>Primeiro acesso? <strong className="text-amber-400 font-bold">Criar conta</strong></>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Security Footer Notice */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Ambiente Autenticado & Criptografado &middot; CoCreator SaaS</span>
        </div>
      </div>
    </div>
  );
};
