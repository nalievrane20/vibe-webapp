"use client";

import { useActionState } from "react";
import { Lock, User, Lightbulb } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { login } from "@/app/actions/auth";

const initialState = {
  error: "",
};

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <Card className="w-full max-w-lg rounded-3xl border-0 bg-slate-800 p-10 shadow-xl">
      <div className="flex flex-col items-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white">
          <Lightbulb className="h-12 w-12 text-white" />
        </div>

        <h2 className="mb-8 text-center text-3xl font-bold text-white">
          Sign in to your account
        </h2>

        <form action={formAction} className="w-full space-y-6">
          <div className="flex items-center gap-4">
            <User className="h-8 w-8 text-white" />

            <Input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="h-14 border-0 bg-white"
            />
          </div>

          <div className="flex items-center gap-4">
            <Lock className="h-8 w-8 text-white" />

            <Input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="h-14 border-0 bg-white"
            />
          </div>

          {state?.error && (
            <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-300">
              {state.error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="h-14 w-full bg-white font-semibold text-slate-800 hover:bg-zinc-100"
          >
            {isPending ? "Signing In..." : "SIGN IN"}
          </Button>

          <div className="text-center">
            <button type="button" className="text-white hover:underline">
              Forgot password?
            </button>
          </div>
        </form>
      </div>
    </Card>
  );
}
