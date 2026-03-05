import AppShell from "@/components/layouts/app-shell";
import AuthCard from "@/features/auth/components/auth-card";

export default function SignupPage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center">
        <header className="mb-6 w-full max-w-[520px]">
          <h1 className="text-[28px] font-black tracking-tight">
            로그인/회원가입
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            계정을 만들면 점메추 기록과 후기가 저장돼요.
          </p>
        </header>

        <AuthCard defaultTab="signup" />
      </div>
    </AppShell>
  );
}
