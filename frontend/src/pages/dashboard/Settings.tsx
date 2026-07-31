import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { User, Bell, Shield } from "lucide-react";
import SectionHeader from "../../components/settings/SectionHeader";
import ProfileSection from "../../components/settings/ProfileSection";
import NotificationsSection from "../../components/settings/NotificationsSection";
import SecuritySection from "../../components/settings/SecuritySection";

export default function Settings() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const sections = [
    {
      id: "profile",
      icon: User,
      title: "Профиль",
      description: "Обновите личную информацию",
      component: <ProfileSection />,
    },
    // {
    //   id: "notifications",
    //   icon: Bell,
    //   title: "Уведомления",
    //   description: "Настройте предпочтения уведомлений",
    //   component: <NotificationsSection />,
    // },
    {
      id: "security",
      icon: Shield,
      title: "Безопасность",
      description: "Пароль и безопасность аккаунта",
      component: <SecuritySection />,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Настройки</h1>
        <p className="text-slate-500 mt-1.5">
          Управляйте настройками и предпочтениями аккаунта.
        </p>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.id} className="rounded-2xl overflow-hidden">
            <SectionHeader
              icon={section.icon}
              title={section.title}
              description={section.description}
              isOpen={openSection === section.id}
              onToggle={() => toggleSection(section.id)}
            />
            <AnimatePresence>
              {openSection === section.id && section.component}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

