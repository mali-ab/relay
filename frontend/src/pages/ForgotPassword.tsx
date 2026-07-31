import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  EnvelopeIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

import AuthLayout from "../layouts/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      setError("Пожалуйста, введите адрес электронной почты.");
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate API call delay (UI only)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Проверьте почту
            </h2>
            <p className="text-sm text-slate-500 mt-3 font-medium leading-relaxed">
              Мы отправили инструкции по восстановлению пароля на{" "}
              <span className="text-slate-700 font-semibold">{email}</span>
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Если письмо не пришло, проверьте папку "Спам".
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-blue-500/25 transition duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Вернуться к входу</span>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Забыли пароль?
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Введите email, и мы отправим вам инструкции по восстановлению
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm">
            <ExclamationCircleIcon className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Электронная почта
            </label>
            <div className="relative flex items-center">
              <EnvelopeIcon className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@relay.com"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-blue-500/25 transition duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                <span>Отправка...</span>
              </>
            ) : (
              <span>Отправить инструкции</span>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-sm font-medium text-slate-500">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold transition underline-offset-4 hover:underline"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Вернуться к входу</span>
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

