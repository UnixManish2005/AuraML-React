"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password strength checks
  const checks = [
    { label: "At least 8 characters", ok: newPassword.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(newPassword) },
    { label: "One number", ok: /[0-9]/.test(newPassword) },
    { label: "One special character", ok: /[^A-Za-z0-9]/.test(newPassword) },
  ];
  const allPassing = checks.every((c) => c.ok);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allPassing) { toast.error("Password does not meet requirements"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(String(data.error ?? "Failed"));

      toast.success("Password changed! Redirecting...");
      // Small delay so the toast is visible, then hard-reload to refresh session
      setTimeout(() => {
        window.location.href = data.redirectTo || "/trainer";
      }, 1000);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050813] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Set Your Password</h1>
          <p className="text-white/50 text-sm">
            You are using a temporary password. Please set a new secure password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New password */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Match indicator */}
            {confirmPassword && (
              <p className={`mt-1.5 text-xs ${newPassword === confirmPassword ? "text-emerald-400" : "text-red-400"}`}>
                {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
              </p>
            )}
          </div>

          {/* Strength checklist */}
          {newPassword && (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
              <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">
                Password Requirements
              </p>
              {checks.map((check) => (
                <div key={check.label} className="flex items-center gap-2 text-sm">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${check.ok ? "bg-emerald-500" : "bg-white/10"}`}>
                    {check.ok && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={check.ok ? "text-white/70" : "text-white/30"}>{check.label}</span>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !allPassing || newPassword !== confirmPassword}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Updating password...</>
            ) : (
              "Set New Password & Continue"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/20">
          You cannot access the platform until you set a new password.
        </p>
      </div>
    </div>
  );
}
