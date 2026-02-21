import { useState, useCallback, useEffect } from "react";

export type Lang = "en" | "zh";

const translations: Record<string, Record<Lang, string>> = {
  "header.title": { en: "BrainDump AI", zh: "BrainDump AI" },
  "nav.today": { en: "Today", zh: "今天" },
  "nav.dump": { en: "Dump", zh: "倾倒" },
  "nav.queue": { en: "Queue", zh: "队列" },
  "today.guiltFreeTime": { en: "Guilt-Free Social Media Time", zh: "无负罪感社交媒体时间" },
  "today.min": { en: "min", zh: "分钟" },
  "today.allDone": { en: "All done for today.", zh: "今天全部完成了。" },
  "today.earned": { en: "minutes. Go enjoy them.", zh: "分钟。去享受吧。" },
  "today.youEarned": { en: "You earned", zh: "你赚了" },
  "today.focus": { en: "Focus", zh: "专注" },
  "today.noFocus": { en: "No focus tasks. Dump some thoughts first.", zh: "没有专注任务。先倾倒一些想法吧。" },
  "today.microStep": { en: "Micro-step:", zh: "微步骤：" },
  "today.nudgeMe": { en: "Nudge Me", zh: "推我一下" },
  "today.completedToday": { en: "Completed Today", zh: "今日已完成" },
  "today.checkLowerPriority": { en: "Got more in you? Check your lower-priority tasks or dump new ones.", zh: "还有精力？看看低优先级任务或倾倒新的想法。" },
  "today.viewQueue": { en: "View Queue", zh: "查看队列" },
  "today.addMore": { en: "Dump Some More", zh: "继续倾倒" },
  "today.pickTasks": { en: "Pick tasks to focus on next", zh: "选择接下来要专注的任务" },
  "today.earnedToast": { en: "+10 min earned", zh: "+10 分钟已获得" },
  "today.earnedDesc": { en: "Guilt-free social media time banked.", zh: "无负罪感社交媒体时间已存入。" },
  "today.stepsAdded": { en: "steps added to your list", zh: "步骤已添加到列表" },
  "streak.title": { en: "Monthly Streak", zh: "月度连续" },
  "streak.done": { en: "done", zh: "已完成" },
  "streak.daysActive": { en: "days active", zh: "天活跃" },
  "streak.less": { en: "Less", zh: "少" },
  "streak.more": { en: "More", zh: "多" },
  "streak.tasks": { en: "tasks", zh: "任务" },
  "streak.task": { en: "task", zh: "任务" },
  "dump.placeholder": { en: "Type anything...", zh: "输入任何内容..." },
  "dump.welcome": { en: "What's on your mind? Dump everything here.", zh: "你在想什么？在这里倾倒一切。" },
  "dump.sorting": { en: "Sorting...", zh: "排序中..." },
  "dump.sortButton": { en: "Done - Sort My Stuff", zh: "完成 - 整理我的东西" },
  "dump.sorted": { en: "Sorted", zh: "已整理" },
  "dump.tasksIntoQueue": { en: "into your queue. Check the Queue tab to review.", zh: "到你的队列。查看队列标签页来审查。" },
  "dump.noTasks": { en: "Couldn't extract any actionable tasks. Try being more specific!", zh: "无法提取任何可操作的任务。试试更具体一些！" },
  "dump.addedToQueue": { en: "added to your queue", zh: "已添加到队列" },
  "dump.brainFreeze": { en: "Brain Freeze", zh: "大脑冻结" },
  "dump.tryLater": { en: "Try again later.", zh: "稍后再试。" },
  "dump.nothingToSort": { en: "Nothing to sort yet!", zh: "还没有要排序的内容！" },
  "queue.focus": { en: "Focus", zh: "专注" },
  "queue.backlog": { en: "Can Wait", zh: "可以等" },
  "queue.icebox": { en: "Never Mind", zh: "算了吧" },
  "queue.dragHere": { en: "Drag tasks here", zh: "拖动任务到这里" },
  "queue.movedTo": { en: "Moved to", zh: "已移动到" },
  "queue.edit": { en: "Edit", zh: "编辑" },
  "queue.delete": { en: "Delete", zh: "删除" },
  "onboarding.catchphrase": { en: "A to-do list built for ambitious overthinkers to get things done.", zh: "专为有抱负的过度思考者打造的待办清单，帮你把事情做完。" },
  "onboarding.swipeHint": { en: "Swipe to continue", zh: "滑动继续" },
  "onboarding.feature1.title": { en: "Set Your Priorities", zh: "设定你的优先级" },
  "onboarding.feature1.desc": { en: "Tell us what matters most. We'll use your priorities to decide what deserves your focus.", zh: "告诉我们什么最重要。我们会根据你的优先级来决定什么值得你关注。" },
  "onboarding.feature2.title": { en: "Dump → Auto Sort", zh: "倾倒 → 自动排序" },
  "onboarding.feature2.desc": { en: "Dump all your thoughts. We'll sort them into Focus, Can Wait, and Never Mind based on your priorities.", zh: "倾倒你所有的想法。我们会根据你的优先级将它们分为专注、可以等和算了吧。" },
  "onboarding.feature3.title": { en: "Nudge to Start", zh: "推一把，开始行动" },
  "onboarding.feature3.desc": { en: "Stuck? Get a tiny micro-step so easy you can't say no. Two minutes or less to get moving.", zh: "卡住了？获得一个小到无法拒绝的微步骤。两分钟内开始行动。" },
  "onboarding.feature4.title": { en: "Earn Screen Time", zh: "赢得屏幕时间" },
  "onboarding.feature4.desc": { en: "Complete tasks, earn guilt-free social media time. +10 minutes for every task you finish.", zh: "完成任务，赢得无负罪感的社交媒体时间。每完成一个任务 +10 分钟。" },
  "onboarding.letsGo": { en: "Let's Go", zh: "开始吧" },
  "onboarding.whatMatters": { en: "What matters most to you in the next 3 months?", zh: "接下来三个月，什么对你最重要？" },
  "onboarding.defineTop3": { en: "Define your top 3 priorities. We'll sort your tasks based on these.", zh: "定义你最重要的3个优先事项。我们会根据这些来排序你的任务。" },
  "onboarding.priority": { en: "Priority", zh: "优先事项" },
  "onboarding.allSet": { en: "All Set", zh: "全部完成" },
  "onboarding.addPriority": { en: "Please add at least one priority", zh: "请添加至少一个优先事项" },
  "onboarding.error": { en: "Something went wrong", zh: "出了点问题" },
  "onboarding.tryAgain": { en: "Please try again", zh: "请再试一次" },
};

const acks: Record<Lang, string[]> = {
  en: ["Copy that", "Got it", "Noted", "On the list", "Logged", "Captured"],
  zh: ["收到", "了解", "已记录", "已列入", "已记下", "已捕获"],
};

let listeners: Array<() => void> = [];
let currentLang: Lang = (typeof window !== "undefined" && localStorage.getItem("braindump-lang") as Lang) || "en";

function notifyListeners() {
  listeners.forEach(fn => fn());
}

export function getLang(): Lang {
  return currentLang;
}

export function toggleLang() {
  currentLang = currentLang === "en" ? "zh" : "en";
  if (typeof window !== "undefined") {
    localStorage.setItem("braindump-lang", currentLang);
  }
  notifyListeners();
}

export function t(key: string): string {
  return translations[key]?.[currentLang] || key;
}

export function getAck(): string {
  const list = acks[currentLang];
  return list[Math.floor(Math.random() * list.length)];
}

export function useI18n() {
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  return {
    lang: currentLang,
    toggle: toggleLang,
    t,
  };
}
