"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { verifyCodeValidation } from "@/schemas/verifyCodeSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "@/components/auth/AuthLayout";

function VerifyContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoVerifying, setIsAutoVerifying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params?.userId as string;

  const form = useForm<z.infer<typeof verifyCodeValidation>>({
    resolver: zodResolver(verifyCodeValidation),
    defaultValues: {
      code: "",
    },
  });

  const handleVerification = async (code: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          code,
        }),
      });

      const data = await res.json();

      if (!res.ok && data.message !== "This account is already verified") {
        toast.error(data.message || "Invalid verification code");
        setIsSubmitting(false);
        return;
      }

      toast.success("Account verified successfully! Logging you in...");

      // Auto login
      await signIn("credentials", {
        redirect: false,
        userId: userId,
        isAutoLogin: "true",
      });

      setTimeout(() => {
        router.replace("/problems");
      }, 1000);
    } catch (error: any) {
      toast.error("Verification error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof verifyCodeValidation>) => {
    await handleVerification(data.code);
  };

  useEffect(() => {
    setMounted(true);
    const codeParam = searchParams.get("code") || searchParams.get("otp");
    if (codeParam && codeParam.length >= 6) {
      setIsAutoVerifying(true);
      form.setValue("code", codeParam);
      handleVerification(codeParam);
    }
  }, [searchParams]);

  if (!mounted) return null;

  return (
    <AuthLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Verify Account
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5">
            Enter the 6-digit code sent to your email to activate your account.
          </p>
        </div>

        {isAutoVerifying ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-800 dark:text-neutral-200" />
            <div className="text-center">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                Confirming Email
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Verifying your credentials and setting up your workspace...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                {...form.register("code")}
                className="w-full h-12 px-3.5 rounded-xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-neutral-800 text-center font-mono text-lg tracking-[8px] text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-neutral-900 dark:focus:border-neutral-200 focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-200 transition-all"
              />
              {form.formState.errors.code && (
                <p className="text-xs text-red-500">{form.formState.errors.code.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-neutral-950 hover:bg-neutral-900 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 font-semibold text-sm shadow-md shadow-neutral-950/10 dark:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-7 text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Didn't receive code?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-neutral-900 dark:text-white hover:underline transition-all"
            >
              Sign up again
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
