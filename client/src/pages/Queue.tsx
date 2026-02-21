import { useState } from "react";
import { motion } from "framer-motion";
import { useTasks, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { Archive, Flame, Snowflake, Trash2, Pencil, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import type { Task } from "@shared/schema";

function DroppableTierZone({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[60px] rounded-xl transition-colors duration-200 ${
        isOver ? "bg-white/5 ring-1 ring-white/10" : ""
      }`}
    >
      {children}
    </div>
  );
}

function SortableTaskItem({ 
  task, 
  onDelete, 
  onEdit,
}: { 
  task: Task; 
  onDelete: (id: number) => void;
  onEdit: (id: number, content: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.content);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && editValue.trim() !== task.content) {
      onEdit(task.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const subTask = task.parentId != null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border border-white/5 p-3 rounded-xl group flex items-center gap-3 touch-none ${subTask ? "ml-6 border-l-2 border-l-primary/20" : ""}`}
      data-testid={`task-item-${task.id}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground shrink-0 flex flex-col gap-0.5"
      >
        <div className="w-4 h-0.5 bg-current rounded-full" />
        <div className="w-4 h-0.5 bg-current rounded-full" />
        <div className="w-4 h-0.5 bg-current rounded-full" />
      </div>

      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveEdit();
              if (e.key === "Escape") setIsEditing(false);
            }}
            className="flex-1 bg-transparent border-b border-primary/30 py-1 text-sm focus:outline-none"
            autoFocus
          />
          <button onClick={handleSaveEdit} className="text-green-400 p-1">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={() => setIsEditing(false)} className="text-muted-foreground p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <p className="flex-1 text-sm font-medium leading-relaxed">{task.content}</p>
      )}

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {!isEditing && (
          <>
            <button 
              onClick={() => { setEditValue(task.content); setIsEditing(true); }}
              className="p-1.5 hover:text-primary rounded transition-colors"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => onDelete(task.id)}
              className="p-1.5 hover:text-red-400 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function DragOverlayItem({ task }: { task: Task }) {
  return (
    <div className="bg-card border border-primary/30 p-3 rounded-xl shadow-2xl flex items-center gap-3 max-w-[420px]">
      <div className="text-muted-foreground/40 shrink-0 flex flex-col gap-0.5">
        <div className="w-4 h-0.5 bg-current rounded-full" />
        <div className="w-4 h-0.5 bg-current rounded-full" />
        <div className="w-4 h-0.5 bg-current rounded-full" />
      </div>
      <p className="flex-1 text-sm font-medium">{task.content}</p>
    </div>
  );
}

export default function Queue() {
  const { data: tasks, isLoading } = useTasks();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();
  const { toast } = useToast();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const pendingTasks = tasks?.filter(t => t.status === "pending") || [];
  const focus = pendingTasks.filter(t => t.tier === "focus");
  const backlog = pendingTasks.filter(t => t.tier === "backlog");
  const icebox = pendingTasks.filter(t => t.tier === "icebox");

  const handleDragStart = (event: DragStartEvent) => {
    const draggedTask = pendingTasks.find(t => t.id.toString() === event.active.id);
    if (draggedTask) setActiveTask(draggedTask);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const overId = over.id.toString();
    const taskId = Number(active.id);
    
    let newTier: "focus" | "backlog" | "icebox" | null = null;

    if (overId === "tier-focus") newTier = "focus";
    else if (overId === "tier-backlog") newTier = "backlog";
    else if (overId === "tier-icebox") newTier = "icebox";
    else {
      const overTask = pendingTasks.find(t => t.id.toString() === overId);
      if (overTask) newTier = overTask.tier as "focus" | "backlog" | "icebox";
    }

    const currentTask = pendingTasks.find(t => t.id === taskId);
    if (newTier && currentTask && currentTask.tier !== newTier) {
      updateTask({ id: taskId, tier: newTier });
      toast({ title: `Moved to ${newTier}` });
    }
  };

  const handleEdit = (id: number, content: string) => {
    updateTask({ id, content });
  };

  if (isLoading) return null;

  const TierSection = ({ title, icon: Icon, items, tierColor, tierId }: { title: string; icon: any; items: Task[]; tierColor: string; tierId: string }) => (
    <div className="space-y-2">
      <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${tierColor}`}>
        <Icon className="w-4 h-4" />
        {title} <span className="opacity-50 ml-1">({items.length})</span>
      </div>
      <DroppableTierZone id={tierId}>
        <SortableContext items={items.map(t => t.id.toString())} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-white/5 text-center text-xs text-muted-foreground">
                Drag tasks here
              </div>
            ) : (
              items.map((task) => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  onDelete={(id) => deleteTask(id)}
                  onEdit={handleEdit}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DroppableTierZone>
    </div>
  );

  return (
    <div className="p-6 space-y-8 pb-32" data-testid="queue-page">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <TierSection title="Focus" icon={Flame} items={focus} tierColor="text-red-400" tierId="tier-focus" />
        <TierSection title="Backlog" icon={Archive} items={backlog} tierColor="text-yellow-400" tierId="tier-backlog" />
        <TierSection title="Icebox" icon={Snowflake} items={icebox} tierColor="text-blue-400" tierId="tier-icebox" />

        <DragOverlay>
          {activeTask ? <DragOverlayItem task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
