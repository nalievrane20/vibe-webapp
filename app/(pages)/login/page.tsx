import LoginForm from "@/components/pages/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-6">
        <div className="grid w-full max-w-7xl gap-16 lg:grid-cols-2">
          <div className="flex flex-col justify-center">
            <h1 className="text-5xl font-extrabold lg:text-7xl">
              Valuable Insights
              <br />
              <span className="text-slate-700">for Better Events</span>
            </h1>

            <p className="mt-8 max-w-2xl text-xl text-zinc-500">
              Manage school events efficiently, connect students through
              engaging activities, and enhance campus participation with an
              interactive event management system.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
