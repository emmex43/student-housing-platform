"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PaystackButton } from "react-paystack"; // Import Paystack

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // ⚠️ PASTE YOUR PAYSTACK PUBLIC KEY HERE
  const publicKey = "pk_test_1b56ed2843f62835f5c3e40f3f6c47a9620b62d9"; 

  useEffect(() => {
    // Check if user is logged in (needed for email)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchProperty = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/properties/${id}`);
        const data = await res.json();
        if (res.ok) {
          setProperty(data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProperty();
  }, [id]);

  // Payment Configuration
  const amount = 2000 * 100; // ₦2,000 (Paystack counts in Kobo)
  
  const componentProps = {
    email: user?.email || "student@example.com", // User's email
    amount,
    metadata: {
      name: user?.fullName,
      phone: "08012345678",
    },
    publicKey,
    text: "Pay ₦2,000 to Book Viewing",
    onSuccess: () => alert("✅ Payment Successful! The landlord will contact you."),
    onClose: () => alert("Payment cancelled."),
  };

  if (loading) return <div className="p-10 text-center">Loading House Details...</div>;
  if (!property) return <div className="p-10 text-center">House not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="p-6 bg-white shadow-sm mb-8">
        <Link href="/" className="text-2xl font-bold text-green-600">StudentLodge.ng</Link>
      </nav>

      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        {/* Header */}
        <div className="mb-6">
          <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded uppercase">
            {property.university}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{property.title}</h1>
          <p className="text-gray-500">{property.location}</p>
        </div>

        {/* Image */}
        <img 
          src={property.images} 
          alt={property.title} 
          className="w-full h-96 object-cover rounded-xl mb-8"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Amenities</h2>
              <div className="flex gap-2">
                {property.amenities.split(",").map((item, index) => (
                  <span key={index} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar / Payment Card */}
          <div className="bg-gray-50 p-6 rounded-xl border h-fit">
            <p className="text-gray-500 mb-1">Rent per year</p>
            <p className="text-3xl font-bold text-green-600 mb-6">₦{property.price.toLocaleString()}</p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold text-white">
                  {property.landlord?.fullName?.charAt(0) || "L"}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{property.landlord?.fullName || "Landlord"}</p>
                  <p className="text-xs text-green-600">Verified Owner</p>
                </div>
              </div>

              {/* PAYSTACK BUTTON */}
              {user ? (
                <PaystackButton 
                  className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition" 
                  {...componentProps} 
                />
              ) : (
                <button 
                  onClick={() => alert("Please Login to Book")}
                  className="w-full bg-gray-400 text-white font-bold py-3 rounded-lg"
                >
                  Login to Book
                </button>
              )}
              
              <button className="w-full border border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-100 transition">
                Contact Landlord
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}