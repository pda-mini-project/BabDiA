import AppShell from "@/components/layouts/app-shell";
import AuthCard from "@/features/auth/components/auth-card";

export default function LoginPage() {
  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="text-[28px] font-black tracking-tight">
          로그인/회원가입
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          계정을 만들면 점메추 기록과 후기가 저장돼요.
        </p>
      </header>

      <div className="flex justify-center">
        <AuthCard defaultTab="login" />
      </div>
    </AppShell>
  );
}
