"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [myProperties, setMyProperties] = useState([]); // Store list of houses

  // ⚠️ YOUR KEYS
  const CLOUD_NAME = "dfrwxf1pg";
  const UPLOAD_PRESET = "student housing platform";

  const [form, setForm] = useState({
    title: "", price: "", university: "", location: "", description: "", images: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchMyProperties(parsedUser.id); // Fetch houses on load
      setIsLoading(false);
    }
  }, []);

  // NEW: Fetch Landlord's Properties
  const fetchMyProperties = async (userId) => {
    try {
      // In a real app, we'd have a specific route for this, 
      // but for now we filter on the client or add a backend route.
      // Let's assume we create a route or just fetch all and filter (MVP style):
      const res = await fetch("http://student-housing-platform.onrender.com/api/properties");
      const data = await res.json();
      // Filter only MY houses
      const myHouses = data.filter(house => house.landlordId === userId);
      setMyProperties(myHouses);
    } catch (err) {
      console.error("Error fetching properties");
    }
  };

  // NEW: Delete Function
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this house?")) return;

    await fetch(`http://student-housing-platform.onrender.com/api/properties/${id}`, { method: "DELETE" });
    fetchMyProperties(user.id); // Refresh list
  };

  // NEW: Toggle Availability
  const handleToggleStatus = async (id, currentStatus) => {
    await fetch(`http://student-housing-platform.onrender.com/api/properties/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !currentStatus }),
    });
    fetchMyProperties(user.id); // Refresh list
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

    // ... (Use your fetch code here to post property) ...
    // After success:
    alert("House Posted!");
    fetchMyProperties(user.id); // Update the list below
  };

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">

        {/* POST FORM SECTION (Keep your existing form here) */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">🏡 Post a New House</h1>
          {/* ... INSERT YOUR FORM CODE HERE ... */}
        </div>

        {/* NEW: MY PROPERTIES LIST */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Listed Properties</h2>
        <div className="grid gap-4">
          {myProperties.map((house) => (
            <div key={house.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <img src={house.images} className="w-16 h-16 rounded object-cover" />
                <div>
                  <h3 className="font-bold text-lg">{house.title}</h3>
                  <p className="text-sm text-gray-500">₦{house.price}</p>
                  {/* Status Badge */}
                  <span className={`text-xs font-bold px-2 py-1 rounded ${house.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {house.isAvailable ? "Available" : "⚠️ Taken"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {/* TOGGLE BUTTON */}
                <button
                  onClick={() => handleToggleStatus(house.id, house.isAvailable)}
                  className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded text-sm font-bold hover:bg-yellow-200"
                >
                  {house.isAvailable ? "Mark as Taken" : "Mark Available"}
                </button>

                {/* DELETE BUTTON */}
                <button
                  onClick={() => handleDelete(house.id)}
                  className="bg-red-100 text-red-800 px-3 py-2 rounded text-sm font-bold hover:bg-red-200"
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