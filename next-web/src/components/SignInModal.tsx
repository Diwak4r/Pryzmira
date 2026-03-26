"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { Github } from "lucide-react";
import { useState } from "react";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSignIn = async (provider: string) => {
    setIsLoading(provider);
    try {
      await signIn(provider, {
        callbackUrl: "/desk",
        redirect: true,
      });
    } catch (error) {
      console.error("[Auth] Sign in error:", error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[var(--color--slate-950)] border border-[var(--color-slate-800)]/60 shadow-2xl">
        {/* Header with engineering precision */}
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <div className="relative w-2 h-2">
              <div className="absolute inset-0 bg-emerald-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 bg-emerald-500/50 rounded-full animate-ping" />
            </div>
            <DialogTitle className="font-mono text-sm tracking-[0.2em] text-[var(--color-cool-grey)] uppercase">
              Access Workspace
            </DialogTitle>
          </div>
          <DialogDescription className="text-[var(--color-slate-400)] font-sans text-sm leading-relaxed">
            Sign in to save your AI workspace across devices and access your weekly brief.
          </DialogDescription>
        </DialogHeader>

        {/* OAuth buttons with pressurized mechanic feel */}
        <div className="flex flex-col gap-3 mt-6">
          {/* Google OAuth */}
          <Button
            variant="outline"
            className="w-full h-12 bg-transparent border-[var(--color-slate-700)]/40 hover:bg-[var(--color-slate-900)] hover:border-emerald-500/50 active:scale-[0.98] transition-all duration-150 group relative overflow-hidden"
            onClick={() => handleSignIn("google")}
            disabled={isLoading !== null}
          >
            {/* Pressurized hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="flex items-center justify-center gap-3 relative z-10">
              {isLoading === "google" ? (
                <div className="w-4 h-4 border-2 border-[var(--color-slate-500)] border-t-emerald-500 rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.81C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.1H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.9l3.66-2.81z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.1l3.66 2.81c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              <span className="font-mono text-xs tracking-[0.15em] text-[var(--color-slate-200)] uppercase group-hover:text-[var(--color-slate-100)] transition-colors">
                Continue with Google
              </span>
            </div>
          </Button>

          {/* GitHub OAuth */}
          <Button
            variant="outline"
            className="w-full h-12 bg-transparent border-[var(--color-slate-700)]/40 hover:bg-[var(--color-slate-900)] hover:border-emerald-500/50 active:scale-[0.98] transition-all duration-150 group relative overflow-hidden"
            onClick={() => handleSignIn("github")}
            disabled={isLoading !== null}
          >
            {/* Pressurized hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="flex items-center justify-center gap-3 relative z-10">
              {isLoading === "github" ? (
                <div className="w-4 h-4 border-2 border-[var(--color-slate-500)] border-t-emerald-500 rounded-full animate-spin" />
              ) : (
                <Github className="w-4 h-4 text-[var(--color-slate-300)] group-hover:text-[var(--color-slate-200)] transition-colors" />
              )}
              <span className="font-mono text-xs tracking-[0.15em] text-[var(--color-slate-200)] uppercase group-hover:text-[var(--color-slate-100)] transition-colors">
                Continue with GitHub
              </span>
            </div>
          </Button>
        </div>

        {/* Footer with system status */}
        <div className="mt-6 pt-4 border-t border-[var(--color-slate-800)]/40">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[var(--color-slate-500)] tracking-wider">
              Session: Encrypted
            </span>
            <span className="font-mono text-[var(--color-slate-500)] tracking-wider">
              v2.1.0
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
