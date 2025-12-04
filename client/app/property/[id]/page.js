"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic"; // 1. Import Dynamic

// 2. Load Paystack ONLY on the client (Fixes 'window is not defined')
const PaystackButton = dynamic(
  () => import("react-paystack").then((mod) => mod.PaystackButton),
  { ssr: false }
);

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // ⚠️ PASTE YOUR PAYSTACK PUBLIC KEY HERE
  const publicKey = "pk_test_1b56ed2843f62835f5c3e40f3f6c47a9620b62d9";

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchProperty = async () => {
      try {
        const res = await fetch(`https://student-housing-platform.onrender.com/api/properties/${id}`);
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

  // Helper: Save to DB after payment
  const handleSuccess = async (reference) => {
    try {
      const res = await fetch("https://student-housing-platform.onrender.com/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user.id,
          propertyId: property.id,
          price: 2000,
        }),
      });

      if (res.ok) {
        alert("✅ Payment Successful! Redirecting to your ticket...");
        window.location.href = "/bookings";
      }
    } catch (error) {
      console.error("Saving booking failed", error);
      alert("Payment successful, but failed to save receipt.");
    }
  };

  const amount = 2000 * 100; // ₦2,000 in Kobo

  const componentProps = {
    email: user?.email || "student@example.com",
    amount,
    metadata: {
      name: user?.fullName,
      phone: user?.phone || "08012345678",
    },
    publicKey,
    text: "Pay ₦2,000 for Viewing",
    onSuccess: (reference) => handleSuccess(reference),
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
              {/* Landlord Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold text-white">
                  {property.landlord?.fullName?.charAt(0) || "L"}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{property.landlord?.fullName || "Landlord"}</p>

                  {property.landlord?.isVerified ? (
                    <p className="text-xs text-green-600 font-bold flex items-center gap-1">✅ Verified Owner</p>
                  ) : (
                    <p className="text-xs text-gray-400">Unverified Account</p>
                  )}
                </div>
              </div>

              {/* PAYSTACK BUTTON (Now loaded dynamically) */}
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