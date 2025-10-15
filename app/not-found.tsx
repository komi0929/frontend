export default function NotFound(){
  return (
    <main className="min-h-screen flex items-center justify-center p-8 text-center">
      <div>
        <h1 className="text-3xl font-bold mb-2">ページが見つかりません</h1>
        <p className="text-gray-600"><a className="underline" href="/">トップへ</a></p>
      </div>
    </main>
  );
}