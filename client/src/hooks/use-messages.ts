import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

type CreateMessageInput = z.infer<typeof api.messages.create.input>;

export function useMessages(sessionId: number | null) {
  return useQuery({
    queryKey: [api.messages.list.path, sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const url = buildUrl(api.messages.list.path, { sessionId });
      const res = await fetch(url);
      if (res.status === 404) return [];
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      return api.messages.list.responses[200].parse(data);
    },
    enabled: !!sessionId,
    // Poll every 3 seconds to simulate receiving AI responses in real-time
    refetchInterval: 3000, 
  });
}

export function useCreateMessage(sessionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateMessageInput) => {
      const validated = api.messages.create.input.parse(data);
      const url = buildUrl(api.messages.create.path, { sessionId });
      const res = await fetch(url, {
        method: api.messages.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      if (!res.ok) throw new Error("Failed to send message");
      const result = await res.json();
      return api.messages.create.responses[201].parse(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path, sessionId] });
    },
  });
}
