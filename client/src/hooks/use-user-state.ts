import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useUserState() {
  return useQuery({
    queryKey: [api.userState.get.path],
    queryFn: async () => {
      const res = await fetch(api.userState.get.path);
      if (!res.ok) throw new Error("Failed to fetch user state");
      return api.userState.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateUserState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { screenTimeMinutes?: number; hasOnboarded?: boolean }) => {
      const res = await fetch(api.userState.update.path, {
        method: api.userState.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update user state");
      return api.userState.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.userState.get.path] });
    },
  });
}
