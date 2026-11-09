import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChevronDownIcon } from '../common/Icons';

export function UserProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  const displayUser = {
    name: user.name,
    role: user.role === 'Admin' ? (user.isDirector ? 'Director' : 'Manager') : user.position || 'Employee',
    email: user.email,
    status: 'online' as const,
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User profile menu"
        className="flex items-center gap-3 p-1.5 sm:px-3 sm:py-2 rounded-xl text-left hover:bg-slate-100/80 transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
      >
        {/* Avatar with status indicator */}
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-semibold text-sm shadow-xs">
            {displayUser.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          {displayUser.status && (
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                displayUser.status === 'online'
                  ? 'bg-emerald-500'
                  : displayUser.status === 'busy'
                  ? 'bg-rose-500'
                  : 'bg-amber-500'
              }`}
              title={`Status: ${displayUser.status}`}
            />
          )}
        </div>

        {/* User Details (hidden on mobile, visible on tablet/desktop) */}
        <div className="hidden sm:flex flex-col min-w-0 text-left">
          <span className="text-sm font-semibold text-slate-800 truncate leading-snug">
            {displayUser.name}
          </span>
          <span className="text-xs text-slate-500 truncate leading-none">
            {displayUser.role}
          </span>
        </div>

        <ChevronDownIcon
          size={16}
          className={`hidden sm:block text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-indigo-600' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Profile Dropdown Popover */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">{displayUser.name}</p>
            <p className="text-xs text-slate-500 truncate">{displayUser.email}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Active in Workspace
            </div>
          </div>

          <div className="py-1 text-sm text-slate-700">
            <div className="px-4 py-2 hover:bg-slate-50 cursor-pointer">
              Profile Details
            </div>
            <div className="px-4 py-2 hover:bg-slate-50 cursor-pointer">
              Account Preferences
            </div>
            <div className="px-4 py-2 hover:bg-slate-50 cursor-pointer">
              Keyboard Shortcuts
            </div>
          </div>

          <div className="border-t border-slate-100 pt-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
