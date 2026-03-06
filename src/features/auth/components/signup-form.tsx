"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";

interface SignupFormProps {
  redirect?: string | null;
}

export default function SignupForm({ redirect }: SignupFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    const { error } = await authClient.signUp.email({ name, email, password });
    if (error) {
      setError(error.message ?? "회원가입에 실패했습니다.");
      return;
    }
    const finalRedirect = redirect ?? searchParams.get("redirect");
    router.push(finalRedirect ?? "/");
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      {" "}
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <label className="font-black text-[13px]" htmlFor="signupNick">
            닉네임
          </label>
          <span className="text-[12px] text-[#6B7280]">후기/랭킹에 표시</span>
        </div>
        <input
          id="signupNick"
          name="nickname"
          autoComplete="nickname"
          placeholder="예: 프디아김"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3.5 py-3 rounded-[14px] border border-[#E5E7EB] bg-white text-[14px] outline-none focus:border-[rgba(79,70,229,0.45)]
  focus:shadow-[0_0_0_6px_rgba(79,70,229,0.10)]"
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <label className="font-black text-[13px]" htmlFor="signupEmail">
            이메일
          </label>
          <span className="text-[12px] text-[#6B7280]">
            예: pda@example.com
          </span>
        </div>
        <input
          id="signupEmail"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="이메일 입력"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3.5 py-3 rounded-[14px] border border-[#E5E7EB] bg-white text-[14px] outline-none focus:border-[rgba(79,70,229,0.45)]
  focus:shadow-[0_0_0_6px_rgba(79,70,229,0.10)]"
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <label className="font-black text-[13px]" htmlFor="signupPw">
            비밀번호
          </label>
          <span className="text-[12px] text-[#6B7280]">8자 이상 권장</span>
        </div>
        <input
          id="signupPw"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="비밀번호 입력"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3.5 py-3 rounded-[14px] border border-[#E5E7EB] bg-white text-[14px] outline-none focus:border-[rgba(79,70,229,0.45)]
  focus:shadow-[0_0_0_6px_rgba(79,70,229,0.10)]"
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <label className="font-black text-[13px]" htmlFor="signupPw2">
            비밀번호 확인
          </label>
          <span className="text-[12px] text-[#6B7280]">동일하게 입력</span>
        </div>
        <input
          id="signupPw2"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          placeholder="비밀번호 확인"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          className="w-full px-3.5 py-3 rounded-[14px] border border-[#E5E7EB] bg-white text-[14px] outline-none focus:border-[rgba(79,70,229,0.45)]
  focus:shadow-[0_0_0_6px_rgba(79,70,229,0.10)]"
        />
      </div>

      {error && (
        <p className="text-[13px] text-red-500">{error}</p>
      )}

      <button
        type="submit"
        className="w-full py-3.5 px-4 rounded-[14px] border-0 cursor-pointer font-black text-[14px] bg-[#4F46E5] text-white
  shadow-[0_10px_24px_rgba(79,70,229,0.22)] hover:brightness-95"
      >
        ✨ 회원가입
      </button>
    </form>
  );
}
