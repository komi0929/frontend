"use client";

import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="legal-container">
      <div className="legal-content">
        <h1 className="legal-title">利用規約</h1>
        
        <section className="legal-section">
          <h2>第1条（適用）</h2>
          <p>
            本規約は、株式会社ヒトコト（以下「当社」といいます）が提供する「あんしんディスプレイ」（以下「本サービス」といいます）の利用に関する条件を定めるものです。
            本サービスを利用される方（以下「利用者」といいます）は、本規約に同意したものとみなされます。
          </p>
        </section>

        <section className="legal-section">
          <h2>第2条（サービス内容）</h2>
          <p>
            本サービスは、飲食店・小売店向けのリアルタイム翻訳タブレットアプリケーションです。
            音声認識および翻訳機能を提供し、外国人観光客とのコミュニケーションを支援します。
          </p>
        </section>

        <section className="legal-section">
          <h2>第3条（トライアル期間）</h2>
          <p>
            本サービスのトライアル期間は、マイク到着予定日から14日間です。
            トライアル期間中はサービスを無料でご利用いただけます。
            トライアル期間終了後は、自動的に有料プランに移行します。
          </p>
        </section>

        <section className="legal-section">
          <h2>第4条（料金）</h2>
          <p>
            月額利用料金は990円（税込）です。
            トライアル期間終了後、毎月自動的に課金されます。
            解約はいつでも可能で、当月末まで利用できます。
          </p>
        </section>

        <section className="legal-section">
          <h2>第5条（マイク貸出・返送・買取）</h2>
          <p>
            トライアル期間中、中古マイクを無料で貸し出します。
            返送は、お好きな方法で行ってください（送料はお客様負担）。
            トライアル終了後7日以内に返送がない場合、中古買取として1,000円（税込）を請求いたします。
          </p>
        </section>

        <section className="legal-section">
          <h2>第6条（禁止事項）</h2>
          <ul>
            <li>本サービスの不正利用</li>
            <li>第三者への譲渡・貸与</li>
            <li>法令に違反する行為</li>
            <li>その他、当社が不適切と判断する行為</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>第7条（免責事項）</h2>
          <p>
            当社は、本サービスの翻訳精度について保証するものではありません。
            本サービスの利用により生じた損害について、当社は一切の責任を負いません。
          </p>
        </section>

        <section className="legal-section">
          <h2>第8条（プライバシー）</h2>
          <p>
            音声データは保存されません。リアルタイム処理のみを行います。
            詳細は<a href="/privacy">プライバシーポリシー</a>をご確認ください。
          </p>
        </section>

        <section className="legal-section">
          <h2>第9条（規約の変更）</h2>
          <p>
            当社は、必要に応じて本規約を変更することができます。
            変更後の規約は、本サイトに掲載した時点で効力を生じます。
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