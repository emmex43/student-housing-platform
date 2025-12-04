"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  // Added "phone" to the state
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", role: "STUDENT" });
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("https://student-housing-platform.onrender.com/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Registration Successful! Please Login.");
      router.push("/login");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="fullName"
            placeholder="Full Name"
            onChange={handleChange}
            className="w-full p-3 border rounded-lg text-black"
            required
          />

          {/* NEW PHONE INPUT */}
          <input
            name="phone"
            type="tel"
            placeholder="Phone Number (e.g. 08012345678)"
            onChange={handleChange}
            className="w-full p-3 border rounded-lg text-black"
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            onChange={handleChange}
            className="w-full p-3 border rounded-lg text-black"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full p-3 border rounded-lg text-black"
            required
          />

          <select name="role" onChange={handleChange} className="w-full p-3 border rounded-lg text-black bg-white">
            <option value="STUDENT">I am a Student</option>
            <option value="LANDLORD">I am a Landlord</option>
          </select>

          // In Login and Register pages:
          <button
            className="w-full bg-green-600 text-white p-3 rounded-lg font-bold shadow-md 
             hover:bg-green-700 hover:-translate-y-0.5 
             active:scale-95 active:bg-green-800 
             transition-all duration-200"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}