// First-run state: a blank app. Nothing pre-filled — the user builds their
// own goals, events and tasks from the empty states on each screen.
export function seedState() {
  return {
    goals: [],
    events: [],
    looseTasks: [],
    completions: {},
    weeklyCompletions: {},
    settings: { hoyVariant: 'a', showCompleted: true, confetti: true },
  };
}
