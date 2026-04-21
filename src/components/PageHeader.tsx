import type { ReactNode } from 'react';

export function PageHeader({ eyebrow, title }: { eyebrow?: string; title: ReactNode }) {
  return (
    <header className="phase-page-header shrink-0 px-5 pb-4 pt-[max(18px,env(safe-area-inset-top,0px)+10px)]">
      {eyebrow ? <div className="phase-eyebrow mb-3">{eyebrow}</div> : null}
      <h1 className="phase-page-title">{title}</h1>
    </header>
  );
}
