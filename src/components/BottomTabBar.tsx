export type PhaseTab = 'home' | 'settings';

const TABS: { id: PhaseTab; label: string }[] = [
  { id: 'home', label: 'Today' },
  { id: 'settings', label: 'Settings' },
];

export function BottomTabBar({
  activeTab,
  onChange,
}: {
  activeTab: PhaseTab;
  onChange: (next: PhaseTab) => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+10px)] pt-3">
      <div className="phase-nav-shell mx-auto grid max-w-md grid-cols-2 gap-2 p-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`phase-tab ${activeTab === item.id ? 'is-active' : ''}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
