import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CreatePriorityRequest } from "@shared/routes";

export function usePriorities() {
  return useQuery({
    queryKey: [api.priorities.list.path],
    queryFn: async () => {
      const res = await fetch(api.priorities.list.path);
      if (!res.ok) throw new Error("Failed to fetch priorities");
      return api.priorities.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreatePriorities() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (priorities: CreatePriorityRequest[]) => {
      const res = await fetch(api.priorities.createMany.path, {
        method: api.priorities.createMany.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priorities }),
      });
      if (!res.ok) throw new Error("Failed to create priorities");
      return api.priorities.createMany.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.priorities.list.path] });
    },
  });
}
