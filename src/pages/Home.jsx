import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isExpanded, setIsExpanded] = useState(false); // State for scholarship dropdown

  // State for collapsible executives sections
  const [openSection, setOpenSection] = useState('trustees'); // Default: Board of Trustees open

  // Toggle function for executives sections
  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

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

  const memorySliderSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    cssEase: 'ease-in-out',
    arrows: false,
    pauseOnHover: true,
    adaptiveHeight: true,
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

      {/* Auto-Playing Memory Slider - Our Journey in Pictures */}
      <section className="py-16 md:py-28 bg-gradient-to-b from-bg-cream to-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-6xl font-extrabold text-primary mb-6">
              Our Journey in Pictures
            </h2>
            <p className="text-xl md:text-2xl text-textDark/70 max-w-4xl mx-auto leading-relaxed">
              From the past to the present — moments of resilience, joy, and unbreakable sisterhood.
            </p>
          </motion.div>

          {/* Full-Width Auto-Slider */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <Slider {...memorySliderSettings}>
              <div>
                <img src="https://i.imgur.com/FirPFti.png" alt="KGHS Memory 1" className="w-full h-96 md:h-[600px] lg:h-[700px] object-cover" />
              </div>
              <div>
                <img src="https://i.imgur.com/btooXVa.png" alt="KGHS Memory 2" className="w-full h-96 md:h-[600px] lg:h-[700px] object-cover" />
              </div>
              <div>
                <img src="https://i.imgur.com/rfQHhcY.png" alt="KGHS Memory 3" className="w-full h-96 md:h-[600px] lg:h-[700px] object-cover" />
              </div>
              <div>
                <img src="https://i.imgur.com/lH6VwVI.png" alt="KGHS Memory 4" className="w-full h-96 md:h-[600px] lg:h-[700px] object-cover" />
              </div>
              <div>
                <img src="https://i.imgur.com/CzoC1tm.png" alt="KGHS Memory 5" className="w-full h-96 md:h-[600px] lg:h-[700px] object-cover" />
              </div>
              <div>
                <img src="https://i.imgur.com/y5xmhUZ.png" alt="KGHS Memory 6" className="w-full h-96 md:h-[600px] lg:h-[700px] object-cover" />
              </div>
              <div>
                <img src="https://i.imgur.com/L39Jcv0.png" alt="KGHS Memory 7" className="w-full h-96 md:h-[600px] lg:h-[700px] object-cover" />
              </div>
              <div>
                <img src="https://i.imgur.com/BtgxtFw.png" alt="KGHS Memory 8" className="w-full h-96 md:h-[600px] lg:h-[700px] object-cover" />
              </div>
              <div>
                <img src="https://i.imgur.com/amqhNNQ.png" alt="KGHS Memory 9" className="w-full h-96 md:h-[600px] lg:h-[700px] object-cover" />
              </div>
            </Slider>
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

      {/* MEET OUR EXECUTIVES - Clean & Classic Version */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl md:text-6xl font-extrabold text-primary mb-6">
              Meet Our Executives
            </h2>
            <p className="text-xl md:text-2xl text-textDark/80 max-w-3xl mx-auto leading-relaxed">
              The dedicated leaders guiding the KGHS Alumni Foundation with wisdom, experience, and deep commitment.
            </p>
          </motion.div>

          <div className="space-y-10">
            {/* Board of Trustees */}
            <div>
              <button
                onClick={() => toggleSection('trustees')}
                className="w-full text-left py-4 border-b border-gray-300 hover:text-primary transition-colors flex justify-between items-center"
              >
                <h3 className="text-3xl md:text-4xl font-bold text-textDark">Board of Trustees</h3>
                <span className="text-3xl font-bold text-primary">
                  {openSection === 'trustees' ? '▲' : '▼'}
                </span>
              </button>

              <AnimatePresence>
                {openSection === 'trustees' && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="pt-6 space-y-4 text-lg text-textDark/90 list-disc pl-8"
                  >
                    <li>Dr. Alaro Lawson (BOT/Foundation Chair), 80</li>
                    <li>Dr. Margaret George Kennedy (Vice Chair), 83</li>
                    <li>Oris Samuel (Secretary), 96</li>
                    <li>Harrisonba Sam Sam Jaja (Treasurer), 79</li>
                    <li>Minini MacBarango (Financial Secretary), 92</li>
                    <li>Ereminawari Ibama, 91</li>
                    <li>Obaraemi Warmate, 79</li>
                    <li>Biobele Iseleye Amachree, 85</li>
                    <li>Tammy Barango, 84</li>
                    <li>Victoria Sergeant-Awuse (General Trustee), 82</li>
                    <li>Advocate Abiegbe-Tomzine's (Membership/Welfare Chair), 92</li>
                    <li>Taire Emmanuel Bailey (Publicity Chair), 92</li>
                    <li>Omiete Farrell (Fundraising Chair), 80</li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Fundraising and Event Committee */}
            <div>
              <button
                onClick={() => toggleSection('fundraising')}
                className="w-full text-left py-4 border-b border-gray-300 hover:text-primary transition-colors flex justify-between items-center"
              >
                <h3 className="text-3xl md:text-4xl font-bold text-textDark">Fundraising and Event Committee</h3>
                <span className="text-3xl font-bold text-primary">
                  {openSection === 'fundraising' ? '▲' : '▼'}
                </span>
              </button>

              <AnimatePresence>
                {openSection === 'fundraising' && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="pt-6 space-y-4 text-lg text-textDark/90 list-disc pl-8"
                  >
                    <li>Omiete Farrell (Chair), 80</li>
                    <li>Opakiriba Ofuani, 80</li>
                    <li>Oribi Isokariari-Higgwe, 80</li>
                    <li>Obaraemi Warmate, 79</li>
                    <li>Asolimaa Onyenwuzor, 81</li>
                    <li>Ene Taylor, 80</li>
                    <li>Kienma Inifie, 82</li>
                    <li>Hon. Alaso Johnbull-Obi, 80</li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Publicity and Communication Committee */}
            <div>
              <button
                onClick={() => toggleSection('publicity')}
                className="w-full text-left py-4 border-b border-gray-300 hover:text-primary transition-colors flex justify-between items-center"
              >
                <h3 className="text-3xl md:text-4xl font-bold text-textDark">Publicity and Communication Committee</h3>
                <span className="text-3xl font-bold text-primary">
                  {openSection === 'publicity' ? '▲' : '▼'}
                </span>
              </button>

              <AnimatePresence>
                {openSection === 'publicity' && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="pt-6 space-y-4 text-lg text-textDark/90 list-disc pl-8"
                  >
                    <li>Taire Emmanuel Baile (Chair), 92</li>
                    <li>Alaere Idoniboye-obu (Secretary)</li>
                    <li>Ese Hart</li>
                    <li>Soiboma lyai-Sokari</li>
                    <li>Mary Samuel-Allasseh, 88</li>
                    <li>Tonye Dokubo</li>
                    <li>Ibiba Wariboko, 80</li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Other Key Roles */}
            <div>
              <button
                onClick={() => toggleSection('other')}
                className="w-full text-left py-4 border-b border-gray-300 hover:text-primary transition-colors flex justify-between items-center"
              >
                <h3 className="text-3xl md:text-4xl font-bold text-textDark">Other Key Roles & Committees</h3>
                <span className="text-3xl font-bold text-primary">
                  {openSection === 'other' ? '▲' : '▼'}
                </span>
              </button>

              <AnimatePresence>
                {openSection === 'other' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="overflow-hidden pt-6 space-y-8 text-lg text-textDark/90"
                  >
                    <div>
                      <strong className="text-2xl text-primary block mb-2">Historian</strong>
                      <p>Okorite Martina Akoko, 80</p>
                    </div>

                    <div>
                      <strong className="text-2xl text-primary block mb-2">Archivist</strong>
                      <p>Courageous Manners, 96</p>
                    </div>

                    <div>
                      <strong className="text-2xl text-primary block mb-2">Legal Counsel</strong>
                      <p>Anonymous (preferred)</p>
                    </div>

                    <div>
                      <strong className="text-2xl text-primary block mb-2">Membership and Social Welfare Committee</strong>
                      <ul className="space-y-3 mt-4 pl-8 list-disc">
                        <li>Advocate Abiegbe-Tomzine's (Chair), 92</li>
                        <li>Courageous Manners (Secretary), 96</li>
                        <li>Daboingi Erekosima, 83</li>
                        <li>Gialba Ngeribia, 83</li>
                        <li>Iwoba Igobo, 82</li>
                        <li>Christina Erekosima, 83</li>
                        <li>Ibiye George, 91</li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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

      {/* Explore Our Foundation - With Animated Dropdown Scholarship Details */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-transparent via-primary/5 to-bg-cream">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="text-center mb-20"
          >
            <h3 className="text-5xl md:text-6xl font-bold text-primary mb-6">
              Explore Our Foundation
            </h3>
            <p className="text-xl md:text-2xl text-textDark/70 max-w-3xl mx-auto leading-relaxed">
              Discover our impact, initiatives, and how we're empowering the next generation of KGHS girls.
            </p>
          </motion.div>

          {/* Scholarship Card with Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-bg-light/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-accent-lavender/30"
          >
            {/* Teaser Header */}
            <div className="p-10 md:p-16 text-center">
              <motion.h4
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold text-primary mb-6"
              >
                Annual Merit-Based Scholarship
              </motion.h4>
              <p className="text-xl text-accent-gold font-medium mb-10">
                Empowering Excellence • One Girl at a Time
              </p>

              {/* Teaser Text */}
              <div className="space-y-6 text-lg md:text-xl text-textDark/80 leading-relaxed max-w-4xl mx-auto mb-12">
                <p>
                  In partnership with the school, we run an inspiring academic challenge for JSS2 students — designed to spark creativity, critical thinking, and healthy competition.
                </p>
                <p>
                  Top performers earn the <strong>Impact Backpack</strong> — a carefully curated award filled with essential school supplies to support their educational journey.
                </p>
                <p className="text-primary font-medium">
                  In 2024/2025, only three brilliant students qualified — but we're determined to change that. With your support, more girls can shine.
                </p>
              </div>

              {/* Read More Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className="bg-primary text-white px-12 py-6 rounded-full text-xl font-bold shadow-xl hover:bg-accent-orchid transition-all duration-300 inline-flex items-center gap-4"
              >
                {isExpanded ? 'Show Less' : 'Read Full Details'}
                <motion.span
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.4 }}
                  className="inline-block"
                >
                  ↓
                </motion.span>
              </motion.button>
            </div>

            {/* Dropdown Full Details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-10 md:px-16 pb-16 pt-8 bg-bg-light/50 border-t border-accent-lavender/20">
                    <div className="space-y-10 text-lg md:text-xl text-textDark/80 leading-relaxed max-w-4xl mx-auto">
                      <div>
                        <h5 className="text-2xl font-bold text-primary mb-4">Program Overview</h5>
                        <p>
                          The Foundation, in collaboration with the school Principal and a newly established 5-member Scholarship Panel of Judges, will formulate a stimulative and thought-provoking academic exercise for students in Junior Secondary School 2 (JSS2).
                        </p>
                        <p className="mt-4">
                          At the conclusion of each exercise, 10 top finalists will be chosen by the Panel of Judges in a double-blinded format for an award determined by the Foundation’s Board of Trustees.
                        </p>
                      </div>

                      <div>
                        <h5 className="text-2xl font-bold text-primary mb-4">Objective</h5>
                        <p>
                          This merit-based scholarship aims to create an environment that fosters quality learning and competitiveness, enabling students to unleash their unique creative abilities. It teaches students to gather good data and assemble it in a written form understandable to the reader.
                        </p>
                      </div>

                      <div>
                        <h5 className="text-2xl font-bold text-primary mb-4">Award: Impact Backpack</h5>
                        <p>
                          The Foundation will give an award package called <strong>Impact Backpack</strong>, including:
                        </p>
                        <ul className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                          <li>• Backpacks</li>
                          <li>• 80-leaf exercise books</li>
                          <li>• Pack of pens</li>
                          <li>• Pencils</li>
                          <li>• Crayons</li>
                          <li>• Drawing books</li>
                          <li>• Mathematical sets</li>
                          <li>• Rulers, etc.</li>
                        </ul>
                      </div>

                      <div>
                        <h5 className="text-2xl font-bold text-primary mb-4">Eligibility Requirement</h5>
                        <p>
                          While our goal is to support every student, we establish standards to empower them. Only JSS2 students achieving at least 70% in English and Mathematics qualify — fostering healthy competition where everyone can excel.
                        </p>
                      </div>

                      <div>
                        <h5 className="text-2xl font-bold text-primary mb-4">2024/2025 Academic Year</h5>
                        <p>
                          Eligible students wrote a 300-word essay on "My First Day at School." Regrettably, only three met criteria.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-8">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-accent-gold">1st Place</p>
                            <p className="text-lg mt-2">Batubo Charity Sepiribo</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-accent-lavender">2nd Place</p>
                            <p className="text-lg mt-2">Davidwest Ibiso</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-primary">3rd Place</p>
                            <p className="text-lg mt-2">Batubo Soibifaa</p>
                          </div>
                        </div>
                      </div>

                      <p className="text-center text-textDark/70 mt-12 text-xl italic font-medium">
                        This is what the Foundation hopes to change — more winners, more impact.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Modern, Sleek Footer - Email Centered */}
      <footer className="bg-gradient-to-t from-primary/30 via-primary/10 to-transparent py-20 border-t-0">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center text-center">
            {/* Left: Brand */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="md:text-left"
            >
              <h4 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                KGHS Alumni
              </h4>
              <p className="text-lg text-textDark/70">
                Connect • Share • Inspire
              </p>
            </motion.div>

            {/* Center: Tagline & Email - Perfectly Centered */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <p className="text-xl md:text-2xl text-textDark/80 italic mb-6">
                Building legacies of leadership,<br />
                one sister at a time.
              </p>
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl py-6 px-10 inline-block shadow-xl border border-accent-lavender/20">
                <p className="text-textDark/70 mb-2 text-lg">Contact us</p>
                <a
                  href="mailto:alumnuskghs@gmail.com"
                  className="text-2xl font-semibold text-primary hover:text-accent-orchid transition duration-300 underline decoration-accent-gold/50 underline-offset-4"
                >
                  alumnuskghs@gmail.com
                </a>
              </div>
            </motion.div>

            {/* Right: Copyright */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="md:text-right"
            >
              <p className="text-textDark/60">
                © {new Date().getFullYear()} KGHS Alumni Foundation<br />
                All rights reserved.
              </p>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;