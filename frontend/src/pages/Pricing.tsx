import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import type { SubscriptionTier } from "../contexts/AuthContext";
import api from "../lib/axios";
import { getSubscription } from "../lib/subscription";
import Loading from "./Loading";

interface Plan {
  id: number;
  code: string;
  name: string;
  max_participants: number;
  meeting_duration: number;
  price: number;
}

interface PlanCardProps {
  title: string;
  price: number;
  description: string;
  features: string[];
  tier: SubscriptionTier;
  isPro?: boolean;
  currentPlan?: SubscriptionTier;
  isUpgrading: boolean;
  onUpgrade: (tier: SubscriptionTier) => void;
  isProUserDowngradeBlocked?: boolean;
}

function getPlanFeatures(plan: Plan): string[] {
  const features: string[] = [];

  if (plan.meeting_duration === 0) {
    features.push("Безлимитная длительность встреч");
  } else {
    features.push(`Максимум ${plan.meeting_duration} минут на встречу`);
  }

  features.push(`До ${plan.max_participants} участников`);

  if (plan.code === "free" || plan.code === "FREE") {
    features.push(
      "Базовое управление встречей",
      "Демонстрация экрана",
      "Чат поддержка",
    );
  }

  if (plan.code === "pro" || plan.code === "PRO") {
    features.push(
      "Расширенное управление встречей",
      "Демонстрация экрана и запись",
      "Приоритетная поддержка в чате",
      "Настраиваемые фоны",
      "Аналитика встреч",
    );
  }

  return features;
}

function getPlanDescription(code: string): string {
  if (code === "free" || code === "FREE") {
    return "Идеально для начала";
  }
  return "Для преподавателей и продвинутых пользователей";
}

function PlanCard({
  title,
  price,
  description,
  features,
  tier,
  isPro = false,
  currentPlan,
  isUpgrading,
  onUpgrade,
  isProUserDowngradeBlocked = false,
}: PlanCardProps) {
  const isCurrentPlan = currentPlan === tier;
  const isFree = price === 0;
  const isDowngradeButtonDisabled = isProUserDowngradeBlocked || isUpgrading;

  return (
    <div
      className={`relative flex flex-col rounded-3xl border-2 p-8 shadow-lg transition-all duration-300 ${
        isPro
          ? "border-blue-500 bg-white scale-105 shadow-blue-200/40"
          : "border-slate-200 bg-white/80"
      }`}
    >
      {isPro && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
          <SparklesIcon className="w-4 h-4" />
          Рекомендуем
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>

      <div className="mb-6">
        <span className="text-5xl font-extrabold text-slate-900">
          {isFree ? "0 TMT" : `${price} TMT`}
        </span>
        {!isFree && (
          <span className="text-slate-400 text-sm font-medium ml-2">
            /месяц
          </span>
        )}
      </div>

      <ul className="space-y-3.5 mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <div
              className={`p-0.5 rounded-full shrink-0 mt-0.5 ${
                isPro ? "bg-blue-600" : "bg-slate-400"
              }`}
            >
              <CheckIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-slate-600">{feature}</span>
          </li>
        ))}
      </ul>

      {isCurrentPlan ? (
        <div className="w-full text-center py-3.5 rounded-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
          Текущий план ✨
        </div>
      ) : (
        <div className="space-y-2">
          <button
            onClick={() => onUpgrade(tier)}
            disabled={isDowngradeButtonDisabled}
            className={`w-full py-3.5 rounded-2xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 ${
              isPro
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                : "bg-slate-900 text-white hover:bg-slate-800"
            } ${isProUserDowngradeBlocked ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isUpgrading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Обновление...
              </span>
            ) : tier === "free" ? (
              "Понизить"
            ) : (
              "Перейти на Pro"
            )}
          </button>
          {isProUserDowngradeBlocked && (
            <p className="text-xs text-center text-amber-600 font-medium">
              Pro пользователи не могут перейти на бесплатный тариф
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function Pricing() {
  const { user, updateSubscription } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ plans: Plan[] }>("/plans")
      .then((response) => {
        setPlans(response.data.plans);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Не удалось загрузить тарифы. Попробуйте позже.");
        setIsLoading(false);
      });
  }, []);

  const currentPlan: SubscriptionTier = user?.subscription || "free";

  const handleUpgrade = async (tier: SubscriptionTier) => {
    const planCode = tier === "pro" ? "pro" : "free";
    setIsUpgrading(true);
    setError(null);
    try {
      await getSubscription(planCode);
      updateSubscription(tier);
    } catch (err) {
      setError("Не удалось обновить подписку. Попробуйте позже.");
    } finally {
      setIsUpgrading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  const isProUser = currentPlan === "pro";

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Выберите ваш{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Тариф
            </span>
          </h1>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            Начните с бесплатного плана и переходите на более продвинутый по
            мере роста. Без скрытых платежей и необходимости вводить данные
            карты.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
          {plans.map((plan) => {
            const code = plan.code.toLowerCase();
            const tier = code === "pro" ? "pro" : ("free" as SubscriptionTier);
            const isPro = code === "pro";
            const isFreeCard = code === "free";
            const isDowngradeBlocked = isFreeCard && isProUser;

            return (
              <PlanCard
                key={plan.id}
                title={plan.name}
                price={plan.price}
                description={getPlanDescription(plan.code)}
                features={getPlanFeatures(plan)}
                tier={tier}
                isPro={isPro}
                currentPlan={currentPlan}
                isUpgrading={isUpgrading}
                onUpgrade={handleUpgrade}
                isProUserDowngradeBlocked={isDowngradeBlocked}
              />
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-400">
            Вы используете{" "}
            <span className="font-bold text-slate-700 capitalize">
              {currentPlan === "free" ? "бесплатный" : "Pro"}
            </span>{" "}
            план.{" "}
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 hover:text-blue-700 font-semibold underline-offset-2 hover:underline ml-1"
            >
              На главную
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
