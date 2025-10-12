"use client";

import { useRouter } from "next/navigation";

export default function LegalPage() {
  const router = useRouter();

  return (
    <div className="legal-container">
      <div className="legal-content">
        <h1 className="legal-title">特定商取引法に基づく表示</h1>
        
        <section className="legal-section">
          <h2>販売事業者</h2>
          <p>株式会社ヒトコト</p>
        </section>

        <section className="legal-section">
          <h2>運営責任者</h2>
          <p>代表取締役 山田太郎</p>
        </section>

        <section className="legal-section">
          <h2>所在地</h2>
          <p>
            〒150-0001<br />
            東京都渋谷区神宮前1-1-1
          </p>
        </section>

        <section className="legal-section">
          <h2>お問い合わせ</h2>
          <p>
            メール: support@hitokoto.co.jp<br />
            電話: 03-1234-5678（平日10:00-18:00）
          </p>
        </section>

        <section className="legal-section">
          <h2>サービス名</h2>
          <p>あんしんディスプレイ</p>
        </section>

        <section className="legal-section">
          <h2>販売価格</h2>
          <p>
            月額利用料金：990円（税込）<br />
            マイク中古買取：1,000円（税込）
          </p>
        </section>

        <section className="legal-section">
          <h2>支払方法</h2>
          <p>
            クレジットカード決済（Stripe）<br />
            対応カード：Visa、Mastercard、American Express、JCB
          </p>
        </section>

        <section className="legal-section">
          <h2>支払時期</h2>
          <p>
            トライアル期間（マイク到着後14日間）終了後、毎月自動課金
          </p>
        </section>

        <section className="legal-section">
          <h2>サービス提供時期</h2>
          <p>
            申込完了後、即時利用可能<br />
            マイクは申込後約3日で発送
          </p>
        </section>

        <section className="legal-section">
          <h2>返品・キャンセル</h2>
          <p>
            デジタルサービスのため、原則として返品・返金はできません。<br />
            トライアル期間中の解約は無料です。<br />
            マイクの返送は、トライアル期間中にお好きな方法で行ってください（送料はお客様負担）。
          </p>
        </section>

        <section className="legal-section">
          <h2>マイク貸出・返送・買取について</h2>
          <p>
            トライアル期間中、中古マイクを無料で貸し出します。<br />
            返送方法は自由です（送料はお客様負担）。<br />
            トライアル終了後7日以内に返送がない場合、中古買取として1,000円（税込）を請求いたします。
          </p>
        </section>

        <section className="legal-section">
          <h2>動作環境</h2>
          <p>
            推奨デバイス：10インチ以上のタブレット（iPad、Android）<br />
            推奨ブラウザ：Safari 15+、Chrome 90+<br />
            インターネット接続：Wi-Fi必須
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