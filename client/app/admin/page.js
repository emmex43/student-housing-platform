"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const router = useRouter();

  // Fetch all users on load
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("http://localhost:5000/api/users");
    const data = await res.json();
    setUsers(data);
  };

  const handleVerify = async (userId) => {
    const res = await fetch(`http://localhost:5000/api/users/${userId}/verify`, {
      method: "PUT",
    });
    
    if (res.ok) {
      alert("✅ User Verified!");
      fetchUsers(); // Refresh the list
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">👮‍♂️ Admin Control Center</h1>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-bold text-gray-600">Name</th>
                <th className="p-4 font-bold text-gray-600">Role</th>
                <th className="p-4 font-bold text-gray-600">Status</th>
                <th className="p-4 font-bold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-gray-800 font-medium">{user.fullName}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'LANDLORD' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.isVerified ? (
                      <span className="text-green-600 font-bold flex items-center gap-1">
                        ✅ Verified
                      </span>
                    ) : (
                      <span className="text-yellow-600 text-sm">Unverified</span>
                    )}
                  </td>
                  <td className="p-4">
                    {!user.isVerified && user.role === 'LANDLORD' && (
                      <button 
                        onClick={() => handleVerify(user.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}