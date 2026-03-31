import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const NewsDetail = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/news/${id}`);
        setNews(res.data);
      } catch (err) {
        setError('News article not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [id]);

  if (loading) return <div className="text-center py-20 text-primary">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-6 py-16"
    >
      <Link to="/" className="text-primary hover:text-pink-600 font-semibold mb-8 inline-block">
        ← Back to Home
      </Link>

      <h1 className="text-4xl md:text-5xl font-bold text-textDark mb-6">
        {news.title}
      </h1>

      <p className="text-sm text-primary mb-10">
        By {news.author?.name || 'Admin'} • {new Date(news.date).toLocaleDateString()}
      </p>

      <div className="text-textDark/80 leading-relaxed text-lg whitespace-pre-wrap">
        {news.content}
      </div>
    </motion.div>
  );
};

export default NewsDetail;
