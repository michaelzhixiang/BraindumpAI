import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useTasks() {
  return useQuery({
    queryKey: [api.tasks.list.path],
    queryFn: async () => {
      const res = await fetch(api.tasks.list.path);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return api.tasks.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: { content: string; tier: string; status: string; parentId?: number }) => {
      const res = await fetch(api.tasks.create.path, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return await res.json(); 
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
    },
  });
}

export function useCreateTasksBulk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tasks: Array<{ content: string; tier: string; status: string; parentId?: number }>) => {
      const res = await fetch(api.tasks.createMany.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks }),
      });
      if (!res.ok) throw new Error("Failed to create tasks");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number; [key: string]: any }) => {
      const url = buildUrl(api.tasks.update.path, { id });
      const res = await fetch(url, {
        method: api.tasks.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return api.tasks.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.tasks.delete.path, { id });
      const res = await fetch(url, { method: api.tasks.delete.method });
      if (!res.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
    },
  });
}
