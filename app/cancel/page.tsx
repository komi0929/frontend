"use client";
import Link from "next/link";
export default function Cancel() {
  return (
    <main className='min-h-screen flex flex-col items-center justify-center p-8 text-center'>
      <h1 className='text-3xl font-bold text-red-600 mb-4'>決済がキャンセルされました</h1>
      <p className='text-gray-700 mb-6'>お支払いはまだ完了していません。もう一度お試しください。</p>
      <Link href='/' className='underline text-blue-600'>ホームへ戻る</Link>
    </main>
  );
}