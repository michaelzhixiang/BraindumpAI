import { useState, useRef, useEffect } from "react";
import { useTasks, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { Archive, Flame, Snowflake, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
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
      className={`min-h-[48px] rounded-xl transition-all duration-200 ${
        isOver ? "bg-[#3B82F6]/[0.04] ring-1 ring-[#3B82F6]/20" : ""
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
  const inputRef = useRef<HTMLInputElement>(null);
  
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
    opacity: isDragging ? 0.3 : 1,
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== task.content) {
      onEdit(task.id, trimmed);
    } else {
      setEditValue(task.content);
    }
    setIsEditing(false);
  };

  const subTask = task.parentId != null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-card p-3 rounded-xl group flex items-center gap-3 neon-border-subtle ${subTask ? "ml-5 border-l-2 border-l-[#3B82F6]/10" : ""}`}
      data-testid={`task-item-${task.id}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground/20 hover:text-muted-foreground/50 shrink-0 flex flex-col gap-[2px] touch-none py-1"
      >
        <div className="w-3.5 h-[1.5px] bg-current rounded-full" />
        <div className="w-3.5 h-[1.5px] bg-current rounded-full" />
        <div className="w-3.5 h-[1.5px] bg-current rounded-full" />
      </div>

      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSaveEdit();
            if (e.key === "Escape") { setEditValue(task.content); setIsEditing(false); }
          }}
          onBlur={handleSaveEdit}
          className="flex-1 bg-transparent text-sm font-medium focus:outline-none text-foreground/90 py-0.5"
          data-testid={`input-edit-${task.id}`}
        />
      ) : (
        <p 
          className="flex-1 text-sm font-medium leading-relaxed text-foreground/80 cursor-text hover:text-foreground/95 transition-colors"
          onClick={() => { setEditValue(task.content); setIsEditing(true); }}
          data-testid={`text-task-${task.id}`}
        >
          {task.content}
        </p>
      )}

      <button 
        onClick={() => onDelete(task.id)}
        className="p-1.5 text-transparent group-hover:text-muted-foreground/30 hover:!text-red-400 rounded transition-all shrink-0"
        title="Delete"
        data-testid={`button-delete-${task.id}`}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function DragOverlayItem({ task }: { task: Task }) {
  return (
    <div className="glass-card halo-glow p-3 rounded-xl shadow-2xl flex items-center gap-3 max-w-[420px] neon-glow">
      <div className="text-muted-foreground/30 shrink-0 flex flex-col gap-[2px]">
        <div className="w-3.5 h-[1.5px] bg-current rounded-full" />
        <div className="w-3.5 h-[1.5px] bg-current rounded-full" />
        <div className="w-3.5 h-[1.5px] bg-current rounded-full" />
      </div>
      <p className="flex-1 text-sm font-medium text-foreground/80">{task.content}</p>
    </div>
  );
}

export default function Queue() {
  const { data: tasks, isLoading } = useTasks();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();
  const { toast } = useToast();
  const { t } = useI18n();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
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
      const tierLabel = newTier === "focus" ? t("queue.focus") : newTier === "backlog" ? t("queue.backlog") : t("queue.icebox");
      toast({ title: `${t("queue.movedTo")} ${tierLabel}` });
    }
  };

  const handleEdit = (id: number, content: string) => {
    updateTask({ id, content });
  };

  if (isLoading) return null;

  const TierSection = ({ title, icon: Icon, items, tierColor, tierId }: { title: string; icon: any; items: Task[]; tierColor: string; tierId: string }) => (
    <div className="space-y-2">
      <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${tierColor}`}>
        <Icon className="w-3.5 h-3.5" />
        {title} <span className="opacity-40 ml-1">({items.length})</span>
      </div>
      <DroppableTierZone id={tierId}>
        <SortableContext items={items.map(t => t.id.toString())} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5">
            {items.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-white/[0.04] text-center text-[10px] text-muted-foreground/30 uppercase tracking-wider glass-card">
                {t("queue.dragHere")}
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
    <div className="p-5 space-y-6 pb-32" data-testid="queue-page">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <TierSection title={t("queue.focus")} icon={Flame} items={focus} tierColor="text-red-400/80" tierId="tier-focus" />
        <TierSection title={t("queue.backlog")} icon={Archive} items={backlog} tierColor="text-yellow-400/60" tierId="tier-backlog" />
        <TierSection title={t("queue.icebox")} icon={Snowflake} items={icebox} tierColor="text-blue-400/60" tierId="tier-icebox" />

        <DragOverlay>
          {activeTask ? <DragOverlayItem task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
