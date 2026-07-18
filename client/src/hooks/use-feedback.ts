import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useFeedback(sessionId: number | null) {
  return useQuery({
    queryKey: [api.feedback.get.path, sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const url = buildUrl(api.feedback.get.path, { sessionId });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch feedback");
      const data = await res.json();
      return api.feedback.get.responses[200].parse(data);
    },
    enabled: !!sessionId,
    retry: false,
  });
}

export function useGenerateFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: number) => {
      const url = buildUrl(api.feedback.generate.path, { sessionId });
      const res = await fetch(url, {
        method: api.feedback.generate.method,
      });
      if (!res.ok) throw new Error("Failed to generate feedback");
      const result = await res.json();
      return api.feedback.generate.responses[200].parse(result);
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: [api.feedback.get.path, sessionId] });
    },
  });
}
