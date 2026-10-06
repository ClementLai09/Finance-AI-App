"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { createClient } from "../../lib/supabase/client";

type AuthFormProps = {
  mode: "login" | "signup";
  notice?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthForm({ mode, notice }: AuthFormProps) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const passwordConfirmationInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const normalizedEmail = emailInputRef.current?.value.trim() ?? "";
    const password = passwordInputRef.current?.value ?? "";
    const passwordConfirmation = passwordConfirmationInputRef.current?.value ?? "";
    if (!emailPattern.test(normalizedEmail)) {
      setErrorMessage("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Your password must be at least 8 characters.");
      return;
    }
    if (isSignup && password !== passwordConfirmation) {
      setErrorMessage("The passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        if (data.session) {
          router.replace("/");
          router.refresh();
          return;
        }

        if (passwordInputRef.current) passwordInputRef.current.value = "";
        if (passwordConfirmationInputRef.current) passwordConfirmationInputRef.current.value = "";
        setSuccessMessage(
          "If email confirmation is required, check your inbox and follow the confirmation link before logging in.",
        );
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        setErrorMessage("Unable to log in with those details. Check your email and password, then try again.");
        return;
      }

      window.location.replace("/");
    } catch {
      setErrorMessage("A connection error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-medium text-emerald-700">Finance AI App</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {isSignup
          ? "Sign up to start building a clearer picture of your finances."
          : "Log in to continue to your finance dashboard."}
      </p>

      {notice && (
        <p role="status" className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {notice}
        </p>
      )}
      {successMessage && (
        <p role="status" className="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {successMessage}
        </p>
      )}
      {errorMessage && (
        <p role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </p>
      )}

      <form
        action={isSignup ? "/signup" : "/login"}
        method="post"
        onSubmit={handleSubmit}
        className="mt-6 space-y-4"
        noValidate
      >
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            ref={emailInputRef}
            id="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(errorMessage)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            ref={passwordInputRef}
            id="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={8}
            required
            aria-invalid={Boolean(errorMessage)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
          {isSignup && <p className="mt-1.5 text-xs text-slate-500">Use at least 8 characters.</p>}
        </div>

        {isSignup && (
          <div>
            <label htmlFor="password-confirmation" className="mb-1.5 block text-sm font-medium text-slate-700">
              Confirm password
            </label>
            <input
              ref={passwordConfirmationInputRef}
              id="password-confirmation"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              aria-invalid={Boolean(errorMessage)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        {isSignup ? "Already have an account?" : "New to Finance AI App?"}{" "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-semibold text-emerald-800 hover:text-emerald-900"
        >
          {isSignup ? "Log in" : "Sign up"}
        </Link>
      </p>
    </section>
  );
}
