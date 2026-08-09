import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Ban } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

export default function Admin() {
  const [authed, setAuthed] = useState(null);

  useEffect(() => {
    let active = true;
    base44.auth.me()
      .then((u) => active && setAuthed(!!(u && u.role === "admin")))
      .catch(() => active && setAuthed(false));
    return () => { active = false; };
  }, []);

  if (authed === null) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-lime rounded-full animate-spin" />
      </div>
    );
  }

  if (authed === false) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Ban className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-black text-white">Access denied</h1>
          <p className="text-sm text-white/40 mt-2">
            The admin panel is restricted to platform administrators.
          </p>
        </div>
      </div>
    );
  }

  return <AdminShell />;
}
