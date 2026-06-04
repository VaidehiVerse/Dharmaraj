import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { ArrowRight, UserPlus } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", mobile: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(form);
      toast.success("Welcome to Dharmaraj!");
      navigate("/account");
    } catch (e2) {
      const msg = formatApiError(e2.response?.data?.detail) || "Registration failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-[calc(100vh-200px)] py-16 lg:py-24" data-testid="register-page">
      <div className="container-drj max-w-md">
        <div className="bg-white border border-[var(--drj-line)] p-8 lg:p-10">
          <div className="text-overline text-gold mb-3 flex items-center gap-2"><UserPlus size={14}/> Sign Up</div>
          <h1 className="font-serif text-4xl text-forest tracking-tight">{t.auth.register_title}</h1>
          <p className="text-sm text-[var(--drj-ink-muted)] font-light mt-2">{t.auth.register_sub}</p>

          <form onSubmit={submit} className="mt-8 space-y-6" data-testid="register-form">
            <Field label={t.auth.name} value={form.name} onChange={(v) => setForm({...form, name: v})} testId="register-name"/>
            <Field type="email" label={t.auth.email} value={form.email} onChange={(v) => setForm({...form, email: v})} testId="register-email"/>
            <Field label={t.auth.mobile} required={false} value={form.mobile} onChange={(v) => setForm({...form, mobile: v})} testId="register-mobile"/>
            <Field type="password" label={t.auth.password} value={form.password} onChange={(v) => setForm({...form, password: v})} testId="register-password"/>
            {error && <div className="text-sm text-red-700" data-testid="register-error">{error}</div>}
            <button disabled={loading} className="btn-primary w-full justify-center" data-testid="register-submit">
              {loading ? "Creating account..." : t.auth.sign_up} <ArrowRight size={16}/>
            </button>
          </form>

          <div className="mt-6 text-sm text-[var(--drj-ink-muted)] flex justify-between">
            <span>{t.auth.have_account}</span>
            <Link to="/login" className="text-forest font-medium hover:text-gold" data-testid="register-go-login">{t.auth.sign_in}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const Field = ({ label, value, onChange, type = "text", testId, required = true }) => (
  <div>
    <div className="text-overline text-[var(--drj-ink-muted)] mb-1">{label}</div>
    <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="input-luxe" data-testid={testId}/>
  </div>
);
