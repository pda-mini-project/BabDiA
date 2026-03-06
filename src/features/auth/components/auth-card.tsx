"use client";
import { useRouter } from "next/navigation";
import LoginForm from "./login-form";
import SignupForm from "./signup-form";

type Tab = "login" | "signup";

interface AuthCardProps {
  defaultTab?: Tab;
  redirect?: string | null;
}

export default function AuthCard({
  defaultTab = "login",
  redirect,
}: AuthCardProps) {
  const router = useRouter();
  const tab = defaultTab;
  const redirectQuery = redirect
    ? `?redirect=${encodeURIComponent(redirect)}`
    : "";

  return (
    <div className="w-full max-w-[520px] bg-white rounded-[18px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-[#E5E7EB]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-black text-lg">
            {tab === "login" ? "로그인" : "회원가입"}
          </h3>
          <p className="text-[#6B7280] text-[13px] mt-1.5">
            {tab === "login"
              ? "이메일/비밀번호로 시작하세요."
              : "닉네임과 계정을 만들고 점메추 기록을 저장하세요."}
          </p>
        </div>

        <div className="inline-flex p-1.5 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] gap-1.5">
          <button
            type="button"
            onClick={() => router.push(`/login${redirectQuery}`)}
            className={`px-3 py-2.5 rounded-full font-black text-[13px] cursor-pointer ${
              tab === "login"
                ? "bg-white text-[#111827] shadow-[0_6px_16px_rgba(0,0,0,0.06)]"
                : "bg-transparent text-[#6B7280]"
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => router.push(`/signup${redirectQuery}`)}
            className={`px-3 py-2.5 rounded-full font-black text-[13px] cursor-pointer ${
              tab === "signup"
                ? "bg-white text-[#111827] shadow-[0_6px_16px_rgba(0,0,0,0.06)]"
                : "bg-transparent text-[#6B7280]"
            }`}
          >
            회원가입
          </button>
        </div>
      </div>

      <div className="mt-[18px]">
        {tab === "login" ? <LoginForm redirect={redirect} /> : <SignupForm />}
      </div>
    </div>
  );
}
