import React from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const cards = [
    { title: "Institutions", desc: "Manage higher learning institutions", path: "/institutions" },
    { title: "Faculties & Courses", desc: "Add or update faculties and courses", path: "/faculties" },
    { title: "Admissions", desc: "Publish admissions and view applicants", path: "/publish" },
    { title: "Companies", desc: "Approve or manage companies", path: "/companies" },
    { title: "Reports", desc: "View and manage reports", path: "/reports" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {cards.map((c) => (
          <div
            key={c.title}
            onClick={() => navigate(c.path)}
            className="bg-white p-6 rounded-2xl shadow-lg cursor-pointer hover:shadow-2xl transition"
          >
            <h2 className="text-xl font-semibold mb-2">{c.title}</h2>
            <p className="text-gray-600">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;

