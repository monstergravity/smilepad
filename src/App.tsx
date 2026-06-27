import { FormEvent, useMemo, useState } from 'react';
import { emailPatternSource, isValidEmail } from './lib/emailValidation';
import { isSupabaseConfigured, supabase } from './lib/supabase';

type FormState = 'idle' | 'loading' | 'success' | 'error';

type WaitlistFormProps = {
  compact?: boolean;
  label: string;
};

function HeartIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20.3 4.8 13.8C.8 10.2 3.4 3.5 8.8 5.1c1.5.4 2.6 1.5 3.2 2.8.6-1.3 1.7-2.4 3.2-2.8 5.4-1.6 8 5.1 4 8.7L12 20.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function StarIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.7 14.5 9l6.8 1-4.9 4.7 1.1 6.7L12 18.2l-5.5 3.2 1.1-6.7L2.7 10l6.8-1L12 2.7Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function CloudIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" aria-hidden="true">
      <path
        d="M15.6 25.6h21.1a8.1 8.1 0 0 0 1.4-16.1A11.5 11.5 0 0 0 16 8.1a8.8 8.8 0 0 0-.4 17.5Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function CalendarIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <rect x="8" y="10" width="32" height="30" rx="7" fill="#fff6f9" stroke="currentColor" strokeWidth="2" />
      <path d="M8 19h32" stroke="currentColor" strokeWidth="2" />
      <path d="M17 7v7M31 7v7" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M18 31c2.5 3.7 9.5 3.7 12 0" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
      <circle cx="18" cy="27" r="1.8" fill="currentColor" />
      <circle cx="30" cy="27" r="1.8" fill="currentColor" />
    </svg>
  );
}

function ShieldIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path
        d="M24 6 38 11v11.2C38 32 31.9 39 24 42 16.1 39 10 32 10 22.2V11l14-5Z"
        fill="#e7fff6"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="m17.5 24 4.4 4.5 9.2-10" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.6" />
    </svg>
  );
}

function BagIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M13 18h22l3 23H10l3-23Z" fill="#edf8ff" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
      <path d="M18 18v-3a6 6 0 0 1 12 0v3" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M20 30c1.9 2.5 6.1 2.5 8 0" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function LockIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 10V8a5 5 0 0 1 10 0v2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <rect x="5.5" y="10" width="13" height="10" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function SmileMark() {
  return (
    <span className="smile-mark" aria-hidden="true">
      <span />
    </span>
  );
}

function Logo() {
  return (
    <a className="logo" href="#top" aria-label="SmilePad home">
      <SmileMark />
      <span className="logo-word">SmilePad</span>
      <HeartIcon className="logo-heart" />
      <small>Your first period friend</small>
    </a>
  );
}

function WaitlistForm({ compact = false, label }: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<FormState>('idle');
  const [message, setMessage] = useState('');

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidEmail(normalizedEmail)) {
      setState('error');
      setMessage('Please enter a valid email, like name@example.com.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setState('error');
      setMessage('The waitlist is almost ready. Supabase credentials still need to be added.');
      return;
    }

    setState('loading');
    setMessage('');

    const { error } = await supabase.from('waitlist_signups').insert({
      email: normalizedEmail,
      source: 'homepage',
      locale: 'en-US',
    });

    if (!error || error.code === '23505') {
      setState('success');
      setMessage("You're on the SmilePad waitlist. We will email when the first kit is ready.");
      setEmail('');
      return;
    }

    setState('error');
    setMessage(
      error.code === 'PGRST205'
        ? 'The waitlist database is being connected. Please try again soon.'
        : 'Something did not go through. Please try again in a moment.',
    );
  }

  return (
    <div className={compact ? 'waitlist compact' : 'waitlist'}>
      <form onSubmit={handleSubmit} noValidate aria-label={label}>
        <label className="sr-only" htmlFor={compact ? 'waitlist-email-footer' : 'waitlist-email'}>
          Parent or caregiver email
        </label>
        <input
          id={compact ? 'waitlist-email-footer' : 'waitlist-email'}
          type="email"
          inputMode="email"
          autoComplete="email"
          pattern={emailPatternSource}
          placeholder="Parent or caregiver email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (state !== 'loading') {
              setState('idle');
              setMessage('');
            }
          }}
          aria-invalid={state === 'error'}
          aria-describedby={compact ? 'waitlist-note-footer waitlist-status-footer' : 'waitlist-note waitlist-status'}
        />
        <button type="submit" disabled={state === 'loading'}>
          <span>{state === 'loading' ? 'Joining...' : 'Join the waitlist'}</span>
          <HeartIcon />
        </button>
      </form>
      <p className="privacy-note" id={compact ? 'waitlist-note-footer' : 'waitlist-note'}>
        <LockIcon /> For parents and caregivers. No purchase today.
      </p>
      <p
        className={`form-message ${state === 'success' ? 'success' : ''} ${state === 'error' ? 'error' : ''}`}
        id={compact ? 'waitlist-status-footer' : 'waitlist-status'}
        role={state === 'idle' ? undefined : 'status'}
      >
        {message}
      </p>
    </div>
  );
}

