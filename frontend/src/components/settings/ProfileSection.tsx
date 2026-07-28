import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Save,
  Camera,
  CheckCircle,
  Loader2,
  XCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import InputField from "./InputField";
import api from "../../lib/axios";

interface FormErrors {
  name?: string;
  email?: string;
}

export default function ProfileSection() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSave = async () => {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = "Имя обязательно";
    if (!email.trim()) newErrors.email = "Email обязателен";
    else if (!isValidEmail(email)) newErrors.email = "Неверный формат email";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    setApiError(null);

    try {
      await api.put("/me/name", { name: name.trim() });

      if (user) {
        updateUser({ name: name.trim() });
      }

      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setSaving(false);
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Ошибка при сохранении";
      setApiError(message);
    }
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" as const }}
      className="bg-white border border-t-0 border-slate-100 rounded-b-2xl overflow-hidden"
    >
      <div className="p-5 sm:p-6 space-y-6">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-200">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all opacity-0 group-hover:opacity-100"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-base">
              {user?.name || "Пользователь"}
            </p>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <span className="inline-block mt-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {user?.subscription === "pro" ? "Pro-тариф" : "Бесплатный тариф"}
            </span>
          </div>
        </div>

        <hr className="border-slate-100" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Полное имя"
            value={name}
            onChange={setName}
            placeholder="Иван Петров"
            icon={User}
            error={errors.name}
          />
          <InputField
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="ivan@example.com"
            icon={Mail}
            error={errors.email}
          />
        </div>

        {apiError && (
          <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium">
            <XCircle className="w-4 h-4 shrink-0" />
            {apiError}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Сохранение...
              </>
            ) : saved ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-300" />
                Сохранено
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Сохранить
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
