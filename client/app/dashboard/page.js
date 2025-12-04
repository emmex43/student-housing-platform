"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // ⚠️ CONFIGURATION: ENTER YOUR KEYS HERE
  const CLOUD_NAME = "dfrwxf1pg";          // I found this in your screenshot!
  const UPLOAD_PRESET = "student housing platform"; // ❌ PASTE YOUR PRESET NAME HERE (e.g. ml_default)

  const [form, setForm] = useState({
    title: "",
    price: "",
    university: "",
    location: "",
    description: "",
    images: "",
  });

  // Check login status
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
    } else {
      setUser(JSON.parse(storedUser));
      setIsLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 📸 UPLOAD FUNCTION
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (UPLOAD_PRESET === "YOUR_PRESET_HERE") {
      alert("⚠️ You forgot to paste your Upload Preset in the code!");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.secure_url) {
        setForm({ ...form, images: data.secure_url });
        alert("✅ Image uploaded successfully!");
      } else {
        alert("Upload failed. Check your Cloudinary Preset.");
        console.error("Cloudinary Error:", data);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to connect to Cloudinary.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.id) return alert("Please login first");
    if (!form.images) return alert("⚠️ Please upload an image first!");

    const dataToSend = { ...form, landlordId: user.id };

    try {
      const response = await fetch("http://localhost:5000/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        alert("🎉 House Posted Successfully!");
        router.push("/");
      } else {
        alert("Failed to post house.");
      }
    } catch (error) {
      alert("Server error.");
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Landlord Dashboard</h1>
        <p className="text-gray-500 mb-8">Post a new house for students.</p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 📸 STEP 1: IMAGE UPLOAD (Blue Box) */}
          <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200 text-center">
            <h3 className="font-bold text-blue-900 mb-2">📸 Step 1: Upload Photo</h3>

            {/* The File Input Button */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-700"
            />

            {uploading && <p className="text-blue-600 mt-2 font-bold animate-pulse">Uploading... Please wait...</p>}

            {/* Show Preview if uploaded */}
            {form.images && (
              <div className="mt-4">
                <p className="text-green-600 font-bold mb-2">✅ Photo Ready:</p>
                <img src={form.images} alt="Preview" className="h-40 mx-auto rounded-lg shadow-md border" />
              </div>
            )}
          </div>

          {/* STEP 2: DETAILS */}
          <div className="space-y-4">
            <div>
              <label className="font-bold text-gray-700">Property Title</label>
              <input name="title" onChange={handleChange} placeholder="e.g. Spacious Self-con in Yaba" className="w-full p-3 border rounded-lg" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-gray-700">Price (₦ / Year)</label>
                <input name="price" type="number" onChange={handleChange} placeholder="e.g. 350000" className="w-full p-3 border rounded-lg" required />
              </div>
              <div>
                <label className="font-bold text-gray-700">University</label>
                <select name="university" onChange={handleChange} className="w-full p-3 border rounded-lg bg-white" required>
                  <option value="">Select University</option>
                  <option value="Unilag">Unilag</option>
                  <option value="LASU">LASU</option>
                  <option value="UNIBEN">UNIBEN</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700">Full Address</label>
              <input name="location" onChange={handleChange} placeholder="e.g. 5, Bariga Road, Yaba" className="w-full p-3 border rounded-lg" required />
            </div>

            <div>
              <label className="font-bold text-gray-700">Description</label>
              <textarea name="description" onChange={handleChange} placeholder="Describe the house..." className="w-full p-3 border rounded-lg h-32" required />
            </div>
          </div>

          <button
            disabled={uploading || !form.images}
            className={`w-full text-white font-bold py-4 rounded-lg transition text-lg
              ${(uploading || !form.images) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {uploading ? "Uploading Image..." : "🚀 Post Property Now"}
          </button>

        </form>
      </div>
    </div>
  );
}