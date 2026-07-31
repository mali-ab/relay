import api from "./axios";

interface SubscriptionResponse {
  subs: {
    currency: string;
    max_participants: number;
    meeting_duration: number;
    plan_code: string;
    plan_name: string;
    plan_price: number;
  };
}

/**
 * Fetches subscription details for a given plan code.
 * POST /api/subs/:planCode
 */
export async function getSubscription(planCode: string): Promise<SubscriptionResponse> {
  const response = await api.post<SubscriptionResponse>(`/subs/${planCode}`);
  return response.data;
}

