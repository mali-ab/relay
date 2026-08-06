import { useState, FormEvent, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import {
  EnvelopeIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import AuthLayout from "../layouts/AuthLayout";
import api from "../lib/axios";
import type { ApiErrorResponse } from "../types/meeting";
import type { VerifyResponse } from "../types/auth";
import { useAuth } from "../contexts/AuthContext";

export default function VerifyEmail() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const codeInputRef = useRef<HTMLInputElement>(null);

  const displayEmail = user?.email || "";

  useEffect(() => {
    codeInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendCode = async () => {
    setError(null);
    setSending(true);
    try {
      await api.post("/register/send-code");
      setCooldown(60);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Не удалось отправить код. Попробуйте позже.",
      );
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      setError("Введите 6-значный код из письма.");
      return;
    }

    setError(null);
    setVerifying(true);

    try {
      const response = await api.post<VerifyResponse>("/register/verify", {
        code,
      });

      if (response.data.user) {
        login(
          {
            is_email_verified: true,
            subscription: "free",
            ...response.data.user,
          },
          response.data.token,
        );
      } else {
        login(
          {
            id: "",
            name: "",
            email: displayEmail,
            is_email_verified: true,
            subscription: "free",
          },
          response.data.token,
        );
      }

      setSuccess(true);
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Неверный код. Попробуйте снова.",
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
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
              Email подтверждён
            </h2>
            <p className="text-sm text-slate-500 mt-3 font-medium leading-relaxed">
              Ваша почта успешно подтверждена. Перенаправляем...
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <ShieldCheckIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Подтвердите email
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Мы отправили 6-значный код на{" "}
            <span className="text-slate-700 font-semibold">
              {displayEmail || "вашу почту"}
            </span>
            . Код действителен 10 минут.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm">
            <ExclamationCircleIcon className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Код подтверждения
            </label>
            <div className="relative flex items-center">
              <EnvelopeIcon className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
              <input
                ref={codeInputRef}
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
          </div>

          <button
            type="submit"
            disabled={verifying}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-blue-500/25 transition duration-200 flex items-center justify-center gap-2"
          >
            {verifying ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                <span>Проверка...</span>
              </>
            ) : (
              <>
                <ShieldCheckIcon className="w-5 h-5" />
                <span>Подтвердить</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleSendCode}
            disabled={sending || cooldown > 0}
            className="w-full inline-flex items-center justify-center gap-2 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 disabled:opacity-50 disabled:pointer-events-none text-slate-700 text-sm font-semibold py-3 rounded-2xl transition duration-200"
          >
            {sending ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                Отправка...
              </>
            ) : cooldown > 0 ? (
              <span>Повтор через {cooldown}с</span>
            ) : (
              <>
                <PaperAirplaneIcon className="w-5 h-5" />
                Отправить код ещё раз
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-center text-sm font-medium text-slate-400 hover:text-slate-600 transition"
          >
            Выйти и войти снова
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
