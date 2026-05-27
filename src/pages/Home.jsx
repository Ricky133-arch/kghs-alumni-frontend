import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaInstagram } from 'react-icons/fa';

// ─── Design tokens (match across all pages) ──────────────────────────
// --rose #E8547A  --rose-light #F9C6D3  --rose-pale #FDF1F4
// --rose-mid #F4D0DA  --cream #FFFAF9  --ink #2A1A22
// --ink-mid #6B4558  --ink-soft #A07090

// ─── Cloudinary helper ────────────────────────────────────────────────
const cld = (id, w = 800) =>
  `https://res.cloudinary.com/djkrjogje/image/upload/f_auto,q_auto,w_${w},dpr_auto/${id}`;
const cldSet = (id) =>
  `${cld(id, 400)} 400w, ${cld(id, 800)} 800w, ${cld(id, 1200)} 1200w`;

// ─── Fade-in image ────────────────────────────────────────────────────
const FadeImg = ({ id, alt, className, sizes = '(max-width:768px) 100vw, 800px', eager = false }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="h-fade-wrap">
      {!loaded && <div className="h-img-skel" aria-hidden="true" />}
      <img
        src={cld(id, 800)} srcSet={cldSet(id)} sizes={sizes} alt={alt}
        loading={eager ? 'eager' : 'lazy'} decoding="async"
        className={`${className} h-img-fade${loaded ? ' h-img-vis' : ''}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

// ─── EVENT TYPES ──────────────────────────────────────────────────────
const EVENT_TYPES = {
  gathering: { label: 'Gathering', color: '#E8547A', bg: '#FDF1F4' },
  birthday:  { label: 'Birthday',  color: '#f97316', bg: '#fff7ed' },
  reunion:   { label: 'Reunion',   color: '#8b5cf6', bg: '#f5f3ff' },
  memorial:  { label: 'Memorial',  color: '#0ea5e9', bg: '#f0f9ff' },
};

// ─── EVENT CARD ───────────────────────────────────────────────────────
const EventCard = ({ event, isActive, delay = 0 }) => {
  const type = EVENT_TYPES[event.type] || EVENT_TYPES.gathering;
  const date = new Date(event.date);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6 }}
      className="h-event-card"
      style={{ '--ec': type.color, borderColor: isActive ? type.color + '55' : 'var(--rose-light)' }}
    >
      <div className="h-event-band" style={{ background: `linear-gradient(135deg,${type.color}20,${type.color}38)` }}>
        <div className="h-event-band-bar" style={{ background: type.color }} />
        <span className="h-event-type-pill" style={{ background: type.color + '22', color: type.color }}>
          {type.label}
        </span>
      </div>
      <div className="h-event-body">
        <p className="h-event-date" style={{ color: type.color }}>
          {date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
          {event.date?.includes('T') && !event.date?.endsWith('T00:00:00.000Z') && (
            <> · {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</>
          )}
        </p>
        <h3 className="h-event-title">{event.title}</h3>
        {event.description && <p className="h-event-desc">{event.description}</p>}
        {event.location && (
          <p className="h-event-loc">
            <svg width="9" height="11" viewBox="0 0 10 13" fill="none" aria-hidden="true">
              <path d="M5 0C2.794 0 1 1.794 1 4c0 3 4 9 4 9s4-6 4-9c0-2.206-1.794-4-4-4zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="currentColor"/>
            </svg>
            {event.location}
          </p>
        )}
      </div>
      <div className="h-event-footer" style={{ background: type.color + '14', color: type.color }}>
        A Time for Sisters
      </div>
    </motion.div>
  );
};

// ─── UPCOMING EVENTS ──────────────────────────────────────────────────
const UpcomingEvents = ({ events }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const timerRef = useRef(null);
  const upcoming = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 6);

  const startTimer = useCallback(() => {
    if (upcoming.length <= 1) return;
    timerRef.current = setInterval(() => setActiveIdx(p => (p + 1) % upcoming.length), 3500);
  }, [upcoming.length]);

  useEffect(() => { startTimer(); return () => clearInterval(timerRef.current); }, [startTimer]);

  const pause = () => clearInterval(timerRef.current);
  const resume = () => { pause(); startTimer(); };
  const nav = (dir) => { setActiveIdx(p => (p + dir + upcoming.length) % upcoming.length); pause(); setTimeout(resume, 4000); };

  return (
    <section className="h-section h-section-tinted" aria-labelledby="events-heading">
      <div className="h-container">
        <motion.div className="h-section-header"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <span className="h-eyebrow">What's Coming</span>
          <h2 id="events-heading" className="h-heading h-heading-center">Upcoming <em>Events</em></h2>
          <p className="h-subheading">
            {upcoming.length > 0
              ? `${upcoming.length} moment${upcoming.length !== 1 ? 's' : ''} to look forward to`
              : 'Stay tuned for upcoming gatherings'}
          </p>
        </motion.div>

        {upcoming.length === 0 ? (
          <p className="h-empty-msg">No upcoming events yet — but the next one will be magical. </p>
        ) : upcoming.length === 1 ? (
          <div style={{ maxWidth: 380, margin: '0 auto' }}>
            <EventCard event={upcoming[0]} isActive delay={0} />
          </div>
        ) : (
          <div className="h-events-wrap" onMouseEnter={pause} onMouseLeave={resume}>
            <div className="h-events-grid">
              {upcoming.slice(0, 3).map((ev, i) => (
                <EventCard key={ev._id} event={ev} isActive={i === activeIdx % 3} delay={i * 0.07} />
              ))}
            </div>
            <div className="h-dots" role="tablist">
              {upcoming.map((_, i) => (
                <button key={i} className={`h-dot${i === activeIdx ? ' h-dot-active' : ''}`}
                  onClick={() => { setActiveIdx(i); pause(); setTimeout(resume, 4000); }}
                  role="tab" aria-selected={i === activeIdx} aria-label={`Event ${i + 1}`} />
              ))}
            </div>
            <button className="h-arrow h-arrow-l" onClick={() => nav(-1)} aria-label="Previous">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="h-arrow h-arrow-r" onClick={() => nav(1)} aria-label="Next">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
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
const SLIDE_MS = 4500;

const MemorySlider = () => {
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);
  const next = useCallback(() => setCur(c => (c + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCur(c => (c - 1 + SLIDES.length) % SLIDES.length), []);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, SLIDE_MS);
    return () => clearInterval(t);
  }, [paused, next]);
  return (
    <div className="h-slider" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} role="region" aria-label="Journey in Pictures">
      {SLIDES.map((s, i) => (
        <div key={s.id} className={`h-slide${i === cur ? ' h-slide-on' : ''}`} aria-hidden={i !== cur}>
          <img src={cld(s.id, 1200)} srcSet={cldSet(s.id)} sizes="100vw" alt={s.caption}
            loading={i === 0 ? 'eager' : 'lazy'} decoding="async" className="h-slide-img" />
          <span className="h-slide-cap">{s.caption}</span>
        </div>
      ))}
      <button className="h-slider-arrow h-slider-arrow-l" onClick={prev} aria-label="Previous">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <button className="h-slider-arrow h-slider-arrow-r" onClick={next} aria-label="Next">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <div className="h-slider-dots">
        {SLIDES.map((_, i) => (
          <button key={i} className={`h-slider-dot${i === cur ? ' h-slider-dot-on' : ''}`}
            onClick={() => setCur(i)} aria-label={`Slide ${i + 1}`} />
        ))}
      </div>
      {!paused && <div className="h-slider-prog" key={cur}><div className="h-slider-prog-bar" style={{ animationDuration: `${SLIDE_MS}ms` }} /></div>}
    </div>
  );
};

// ─── ACCORDION ────────────────────────────────────────────────────────
const Accordion = ({ id, title, open, onToggle, children }) => (
  <div className="h-accordion">
    <button className="h-accordion-btn" onClick={() => onToggle(id)} aria-expanded={open}>
      <span className="h-accordion-title">{title}</span>
      <span className={`h-accordion-icon${open ? ' h-accordion-icon-open' : ''}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </span>
    </button>
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="h-accordion-body" style={{ overflow: 'hidden' }}
        >
          <div className="h-accordion-inner">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ─── MAIN HOME ────────────────────────────────────────────────────────
const Home = () => {
  const [news, setNews]                     = useState([]);
  const [events, setEvents]                 = useState([]);
  const [totalDonated, setTotalDonated]     = useState(0);
  const [donationCount, setDonationCount]   = useState(0);
  const [loadingFinance, setLoadingFinance] = useState(true);
  const [isExpanded, setIsExpanded]         = useState(false);
  const [openSection, setOpenSection]       = useState('trustees');
  const [newsIdx, setNewsIdx]               = useState(0);

  const toggleSection = (s) => setOpenSection(o => o === s ? null : s);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/news`).then(r => setNews(r.data.slice(0, 5))).catch(() => {});
    axios.get(`${import.meta.env.VITE_API_URL}/api/events`).then(r => setEvents(r.data.slice(0, 6))).catch(() => {});
    axios.get(`${import.meta.env.VITE_API_URL}/api/public/donations`)
      .then(r => {
        const total = r.data.reduce((s, d) => s + (d.amount || 0), 0);
        setTotalDonated(total); setDonationCount(r.data.length); setLoadingFinance(false);
      }).catch(() => setLoadingFinance(false));
  }, []);

  const goalAmount = 5_000_000;
  const pct = Math.min((totalDonated / goalAmount) * 100, 100);

  // news carousel
  useEffect(() => {
    if (news.length <= 1) return;
    const t = setInterval(() => setNewsIdx(p => (p + 1) % news.length), 5000);
    return () => clearInterval(t);
  }, [news.length]);

  return (
    <>
      <style>{CSS}</style>
      <div className="h-root">

        {/* ── HERO ── */}
        <section className="h-hero" aria-label="Welcome">
          <motion.div className="h-hero-bg"
            animate={{ scale: [1.08, 1.14, 1.08] }}
            transition={{ duration: 22, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
            style={{ backgroundImage: `url('${cld('v1771271342/KGHS_DAY1_15_1_jdblve', 1400)}')` }}
          />
          <motion.div className="h-hero-overlay"
            animate={{ opacity: [0.38, 0.52, 0.38] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="h-hero-content h-hero-float">
            <motion.span className="h-hero-eyebrow"
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              Kalabari Girls' High School
            </motion.span>
            <motion.h1 className="h-hero-title"
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.9 }}>
              Welcome to the<br /><em>KGHS Alumni</em><br />Foundation
            </motion.h1>
            <motion.p className="h-hero-sub"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.8 }}>
              Connect · Share · Inspire
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.7 }}>
              <Link to="/signup">
                <motion.button className="h-hero-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  Join Our Community
                </motion.button>
              </Link>
            </motion.div>
          </div>
          {/* Scroll hint */}
          <motion.div className="h-hero-scroll"
            animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </motion.div>
        </section>

        {/* ── LATEST NEWS ── */}
        <section className="h-section h-section-white" aria-labelledby="news-heading">
          <div className="h-container">
            <motion.div className="h-section-header"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <span className="h-eyebrow">Stay Informed</span>
              <h2 id="news-heading" className="h-heading h-heading-center">Latest <em>News</em></h2>
            </motion.div>

            {news.length === 0 ? (
              <p className="h-empty-msg">No news yet — check back soon!</p>
            ) : (
              <div className="h-news-wrap">
                <AnimatePresence mode="wait">
                  <motion.div key={newsIdx}
                    initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4 }}
                    className="h-news-card">
                    <div className="h-news-body">
                      <h3 className="h-news-title">{news[newsIdx]?.title}</h3>
                      <p className="h-news-preview">{news[newsIdx]?.content}</p>
                    </div>
                    <div className="h-news-footer">
                      <span className="h-news-meta">
                        By {news[newsIdx]?.author?.name || 'Admin'} · {new Date(news[newsIdx]?.date).toLocaleDateString()}
                      </span>
                      <Link to={`/news/${news[newsIdx]?._id}`} className="h-news-link">
                        Read Full Story
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
                {news.length > 1 && (
                  <div className="h-news-nav">
                    <button className="h-news-arrow" onClick={() => setNewsIdx(p => (p - 1 + news.length) % news.length)} aria-label="Previous">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <div className="h-dots">
                      {news.map((_, i) => <button key={i} className={`h-dot${i === newsIdx ? ' h-dot-active' : ''}`} onClick={() => setNewsIdx(i)} aria-label={`News ${i + 1}`} />)}
                    </div>
                    <button className="h-news-arrow" onClick={() => setNewsIdx(p => (p + 1) % news.length)} aria-label="Next">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── EVENTS ── */}
        <UpcomingEvents events={events} />

        {/* ── OUR STORY ── */}
        <section className="h-section h-section-white" aria-labelledby="story-heading">
          <div className="h-container h-two-col">
            <motion.div className="h-img-col h-order-2 h-md-order-1"
              initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.65 }}>
              <div className="h-img-frame">
                <FadeImg id="v1771402872/KGHS_DAY1_5_ulirrc" alt="Our Story" className="h-img" />
                <div className="h-img-accent" aria-hidden="true" />
              </div>
            </motion.div>
            <motion.div className="h-text-col h-order-1 h-md-order-2"
              initial={{ opacity: 0, x: 32 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.65 }}>
              <span className="h-eyebrow">Our Story</span>
              <h2 id="story-heading" className="h-heading">Journey to <em>Reinstatement</em></h2>
              <div className="h-prose">
                <p>Deep in the heart of Buguma, Asari Toru Local Government Area, existed a girls' high school which produced many girls from across the Niger Delta area and beyond. They grew up to become successful women that changed the trajectory of poverty in their respective communities. And then, it was closed.</p>
                <p>The road to reinstatement started from a conversation between a few Ladies — Alaro George-Lawson, Nderiya Princewill Harry and Okorite Akoko at a funeral in Buguma. They shared the idea with Ene Dokiwari-Taylor, whom they knew had always been very passionate about giving back to the school.</p>
                <p>With the use of social media, the concept of the Alumni Foundation was realized in December 2018. A fact-finding mission revealed the deplorable state of the school site — closed in September 2008 when the then State Government erroneously handed it over to the church, which soon abandoned it to dilapidation and ruins.</p>
                <p>This action left high school age girls with nowhere to go — leading to high teen pregnancy rates and criminality in the community. The Foundation has now grown to more than 300 vibrant registered members and, with the help of the Rivers State Government, the school has been restored.</p>
              </div>
              <p className="h-kicker">With the achievement of reinstatement, the goal is to instil competence and confidence in the girls to compete worldwide.</p>
            </motion.div>
          </div>
        </section>

        {/* ── JOURNEY IN PICTURES ── */}
        <section className="h-section h-section-tinted" aria-labelledby="gallery-heading">
          <div className="h-container">
            <motion.div className="h-section-header"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
              <span className="h-eyebrow">Our Journey</span>
              <h2 id="gallery-heading" className="h-heading h-heading-center">In <em>Pictures</em></h2>
              <p className="h-subheading">From the past to the present — moments of resilience, joy, and unbreakable sisterhood.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}>
              <MemorySlider />
            </motion.div>
          </div>
        </section>

        {/* ── OUR VISION ── */}
        <section className="h-section h-section-rose" aria-labelledby="vision-heading">
          <div className="h-container h-two-col h-two-col-rev">
            <motion.div className="h-text-col"
              initial={{ opacity: 0, x: -32 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.65 }}>
              <span className="h-eyebrow">Looking Forward</span>
              <h2 id="vision-heading" className="h-heading">Our <em>Vision</em></h2>
              <div className="h-prose">
                <p>To cultivate a global sisterhood of empowered Kalabari Girls' High School alumnae who lead with excellence, compassion, and unwavering confidence — transforming communities, breaking barriers, and inspiring future generations of women to reach their fullest potential.</p>
              </div>
              <blockquote className="h-blockquote">"Building legacies of leadership, one sister at a time."</blockquote>
            </motion.div>
            <motion.div className="h-img-col"
              initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.65 }}>
              <div className="h-img-frame">
                <FadeImg id="v1771403921/KGHS_DAY1_53_gnrwrj" alt="Our Vision" className="h-img" />
                <div className="h-img-accent h-img-accent-rose" aria-hidden="true" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── CORE VALUES ── */}
        <section className="h-section h-section-white" aria-labelledby="values-heading">
          <div className="h-container h-two-col">
            <motion.div className="h-img-col h-order-2 h-md-order-1"
              initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.65 }}>
              <div className="h-img-frame">
                <FadeImg id="v1771404007/KGHS_DAY1_31_ucwnrp" alt="Our Core Values" className="h-img" />
                <div className="h-img-accent" aria-hidden="true" />
              </div>
            </motion.div>
            <motion.div className="h-text-col h-order-1 h-md-order-2"
              initial={{ opacity: 0, x: 32 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.65 }}>
              <span className="h-eyebrow">What We Stand For</span>
              <h2 id="values-heading" className="h-heading">Our Core <em>Values</em></h2>
              <ul className="h-values" role="list">
                {[
                  { icon: '', t: 'Sisterhood',            b: 'Unbreakable bonds of support, trust, and lifelong connection among all KGHS women.' },
                  { icon: '', t: 'Excellence',            b: 'Pursuing the highest standards in education, leadership, and personal achievement.' },
                  { icon: '', t: 'Compassion & Service', b: 'Giving back to our community and uplifting those in need with kindness and generosity.' },
                  { icon: '', t: 'Empowerment',          b: 'Equipping every girl and woman with the confidence, skills, and opportunities to lead and succeed globally.' },
                ].map((v, i) => (
                  <motion.li key={v.t} className="h-value-item"
                    initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.09, duration: 0.45 }}>
                    <span className="h-value-icon" aria-hidden="true">{v.icon}</span>
                    <div><strong className="h-value-title">{v.t}</strong><p className="h-value-body">{v.b}</p></div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* ── EXECUTIVES ── */}
        <section className="h-section h-section-white" aria-labelledby="exec-heading">
          <div className="h-container" style={{ maxWidth: 860 }}>
            <motion.div className="h-section-header"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <span className="h-eyebrow">Leadership</span>
              <h2 id="exec-heading" className="h-heading h-heading-center">Meet Our <em>Executives</em></h2>
              <p className="h-subheading">The dedicated leaders guiding the Foundation with wisdom, experience, and deep commitment.</p>
            </motion.div>

            <div className="h-accordions">
              <Accordion id="trustees" title="Board of Trustees" open={openSection === 'trustees'} onToggle={toggleSection}>
                <ul className="h-acc-list">
                  {['Dr. Alaro Lawson (BOT/Foundation Chair), 80','Dr. Margaret George Kennedy (Vice Chair), 83','Oris Samuel (Secretary), 96','Harrisonba Sam Sam Jaja (Treasurer), 79','Minini MacBarango (Financial Secretary), 92','Ereminawari Ibama, 91','Obaraemi Warmate, 79','Biobele Iseleye Amachree, 85','Tammy Barango, 84','Victoria Sergeant-Awuse (General Trustee), 82','Advocate Abiegbe-Tomzine\'s (Membership/Welfare Chair), 92','Taire Emmanuel Bailey (Publicity Chair), 92','Omiete Farrell (Fundraising Chair), 80'].map(n => <li key={n}>{n}</li>)}
                </ul>
              </Accordion>
              <Accordion id="fundraising" title="Fundraising & Event Committee" open={openSection === 'fundraising'} onToggle={toggleSection}>
                <ul className="h-acc-list">
                  {['Omiete Farrell (Chair), 80','Opakiriba Ofuani, 80','Oribi Isokariari-Higgwe, 80','Obaraemi Warmate, 79','Asolimaa Onyenwuzor, 81','Ene Taylor, 80','Kienma Inifie, 82','Hon. Alaso Johnbull-Obi, 80','Dr. Oribi'].map(n => <li key={n}>{n}</li>)}
                </ul>
              </Accordion>
              <Accordion id="publicity" title="Publicity & Communication Committee" open={openSection === 'publicity'} onToggle={toggleSection}>
                <ul className="h-acc-list">
                  {['Taire Emmanuel Baile (Chair), 92','Alaere Idoniboye-obu (Secretary)','Ese Hart','Soiboma Iyai-Sokari','Mary Samuel-Allasseh, 88','Tonye Dokubo','Ibiba Wariboko, 80'].map(n => <li key={n}>{n}</li>)}
                </ul>
              </Accordion>
              <Accordion id="membership" title="Membership & Social Welfare Committee" open={openSection === 'membership'} onToggle={toggleSection}>
                <ul className="h-acc-list">
                  {['Advocate Abiegbe-Tomzine\'s (Chair), 92','Courageous Manners (Secretary), 96','Daboingi Erekosima, 83','Gialba Ngeribia, 83','Iwoba Igobo, 82','Christina Erekosima, 83','Ibiye George, 91'].map(n => <li key={n}>{n}</li>)}
                </ul>
              </Accordion>
              <Accordion id="other" title="Other Key Roles" open={openSection === 'other'} onToggle={toggleSection}>
                <div className="h-acc-roles">
                  {[['Historian','Okorite Martina Akoko, 80'],['Archivist','Courageous Manners, 96'],['Legal Counsel','OJU ALAIYI GEORGE, PhD']].map(([r, n]) => (
                    <div key={r} className="h-acc-role">
                      <span className="h-acc-role-label">{r}</span>
                      <span className="h-acc-role-name">{n}</span>
                    </div>
                  ))}
                </div>
              </Accordion>
            </div>
          </div>
        </section>

        {/* ── ORG STRUCTURE ── */}
        <section className="h-section h-section-tinted" aria-labelledby="org-heading">
          <div className="h-container">
            <motion.div className="h-section-header"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <span className="h-eyebrow">How We Work</span>
              <h2 id="org-heading" className="h-heading h-heading-center">Our Organizational <em>Structure</em></h2>
              <p className="h-subheading">How our Board, Committees, and Key Roles work together to support KGHS girls and the alumni community.</p>
            </motion.div>
            <motion.div className="h-org-frame"
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
              <img src="https://i.imgur.com/MXCC7uO.jpg" alt="KGHS Alumni Foundation Organizational Structure"
                loading="lazy" className="h-org-img" />
            </motion.div>
            <p className="h-org-caption">Clear leadership and dedicated committees driving our mission forward</p>
          </div>
        </section>

        {/* ── IMPACT / FINANCE ── */}
        <section className="h-section h-section-white" aria-labelledby="impact-heading">
          <div className="h-container">
            <motion.div className="h-section-header"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <span className="h-eyebrow">Making a Difference</span>
              <h2 id="impact-heading" className="h-heading h-heading-center">Our <em>Impact</em> So Far</h2>
              <p className="h-subheading">Every contribution brings us closer to empowering more KGHS girls. Thank you for your trust and generosity.</p>
            </motion.div>

            {loadingFinance ? (
              <div className="h-stats-grid">
                {[0,1,2].map(i => <div key={i} className="h-stat-skeleton" style={{ animationDelay: `${i*0.1}s` }} />)}
              </div>
            ) : (
              <>
                <div className="h-stats-grid">
                  {[
                    { val: `₦${totalDonated.toLocaleString()}`, label: 'Total Received', delay: 0 },
                    { val: donationCount,                        label: 'Generous Gifts',  delay: 0.1 },
                    { val: `${pct.toFixed(0)}%`,                label: 'Toward Our Goal', delay: 0.2 },
                  ].map((s) => (
                    <motion.div key={s.label} className="h-stat-card"
                      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ delay: s.delay, duration: 0.5 }}
                      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(232,84,122,0.18)' }}>
                      <p className="h-stat-val">{s.val}</p>
                      <p className="h-stat-label">{s.label}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="h-progress-wrap">
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
          </div>
        </section>

        {/* ── SUPPORT / DONATE ── */}
        <section className="h-section h-section-rose" aria-labelledby="donate-heading">
          <div className="h-container" style={{ maxWidth: 740 }}>
            <motion.div className="h-donate-card"
              initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <span className="h-eyebrow">Support the Mission</span>
              <h2 id="donate-heading" className="h-heading h-heading-center">Help Us <em>Empower</em> More Girls</h2>
              <p className="h-donate-body">
                Your generous contribution helps empower the next generation of KGHS girls through scholarships, school restoration, mentorship programs, and community initiatives.
              </p>
              <Link to="/donations">
                <motion.button className="h-hero-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  Donate Now
                </motion.button>
              </Link>
              <p className="h-donate-note">All donations go directly to supporting KGHS students and programs.</p>
            </motion.div>
          </div>
        </section>

        {/* ── SCHOLARSHIP ── */}
        <section className="h-section h-section-tinted" aria-labelledby="scholar-heading">
          <div className="h-container" style={{ maxWidth: 860 }}>
            <motion.div className="h-scholar-card"
              initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <span className="h-eyebrow">Explore Our Foundation</span>
              <h2 id="scholar-heading" className="h-heading h-heading-center">Annual Merit-Based <em>Scholarship</em></h2>
              <p className="h-scholar-sub">Empowering Excellence · One Girl at a Time</p>
              <div className="h-prose h-prose-center">
                <p>In partnership with the school, we run an inspiring academic challenge for JSS2 students — designed to spark creativity, critical thinking, and healthy competition.</p>
                <p>Top performers earn the <strong>Impact Backpack</strong> — a carefully curated award filled with essential school supplies. In 2024/2025, only three brilliant students qualified — but with your support, more girls can shine.</p>
              </div>
              <button className="h-expand-btn" onClick={() => setIsExpanded(e => !e)} aria-expanded={isExpanded}>
                {isExpanded ? 'Show Less' : 'Read Full Details'}
                <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.25 }} style={{ display: 'inline-block', lineHeight: 1 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </motion.span>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div className="h-scholar-detail"
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45 }}
                    style={{ overflow: 'hidden' }}>
                    <div className="h-scholar-inner">
                      {[
                        ['Program Overview', 'The Foundation, in collaboration with the school Principal and a 5-member Scholarship Panel of Judges, will formulate a stimulative academic exercise for students in JSS2. At the conclusion, 10 top finalists are chosen by the Panel in a double-blinded format for an award determined by the Board of Trustees.'],
                        ['Objective', 'This merit-based scholarship aims to create an environment that fosters quality learning and competitiveness, enabling students to unleash their unique creative abilities. It teaches students to gather good data and assemble it in written form understandable to the reader.'],
                        ['Award: Impact Backpack', 'The Foundation awards an Impact Backpack including: Backpacks · 80-leaf exercise books · Pens · Pencils · Crayons · Drawing books · Mathematical sets · Rulers.'],
                        ['Eligibility', 'Only JSS2 students achieving at least 70% in English and Mathematics qualify — fostering healthy competition where everyone can excel.'],
                      ].map(([title, body]) => (
                        <div key={title} className="h-scholar-block">
                          <h4 className="h-scholar-block-title">{title}</h4>
                          <p className="h-scholar-block-body">{body}</p>
                        </div>
                      ))}
                      <div className="h-scholar-block">
                        <h4 className="h-scholar-block-title">2024/2025 Academic Year</h4>
                        <p className="h-scholar-block-body">Eligible students wrote a 300-word essay on "My First Day at School." Regrettably, only three met the criteria.</p>
                        <div className="h-scholar-winners">
                          {[[' 1st Place','Batubo Charity Sepiribo'],[' 2nd Place','Davidwest Ibiso'],[' 3rd Place','Batubo Soibaa']].map(([rank, name]) => (
                            <div key={rank} className="h-scholar-winner">
                              <span className="h-scholar-rank">{rank}</span>
                              <span className="h-scholar-name">{name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="h-scholar-coda">This is what the Foundation hopes to change — more winners, more impact.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* ── CONSTITUTION ── */}
        <section className="h-section h-section-white" aria-labelledby="constitution-heading">
          <div className="h-container" style={{ maxWidth: 700, textAlign: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <span className="h-eyebrow">Governance</span>
              <h2 id="constitution-heading" className="h-heading h-heading-center">Our Foundation's <em>Constitution</em></h2>
              <p className="h-subheading" style={{ marginBottom: 32 }}>
                Transparency and good governance are at the heart of our work. Download the full constitution below, ratified and signed by the Board.
              </p>
              <a href="https://res.cloudinary.com/djkrjogje/raw/upload/v1771269676/THE_CONSTITUTIONAL_BYELAWS_OF_KGHS_27.08.2025-2_dsqmy3.docx"
                download="KGHS-Alumni-Foundation-Constitution.docx" className="h-download-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Download Constitution
              </a>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="h-footer">
          <div className="h-footer-inner">
            <div className="h-footer-grid">
              <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
                <div className="h-footer-brand">
                  <img src="https://i.imgur.com/WwrdAkS.png" alt="KGHS" className="h-footer-logo" />
                  <span className="h-footer-name">KGHS Alumni</span>
                </div>
                <p className="h-footer-desc">Connecting generations of Kalabari Girls' High School graduates across the world.</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.1 }}>
                <p className="h-footer-col-label">Get In Touch</p>
                <p className="h-footer-col-body">Questions, feedback, or just want to say hello?</p>
                <a href="mailto:alumnuskghs@gmail.com" className="h-footer-email">alumnuskghs@gmail.com</a>
                <div className="h-footer-social">
                  <span className="h-footer-social-label">Follow us</span>
                  <a href="https://www.instagram.com/kghs.alumnae?igsh=OHY1bDEyM2EycHE1"
                    target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="h-footer-ig">
                    <FaInstagram aria-hidden="true" />
                  </a>
                </div>
              </motion.div>
            </div>
            <div className="h-footer-divider" />
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
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,800;1,600&family=DM+Sans:wght@300;400;500&display=swap');

:root {
  --rose:       #FF69B4;
  --rose-light: #FFC0CB;
  --rose-pale:  #FFF0F5;
  --rose-mid:   #FFD6E7;
  --cream:      #FFFFFF;
  --ink:        #2A1A22;
  --ink-mid:    #6B4558;
  --ink-soft:   #A07090;
  --white:      #FFFFFF;
  --shadow:     0 2px 20px rgba(255,105,180,.10), 0 1px 4px rgba(42,26,34,.06);
  --shadow-lg:  0 12px 48px rgba(255,105,180,.16), 0 4px 16px rgba(42,26,34,.07);
}

.h-root { font-family:'DM Sans',sans-serif; color:var(--ink); min-height:100vh; background:var(--cream); }

/* ── Sections ── */
.h-section { padding:80px 0; }
@media(min-width:768px){.h-section{padding:108px 0;}}
.h-section-white  { background:var(--white); }
.h-section-tinted { background:#FFF0F5; }
.h-section-rose   { background:linear-gradient(135deg,#FFF0F5 0%,#FFFFFF 55%,#FFF0F5 100%); }); }

.h-container { max-width:1200px; margin:0 auto; padding:0 20px; }
.h-section-header { display:flex; flex-direction:column; align-items:center; gap:12px; margin-bottom:52px; text-align:center; }

/* ── Typography ── */
.h-eyebrow {
  display:inline-block; font-size:11px; font-weight:500; letter-spacing:.18em; text-transform:uppercase;
  color:var(--rose); background:var(--white); border:1px solid var(--rose-light);
  border-radius:100px; padding:5px 16px;
}
.h-heading {
  font-family:'Playfair Display',serif;
  font-size:clamp(1.9rem,4vw,3.1rem); font-weight:800; line-height:1.15;
  color:var(--ink); margin:0; letter-spacing:-.01em;
}
.h-heading em { font-style:italic; color:var(--rose); }
.h-heading-center { text-align:center; }
.h-subheading { font-size:clamp(.9rem,1.8vw,1.05rem); color:var(--ink-mid); font-weight:300; line-height:1.7; max-width:560px; text-align:center; }
.h-prose { display:flex; flex-direction:column; gap:13px; margin-bottom:20px; }
.h-prose p { font-size:clamp(.86rem,1.5vw,.98rem); color:var(--ink-mid); line-height:1.8; margin:0; }
.h-prose-center p { text-align:center; }
.h-kicker { font-size:.97rem; font-weight:500; color:var(--rose); line-height:1.65; border-left:3px solid var(--rose-light); padding-left:16px; }
.h-blockquote { font-family:'Playfair Display',serif; font-style:italic; font-size:clamp(1.05rem,2vw,1.3rem); color:var(--rose); line-height:1.55; border-left:3px solid var(--rose-light); padding-left:20px; margin:24px 0 0; }
.h-empty-msg { text-align:center; color:var(--ink-soft); font-size:1rem; padding:48px 0; }

/* ── Two-column grid ── */
.h-two-col { display:grid; grid-template-columns:1fr; gap:44px; align-items:center; }
@media(min-width:768px){
  .h-two-col{ grid-template-columns:1fr 1fr; gap:68px; }
  .h-two-col-rev{ direction:rtl; }
  .h-two-col-rev > *{ direction:ltr; }
  .h-md-order-1{ order:1; } .h-md-order-2{ order:2; }
}
.h-order-1{order:1;} .h-order-2{order:2;}

/* ── Image ── */
.h-img-frame { position:relative; }
.h-fade-wrap { position:relative; border-radius:22px; overflow:hidden; }
.h-img-skel {
  position:absolute; inset:0; border-radius:22px;
  background:linear-gradient(90deg,var(--rose-pale) 25%,var(--rose-mid) 50%,var(--rose-pale) 75%);
  background-size:400px 100%; animation:shimmer 1.4s infinite;
}
@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
.h-img { width:100%; height:300px; object-fit:cover; border-radius:22px; display:block;
  box-shadow:0 20px 56px rgba(232,84,122,.14),0 4px 12px rgba(42,26,34,.07); }
@media(min-width:768px){.h-img{height:420px;}}
.h-img-fade{opacity:0;transition:opacity .6s ease;}
.h-img-vis{opacity:1;}
.h-img-accent { position:absolute; bottom:-14px; right:-14px; width:55%; height:55%; border-radius:22px; background:var(--rose-light); z-index:-1; }
.h-img-accent-rose { background:var(--rose-mid); }

/* ── Hero ── */
.h-hero { position:relative; min-height:100vh; display:flex; align-items:center; justify-content:center; overflow:hidden; text-align:center; }
.h-hero-bg { position:absolute; inset:-10%; background-size:cover; background-position:center; }
.h-hero-overlay { position:absolute; inset:0; background:rgba(42,26,34,.44); }
.h-hero-float { animation: heroFloat 9s ease-in-out infinite; }
@keyframes heroFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
.h-hero-content { position:relative; z-index:2; max-width:720px; padding:0 24px; }
.h-hero-eyebrow { display:inline-block; font-size:11px; font-weight:500; letter-spacing:.18em; text-transform:uppercase; color:rgba(255,255,255,.75); background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.3); border-radius:100px; padding:5px 16px; margin-bottom:20px; backdrop-filter:blur(8px); }
.h-hero-title { font-family:'Playfair Display',serif; font-size:clamp(2.4rem,7vw,5rem); font-weight:800; color:#fff; line-height:1.1; margin:0 0 20px; letter-spacing:-.01em; text-shadow:0 2px 20px rgba(42,26,34,.3); }
.h-hero-title em { font-style:italic; color:var(--rose-light); }
.h-hero-sub { font-size:clamp(1rem,2.5vw,1.35rem); color:rgba(255,255,255,.8); font-weight:300; letter-spacing:.12em; margin:0 0 36px; }
.h-hero-btn { display:inline-flex; align-items:center; gap:8px; background:var(--rose); color:#fff; border:none; border-radius:100px; padding:15px 36px; font-family:'DM Sans',sans-serif; font-size:1rem; font-weight:600; cursor:pointer; box-shadow:0 8px 32px rgba(232,84,122,.45); transition:background .2s; letter-spacing:.02em; text-decoration:none; }
.h-hero-btn:hover { background:#d43f6a; }
.h-hero-scroll { position:absolute; bottom:28px; left:50%; transform:translateX(-50%); z-index:2; color:rgba(255,255,255,.55); }

/* ── News ── */
.h-news-wrap { max-width:760px; margin:0 auto; }
.h-news-card { background:var(--white); border:1.5px solid var(--rose-light); border-radius:20px; box-shadow:var(--shadow); overflow:hidden; }
.h-news-body { padding:32px 32px 20px; }
.h-news-title { font-family:'Playfair Display',serif; font-size:clamp(1.15rem,2.5vw,1.5rem); font-weight:700; color:var(--ink); margin:0 0 14px; line-height:1.35; }
.h-news-preview { font-size:.9rem; color:var(--ink-mid); line-height:1.75; display:-webkit-box; -webkit-line-clamp:5; -webkit-box-orient:vertical; overflow:hidden; margin:0; }
.h-news-footer { padding:16px 32px; border-top:1px solid var(--rose-pale); display:flex; align-items:center; justify-content:space-between; background:var(--rose-pale); flex-wrap:wrap; gap:8px; }
.h-news-meta { font-size:.78rem; color:var(--ink-soft); }
.h-news-link { display:inline-flex; align-items:center; gap:6px; font-size:.82rem; font-weight:600; color:var(--rose); text-decoration:none; transition:color .18s; }
.h-news-link:hover { color:#c03060; }
.h-news-nav { display:flex; align-items:center; justify-content:center; gap:16px; margin-top:20px; }
.h-news-arrow { width:36px; height:36px; border-radius:50%; background:var(--white); border:1.5px solid var(--rose-light); color:var(--rose); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background .18s; }
.h-news-arrow:hover { background:var(--rose-pale); }

/* ── Events ── */
.h-events-wrap { position:relative; }
.h-events-grid { display:grid; grid-template-columns:1fr; gap:20px; }
@media(min-width:700px){.h-events-grid{grid-template-columns:repeat(3,1fr);}}
.h-event-card { border-radius:20px; background:var(--white); border:1.5px solid; overflow:hidden; box-shadow:var(--shadow); transition:box-shadow .3s,transform .3s; cursor:pointer; display:flex; flex-direction:column; }
.h-event-band { position:relative; height:80px; display:flex; align-items:center; justify-content:center; }
.h-event-band-bar { position:absolute; top:0; left:0; right:0; height:3px; border-radius:3px 3px 0 0; }
.h-event-type-pill { font-size:.68rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; padding:4px 12px; border-radius:100px; }
.h-event-body { padding:18px 20px 12px; flex:1; }
.h-event-date { font-size:.72rem; font-weight:600; margin:0 0 8px; }
.h-event-title { font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; color:var(--ink); margin:0 0 8px; line-height:1.35; }
.h-event-desc { font-size:.78rem; color:var(--ink-soft); line-height:1.6; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin:0 0 8px; }
.h-event-loc { font-size:.72rem; color:var(--ink-soft); display:flex; align-items:center; gap:4px; margin:0; font-weight:500; }
.h-event-footer { padding:10px 20px; font-size:.68rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; text-align:center; }
.h-arrow { position:absolute; top:50%; transform:translateY(-50%); width:38px; height:38px; border-radius:50%; background:var(--white); border:1.5px solid var(--rose-light); color:var(--rose); display:none; align-items:center; justify-content:center; cursor:pointer; box-shadow:var(--shadow); z-index:5; transition:background .18s; }
@media(min-width:700px){.h-arrow{display:flex;}}
.h-arrow:hover{background:var(--rose-pale);}
.h-arrow-l{left:-20px;} .h-arrow-r{right:-20px;}

/* ── Dots (shared) ── */
.h-dots { display:flex; justify-content:center; align-items:center; gap:6px; margin-top:20px; }
.h-dot { width:7px; height:7px; border-radius:100px; background:var(--rose-light); border:none; cursor:pointer; padding:0; transition:width .25s,background .25s; }
.h-dot-active { width:22px; background:var(--rose); }

/* ── Memory slider ── */
.h-slider { position:relative; border-radius:22px; overflow:hidden; background:var(--ink); aspect-ratio:16/9; box-shadow:0 28px 72px rgba(42,26,34,.18); }
@media(max-width:600px){.h-slider{aspect-ratio:4/3;}}
.h-slide { position:absolute; inset:0; opacity:0; transition:opacity .75s ease; pointer-events:none; }
.h-slide-on { opacity:1; pointer-events:auto; }
.h-slide-img { width:100%; height:100%; object-fit:cover; display:block; }
.h-slide-cap { position:absolute; bottom:48px; left:20px; font-size:.72rem; font-weight:500; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.72); background:rgba(42,26,34,.5); backdrop-filter:blur(8px); padding:5px 14px; border-radius:100px; }
.h-slider-arrow { position:absolute; top:50%; transform:translateY(-50%); z-index:10; width:42px; height:42px; border-radius:50%; background:rgba(255,250,249,.9); border:none; cursor:pointer; color:var(--rose); display:flex; align-items:center; justify-content:center; box-shadow:0 4px 20px rgba(42,26,34,.2); transition:background .18s,transform .18s; }
.h-slider-arrow:hover{background:var(--white);transform:translateY(-50%) scale(1.07);}
.h-slider-arrow-l{left:14px;} .h-slider-arrow-r{right:14px;}
.h-slider-dots { position:absolute; bottom:14px; left:50%; transform:translateX(-50%); display:flex; gap:6px; z-index:10; }
.h-slider-dot { width:6px; height:6px; border-radius:100px; background:rgba(255,255,255,.42); border:none; cursor:pointer; padding:0; transition:width .25s,background .25s; }
.h-slider-dot-on { width:20px; background:#fff; }
.h-slider-prog { position:absolute; bottom:0; left:0; right:0; height:3px; background:rgba(255,255,255,.15); z-index:10; }
.h-slider-prog-bar { height:100%; background:var(--rose); animation:prog linear forwards; width:0; }
@keyframes prog{from{width:0}to{width:100%}}

/* ── Values ── */
.h-values { list-style:none; padding:0; margin:16px 0 0; display:flex; flex-direction:column; gap:18px; }
.h-value-item { display:flex; align-items:flex-start; gap:14px; }
.h-value-icon { width:42px; height:42px; border-radius:11px; background:var(--rose-pale); border:1px solid var(--rose-light); display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0; margin-top:2px; }
.h-value-title { display:block; font-size:.97rem; font-weight:600; color:var(--ink); margin-bottom:3px; }
.h-value-body { font-size:.84rem; color:var(--ink-mid); line-height:1.7; margin:0; }

/* ── Accordions ── */
.h-accordions { display:flex; flex-direction:column; gap:4px; }
.h-accordion { border:1.5px solid var(--rose-light); border-radius:14px; overflow:hidden; background:var(--white); }
.h-accordion + .h-accordion { margin-top:8px; }
.h-accordion-btn { width:100%; background:none; border:none; padding:18px 22px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; text-align:left; gap:12px; }
.h-accordion-btn:hover { background:var(--rose-pale); }
.h-accordion-title { font-family:'Playfair Display',serif; font-size:clamp(1rem,2vw,1.2rem); font-weight:700; color:var(--ink); }
.h-accordion-icon { color:var(--rose); flex-shrink:0; transition:transform .28s; }
.h-accordion-icon-open { transform:rotate(180deg); }
.h-accordion-body { border-top:1px solid var(--rose-pale); }
.h-accordion-inner { padding:20px 24px 24px; }
.h-acc-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:8px; }
.h-acc-list li { font-size:.9rem; color:var(--ink-mid); padding-left:18px; position:relative; line-height:1.6; }
.h-acc-list li::before { content:'·'; position:absolute; left:4px; color:var(--rose); font-weight:700; font-size:1.1rem; top:-1px; }
.h-acc-roles { display:flex; flex-direction:column; gap:14px; }
.h-acc-role { display:flex; align-items:baseline; gap:12px; flex-wrap:wrap; }
.h-acc-role-label { font-size:.78rem; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:var(--rose); background:var(--rose-pale); border:1px solid var(--rose-light); border-radius:100px; padding:3px 12px; flex-shrink:0; }
.h-acc-role-name { font-size:.92rem; color:var(--ink-mid); }

/* ── Org chart ── */
.h-org-frame { max-width:800px; margin:0 auto; border-radius:18px; overflow:hidden; box-shadow:var(--shadow-lg); border:1.5px solid var(--rose-light); }
.h-org-img { width:100%; height:auto; object-fit:contain; display:block; }
.h-org-caption { text-align:center; font-size:.82rem; color:var(--ink-soft); font-style:italic; margin-top:14px; }

/* ── Stats ── */
.h-stats-grid { display:grid; grid-template-columns:1fr; gap:18px; margin-bottom:32px; }
@media(min-width:600px){.h-stats-grid{grid-template-columns:repeat(3,1fr);}}
.h-stat-card { background:var(--white); border:1.5px solid var(--rose-light); border-radius:20px; padding:36px 24px; text-align:center; box-shadow:var(--shadow); }
.h-stat-val { font-family:'Playfair Display',serif; font-size:clamp(1.8rem,4vw,2.6rem); font-weight:800; color:var(--rose); margin:0 0 8px; line-height:1.1; }
.h-stat-label { font-size:.88rem; color:var(--ink-mid); font-weight:500; margin:0; }
.h-stat-skeleton { background:linear-gradient(90deg,var(--rose-pale) 25%,var(--rose-mid) 50%,var(--rose-pale) 75%); background-size:400px 100%; animation:shimmer 1.4s infinite; border-radius:20px; height:140px; }
.h-progress-wrap { max-width:760px; margin:0 auto; }
.h-progress-track { background:var(--rose-pale); border-radius:100px; height:14px; overflow:hidden; box-shadow:inset 0 2px 6px rgba(232,84,122,.12); }
.h-progress-fill { height:100%; background:linear-gradient(90deg,var(--rose),#d43f6a); border-radius:100px; }
.h-progress-labels { display:flex; justify-content:space-between; margin-top:10px; font-size:.8rem; color:var(--ink-soft); }

/* ── Donate card ── */
.h-donate-card { text-align:center; background:var(--white); border:1.5px solid var(--rose-light); border-radius:24px; padding:48px 32px; box-shadow:var(--shadow-lg); display:flex; flex-direction:column; align-items:center; gap:20px; }
.h-donate-body { font-size:clamp(.9rem,1.8vw,1.05rem); color:var(--ink-mid); max-width:520px; line-height:1.75; margin:0; }
.h-donate-note { font-size:.78rem; color:var(--ink-soft); margin:0; }

/* ── Scholarship ── */
.h-scholar-card { background:var(--white); border:1.5px solid var(--rose-light); border-radius:24px; overflow:hidden; box-shadow:var(--shadow-lg); padding:40px 32px; text-align:center; }
.h-scholar-sub { font-size:.95rem; font-weight:500; color:var(--rose); letter-spacing:.04em; margin:0; }
.h-expand-btn { display:inline-flex; align-items:center; gap:8px; margin-top:16px; background:var(--rose); color:#fff; border:none; border-radius:100px; padding:12px 28px; font-family:'DM Sans',sans-serif; font-size:.88rem; font-weight:600; cursor:pointer; box-shadow:0 4px 20px rgba(232,84,122,.32); transition:background .2s; }
.h-expand-btn:hover{background:#d43f6a;}
.h-scholar-detail { border-top:1px solid var(--rose-pale); margin-top:28px; }
.h-scholar-inner { padding:28px 0 4px; display:flex; flex-direction:column; gap:24px; text-align:left; }
.h-scholar-block {}
.h-scholar-block-title { font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:700; color:var(--rose); margin:0 0 8px; }
.h-scholar-block-body { font-size:.88rem; color:var(--ink-mid); line-height:1.75; margin:0; }
.h-scholar-winners { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:16px; }
@media(max-width:500px){.h-scholar-winners{grid-template-columns:1fr;}}
.h-scholar-winner { background:var(--rose-pale); border:1px solid var(--rose-light); border-radius:14px; padding:16px; text-align:center; }
.h-scholar-rank { display:block; font-size:.82rem; font-weight:700; color:var(--rose); margin-bottom:6px; }
.h-scholar-name { font-size:.88rem; color:var(--ink-mid); }
.h-scholar-coda { text-align:center; font-style:italic; font-size:.88rem; color:var(--ink-soft); margin:0; }

/* ── Constitution ── */
.h-download-btn { display:inline-flex; align-items:center; gap:9px; background:var(--rose); color:#fff; border-radius:100px; padding:14px 28px; font-family:'DM Sans',sans-serif; font-size:.9rem; font-weight:600; text-decoration:none; box-shadow:0 4px 20px rgba(232,84,122,.32); transition:background .2s; }
.h-download-btn:hover{background:#d43f6a;}

/* ── Footer ── */
.h-footer { background:linear-gradient(to top,rgba(249,198,211,.22) 0%,rgba(249,198,211,.06) 60%,transparent 100%); border-top:1px solid rgba(249,198,211,.35); padding:clamp(40px,5vw,60px) clamp(16px,4vw,28px) clamp(20px,3vw,28px); }
.h-footer-inner { max-width:1100px; margin:0 auto; }
.h-footer-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:clamp(24px,4vw,44px); margin-bottom:32px; }
.h-footer-brand { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
.h-footer-logo { width:38px; height:38px; border-radius:50%; object-fit:contain; border:2px solid var(--rose-light); background:var(--white); padding:2px; }
.h-footer-name { font-family:'Playfair Display',serif; font-weight:700; font-size:1.05rem; color:var(--rose); }
.h-footer-desc { font-size:.83rem; color:var(--ink-soft); line-height:1.65; margin:0; max-width:220px; }
.h-footer-col-label { font-size:.72rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-soft); margin:0 0 10px; }
.h-footer-col-body { font-size:.83rem; color:var(--ink-soft); line-height:1.6; margin:0 0 8px; }
.h-footer-email { font-size:.88rem; font-weight:700; color:var(--rose); text-decoration:none; border-bottom:1px solid var(--rose-light); padding-bottom:1px; }
.h-footer-email:hover { border-color:var(--rose); }
.h-footer-social { display:flex; align-items:center; gap:10px; margin-top:14px; }
.h-footer-social-label { font-size:.72rem; color:var(--ink-soft); font-weight:500; }
.h-footer-ig { color:var(--rose); font-size:1.2rem; display:flex; align-items:center; transition:color .18s; text-decoration:none; }
.h-footer-ig:hover { color:#c03060; }
.h-footer-divider { height:1px; background:rgba(249,198,211,.3); margin:0 0 18px; }
.h-footer-bottom { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px; }
.h-footer-bottom p { font-size:.76rem; color:var(--ink-soft); margin:0; }
.h-footer-tagline { font-style:italic; }
`;

export default Home;