function Header() {
  return (
    <header className="site-header">
      <Logo />
      <nav aria-label="Primary navigation">
        <a href="#kit">The Kit</a>
        <a href="#parents">For Parents</a>
        <a href="#waitlist">Waitlist</a>
      </nav>
      <a className="header-cta" href="#waitlist">
        Join Waitlist <HeartIcon />
      </a>
    </header>
  );
}

function ProductShowcase() {
  return (
    <div className="product-showcase" aria-label="SmilePad first-period kit preview">
      <picture className="product-photo">
        <source
          srcSet="/assets/hero/smilepad-hero-480.jpg 480w, /assets/hero/smilepad-hero-768.jpg 768w, /assets/hero/smilepad-hero-1100.jpg 1100w, /assets/hero/smilepad-hero-1510.jpg 1510w"
          sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1040px) min(100vw - 48px, 620px), 560px"
          type="image/jpeg"
        />
        <img
          src="/assets/hero/smilepad-hero-1100.jpg"
          width="1510"
          height="1041"
          alt="SmilePad first-period kit with a pink box, welcome card, calendar, printed pad, and brave badge"
          decoding="async"
          fetchPriority="high"
        />
      </picture>
      <StarIcon className="float-star star-one" />
      <HeartIcon className="float-heart heart-one" />
      <CloudIcon className="float-cloud cloud-one" />
    </div>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <StarIcon className="doodle doodle-left" />
        <h1>First period. First smile.</h1>
        <p className="hero-subtitle">A gentle first-period kit made to help growing girls feel safe, prepared, and proud.</p>
        <WaitlistForm label="Join the SmilePad waitlist" />
      </div>
      <ProductShowcase />
    </section>
  );
}

const proofPoints = [
  {
    title: "A note that says it's normal",
    icon: <HeartIcon />,
  },
  {
    title: 'Soft pads with tiny smiles',
    icon: <CloudIcon />,
  },
  {
    title: 'A simple first-period calendar',
    icon: <CalendarIcon />,
  },
];

function ProofStrip() {
  return (
    <section className="proof-strip" aria-labelledby="proof-title">
      <h2 id="proof-title">Made for the first time <HeartIcon /></h2>
      <div className="proof-list">
        {proofPoints.map((point) => (
          <article key={point.title} className="proof-item">
            <span className="proof-icon">{point.icon}</span>
            <h3>{point.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}

const kitItems = [
  {
    title: 'Welcome card',
    description: 'A kind note to help her feel seen and supported.',
    className: 'card-art',
  },
  {
    title: 'Printed pad wrapper',
    description: 'Soft, private, and designed just for her.',
    className: 'wrapper-art',
  },
  {
    title: 'First-period calendar',
    description: 'Track how she feels and celebrate every step.',
    className: 'calendar-art',
  },
  {
    title: 'Smiley badge',
    description: 'A little reminder of how brave she is.',
    className: 'badge-art',
  },
];

function KitArt({ className }: { className: string }) {
  return (
    <div className={`kit-art ${className}`}>
      <SmileMark />
      <StarIcon />
      <HeartIcon />
    </div>
  );
}

function KitSection() {
  return (
    <section className="kit-section" id="kit" aria-labelledby="kit-title">
      <h2 id="kit-title">Inside the SmilePad kit <HeartIcon /></h2>
      <div className="kit-grid">
        {kitItems.map((item) => (
          <article className="kit-card" key={item.title}>
            <KitArt className={item.className} />
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

const parentCues = [
  {
    title: 'Age-aware language',
    description: 'Clear, supportive, and made for her world.',
    icon: <ShieldIcon />,
  },
  {
    title: 'School-bag ready',
    description: 'Discreet and simple to carry anywhere.',
    icon: <BagIcon />,
  },
  {
    title: 'Privacy-friendly waitlist',
    description: "We'll email you when SmilePad is ready.",
    icon: <LockIcon />,
  },
];

function ParentSection() {
  return (
    <section className="parent-section" id="parents" aria-labelledby="parents-title">
      <div className="parent-copy">
        <CloudIcon className="parent-cloud" />
        <h2 id="parents-title">For parents <HeartIcon /></h2>
        <p>You don't have to know every answer. Just help her feel prepared.</p>
      </div>
      <div className="parent-cues">
        {parentCues.map((cue) => (
          <article key={cue.title} className="parent-cue">
            <span>{cue.icon}</span>
            <h3>{cue.title}</h3>
            <p>{cue.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function FinalWaitlist() {
  return (
    <section className="final-waitlist" id="waitlist" aria-labelledby="waitlist-title">
      <div>
        <CloudIcon />
        <h2 id="waitlist-title">Be the first to know <HeartIcon /></h2>
        <p>Join the SmilePad waitlist.</p>
      </div>
      <WaitlistForm compact label="Join the SmilePad waitlist from the footer" />
      <StarIcon className="final-star" />
    </section>
  );
}

function App() {
  return (
    <main className="page-shell">
      <div className="page-frame">
        <Header />
        <Hero />
        <ProofStrip />
        <KitSection />
        <ParentSection />
        <FinalWaitlist />
      </div>
    </main>
  );
}

export default App;
