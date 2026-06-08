import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { ArrowRight, Lock } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await login(email, password);
      toast.success("Welcome back!");
      navigate(user.role === "admin" ? "/admin" : from);
    } catch (e2) {
      const msg = formatApiError(e2.response?.data?.detail) || "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-[calc(100vh-200px)] py-16 lg:py-24" data-testid="login-page">
      <div className="container-drj max-w-md">
        <div className="bg-white border border-[var(--drj-line)] p-8 lg:p-10">
          <div className="text-overline text-gold mb-3 flex items-center gap-2"><Lock size={14}/> Account</div>
          <h1 className="font-serif text-4xl text-forest tracking-tight">{t.auth.login_title}</h1>
          <p className="text-sm text-[var(--drj-ink-muted)] font-light mt-2">{t.auth.login_sub}</p>

          <form onSubmit={submit} className="mt-8 space-y-6" data-testid="login-form">
            <div>
              <div className="text-overline text-[var(--drj-ink-muted)] mb-1">{t.auth.email}</div>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-luxe" data-testid="login-email"/>
            </div>
            <div>
              <div className="text-overline text-[var(--drj-ink-muted)] mb-1">{t.auth.password}</div>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-luxe" data-testid="login-password"/>
            </div>
            {error && <div className="text-sm text-red-700" data-testid="login-error">{error}</div>}
            <button disabled={loading} className="btn-primary w-full justify-center" data-testid="login-submit">
              {loading ? "Signing in..." : t.auth.sign_in} <ArrowRight size={16}/>
            </button>
          </form>

          <div className="mt-6 text-sm text-[var(--drj-ink-muted)] flex justify-between">
            <span>{t.auth.no_account}</span>
            <Link to="/register" className="text-forest font-medium hover:text-gold" data-testid="login-go-register">{t.auth.sign_up}</Link>
          </div>
        </div>
        <p className="text-[11px] text-center text-[var(--drj-ink-muted)] mt-6">
          Demo: <span className="text-forest">admin@dharmarajayurveda.in / Dharmaraj@2026</span>
        </p>
      </div>
    </div>
  );
}
