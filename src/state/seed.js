// Seed content, ported from the Rumbo.dc.html prototype's demo data.
// Dates are real ISO dates in September 2026 (the month/day the prototype
// was designed around) so opening the app "today" reproduces the same
// walkthrough; from then on everything is computed against the real date.

const ALL_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function seedState() {
  return {
    goals: [
      {
        id: 'g1', catId: 'personal', title: 'Dejar de morderme las uñas',
        target: '60 días seguidos sin morderme',
        weekly: [
          { id: 'g1w1', text: 'Siete días seguidos sin morderme', done: true, daily: [
            { id: 'g1w1d1', text: 'Registrar el día sin morderme las uñas', days: [...ALL_DAYS] },
          ] },
          { id: 'g1w2', text: 'Cortar y limar las uñas el domingo', done: true, daily: [
            { id: 'g1w2d1', text: 'Crema de manos por la noche', days: ['M', 'J'] },
          ] },
          { id: 'g1w3', text: 'Anotar cada recaída y su contexto', done: false, daily: [] },
        ],
      },
      {
        id: 'g2', catId: 'estudio', title: 'Profesionalizarme de la IA',
        target: '9 módulos del curso completados',
        weekly: [
          { id: 'g2w1', text: 'Terminar un módulo del curso', done: true, daily: [
            { id: 'g2w1d1', text: 'Curso de LLMs · módulo 4', days: ['L', 'M', 'X', 'J', 'V'] },
            { id: 'g2w1d2', text: 'Repaso de conceptos, 15 min', days: ['S', 'D'] },
          ] },
          { id: 'g2w2', text: 'Leer un paper y resumirlo', done: true, daily: [
            { id: 'g2w2d1', text: 'Leer 20 min antes de dormir', days: ['S', 'D'] },
          ] },
          { id: 'g2w3', text: 'Publicar un apunte en el blog', done: false, daily: [] },
        ],
      },
      {
        id: 'g3', catId: 'trabajo', title: 'Crear bots de apuestas deportivas',
        target: '3 bots en producción',
        weekly: [
          { id: 'g3w1', text: 'Un backtest completo por liga', done: true, daily: [
            { id: 'g3w1d1', text: 'Backtest del bot: liga inglesa', days: ['L', 'X', 'V'] },
          ] },
          { id: 'g3w2', text: 'Revisar el bankroll y el riesgo', done: false, daily: [
            { id: 'g3w2d1', text: 'Registrar resultados del día', days: ['M', 'X', 'J', 'V'] },
          ] },
          { id: 'g3w3', text: 'Documentar la estrategia', done: false, daily: [] },
        ],
      },
      {
        id: 'g4', catId: 'salud', title: 'Correr 10 km sin parar',
        target: 'Mejor marca actual: 6,4 km',
        weekly: [
          { id: 'g4w1', text: 'Tres salidas de carrera', done: true, daily: [
            { id: 'g4w1d1', text: 'Rodaje suave de 5 km', days: ['L', 'X', 'V', 'D'] },
          ] },
          { id: 'g4w2', text: 'Una tirada larga el domingo', done: false, daily: [] },
          { id: 'g4w3', text: 'Estiramientos dos días', done: true, daily: [
            { id: 'g4w3d1', text: 'Estirar 10 min', days: ['M', 'J'] },
          ] },
        ],
      },
      {
        id: 'g5', catId: 'finanzas', title: 'Ahorrar 6.000 €',
        target: '6.000 € a final de año',
        weekly: [
          { id: 'g5w1', text: 'Transferir 115 € a la cuenta de ahorro', done: true, daily: [] },
          { id: 'g5w2', text: 'Revisar gastos y clasificarlos', done: false, daily: [
            { id: 'g5w2d1', text: 'Revisar los gastos de la semana', days: [...ALL_DAYS] },
          ] },
        ],
      },
    ],
    events: [
      { id: 'e1', title: 'Llamada con el gestor', type: 'marcada', customLabel: '', date: '2026-09-08', time: '12:00', recurrence: 'once' },
      { id: 'e2', title: 'Cumpleaños de Marta', type: 'cumple', customLabel: '', date: '2026-09-09', time: '', recurrence: 'yearly' },
      { id: 'e3', title: 'Examen de estadística', type: 'examen', customLabel: '', date: '2026-09-11', time: '10:00', recurrence: 'once' },
      { id: 'e4', title: 'Revisión del dentista', type: 'marcada', customLabel: '', date: '2026-09-16', time: '17:30', recurrence: 'once' },
      { id: 'e5', title: 'Vuelo a Bilbao', type: 'otro', customLabel: 'Viaje', date: '2026-09-21', time: '07:40', recurrence: 'once' },
    ],
    looseTasks: [],
    completions: {
      // dailyObjectiveId -> { [isoDate]: { done, note } }
      g1w1d1: { '2026-09-07': { done: true, note: 'Ayer por la noche fue lo peor. Hoy voy mejor.' } },
      g2w1d1: { '2026-09-07': { done: true, note: '' } },
      g4w1d1: { '2026-09-07': { done: true, note: '' } },
    },
    settings: { hoyVariant: 'a', showCompleted: true, confetti: true },
  };
}
