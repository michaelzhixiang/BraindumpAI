import { useState, useCallback, useEffect } from "react";

export type Lang = "en" | "zh";

const translations: Record<string, Record<Lang, string>> = {
  "header.title": { en: "BrainDump AI", zh: "BrainDump AI" },
  "nav.today": { en: "Today", zh: "今日" },
  "nav.dump": { en: "Dump", zh: "脑暴" },
  "nav.queue": { en: "Queue", zh: "待办" },
  "today.guiltFreeTime": { en: "Guilt-Free Social Media Time", zh: "刷手机自由时间" },
  "today.min": { en: "min", zh: "分钟" },
  "today.allDone": { en: "All done for today.", zh: "今天的任务都搞定了！" },
  "today.earned": { en: "minutes. Go enjoy them.", zh: "分钟，尽情去刷吧。" },
  "today.youEarned": { en: "You earned", zh: "你赚到了" },
  "today.focus": { en: "Focus", zh: "专注" },
  "today.noFocus": { en: "No focus tasks. Dump some thoughts first.", zh: "还没有重点任务，先倒一波想法吧。" },
  "today.microStep": { en: "Micro-step:", zh: "下一小步：" },
  "today.nudgeMe": { en: "Nudge Me", zh: "推我一把" },
  "today.completedToday": { en: "Completed Today", zh: "今日战绩" },
  "today.checkLowerPriority": { en: "Got more in you? Check your lower-priority tasks or dump new ones.", zh: "还有余力？看看其他任务，或者再倒一波新想法。" },
  "today.viewQueue": { en: "View Queue", zh: "看看待办" },
  "today.addMore": { en: "Dump Some More", zh: "再倒一波" },
  "today.pickTasks": { en: "Pick tasks to focus on next", zh: "选几个接下来要做的" },
  "today.earnedToast": { en: "+10 min earned", zh: "+10 分钟到手" },
  "today.earnedDesc": { en: "Guilt-free social media time banked.", zh: "刷手机自由时间已到账！" },
  "today.stepsAdded": { en: "steps added to your list", zh: "个步骤已加入列表" },
  "streak.title": { en: "Monthly Streak", zh: "本月打卡" },
  "streak.done": { en: "done", zh: "已完成" },
  "streak.daysActive": { en: "days active", zh: "天打卡" },
  "streak.less": { en: "Less", zh: "少" },
  "streak.more": { en: "More", zh: "多" },
  "streak.tasks": { en: "tasks", zh: "个任务" },
  "streak.task": { en: "task", zh: "个任务" },
  "dump.placeholder": { en: "Type anything...", zh: "想到啥写啥..." },
  "dump.welcome": { en: "What's on your mind? Dump everything here.", zh: "脑子里在想什么？全倒出来吧。" },
  "dump.sorting": { en: "Sorting...", zh: "整理中..." },
  "dump.sortButton": { en: "Done - Sort My Stuff", zh: "写完了，帮我理一理" },
  "dump.sorted": { en: "Sorted", zh: "整理好了" },
  "dump.tasksIntoQueue": { en: "into your queue. Check the Queue tab to review.", zh: "到你的待办里了。去待办看看吧。" },
  "dump.noTasks": { en: "Couldn't extract any actionable tasks. Try being more specific!", zh: "没找到能做的事，试试说得具体一点？" },
  "dump.addedToQueue": { en: "added to your queue", zh: "已加到待办" },
  "dump.brainFreeze": { en: "Brain Freeze", zh: "脑子卡住了" },
  "dump.tryLater": { en: "Try again later.", zh: "等下再试试吧。" },
  "dump.nothingToSort": { en: "Nothing to sort yet!", zh: "还没写东西呢！" },
  "queue.focus": { en: "Focus", zh: "重点" },
  "queue.backlog": { en: "Can Wait", zh: "不急" },
  "queue.icebox": { en: "Never Mind", zh: "算了" },
  "queue.dragHere": { en: "Drag tasks here", zh: "拖到这里" },
  "queue.movedTo": { en: "Moved to", zh: "已移到" },
  "queue.edit": { en: "Edit", zh: "编辑" },
  "queue.delete": { en: "Delete", zh: "删除" },
  "onboarding.catchphrase": { en: "A to-do list for ambitious overthinkers who actually want to get stuff done.", zh: "给想太多、但也想做到的你。" },
  "onboarding.swipeHint": { en: "Swipe to continue", zh: "左滑继续" },
  "onboarding.feature1.title": { en: "AI Sorts It For You", zh: "AI 帮你理清" },
  "onboarding.feature1.desc": { en: "Tell us what matters most. AI decides what deserves your focus, what can wait, and what to let go.", zh: "告诉我们什么对你最重要，AI 帮你决定先做什么、缓做什么、不做什么。" },
  "onboarding.feature2.title": { en: "Brain Dump, Then Relax", zh: "先倒出来，就轻松了" },
  "onboarding.feature2.desc": { en: "Just type whatever's on your mind. AI turns your messy thoughts into a sorted to-do list.", zh: "脑子里有什么就写什么，AI 会帮你整理成清晰的待办清单。" },
  "onboarding.feature3.title": { en: "Tiny Steps, Big Progress", zh: "一小步，就够了" },
  "onboarding.feature3.desc": { en: "Stuck? Get a step so tiny you can't say no. Two minutes, and you're rolling.", zh: "不想动？给你一个小到没法拒绝的步骤。两分钟就能开始。" },
  "onboarding.feature4.title": { en: "Do More, Scroll More", zh: "做得多，刷得久" },
  "onboarding.feature4.desc": { en: "Every task done = 10 min of guilt-free social media. Finally, scrolling you've earned.", zh: "每完成一个任务就多10分钟刷手机时间。终于能刷得心安理得了。" },
  "onboarding.letsGo": { en: "Let's Go", zh: "开始吧" },
  "onboarding.whatMatters": { en: "What matters most to you in the next 3 months?", zh: "未来三个月，你最想搞定什么？" },
  "onboarding.defineTop3": { en: "Define your top 3 priorities. AI will sort your tasks based on these.", zh: "写下最重要的3件事，AI 会据此帮你排任务。" },
  "onboarding.priority": { en: "Priority", zh: "目标" },
  "onboarding.allSet": { en: "All Set", zh: "搞定，开始吧" },
  "onboarding.addPriority": { en: "Please add at least one priority", zh: "至少写一个目标吧" },
  "onboarding.error": { en: "Something went wrong", zh: "出了点问题" },
  "onboarding.tryAgain": { en: "Please try again", zh: "再试一下吧" },
  "onboarding.demo.dump1": { en: "Need to update my resume", zh: "简历得改改了" },
  "onboarding.demo.dump2": { en: "Should probably exercise more", zh: "应该多运动一下" },
  "onboarding.demo.dump3": { en: "Call dentist for checkup", zh: "得预约看个牙" },
  "onboarding.demo.sorting": { en: "AI sorting...", zh: "AI 整理中..." },
  "onboarding.demo.sort1": { en: "Update resume", zh: "更新简历" },
  "onboarding.demo.sort2": { en: "Start exercising", zh: "开始运动" },
  "onboarding.demo.sort3": { en: "Call dentist", zh: "预约牙医" },
  "onboarding.demo.nudgeTask": { en: "Update resume", zh: "更新简历" },
  "onboarding.demo.nudgeStep": { en: "Open your resume file and read the first section.", zh: "打开简历文件，先看看第一段。" },
  "onboarding.demo.nudgeHint": { en: "Each nudge builds on the last", zh: "每一步都比上一步更进一点" },
  "onboarding.demo.rewardHint": { en: "+10 min per task completed", zh: "每完成一个任务 +10 分钟" },
  "onboarding.feature5.title": { en: "Track Your Streak", zh: "看见你的坚持" },
  "onboarding.feature5.desc": { en: "Watch your consistency grow. A monthly heatmap shows how you're building momentum.", zh: "每天打卡，看着自己越来越稳。月度热力图让你的进步一目了然。" },
  "landing.tagline": { en: "A to-do list for ambitious overthinkers.", zh: "给想太多的行动派。" },
  "landing.subtitle": { en: "Dump your thoughts. AI sorts them. Get nudged into action.", zh: "把想法倒出来，AI 帮你理，推你一把就行动。" },
  "landing.login": { en: "Get Started", zh: "开始使用" },
  "landing.feature1": { en: "AI-Powered Sorting", zh: "AI 智能分类" },
  "landing.feature1.desc": { en: "Dump everything on your mind. AI sorts it into Focus, Can Wait, and Never Mind.", zh: "脑子里有什么尽管倒，AI 帮你分成重点、不急、算了。" },
  "landing.feature2": { en: "Micro-Step Nudges", zh: "一小步推动" },
  "landing.feature2.desc": { en: "Stuck? Get a tiny step so easy you can't say no. Progress, not perfection.", zh: "不想动？给你一个小到没法拒绝的步骤。要的是进步，不是完美。" },
  "landing.feature3": { en: "Earn Social Media Time", zh: "做任务换刷手机" },
  "landing.feature3.desc": { en: "Complete tasks, earn guilt-free scrolling. +10 min per task finished.", zh: "完成任务就能心安理得地刷手机。每个任务 +10 分钟。" },
  "header.logout": { en: "Logout", zh: "退出" },
};

const acks: Record<Lang, string[]> = {
  en: ["Copy that", "Got it", "Noted", "On the list", "Logged", "Captured"],
  zh: ["收到", "了解", "记下了", "安排上了", "OK", "搞定"],
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
