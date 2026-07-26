"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Email atau password salah. Silakan coba lagi.");
      setIsLoading(false);
      return;
    }

    // Login berhasil — arahkan ke dashboard
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-4 text-crema-50">
      {/* Background subtle pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,146,78,0.05)_0%,transparent_60%)] pointer-events-none" />

      <form
        onSubmit={handleLogin}
        className="relative bg-[#151515] p-8 sm:p-10 rounded-2xl border border-amber-bistro/20 shadow-[0_0_60px_rgba(212,146,78,0.08)] w-full max-w-md"
      >
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[0.3em] uppercase text-amber-bistro font-medium mb-2">
            GTC Coffee & Bistro
          </p>
          <h1 className="text-2xl font-bold text-crema-50 tracking-widest uppercase">
            Admin Panel
          </h1>
          <p className="text-crema-300/50 text-xs mt-2">
            Masuk untuk mengelola data menu
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label
            htmlFor="admin-email"
            className="block text-xs font-medium text-crema-300 mb-2 uppercase tracking-wider"
          >
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-2.5 text-crema-50 focus:outline-none focus:border-amber-bistro transition-colors placeholder:text-crema-300/30 text-sm"
            placeholder="admin@gtcbistro.com"
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label
            htmlFor="admin-password"
            className="block text-xs font-medium text-crema-300 mb-2 uppercase tracking-wider"
          >
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-2.5 text-crema-50 focus:outline-none focus:border-amber-bistro transition-colors placeholder:text-crema-300/30 text-sm"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-amber-bistro text-[#121212] font-bold py-2.5 px-4 rounded-lg hover:bg-amber-bistro/90 transition-all uppercase tracking-widest text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Memproses...
            </>
          ) : (
            "Masuk"
          )}
        </button>
      </form>
    </div>
  );
}
