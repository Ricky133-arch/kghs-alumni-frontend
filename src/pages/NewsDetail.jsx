import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const renderContent = (content) => {
  return content.split('\n').map((line, index) => {
    const trimmed = line.trim();

    // Detect quotes: lines that start and end with quotation marks
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith('\u201c') && trimmed.endsWith('\u201d'))
    ) {
      return (
        <blockquote key={index} className="border-l-8 border-black pl-6 my-6 text-textDark font-bold text-xl italic">
          {trimmed}
        </blockquote>
      );
    }

    // Detect subheadings: short lines under 60 chars with no sentence-ending punctuation
    if (
      trimmed.length > 0 &&
      trimmed.length < 60 &&
      !trimmed.endsWith('.') &&
      !trimmed.endsWith(',') &&
      !trimmed.endsWith('!') &&
      !trimmed.endsWith('?')
    ) {
      return (
        <h2 key={index} className="text-2xl md:text-3xl font-extrabold text-textDark mt-10 mb-4">
          {trimmed}
        </h2>
      );
    }

    if (trimmed === '') {
      return <br key={index} />;
    }

    return (
      <p key={index} className="text-textDark/80 leading-relaxed text-lg mb-2">
        {line}
      </p>
    );
  });
};

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
        Back to Home
      </Link>

      {news.image && (
        <div className="w-full h-80 overflow-hidden rounded-2xl mb-10">
          <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
        </div>
      )}

      <h1 className="text-4xl md:text-5xl font-bold text-textDark mb-6">
        {news.title}
      </h1>

      <p className="text-sm text-primary mb-10">
        By {news.author?.name || 'Admin'} • {new Date(news.date).toLocaleDateString()}
      </p>

      <div>
        {renderContent(news.content)}
      </div>
    </motion.div>
  );
};

export default NewsDetail;
