"use client";

import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";
import { useSession, signOut } from "next-auth/react";
import { useMemo, useState } from "react";
import { SignInModal } from "./SignInModal";

export function AuthButton() {
  const { data: session, status } = useSession();
  const [showSignIn, setShowSignIn] = useState(false);
  const shouldAutoOpen = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const url = new URL(window.location.href);
    const shouldOpen = url.searchParams.get("signin") === "true";

    if (shouldOpen) {
      url.searchParams.delete("signin");
      window.history.replaceState({}, "", url.toString());
    }

    return shouldOpen;
  }, []);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center w-9 h-9">
        <div className="w-4 h-4 border-2 border-[var(--color-slate-600)] border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (session?.user) {
    return (
      <UserMenu
        user={{
          name: session.user.name || "",
          email: session.user.email || "",
          image: session.user.image,
        }}
        onSignOut={() => signOut({ callbackUrl: "/" })}
      />
    );
  }

  if (shouldAutoOpen && !showSignIn) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-full border-[var(--color-slate-700)]/40 bg-transparent font-mono text-xs tracking-wider text-[var(--color-slate-300)] uppercase hover:bg-[var(--color-slate-900)] hover:border-emerald-500/50 hover:text-[var(--color-slate-100)] active:scale-[0.98] transition-all duration-150"
          onClick={() => setShowSignIn(true)}
        >
          Sign In
        </Button>

        <SignInModal
          isOpen
          onClose={() => setShowSignIn(false)}
        />
      </>
    );
  }

  if (!session?.user) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-9 rounded-full border-[var(--color-slate-700)]/40 bg-transparent font-mono text-xs tracking-wider text-[var(--color-slate-300)] uppercase"
      >
        Sign In
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-9 rounded-full border-[var(--color-slate-700)]/40 bg-transparent font-mono text-xs tracking-wider text-[var(--color-slate-300)] uppercase hover:bg-[var(--color-slate-900)] hover:border-emerald-500/50 hover:text-[var(--color-slate-100)] active:scale-[0.98] transition-all duration-150"
        onClick={() => setShowSignIn(true)}
      >
        Sign In
      </Button>

      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
      />
    </>
  );
}

export default AuthButton;
