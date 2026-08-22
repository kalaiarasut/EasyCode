"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { forgetPasswordValidation, emailValidation } from "@/schemas/forgetPasswordSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, SendHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import AuthLayout from "@/components/auth/AuthLayout";
import { ApiResponse } from "@/types/ApiResponse";

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isShowingPassword, setIsShowingPassword] = useState<boolean>(false);
  const [isSendingMail, setIsSendingMail] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const router = useRouter();

  const form = useForm<z.infer<typeof forgetPasswordValidation>>({
    resolver: zodResolver(forgetPasswordValidation),
    defaultValues: {
      email: "",
      password: "",
      code: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof forgetPasswordValidation>) => {
    setIsSubmitting(true);
    try {
      await axios.post<ApiResponse>("/api/auth/forget-password", data);
      toast.success("Password updated successfully! Please sign in.");
      router.replace("/sign-in");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Password reset failed");
      } else {
        toast.error("Password reset failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendingMail = async (targetEmail: string) => {
    const parsedData = emailValidation.safeParse({ email: targetEmail });
    if (!parsedData.success) {
      toast.error(parsedData.error.issues[0].message);
      return;
    }

    try {
      setIsSendingMail(true);
      await axios.post<ApiResponse>("/api/auth/forget-password-mail", { email: targetEmail });
      toast.success("Check your inbox! We've sent a password reset code.");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to send reset email");
      } else {
        toast.error("Failed to send reset email.");
      }
    } finally {
      setIsSendingMail(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const onInvalid = (errors: any) => {
    const firstError = Object.values(errors)[0] as any;
    if (firstError?.message) {
      toast.error(firstError.message);
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  return (
    <AuthLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Reset Password
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5">
            Enter your account email to receive a recovery code.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-4">
          {/* Email Field with Send Code Button */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Account Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                {...form.register("email")}
                onChange={(e) => {
                  form.register("email").onChange(e);
                  setEmail(e.target.value);
                }}
                className="flex-1 h-11 px-3.5 rounded-xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-neutral-900 dark:focus:border-neutral-200 focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-200 transition-all"
              />
              <button
                type="button"
                onClick={() => handleSendingMail(email)}
                disabled={isSendingMail || !email}
                className="h-11 px-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shrink-0"
              >
                {isSendingMail ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Send Code</span>
                    <SendHorizontal className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
            {form.formState.errors.email && (
              <p className="text-xs text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Reset Code Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              6-Digit Reset Code
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              {...form.register("code")}
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-neutral-800 text-sm font-mono tracking-widest text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-neutral-900 dark:focus:border-neutral-200 focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-200 transition-all"
            />
            {form.formState.errors.code && (
              <p className="text-xs text-red-500">
                {form.formState.errors.code.message}
              </p>
            )}
          </div>

          {/* New Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              New Password
            </label>
            <div className="relative">
              <input
                type={isShowingPassword ? "text" : "password"}
                placeholder="••••••••••••"
                {...form.register("password")}
                className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-neutral-900 dark:focus:border-neutral-200 focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-200 transition-all"
              />
              <button
                type="button"
                onClick={() => setIsShowingPassword(!isShowingPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
              >
                {isShowingPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-xs text-red-500">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Primary CTA Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-neutral-950 hover:bg-neutral-900 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 font-semibold text-sm shadow-md shadow-neutral-950/10 dark:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating password...</span>
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </form>

        {/* Footer Navigation Link */}
        <div className="mt-7 text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Remembered your password?{" "}
            <Link
              href="/sign-in"
              onClick={(e) => {
                e.preventDefault();
                router.push("/sign-in");
              }}
              className="font-semibold text-neutral-900 dark:text-white hover:underline transition-all cursor-pointer"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
