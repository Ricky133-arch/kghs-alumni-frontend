import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({ caption: '', image: null });
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/gallery`)  // ← Fixed: backticks
      .then((res) => {
        // Sort by newest first
        setImages(res.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      alert('Please select a photo to upload.');
      return;
    }

    setUploading(true);
    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('caption', formData.caption);
    data.append('image', formData.image);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/gallery`,  // ← Fixed: backticks
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      window.location.reload();
    } catch (err) {
      alert('Upload failed. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/10 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Emotional Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-primary mb-6">
            Our Cherished Memories ❤️
          </h1>
          <p className="text-xl md:text-2xl text-textDark/70 max-w-4xl mx-auto leading-relaxed font-light">
            A gallery of joy, laughter, and unbreakable bonds — moments captured forever in the heart of KGHS sisterhood.
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-32">
            <p className="text-3xl text-textDark/60 font-light">Loading our precious memories...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && images.length === 0 && (
          <div className="text-center py-32">
            <p className="text-3xl text-textDark/60 font-light">
              The gallery is waiting for its first memory 🌸
            </p>
            <p className="text-xl text-textDark/50 mt-6">
              Be the first to share a moment from our sisterhood.
            </p>
          </div>
        )}

        {/* Gallery Grid */}
        {!loading && images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-20">
            {images.map((img, index) => (
              <motion.div
                key={img._id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -12, boxShadow: "0 30px 60px rgba(255,192,203,0.3)" }}
                className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-primary/20"
              >
                <div className="aspect-square relative">
                  <img
                    src={img.url}
                    alt={img.caption || 'KGHS Memory'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <p className="text-white text-lg font-medium drop-shadow-lg">
                      {img.caption || 'A moment to remember'}
                    </p>
                  </div>
                </div>

                <div className="p-6 text-center">
                  <p className="text-textDark/70 text-sm">
                    Shared by {img.uploader?.name || 'A Sister'}
                  </p>
                  <p className="text-primary text-sm mt-1">
                    {new Date(img.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 md:p-16 border border-primary/20 max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-primary text-center mb-10">
            Share a Memory
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Preview */}
            {preview && (
              <div className="text-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-80 h-80 rounded-2xl object-cover mx-auto shadow-2xl border-4 border-primary/30"
                />
              </div>
            )}

            <div>
              <label className="block text-textDark font-semibold mb-3 text-lg">Caption (Optional)</label>
              <input
                type="text"
                name="caption"
                value={formData.caption}
                onChange={handleChange}
                placeholder="e.g., Reunion 2025 – Sisters Forever"
                className="w-full px-6 py-5 rounded-2xl border-2 border-primary/30 focus:border-primary focus:outline-none transition text-lg"
              />
            </div>

            <div>
              <label className="block text-textDark font-semibold mb-3 text-lg">Choose Photo</label>
              <input
                type="file"
                name="image"
                onChange={handleChange}
                accept="image/*"
                className="w-full px-6 py-5 rounded-2xl border-2 border-primary/30 bg-white/80 focus:border-primary focus:outline-none transition text-lg file:mr-6 file:py-4 file:px-8 file:rounded-full file:border-0 file:text-lg file:font-medium file:bg-primary file:text-white hover:file:bg-pink-600 cursor-pointer"
                required
              />
            </div>

            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 30px 60px rgba(255,192,203,0.3)" }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={uploading}
                className="bg-primary text-white px-16 py-6 rounded-full text-2xl font-bold shadow-2xl hover:bg-pink-600 transition-all duration-300 disabled:opacity-70"
              >
                {uploading ? 'Uploading Memory...' : 'Share This Memory ❤️'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Gallery;