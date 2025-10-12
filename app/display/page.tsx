'use client';

import { useState } from 'react';
import WelcomeScreen from '../../components/WelcomeScreen';
import MainScreen from '../../components/MainScreen';
import { Language } from '../../types';

export default function DisplayPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
  };

  const handleBack = () => {
    setSelectedLanguage(null);
  };

  return (
    <>
      {/* レスポンシブ警告 */}
      <div className="size-warning">
        このアプリは10インチ以上のタブレットでの使用を推奨します
      </div>
      <div className="orientation-warning">
        画面を横向きにしてください
      </div>

      {selectedLanguage ? (
        <MainScreen language={selectedLanguage} onBack={handleBack} />
      ) : (
        <WelcomeScreen onLanguageSelect={handleLanguageSelect} />
      )}
    </>
  );
}