import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/events')
      .then((res) => {
        const formattedEvents = res.data.map((e) => ({
          id: e._id,
          title: e.title,
          start: e.date,
          extendedProps: {
            description: e.description,
            location: e.location,
          },
        }));
        setEvents(formattedEvents);
      })
      .catch((err) => console.error('Events fetch error:', err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to create an event.');
      setCreating(false);
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/events',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      window.location.reload();
    } catch (err) {
      alert('Failed to create gathering. Please try again.');
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/10 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Heartfelt Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-primary mb-6">
            Our Cherished Gatherings ❤️
          </h1>
          <p className="text-xl md:text-2xl text-textDark/70 max-w-3xl mx-auto leading-relaxed font-light">
            Moments of joy, reunion, and unbreakable bonds — where KGHS sisters come together to celebrate our shared legacy.
          </p>
        </motion.div>

        {/* FullCalendar - Elegant & Pink */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-10 mb-20 border border-primary/20"
        >
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={events}
            eventBackgroundColor="#FFC0CB"
            eventBorderColor="#FFB6C1"
            eventTextColor="#333"
            height="auto"
            dayMaxEvents={4}
            moreLinkText="more"
          />
        </motion.div>

        {/* Event Cards List */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-4xl md:text-5xl font-bold text-primary text-center mb-12"
        >
          Upcoming Moments of Sisterhood
        </motion.h2>

        {events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl md:text-3xl text-textDark/60 font-light">
              No gatherings planned yet... but the next one will be magical 🌸
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -12, boxShadow: "0 30px 60px rgba(255,192,203,0.25)" }}
                className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-primary/20"
              >
                <div className="bg-gradient-to-r from-primary/20 to-pink-100 p-8 text-center">
                  <p className="text-3xl font-bold text-primary">
                    {new Date(event.start).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="p-10">
                  <h3 className="text-2xl font-bold text-textDark mb-4">{event.title}</h3>
                  {event.extendedProps?.description && (
                    <p className="text-textDark/80 mb-6 leading-relaxed">
                      {event.extendedProps.description}
                    </p>
                  )}
                  {event.extendedProps?.location && (
                    <p className="text-primary font-semibold text-lg flex items-center justify-center gap-2">
                      📍 {event.extendedProps.location}
                    </p>
                  )}
                </div>

                <div className="bg-primary/5 px-10 py-6 text-center">
                  <p className="text-primary font-bold text-lg">A Time for Sisters</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Gathering Form */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 md:p-16 border border-primary/20 max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-primary text-center mb-10">
            Plan Our Next Gathering
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-textDark font-semibold mb-3 text-lg">Gathering Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., 2026 Grand Reunion"
                className="w-full px-6 py-5 rounded-2xl border-2 border-primary/30 focus:border-primary focus:outline-none transition text-lg"
                required
              />
            </div>

            <div>
              <label className="block text-textDark font-semibold mb-3 text-lg">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                placeholder="What makes this gathering special? Share the joy and purpose..."
                className="w-full px-6 py-5 rounded-2xl border-2 border-primary/30 focus:border-primary focus:outline-none transition text-lg resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-textDark font-semibold mb-3 text-lg">Date & Time</label>
                <input
                  type="datetime-local"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-6 py-5 rounded-2xl border-2 border-primary/30 focus:border-primary focus:outline-none transition text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-textDark font-semibold mb-3 text-lg">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Buguma Civic Center or Virtual (Zoom)"
                  className="w-full px-6 py-5 rounded-2xl border-2 border-primary/30 focus:border-primary focus:outline-none transition text-lg"
                  required
                />
              </div>
            </div>

            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 30px 60px rgba(255,192,203,0.3)" }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={creating}
                className="bg-primary text-white px-16 py-6 rounded-full text-2xl font-bold shadow-2xl hover:bg-pink-600 transition-all duration-300 disabled:opacity-70"
              >
                {creating ? 'Creating Gathering...' : 'Create This Gathering ❤️'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Events;