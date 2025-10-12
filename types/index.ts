// ===== あんしんディスプレイ - 型定義 =====

// === 言語 ===
export type Language = 'en' | 'ja' | 'ko' | 'zh';

export const LANGUAGES: Record<Language, string> = {
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  zh: '中文'
};

// === メッセージ ===
export interface Message {
  id: string;
  sessionId: string;
  detectedLanguage: Language;
  originalText: string;
  translatedText: string;
  sttLatencyMs: number;
  translateLatencyMs: number;
  createdAt: Date;
  isComplete: boolean;
  speaker?: 'customer' | 'staff';
}

// === セッション ===
export interface Session {
  id: string;
  userId: string;
  selectedLanguage: Language;
  startedAt: Date;
  endedAt?: Date;
  messageCount: number;
  messages: Message[];
}

// === ユーザー ===
export interface User {
  id: string;
  email: string;
  role: 'shop_owner' | 'admin';
  createdAt: Date;
}

// === サブスクリプション ===
export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  status: 'active' | 'trialing' | 'canceled' | 'past_due';
  currentPeriodEnd: Date;
  trialEnd?: Date;
}

// === マイク発送 ===
export interface MicShipment {
  id: string;
  userId: string;
  status: 'pending' | 'shipped' | 'returned' | 'kept';
  shippedAt?: Date;
  returnedAt?: Date;
  address: string;
}

// === API リクエスト/レスポンス ===
export interface STTRequest {
  audioBlob: Blob;
  language?: Language;
}

export interface STTResponse {
  text: string;
  detectedLanguage: Language;
  confidence: number;
  latencyMs: number;
}

export interface TranslateRequest {
  text: string;
  sourceLanguage?: Language;
  targetLanguage: Language;
}

export interface TranslateResponse {
  translatedText: string;
  detectedSourceLanguage: Language;
  latencyMs: number;
}

export interface LogRequest {
  sessionId: string;
  messageId: string;
  event: 'stt_completed' | 'translation_completed' | 'stt_failed' | 'translation_failed';
  data?: Record<string, any>;
}

// === ステータス ===
export type AppStatus = 'idle' | 'listening' | 'processing' | 'error' | 'offline';

export interface StatusState {
  status: AppStatus;
  message?: string;
  audioLevel?: number;
}

// === 設定 ===
export interface Settings {
  microphoneDeviceId: string;
  brightness: number; // 0-100
  soundEnabled: boolean;
  pinCode: string;
}

// === ダッシュボード統計 ===
export interface DashboardStats {
  today: {
    messageCount: number;
    sessionCount: number;
  };
  thisWeek: {
    messageCount: number;
    sessionCount: number;
  };
  thisMonth: {
    messageCount: number;
    sessionCount: number;
  };
  languageDistribution: Record<Language, number>;
  peakHours: Array<{ hour: number; count: number }>;
  trialDaysRemaining?: number;
  nextBillingDate?: string;
  nextBillingAmount?: number;
}

// === エラー ===
export interface AppError {
  code: string;
  titleJa: string;
  titleEn: string;
  messageJa: string;
  messageEn: string;
  persistent?: boolean;
}

export const ERRORS: Record<string, AppError> = {
  STT_FAILED: {
    code: 'STT_FAILED',
    titleJa: '聞き取れませんでした',
    titleEn: 'Could not hear you',
    messageJa: 'もう一度、ゆっくりお話しください',
    messageEn: 'Please speak again slowly'
  },
  TRANSLATE_FAILED: {
    code: 'TRANSLATE_FAILED',
    titleJa: '翻訳に失敗しました',
    titleEn: 'Translation failed',
    messageJa: 'しばらくしてからお試しください',
    messageEn: 'Please try again later'
  },
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    titleJa: 'インターネット接続が切れました',
    titleEn: 'Internet connection lost',
    messageJa: 'Wi-Fiを確認してください',
    messageEn: 'Please check your Wi-Fi',
    persistent: true
  }
};

// === イベント ===
export type AppEvent = 
  | { type: 'LANGUAGE_SELECTED'; language: Language }
  | { type: 'VOICE_DETECTED'; audioLevel: number }
  | { type: 'VOICE_ENDED' }
  | { type: 'STT_COMPLETED'; result: STTResponse }
  | { type: 'STT_FAILED'; error: AppError }
  | { type: 'TRANSLATION_COMPLETED'; result: TranslateResponse }
  | { type: 'TRANSLATION_FAILED'; error: AppError }
  | { type: 'SESSION_TIMEOUT' }
  | { type: 'NETWORK_ONLINE' }
  | { type: 'NETWORK_OFFLINE' };