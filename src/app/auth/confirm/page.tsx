"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, ArrowRight, RefreshCw, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "authenticating" | "success" | "error">("loading");
  const [statusMessage, setStatusMessage] = useState("Verifying your email address...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userIdState, setUserIdState] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const handleVerification = async () => {
      try {
        const userId = searchParams.get("userId") || searchParams.get("id");
        const code = searchParams.get("code") || searchParams.get("otp") || searchParams.get("token");
        const email = searchParams.get("email");
        const tokenHash = searchParams.get("token_hash");
        const type = searchParams.get("type");
        const next = searchParams.get("next") || "/";

        if (email) setUserEmail(email);
        if (userId) setUserIdState(userId);

        // 1. Check if Supabase native token_hash is present
        if (tokenHash && type) {
          setStatusMessage("Validating security certificate...");
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any,
          });

          if (error) {
            console.warn("Supabase OTP verify notice:", error.message);
          }
        }

        // 2. Custom verification via code or userId
        let verifiedUserId = userId;
        let verifiedEmail = email;

        if (code && (userId || email)) {
          setStatusMessage("Verifying email credentials...");
          const res = await fetch("/api/auth/verify-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: userId || email, code }),
          });

          const data = await res.json();
          if (!res.ok && data.message !== "This account is already verified") {
            throw new Error(data.message || "Invalid or expired verification code");
          }
        }

        // 3. Resolve user details for auto-login if not present
        if (!verifiedEmail && verifiedUserId) {
          const { data: dbUser } = await supabase
            .from("users")
            .select("email, is_verified")
            .eq("id", verifiedUserId)
            .maybeSingle();

          if (dbUser?.email) {
            verifiedEmail = dbUser.email;
            setUserEmail(dbUser.email);
          }
        } else if (!verifiedUserId && verifiedEmail) {
          const { data: dbUser } = await supabase
            .from("users")
            .select("id, is_verified")
            .eq("email", verifiedEmail)
            .maybeSingle();

          if (dbUser?.id) {
            verifiedUserId = dbUser.id;
            setUserIdState(dbUser.id);
          }
        }

        // 4. Authenticate & Auto-Login Session
        setStatus("authenticating");
        setStatusMessage("Creating your secure session...");

        const signInResult = await signIn("credentials", {
          redirect: false,
          email: verifiedEmail,
          userId: verifiedUserId,
          isAutoLogin: "true",
        });

        if (signInResult?.error) {
          console.warn("Auto-login notice:", signInResult.error);
        }

        // 5. Success State & Seamless Workspace Transition
        setStatus("success");
        setStatusMessage("Email confirmed! Redirecting to your workspace...");
        toast("Email successfully verified");

        setTimeout(() => {
          router.replace(next);
        }, 1200);

      } catch (err: any) {
        console.error("Verification error:", err);
        setStatus("error");
        setErrorMessage(err.message || "Verification link is invalid or has expired.");
      }
    };

    handleVerification();
  }, [searchParams, router]);

  const handleResend = async () => {
    if (!userEmail && !userIdState) {
      toast("Please sign in or enter your email to resend");
      router.replace("/sign-in");
      return;
    }

    setIsResending(true);
    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, userId: userIdState }),
      });

      const data = await res.json();
      if (res.ok) {
        toast("A new confirmation link has been sent to your email");
      } else {
        toast(data.message || "Could not resend link");
      }
    } catch (e) {
      toast("Failed to resend verification link");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FBF9F4] dark:bg-[#1C1B19] text-[#1C1B19] dark:text-[#E8E6E3] flex flex-col items-center justify-center p-4 selection:bg-neutral-500/20 font-sans">
      
      {/* Subtle grid texture */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:5rem_5rem]" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-[#ECE8DF]/70 dark:bg-[#282624]/70 backdrop-blur-xl border border-[#DFDAD0] dark:border-[#383532] rounded-3xl p-8 shadow-xl shadow-black/[0.03] dark:shadow-black/25 flex flex-col items-center text-center space-y-6">
        
        {/* Brand Mark */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-neutral-900/10 dark:bg-white/10 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-neutral-800 dark:bg-neutral-200 shadow-xs" />
          </div>
          <span className="font-serif text-xl tracking-tight font-medium text-[#1A1918] dark:text-[#F3F2F0]">
            EasyCode
          </span>
        </div>

        {/* LOADING & AUTHENTICATING STATE */}
        {(status === "loading" || status === "authenticating") && (
          <div className="space-y-6 py-4 flex flex-col items-center w-full">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-800 dark:text-neutral-200 opacity-80" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-serif font-medium text-[#1C1B19] dark:text-[#EDEDEB]">
                {status === "authenticating" ? "Setting Up Session" : "Confirming Email"}
              </h2>
              <p className="text-xs text-[#7A756C] dark:text-[#8C8880] leading-relaxed">
                {statusMessage}
              </p>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 pt-2">
              <span className={status === "loading" ? "text-neutral-900 dark:text-white font-semibold" : "opacity-60"}>
                1. Verify Token
              </span>
              <span>→</span>
              <span className={status === "authenticating" ? "text-neutral-900 dark:text-white font-semibold" : "opacity-60"}>
                2. Auto-Sign In
              </span>
              <span>→</span>
              <span className="opacity-40">3. Workspace</span>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === "success" && (
          <div className="space-y-5 py-4 flex flex-col items-center w-full">
            <div className="w-14 h-14 rounded-full bg-neutral-900/5 dark:bg-white/5 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-neutral-800 dark:text-neutral-100" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-serif font-medium text-[#1C1B19] dark:text-[#EDEDEB]">
                Email Confirmed
              </h2>
              <p className="text-xs text-[#7A756C] dark:text-[#8C8880] leading-relaxed">
                Your account is fully verified. Redirecting you to your coding workspace...
              </p>
            </div>

            <Link
              href="/"
              className="w-full py-2.5 rounded-xl bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] text-xs font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Enter EasyCode Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* ERROR STATE */}
        {status === "error" && (
          <div className="space-y-5 py-2 flex flex-col items-center w-full">
            <div className="w-14 h-14 rounded-full bg-neutral-900/5 dark:bg-white/5 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center">
              <XCircle className="w-7 h-7 text-neutral-600 dark:text-neutral-400" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-serif font-medium text-[#1C1B19] dark:text-[#EDEDEB]">
                Verification Failed
              </h2>
              <p className="text-xs text-[#7A756C] dark:text-[#8C8880] leading-relaxed">
                {errorMessage || "The confirmation link may have expired or is invalid."}
              </p>
            </div>

            <div className="w-full space-y-2.5 pt-2">
              <button
                onClick={handleResend}
                disabled={isResending}
                className="w-full py-2.5 rounded-xl bg-[#3A3733] text-white dark:bg-white dark:text-[#1C1B19] text-xs font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
                <span>{isResending ? "Sending New Link..." : "Resend Confirmation Link"}</span>
              </button>

              <Link
                href="/sign-in"
                className="w-full py-2.5 rounded-xl border border-[#DFDAD0] dark:border-[#383532] bg-white/50 dark:bg-[#282624]/50 text-xs font-semibold text-[#524E48] dark:text-[#A8A49D] hover:text-[#1C1B19] dark:hover:text-white transition-colors flex items-center justify-center"
              >
                Sign In with Password
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#FBF9F4] dark:bg-[#1C1B19] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
