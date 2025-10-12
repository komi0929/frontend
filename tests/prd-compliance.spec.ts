import { test, expect } from '@playwright/test';

// ===== PRD v2.1準拠テスト =====

test.describe('ウェルカム画面', () => {
  test('言語選択ボタンが3つ表示される', async ({ page }) => {
    await page.goto('/display');
    
    await expect(page.getByTestId('lang-en')).toBeVisible();
    await expect(page.getByTestId('lang-ko')).toBeVisible();
    await expect(page.getByTestId('lang-zh')).toBeVisible();
  });
  
  test('多言語メッセージが表示される', async ({ page }) => {
    await page.goto('/display');
    
    await expect(page.getByTestId('welcome-body-en')).toContainText('If you have any questions');
    await expect(page.getByTestId('welcome-body-zh')).toContainText('如有任何问题');
    await expect(page.getByTestId('welcome-body-ko')).toContainText('질문이 있으시면');
  });
  
  test('ロゴと設定ボタンが正しく表示される', async ({ page }) => {
    await page.goto('/display');
    
    await expect(page.getByTestId('welcome-title')).toContainText('あんしんディスプレイ');
    await expect(page.getByTestId('lang-select-prompt')).toContainText('Please select your language');
    await expect(page.getByTestId('btn-settings')).toBeVisible();
  });
  
  test('言語選択後にメイン画面へ遷移', async ({ page }) => {
    await page.goto('/display');
    await page.getByTestId('lang-en').click();
    
    // 0.3秒のアニメーション待ち
    await page.waitForTimeout(300);
    
    await expect(page.getByTestId('status-bar')).toBeVisible();
    await expect(page.getByTestId('mic-icon')).toBeVisible();
  });
});

test.describe('メイン画面', () => {
  test('初期状態の要素が正しく表示される', async ({ page }) => {
    await page.goto('/display');
    await page.getByTestId('lang-en').click();
    await page.waitForTimeout(300);
    
    // 必須要素の存在確認
    await expect(page.getByTestId('status-bar')).toBeVisible();
    await expect(page.getByTestId('mic-icon')).toBeVisible();
    await expect(page.getByTestId('guide-text')).toBeVisible();
    await expect(page.getByTestId('btn-settings')).toBeVisible();
    
    // 初期ガイドテキストの確認
    await expect(page.getByTestId('guide-text')).toContainText('Please start speaking');
  });
  
  test('フォントサイズが仕様通り', async ({ page }) => {
    await page.goto('/display');
    await page.getByTestId('lang-en').click();
    await page.waitForTimeout(300);
    
    // モック会話を追加
    await page.evaluate(() => {
      const event = new CustomEvent('addMockMessage', {
        detail: {
          originalText: 'Test message',
          translatedText: 'テストメッセージ',
          detectedLanguage: 'en'
        }
      });
      window.dispatchEvent(event);
    });
    
    await page.locator('[data-testid^="original-text-"]').first().waitFor();
    
    const originalText = page.locator('[data-testid^="original-text-"]').first();
    const translatedText = page.locator('[data-testid^="translated-text-"]').first();
    
    const originalSize = await originalText.evaluate(el => 
      parseFloat(getComputedStyle(el).fontSize)
    );
    const translatedSize = await translatedText.evaluate(el => 
      parseFloat(getComputedStyle(el).fontSize)
    );
    
    // PRD仕様: 原文32px±2, 翻訳40px±2
    expect(originalSize).toBeGreaterThanOrEqual(30);
    expect(originalSize).toBeLessThanOrEqual(34);
    expect(translatedSize).toBeGreaterThanOrEqual(38);
    expect(translatedSize).toBeLessThanOrEqual(42);
  });
  
  test('翻訳テキストの色が#D97706', async ({ page }) => {
    await page.goto('/display');
    await page.getByTestId('lang-en').click();
    await page.waitForTimeout(300);
    
    // モック翻訳を追加
    await page.evaluate(() => {
      const event = new CustomEvent('addMockMessage', {
        detail: {
          originalText: 'Test',
          translatedText: 'テスト',
          detectedLanguage: 'en'
        }
      });
      window.dispatchEvent(event);
    });
    
    await page.locator('[data-testid^="translated-text-"]').first().waitFor();
    
    const color = await page.locator('[data-testid^="translated-text-"]').first()
      .evaluate(el => getComputedStyle(el).color);
    
    // PRD仕様: #D97706 = rgb(217, 119, 6)
    expect(color).toBe('rgb(217, 119, 6)');
  });
  
  test('左バーの幅が6px', async ({ page }) => {
    await page.goto('/display');
    await page.getByTestId('lang-en').click();
    await page.waitForTimeout(300);
    
    // モックメッセージを追加
    await page.evaluate(() => {
      const event = new CustomEvent('addMockMessage', {
        detail: {
          originalText: 'Test',
          translatedText: 'テスト',
          detectedLanguage: 'en'
        }
      });
      window.dispatchEvent(event);
    });
    
    await page.locator('[data-testid^="message-bar-"]').first().waitFor();
    
    const barWidth = await page.locator('[data-testid^="message-bar-"]').first()
      .evaluate(el => parseFloat(getComputedStyle(el).width));
    
    // PRD仕様: 6px
    expect(barWidth).toBe(6);
  });
  
  test('スクロール機能が動作する', async ({ page }) => {
    await page.goto('/display');
    await page.getByTestId('lang-en').click();
    await page.waitForTimeout(300);
    
    // 複数のメッセージを追加してスクロールテスト
    for (let i = 0; i < 5; i++) {
      await page.evaluate((index) => {
        const event = new CustomEvent('addMockMessage', {
          detail: {
            originalText: `Message ${index}`,
            translatedText: `メッセージ${index}`,
            detectedLanguage: 'en'
          }
        });
        window.dispatchEvent(event);
      }, i);
      await page.waitForTimeout(100);
    }
    
    const container = page.getByTestId('conversation-container');
    await container.waitFor();
    
    // 上にスクロール
    await container.evaluate(el => el.scrollTop = 0);
    await page.waitForTimeout(100);
    
    // 「最新へ」ボタンが表示されることを確認（メッセージが多い場合）
    const scrollButton = page.getByTestId('btn-scroll-to-latest');
    if (await scrollButton.isVisible()) {
      await scrollButton.click();
      
      // 最下部にスクロールされることを確認
      const scrollTop = await container.evaluate(el => el.scrollTop);
      const scrollHeight = await container.evaluate(el => el.scrollHeight);
      const clientHeight = await container.evaluate(el => el.clientHeight);
      
      expect(scrollTop + clientHeight).toBeCloseTo(scrollHeight, 50);
    }
  });
});

