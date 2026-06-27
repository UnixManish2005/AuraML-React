// ============================================================
// UNAUTHORIZED PAGE
// ============================================================

import Link from "next/link";
import { ShieldX, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#050813] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Access Denied</h1>
        <p className="text-white/50 mb-8">
          You don&apos;t have permission to access this page. Please contact your administrator if you think this is a mistake.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Go Home
          </Link>
          <Link
            href="/auth/login"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors text-sm"
          >
            Sign In Again
          </Link>
        </div>
      </div>
    </div>
  );
}
