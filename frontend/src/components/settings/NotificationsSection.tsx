import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Mail,
  Smartphone,
  MessageSquare,
  Moon,
  Sun,
} from "lucide-react";
import ToggleSwitch from "./ToggleSwitch";

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  meetingReminders: boolean;
  assignmentUpdates: boolean;
  marketingEmails: boolean;
  darkMode: boolean;
}

const NOTIFICATION_KEY = "relay_notification_prefs";

const DEFAULTS: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  meetingReminders: true,
  assignmentUpdates: false,
  marketingEmails: false,
  darkMode: false,
};

function loadPrefs(): NotificationSettings {
  try {
    const raw = localStorage.getItem(NOTIFICATION_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function savePrefs(prefs: NotificationSettings) {
  localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(prefs));
}

export default function NotificationsSection() {
  const [notifications, setNotifications] = useState<NotificationSettings>(loadPrefs);
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof NotificationSettings) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    savePrefs(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" as const }}
      className="bg-white border border-t-0 border-slate-100 rounded-b-2xl overflow-hidden"
    >
      <div className="p-5 sm:p-6">
        {saved && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-medium">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Настройки сохранены автоматически
          </div>
        )}

        <div className="divide-y divide-slate-100">
          <ToggleSwitch
            enabled={notifications.emailNotifications}
            onChange={() => toggle("emailNotifications")}
            label="Email уведомления"
            description="Получать уведомления по электронной почте"
          />
          <ToggleSwitch
            enabled={notifications.pushNotifications}
            onChange={() => toggle("pushNotifications")}
            label="Push-уведомления"
            description="Получать push-уведомления на устройство"
          />
          <ToggleSwitch
            enabled={notifications.meetingReminders}
            onChange={() => toggle("meetingReminders")}
            label="Напоминания о встречах"
            description="Получать напоминания перед запланированными встречами"
          />
          <ToggleSwitch
            enabled={notifications.assignmentUpdates}
            onChange={() => toggle("assignmentUpdates")}
            label="Обновления заданий"
            description="Быть в курсе новых заданий и оценок"
          />
          <ToggleSwitch
            enabled={notifications.marketingEmails}
            onChange={() => toggle("marketingEmails")}
            label="Маркетинговые письма"
            description="Обновления продукта, советы и спецпредложения"
          />
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Mail, label: "Email", value: notifications.emailNotifications },
            { icon: Smartphone, label: "Push", value: notifications.pushNotifications },
            { icon: MessageSquare, label: "В приложении", value: true },
            { icon: notifications.darkMode ? Moon : Sun, label: "Тема", value: "Авто" },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition ${
                item.value
                  ? "bg-blue-50 border-blue-100 text-blue-700"
                  : "bg-slate-50 border-slate-100 text-slate-400"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
              <span className="text-[10px] opacity-70">
                {typeof item.value === "boolean"
                  ? item.value
                    ? "Активно"
                    : "Выкл"
                  : item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

