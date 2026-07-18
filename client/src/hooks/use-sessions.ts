import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

type CreateSessionInput = z.infer<typeof api.sessions.create.input>;
type UpdateSessionInput = z.infer<typeof api.sessions.update.input>;

export function useSession(id: number | null) {
  return useQuery({
    queryKey: [api.sessions.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.sessions.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch session");
      const data = await res.json();
      return api.sessions.get.responses[200].parse(data);
    },
    enabled: !!id,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSessionInput) => {
      const validated = api.sessions.create.input.parse(data);
      const res = await fetch(api.sessions.create.path, {
        method: api.sessions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      if (!res.ok) throw new Error("Failed to create session");
      const result = await res.json();
      return api.sessions.create.responses[201].parse(result);
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: UpdateSessionInput }) => {
      const validated = api.sessions.update.input.parse(updates);
      const url = buildUrl(api.sessions.update.path, { id });
      const res = await fetch(url, {
        method: api.sessions.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      if (!res.ok) throw new Error("Failed to update session");
      const result = await res.json();
      return api.sessions.update.responses[200].parse(result);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [api.sessions.get.path, id] });
    },
  });
}
