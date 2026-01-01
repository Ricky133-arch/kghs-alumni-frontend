import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [donations, setDonations] = useState([]);
  const [totalDonated, setTotalDonated] = useState(0);
  const [donationCount, setDonationCount] = useState(0);
  const [loadingFinance, setLoadingFinance] = useState(true);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/news`)
      .then(res => setNews(res.data.slice(0, 5)))
      .catch(() => setNews([]));

    axios.get(`${import.meta.env.VITE_API_URL}/api/events`)
      .then(res => setEvents(res.data.slice(0, 5)))
      .catch(() => setEvents([]));

    axios.get(`${import.meta.env.VITE_API_URL}/api/public/donations`)
      .then(res => {
        const data = res.data;
        setDonations(data);
        const total = data.reduce((sum, don) => sum + (don.amount || 0), 0);
        setTotalDonated(total);
        setDonationCount(data.length);
        setLoadingFinance(false);
      })
      .catch(() => setLoadingFinance(false));
  }, []);

  const goalAmount = 5000000;
  const percentage = Math.min((totalDonated / goalAmount) * 100, 100);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
  };

  return (
    <div className="min-h-screen bg-secondary">
      {/* Hero Section with Continuous Animation */}
      <section className="relative bg-cover bg-center bg-no-repeat text-textDark py-32 md:py-40 text-center overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1.1, 1.15, 1.1] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          style={{
            backgroundImage: `url('https://i.imgur.com/wY9ZpTO.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <motion.div
          className="absolute inset-0 bg-black/40"
          animate={{ opacity: [0.35, 0.5, 0.35] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="relative z-10 max-w-5xl mx-auto px-6"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg"
          >
            Welcome to KGHS Alumni Foundation
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-xl md:text-3xl mb-10 font-light text-white drop-shadow-md"
          >
            Connect • Share • Inspire
          </motion.p>

          <Link to="/signup">
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              whileHover={{ scale: 1.1, boxShadow: "0 20px 40px rgba(255,192,203,0.6)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-white px-10 py-5 rounded-full text-xl font-semibold shadow-2xl hover:bg-pink-600 transition duration-300"
            >
              Join Our Community
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Latest News Carousel */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-center mb-12 text-primary"
          >
            Latest News
          </motion.h2>
          {news.length > 0 ? (
            <Slider {...sliderSettings}>
              {news.map(item => (
                <div key={item._id} className="px-4">
                  <motion.div
                    whileHover={{ y: -10 }}
                    className="bg-white rounded-2xl shadow-xl p-10 text-center border border-pink-100"
                  >
                    <h3 className="text-2xl font-semibold mb-4 text-textDark">{item.title}</h3>
                    <p className="text-textDark/70 leading-relaxed">{item.content}</p>
                    <p className="text-sm text-primary mt-4">By {item.author?.name || 'Admin'} • {new Date(item.date).toLocaleDateString()}</p>
                  </motion.div>
                </div>
              ))}
            </Slider>
          ) : (
            <p className="text-center text-textDark/60">No news yet. Check back soon!</p>
          )}
        </div>
      </section>

      {/* Upcoming Events Grid */}
      <section className="py-16 md:py-20 bg-secondary">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-center mb-12 text-primary"
          >
            Upcoming Events
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {events.length > 0 ? (
              events.map(event => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -15, scale: 1.03 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                  <div className="bg-primary/20 h-40 flex items-center justify-center">
                    <p className="text-3xl font-bold text-primary">{new Date(event.date).getDate()}</p>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-semibold mb-3 text-textDark">{event.title}</h3>
                    <p className="text-textDark/70 mb-4">{event.description || 'Join us for this exciting event!'}</p>
                    <p className="text-sm text-primary font-medium">
                      {new Date(event.date).toLocaleDateString()} • {event.location || 'Location TBD'}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="col-span-3 text-center text-textDark/60 text-xl">No upcoming events. Stay tuned!</p>
            )}
          </div>
        </div>
      </section>

      {/* Our Story Section - Continuous Float */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <motion.div
              className="order-2 md:order-1"
              animate={{ 
                y: [0, -18, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 16,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gray-200 rounded-3xl animate-pulse"></div>
                <img 
                  src="https://i.imgur.com/i4njBNR.jpg" 
                  alt="Our Story - Journey to Reinstatement"
                  loading="lazy"
                  className="rounded-3xl shadow-2xl w-full object-cover h-72 md:h-96 relative z-10 transition-opacity duration-700 opacity-0"
                  onLoad={(e) => e.target.classList.add('opacity-100')}
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 md:order-2 space-y-5"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-primary">Our Story: Journey to Reinstatement</h2>
              <p className="text-base md:text-lg text-textDark/80 leading-relaxed">
                Deep in the heart of Buguma, Asari Toru Local Government Area, existed a girls’ high school, which produced many girls from across the Niger Delta area and beyond.
              </p>
              <p className="text-base md:text-lg text-textDark/80 leading-relaxed">
                They grew up to become successful women that changed the trajectory of poverty in their respective communities. And then, it was closed.
              </p>
              <p className="text-base md:text-lg text-textDark/80 leading-relaxed">
                The road to reinstatement started from a conversation between a few Ladies…Alaro George-Lawson, Nderiya Princewill Harry and Okorite Akoko at a funeral in Buguma, Rivers State, Nigeria. They shared the idea with Ene Dokiwari-Taylor, whom they knew had always been very passionate about giving back to the school prior to its closure. Together with a few more Ladies, they forged on the reinstatement journey.
              </p>
              <p className="text-base md:text-lg text-textDark/80 leading-relaxed">
                With the use of social media, the concept of the Alumni Foundation was realized in December 2018. This allowed the ladies to seek and invite other alums to attend and engage in the discussion of reinstatement.
              </p>
              <p className="text-base md:text-lg text-textDark/80 leading-relaxed">
                This effort led to a fact-finding mission that revealed the deplorable state of the school site. The effort also discovered that the school was closed in September of 2008 for no good reason, other than the desire by the then State Government to give schools with historical religious background back to religious organizations.
              </p>
              <p className="text-base md:text-lg text-textDark/80 leading-relaxed">
                In the case of Kalabari Girls’ High School, the only girls’ school in the local community, was erroneously handed over to the church. The church soon abandoned the school, giving way to dilapidation and ruins.
              </p>
              <p className="text-base md:text-lg text-textDark/80 leading-relaxed">
                This action created a complete vacuum and total devastation in the community. It left high school age girls with nowhere to go for their education. Instead, the inaction led to a community with very high teen pregnancy, unruly behavior and even criminality.
              </p>
              <p className="text-base md:text-lg text-textDark/80 leading-relaxed">
                The Kalabari Girls’ High School Alumni Foundation is growing in leaps and bounds. With more than 300 vibrant Alumni registered members and still counting, the Foundation has now restored the school with the help of the Rivers State Government.
              </p>
              <p className="text-base md:text-lg text-textDark/80 leading-relaxed">
                Like other girls’ high schools in Rivers State, Kalabari Girls’ High School has produced notable graduates from across the State. Many went on to become very successful women in various endeavors. Among them are accomplished Businesswomen, Lawyers, Government Workers, Medical Doctors, Nurses, Judges and Teachers to name a few.
              </p>
              <p className="text-base md:text-lg font-medium text-primary leading-relaxed">
                With the achievement of reinstatement, the goal is to instill competence and confidence in the girls’ to compete worldwide.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Vision Section - Different Animation Pattern */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-primary/10 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <motion.div
              className="order-2"
              animate={{ 
                y: [0, -22, 0],
                rotate: [0, -2, 3, 0]
              }}
              transition={{ 
                duration: 14,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gray-200 rounded-3xl animate-pulse"></div>
                <img 
                  src="https://i.imgur.com/exBHuj1.jpg" 
                  alt="Our Vision"
                  loading="lazy"
                  className="rounded-3xl shadow-2xl w-full object-cover h-72 md:h-96 relative z-10 transition-opacity duration-700 opacity-0"
                  onLoad={(e) => e.target.classList.add('opacity-100')}
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 space-y-5"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-primary">Our Vision</h2>
              <p className="text-base md:text-lg text-textDark/80 leading-relaxed">
                To cultivate a global sisterhood of empowered Kalabari Girls’ High School alumnae who lead with excellence, compassion, and unwavering confidence — transforming communities, breaking barriers, and inspiring future generations of women to reach their fullest potential.
              </p>
              <p className="text-xl italic font-medium text-primary">
                Building legacies of leadership, one sister at a time.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values Section - Gentle Breathing */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <motion.div
              className="order-2 md:order-1"
              animate={{ 
                scale: [1, 1.02, 1],
                rotate: [0, 1.5, -1.5, 0]
              }}
              transition={{ 
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gray-200 rounded-3xl animate-pulse"></div>
                <img 
                  src="https://i.imgur.com/aJBkxMS.jpg" 
                  alt="Our Core Values"
                  loading="lazy"
                  className="rounded-3xl shadow-2xl w-full object-cover h-72 md:h-96 relative z-10 transition-opacity duration-700 opacity-0"
                  onLoad={(e) => e.target.classList.add('opacity-100')}
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 md:order-2 space-y-6"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-primary">Our Core Values</h2>
              <ul className="space-y-6 text-base md:text-lg">
                <li className="flex items-start">
                  <div>
                    <strong className="text-textDark text-xl">Sisterhood</strong>
                    <p className="text-textDark/80 mt-1">Unbreakable bonds of support, trust, and lifelong connection among all KGHS women.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div>
                    <strong className="text-textDark text-xl">Excellence</strong>
                    <p className="text-textDark/80 mt-1">Pursuing the highest standards in education, leadership, and personal achievement.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div>
                    <strong className="text-textDark text-xl">Compassion & Service</strong>
                    <p className="text-textDark/80 mt-1">Giving back to our community and uplifting those in need with kindness and generosity.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div>
                    <strong className="text-textDark text-xl">Empowerment</strong>
                    <p className="text-textDark/80 mt-1">Equipping every girl and woman with the confidence, skills, and opportunities to lead and succeed globally.</p>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Finance Showcase - Breathing Cards */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-primary/5">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-extrabold text-primary mb-6">
              Our Impact So Far
            </h2>
            <p className="text-xl md:text-2xl text-textDark/70 max-w-3xl mx-auto">
              Every contribution brings us closer to empowering more KGHS girls. Thank you for your trust and generosity.
            </p>
          </motion.div>

          {loadingFinance ? (
            <p className="text-center text-textDark/60 text-xl">Loading impact...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-primary/10"
                >
                  <p className="text-5xl md:text-6xl font-extrabold text-primary mb-4">
                    ₦{totalDonated.toLocaleString()}
                  </p>
                  <p className="text-2xl text-textDark/80 font-medium">Total Received</p>
                </motion.div>

                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 6, repeat: Infinity, delay: 0.5 }}
                  className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-primary/10"
                >
                  <p className="text-5xl md:text-6xl font-extrabold text-primary mb-4">
                    {donationCount}
                  </p>
                  <p className="text-2xl text-textDark/80 font-medium">Generous Gifts</p>
                </motion.div>

                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                  className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-primary/10"
                >
                  <p className="text-5xl md:text-6xl font-extrabold text-primary mb-4">
                    {percentage.toFixed(0)}%
                  </p>
                  <p className="text-2xl text-textDark/80 font-medium">Toward Our Goal</p>
                </motion.div>
              </div>

              {/* Progress Bar */}
              <div className="max-w-4xl mx-auto">
                <div className="bg-primary/10 rounded-full h-12 overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-pink-600 rounded-full shadow-lg"
                  />
                </div>
                <div className="flex justify-between mt-4 text-textDark/70">
                  <p className="text-lg font-medium">₦0</p>
                  <p className="text-lg font-medium">Goal: ₦{goalAmount.toLocaleString()}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Support Our Mission Section */}
      <section className="py-20 md:py-24 bg-gradient-to-b from-primary/20 to-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 md:p-16 border border-primary/20"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-primary mb-8">
              Support Our Mission
            </h2>
            <p className="text-lg md:text-2xl text-textDark/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              Your generous contribution helps empower the next generation of KGHS girls through scholarships, school restoration, mentorship programs, and community initiatives.
            </p>
            <Link to="/donations">
              <motion.button
                whileHover={{ scale: 1.1, boxShadow: "0 30px 60px rgba(255,192,203,0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-white px-16 py-6 rounded-full text-2xl font-bold shadow-2xl hover:bg-pink-600 transition-all duration-300"
              >
                Donate Now
              </motion.button>
            </Link>
            <p className="text-textDark/60 mt-8 text-base md:text-lg">
              All donations go directly to supporting KGHS students and programs. Thank you for believing in the power of education.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Annual Merit-Based Scholarship Section - Text only */}
      <section className="py-20 md:py-28 bg-bg-cream">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-bg-light rounded-3xl shadow-2xl p-10 md:p-16 border border-accent-lavender/30"
          >
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-6xl font-extrabold text-primary mb-6">
                Annual Merit-Based Scholarship
              </h2>
            </div>

            <p className="text-lg md:text-xl text-textDark/80 leading-relaxed mb-8">
              The Foundation, in collaboration with the school Principal and a newly established 5-member Scholarship Panel of Judges, will formulate a stimulative and thought-provoking academic exercise for students in Junior Secondary School 2 (JSS2).
            </p>

            <p className="text-lg md:text-xl text-textDark/80 leading-relaxed mb-8">
              At the conclusion of each exercise, 10 top finalists will be chosen by the Panel of Judges in a double-blinded format for an award determined by the Foundation’s Board of Trustees.
            </p>

            <h3 className="text-3xl font-bold text-primary mb-6">Objective</h3>
            <p className="text-lg text-textDark/80 leading-relaxed mb-10">
              This merit-based scholarship aims to create an environment that fosters quality learning and competitiveness, enabling students to unleash their unique creative abilities. It teaches students to gather good data and assemble it in a written form understandable to the reader.
            </p>

            <h3 className="text-3xl font-bold text-primary mb-6">
              Award: Impact Backpack
            </h3>
            <p className="text-lg text-center text-textDark/80 leading-relaxed mb-8">
              The Foundation will give an award package called <strong>Impact Backpack</strong>, including:
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-12">
              <div className="text-center">
                <span className="text-textDark/80">Backpacks</span>
              </div>
              <div className="text-center">
                <span className="text-textDark/80">80-leaf exercise books</span>
              </div>
              <div className="text-center">
                <span className="text-textDark/80">Pack of pens</span>
              </div>
              <div className="text-center">
                <span className="text-textDark/80">Pencils</span>
              </div>
              <div className="text-center">
                <span className="text-textDark/80">Crayons</span>
              </div>
              <div className="text-center">
                <span className="text-textDark/80">Drawing books</span>
              </div>
              <div className="text-center">
                <span className="text-textDark/80">Mathematical sets</span>
              </div>
              <div className="text-center">
                <span className="text-textDark/80">Rulers, etc.</span>
              </div>
            </div>

            <h3 className="text-3xl font-bold text-primary mb-6">Eligibility Requirement</h3>
            <p className="text-lg text-textDark/80 leading-relaxed mb-10">
              While our goal is to support every student, we establish standards to empower them. Only JSS2 students achieving at least 70% in English and Mathematics qualify — fostering healthy competition where everyone can excel.
            </p>

            <h3 className="text-3xl font-bold text-primary mb-6">2024/2025 Academic Year</h3>
            <p className="text-lg text-textDark/80 leading-relaxed mb-8">
              Eligible students wrote a 300-word essay on "My First Day at School." Regrettably, only three met criteria.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">1st Place</p>
                <p className="text-lg mt-2">Batubo Charity Sepiribo</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">2nd Place</p>
                <p className="text-lg mt-2">Davidwest Ibiso</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">3rd Place</p>
                <p className="text-lg mt-2">Batubo Soibifaa</p>
              </div>
            </div>

            <p className="text-center text-textDark/70 mt-12 text-lg italic">
              This is what the Foundation hopes to change — more winners, more impact.
            </p>
          </motion.div>
        </div>
      </section>

           {/* Quick Links - Public Pages Only - Enhanced with animation */}
      <section className="py-20 bg-primary/10 border-t border-accent-lavender/20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-center text-primary mb-16"
          >
            Explore Our Foundation
          </motion.h3>

          <div className="grid grid-cols-3 gap-12 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Link to="/gallery" className="block text-center group">
                <div className="bg-bg-light/70 rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:bg-accent-gold/10 border border-accent-lavender/20">
                  <span className="text-3xl md:text-4xl font-bold text-primary group-hover:text-accent-gold transition">
                    Gallery
                  </span>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link to="/donations" className="block text-center group">
                <div className="bg-bg-light/70 rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:bg-accent-gold/10 border border-accent-lavender/20">
                  <span className="text-3xl md:text-4xl font-bold text-primary group-hover:text-accent-gold transition">
                    Donate
                  </span>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link to="/signup" className="block text-center group">
                <div className="bg-bg-light/70 rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:bg-accent-gold/10 border border-accent-lavender/20">
                  <span className="text-3xl md:text-4xl font-bold text-primary group-hover:text-accent-gold transition">
                    Join Us
                  </span>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Elegant Footer */}
      <footer className="bg-primary/20 py-16 border-t border-accent-lavender/30">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h4 className="text-3xl md:text-4xl font-bold text-primary mb-6">
              KGHS Alumni Foundation
            </h4>
            <p className="text-lg text-textDark/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect • Share • Inspire<br />
              Building legacies of leadership, one sister at a time.
            </p>

            <div className="mb-10">
              <p className="text-textDark/70 mb-2">Get in touch</p>
              <a
                href="mailto:alumnuskghs@gmail.com"
                className="text-xl font-medium text-primary hover:text-accent-orchid transition underline decoration-accent-lavender/50"
              >
                alumnuskghs@gmail.com
              </a>
            </div>

            <p className="text-textDark/60 text-sm">
              © {new Date().getFullYear()} KGHS Alumni Foundation. All rights reserved.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default Home;