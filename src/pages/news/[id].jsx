import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NewsDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/news/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('News not found');
        }
        return res.json();
      })
      .then(data => {
        setNewsItem(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-primary">
        Loading full story...
      </div>
    );
  }

  if (error || !newsItem) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-600">
        News story not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white/50 py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:text-pink-600 mb-10 font-medium"
        >
          ← Back to Homepage
        </Link>

        <article className="bg-white rounded-3xl shadow-2xl p-10 md:p-16 border border-pink-100">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-8 leading-tight">
            {newsItem.title}
          </h1>

          <div className="text-sm text-primary/70 mb-12">
            By {newsItem.author?.name || 'Admin'} •{' '}
            {new Date(newsItem.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>

          {/* Full Content */}
          <div className="prose prose-lg max-w-none text-textDark/80 leading-relaxed">
            {newsItem.content.split('\n').map((paragraph, index) => (
              paragraph.trim() && <p key={index} className="mb-6">{paragraph}</p>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}.
