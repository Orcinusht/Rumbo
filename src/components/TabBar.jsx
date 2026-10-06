import React from 'react';
import { ListChecks, CalendarBlank, Target, ChartBar } from '@phosphor-icons/react';
import { useUi } from '../state/ui';

const TABS = [
  { key: 'hoy', label: 'Hoy', Icon: ListChecks },
  { key: 'calendario', label: 'Calendario', Icon: CalendarBlank },
  { key: 'metas', label: 'Metas', Icon: Target },
  { key: 'perfil', label: 'Progreso', Icon: ChartBar },
];

export function TabBar() {
  const { tab, setTab } = useUi();
  return (
    <div className="tab-bar">
      {TABS.map(({ key, label, Icon }) => {
        const active = tab === key;
        return (
          <button key={key} type="button" className={active ? 'active' : ''} onClick={() => setTab(key)}>
            <Icon size={23} weight={active ? 'fill' : 'bold'} />
            <span className="tab-label">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
