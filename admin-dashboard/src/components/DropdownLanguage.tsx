import { useEffect, useRef, useState } from 'react';
import Transition from '../utils/Transition';

interface DropdownLanguageProps {
    align?: string;
}

const languages = [
    { code: 'EN', name: 'English', flag: '🇺🇸' },
    { code: 'ES', name: 'Español', flag: '🇪🇸' },
    { code: 'FR', name: 'Français', flag: '🇫🇷' },
    { code: 'DE', name: 'Deutsch', flag: '🇩🇪' },
];

function DropdownLanguage({ align }: DropdownLanguageProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

    const trigger = useRef<HTMLButtonElement>(null);
    const dropdown = useRef<HTMLDivElement>(null);

    // close on click outside
    useEffect(() => {
        const clickHandler = ({ target }: MouseEvent) => {
            if (!dropdown.current) return;
            if (!dropdownOpen || dropdown.current.contains(target as Node) || trigger.current?.contains(target as Node)) return;
            setDropdownOpen(false);
        };
        document.addEventListener('click', clickHandler);
        return () => document.removeEventListener('click', clickHandler);
    });

    // close if the esc key is pressed
    useEffect(() => {
        const keyHandler = ({ keyCode }: KeyboardEvent) => {
            if (!dropdownOpen || keyCode !== 27) return;
            setDropdownOpen(false);
        };
        document.addEventListener('keydown', keyHandler);
        return () => document.removeEventListener('keydown', keyHandler);
    });

    const handleLanguageSelect = (language: typeof languages[0]) => {
        setSelectedLanguage(language);
        setDropdownOpen(false);
    };

    return (
        <div className="relative inline-flex">
            <button
                ref={trigger}
                className={`flex items-center space-x-1 px-2 h-9 hover:bg-[#16124A]/50 rounded-lg transition-colors ${dropdownOpen && 'bg-[#16124A]/70'}`}
                aria-haspopup="true"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-label="Select language"
            >
                <span className="text-sm text-gray-300 font-medium">{selectedLanguage.code}</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <Transition
                className={`origin-top z-[9999] fixed sm:absolute top-16 sm:top-full left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 w-48 sm:w-auto sm:min-w-48 max-w-xs bg-gradient-to-br from-[#1A1547] to-[#16124A] border border-[#2F6BFF]/30 rounded-2xl shadow-2xl shadow-[#2F6BFF]/10 overflow-hidden mt-2 ${align === 'right' ? 'sm:right-0' : 'sm:left-0'}`}
                show={dropdownOpen}
                enter="transition ease-out duration-200 transform"
                enterStart="opacity-0 -translate-y-2"
                enterEnd="opacity-100 translate-y-0"
                leave="transition ease-out duration-200"
                leaveStart="opacity-100"
                leaveEnd="opacity-0"
            >
                <div
                    ref={dropdown}
                    onFocus={() => setDropdownOpen(true)}
                    onBlur={() => setDropdownOpen(false)}
                >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-[#2F6BFF]/20 bg-gradient-to-r from-[#2F6BFF]/10 to-transparent">
                        <h3 className="text-sm font-semibold text-[#efdede]">Select Language</h3>
                    </div>

                    {/* Language List */}
                    <div className="py-2">
                        {languages.map((language) => (
                            <button
                                key={language.code}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#2F6BFF]/10 transition-all duration-200 ${selectedLanguage.code === language.code ? 'bg-[#2F6BFF]/20' : ''
                                    }`}
                                onClick={() => handleLanguageSelect(language)}
                            >
                                <span className="text-2xl">{language.flag}</span>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium text-[#efdede]">{language.name}</p>
                                    <p className="text-xs text-gray-400">{language.code}</p>
                                </div>
                                {selectedLanguage.code === language.code && (
                                    <svg className="w-5 h-5 text-[#2F6BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </Transition>
        </div>
    );
}

export default DropdownLanguage;
