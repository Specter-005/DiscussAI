import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useTopics() {
  return useQuery({
    queryKey: [api.topics.list.path],
    queryFn: async () => {
      const res = await fetch(api.topics.list.path);
      if (!res.ok) throw new Error("Failed to fetch topics");
      const data = await res.json();
      return api.topics.list.responses[200].parse(data);
    },
  });
}
