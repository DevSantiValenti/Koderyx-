type EventName = 'click_whatsapp' | 'click_presupuesto' | 'form_submit' | 'project_view' | 'click_portfolio';
declare global { interface Window { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[]; } }

export function trackEvent(name: EventName, params: Record<string, string> = {}) {
  try { window.gtag?.('event', name, params); } catch { /* Analytics nunca bloquea la navegación ni el formulario. */ }
}

document.addEventListener('click', event => {
  const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-event]') : null;
  if (!target?.dataset.event) return;
  trackEvent(target.dataset.event as EventName, { location: window.location.pathname });
});
const project = document.querySelector<HTMLElement>('[data-project]');
if (project?.dataset.project) trackEvent('project_view', { project: project.dataset.project });
