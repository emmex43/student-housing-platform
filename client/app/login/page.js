"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://student-housing-platform.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Save the token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Welcome back, " + data.user.fullName + "!");

        // 2. SMART REDIRECT LOGIC
        if (data.user.role === "LANDLORD") {
          router.push("/dashboard"); // Landlords go to Dashboard
        } else if (data.user.role === "ADMIN") {
          router.push("/admin");     // Admins go to Verification Page
        } else {
          router.push("/");          // Students go to Homepage
        }

      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Something went wrong connecting to the server.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}