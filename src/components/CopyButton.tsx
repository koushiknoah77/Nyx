import { useCallback, useEffect, useRef, useState } from 'react';

/** Copies `text` on click and flashes a confirmation. No secrets ever pass through here. */
export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API unavailable (permissions): fall back to a prompt-less
      // textarea copy so older setups still work.
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  }, [text]);

  return (
    <button type="button" className={`copybtn${copied ? ' copied' : ''}`} onClick={() => void onCopy()}>
      {copied ? '✓ Copied' : label}
    </button>
  );
}
