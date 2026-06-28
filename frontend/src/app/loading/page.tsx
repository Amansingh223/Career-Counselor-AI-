"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect /loading to /loading-screen
export default function LoadingRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/loading-screen"); }, [router]);
  return (
    <div className="min-h-screen animated-bg flex items-center justify-center">
      <div className="spinner w-12 h-12" />
    </div>
  );
}
