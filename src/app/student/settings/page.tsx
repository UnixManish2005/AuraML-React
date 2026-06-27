"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ---- Validation ----
const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Minimum 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

// ---- Password strength indicator ----
function strengthLabel(pw: string): { label: string; color: string; width: string } {
  let score = 0;
  if (pw.length >= 8)              score++;
  if (pw.length >= 12)             score++;
  if (/[A-Z]/.test(pw))            score++;
  if (/[0-9]/.test(pw))            score++;
  if (/[^A-Za-z0-9]/.test(pw))    score++;

  if (score <= 1) return { label: "Weak",   color: "bg-red-500",    width: "w-1/4" };
  if (score === 2) return { label: "Fair",   color: "bg-orange-500", width: "w-2/4" };
  if (score === 3) return { label: "Good",   color: "bg-yellow-500", width: "w-3/4" };
  return              { label: "Strong", color: "bg-emerald-500", width: "w-full"  };
}

// ---- Field component ----
function PasswordField({
  label,
  error,
  show,
  onToggle,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1.5">{label}</label>
      <div className="relative">
        <input
          {...props}
          type={show ? "text" : "password"}
          className={cn(
            "w-full pl-4 pr-10 py-2.5 text-sm bg-background border rounded-lg focus:outline-none transition-colors",
            error
              ? "border-destructive focus:border-destructive"
              : "border-border focus:border-primary/60"
          )}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

// ---- Main Page ----
export default function StudentSettingsPage() {
  const [showCurrent, setShowCurrent]   = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [saving, setSaving]             = useState(false);
  const [success, setSuccess]           = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const newPassword = watch("newPassword") ?? "";
  const strength    = newPassword ? strengthLabel(newPassword) : null;

  async function onSubmit(data: FormData) {
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/student/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Failed to update password");
      toast.success("Password updated successfully!");
      setSuccess(true);
      reset();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account security and preferences
        </p>
      </div>

      {/* Change Password card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">

        {/* Card header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-muted/20">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <KeyRound className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Change Password</p>
            <p className="text-xs text-muted-foreground">
              Use a strong password you don't use elsewhere
            </p>
          </div>
        </div>

        {/* Success banner */}
        {success && (
          <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-600 text-sm">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            Password updated! You're all set.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <PasswordField
            label="Current Password"
            show={showCurrent}
            onToggle={() => setShowCurrent((p) => !p)}
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
          />

          <PasswordField
            label="New Password"
            show={showNew}
            onToggle={() => setShowNew((p) => !p)}
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />

          {/* Strength bar */}
          {strength && (
            <div className="-mt-2">
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    strength.color,
                    strength.width
                  )}
                />
              </div>
              <p className={cn(
                "text-xs mt-1 font-medium",
                strength.label === "Weak"   && "text-red-500",
                strength.label === "Fair"   && "text-orange-500",
                strength.label === "Good"   && "text-yellow-600",
                strength.label === "Strong" && "text-emerald-600",
              )}>
                {strength.label} password
              </p>
            </div>
          )}

          <PasswordField
            label="Confirm New Password"
            show={showConfirm}
            onToggle={() => setShowConfirm((p) => !p)}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          {/* Password rules */}
          <ul className="text-xs text-muted-foreground space-y-1 pt-1">
            {[
              "At least 8 characters",
              "At least one uppercase letter (A–Z)",
              "At least one number (0–9)",
              "At least one special character (!@#$…)",
            ].map((rule) => (
              <li key={rule} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50 flex-shrink-0" />
                {rule}
              </li>
            ))}
          </ul>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
                : <><KeyRound className="w-4 h-4" /> Update Password</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
