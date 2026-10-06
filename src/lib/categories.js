import { Heartbeat, Briefcase, Books, PiggyBank, Plant } from '@phosphor-icons/react';

// The five goal categories, each with its own vivid accent color.
export const CATEGORIES = {
  salud: { key: 'salud', label: 'Salud', ink: 'var(--cat-salud-ink)', fill: 'var(--cat-salud-fill)', tint: 'var(--cat-salud-tint)', Icon: Heartbeat },
  trabajo: { key: 'trabajo', label: 'Trabajo', ink: 'var(--cat-trabajo-ink)', fill: 'var(--cat-trabajo-fill)', tint: 'var(--cat-trabajo-tint)', Icon: Briefcase },
  estudio: { key: 'estudio', label: 'Estudio', ink: 'var(--cat-estudio-ink)', fill: 'var(--cat-estudio-fill)', tint: 'var(--cat-estudio-tint)', Icon: Books },
  finanzas: { key: 'finanzas', label: 'Finanzas', ink: 'var(--cat-finanzas-ink)', fill: 'var(--cat-finanzas-fill)', tint: 'var(--cat-finanzas-tint)', Icon: PiggyBank },
  personal: { key: 'personal', label: 'Personal', ink: 'var(--cat-personal-ink)', fill: 'var(--cat-personal-fill)', tint: 'var(--cat-personal-tint)', Icon: Plant },
};

export const CATEGORY_ORDER = ['salud', 'trabajo', 'estudio', 'finanzas', 'personal'];
