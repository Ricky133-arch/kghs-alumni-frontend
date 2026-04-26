import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

/* ─── helpers ─────────────────────────────────────────── */
const EVENT_TYPES = {
  gathering: { label: 'Gathering', color: '#e8587a', border: '#c73d62' },
  birthday:  { label: 'Birthday',  color: '#f97316', border: '#c05410' },
  reunion:   { label: 'Reunion',   color: '#8b5cf6', border: '#6d28d9' },
  memorial:  { label: 'Memorial',  color: '#0ea5e9', border: '#0369a1' },
};

const toCalendarEvent = (e) => {
  const type = EVENT_TYPES[e.type] || EVENT_TYPES.gathering;
  return {
    id: e._id || e.id || String(Math.random()),
    title: `${type.dot} ${e.title}`,
    start: e.date,
    allDay: !e.date?.includes('T') || e.date?.endsWith('T00:00'),
    backgroundColor: type.color,
    borderColor: type.border,
    textColor: '#fff',
    extendedProps: {
      description: e.description,
      location: e.location,
      type: e.type || 'gathering',
    },
  };
};

/* ─── tiny toast ──────────────────────────────────────── */
const Toast = ({ msg, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 40 }}
    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-8 py-4 rounded-2xl shadow-2xl font-semibold text-base"
  >
    {msg}
    <button onClick={onClose} className="ml-4 opacity-60 hover:opacity-100">✕</button>
  </motion.div>
);

