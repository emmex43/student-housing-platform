"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [myProperties, setMyProperties] = useState([]);

  // ⚠️ LIVE API URL
  const API_URL = "https://student-housing-platform.onrender.com";

  // ✅ Updated Form State
  const [form, setForm] = useState({
    title: "", price: "", university: "", location: "", description: "", videoUrl: "", agentNumber: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
    } else {
      const currentUser = JSON.parse(storedUser);
      setUser(currentUser);
      fetchMyProperties(currentUser.id);
      setIsLoading(false);
    }
  }, []);

  const fetchMyProperties = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/properties`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const myHouses = data.filter(house => house.landlordId === userId);
        setMyProperties(myHouses);
      }
    } catch (err) {
      console.error("Error fetching properties");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this house?")) return;
    try {
      await fetch(`${API_URL}/api/properties/${id}`, { method: "DELETE" });
      fetchMyProperties(user.id);
      alert("Property Deleted.");
    } catch (error) {
      alert("Failed to delete.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = { ...form, landlordId: user.id };

    try {
      const response = await fetch(`${API_URL}/api/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        alert("🎉 House Posted Successfully!");
        setForm({ title: "", price: "", university: "", location: "", description: "", videoUrl: "", agentNumber: "" });
        fetchMyProperties(user.id);
      } else {
        alert("Failed to post house.");
      }
    } catch (error) {
      alert("Server error.");
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <nav className="max-w-4xl mx-auto flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
        <div className="text-green-600 font-bold text-xl">Admin Console</div>
        <button onClick={handleLogout} className="text-red-500 font-bold hover:text-red-700 text-sm border border-red-200 px-3 py-1 rounded">
          Logout
        </button>
      </nav>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-10 border-t-4 border-green-600">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Post a New House (Video Mode)</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ✅ NEW: YouTube Link & Agent Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder="Paste YouTube Link Here" className="w-full p-4 border-2 border-red-100 bg-red-50 rounded text-red-900 focus:border-red-500 outline-none" required />
              <input name="agentNumber" value={form.agentNumber} onChange={handleChange} placeholder="Agent WhatsApp (e.g. 2348012345678)" className="w-full p-4 border-2 border-green-100 bg-green-50 rounded text-green-900 focus:border-green-500 outline-none" required />
            </div>

            <input name="title" value={form.title} onChange={handleChange} placeholder="Property Title (e.g. 2 Bedroom Flat)" className="w-full p-3 border rounded" required />

            <div className="grid grid-cols-2 gap-4">
              <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price (₦)" className="w-full p-3 border rounded" required />
              <select name="university" value={form.university} onChange={handleChange} className="w-full p-3 border rounded bg-white" required>
                <option value="">Select University</option>
                <option value="UNILAG">UNILAG</option>
                <option value="LASU">LASU</option>
                <option value="UNIBEN">UNIBEN</option>
                <option value="OAU">OAU</option>
                <option value="UNN">UNN</option>
                <option value="UI">UNIBADAN</option>
                <option value="UNILORIN">UNILORIN</option>
                <option value="FUTA">FUTA</option>
              </select>
            </div>

            <input name="location" value={form.location} onChange={handleChange} placeholder="Full Address" className="w-full p-3 border rounded" required />

            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Features (e.g. Borehole, Fenced, Pre-paid Meter...)" className="w-full p-3 border rounded h-24" required />

            <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded hover:bg-gray-800 transition text-lg">
              🚀 Publish Property
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}