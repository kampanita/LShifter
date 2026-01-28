import React from 'react';

type Theme = 'light' | 'dark' | 'sunset';

interface Props {
  current: Theme;
  onChange: (t: Theme) => void;
}

export const ThemeSwitcher: React.FC<Props> = ({ current, onChange }) => {
  const themes: { key: Theme; label: string; icon: string }[] = [
    { key: 'light', label: 'Light', icon: 'fa-sun' },
    { key: 'dark', label: 'Dark', icon: 'fa-moon' },
    { key: 'sunset', label: 'Sunset', icon: 'fa-fire' },
  ];

  return (
    <div className="flex items-center space-x-2" aria-label="Theme switcher">
      {themes.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          aria-label={t.label}
          className={`px-3 py-2 rounded-lg text-sm border ${current === t.key ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white'} flex items-center space-x-2`}
        >
          <i className={`fa-solid ${t.icon}`}></i>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
};
