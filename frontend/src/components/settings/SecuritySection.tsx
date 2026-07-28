import { useState } from "react";
import { motion } from "framer-motion";
import {
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  LogOut,
  Trash2,
} from "lucide-react";
import InputField from "./InputField";
import api from "../../lib/axios";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SecuritySection() {
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(false);

    if (!currentPassword) {
      setError("Текущий пароль обязателен");
      return;
    }
    if (!newPassword) {
      setError("Новый пароль обязателен");
      return;
    }
    if (newPassword.length < 6) {
      setError("Новый пароль должен содержать не менее 6 символов");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setSaving(true);

    try {
      await api.put("/me/password", {
        old_password: currentPassword,
        new_password: newPassword,
      });

      setSaving(false);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: unknown) {
      setSaving(false);
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Ошибка при смене пароля";
      setError(message);
    }
  };

  const renderPasswordToggle = (show: boolean, toggle: () => void) => (
    <button
      type="button"
      onClick={toggle}
      className="absolute right-3 bottom-2.5 text-slate-400 hover:text-slate-600 transition"
    >
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" as const }}
      className="bg-white border border-t-0 border-slate-100 rounded-b-2xl overflow-hidden"
    >
      <div className="p-5 sm:p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="w-5 h-5 text-slate-600" />
            <h4 className="font-semibold text-slate-900">Сменить пароль</h4>
          </div>

          {success && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-medium">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Пароль успешно изменён
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium">
              <XCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <InputField
                label="Текущий пароль"
                value={currentPassword}
                onChange={setCurrentPassword}
                type={showCurrentPw ? "text" : "password"}
                placeholder="Введите текущий пароль"
                icon={Lock}
              />
              {renderPasswordToggle(showCurrentPw, () =>
                setShowCurrentPw(!showCurrentPw),
              )}
            </div>
            <div className="relative">
              <InputField
                label="Новый пароль"
                value={newPassword}
                onChange={setNewPassword}
                type={showNewPw ? "text" : "password"}
                placeholder="Не менее 6 символов"
                icon={Lock}
              />
              {renderPasswordToggle(showNewPw, () => setShowNewPw(!showNewPw))}
            </div>
            <div className="relative">
              <InputField
                label="Подтвердите новый пароль"
                value={confirmPassword}
                onChange={setConfirmPassword}
                type={showConfirmPw ? "text" : "password"}
                placeholder="Повторите новый пароль"
                icon={Lock}
              />
              {renderPasswordToggle(showConfirmPw, () =>
                setShowConfirmPw(!showConfirmPw),
              )}
            </div>

            {newPassword && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        newPassword.length >= level * 2
                          ? newPassword.length >= 8
                            ? "bg-emerald-500"
                            : newPassword.length >= 6
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">
                  {newPassword.length < 6
                    ? "Слабый — слишком короткий"
                    : newPassword.length < 8
                      ? "Средний — добавьте больше символов"
                      : "Надёжный пароль"}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleChangePassword}
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Обновление...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Обновить пароль
                </>
              )}
            </button>
          </div>
        </div>

        <hr className="border-slate-100" />

        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h4 className="font-semibold text-slate-900">Опасная зона</h4>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 bg-rose-50/50 border border-rose-100 rounded-xl hover:bg-rose-50 transition group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 text-rose-500" />
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-800">Выйти</p>
                  <p className="text-xs text-slate-400">
                    Выйти из аккаунта на этом устройстве
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-rose-600 group-hover:underline">
                Выйти
              </span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
