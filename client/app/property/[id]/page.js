"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  // ⚠️ LOCAL API URL for development
  const API_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`${API_URL}/api/properties/${id}`);
        const data = await res.json();
        if (res.ok) setProperty(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProperty();
  }, [id]);

  // ✅ Helper function to extract YouTube ID from any link
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // ✅ Helper function to check if URL is a direct video file
  const isVideoFile = (url) => {
    if (!url) return false;
    return url.includes('/uploads/') || url.match(/\.(mp4|mov|avi|webm|mkv)$/i);
  };

  const handleWhatsAppClick = () => {
    const message = `Hello! I am interested in viewing this property on StudentLodge:%0A%0A*${property.title}*%0A📍 ${property.location}%0A💰 ₦${parseInt(property.price).toLocaleString()}%0A%0ACan we schedule a viewing?`;
    // ✅ Routes to the specific Agent's number stored in the database
    window.open(`https://wa.me/${property.agentNumber}?text=${message}`, "_blank");
  };

  if (loading) return <div className="p-10 text-center text-xl font-bold animate-pulse">Loading Video Tour...</div>;
  if (!property) return <div className="p-10 text-center">House not found.</div>;

  const youtubeId = getYouTubeId(property.videoUrl);
  const isUploadedVideo = isVideoFile(property.videoUrl);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <nav className="p-4 md:p-6 bg-white shadow-sm mb-6 flex justify-center md:justify-start">
        <Link href="/" className="text-2xl font-black text-green-600 tracking-tight">StudentLodge<span className="text-black">.ng</span></Link>
      </nav>

      <div className="max-w-5xl mx-auto px-4">

        {/* ✅ THE VIDEO PLAYER (YouTube or Uploaded) */}
        <div className="w-full bg-black rounded-2xl overflow-hidden shadow-2xl mb-8 aspect-video relative">
          {youtubeId ? (
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen>
            </iframe>
          ) : isUploadedVideo ? (
            <video
              className="absolute top-0 left-0 w-full h-full object-cover"
              controls
              autoPlay
              muted
              loop
            >
              <source src={property.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="flex items-center justify-center h-full text-white">Video Tour Not Available</div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {property.university}
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-4 leading-tight">{property.title}</h1>
              <p className="text-gray-500 mt-2 text-lg flex items-center gap-2">📍 {property.location}</p>
            </div>

            <hr className="border-gray-100" />

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Property Features</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">{property.description}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-green-600 h-fit sticky top-6">
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Rent per year</p>
            <p className="text-4xl font-black text-gray-900 mb-8">₦{parseInt(property.price).toLocaleString()}</p>

            <button
              onClick={handleWhatsAppClick}
              className="w-full bg-[#25D366] text-white font-black py-4 rounded-xl hover:bg-[#1DA851] hover:-translate-y-1 transition-all shadow-lg shadow-green-200 flex justify-center items-center gap-2 text-lg"
            >
              💬 Chat Agent on WhatsApp
            </button>
            <p className="text-center text-xs text-gray-400 mt-4 font-semibold">No signup required. Direct contact.</p>
          </div>
        </div>
      </div>
    </div>
  );
}