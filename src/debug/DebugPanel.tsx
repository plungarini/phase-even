import { useState } from 'react';

import { clearDebugLogs, useDebugLogs, type DebugLogEntry } from './logs';

function formatDetails(details: unknown[]): string {
  return details
    .map((detail, index) => {
      if (typeof detail === 'string') return `[Arg ${index + 1}] ${detail}`;
      try {
        return `[Arg ${index + 1}] ${JSON.stringify(detail, null, 2)}`;
      } catch {
        return `[Arg ${index + 1}] ${String(detail)}`;
      }
    })
    .join('\n\n');
}

function logsToText(logs: DebugLogEntry[]): string {
  return logs
    .map((entry) => {
      const time = new Date(entry.ts).toLocaleTimeString('en-GB', { hour12: false });
      const base = `[${time}] ${entry.level.toUpperCase()} ${entry.msg}`;
      if (!entry.details?.length) return base;
      return `${base}\n${formatDetails(entry.details)}`;
    })
    .join('\n\n');
}

export function DebugPanel() {
  const logs = useDebugLogs();
  const [open, setOpen] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const errorCount = logs.filter((log) => log.level === 'error').length;
  const warnCount = logs.filter((log) => log.level === 'warn').length;

  const handleCopy = () => {
    const text = logsToText(logs);
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        console.log('[DebugPanel] copied logs to clipboard');
      } else {
        console.error('[DebugPanel] execCommand copy was unsuccessful');
      }
    } catch (err) {
      console.error('[DebugPanel] execCommand copy failed', err);
    } finally {
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className="dbg-root">
      <button
        type="button"
        className={`dbg-toggle ${errorCount > 0 ? 'dbg-toggle--error' : warnCount > 0 ? 'dbg-toggle--warn' : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-label="Toggle debug panel"
      >
        dbg {logs.length}
      </button>

      {open ? (
        <div className="dbg-panel">
          <div className="dbg-header">
            <span className="dbg-title">Debug Logs</span>
            <button type="button" className="dbg-clear" onClick={handleCopy}>
              copy
            </button>
            <button type="button" className="dbg-clear" onClick={clearDebugLogs}>
              clear
            </button>
            <button type="button" className="dbg-close" onClick={() => setOpen(false)}>
              x
            </button>
          </div>
          <div className="dbg-list">
            {logs.length === 0 ? <p className="dbg-empty">No logs yet.</p> : null}
            {[...logs].reverse().map((entry, index) => {
              const isExpanded = expandedIdx === index;
              const time = new Date(entry.ts).toLocaleTimeString('en-GB', { hour12: false });
              return (
                <button
                  key={`${entry.ts}-${index}`}
                  type="button"
                  className={`dbg-entry dbg-entry--${entry.level}`}
                  onClick={() => setExpandedIdx(isExpanded ? null : index)}
                >
                  <span className="dbg-time">{time}</span>
                  <span className="dbg-level">{entry.level}</span>
                  <span className="dbg-msg">{entry.msg}</span>
                  {isExpanded && entry.details?.length ? (
                    <pre className="dbg-detail">{formatDetails(entry.details)}</pre>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
