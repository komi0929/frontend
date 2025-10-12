"use client";

import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="legal-container">
      <div className="legal-content">
        <h1 className="legal-title">プライバシーポリシー</h1>
        
        <section className="legal-section">
          <h2>第1条（個人情報の取得）</h2>
          <p>
            当社は、本サービスの提供にあたり、以下の個人情報を取得します：
          </p>
          <ul>
            <li>メールアドレス</li>
            <li>住所（マイク発送時のみ）</li>
            <li>決済情報（Stripeを通じて取得）</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>第2条（個人情報の利用目的）</h2>
          <p>
            取得した個人情報は、以下の目的で利用します：
          </p>
          <ul>
            <li>本サービスの提供・運営</li>
            <li>マイクの発送</li>
            <li>お問い合わせへの対応</li>
            <li>利用状況の分析</li>
            <li>新機能・キャンペーンのご案内</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>第3条（音声データの取り扱い）</h2>
          <p>
            <strong>音声データは一切保存されません。</strong>
            リアルタイム処理のみを行い、処理後は即座に破棄されます。
          </p>
        </section>

        <section className="legal-section">
          <h2>第4条（統計情報の取得）</h2>
          <p>
            以下の統計情報を匿名化して取得・保存します：
          </p>
          <ul>
            <li>翻訳回数</li>
            <li>利用言語</li>
            <li>利用時間帯</li>
            <li>文字数</li>
          </ul>
          <p>これらの情報は個人を特定できない形で保存され、サービス改善のために利用されます。</p>
        </section>

        <section className="legal-section">
          <h2>第5条（第三者提供）</h2>
          <p>
            当社は、以下の場合を除き、個人情報を第三者に提供しません：
          </p>
          <ul>
            <li>ご本人の同意がある場合</li>
            <li>法令に基づく場合</li>
            <li>サービス提供に必要な範囲での業務委託（Stripe、運送会社等）</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>第6条（Cookieの使用）</h2>
          <p>
            当社は、サービスの利便性向上のためCookieを使用します。
            ブラウザの設定でCookieを無効化することもできますが、一部機能が制限される場合があります。
          </p>
        </section>

        <section className="legal-section">
          <h2>第7条（個人情報の開示・訂正・削除）</h2>
          <p>
            個人情報の開示・訂正・削除をご希望の場合は、お問い合わせフォームよりご連絡ください。
            合理的な期間内に対応いたします。
          </p>
        </section>

        <section className="legal-section">
          <h2>第8条（お問い合わせ）</h2>
          <p>
            個人情報の取り扱いに関するお問い合わせは、以下までご連絡ください：
          </p>
          <p>
            株式会社ヒトコト サポートデスク<br />
            メール: support@hitokoto.co.jp
          </p>
        </section>

        <section className="legal-section">
          <p className="legal-date">最終更新日：2025年1月9日</p>
          <p>株式会社ヒトコト</p>
        </section>

        <button className="legal-back-button" onClick={() => router.back()}>
          戻る
        </button>
      </div>
    </div>
  );
}