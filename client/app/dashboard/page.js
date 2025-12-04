"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // ✅ FIX: Variable name is now consistently 'isLoading'
  const [isLoading, setIsLoading] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [myProperties, setMyProperties] = useState([]);

  // ⚠️ YOUR CLOUDINARY KEYS
  const CLOUD_NAME = "dfrwxf1pg";
  const UPLOAD_PRESET = "student housing platform";

  // ⚠️ API URL
  const API_URL = "https://student-housing-platform.onrender.com";

  const [form, setForm] = useState({
    title: "", price: "", university: "", location: "", description: "", images: "",
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
      const myHouses = data.filter(house => house.landlordId === userId);
      setMyProperties(myHouses);
    } catch (err) {
      console.error("Error fetching properties");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await fetch(`${API_URL}/api/properties/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !currentStatus }),
      });
      fetchMyProperties(user.id);
    } catch (error) {
      alert("Failed to update status");
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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
      const data = await res.json();
      setForm({ ...form, images: data.secure_url });
    } catch (error) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.images) return alert("⚠️ Please upload an image first!");

    const dataToSend = { ...form, landlordId: user.id };

    try {
      const response = await fetch(`${API_URL}/api/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        alert("🎉 House Posted Successfully!");
        setForm({ title: "", price: "", university: "", location: "", description: "", images: "" });
        fetchMyProperties(user.id);
      } else {
        alert("Failed to post house.");
      }
    } catch (error) {
      alert("Server error.");
    }
  };

  // ✅ THIS LINE CAUSED THE ERROR BEFORE (It needs isLoading to be defined)
  if (isLoading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Landlord Dashboard Panel</h1>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-10">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Post a New House</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-100 text-center">
              <input type="file" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
              {uploading && <p className="text-blue-600 mt-2 animate-pulse">Uploading...</p>}
              {form.images && <img src={form.images} alt="Preview" className="h-20 mx-auto mt-2 rounded shadow" />}
            </div>

            <input name="title" value={form.title} onChange={handleChange} placeholder="Property Title" className="w-full p-3 border rounded" required />
            <div className="grid grid-cols-2 gap-4">
              <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price (₦)" className="w-full p-3 border rounded" required />
              <select name="university" value={form.university} onChange={handleChange} className="w-full p-3 border rounded bg-white" required>
                <option value="">Select University</option>
                <option value="Unilag">Unilag</option>
                <option value="LASU">LASU</option>
                <option value="UNIBEN">UNIBEN</option>
              </select>
            </div>
            <input name="location" value={form.location} onChange={handleChange} placeholder="Address" className="w-full p-3 border rounded" required />
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full p-3 border rounded h-24" required />

            <button disabled={uploading} className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 transition">
              {uploading ? "Wait..." : "🚀 Post Property"}
            </button>
          </form>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Listed Properties</h2>
        <div className="space-y-4">
          {myProperties.length === 0 && <p className="text-gray-500">You haven't posted any houses yet.</p>}

          {myProperties.map((house) => (
            <div key={house.id} className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex gap-4 items-center w-full">
                <img src={house.images} className="w-20 h-20 rounded object-cover border" />
                <div>
                  <h3 className="font-bold text-lg">{house.title}</h3>
                  <p className="text-gray-500 text-sm">₦{parseInt(house.price).toLocaleString()}</p>
                  <span className={`inline-block mt-1 text-xs font-bold px-2 py-1 rounded ${house.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {house.isAvailable ? "✅ Available" : "❌ Taken"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={() => handleToggleStatus(house.id, house.isAvailable)}
                  className={`flex-1 md:flex-none px-4 py-2 rounded text-sm font-bold transition whitespace-nowrap
                    ${house.isAvailable ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                >
                  {house.isAvailable ? "Mark Taken" : "Mark Available"}
                </button>

                <button
                  onClick={() => handleDelete(house.id)}
                  className="flex-1 md:flex-none bg-red-100 text-red-800 px-4 py-2 rounded text-sm font-bold hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
