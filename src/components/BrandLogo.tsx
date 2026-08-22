import React from 'react';

export interface LogoPreset {
  id: string;
  name: string;
  category: string;
  svgDataUri: string;
}

export const LOGO_PRESETS: LogoPreset[] = [
  {
    id: 'pro-shield',
    name: 'Эмблема Самозанятого (Щит & Ромб)',
    category: 'Бизнес & Консалтинг',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23E67E22"/><stop offset="100%" stop-color="%23D35400"/></linearGradient><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231E293B"/><stop offset="100%" stop-color="%230F172A"/></linearGradient></defs><rect width="100" height="100" rx="22" fill="url(%23g2)"/><path d="M50 16 L78 30 L78 54 C78 70 66 82 50 88 C34 82 22 70 22 54 L22 30 Z" fill="none" stroke="url(%23g1)" stroke-width="5" stroke-linejoin="round"/><path d="M50 32 L64 46 L50 60 L36 46 Z" fill="url(%23g1)"/><circle cx="50" cy="46" r="4" fill="%23FFFFFF"/></svg>`
  },
  {
    id: 'tech-code',
    name: 'IT & Разработка (Техно-Монограмма)',
    category: 'IT & Программирование',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><defs><linearGradient id="gt" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%233B82F6"/><stop offset="100%" stop-color="%231D4ED8"/></linearGradient></defs><rect width="100" height="100" rx="22" fill="%230F172A"/><path d="M34 35 L20 50 L34 65" fill="none" stroke="%2338BDF8" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M66 35 L80 50 L66 65" fill="none" stroke="%2338BDF8" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><line x1="56" y1="28" x2="44" y2="72" stroke="%23E67E22" stroke-width="6" stroke-linecap="round"/></svg>`
  },
  {
    id: 'creative-design',
    name: 'Дизайн & Креатив (Арт-Призма)',
    category: 'Дизайн & Маркетинг',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><defs><linearGradient id="gd1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23F43F5E"/><stop offset="100%" stop-color="%23E67E22"/></linearGradient><linearGradient id="gd2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%238B5CF6"/><stop offset="100%" stop-color="%236366F1"/></linearGradient></defs><rect width="100" height="100" rx="22" fill="%231E1B4B"/><polygon points="50,18 82,76 18,76" fill="url(%23gd1)" opacity="0.9"/><polygon points="50,82 82,24 18,24" fill="url(%23gd2)" opacity="0.6" style="mix-blend-mode: screen;"/><circle cx="50" cy="50" r="8" fill="%23FFFFFF"/></svg>`
  },
  {
    id: 'finance-growth',
    name: 'Финансы & Аналитика (Рост & Монета)',
    category: 'Бухгалтерия & Аналитика',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><defs><linearGradient id="gf" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2310B981"/><stop offset="100%" stop-color="%23059669"/></linearGradient></defs><rect width="100" height="100" rx="22" fill="%23064E3B"/><path d="M22 68 L42 46 L58 58 L80 28" fill="none" stroke="%2334D399" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><polyline points="66,28 80,28 80,42" fill="none" stroke="%2334D399" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="50" cy="50" r="36" fill="none" stroke="%23E67E22" stroke-width="3" stroke-dasharray="6 6"/></svg>`
  }
];

interface BrandLogoProps {
  className?: string;
  logoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  fallbackText?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  logoUrl,
  size = 'md',
  fallbackText = 'С'
}) => {
  const sizeMap: Record<string, string> = {
    sm: 'w-7 h-7 min-w-[28px]',
    md: 'w-10 h-10 min-w-[40px]',
    lg: 'w-14 h-14 min-w-[56px]',
    xl: 'w-20 h-20 min-w-[80px]'
  };

  const currentLogo = logoUrl || LOGO_PRESETS[0].svgDataUri;
  const isCustomNumber = typeof size === 'number';

  return (
    <div
      style={isCustomNumber ? { width: size, height: size, minWidth: size } : undefined}
      className={`relative inline-flex items-center justify-center rounded-2xl overflow-hidden shadow-sm shrink-0 ${!isCustomNumber ? sizeMap[size] : ''} ${className}`}
    >
      {currentLogo ? (
        <img
          src={currentLogo}
          alt="Логотип профиля"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#E67E22] to-[#D35400] text-white font-black flex items-center justify-center text-base">
          {fallbackText.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};
