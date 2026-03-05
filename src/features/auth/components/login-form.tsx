"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      setError(error.message ?? "로그인에 실패했습니다.");
      return;
    }
    router.push("/");
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <label className="font-black text-[13px]" htmlFor="loginEmail">
            이메일
          </label>
          <span className="text-[12px] text-[#6B7280]">
            예: pda@example.com
          </span>
        </div>
        <input
          id="loginEmail"
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
          <label className="font-black text-[13px]" htmlFor="loginPw">
            비밀번호
          </label>
          <a
            href="#"
            className="text-[13px] text-[#2f2aa8] font-extrabold no-underline hover:underline"
            onClick={(e) => e.preventDefault()}
          >
            비밀번호 찾기
          </a>
        </div>
        <input
          id="loginPw"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="비밀번호 입력"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3.5 py-3 rounded-[14px] border border-[#E5E7EB] bg-white text-[14px] outline-none focus:border-[rgba(79,70,229,0.45)]
  focus:shadow-[0_0_0_6px_rgba(79,70,229,0.10)]"
        />
      </div>

      <div className="flex items-center justify-between mt-0.5">
        <label className="inline-flex items-center gap-2 text-[13px] text-[#6B7280] cursor-pointer select-none">
          <input type="checkbox" className="w-4 h-4" />
          로그인 유지
        </label>
        <span className="text-[12px] text-[#6B7280]">공용 PC에서는 해제</span>
      </div>

      {error && (
        <p className="text-[13px] text-red-500">{error}</p>
      )}

      <button
        type="submit"
        className="w-full py-3.5 px-4 rounded-[14px] border-0 cursor-pointer font-black text-[14px] bg-[#4F46E5] text-white
  shadow-[0_10px_24px_rgba(79,70,229,0.22)] hover:brightness-95"
      >
        🔐 로그인
      </button>
    </form>
  );
}
