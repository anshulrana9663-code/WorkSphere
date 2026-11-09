import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { TopNavbar } from '../components/layout/TopNavbar';

const CURRENT_YEAR = new Date().getFullYear();

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileMenuOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
  };

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 antialiased">
      {/* Sidebar Navigation (Collapsible drawer on mobile, docked/collapsible sidebar on desktop) */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navigation Bar with Sidebar Toggle */}
        <TopNavbar
          onMenuToggle={handleToggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Main Content Area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Compact Footer */}
        <footer className="border-t border-slate-200/60 bg-white/50 px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-slate-600">
          WorkSphere Hub &bull; Enterprise Productivity &bull; {CURRENT_YEAR}
        </footer>
      </div>
    </div>
  );
}
