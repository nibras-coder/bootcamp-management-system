import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import calligraphy from "../assets/calligraphy.jpg";
import registrationBg from "../assets/registration-bg.jpg";
import logo from "../assets/logo.png";
import API from "../api/axios";

// Zod Schema
const registerSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().email("Please use a valid email"),
    gender: z.enum(["Male", "Female"], {
      required_error: "Please select a gender",
    }),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the Terms and Conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      gender: "Male",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit = async (data) => {
    setError("");
    setSuccess("");

    try {
      const response = await API.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        gender: data.gender,
      });

      setSuccess(
        response.data?.message || "Registration successful! You can now log in."
      );
      reset();

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      const backendMessage =
        err.response?.data?.message || err.response?.data?.error;
      if (err.response?.status === 400) {
        setError(backendMessage || "Invalid registration information.");
      } else if (err.response?.status === 409) {
        setError("An account with this email already exists.");
      } else {
        setError(backendMessage || "Registration failed. Please try again.");
      }
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-gray-900">

      {/* Form Half */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center md:text-left">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              <span>Back to Home</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create your account
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Join the bootcamp today and start your journey.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm">
              {success}
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full name
              </label>
              <input
                type="text"
                {...register("name")}
                placeholder="Enter your full name"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="name@gmail.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gender
              </label>
              <select
                {...register("gender")}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Create a password"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm password
              </label>
              <input
                type="password"
                {...register("confirmPassword")}
                placeholder="Confirm your password"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register("terms")}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-600 dark:text-gray-400">
                I agree to the{" "}
                <Link
                  to="/terms"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Terms and Conditions
                </Link>
              </label>
            </div>
            {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms.message}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-70"
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-teal-600 dark:text-teal-400 hover:underline"
              >
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Image Half */}
      <div className="hidden md:block w-full md:w-1/2 relative">
        <img
          src={registrationBg}
          alt="Registration Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-teal-900/20 mix-blend-multiply" />
      </div>
    </main>
  );
}

export default Register;