test.describe('アニメーション', () => {
  test('マイクアイコンが呼吸アニメーション', async ({ page }) => {
    await page.goto('/display');
    await page.getByTestId('lang-en').click();
    await page.waitForTimeout(300);
    
    const micIcon = page.getByTestId('mic-icon');
    await micIcon.waitFor();
    
    // アニメーションクラスが適用されているか確認
    const hasBreathingAnimation = await micIcon.evaluate(el => {
      const computedStyle = getComputedStyle(el);
      return computedStyle.animationName.includes('breathe');
    });
    
    expect(hasBreathingAnimation).toBeTruthy();
  });
});

test.describe('レスポンシブ', () => {
  test('10インチ未満で警告表示', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 400 });
    await page.goto('/display');
    
    const sizeWarning = page.locator('.size-warning');
    await expect(sizeWarning).toBeVisible();
    await expect(sizeWarning).toContainText('10インチ以上');
  });
  
  test('縦向きで警告表示', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/display');
    
    const orientationWarning = page.locator('.orientation-warning');
    await expect(orientationWarning).toBeVisible();
  });
});

test.describe('エラーハンドリング', () => {
  test('エラーメッセージが多言語表示される', async ({ page }) => {
    await page.goto('/display');
    await page.getByTestId('lang-en').click();
    await page.waitForTimeout(300);
    
    // エラーをトリガー
    await page.evaluate(() => {
      const event = new CustomEvent('showError', {
        detail: { errorCode: 'STT_FAILED' }
      });
      window.dispatchEvent(event);
    });
    
    await expect(page.getByTestId('error-overlay')).toBeVisible();
    await expect(page.getByTestId('error-title-en')).toContainText('Could not hear you');
    await expect(page.getByTestId('error-title-ja')).toContainText('聞き取れませんでした');
  });
  
  test('エラーメッセージが3秒後に消える', async ({ page }) => {
    await page.goto('/display');
    await page.getByTestId('lang-en').click();
    await page.waitForTimeout(300);
    
    await page.evaluate(() => {
      const event = new CustomEvent('showError', {
        detail: { errorCode: 'STT_FAILED' }
      });
      window.dispatchEvent(event);
    });
    
    await expect(page.getByTestId('error-overlay')).toBeVisible();
    
    // 3.5秒待つ（3秒表示 + 0.5秒フェード）
    await page.waitForTimeout(3500);
    
    await expect(page.getByTestId('error-overlay')).not.toBeVisible();
  });
});

test.describe('data-testid 完全性チェック', () => {
  test('ウェルカム画面の必須data-testidが存在', async ({ page }) => {
    await page.goto('/display');
    
    // PRD必須のdata-testid
    const requiredTestIds = [
      'welcome-title',
      'welcome-body-en',
      'welcome-body-zh', 
      'welcome-body-ko',
      'lang-select-prompt',
      'lang-en',
      'lang-ko',
      'lang-zh',
      'btn-settings'
    ];
    
    for (const testId of requiredTestIds) {
      await expect(page.getByTestId(testId)).toBeVisible();
    }
  });
  
  test('メイン画面の必須data-testidが存在', async ({ page }) => {
    await page.goto('/display');
    await page.getByTestId('lang-en').click();
    await page.waitForTimeout(300);
    
    const requiredTestIds = [
      'status-bar',
      'mic-icon',
      'guide-text',
      'btn-settings'
    ];
    
    for (const testId of requiredTestIds) {
      await expect(page.getByTestId(testId)).toBeVisible();
    }
  });
});