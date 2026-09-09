import { useState } from 'react';

type Role = 'student' | 'college';

const KEY = 'offerstats-pilot-waitlist';

/**
 * Pilot join form. Local-only waitlist (no backend yet): entries persist in
 * this browser and are shown back as confirmation. The pilot coordinator
 * exports them on demo day.
 */
export function JoinPage() {
  const [role, setRole] = useState<Role>('student');
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [email, setEmail] = useState('');
  const [extra, setExtra] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!name.trim() || !org.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please fill your name, college, and a valid email.');
      return;
    }
    setError(null);
    try {
      const raw = localStorage.getItem(KEY);
      const list = raw ? (JSON.parse(raw) as unknown[]) : [];
      list.push({ role, name: name.trim(), org: org.trim(), email: email.trim(), extra: extra.trim(), at: new Date().toISOString() });
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
      // Private browsing: confirm without persisting.
    }
    setDone(true);
  };

  return (
    <>
      <section className="hero-block">
        <p className="kicker">Join the pilot</p>
        <h1 className="mega">
          Create your <em>account.</em>
        </h1>
        <p className="lede">
          Join a community building a more transparent future. One batch proves first.
        </p>
      </section>

      <section className="card" aria-label="Pilot signup">
        {done ? (
          <div className="ok" role="status" style={{ marginTop: 0 }}>
            <b>You&apos;re on the pilot list{ name ? `, ${name.split(' ')[0]}` : ''}.</b>
            <p className="muted" style={{ margin: '0.4rem 0 0' }}>
              When your batch opens, you&apos;ll prove your offer (or open the board) —
              gasless, on your phone, in minutes.
            </p>
          </div>
        ) : (
          <>
            <div className="toggle" role="group" aria-label="I am a">
              {(['student', 'college'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`toggle-opt${role === r ? ' active' : ''}`}
                  aria-pressed={role === r}
                  onClick={() => setRole(r)}
                >
                  {r === 'student' ? 'Student' : 'College'}
                </button>
              ))}
            </div>

            <label className="label" htmlFor="join-name">Full Name</label>
            <input id="join-name" className="field" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aarav Sharma" />

            <label className="label" htmlFor="join-org">College / University</label>
            <input id="join-org" className="field" autoComplete="organization" value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Your college" />

            <label className="label" htmlFor="join-email">Email Address</label>
            <input id="join-email" className="field" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" />

            <label className="label" htmlFor="join-extra">
              {role === 'student' ? 'Graduation Year' : 'Approx. Batch Size'}
            </label>
            <input id="join-extra" className="field" inputMode="numeric" value={extra} onChange={(e) => setExtra(e.target.value)} placeholder={role === 'student' ? '2026' : '120'} />

            {error && (
              <div className="error" role="alert">
                <p style={{ margin: 0 }}>{error}</p>
              </div>
            )}

            <div>
              <button type="button" onClick={submit}>Create Account</button>
            </div>
            <p className="muted tiny" style={{ marginBottom: 0 }}>
              Pilot list only — no spam, no passwords stored anywhere yet.
            </p>
          </>
        )}
      </section>
    </>
  );
}
