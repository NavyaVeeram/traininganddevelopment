"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function Home() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    setTimeout(async () => {
      const res = await fetch("/api/employee_login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EmployeeId: employeeId, Password: password }),
      });

      const data = await res.json();

      if (res.status === 200 && data.message === "Login Successful") {
        setStatus("success");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("department", data.department);
        localStorage.setItem("username", data.username);
        localStorage.setItem("employeeId", data.employeeId);
        router.push("/dashboard");
      } else {
        setStatus("error");
      }

      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-yellow-50 to-gray-100">

      {/* Left Panel */}
      <div className="w-full md:w-1/2 flex flex-col justify-between px-6 py-0 min-h-screen">

       <header className="py-6 px-4">
  <div className=" ">
    <h2
      className="text-3xl font-semibold text-gray-900"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <span className="text-sky-400">
        Training & Development Information System
      </span>
    </h2>
  </div>
</header>
 {/* Login Form */}
<div className="flex-grow flex items-center justify-center">
        <motion.div
            initial={{ opacity: 0, y: -50, rotateX: 90 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-md bg-white shadow-2xl rounded-xl p-8"
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Login</h1>
            <p className="text-sm text-gray-500 mb-6">Enter your credentials</p>
          <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
                autoComplete="off"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                  autoComplete="off"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </span>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className={`w-full cursor-pointer py-3 rounded-lg font-semibold text-white transition duration-300 ${
                  status === "error"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-yellow-400 hover:bg-yellow-500"
                }`}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? (
                  <span className="flex justify-center items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                      ></path>
                    </svg>
                    Please wait...
                  </span>
                ) : status === "success" ? (
                  "Login Successful"
                ) : status === "error" ? (
                  "Check your credentials"
                ) : (
                  "Login"
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Footer ONLY for left panel */}
        <footer className="py-4 text-center">
          <p className="text-gray-400 text-sm">© Greentech Industries v.1.0</p>
        </footer>
      </div>

      {/* Right Image Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="hidden md:flex items-center justify-center w-full md:w-1/2"
      >
        <Image
          src="/assets/loginimage.png"
          alt="Login Banner"
          width={800}
          height={100}
          priority
          className="object-cover h-[95%] w-full rounded-l-3xl transition-all duration-700"
        />
      </motion.div>
    </div>
  );
}
