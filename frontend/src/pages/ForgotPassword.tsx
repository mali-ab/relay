import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { AxiosError } from "axios";
import {
  EnvelopeIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import AuthLayout from "../layouts/AuthLayout";
import api from "../lib/axios";
import type { ApiErrorResponse } from "../types/meeting";

type Step = "email" | "reset" | "success";

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendInstructions = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      setError("Пожалуйста, введите адрес электронной почты.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post("/forgot-password", { email });
      setStep("reset");
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Не удалось отправить инструкции. Попробуйте снова."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setSending(true);
    try {
      await api.post("/forgot-password", { email });
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Не удалось отправить код. Попробуйте снова."
      );
    } finally {
      setSending(false);
    }
  };

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      setError("Введите 6-значный код из письма.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("Новый пароль должен содержать минимум 6 символов.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post("/reset-password", {
        email,
        code,
        new_password: newPassword,
      });
      setStep("success");
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Не удалось сбросить пароль. Попробуйте снова."
      );
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <AuthLayout>
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Пароль изменён
            </h2>
            <p className="text-sm text-slate-500 mt-3 font-medium leading-relaxed">
              Ваш пароль был успешно сброшен. Теперь вы можете войти с новым
              паролем.
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
            {step === "email" ? "Забыли пароль?" : "Сброс пароля"}
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            {step === "email"
              ? "Введите email, и мы отправим вам инструкции по восстановлению"
              : "Введите код из письма и новый пароль"}
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm">
            <ExclamationCircleIcon className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleSendInstructions} className="space-y-5">
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
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Код подтверждения
              </label>
              <div className="relative flex items-center">
                <ShieldCheckIcon className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition duration-200 tracking-[0.5em] text-center"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Код отправлен на{" "}
                <span className="text-slate-600 font-semibold">{email}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Новый пароль
              </label>
              <div className="relative flex items-center">
                <LockClosedIcon className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Подтвердите пароль
              </label>
              <div className="relative flex items-center">
                <LockClosedIcon className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите новый пароль"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition duration-200"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={sending}
              className="w-full text-sm font-semibold text-blue-600 hover:text-blue-700 transition disabled:opacity-50"
            >
              {sending ? "Отправка..." : "Отправить код ещё раз"}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-blue-500/25 transition duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  <span>Сохранение...</span>
                </>
              ) : (
                <span>Сбросить пароль</span>
              )}
            </button>
          </form>
        )}

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
