import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, animate, useInView, useReducedMotion } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaInstagram } from 'react-icons/fa';

// ─── Cloudinary helper ────────────────────────────────────────────────
const cld = (id, w = 800) =>
  `https://res.cloudinary.com/djkrjogje/image/upload/f_auto,q_auto,w_${w},dpr_auto/${id}`;
const cldSet = (id) =>
  `${cld(id, 400)} 400w, ${cld(id, 800)} 800w, ${cld(id, 1200)} 1200w`;

const API = import.meta.env.VITE_API_URL;
const EASE = [0.22, 1, 0.36, 1];

// ─── Small building blocks ────────────────────────────────────────────
const Reveal = ({ children, delay = 0, y = 24, className, as = 'div', ...rest }) => {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </M>
  );
};

const SectionHeader = ({ eyebrow, title, sub, id, align = 'center' }) => (
  <Reveal className={`h-head h-head-${align}`}>
    <span className="h-eyebrow"><span className="h-eyebrow-dot" />{eyebrow}</span>
    <h2 id={id} className="h-heading">{title}</h2>
    {sub && <p className="h-sub">{sub}</p>}
  </Reveal>
);

const FadeImg = ({ id, alt, className = '', sizes = '(max-width:768px) 100vw, 800px', eager = false }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="h-fade-wrap">
      {!loaded && <div className="h-skel" aria-hidden="true" />}
      <img
        src={cld(id, 800)} srcSet={cldSet(id)} sizes={sizes} alt={alt}
        loading={eager ? 'eager' : 'lazy'} decoding="async"
        className={`${className} h-img-fade${loaded ? ' h-img-vis' : ''}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

const Counter = ({ value, prefix = '', suffix = '', duration = 1.8 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) { setN(value); return; }
    const c = animate(0, value, { duration, ease: 'easeOut', onUpdate: setN });
    return () => c.stop();
  }, [inView, value, duration, reduce]);
  return <span ref={ref}>{prefix}{Math.round(n).toLocaleString()}{suffix}</span>;
};

const Arrow = ({ dir = 'right', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d={dir === 'right' ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ArrowLong = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Value icons ──────────────────────────────────────────────────────
const ICONS = {
  sisterhood: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />,
  excellence: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  service:    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />,
  empower:    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
};
const Icon = ({ name }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {ICONS[name]}
  </svg>
);

// ─── EVENTS ───────────────────────────────────────────────────────────
const EVENT_TYPES = {
  gathering: { label: 'Gathering', color: '#E8547A', bg: '#FDF1F4' },
  birthday:  { label: 'Birthday',  color: '#f97316', bg: '#fff7ed' },
  reunion:   { label: 'Reunion',   color: '#8b5cf6', bg: '#f5f3ff' },
  memorial:  { label: 'Memorial',  color: '#0ea5e9', bg: '#f0f9ff' },
};

const EventCard = ({ event, delay }) => {
  const type = EVENT_TYPES[event.type] || EVENT_TYPES.gathering;
  const date = new Date(event.date);
  const hasTime = event.date?.includes('T') && !event.date?.endsWith('T00:00:00.000Z');
  return (
    <Reveal delay={delay} className="h-event" style={{ '--ec': type.color, '--ebg': type.bg }}>
      <div className="h-event-top">
        <div className="h-event-cal">
          <span className="h-event-month">{date.toLocaleDateString('en-GB', { month: 'short' })}</span>
          <span className="h-event-day">{date.getDate()}</span>
        </div>
        <span className="h-event-pill">{type.label}</span>
      </div>
      <h3 className="h-event-title">{event.title}</h3>
      {event.description && <p className="h-event-desc">{event.description}</p>}
      <div className="h-event-meta">
        <span>
          {date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric' })}
          {hasTime && ` · ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`}
        </span>
        {event.location && (
          <span className="h-event-loc">
            <svg width="10" height="13" viewBox="0 0 10 13" fill="none" aria-hidden="true">
              <path d="M5 0C2.794 0 1 1.794 1 4c0 3 4 9 4 9s4-6 4-9c0-2.206-1.794-4-4-4zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="currentColor" />
            </svg>
            {event.location}
          </span>
        )}
      </div>
      <div className="h-event-foot">A Time for Sisters</div>
    </Reveal>
  );
};

const UpcomingEvents = ({ events }) => {
  const upcoming = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 6);

  return (
    <section className="h-section h-tinted" aria-labelledby="events-heading">
      <div className="h-container">
        <SectionHeader
          id="events-heading" eyebrow="What's Coming"
          title={<>Upcoming <em>Events</em></>}
          sub={upcoming.length
            ? `${upcoming.length} moment${upcoming.length !== 1 ? 's' : ''} to look forward to`
            : 'Stay tuned for upcoming gatherings'}
        />
        {upcoming.length === 0 ? (
          <div className="h-empty">No upcoming events yet — but the next one will be magical.</div>
        ) : (
          <div className={`h-events${upcoming.length === 1 ? ' h-events-single' : ''}`}>
            {upcoming.map((ev, i) => <EventCard key={ev._id} event={ev} delay={i * 0.06} />)}
          </div>
        )}
      </div>
    </section>
  );
};

// ─── NEWS ─────────────────────────────────────────────────────────────
const NEWS_MS = 6000;
const LatestNews = ({ news }) => {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (news.length <= 1 || paused) return;
    const t = setInterval(() => setIdx(p => (p + 1) % news.length), NEWS_MS);
    return () => clearInterval(t);
  }, [news.length, paused]);

  const item = news[idx];
  const authed = typeof window !== 'undefined' && localStorage.getItem('token');

  return (
    <section className="h-section h-white" aria-labelledby="news-heading">
      <div className="h-container">
        <SectionHeader id="news-heading" eyebrow="Stay Informed" title={<>Latest <em>News</em></>} />
        {news.length === 0 ? (
          <div className="h-empty">No news yet — check back soon!</div>
        ) : (
          <Reveal className="h-news" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <div className="h-news-index" aria-hidden="true">
              <span className="h-news-num">{String(idx + 1).padStart(2, '0')}</span>
              <span className="h-news-total">/ {String(news.length).padStart(2, '0')}</span>
            </div>
            <div className="h-news-main">
              <AnimatePresence mode="wait">
                <motion.article key={idx}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.4, ease: EASE }}>
                  <p className="h-news-meta">
                    {item?.author?.name || 'Admin'} · {new Date(item?.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <h3 className="h-news-title">{item?.title}</h3>
                  <p className="h-news-preview">{item?.content}</p>
                  <Link
                    to={authed ? `/news/${item?._id}` : `/login?redirect=/news/${item?._id}`}
                    className="h-link"
                  >
                    Read full story <ArrowLong />
                  </Link>
                </motion.article>
              </AnimatePresence>

              {news.length > 1 && (
                <div className="h-news-nav">
                  <div className="h-news-bars">
                    {news.map((_, i) => (
                      <button key={i} className="h-news-bar" onClick={() => setIdx(i)} aria-label={`News ${i + 1}`}>
                        <span
                          key={`${idx}-${paused}`}
                          className={`h-news-bar-fill${i < idx ? ' done' : ''}${i === idx ? ' active' : ''}${paused ? ' paused' : ''}`}
                          style={{ animationDuration: `${NEWS_MS}ms` }}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="h-round-btns">
                    <button className="h-round" onClick={() => setIdx(p => (p - 1 + news.length) % news.length)} aria-label="Previous"><Arrow dir="left" /></button>
                    <button className="h-round" onClick={() => setIdx(p => (p + 1) % news.length)} aria-label="Next"><Arrow /></button>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
};

// ─── MEMORY SLIDER ────────────────────────────────────────────────────
const SLIDES = [
  { id: 'v1771403117/KGHS_DAY3_76_vod3we',  caption: 'Day 3 — Celebrations' },
  { id: 'v1771403228/KGHS_DAY3_147_nwkgn2', caption: 'Day 3 — Together Again' },
  { id: 'v1771403303/KGHS_DAY3_183_onoqoy', caption: 'Day 3 — Our Sisters' },
  { id: 'v1771403366/KGHS_DAY3_219_gbcztp', caption: 'Day 3 — Reunion Joy' },
  { id: 'v1771403496/KGHS_DAY3_226_vq6m1k', caption: 'Day 3 — Proud Moments' },
  { id: 'v1771403564/KGHS_DAY3_12_chze2v',  caption: 'Day 3 — Legacy Lives' },
  { id: 'v1771403635/KGHS_DAY3_25_oj2203',  caption: 'Day 3 — Sisterhood' },
  { id: 'v1771403739/KGHS_DAY1_10_qtqmo7',  caption: 'Day 1 — Homecoming' },
  { id: 'v1771403816/KGHS_DAY1_50_s9q13g',  caption: 'Day 1 — Reunited' },
];
const SLIDE_MS = 5000;

const MemorySlider = () => {
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);
  const next = useCallback(() => setCur(c => (c + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCur(c => (c - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, SLIDE_MS);
    return () => clearInterval(t);
  }, [paused, next]);

  const onKey = (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  };

  return (
    <div className="h-gallery">
      <div
        className="h-slider" tabIndex={0} onKeyDown={onKey}
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; setPaused(true); }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - (touchX.current ?? 0);
          if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
          setPaused(false);
        }}
        role="region" aria-roledescription="carousel" aria-label="Journey in Pictures"
      >
        {SLIDES.map((s, i) => (
          <div key={s.id} className={`h-slide${i === cur ? ' on' : ''}`} aria-hidden={i !== cur}>
            <img src={cld(s.id, 1400)} srcSet={cldSet(s.id)} sizes="(max-width:1200px) 100vw, 1200px" alt={s.caption}
              loading={i === 0 ? 'eager' : 'lazy'} decoding="async" className="h-slide-img" />
          </div>
        ))}
        <div className="h-slide-shade" aria-hidden="true" />

        <div className="h-slide-bottom">
          <AnimatePresence mode="wait">
            <motion.span key={cur} className="h-slide-cap"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}>
              {SLIDES[cur].caption}
            </motion.span>
          </AnimatePresence>
          <div className="h-slide-controls">
            <span className="h-slide-count">{String(cur + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}</span>
            <button className="h-glass-btn" onClick={prev} aria-label="Previous photo"><Arrow dir="left" size={18} /></button>
            <button className="h-glass-btn" onClick={next} aria-label="Next photo"><Arrow size={18} /></button>
          </div>
        </div>
        {!paused && (
          <div className="h-slide-prog" key={cur}>
            <div className="h-slide-prog-bar" style={{ animationDuration: `${SLIDE_MS}ms` }} />
          </div>
        )}
      </div>

      <div className="h-thumbs" role="tablist" aria-label="Choose photo">
        {SLIDES.map((s, i) => (
          <button key={s.id} className={`h-thumb${i === cur ? ' on' : ''}`} onClick={() => setCur(i)}
            role="tab" aria-selected={i === cur} aria-label={s.caption}>
            <img src={cld(s.id, 200)} alt="" loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── LEADERSHIP DATA ──────────────────────────────────────────────────
const COMMITTEES = [
  { id: 'trustees', label: 'Board of Trustees', members: ['Dr. Alaro Lawson (BOT/Foundation Chair), 80','Dr. Margaret George Kennedy (Vice Chair), 83','Oris Samuel (Secretary), 96','Harrisonba Sam Sam Jaja (Treasurer), 79','Minini MacBarango (Financial Secretary), 92','Ereminawari Ibama, 91','Obaraemi Warmate, 79','Biobele Iseleye Amachree, 85','Tammy Barango, 84','Victoria Sergeant-Awuse (General Trustee), 82',"Advocate Abiegbe-Tomzine's (Membership/Welfare Chair), 92",'Taire Emmanuel Bailey (Publicity Chair), 92','Omiete Farrell (Fundraising Chair), 80'] },
  { id: 'fundraising', label: 'Fundraising & Events', members: ['Omiete Farrell (Chair), 80','Opakiriba Ofuani, 80','Oribi Isokariari-Higgwe, 80','Obaraemi Warmate, 79','Asolimaa Onyenwuzor, 81','Ene Taylor, 80','Kienma Inifie, 82','Hon. Alaso Johnbull-Obi, 80','Dr. Oribi'] },
  { id: 'publicity', label: 'Publicity & Comms', members: ['Taire Emmanuel Baile (Chair), 92','Alaere Idoniboye-obu (Secretary)','Ese Hart','Soiboma Iyai-Sokari','Mary Samuel-Allasseh, 88','Tonye Dokubo','Ibiba Wariboko, 80'] },
  { id: 'membership', label: 'Membership & Welfare', members: ["Advocate Abiegbe-Tomzine's (Chair), 92",'Courageous Manners (Secretary), 96','Daboingi Erekosima, 83','Gialba Ngeribia, 83','Iwoba Igobo, 82','Christina Erekosima, 83','Ibiye George, 91'] },
  { id: 'other', label: 'Key Roles', members: ['Okorite Martina Akoko (Historian), 80','Courageous Manners (Archivist), 96','OJU ALAIYI GEORGE, PhD (Legal Counsel)'] },
];

const parseMember = (raw) => {
  let name = raw, year = null, role = null;
  const y = name.match(/,\s*(\d{2})\s*$/);
  if (y) { year = y[1]; name = name.slice(0, y.index); }
  const r = name.match(/\s*\(([^)]+)\)\s*/);
  if (r) { role = r[1]; name = name.replace(r[0], ' '); }
  return { name: name.trim(), year, role };
};
const initials = (name) =>
  name.replace(/^(Dr\.|Hon\.|Advocate)\s+/i, '').split(/[\s-]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');

const Leadership = () => {
  const [tab, setTab] = useState('trustees');
  const active = COMMITTEES.find(c => c.id === tab);
  return (
    <section className="h-section h-white" aria-labelledby="exec-heading">
      <div className="h-container">
        <SectionHeader id="exec-heading" eyebrow="Leadership" title={<>Meet Our <em>Executives</em></>}
          sub="The dedicated leaders guiding the Foundation with wisdom, experience, and deep commitment." />
        <Reveal className="h-tabs-wrap">
          <div className="h-tabs" role="tablist" aria-label="Committees">
            {COMMITTEES.map(c => (
              <button key={c.id} role="tab" aria-selected={tab === c.id}
                className={`h-tab${tab === c.id ? ' on' : ''}`} onClick={() => setTab(c.id)}>
                {tab === c.id && <motion.span layoutId="tab-pill" className="h-tab-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                <span className="h-tab-label">{c.label}</span>
              </button>
            ))}
          </div>
        </Reveal>
        <AnimatePresence mode="wait">
          <motion.ul key={tab} className="h-members" role="list"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE }}>
            {active.members.map((m, i) => {
              const p = parseMember(m);
              return (
                <motion.li key={m} className="h-member"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.35 }}>
                  <span className="h-avatar" aria-hidden="true">{initials(p.name)}</span>
                  <div className="h-member-text">
                    <span className="h-member-name">{p.name}</span>
                    <span className="h-member-meta">
                      {p.role && <span className="h-member-role">{p.role}</span>}
                      {p.year && <span className="h-member-year">Class of ’{p.year}</span>}
                    </span>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        </AnimatePresence>
      </div>
    </section>
  );
};

// ─── VALUES ───────────────────────────────────────────────────────────
const VALUES = [
  { icon: 'sisterhood', t: 'Sisterhood',           b: 'Unbreakable bonds of support, trust, and lifelong connection among all KGHS women.' },
  { icon: 'excellence', t: 'Excellence',           b: 'Pursuing the highest standards in education, leadership, and personal achievement.' },
  { icon: 'service',    t: 'Compassion & Service', b: 'Giving back to our community and uplifting those in need with kindness and generosity.' },
  { icon: 'empower',    t: 'Empowerment',          b: 'Equipping every girl and woman with the confidence, skills, and opportunities to lead and succeed globally.' },
];

// ─── MAIN HOME ────────────────────────────────────────────────────────
const Home = () => {
  const [news, setNews]                     = useState([]);
  const [events, setEvents]                 = useState([]);
  const [totalDonated, setTotalDonated]     = useState(0);
  const [donationCount, setDonationCount]   = useState(0);
  const [loadingFinance, setLoadingFinance] = useState(true);
  const [isExpanded, setIsExpanded]         = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    axios.get(`${API}/api/news`).then(r => setNews(r.data.slice(0, 5))).catch(() => {});
    // fetch all events — filtering for upcoming happens in the component
    axios.get(`${API}/api/events`).then(r => setEvents(r.data)).catch(() => {});
    axios.get(`${API}/api/public/donations`)
      .then(r => {
        setTotalDonated(r.data.reduce((s, d) => s + (d.amount || 0), 0));
        setDonationCount(r.data.length);
      })
      .catch(() => {})
      .finally(() => setLoadingFinance(false));
  }, []);

  const goalAmount = 5_000_000;
  const pct = Math.min((totalDonated / goalAmount) * 100, 100);

  return (
    <>
      <style>{CSS}</style>
      <div className="h-root">

        {/* ── HERO ── */}
        <section className="h-hero" aria-label="Welcome">
          <motion.div className="h-hero-bg"
            animate={reduce ? undefined : { scale: [1.04, 1.12] }}
            transition={{ duration: 24, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
            style={{ backgroundImage: `url('${cld('v1771271342/KGHS_DAY1_15_1_jdblve', 1800)}')` }}
          />
          <div className="h-hero-overlay" />
          <div className="h-hero-glow" aria-hidden="true" />

          <div className="h-container h-hero-inner">
            <div className="h-hero-content">
              <motion.span className="h-hero-badge"
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, ease: EASE }}>
                <span className="h-pulse" /> Kalabari Girls' High School · Buguma
              </motion.span>
              <motion.h1 className="h-hero-title"
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.9, ease: EASE }}>
                Welcome to the <em>KGHS Alumni</em> Foundation
              </motion.h1>
              <motion.p className="h-hero-sub"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8, ease: EASE }}>
                Connect · Share · Inspire — a global sisterhood restoring a school and raising the next generation of leaders.
              </motion.p>
              <motion.div className="h-hero-ctas"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.7, ease: EASE }}>
                <Link to="/signup" className="h-btn h-btn-primary">Join Our Community <ArrowLong /></Link>
                <Link to="/donations" className="h-btn h-btn-glass">Donate</Link>
              </motion.div>
            </div>

            <motion.div className="h-hero-stats"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95, duration: 0.8, ease: EASE }}>
              {[['2018', 'Foundation formed'], ['300+', 'Registered members'], ['Restored', 'School reinstated']].map(([v, l]) => (
                <div key={l} className="h-hero-stat">
                  <span className="h-hero-stat-val">{v}</span>
                  <span className="h-hero-stat-label">{l}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.a href="#news-heading" className="h-hero-scroll" aria-label="Scroll down"
            animate={reduce ? undefined : { y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
            <span className="h-hero-scroll-dot" />
          </motion.a>
        </section>

        {/* ── MARQUEE ── */}
        <div className="h-marquee" aria-hidden="true">
          <div className="h-marquee-track">
            {Array.from({ length: 2 }).map((_, k) => (
              <div key={k} className="h-marquee-group">
                {['Sisterhood', 'Excellence', 'Compassion', 'Service', 'Empowerment', 'Legacy', 'Leadership', 'Confidence'].map(w => (
                  <span key={w}>{w}<i>✦</i></span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <LatestNews news={news} />
        <UpcomingEvents events={events} />

        {/* ── OUR STORY ── */}
        <section className="h-section h-white" aria-labelledby="story-heading">
          <div className="h-container h-split">
            <Reveal className="h-media">
              <div className="h-frame">
                <FadeImg id="v1771402872/KGHS_DAY1_5_ulirrc" alt="KGHS alumnae gathered at the school" className="h-img" />
                <div className="h-float-card">
                  <span className="h-float-val">300+</span>
                  <span className="h-float-label">sisters and counting</span>
                </div>
              </div>
            </Reveal>
            <Reveal className="h-copy" delay={0.1}>
              <span className="h-eyebrow"><span className="h-eyebrow-dot" />Our Story</span>
              <h2 id="story-heading" className="h-heading h-left">Journey to <em>Reinstatement</em></h2>

              <ol className="h-timeline" aria-label="Key dates">
                <li><span>2008</span>School closed</li>
                <li><span>2018</span>Foundation formed</li>
                <li><span>Today</span>School restored</li>
              </ol>

              <div className="h-prose">
                <p>Deep in the heart of Buguma, Asari Toru Local Government Area, existed a girls' high school which produced many girls from across the Niger Delta area and beyond. They grew up to become successful women that changed the trajectory of poverty in their respective communities. And then, it was closed.</p>
                <p>The road to reinstatement started from a conversation between a few Ladies — Alaro George-Lawson, Nderiya Princewill Harry and Okorite Akoko at a funeral in Buguma. They shared the idea with Ene Dokiwari-Taylor, whom they knew had always been very passionate about giving back to the school.</p>
                <p>With the use of social media, the concept of the Alumni Foundation was realized in December 2018. A fact-finding mission revealed the deplorable state of the school site — closed in September 2008 when the then State Government erroneously handed it over to the church, which soon abandoned it to dilapidation and ruins.</p>
                <p>This action left high school age girls with nowhere to go — leading to high teen pregnancy rates and criminality in the community. The Foundation has now grown to more than 300 vibrant registered members and, with the help of the Rivers State Government, the school has been restored.</p>
              </div>
              <p className="h-kicker">With the achievement of reinstatement, the goal is to instil competence and confidence in the girls to compete worldwide.</p>
            </Reveal>
          </div>
        </section>

        {/* ── JOURNEY IN PICTURES ── */}
        <section className="h-section h-tinted" aria-labelledby="gallery-heading">
          <div className="h-container">
            <SectionHeader id="gallery-heading" eyebrow="Our Journey" title={<>In <em>Pictures</em></>}
              sub="From the past to the present — moments of resilience, joy, and unbreakable sisterhood." />
            <Reveal delay={0.1}><MemorySlider /></Reveal>
          </div>
        </section>

        {/* ── VISION + VALUES (bento) ── */}
        <section className="h-section h-rose" aria-labelledby="vision-heading">
          <div className="h-container">
            <SectionHeader eyebrow="Looking Forward" id="vision-heading" title={<>Our Vision & <em>Values</em></>} />
            <div className="h-bento">
              <Reveal className="h-bento-vision">
                <div className="h-bento-vision-img">
                  <FadeImg id="v1771403921/KGHS_DAY1_53_gnrwrj" alt="KGHS alumnae" className="h-img h-img-fill" />
                </div>
                <div className="h-bento-vision-text">
                  <span className="h-label">Our Vision</span>
                  <p>To cultivate a global sisterhood of empowered Kalabari Girls' High School alumnae who lead with excellence, compassion, and unwavering confidence — transforming communities, breaking barriers, and inspiring future generations of women to reach their fullest potential.</p>
                  <blockquote className="h-quote">“Building legacies of leadership, one sister at a time.”</blockquote>
                </div>
              </Reveal>

              <Reveal className="h-bento-img" delay={0.08}>
                <FadeImg id="v1771404007/KGHS_DAY1_31_ucwnrp" alt="KGHS alumnae celebrating" className="h-img h-img-fill" />
              </Reveal>

              {VALUES.map((v, i) => (
                <Reveal key={v.t} className="h-value" delay={0.1 + i * 0.06}>
                  <span className="h-value-icon"><Icon name={v.icon} /></span>
                  <h3 className="h-value-title">{v.t}</h3>
                  <p className="h-value-body">{v.b}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Leadership />

        {/* ── ORG STRUCTURE ── */}
        <section className="h-section h-tinted" aria-labelledby="org-heading">
          <div className="h-container">
            <SectionHeader id="org-heading" eyebrow="How We Work" title={<>Our Organizational <em>Structure</em></>}
              sub="How our Board, Committees, and Key Roles work together to support KGHS girls and the alumni community." />
            <Reveal className="h-org">
              <a href="https://i.imgur.com/MXCC7uO.jpg" target="_blank" rel="noopener noreferrer" className="h-org-link">
                <img src="https://i.imgur.com/MXCC7uO.jpg" alt="KGHS Alumni Foundation Organizational Structure" loading="lazy" className="h-org-img" />
                <span className="h-org-hint">View full size ↗</span>
              </a>
            </Reveal>
            <p className="h-caption">Clear leadership and dedicated committees driving our mission forward</p>
          </div>
        </section>

        {/* ── IMPACT + DONATE ── */}
        <section className="h-section h-white" aria-labelledby="impact-heading">
          <div className="h-container">
            <SectionHeader id="impact-heading" eyebrow="Making a Difference" title={<>Our <em>Impact</em> So Far</>}
              sub="Every contribution brings us closer to empowering more KGHS girls. Thank you for your trust and generosity." />

            <div className="h-impact">
              <Reveal className="h-impact-panel">
                {loadingFinance ? (
                  <div className="h-stats">
                    {[0, 1, 2].map(i => <div key={i} className="h-skel h-stat-skel" style={{ animationDelay: `${i * 0.1}s` }} />)}
                  </div>
                ) : (
                  <>
                    <div className="h-stats">
                      <div className="h-stat">
                        <span className="h-stat-val"><Counter value={totalDonated} prefix="₦" /></span>
                        <span className="h-stat-label">Total received</span>
                      </div>
                      <div className="h-stat">
                        <span className="h-stat-val"><Counter value={donationCount} /></span>
                        <span className="h-stat-label">Generous gifts</span>
                      </div>
                      <div className="h-stat">
                        <span className="h-stat-val"><Counter value={pct} suffix="%" /></span>
                        <span className="h-stat-label">Toward our goal</span>
                      </div>
                    </div>
                    <div className="h-progress">
                      <div className="h-progress-track">
                        <motion.div className="h-progress-fill"
                          initial={{ width: 0 }} whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }} transition={{ duration: 2, ease: 'easeOut' }} />
                      </div>
                      <div className="h-progress-labels">
                        <span>₦0</span><span>Goal: ₦{goalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </>
                )}
              </Reveal>

              <Reveal className="h-donate" delay={0.1}>
                <span className="h-label h-label-light">Support the Mission</span>
                <h3 id="donate-heading" className="h-donate-title">Help us <em>empower</em> more girls</h3>
                <p className="h-donate-body">Your contribution funds scholarships, school restoration, mentorship programs, and community initiatives.</p>
                <Link to="/donations" className="h-btn h-btn-white">Donate Now <ArrowLong /></Link>
                <p className="h-donate-note">All donations go directly to supporting KGHS students and programs.</p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── SCHOLARSHIP ── */}
        <section className="h-section h-tinted" aria-labelledby="scholar-heading">
          <div className="h-container h-narrow">
            <Reveal className="h-scholar">
              <div className="h-scholar-head">
                <span className="h-eyebrow"><span className="h-eyebrow-dot" />Explore Our Foundation</span>
                <h2 id="scholar-heading" className="h-heading">Annual Merit-Based <em>Scholarship</em></h2>
                <p className="h-scholar-sub">Empowering Excellence · One Girl at a Time</p>
              </div>
              <div className="h-prose h-center">
                <p>In partnership with the school, we run an inspiring academic challenge for JSS2 students — designed to spark creativity, critical thinking, and healthy competition.</p>
                <p>Top performers earn the <strong>Impact Backpack</strong> — a carefully curated award filled with essential school supplies. In 2024/2025, only three brilliant students qualified — but with your support, more girls can shine.</p>
              </div>

              <div className="h-podium">
                {[['2nd', 'Davidwest Ibiso'], ['1st', 'Batubo Charity Sepiribo'], ['3rd', 'Batubo Soibaa']].map(([rank, name]) => (
                  <div key={rank} className={`h-podium-item h-podium-${rank}`}>
                    <span className="h-podium-rank">{rank}</span>
                    <span className="h-podium-name">{name}</span>
                  </div>
                ))}
              </div>
              <p className="h-caption">2024/2025 winners · Essay: “My First Day at School”</p>

              <button className="h-btn h-btn-outline h-expand" onClick={() => setIsExpanded(e => !e)} aria-expanded={isExpanded}>
                {isExpanded ? 'Show less' : 'Read full details'}
                <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.25 }} style={{ display: 'inline-flex' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div className="h-scholar-detail"
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }}
                    style={{ overflow: 'hidden' }}>
                    <div className="h-scholar-grid">
                      {[
                        ['Program Overview', 'The Foundation, in collaboration with the school Principal and a 5-member Scholarship Panel of Judges, will formulate a stimulative academic exercise for students in JSS2. At the conclusion, 10 top finalists are chosen by the Panel in a double-blinded format for an award determined by the Board of Trustees.'],
                        ['Objective', 'This merit-based scholarship aims to create an environment that fosters quality learning and competitiveness, enabling students to unleash their unique creative abilities. It teaches students to gather good data and assemble it in written form understandable to the reader.'],
                        ['Award: Impact Backpack', 'Backpacks · 80-leaf exercise books · Pens · Pencils · Crayons · Drawing books · Mathematical sets · Rulers.'],
                        ['Eligibility', 'Only JSS2 students achieving at least 70% in English and Mathematics qualify — fostering healthy competition where everyone can excel.'],
                        ['2024/2025 Academic Year', 'Eligible students wrote a 300-word essay on "My First Day at School." Regrettably, only three met the criteria.'],
                      ].map(([title, body]) => (
                        <div key={title} className="h-scholar-block">
                          <h4>{title}</h4>
                          <p>{body}</p>
                        </div>
                      ))}
                    </div>
                    <p className="h-scholar-coda">This is what the Foundation hopes to change — more winners, more impact.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reveal>
          </div>
        </section>

        {/* ── CONSTITUTION ── */}
        <section className="h-section-sm h-white" aria-labelledby="constitution-heading">
          <div className="h-container">
            <Reveal className="h-const">
              <div className="h-const-icon" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                </svg>
              </div>
              <div className="h-const-text">
                <span className="h-label">Governance</span>
                <h2 id="constitution-heading" className="h-const-title">Our Foundation's <em>Constitution</em></h2>
                <p>Transparency and good governance are at the heart of our work. Ratified and signed by the Board.</p>
              </div>
              <a href="https://res.cloudinary.com/djkrjogje/raw/upload/v1771269676/THE_CONSTITUTIONAL_BYELAWS_OF_KGHS_27.08.2025-2_dsqmy3.docx"
                download="KGHS-Alumni-Foundation-Constitution.docx" className="h-btn h-btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Download (.docx)
              </a>
            </Reveal>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="h-footer">
          <div className="h-container">
            <div className="h-footer-grid">
              <div>
                <div className="h-footer-brand">
                  <img src="https://i.imgur.com/WwrdAkS.png" alt="KGHS" className="h-footer-logo" />
                  <span className="h-footer-name">KGHS Alumni</span>
                </div>
                <p className="h-footer-desc">Connecting generations of Kalabari Girls' High School graduates across the world.</p>
              </div>
              <div>
                <p className="h-footer-label">Explore</p>
                <ul className="h-footer-links">
                  <li><Link to="/signup">Join the community</Link></li>
                  <li><Link to="/donations">Donate</Link></li>
                  <li><a href="#events-heading">Events</a></li>
                  <li><a href="#exec-heading">Leadership</a></li>
                </ul>
              </div>
              <div>
                <p className="h-footer-label">Get in touch</p>
                <p className="h-footer-desc">Questions, feedback, or just want to say hello?</p>
                <a href="mailto:alumnuskghs@gmail.com" className="h-footer-email">alumnuskghs@gmail.com</a>
                <a href="https://www.instagram.com/kghs.alumnae?igsh=OHY1bDEyM2EycHE1"
                  target="_blank" rel="noopener noreferrer" className="h-footer-ig">
                  <FaInstagram aria-hidden="true" /> @kghs.alumnae
                </a>
              </div>
            </div>
            <div className="h-footer-bottom">
              <p>© {new Date().getFullYear()} KGHS Alumni Foundation. All rights reserved.</p>
              <p className="h-footer-tagline">Building legacies of leadership, one sister at a time.</p>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
};

// ─── CSS ──────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

:root {
  --rose:       #FF69B4;
  --rose-light: #FFC0CB;
  --rose-pale:  #FFF0F5;
  --rose-mid:   #FFD6E7;
  --rose-deep:  #d43f6a;
  --cream:      #FFFFFF;
  --ink:        #2A1A22;
  --ink-mid:    #6B4558;
  --ink-soft:   #A07090;
  --white:      #FFFFFF;
  --line:       rgba(255,192,203,.55);
  --shadow-sm:  0 1px 2px rgba(42,26,34,.04), 0 2px 10px rgba(255,105,180,.06);
  --shadow:     0 2px 20px rgba(255,105,180,.10), 0 1px 4px rgba(42,26,34,.06);
  --shadow-lg:  0 24px 60px -12px rgba(255,105,180,.22), 0 8px 20px -8px rgba(42,26,34,.10);
  --r-lg: 28px; --r-md: 20px; --r-sm: 14px;
}

* { box-sizing:border-box; }
html { scroll-behavior:smooth; }
.h-root { font-family:'DM Sans',sans-serif; color:var(--ink); background:var(--cream); overflow-x:hidden; -webkit-font-smoothing:antialiased; }
.h-root img { max-width:100%; }
.h-root a:focus-visible, .h-root button:focus-visible, .h-slider:focus-visible { outline:2px solid var(--rose); outline-offset:3px; }

/* ── Layout ── */
.h-section { padding:clamp(72px,10vw,128px) 0; position:relative; }
.h-section-sm { padding:clamp(48px,6vw,80px) 0; }
.h-white  { background:var(--white); }
.h-tinted { background:var(--rose-pale); }
.h-rose   { background:radial-gradient(1200px 500px at 85% 0%, var(--rose-mid) 0%, transparent 60%), radial-gradient(900px 400px at 0% 100%, var(--rose-pale) 0%, transparent 60%), var(--white); }
.h-container { max-width:1200px; margin:0 auto; padding:0 clamp(16px,4vw,32px); }
.h-narrow { max-width:920px; }

/* ── Type ── */
.h-head { display:flex; flex-direction:column; gap:14px; margin-bottom:clamp(36px,5vw,60px); }
.h-head-center { align-items:center; text-align:center; }
.h-eyebrow { display:inline-flex; align-items:center; gap:8px; font-size:11px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:var(--rose); background:var(--white); border:1px solid var(--line); border-radius:100px; padding:6px 14px; box-shadow:var(--shadow-sm); width:fit-content; }
.h-eyebrow-dot { width:6px; height:6px; border-radius:50%; background:var(--rose); box-shadow:0 0 0 3px var(--rose-pale); }
.h-heading { font-family:'Playfair Display',serif; font-size:clamp(2rem,4.6vw,3.4rem); font-weight:800; line-height:1.08; color:var(--ink); margin:0; letter-spacing:-.025em; text-wrap:balance; }
.h-heading em, .h-donate-title em, .h-const-title em { font-style:italic; font-weight:700; color:var(--rose); }
.h-left { text-align:left; }
.h-sub { font-size:clamp(.95rem,1.6vw,1.08rem); color:var(--ink-mid); font-weight:400; line-height:1.7; max-width:580px; margin:0; text-wrap:pretty; }
.h-label { font-size:.7rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--rose); }
.h-prose { display:flex; flex-direction:column; gap:14px; }
.h-prose p { font-size:clamp(.92rem,1.4vw,1rem); color:var(--ink-mid); line-height:1.8; margin:0; }
.h-center p { text-align:center; }
.h-kicker { margin:24px 0 0; font-size:1rem; font-weight:500; color:var(--ink); line-height:1.65; padding:18px 20px; background:var(--rose-pale); border-radius:var(--r-sm); border-left:3px solid var(--rose); }
.h-caption { text-align:center; font-size:.85rem; color:var(--ink-soft); margin:16px 0 0; }
.h-empty { text-align:center; color:var(--ink-soft); padding:48px 24px; border:1.5px dashed var(--rose-light); border-radius:var(--r-md); background:rgba(255,255,255,.6); max-width:560px; margin:0 auto; }

/* ── Buttons ── */
.h-btn { display:inline-flex; align-items:center; justify-content:center; gap:10px; border-radius:100px; padding:15px 28px; font-family:inherit; font-size:.95rem; font-weight:600; letter-spacing:.01em; cursor:pointer; text-decoration:none; border:none; transition:transform .2s ease, background .2s ease, box-shadow .2s ease, color .2s; white-space:nowrap; }
.h-btn:hover { transform:translateY(-2px); }
.h-btn:active { transform:translateY(0); }
.h-btn-primary { background:var(--rose); color:#fff; box-shadow:0 10px 30px -8px rgba(255,105,180,.7); }
.h-btn-primary:hover { background:var(--rose-deep); }
.h-btn-glass { background:rgba(255,255,255,.14); color:#fff; border:1px solid rgba(255,255,255,.35); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); }
.h-btn-glass:hover { background:rgba(255,255,255,.24); }
.h-btn-white { background:#fff; color:var(--rose-deep); box-shadow:0 10px 30px -10px rgba(42,26,34,.35); }
.h-btn-outline { background:transparent; color:var(--rose); border:1.5px solid var(--rose-light); }
.h-btn-outline:hover { background:var(--rose-pale); border-color:var(--rose); }
.h-link { display:inline-flex; align-items:center; gap:8px; font-weight:600; font-size:.92rem; color:var(--rose); text-decoration:none; }
.h-link svg { transition:transform .2s; }
.h-link:hover svg { transform:translateX(4px); }
.h-round-btns { display:flex; gap:8px; }
.h-round { width:42px; height:42px; border-radius:50%; background:var(--white); border:1.5px solid var(--rose-light); color:var(--rose); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .2s; }
.h-round:hover { background:var(--rose); border-color:var(--rose); color:#fff; }

/* ── Images ── */
.h-fade-wrap { position:relative; border-radius:inherit; overflow:hidden; height:100%; }
.h-skel { position:absolute; inset:0; background:linear-gradient(90deg,var(--rose-pale) 25%,var(--rose-mid) 50%,var(--rose-pale) 75%); background-size:400% 100%; animation:shimmer 1.6s infinite; border-radius:inherit; }
@keyframes shimmer { 0%{background-position:100% 0} 100%{background-position:0 0} }
.h-img { width:100%; height:clamp(320px,45vw,520px); object-fit:cover; display:block; }
.h-img-fill { height:100%; min-height:260px; }
.h-img-fade { opacity:0; transform:scale(1.03); transition:opacity .7s ease, transform 1.2s ease; }
.h-img-vis { opacity:1; transform:scale(1); }

/* ── Hero ── */
.h-hero { position:relative; min-height:100svh; display:flex; align-items:flex-end; overflow:hidden; color:#fff; padding:120px 0 clamp(48px,8vw,88px); }
.h-hero-bg { position:absolute; inset:-4%; background-size:cover; background-position:center; }
.h-hero-overlay { position:absolute; inset:0; background:linear-gradient(180deg, rgba(42,26,34,.35) 0%, rgba(42,26,34,.25) 35%, rgba(42,26,34,.82) 100%), linear-gradient(90deg, rgba(42,26,34,.55) 0%, transparent 70%); }
.h-hero-glow { position:absolute; width:60vw; height:60vw; max-width:800px; max-height:800px; right:-15%; bottom:-30%; background:radial-gradient(circle, rgba(255,105,180,.35) 0%, transparent 65%); filter:blur(20px); pointer-events:none; }
.h-hero-inner { position:relative; z-index:2; width:100%; display:grid; gap:40px; align-items:end; }
@media(min-width:960px){ .h-hero-inner{ grid-template-columns:1.5fr 1fr; } }
.h-hero-content { max-width:760px; }
.h-hero-badge { display:inline-flex; align-items:center; gap:10px; font-size:.75rem; font-weight:500; letter-spacing:.08em; color:rgba(255,255,255,.9); background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.25); border-radius:100px; padding:8px 16px; margin-bottom:24px; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); }
.h-pulse { width:8px; height:8px; border-radius:50%; background:var(--rose); box-shadow:0 0 0 0 rgba(255,105,180,.7); animation:pulse 2s infinite; }
@keyframes pulse { 0%{box-shadow:0 0 0 0 rgba(255,105,180,.7)} 70%{box-shadow:0 0 0 10px rgba(255,105,180,0)} 100%{box-shadow:0 0 0 0 rgba(255,105,180,0)} }
.h-hero-title { font-family:'Playfair Display',serif; font-size:clamp(2.6rem,7.5vw,5.8rem); font-weight:800; line-height:1.0; letter-spacing:-.035em; margin:0 0 24px; text-wrap:balance; }
.h-hero-title em { font-style:italic; font-weight:700; color:var(--rose-light); }
.h-hero-sub { font-size:clamp(1rem,1.8vw,1.18rem); color:rgba(255,255,255,.82); line-height:1.6; max-width:540px; margin:0 0 34px; font-weight:300; }
.h-hero-ctas { display:flex; flex-wrap:wrap; gap:12px; }
.h-hero-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.22); border-radius:var(--r-md); overflow:hidden; backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); }
.h-hero-stat { background:rgba(42,26,34,.28); padding:20px 16px; display:flex; flex-direction:column; gap:4px; }
.h-hero-stat-val { font-family:'Playfair Display',serif; font-size:clamp(1.25rem,2.6vw,1.8rem); font-weight:700; color:#fff; }
.h-hero-stat-label { font-size:.72rem; color:rgba(255,255,255,.7); letter-spacing:.04em; }
.h-hero-scroll { position:absolute; bottom:22px; left:50%; translate:-50% 0; z-index:3; width:24px; height:38px; border:1.5px solid rgba(255,255,255,.5); border-radius:20px; display:none; justify-content:center; padding-top:7px; }
@media(min-width:960px){ .h-hero-scroll{ display:flex; } }
.h-hero-scroll-dot { width:4px; height:8px; border-radius:4px; background:#fff; }

/* ── Marquee ── */
.h-marquee { background:var(--ink); color:#fff; overflow:hidden; padding:16px 0; }
.h-marquee-track { display:flex; width:max-content; animation:marquee 40s linear infinite; }
.h-marquee-group { display:flex; }
.h-marquee span { font-family:'Playfair Display',serif; font-style:italic; font-size:clamp(1rem,2vw,1.35rem); padding:0 22px; display:inline-flex; align-items:center; gap:44px; white-space:nowrap; opacity:.92; }
.h-marquee i { font-style:normal; color:var(--rose); font-size:.8em; }
@keyframes marquee { to { transform:translateX(-50%); } }

/* ── News ── */
.h-news { max-width:980px; margin:0 auto; display:grid; gap:24px; background:var(--white); border:1px solid var(--line); border-radius:var(--r-lg); padding:clamp(24px,4vw,48px); box-shadow:var(--shadow-lg); position:relative; overflow:hidden; }
.h-news::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(90deg,var(--rose),var(--rose-light)); }
@media(min-width:768px){ .h-news{ grid-template-columns:140px 1fr; gap:40px; } }
.h-news-index { display:flex; align-items:baseline; gap:6px; }
@media(min-width:768px){ .h-news-index{ flex-direction:column; gap:0; border-right:1px solid var(--line); } }
.h-news-num { font-family:'Playfair Display',serif; font-size:clamp(3rem,7vw,5rem); font-weight:800; line-height:1; color:var(--rose); letter-spacing:-.04em; }
.h-news-total { font-size:.9rem; color:var(--ink-soft); font-weight:500; }
.h-news-main { min-height:260px; display:flex; flex-direction:column; justify-content:space-between; gap:28px; }
.h-news-meta { font-size:.78rem; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:var(--ink-soft); margin:0 0 12px; }
.h-news-title { font-family:'Playfair Display',serif; font-size:clamp(1.35rem,2.8vw,2rem); font-weight:700; color:var(--ink); margin:0 0 14px; line-height:1.25; letter-spacing:-.015em; }
.h-news-preview { font-size:.97rem; color:var(--ink-mid); line-height:1.75; display:-webkit-box; -webkit-line-clamp:4; -webkit-box-orient:vertical; overflow:hidden; margin:0 0 20px; }
.h-news-nav { display:flex; align-items:center; justify-content:space-between; gap:20px; }
.h-news-bars { display:flex; gap:6px; flex:1; max-width:320px; }
.h-news-bar { flex:1; height:4px; border-radius:4px; background:var(--rose-pale); border:none; padding:0; cursor:pointer; overflow:hidden; }
.h-news-bar-fill { display:block; height:100%; width:0; background:var(--rose); border-radius:4px; }
.h-news-bar-fill.done { width:100%; }
.h-news-bar-fill.active { animation:prog linear forwards; }
.h-news-bar-fill.active.paused { animation:none; width:100%; opacity:.6; }

/* ── Events ── */
.h-events { display:grid; grid-auto-flow:column; grid-auto-columns:min(84%,340px); gap:18px; overflow-x:auto; scroll-snap-type:x mandatory; padding:4px 4px 16px; margin:0 -4px; scrollbar-width:none; }
.h-events::-webkit-scrollbar { display:none; }
.h-events > * { scroll-snap-align:start; }
@media(min-width:900px){ .h-events{ grid-auto-flow:row; grid-template-columns:repeat(3,1fr); overflow:visible; } }
.h-events-single { grid-auto-flow:row; grid-template-columns:minmax(0,420px); justify-content:center; }
.h-event { background:var(--white); border:1px solid var(--line); border-radius:var(--r-md); padding:22px; display:flex; flex-direction:column; gap:12px; box-shadow:var(--shadow-sm); transition:transform .3s ease, box-shadow .3s ease, border-color .3s; position:relative; overflow:hidden; }
.h-event::after { content:''; position:absolute; inset:0 0 auto 0; height:3px; background:var(--ec); }
.h-event:hover { transform:translateY(-6px); box-shadow:var(--shadow-lg); border-color:color-mix(in srgb, var(--ec) 35%, transparent); }
.h-event-top { display:flex; justify-content:space-between; align-items:flex-start; }
.h-event-cal { width:64px; border-radius:var(--r-sm); overflow:hidden; text-align:center; border:1px solid color-mix(in srgb, var(--ec) 25%, transparent); background:var(--ebg); }
.h-event-month { display:block; background:var(--ec); color:#fff; font-size:.66rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; padding:4px 0; }
.h-event-day { display:block; font-family:'Playfair Display',serif; font-size:1.7rem; font-weight:800; color:var(--ink); padding:4px 0 6px; line-height:1.1; }
.h-event-pill { font-size:.66rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; padding:5px 11px; border-radius:100px; background:var(--ebg); color:var(--ec); }
.h-event-title { font-family:'Playfair Display',serif; font-size:1.18rem; font-weight:700; color:var(--ink); margin:4px 0 0; line-height:1.3; }
.h-event-desc { font-size:.86rem; color:var(--ink-mid); line-height:1.6; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin:0; }
.h-event-meta { display:flex; flex-direction:column; gap:6px; font-size:.78rem; color:var(--ink-soft); font-weight:500; margin-top:auto; padding-top:12px; border-top:1px solid var(--rose-pale); }
.h-event-loc { display:flex; align-items:center; gap:6px; color:var(--ec); }
.h-event-foot { font-size:.64rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--ec); opacity:.75; }

/* ── Split (story) ── */
.h-split { display:grid; gap:clamp(40px,6vw,80px); align-items:center; }
@media(min-width:900px){ .h-split{ grid-template-columns:1fr 1.05fr; } }
.h-frame { position:relative; border-radius:var(--r-lg); box-shadow:var(--shadow-lg); isolation:isolate; }
.h-frame::before { content:''; position:absolute; inset:auto -16px -16px auto; width:60%; height:60%; border-radius:var(--r-lg); background:var(--rose-light); z-index:-1; }
.h-frame .h-fade-wrap { border-radius:var(--r-lg); }
.h-float-card { position:absolute; left:clamp(-8px,-2vw,-24px); bottom:28px; background:rgba(255,255,255,.88); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border:1px solid var(--line); border-radius:var(--r-sm); padding:14px 18px; box-shadow:var(--shadow-lg); display:flex; flex-direction:column; }
.h-float-val { font-family:'Playfair Display',serif; font-size:1.7rem; font-weight:800; color:var(--rose); line-height:1; }
.h-float-label { font-size:.76rem; color:var(--ink-mid); margin-top:4px; }
.h-copy .h-heading { margin:16px 0 22px; }
.h-timeline { list-style:none; padding:0; margin:0 0 26px; display:grid; grid-template-columns:repeat(3,1fr); position:relative; }
.h-timeline::before { content:''; position:absolute; top:11px; left:8%; right:8%; height:2px; background:linear-gradient(90deg,var(--rose-light),var(--rose)); }
.h-timeline li { position:relative; display:flex; flex-direction:column; align-items:center; text-align:center; gap:4px; font-size:.78rem; color:var(--ink-mid); padding-top:30px; }
.h-timeline li::before { content:''; position:absolute; top:4px; width:16px; height:16px; border-radius:50%; background:var(--white); border:3px solid var(--rose); }
.h-timeline span { font-family:'Playfair Display',serif; font-weight:700; font-size:1.05rem; color:var(--ink); }

/* ── Gallery ── */
.h-gallery { display:flex; flex-direction:column; gap:14px; }
.h-slider { position:relative; border-radius:var(--r-lg); overflow:hidden; background:var(--ink); aspect-ratio:16/9; box-shadow:var(--shadow-lg); }
@media(max-width:640px){ .h-slider{ aspect-ratio:4/5; } }
.h-slide { position:absolute; inset:0; opacity:0; transition:opacity .9s ease; }
.h-slide.on { opacity:1; }
.h-slide-img { width:100%; height:100%; object-fit:cover; display:block; transform:scale(1.06); transition:transform 6s ease; }
.h-slide.on .h-slide-img { transform:scale(1); }
.h-slide-shade { position:absolute; inset:0; background:linear-gradient(180deg, transparent 50%, rgba(42,26,34,.75) 100%); pointer-events:none; }
.h-slide-bottom { position:absolute; left:0; right:0; bottom:0; padding:clamp(16px,3vw,28px); display:flex; justify-content:space-between; align-items:flex-end; gap:16px; z-index:3; flex-wrap:wrap; }
.h-slide-cap { font-family:'Playfair Display',serif; font-style:italic; font-size:clamp(1.1rem,2.4vw,1.7rem); color:#fff; text-shadow:0 2px 16px rgba(0,0,0,.3); }
.h-slide-controls { display:flex; align-items:center; gap:8px; }
.h-slide-count { font-size:.78rem; font-weight:600; letter-spacing:.1em; color:rgba(255,255,255,.8); margin-right:8px; font-variant-numeric:tabular-nums; }
.h-glass-btn { width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.3); color:#fff; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background .2s, transform .2s; }
.h-glass-btn:hover { background:var(--rose); border-color:var(--rose); transform:scale(1.06); }
.h-slide-prog { position:absolute; top:0; left:0; right:0; height:3px; background:rgba(255,255,255,.15); z-index:4; }
.h-slide-prog-bar { height:100%; width:0; background:var(--rose); animation:prog linear forwards; }
@keyframes prog { from{width:0} to{width:100%} }
.h-thumbs { display:grid; grid-auto-flow:column; grid-auto-columns:minmax(72px,1fr); gap:10px; overflow-x:auto; scrollbar-width:none; padding:2px; }
.h-thumbs::-webkit-scrollbar { display:none; }
.h-thumb { aspect-ratio:4/3; border-radius:12px; overflow:hidden; border:2px solid transparent; padding:0; cursor:pointer; background:var(--rose-mid); opacity:.55; transition:opacity .25s, border-color .25s, transform .25s; }
.h-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
.h-thumb:hover { opacity:.85; }
.h-thumb.on { opacity:1; border-color:var(--rose); transform:translateY(-2px); }

/* ── Bento ── */
.h-bento { display:grid; gap:16px; grid-template-columns:1fr; }
@media(min-width:640px){ .h-bento{ grid-template-columns:repeat(2,1fr); } }
@media(min-width:1024px){ .h-bento{ grid-template-columns:repeat(4,1fr); } }
.h-bento-vision { background:var(--white); border:1px solid var(--line); border-radius:var(--r-lg); overflow:hidden; box-shadow:var(--shadow); display:grid; }
@media(min-width:640px){ .h-bento-vision{ grid-column:span 2; } }
@media(min-width:1024px){ .h-bento-vision{ grid-column:span 3; grid-template-columns:1fr 1.2fr; } }
.h-bento-vision-img { border-radius:0; min-height:240px; }
.h-bento-vision-text { padding:clamp(24px,3.5vw,40px); display:flex; flex-direction:column; gap:16px; justify-content:center; }
.h-bento-vision-text p { margin:0; font-size:clamp(1rem,1.6vw,1.12rem); line-height:1.75; color:var(--ink-mid); }
.h-quote { font-family:'Playfair Display',serif; font-style:italic; font-size:clamp(1.1rem,2vw,1.35rem); color:var(--rose); line-height:1.45; margin:6px 0 0; padding-left:18px; border-left:3px solid var(--rose-light); }
.h-bento-img { border-radius:var(--r-lg); overflow:hidden; box-shadow:var(--shadow); min-height:260px; }
@media(min-width:640px){ .h-bento-img{ grid-column:span 2; } }
@media(min-width:1024px){ .h-bento-img{ grid-column:span 1; } }
.h-value { background:var(--white); border:1px solid var(--line); border-radius:var(--r-md); padding:26px 22px; box-shadow:var(--shadow-sm); transition:transform .3s, box-shadow .3s, border-color .3s; }
.h-value:hover { transform:translateY(-4px); box-shadow:var(--shadow-lg); border-color:var(--rose-light); }
.h-value-icon { width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; color:#fff; background:linear-gradient(135deg,var(--rose),var(--rose-deep)); box-shadow:0 8px 20px -6px rgba(255,105,180,.6); margin-bottom:18px; }
.h-value-title { font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:700; margin:0 0 8px; color:var(--ink); }
.h-value-body { font-size:.88rem; color:var(--ink-mid); line-height:1.7; margin:0; }

/* ── Leadership tabs ── */
.h-tabs-wrap { display:flex; justify-content:center; margin-bottom:32px; }
.h-tabs { display:flex; gap:4px; padding:5px; background:var(--rose-pale); border:1px solid var(--line); border-radius:100px; overflow-x:auto; scrollbar-width:none; max-width:100%; }
.h-tabs::-webkit-scrollbar { display:none; }
.h-tab { position:relative; border:none; background:transparent; padding:10px 18px; border-radius:100px; font-family:inherit; font-size:.86rem; font-weight:600; color:var(--ink-mid); cursor:pointer; white-space:nowrap; transition:color .2s; }
.h-tab:hover { color:var(--rose); }
.h-tab.on { color:#fff; }
.h-tab-pill { position:absolute; inset:0; border-radius:100px; background:var(--rose); box-shadow:0 6px 18px -6px rgba(255,105,180,.7); }
.h-tab-label { position:relative; z-index:1; }
.h-members { list-style:none; padding:0; margin:0; display:grid; gap:12px; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); }
.h-member { display:flex; align-items:center; gap:14px; padding:14px 16px; background:var(--white); border:1px solid var(--line); border-radius:var(--r-sm); transition:border-color .2s, box-shadow .2s, transform .2s; }
.h-member:hover { border-color:var(--rose-light); box-shadow:var(--shadow); transform:translateY(-2px); }
.h-avatar { width:46px; height:46px; flex-shrink:0; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Playfair Display',serif; font-weight:700; font-size:1rem; color:var(--rose-deep); background:linear-gradient(135deg,var(--rose-pale),var(--rose-mid)); border:1px solid var(--rose-light); }
.h-member-text { display:flex; flex-direction:column; gap:4px; min-width:0; }
.h-member-name { font-weight:600; font-size:.92rem; color:var(--ink); line-height:1.3; }
.h-member-meta { display:flex; flex-wrap:wrap; gap:6px; align-items:center; }
.h-member-role { font-size:.7rem; font-weight:600; color:var(--rose); background:var(--rose-pale); border-radius:100px; padding:2px 9px; }
.h-member-year { font-size:.72rem; color:var(--ink-soft); }

/* ── Org ── */
.h-org { max-width:880px; margin:0 auto; }
.h-org-link { display:block; position:relative; border-radius:var(--r-lg); overflow:hidden; background:var(--white); border:1px solid var(--line); box-shadow:var(--shadow-lg); }
.h-org-img { width:100%; height:auto; display:block; transition:transform .6s ease; }
.h-org-link:hover .h-org-img { transform:scale(1.02); }
.h-org-hint { position:absolute; right:14px; bottom:14px; font-size:.76rem; font-weight:600; color:var(--ink); background:rgba(255,255,255,.9); backdrop-filter:blur(8px); padding:7px 12px; border-radius:100px; border:1px solid var(--line); opacity:0; transform:translateY(6px); transition:all .25s; }
.h-org-link:hover .h-org-hint, .h-org-link:focus-visible .h-org-hint { opacity:1; transform:none; }
@media(hover:none){ .h-org-hint{ opacity:1; transform:none; } }

/* ── Impact + Donate ── */
.h-impact { display:grid; gap:18px; }
@media(min-width:960px){ .h-impact{ grid-template-columns:1.6fr 1fr; } }
.h-impact-panel { background:var(--white); border:1px solid var(--line); border-radius:var(--r-lg); padding:clamp(24px,4vw,40px); box-shadow:var(--shadow); display:flex; flex-direction:column; justify-content:center; gap:32px; }
.h-stats { display:grid; gap:14px; grid-template-columns:1fr; }
@media(min-width:560px){ .h-stats{ grid-template-columns:repeat(3,1fr); } }
.h-stat { padding:20px; border-radius:var(--r-md); background:var(--rose-pale); border:1px solid var(--line); display:flex; flex-direction:column; gap:6px; }
.h-stat-val { font-family:'Playfair Display',serif; font-size:clamp(1.6rem,3.2vw,2.3rem); font-weight:800; color:var(--rose); line-height:1.1; font-variant-numeric:tabular-nums; letter-spacing:-.02em; word-break:break-word; }
.h-stat-label { font-size:.82rem; color:var(--ink-mid); font-weight:500; }
.h-stat-skel { position:relative; height:110px; border-radius:var(--r-md); }
.h-progress-track { background:var(--rose-pale); border-radius:100px; height:12px; overflow:hidden; box-shadow:inset 0 1px 3px rgba(255,105,180,.18); }
.h-progress-fill { height:100%; border-radius:100px; background:linear-gradient(90deg,var(--rose),var(--rose-deep)); position:relative; overflow:hidden; }
.h-progress-fill::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.45),transparent); animation:sheen 2.4s infinite; }
@keyframes sheen { from{transform:translateX(-100%)} to{transform:translateX(100%)} }
.h-progress-labels { display:flex; justify-content:space-between; margin-top:10px; font-size:.8rem; color:var(--ink-soft); font-weight:500; }
.h-donate { position:relative; overflow:hidden; border-radius:var(--r-lg); padding:clamp(28px,4vw,40px); color:#fff; background:linear-gradient(145deg,var(--rose) 0%,var(--rose-deep) 100%); box-shadow:var(--shadow-lg); display:flex; flex-direction:column; gap:16px; align-items:flex-start; }
.h-donate::before { content:''; position:absolute; width:280px; height:280px; border-radius:50%; right:-90px; top:-90px; background:rgba(255,255,255,.14); }
.h-donate::after { content:''; position:absolute; width:180px; height:180px; border-radius:50%; left:-60px; bottom:-70px; background:rgba(255,255,255,.1); }
.h-donate > * { position:relative; z-index:1; }
.h-label-light { color:rgba(255,255,255,.85); }
.h-donate-title { font-family:'Playfair Display',serif; font-size:clamp(1.6rem,3vw,2.2rem); font-weight:800; line-height:1.1; margin:0; letter-spacing:-.02em; }
.h-donate .h-donate-title em { color:var(--rose-pale); }
.h-donate-body { font-size:.95rem; line-height:1.7; color:rgba(255,255,255,.9); margin:0; }
.h-donate-note { font-size:.76rem; color:rgba(255,255,255,.75); margin:0; }

/* ── Scholarship ── */
.h-scholar { background:var(--white); border:1px solid var(--line); border-radius:var(--r-lg); box-shadow:var(--shadow-lg); padding:clamp(28px,5vw,56px); display:flex; flex-direction:column; align-items:center; text-align:center; gap:22px; }
.h-scholar-head { display:flex; flex-direction:column; align-items:center; gap:14px; }
.h-scholar-sub { font-size:.92rem; font-weight:600; color:var(--rose); letter-spacing:.06em; margin:0; }
.h-podium { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; align-items:end; width:100%; max-width:560px; margin-top:8px; }
.h-podium-item { border-radius:var(--r-sm) var(--r-sm) 6px 6px; padding:16px 10px; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; gap:6px; background:var(--rose-pale); border:1px solid var(--line); }
.h-podium-1st { min-height:170px; background:linear-gradient(180deg,var(--rose-mid),var(--rose-pale)); border-color:var(--rose-light); }
.h-podium-2nd { min-height:135px; }
.h-podium-3rd { min-height:115px; }
.h-podium-rank { font-family:'Playfair Display',serif; font-size:1.5rem; font-weight:800; color:var(--rose); line-height:1; }
.h-podium-1st .h-podium-rank { font-size:2rem; }
.h-podium-name { font-size:.8rem; font-weight:600; color:var(--ink); line-height:1.35; }
.h-expand { margin-top:4px; }
.h-scholar-detail { width:100%; }
.h-scholar-grid { display:grid; gap:14px; text-align:left; padding-top:12px; }
@media(min-width:700px){ .h-scholar-grid{ grid-template-columns:repeat(2,1fr); } .h-scholar-grid > :last-child{ grid-column:span 2; } }
.h-scholar-block { background:var(--rose-pale); border:1px solid var(--line); border-radius:var(--r-sm); padding:20px; }
.h-scholar-block h4 { font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:700; color:var(--rose); margin:0 0 8px; }
.h-scholar-block p { font-size:.88rem; color:var(--ink-mid); line-height:1.7; margin:0; }
.h-scholar-coda { font-style:italic; font-size:.9rem; color:var(--ink-soft); margin:18px 0 0; text-align:center; }

/* ── Constitution ── */
.h-const { display:flex; flex-wrap:wrap; align-items:center; gap:20px 28px; padding:clamp(22px,3.5vw,36px); border-radius:var(--r-lg); background:var(--rose-pale); border:1px solid var(--line); }
.h-const-icon { width:60px; height:60px; border-radius:18px; background:var(--white); color:var(--rose); display:flex; align-items:center; justify-content:center; border:1px solid var(--line); box-shadow:var(--shadow-sm); flex-shrink:0; }
.h-const-text { flex:1; min-width:240px; display:flex; flex-direction:column; gap:6px; }
.h-const-title { font-family:'Playfair Display',serif; font-size:clamp(1.3rem,2.4vw,1.7rem); font-weight:800; margin:0; color:var(--ink); letter-spacing:-.015em; }
.h-const-text p { margin:0; font-size:.9rem; color:var(--ink-mid); line-height:1.6; }

/* ── Footer ── */
.h-footer { background:var(--ink); color:rgba(255,255,255,.75); padding:clamp(48px,6vw,72px) 0 28px; }
.h-footer-grid { display:grid; gap:36px; grid-template-columns:1fr; margin-bottom:40px; }
@media(min-width:768px){ .h-footer-grid{ grid-template-columns:1.4fr 1fr 1.2fr; } }
.h-footer-brand { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
.h-footer-logo { width:44px; height:44px; border-radius:50%; object-fit:contain; background:var(--white); padding:3px; border:2px solid var(--rose-light); }
.h-footer-name { font-family:'Playfair Display',serif; font-weight:700; font-size:1.25rem; color:#fff; }
.h-footer-desc { font-size:.88rem; line-height:1.7; margin:0 0 10px; max-width:300px; }
.h-footer-label { font-size:.7rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--rose-light); margin:0 0 14px; }
.h-footer-links { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:10px; }
.h-footer-links a { color:rgba(255,255,255,.75); text-decoration:none; font-size:.9rem; transition:color .2s; }
.h-footer-links a:hover { color:var(--rose-light); }
.h-footer-email { display:inline-block; font-size:.95rem; font-weight:600; color:#fff; text-decoration:none; border-bottom:1px solid var(--rose); padding-bottom:2px; margin-bottom:16px; }
.h-footer-email:hover { color:var(--rose-light); }
.h-footer-ig { display:flex; align-items:center; gap:8px; color:rgba(255,255,255,.8); text-decoration:none; font-size:.88rem; width:fit-content; }
.h-footer-ig svg { color:var(--rose); font-size:1.15rem; }
.h-footer-ig:hover { color:#fff; }
.h-footer-bottom { display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px; padding-top:22px; border-top:1px solid rgba(255,255,255,.1); }
.h-footer-bottom p { font-size:.78rem; margin:0; color:rgba(255,255,255,.55); }
.h-footer-tagline { font-style:italic; font-family:'Playfair Display',serif; }

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration:.001ms !important; animation-iteration-count:1 !important; transition-duration:.001ms !important; scroll-behavior:auto !important; }
  .h-marquee-track { animation:none; }
}
`;

export default Home;
