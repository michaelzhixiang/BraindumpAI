import { useState, useRef, useEffect, useCallback } from "react";
import { motion, type PanInfo } from "framer-motion";
import { useTasks, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { Archive, Flame, Snowflake, Trash2, Pencil, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  pointerWithin,
  rectIntersection,
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
      className={`min-h-[48px] rounded-xl transition-all duration-150 ${
        isOver ? "bg-[#3B82F6]/[0.06] ring-1 ring-[#3B82F6]/20" : ""
      }`}
    >
      {children}
    </div>
  );
}

const SWIPE_THRESHOLD = 60;
const ACTION_WIDTH = 140;

function TaskItem({
  task,
  onDelete,
  onEdit,
  isDndActive,
}: {
  task: Task;
  onDelete: (id: number) => void;
  onEdit: (id: number, content: string) => void;
  isDndActive: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.content);
  const [isRevealed, setIsRevealed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto" as any,
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (isDndActive && isRevealed) {
      setIsRevealed(false);
    }
  }, [isDndActive, isRevealed]);

  const handleSaveEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== task.content) {
      onEdit(task.id, trimmed);
    } else {
      setEditValue(task.content);
    }
    setIsEditing(false);
  };

  const handleSwipeEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) {
      setIsRevealed(true);
    } else {
      setIsRevealed(false);
    }
  };

  const canSwipe = !isEditing && !isDndActive && !isDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative overflow-hidden rounded-xl"
      data-testid={`task-item-${task.id}`}
    >
      <div className="absolute right-0 top-0 bottom-0 flex items-stretch z-0">
        <button
          onClick={() => {
            setIsRevealed(false);
            setEditValue(task.content);
            setIsEditing(true);
          }}
          className="w-[70px] flex items-center justify-center bg-[#3B82F6]/20 text-[#3B82F6]"
          data-testid={`button-edit-${task.id}`}
        >
          <div className="flex flex-col items-center gap-1">
            <Pencil className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase">{t("queue.edit")}</span>
          </div>
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="w-[70px] flex items-center justify-center bg-red-500/20 text-red-400"
          data-testid={`button-delete-${task.id}`}
        >
          <div className="flex flex-col items-center gap-1">
            <Trash2 className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase">{t("queue.delete")}</span>
          </div>
        </button>
      </div>

      <motion.div
        drag={canSwipe ? "x" : false}
        dragConstraints={{ left: -ACTION_WIDTH, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleSwipeEnd}
        animate={{ x: isRevealed ? -ACTION_WIDTH : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className="relative z-10 glass-card p-3 flex items-center gap-2 neon-border-subtle"
        onClick={() => { if (isRevealed) setIsRevealed(false); }}
      >
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground/20 hover:text-muted-foreground/50 shrink-0 touch-none p-1.5 -m-1"
          data-testid={`drag-handle-${task.id}`}
        >
          <GripVertical className="w-4 h-4" />
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
            className="flex-1 text-sm font-medium leading-relaxed text-foreground/80"
            data-testid={`text-task-${task.id}`}
          >
            {task.content}
          </p>
        )}
      </motion.div>
    </div>
  );
}

function DragOverlayItem({ task }: { task: Task }) {
  return (
    <div className="glass-card halo-glow p-3 rounded-xl shadow-2xl flex items-center gap-2 max-w-[420px] neon-glow">
      <div className="text-muted-foreground/30 shrink-0">
        <GripVertical className="w-4 h-4" />
      </div>
      <p className="flex-1 text-sm font-medium text-foreground/80">{task.content}</p>
    </div>
  );
}

function customCollisionDetection(args: any) {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  return rectIntersection(args);
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
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
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

  const isDndActive = activeTask !== null;

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
                <TaskItem
                  key={task.id}
                  task={task}
                  onDelete={(id) => deleteTask(id)}
                  onEdit={handleEdit}
                  isDndActive={isDndActive}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DroppableTierZone>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-8" data-testid="queue-page">
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <TierSection title={t("queue.focus")} icon={Flame} items={focus} tierColor="text-red-400/80" tierId="tier-focus" />
        <TierSection title={t("queue.backlog")} icon={Archive} items={backlog} tierColor="text-yellow-400/60" tierId="tier-backlog" />
        <TierSection title={t("queue.icebox")} icon={Snowflake} items={icebox} tierColor="text-blue-400/60" tierId="tier-icebox" />

        <DragOverlay dropAnimation={{ duration: 150, easing: "ease-out" }}>
          {activeTask ? <DragOverlayItem task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
