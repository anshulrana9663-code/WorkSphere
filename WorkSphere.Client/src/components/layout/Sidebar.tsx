import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EMPLOYEE_NAV_SECTIONS, ADMIN_NAV_SECTIONS } from '../navigation/navigationConfig';
import { NavItem } from './NavItem';
import {
  WorkSphereLogo,
  CloseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
} from '../common/Icons';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function Sidebar({
  isOpen = false,
  onClose,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  className = '',
}: SidebarProps) {
  const location = useLocation();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const { role } = useAuth();
  const NAV_SECTIONS = role === 'Admin' ? ADMIN_NAV_SECTIONS : EMPLOYEE_NAV_SECTIONS;

  // Support controlled or uncontrolled collapse state
  const isCollapsed =
    controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };

  // On mobile overlay drawer, always show expanded view
  const showCollapsed = isCollapsed && !isOpen;

  const isItemActive = (href: string) => {
    if (href === '/dashboard' || href === '/admin/dashboard') {
      return location.pathname === href;
    }
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          role="presentation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="worksphere-sidebar"
        aria-label="Application Sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200/80 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 lg:z-auto ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } ${showCollapsed ? 'w-72 lg:w-20' : 'w-72 lg:w-72'} ${className}`}
      >
        {/* Brand / Logo Header */}
        {showCollapsed ? (
          <div className="flex items-center justify-center gap-1.5 h-18 px-2 border-b border-slate-100">
            <Link
              to="/"
              onClick={onClose}
              className="shrink-0 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
              title="WorkSphere Productivity Hub"
            >
              <WorkSphereLogo size={28} />
            </Link>
            <button
              type="button"
              onClick={handleToggle}
              className="hidden lg:flex p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRightIcon size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between h-18 px-5 border-b border-slate-100">
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center gap-3 group focus:outline-hidden focus:ring-2 focus:ring-indigo-500 rounded-lg min-w-0"
            >
              <WorkSphereLogo
                size={34}
                className="transition-transform duration-200 group-hover:scale-105 shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-lg font-bold tracking-tight text-slate-900 leading-tight truncate">
                  WorkSphere
                </span>
                <span className="text-xs font-medium text-slate-600 truncate">
                  Productivity Hub
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-1">
              {/* Desktop toggle collapse button */}
              <button
                type="button"
                onClick={handleToggle}
                className="hidden lg:flex p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftCloseIcon size={20} />
              </button>

              {/* Close button on mobile screens */}
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="lg:hidden p-2 -mr-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  aria-label="Close navigation sidebar"
                >
                  <CloseIcon size={20} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <nav
          className={`flex-1 overflow-y-auto ${
            showCollapsed ? 'px-2 py-4' : 'px-4 py-5'
          } space-y-6`}
        >
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1.5">
              {showCollapsed ? (
                <div
                  className="mx-2 my-2 border-t border-slate-200/70"
                  title={section.title}
                  aria-hidden="true"
                />
              ) : (
                <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  {section.title}
                </h2>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    isActive={isItemActive(item.href)}
                    onClick={onClose}
                    isCollapsed={showCollapsed}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Sidebar Footer */}
        <div className={`border-t border-slate-100 ${showCollapsed ? 'p-2' : 'p-4'}`}>
          {showCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60"
                title="Hub Online (v1.0)"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>

              <button
                type="button"
                onClick={handleToggle}
                className="hidden lg:flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpenIcon size={18} />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-700 truncate">
                      Hub Online
                    </span>
                    <span className="text-[11px] text-slate-600 truncate">
                      All systems sync
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 shrink-0">
                  v1.0
                </span>
              </div>

              <button
                type="button"
                onClick={handleToggle}
                className="hidden lg:flex w-full items-center justify-center gap-2 py-1.5 px-3 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <ChevronLeftIcon size={16} />
                <span>Collapse sidebar</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
