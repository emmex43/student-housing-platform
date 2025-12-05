"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ Search State including University
  const [search, setSearch] = useState({ location: "", maxPrice: "", university: "" });

  // ⚠️ LIVE API URL
  const API_URL = "https://student-housing-platform.onrender.com";

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async (queryParams = "") => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/properties${queryParams}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setProperties(data);
        if (queryParams && data.length === 0) {
          alert("No houses found matching your search. Try adjusting the filters.");
        }
      }
    } catch (error) {
      console.error("Error loading properties:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ REAL SEARCH FUNCTION
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search.location) params.append("location", search.location);
    if (search.maxPrice) params.append("maxPrice", search.maxPrice);
    if (search.university) params.append("university", search.university);

    const queryString = "?" + params.toString();
    fetchProperties(queryString);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navigation - Responsive */}
      <nav className="flex justify-between items-center p-4 md:p-6 bg-white shadow-sm sticky top-0 z-50">
        
        {/* 1. Logo */}
        <div className="text-xl md:text-2xl font-bold text-green-600">
          StudentLodge<span className="hidden md:inline">.ng</span>
        </div>

        {/* 2. Mobile Menu */}
        <div className="md:hidden flex gap-2">
           <Link href="/login">
             <button className="text-sm font-bold text-gray-600 border border-gray-300 px-3 py-1 rounded-lg">
               Login
             </button>
           </Link>
           <Link href="/register">
             <button className="text-sm font-bold bg-green-600 text-white px-3 py-1 rounded-lg">
               Join
             </button>
           </Link>
        </div>

        {/* 3. Desktop Menu */}
        <div className="hidden md:flex space-x-4">
          <Link href="/login">
            <button className="text-gray-600 hover:text-green-600 font-bold transition">Login</button>
          </Link>
          <Link href="/register">
            <button className="bg-green-600 text-white px-5 py-2 rounded-full font-bold shadow-md hover:bg-green-700 hover:-translate-y-0.5 transition-all">
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-green-600 text-white p-6 md:p-20 text-center shadow-lg">
        <h1 className="text-3xl md:text-6xl font-extrabold mb-6">
          Find Your Perfect <span className="text-yellow-300">Student Lodge</span>
        </h1>
        <p className="text-lg md:text-xl mb-10 opacity-90">Secure, affordable, and close to campus.</p>

        {/* Search Bar - Now with University Filter! */}
        <div className="bg-white p-4 rounded-xl shadow-2xl max-w-5xl mx-auto flex flex-col md:flex-row gap-4">
          
          <select 
            className="p-4 rounded-lg text-gray-900 border-2 border-transparent focus:border-green-500 focus:bg-green-50 outline-none transition bg-white"
            onChange={(e) => setSearch({ ...search, university: e.target.value })}
          >
            <option value="">All Universities</option>
            <option value="UNILAG">UNILAG</option>
            <option value="LASU">LASU</option>
            <option value="UNIBEN">UNIBEN</option>
            <option value="OAU">OAU</option>
            <option value="UNN">UNN</option>
            <option value="UI">UNIBADAN</option>
            <option value="UNILORIN">UNILORIN</option>
            <option value="FUTA">FUTA</option>
            <option value="FUNAAB">FUNAAB</option>
            <option value="OOU">OOU</option>
          </select>

          <input
            placeholder="Location (e.g. Akoka)"
            className="flex-1 p-4 rounded-lg text-gray-900 border-2 border-transparent focus:border-green-500 focus:bg-green-50 outline-none transition"
            onChange={(e) => setSearch({ ...search, location: e.target.value })}
          />
          
          <input
            placeholder="Max Price (₦)"
            type="number"
            className="w-full md:w-40 p-4 rounded-lg text-gray-900 border-2 border-transparent focus:border-green-500 focus:bg-green-50 outline-none transition"
            onChange={(e) => setSearch({ ...search, maxPrice: e.target.value })}
          />
          
          <button
            onClick={handleSearch}
            className="bg-green-800 text-white px-8 py-4 rounded-lg font-bold shadow-lg hover:bg-green-900 active:scale-95 transition-all"
          >
            Search
          </button>
        </div>
      </header>

      {/* Property Grid */}
      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Latest Hostels</h2>

        {loading ? (
          <div className="text-center py-20 text-gray-500 text-xl">Loading available houses...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                {/* Image with Zoom Effect */}
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={property.images}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-green-700 shadow-sm">
                    {property.university}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{property.title}</h3>
                    <p className="text-green-600 font-extrabold text-lg">₦{parseInt(property.price).toLocaleString()}</p>
                  </div>
                  <p className="text-gray-500 text-sm mb-4 flex items-center gap-1">
                    📍 {property.location}
                  </p>

                  <Link href={`/property/${property.id}`}>
                    <button className="w-full bg-green-50 text-green-700 font-bold py-3 rounded-xl hover:bg-green-600 hover:text-white active:scale-95 transition-all">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
