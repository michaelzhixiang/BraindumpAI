# BrainDump — Comprehensive Bug Fixes & Feature Improvements

Please implement all of the following fixes and features. Address them one at a time in order.

---

## Fix 1: Disappearing Text Input on Mobile

The text input on the Dump page disappears when the mobile keyboard opens on iOS. When the virtual keyboard appears, the input field gets pushed off screen or hidden behind the keyboard.

Fix this by:

1. Do NOT use `height: 100vh` on the main container — use `height: 100dvh` or `min-height: -webkit-fill-available` instead, since `100vh` doesn't account for the mobile keyboard on iOS.
2. Make the bottom input bar use `position: fixed` with `bottom: 0` so it stays visible above the keyboard.
3. Listen for the `visualViewport` resize event to adjust the input position when the keyboard opens and closes:

```js
useEffect(() => {
  const viewport = window.visualViewport;
  if (!viewport) return;

  const onResize = () => {
    const offsetBottom = window.innerHeight - viewport.height - viewport.offsetTop;
    setKeyboardOffset(Math.max(0, offsetBottom));
  };

  viewport.addEventListener('resize', onResize);
  viewport.addEventListener('scroll', onResize);
  return () => {
    viewport.removeEventListener('resize', onResize);
    viewport.removeEventListener('scroll', onResize);
  };
}, []);
```

4. Apply the offset to the input bar's style: `style={{ bottom: keyboardOffset + 'px' }}`
5. Make sure the main content area has enough `padding-bottom` to account for the fixed input bar so nothing is hidden behind it.
6. Test by tapping the input field on mobile and confirming it remains visible with the keyboard open.

---

## Fix 2: Glitchy Drag-and-Drop on Queue Page

The drag-and-drop on the Queue page (reordering items within Focus/Can Wait/Never Mind sections and moving items between sections) is glitchy on mobile. Touch-based dragging doesn't work smoothly.

Fix this by:

1. If using HTML5 native drag-and-drop (`draggable`, `ondragstart`, `ondrop`), **replace it entirely** — native drag-and-drop does NOT work reliably on mobile touch devices. Switch to `@dnd-kit/core` and `@dnd-kit/sortable` (recommended for React).

Install:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

2. Configure touch-friendly sensors:
```js
import { useSensor, useSensors, PointerSensor, TouchSensor, KeyboardSensor } from '@dnd-kit/core';

const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 8 }
  }),
  useSensor(TouchSensor, {
    activationConstraint: { delay: 150, tolerance: 5 }
  }),
  useSensor(KeyboardSensor)
);
```

3. Add `touch-action: none` CSS to all draggable items so the browser doesn't intercept touch events for page scrolling.

4. Use `SortableContext` within each section (Focus, Can Wait, Never Mind) and implement `onDragEnd` logic that handles both:
   - Reordering within the same section (move item up/down in priority)
   - Moving between sections (e.g., drag from Focus to Can Wait) by detecting the `over` container ID

5. The existing grip dots icon should serve as the drag handle. Make ONLY the handle the drag activator to prevent accidental drags when tapping other parts of the task row.

6. Add visual feedback during drag:
   - A subtle drop shadow or scale transform on the dragged item
   - A placeholder/gap indicator showing where the item will land
   - A smooth drop animation (200ms ease) when releasing

7. Test on mobile by:
   - Dragging items up/down within Focus
   - Dragging items from Focus → Can Wait → Never Mind and back
   - Ensuring no janky snapping or items jumping to wrong positions

---

## Fix 3: Collapsible Nudge Text

When a user taps the Nudge button on a task, it currently shows the nudge text but there's no way to collapse it back. Make the nudge text collapsible.

Implementation:

1. Track a `showNudge` boolean state per task (e.g., in the task state object or a separate `expandedNudges` map).
2. First tap on "Nudge" button: fetch the nudge from the API and show the text with a slide-down animation. Change the button appearance to indicate it can be collapsed (e.g., add a chevron-up icon or change label to "Hide nudge").
3. Second tap (on the button or the nudge text area): collapse the text back up with a slide-up animation.
4. **Cache the nudge text** so re-opening doesn't re-fetch from the API. Only re-fetch if the user explicitly requests a new nudge.
5. Use CSS `max-height` transition for a smooth expand/collapse:

```css
.nudge-text {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: max-height 0.3s ease, opacity 0.2s ease;
}

.nudge-text.expanded {
  max-height: 300px;
  opacity: 1;
}
```

6. The nudge text container should have a subtle visual treatment (e.g., slightly different background, left border accent) so it's clearly associated with its task but visually distinct from the task title.

---

## Fix 4: Smarter Nudge Prompt Engineering (Context-Aware Nudges)

