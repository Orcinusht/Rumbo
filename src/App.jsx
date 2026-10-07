import React from 'react';
import { StoreProvider } from './state/store';
import { UiProvider, useUi } from './state/ui';
import { FxProvider } from './components/ui/Fx';
import { TabBar } from './components/TabBar';
import { HoyScreen } from './components/screens/HoyScreen';
import { CalendarScreen } from './components/screens/CalendarScreen';
import { MetasListScreen } from './components/screens/MetasListScreen';
import { GoalDetailScreen } from './components/screens/GoalDetailScreen';
import { WeeklyDetailScreen } from './components/screens/WeeklyDetailScreen';
import { PerfilScreen } from './components/screens/PerfilScreen';
import { NoteSheet } from './components/sheets/NoteSheet';
import { AddTaskSheet } from './components/sheets/AddTaskSheet';
import { EditorSheet } from './components/sheets/EditorSheet';
import { EventSheet } from './components/sheets/EventSheet';
import { RemindersSheet } from './components/sheets/RemindersSheet';
import { SuggestSheet } from './components/sheets/SuggestSheet';
import { PlannerSheet } from './components/sheets/PlannerSheet';
import { GoalWizard } from './components/wizard/GoalWizard';

function Screens() {
  const { tab, openGoalId, openWeeklyId } = useUi();
  if (tab === 'calendario') return <CalendarScreen />;
  if (tab === 'metas') {
    if (openGoalId && openWeeklyId) return <WeeklyDetailScreen />;
    if (openGoalId) return <GoalDetailScreen />;
    return <MetasListScreen />;
  }
  if (tab === 'perfil') return <PerfilScreen />;
  return <HoyScreen />;
}

function Overlays() {
  const { noteRef, addDraft, editor, eventDraft, remindersOpen, wizard, suggestDraft, plannerOpen } = useUi();
  return (
    <>
      {noteRef && <NoteSheet />}
      {addDraft && <AddTaskSheet />}
      {editor && <EditorSheet />}
      {eventDraft && <EventSheet />}
      {remindersOpen && <RemindersSheet />}
      {wizard && <GoalWizard />}
      {suggestDraft && <SuggestSheet />}
      {plannerOpen && <PlannerSheet />}
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <UiProvider>
        <div className="app-shell">
          <FxProvider>
            <div className="app-scroll">
              <Screens />
            </div>
            <TabBar />
            <Overlays />
          </FxProvider>
        </div>
      </UiProvider>
    </StoreProvider>
  );
}
