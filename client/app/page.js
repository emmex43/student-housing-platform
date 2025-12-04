"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH REAL DATA WHEN PAGE LOADS
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/properties");
        const data = await res.json();
        setProperties(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching properties:", error);
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="w-full p-6 flex justify-between items-center bg-white shadow-sm fixed top-0 z-10">
        <h1 className="text-2xl font-bold text-green-600">StudentLodge.ng</h1>
        <div className="space-x-4">
          <Link href="/login" className="text-gray-600 hover:text-green-600 font-medium">
            Log In
          </Link>
          <Link href="/register" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-12 px-4 text-center bg-white">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
          Find your perfect <span className="text-green-600">student home</span>.
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Verified hostels and apartments near Unilag, LASU, and UNIBEN.
        </p>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-lg max-w-3xl mx-auto flex flex-col md:flex-row gap-4 border border-gray-100">
          <input 
            type="text" 
            placeholder="Type your University (e.g. Unilag)" 
            className="flex-1 p-3 border border-gray-300 rounded-lg text-black"
          />
          <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold">
            Search
          </button>
        </div>
      </div>

      {/* 🏡 REAL PROPERTIES SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Latest Hostels</h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading houses...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {properties.length === 0 ? (
              <p className="text-gray-500 col-span-3 text-center">No houses posted yet. Be the first!</p>
            ) : (
              properties.map((property) => (
                <div key={property.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
                  {/* Image */}
                  <img 
                    src={property.images} 
                    alt={property.title} 
                    className="w-full h-48 object-cover" 
                  />
                  
                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                        {property.university}
                      </span>
                      <span className="text-gray-500 text-sm">{property.location}</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {property.description}
                    </p>

                    <div className="flex justify-between items-center border-t pt-4">
                      <span className="text-2xl font-bold text-green-600">
                        ₦{property.price.toLocaleString()}
                      </span>
                      <Link href={`/property/${property.id}`} className="text-green-600 font-semibold border border-green-600 px-4 py-2 rounded-lg hover:bg-green-50 inline-block">
  View Details
</Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}