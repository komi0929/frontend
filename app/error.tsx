"use client";
export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }){
  return (
    <main className="min-h-screen flex items-center justify-center p-8 text-center">
      <div>
        <h1 className="text-3xl font-bold mb-2">繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆</h1>
        <p className="text-gray-600 mb-4">{error?.message || "Unknown error"}</p>
        <button onClick={()=>reset()} className="px-4 py-2 bg-black text-white rounded">蜀崎ｩｦ陦・/button>
      </div>
    </main>
  );
}