"use client";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiUser, FiLock } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function Home() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const router = useRouter();

  const handleSubmit = async (e) => {
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
        if (typeof window !== "undefined") {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("department", data.department);
          localStorage.setItem("username", data.username);
          localStorage.setItem("employeeId", data.employeeId);
        }
        router.push("/dashboard");
      } else {
        setStatus("error");
      }

      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-sky-400/20 to-sky-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [0, -3, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 -right-20 w-60 h-60 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl"
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col md:flex-row">
        {/* Left Panel */}
        <div className="w-full md:w-1/2 flex flex-col justify-between px-6 py-0 min-h-screen backdrop-blur-sm">
          {/* Header */}
          <motion.header
            className="py-8 px-4 flex justify-center items-center"
            initial={{ opacity: 0, y: -80, rotateX: 90 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1.2, ease: "backOut" }}
          >
            <motion.div
              initial={{ scale: 0.8, rotateY: 30 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ duration: 1.5, delay: 0.3, ease: "backOut" }}
              className="text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="mb-4"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="text-white text-2xl font-bold"
                  >
                    T&D
                  </motion.div>
                </div>
              </motion.div>
              
              <motion.h2
                className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 via-sky-600 to-sky-700 bg-clip-text text-transparent leading-tight"
                initial={{ letterSpacing: "0.2em", opacity: 0 }}
                animate={{ letterSpacing: "0.02em", opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.7, ease: "backOut" }}
              >
                Training & Development
                <br />
                <span className="text-xl md:text-2xl font-semibold">Management System</span>
              </motion.h2>
            </motion.div>
          </motion.header>

          {/* Login Form */}
          <div className="flex-grow flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: "backOut" }}
              className="w-full max-w-md"
            >
              {/* Glass Card Effect with Doodle Background */}
              <div className="relative">
                {/* Doodle Background Pattern */}
                <div className="absolute inset-0 opacity-5 rounded-3xl overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Animated Doodles */}
                    <motion.path
                      d="M50 100 Q 80 70, 110 100 T 170 100"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-sky-600"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 2, delay: 2 }}
                    />
                    <motion.circle
                      cx="300"
                      cy="150"
                      r="15"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-purple-500"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1, delay: 2.5 }}
                    />
                    <motion.path
                      d="M200 200 L 220 180 L 240 200 L 220 220 Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-green-500"
                      initial={{ rotate: 0, opacity: 0 }}
                      animate={{ rotate: 360, opacity: 1 }}
                      transition={{ duration: 3, delay: 3 }}
                    />
                    <motion.path
                      d="M80 300 Q 100 280, 120 300 Q 140 320, 160 300"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-orange-500"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 2, delay: 3.5 }}
                    />
                    <motion.rect
                      x="280"
                      y="280"
                      width="30"
                      height="30"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-pink-500"
                      initial={{ scale: 0, rotate: 45, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ duration: 1.5, delay: 4 }}
                    />
                    <motion.path
                      d="M150 400 C 170 380, 190 420, 210 400 C 230 380, 250 420, 270 400"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-indigo-500"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 2.5, delay: 4.5 }}
                    />
                    <motion.polygon
                      points="60,450 75,420 90,450 75,480"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-teal-500"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1, delay: 5 }}
                    />
                    <motion.path
                      d="M320 420 Q 340 400, 360 420 T 380 420"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-red-500"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 2, delay: 5.5 }}
                    />
                    {/* Stars */}
                    <motion.g className="text-yellow-500">
                      <motion.path
                        d="M120 50 L125 60 L135 60 L127 67 L130 77 L120 70 L110 77 L113 67 L105 60 L115 60 Z"
                        fill="currentColor"
                        initial={{ scale: 0, rotate: 0, opacity: 0 }}
                        animate={{ scale: 1, rotate: 180, opacity: 1 }}
                        transition={{ duration: 1.5, delay: 6 }}
                      />
                      <motion.path
                        d="M330 80 L333 86 L340 86 L335 90 L337 97 L330 93 L323 97 L325 90 L320 86 L327 86 Z"
                        fill="currentColor"
                        initial={{ scale: 0, rotate: 0, opacity: 0 }}
                        animate={{ scale: 1, rotate: -180, opacity: 1 }}
                        transition={{ duration: 1.5, delay: 6.5 }}
                      />
                    </motion.g>
                    {/* Heart */}
                    <motion.path
                      d="M200 350 C 200 340, 210 335, 215 345 C 220 335, 230 340, 230 350 C 230 360, 215 375, 215 375 C 215 375, 200 360, 200 350 Z"
                      fill="currentColor"
                      className="text-pink-400"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                      transition={{ duration: 2, delay: 7 }}
                    />
                  </svg>
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-white/20 backdrop-blur-xl rounded-3xl"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent rounded-3xl"></div>
                <div className="relative bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/30">
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-center mb-8"
                  >
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                      Welcome
                    </h1>
                    <p className="text-slate-500 font-medium">Sign into your account</p>
                  </motion.div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Employee ID Input */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                      className="relative group"
                    >
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <FiUser className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors duration-300" />
                      </div>
                      <input
                        type="text"
                        placeholder="Employee ID"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/50 border-2 border-slate-200/50 rounded-2xl focus:outline-none focus:border-sky-400 focus:bg-white/70 transition-all duration-300 text-slate-700 placeholder-slate-400 font-medium shadow-lg focus:shadow-xl"
                        required
                        autoComplete="username"
                      />
                    </motion.div>

                    {/* Password Input */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 1 }}
                      className="relative group"
                    >
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <FiLock className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors duration-300" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-14 py-4 bg-white/50 border-2 border-slate-200/50 rounded-2xl focus:outline-none focus:border-sky-400 focus:bg-white/70 transition-all duration-300 text-slate-700 placeholder-slate-400 font-medium shadow-lg focus:shadow-xl [&::-ms-reveal]:hidden [&::-webkit-textfield-decoration-container]:hidden"
                        autoComplete="new-password"
                        style={{ 
                          WebkitAppearance: 'none',
                          MozAppearance: 'textfield'
                        }}
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-300 z-20 bg-white/80 rounded-full p-1"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </motion.button>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.2 }}
                    >
                      <motion.button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-2xl font-bold text-white transition-all duration-300 shadow-xl ${
                          status === "error"
                            ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                            : status === "success"
                            ? "bg-gradient-to-r from-green-500 to-green-600"
                            : "bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800"
                        } ${loading ? "cursor-not-allowed" : "hover:shadow-2xl hover:scale-[1.02]"}`}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        animate={loading ? { scale: [1, 1.02, 1] } : {}}
                        transition={loading ? { duration: 1, repeat: Infinity } : {}}
                      >
                        {loading ? (
                          <motion.div 
                            className="flex justify-center items-center gap-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
                            />
                            <span>Signing you in...</span>
                          </motion.div>
                        ) : status === "success" ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center justify-center gap-2"
                          >
                            <motion.div
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.5 }}
                            >
                              ✓
                            </motion.div>
                            Login Successful
                          </motion.div>
                        ) : status === "error" ? (
                          "Invalid Credentials - Try Again"
                        ) : (
                          "Sign Into Continue"
                        )}
                      </motion.button>
                    </motion.div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="py-6 text-center"
          >
            <p className="text-slate-400 text-sm font-medium">
              © QA-MIS | Greentech Industries 
              <span className="mx-2">•</span>
              <span className="text-slate-500">v1.0</span>
            </p>
          </motion.footer>
        </div>

        {/* Right Image Panel */}
        <motion.div
          initial={{ opacity: 0, x: 100, rotateY: -15 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ delay: 0.8, duration: 1.5, ease: "backOut" }}
          className="flex items-center justify-center w-full md:w-1/2 min-h-[250px] md:min-h-0 pr-4"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-56 sm:h-72 md:h-[90vh] overflow-hidden group"
          >
            {/* Gradient Border Effect with Increased Radius */}
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-sky-700 to-sky-800 rounded-[2.5rem] p-0.5 group-hover:p-0.5 transition-all duration-300">
              <div className="w-full h-full rounded-[2.25rem] overflow-hidden relative">
                <Image
                  src="/assets/loginimage.png"
                  alt="Login Banner"
                  fill
                  priority
                  className="object-cover transition-all duration-700 group-hover:scale-105 rounded-[2.25rem]"
                  style={{
                    objectPosition: "right center",
                  }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                
                {/* Overlay Effects */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[2.25rem]" />
                
                {/*  Animated Light Effect  */}
                <motion.div
                  animate={{
                    x: ["-190%", "190%"],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut",
                  }}
                  className="absolute top-0 left-0 w-96 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 opacity-70"
                  style={{
                    filter: 'blur(1px)',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 60%, rgba(255,255,255,0.1) 80%, transparent 100%)'
                  }}
                />
              </div>
            </div>
            
            {/* Floating Elements */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-8 right-8 w-4 h-4 bg-yellow-400/60 rounded-full blur-sm"
            />
            <motion.div
              animate={{
                y: [0, 10, 0],
                rotate: [0, -5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute bottom-12 right-16 w-3 h-3 bg-blue-400/60 rounded-full blur-sm"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}