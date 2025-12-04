"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(storedUser);

    // 2. Fetch their tickets
    const fetchBookings = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/bookings/${user.id}`);
        const data = await res.json();
        setBookings(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading your tickets...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
       <nav className="mb-8 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-green-600">StudentLodge.ng</Link>
        <Link href="/" className="text-gray-600 hover:text-green-600">Back to Home</Link>
      </nav>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🎟️ My Viewing Tickets</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">You haven't booked any viewings yet.</p>
            <Link href="/" className="bg-green-600 text-white px-6 py-2 rounded-lg">Browse Houses</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded-xl shadow border-l-8 border-green-500 flex flex-col md:flex-row justify-between items-center gap-4">
                
                {/* Left Side: House Info */}
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{booking.property.title}</h2>
                  <p className="text-gray-500 text-sm">{booking.property.location}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">PAID: ₦{booking.totalPrice}</span>
                    <span className="text-xs text-gray-400">Date: {new Date(booking.startDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Right Side: Landlord Contact (The Fix) */}
                <div className="text-center md:text-right bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 min-w-[200px]">
                   <p className="text-xs text-gray-500 mb-1">Landlord Contact:</p>
                   
                   {/* DYNAMIC PHONE NUMBER */}
                   <p className="text-lg font-bold text-gray-900">
                     {booking.property.landlord?.phone || "No Number"}
                   </p>
                   
                   <p className="text-xs text-green-600 font-bold mb-2">Verified Owner</p>
                   
                   <a 
                     href={`tel:${booking.property.landlord?.phone}`}
                     className="inline-block bg-green-600 text-white text-xs px-3 py-2 rounded hover:bg-green-700 transition"
                   >
                     📞 Call Now
                   </a>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}