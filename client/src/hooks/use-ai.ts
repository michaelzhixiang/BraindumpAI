import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useProcessDump() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dumpText: string) => {
      const res = await fetch(api.ai.processDump.path, {
        method: api.ai.processDump.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dumpText }),
      });
      if (!res.ok) throw new Error("AI processing failed");
      return api.ai.processDump.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
    },
  });
}

export function useGenerateNudge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: number) => {
      const url = buildUrl(api.ai.generateNudge.path, { id: taskId });
      const res = await fetch(url, {
        method: api.ai.generateNudge.method,
      });
      if (!res.ok) throw new Error("Failed to generate nudge");
      return api.ai.generateNudge.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
    },
  });
}

export function useGenerateBreakdown() {
  return useMutation({
    mutationFn: async (taskId: number) => {
      const url = buildUrl(api.ai.generateBreakdown.path, { id: taskId });
      const res = await fetch(url, {
        method: api.ai.generateBreakdown.method,
      });
      if (!res.ok) throw new Error("Failed to generate breakdown");
      return api.ai.generateBreakdown.responses[200].parse(await res.json());
    },
  });
}
