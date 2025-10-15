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
      {/* 繝ｬ繧ｹ繝昴Φ繧ｷ繝冶ｭｦ蜻・*/}
      <div className="size-warning">
        縺薙・繧｢繝励Μ縺ｯ10繧､繝ｳ繝∽ｻ･荳翫・繧ｿ繝悶Ξ繝・ヨ縺ｧ縺ｮ菴ｿ逕ｨ繧呈耳螂ｨ縺励∪縺・      </div>
      <div className="orientation-warning">
        逕ｻ髱｢繧呈ｨｪ蜷代″縺ｫ縺励※縺上□縺輔＞
      </div>

      {selectedLanguage ? (
        <MainScreen language={selectedLanguage} onBack={handleBack} />
      ) : (
        <WelcomeScreen onLanguageSelect={handleLanguageSelect} />
      )}
    </>
  );
}