The current nudge/task breakdown feature is too generic. It doesn't consider prerequisites, user intent, or the context of other tasks. For example:
- "Send resume to Greg" produces "Open your browser and put Greg as the email recipient" — but this ignores whether the user even has a resume ready.
- "Research Scale AI" produces generic advice to visit their website, when the user actually means "research open positions at Scale AI" (inferable from their other job-search tasks).

**Replace the current nudge system prompt with this improved version:**

```
You are a productivity coach helping someone take immediate action on a task. The user tends to overthink and get stuck in analysis paralysis, so your job is to unblock them with the single most useful next micro-action they can do in under 2 minutes.

CONTEXT — here are their other active tasks (use these to infer intent):
{otherTasks}

The task they want a nudge on: "{taskTitle}"

Before responding, think through these steps internally (do NOT include this reasoning in your response):
1. What is the REAL intent behind this task, given their other tasks as context?
2. What would "done" look like for this task?
3. What prerequisites might they be missing or assuming they've handled? (e.g., do they have the file/document/contact info they need?)
4. What is the most common blocker for someone with this type of task?
5. What is the smallest concrete action they can do RIGHT NOW in under 2 minutes to make progress?

RULES:
- Start your response with a verb (an action word).
- If there's a likely prerequisite they haven't handled, address that FIRST before the main action.
- Keep it to 2-3 sentences max. Be conversational, not robotic.
- Be specific: mention actual tools, apps, or websites when relevant.
- Never state the obvious (e.g., don't say "open your browser"). Start from where real friction begins.
- If the task is ambiguous, make your best inference from context and go with it.
```

When calling the API for a nudge, always include the user's other active task titles from all sections (Focus, Can Wait) as the `{otherTasks}` variable. This gives the AI the context it needs to infer intent.

---

## Fix 5: Iterative "5 Nudges to 60%" System

Replace the single-nudge model with an iterative progressive nudge system. The concept: 5 sequential nudges should get a user roughly 60% of the way through any task. Each nudge builds on the previous ones and addresses the next blocker.

### How it works:

1. **Nudge counter per task**: Track `nudgeCount` (0-5) and `nudgeHistory` (array of past nudge texts) per task in state.

2. **First nudge** (nudgeCount = 0): Use the prompt from Fix 4 above to generate the first micro-action addressing the earliest prerequisite or blocker.

3. **Subsequent nudges** (nudgeCount 1-4): When the user taps "Next nudge" (or a "Got it, what's next?" button), generate the next nudge using this prompt:

```
You are a productivity coach helping someone make progress on a task through a series of small nudges. Each nudge should be a micro-action completable in under 2 minutes.

CONTEXT — their other active tasks:
{otherTasks}

The task: "{taskTitle}"

Previous nudges you've already given (they've completed or acknowledged these):
{nudgeHistory}

This is nudge {currentNudgeNumber} of 5. By nudge 5, the user should be roughly 60% done with the overall task — meaning all the preparation, research, and setup is handled, and what remains is just the core execution.

Progression guide:
- Nudge 1: Address the earliest prerequisite or blocker
- Nudge 2: Gather or prepare the key materials/information needed
- Nudge 3: Set up the environment or draft the core deliverable
- Nudge 4: Refine or review what they've prepared
- Nudge 5: Position them to execute the final action (send, submit, publish, etc.)

RULES:
- Start with a verb.
- 2-3 sentences max, conversational tone.
- Don't repeat any action from previous nudges.
- Be specific to THIS task — reference actual tools, files, or steps.
- Account for what they've likely already done based on the previous nudges.
```

4. **UI for iterative nudges**:
   - Show a small progress indicator: "Nudge 1/5", "Nudge 2/5", etc.
   - After showing a nudge, display two buttons:
     - "Got it, what's next?" → fetches next nudge (increments counter)
     - Collapse/hide button (from Fix 3)
   - After nudge 5, show a completion message like: "You're 60% there — the hard part's done. Now just execute! 💪"
   - After nudge 5, the "Got it, what's next?" button disappears and is replaced with just the collapse button.
   - The progress indicator (1/5, 2/5, etc.) should use a subtle visual like small dots or a mini progress bar, keeping it lightweight and not overwhelming.

5. **Nudge history caching**: Store all generated nudges per task so the user can collapse and re-expand without re-fetching. If they navigate away and come back, the nudge history should persist (store in the same place as tasks — local storage or database).

---

## Implementation Order

Please implement these in this order:
1. Fix 1 (disappearing input) — most critical, blocks basic functionality
2. Fix 3 (collapsible nudge) — simpler UI fix, sets up the foundation for Fix 5
3. Fix 4 (smarter nudge prompts) — improves quality of nudge content
4. Fix 5 (iterative 5-nudge system) — builds on fixes 3 and 4
5. Fix 2 (drag-and-drop) — larger refactor, can be done independently

After each fix, test on mobile (iOS Safari) to verify it works correctly.
