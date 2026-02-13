import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const res = await axios.post(
        "/api/admin/login",
        {
          mobile: data.mobile,
          mpin: data.mpin,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success(res.data.message);
      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4">
      <div className="max-w-5xl w-full grid md:grid-cols-2 bg-white dark:bg-[#0f172a] rounded-xl shadow-xl overflow-hidden">
        
        {/* LEFT */}
        <div className="p-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">
              verified_user
            </span>
            <span className="text-sm font-medium text-primary">
              Secure Access
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Secure Admin Login
          </h1>
          <p className="text-gray-500 mb-8">
            Enter your credentials to manage the fintech ecosystem.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* MOBILE */}
            <div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400">
                  phone
                </span>
                <input
                  type="text"
                  placeholder="8708574843"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                  {...register("mobile", {
                    required: "Mobile is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Enter valid 10 digit mobile",
                    },
                  })}
                />
              </div>
              {errors.mobile && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.mobile.message}
                </p>
              )}
            </div>

            {/* MPIN */}
            <div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400">
                  lock
                </span>
                <input
                  type={showPin ? "text" : "password"}
                  placeholder="••••"
                  className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                  {...register("mpin", {
                    required: "MPIN is required",
                    pattern: {
                      value: /^[0-9]{4}$/,
                      message: "MPIN must be 4 digits",
                    },
                  })}
                />
                <span
                  className="material-symbols-outlined absolute right-3 top-3 cursor-pointer text-gray-400"
                  onClick={() => setShowPin(!showPin)}
                >
                  visibility
                </span>
              </div>
              {errors.mpin && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.mpin.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90"
            >
              {loading ? "Signing In..." : "Sign In to Dashboard"}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>
        </div>

        {/* RIGHT */}
        <div className="hidden md:flex flex-col items-center justify-center bg-primary text-white p-10 relative">
          <span className="material-symbols-outlined text-7xl mb-4">
            admin_panel_settings
          </span>
          <h2 className="text-2xl font-bold mb-2">Enhanced Security</h2>
          <p className="text-center opacity-90">
            Bank-grade encryption and continuous monitoring.
          </p>

          <div className="flex gap-4 mt-6">
            <div className="bg-white/10 px-6 py-4 rounded-lg text-center">
              <p className="text-2xl font-bold">99.9%</p>
              <p className="text-sm">Uptime</p>
            </div>
            <div className="bg-white/10 px-6 py-4 rounded-lg text-center">
              <p className="text-2xl font-bold">256-bit</p>
              <p className="text-sm">Encryption</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
