interface Props {
  connected: boolean;
  /** Null while on-chain state is still loading. */
  initialized: boolean | null;
}

const LABELS = ['Connect wallet', 'Initialize', 'Increment +1'] as const;

/** Journey indicator: connect → initialize (once) → increment (repeat). */
export function Steps({ connected, initialized }: Props) {
  const states: Array<'done' | 'active' | 'todo'> = [
    connected ? 'done' : 'active',
    !connected ? 'todo' : initialized === true ? 'done' : 'active',
    !connected || initialized !== true ? 'todo' : 'active',
  ];

  return (
    <ol className="steps" aria-label="Getting started">
      {LABELS.map((label, i) => (
        <li key={label} className={`step ${states[i]}`} aria-current={states[i] === 'active' ? 'step' : undefined}>
          <span className="n">{states[i] === 'done' ? '✓' : i + 1}</span>
          <br />
          {label}
        </li>
      ))}
    </ol>
  );
}
