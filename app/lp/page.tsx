"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="lp-container">
      {/* ヒーローセクション */}
      <section className="lp-hero">
        <div className="lp-content">
          <h1 className="lp-hero-title">
            お手持ちのタブレットで、<br />
            今すぐ"通じるおもてなし"
          </h1>
          <p className="lp-hero-subtitle">
            高品質マイク付き14日間おためし、完全無料
          </p>
          <button 
            className="lp-cta-button"
            onClick={() => router.push('/display')}
          >
            14日間無料でお試し
          </button>
          <p className="lp-trial-note">
            ※到着日から14日間・返却または¥1,000で買取・QRコードで簡単デバイス追加
          </p>
        </div>
      </section>

      {/* 3つのメリット */}
      <section className="lp-benefits">
        <div className="lp-content">
          <h2 className="lp-section-title">3つのメリット</h2>
          <div className="lp-benefits-grid">
            <div className="lp-benefit-card">
              <div className="lp-benefit-icon">💬</div>
              <h3 className="lp-benefit-title">① 外国語が話せなくても、自信を持って対応</h3>
              <p className="lp-benefit-text">
                リアルタイム音声認識＋翻訳で、英語・韓国語・中国語の会話をサポート。
                画面を見せるだけで、お客様とスムーズにコミュニケーション。
              </p>
            </div>
            <div className="lp-benefit-card">
              <div className="lp-benefit-icon">😊</div>
              <h3 className="lp-benefit-title">② お客様も安心、自分の言語で画面を見るだけ</h3>
              <p className="lp-benefit-text">
                大きな文字で翻訳表示。外国人観光客も安心して質問できる環境を提供します。
                "通じる"体験が、リピーターを生み出します。
              </p>
            </div>
            <div className="lp-benefit-card">
              <div className="lp-benefit-icon">💰</div>
              <h3 className="lp-benefit-title">③ お手持ちのタブレット + 月額990円で今日から始められる</h3>
              <p className="lp-benefit-text">
                BYOD（Bring Your Own Device）対応。iPadやAndroidタブレットがあれば、
                高価な専用機器は不要。導入コストを最小限に抑えます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* デモ画像セクション */}
      <section className="lp-demo">
        <div className="lp-content">
          <h2 className="lp-section-title">実際の使用イメージ</h2>
          <div className="lp-demo-placeholder">
            <p>📱 タブレット画面のイメージ</p>
            <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
              ※実際の画面: <a href="/display" style={{ color: '#F59E0B' }}>デモを見る</a>
            </p>
          </div>
        </div>
      </section>

      {/* 料金 */}
      <section className="lp-pricing">
        <div className="lp-content">
          <h2 className="lp-section-title">料金プラン</h2>
          <div className="lp-pricing-card">
            <h3 className="lp-pricing-title">シンプルプラン</h3>
            <div className="lp-price">
              <span className="lp-price-amount">¥990</span>
              <span className="lp-price-period">/月（税込）</span>
            </div>
            <ul className="lp-pricing-features">
              <li>✅ 7日間無料トライアル</li>
              <li>✅ マイク無料レンタル（トライアル期間中）</li>
              <li>✅ 英語・韓国語・中国語対応</li>
              <li>✅ リアルタイム音声認識＋翻訳</li>
              <li>✅ 利用統計ダッシュボード</li>
              <li>✅ いつでもキャンセル可能</li>
            </ul>
            <button 
              className="lp-cta-button"
              onClick={() => router.push('/display')}
            >
              14日間無料でお試し
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-faq">
        <div className="lp-content">
          <h2 className="lp-section-title">よくある質問</h2>
          <div className="lp-faq-list">
            <div className="lp-faq-item">
              <h3 className="lp-faq-question">Q: 対応言語は？</h3>
              <p className="lp-faq-answer">A: 英語・韓国語・中国語（簡体字）に対応しています。</p>
            </div>
            <div className="lp-faq-item">
              <h3 className="lp-faq-question">Q: インターネット接続は必要？</h3>
              <p className="lp-faq-answer">A: はい、Wi-Fi環境が必要です。音声認識と翻訳にクラウドAPIを使用します。</p>
            </div>
            <div className="lp-faq-item">
              <h3 className="lp-faq-question">Q: 推奨デバイスは？</h3>
              <p className="lp-faq-answer">A: 10インチ以上のタブレット（iPad、Android）を推奨します。横向きで使用してください。</p>
            </div>
            <div className="lp-faq-item">
              <h3 className="lp-faq-question">Q: 音声データは保存される？</h3>
              <p className="lp-faq-answer">A: いいえ、音声データは保存されません。リアルタイム処理のみで、プライバシーに配慮しています。</p>
            </div>
            <div className="lp-faq-item">
              <h3 className="lp-faq-question">Q: トライアル期間はいつから開始？</h3>
              <p className="lp-faq-answer">A: マイクが到着した日から14日間の無料お試し期間が開始されます。発送日ではなく、お手元に届いた日からカウントです。</p>
            </div>
            <div className="lp-faq-item">
              <h3 className="lp-faq-question">Q: 14日後はどうなる？</h3>
              <p className="lp-faq-answer">A: 返却または¥1,000での買取をお選びいただけます。返却の場合は送料お客様負担、買取の場合は追加料金なしでそのままご利用いただけます。</p>
            </div>
            <div className="lp-faq-item">
              <h3 className="lp-faq-question">Q: 複数のデバイスで使用できる？</h3>
              <p className="lp-faq-answer">A: はい、QRコードを使って簡単に追加デバイスをペアリングできます。タブレット、スマートフォンなど複数端末での同時利用が可能です。</p>
            </div>
            <div className="lp-faq-item">
              <h3 className="lp-faq-question">Q: マイクを紛失した場合は？</h3>
              <p className="lp-faq-answer">A: 紛失・破損の場合は損害金¥3,000をご請求いたします。大切にお取り扱いください。</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA（再） */}
      <section className="lp-cta-final">
        <div className="lp-content">
          <h2 className="lp-cta-final-title">
            外国人観光客との<br />
            "通じるおもてなし"を<br />
            今すぐ体験
          </h2>
          <button 
            className="lp-cta-button lp-cta-button-large"
            onClick={() => router.push('/display')}
          >
            14日間無料でお試し
          </button>
          <p className="lp-trial-note">
            ※到着日から14日間・返却または¥1,000買取・QRで簡単デバイス追加
          </p>
        </div>
      </section>

      {/* フッター */}
      <footer className="lp-footer">
        <div className="lp-content">
          <p className="lp-footer-logo">あんしんディスプレイ</p>
          <p className="lp-footer-text">
            飲食店・小売店向けリアルタイム翻訳タブレットアプリ
          </p>
          <p className="lp-footer-copyright">
            © 2025 あんしんディスプレイ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