/* ─── event detail modal ──────────────────────────────── */
const EventModal = ({ event, onClose }) => {
  if (!event) return null;
  const type = EVENT_TYPES[event.extendedProps?.type] || EVENT_TYPES.gathering;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,5,20,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.88, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ background: `linear-gradient(135deg, ${type.color}22, ${type.color}44)` }}
          className="px-8 pt-8 pb-6 border-b border-rose-100">
          <span className="text-4xl">{type.dot}</span>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">{event.title?.replace(/^[\S]+\s/, '')}</h3>
          <p className="text-sm font-medium mt-1" style={{ color: type.color }}>
            {type.label}
          </p>
        </div>
        <div className="px-8 py-6 space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-lg">📅</span>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-0.5">Date & Time</p>
              <p className="text-gray-800 font-medium">
                {new Date(event.start).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                {!event.allDay && (
                  <> &nbsp;·&nbsp; {new Date(event.start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</>
                )}
              </p>
            </div>
          </div>
          {event.extendedProps?.location && (
            <div className="flex items-start gap-3">
              <span className="text-lg">📍</span>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-0.5">Location</p>
                <p className="text-gray-800 font-medium">{event.extendedProps.location}</p>
              </div>
            </div>
          )}
          {event.extendedProps?.description && (
            <div className="flex items-start gap-3">
              <span className="text-lg">💬</span>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-0.5">Details</p>
                <p className="text-gray-600 leading-relaxed">{event.extendedProps.description}</p>
              </div>
            </div>
          )}
        </div>
        <div className="px-8 pb-8">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl font-semibold text-white transition-all"
            style={{ background: type.color }}
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─── main component ──────────────────────────────────── */
const Events = () => {
  const [events, setEvents]         = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [creating, setCreating]     = useState(false);
  const [toast, setToast]           = useState(null);
  const [calH, setCalH]             = useState(680);
  const calendarRef                 = useRef(null);

  const [formData, setFormData] = useState({
    title: '', description: '', date: '', location: '', type: 'gathering',
  });

  /* responsive calendar height */
  useEffect(() => {
    const calc = () => setCalH(Math.max(500, window.innerHeight - 260));
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  /* fetch events */
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/events`)
      .then((res) => setEvents(res.data.map(toCalendarEvent)))
      .catch((err) => console.error('Events fetch error:', err));
  }, []);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, date, location, type } = formData;
    if (!title || !date) { showToast('Title and date are required.'); return; }

    setCreating(true);
    const token = localStorage.getItem('token');
    if (!token) { showToast('Please log in to create an event.'); setCreating(false); return; }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/events`,
        { title, description, date, location, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      /* ✅ add immediately to calendar state — no reload needed */
      const newEvent = toCalendarEvent({ ...res.data, _id: res.data._id || String(Date.now()) });
      setEvents((prev) => [...prev, newEvent]);

      /* navigate calendar to new event's month */
      const calApi = calendarRef.current?.getApi();
      if (calApi) calApi.gotoDate(new Date(date));

      setFormData({ title: '', description: '', date: '', location: '', type: 'gathering' });
      setShowForm(false);
      showToast('Event added to the calendar! 🎉');
    } catch {
      showToast('Failed to create event. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f5]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:wght@600;700&display=swap');
        .fc .fc-toolbar-title { font-family: 'Playfair Display', serif; font-size: 1.35rem !important; color: #1a1018; }
        .fc .fc-button { background: #e8587a !important; border-color: #e8587a !important; border-radius: 10px !important; font-weight: 600 !important; font-size: 0.8rem !important; padding: 6px 14px !important; transition: all .2s; }
        .fc .fc-button:hover { background: #c73d62 !important; border-color: #c73d62 !important; }
        .fc .fc-button-active, .fc .fc-button:focus { background: #a32f50 !important; border-color: #a32f50 !important; box-shadow: none !important; }
        .fc .fc-daygrid-day-number, .fc .fc-col-header-cell-cushion { color: #4a2535; font-weight: 600; }
        .fc .fc-day-today { background: #fdf0f3 !important; }
        .fc .fc-day-today .fc-daygrid-day-number { color: #e8587a; }
        .fc-event { border-radius: 6px !important; font-size: 0.78rem !important; font-weight: 500 !important; cursor: pointer; }
        .fc .fc-more-link { color: #e8587a; font-weight: 600; }
        .fc .fc-scrollgrid { border-radius: 16px; overflow: hidden; border-color: #f0e6ea !important; }
        .fc td, .fc th { border-color: #f0e6ea !important; }
      `}</style>

      {/* ── header ── */}
      <div className="bg-white border-b border-rose-100 px-6 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            KGHS Gatherings
          </h1>
          <p className="text-sm text-gray-400 mt-0.5 font-medium">
            {events.length} event{events.length !== 1 ? 's' : ''} scheduled
          </p>
        </div>

        {/* legend */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(EVENT_TYPES).map(([key, v]) => (
            <span key={key} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: `${v.color}18`, color: v.color }}>
              {v.dot} {v.label}
            </span>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm((p) => !p)}
          className="flex items-center gap-2 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg text-sm transition-all"
          style={{ background: 'linear-gradient(135deg,#e8587a,#c73d62)' }}
        >
          <span className="text-lg">{showForm ? '✕' : '+'}</span>
          {showForm ? 'Cancel' : 'New Event'}
        </motion.button>
      </div>

      {/* ── main layout ── */}
      <div className="p-4 md:p-6 lg:p-8 max-w-screen-2xl mx-auto">

        {/* ── create form ── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-3xl shadow-xl border border-rose-100 p-8 md:p-10">
                <h2 style={{ fontFamily: "'Playfair Display', serif" }}
                  className="text-2xl font-bold text-gray-900 mb-8">
                  Create a New Event
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* title */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Event Title *</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange}
                      placeholder="e.g., 2026 Grand Reunion · Ada's Birthday Celebration"
                      className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-rose-400 focus:outline-none text-gray-800 font-medium text-base transition-colors"
                      required />
                  </div>

                  {/* type */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Event Type</label>
                    <select name="type" value={formData.type} onChange={handleChange}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-rose-400 focus:outline-none text-gray-800 font-medium text-base transition-colors bg-white">
                      {Object.entries(EVENT_TYPES).map(([k, v]) => (
                        <option key={k} value={k}>{v.dot} {v.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* date */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Date & Time *</label>
                    <input type="datetime-local" name="date" value={formData.date} onChange={handleChange}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-rose-400 focus:outline-none text-gray-800 font-medium text-base transition-colors"
                      required />
                  </div>

                  {/* location */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Location</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange}
                      placeholder="Venue name or Virtual (Zoom)"
                      className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-rose-400 focus:outline-none text-gray-800 font-medium text-base transition-colors" />
                  </div>

                  {/* description */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange}
                      rows={3} placeholder="What makes this moment special?"
                      className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-rose-400 focus:outline-none text-gray-800 text-base transition-colors resize-none" />
                  </div>

                  {/* submit */}
                  <div className="md:col-span-2 flex justify-end pt-2">
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      type="submit" disabled={creating}
                      className="px-10 py-4 rounded-2xl text-white font-bold text-base shadow-lg transition-all disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg,#e8587a,#c73d62)' }}
                    >
                      {creating ? 'Saving…' : 'Add to Calendar →'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── calendar ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-xl border border-rose-100 p-4 md:p-6 lg:p-8"
        >
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={events}
            height={calH}
            dayMaxEvents={3}
            moreLinkText={(n) => `+${n} more`}
            eventClick={({ event }) => setSelectedEvent(event)}
            buttonText={{ today: 'Today', month: 'Month', week: 'Week', day: 'Day' }}
            nowIndicator
            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', meridiem: false }}
          />
        </motion.div>

        {/* ── upcoming list ── */}
        {events.length > 0 && (
          <div className="mt-10">
            <h2 style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-2xl font-bold text-gray-900 mb-6">
              Upcoming Events
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...events]
                .filter((e) => new Date(e.start) >= new Date())
                .sort((a, b) => new Date(a.start) - new Date(b.start))
                .slice(0, 8)
                .map((event, i) => {
                  const type = EVENT_TYPES[event.extendedProps?.type] || EVENT_TYPES.gathering;
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedEvent(event)}
                      className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all"
                    >
                      <div className="h-2" style={{ background: type.color }} />
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">{type.dot}</span>
                          <span className="text-xs font-bold uppercase tracking-widest"
                            style={{ color: type.color }}>{type.label}</span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-base mb-2 leading-snug">
                          {event.title?.replace(/^[\S]+\s/, '')}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">
                          {new Date(event.start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {!event.allDay && (
                            <> · {new Date(event.start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</>
                          )}
                        </p>
                        {event.extendedProps?.location && (
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <span>📍</span> {event.extendedProps.location}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* ── modals & toast ── */}
      <AnimatePresence>
        {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
        {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default Events;
