"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Auth() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (provider: "github" | "google") => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: "http://localhost:3000",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      alert("Error logging in: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-700">Nebula9 Newsroom</h1>
          <p className="mt-2 text-gray-500">Authorized Personnel Only</p>
        </div>

        <div className="space-y-4">
          {/* GitHub Button */}
          <button
            onClick={() => handleLogin("github")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-[#24292F] hover:bg-[#24292F]/90 transition-colors"
          >
            {loading ? "Connecting..." : "Sign in with GitHub"}
          </button>

          {/* Google Button */}
          <button
            onClick={() => handleLogin("google")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            {loading ? "Connecting..." : "Sign in with Google"}
          </button>
        </div>

        <div className="text-center text-xs text-gray-400">
          <p>Protected by Supabase OAuth</p>
        </div>
      </div>
    </div>
  );
}