import { Link } from 'react-router-dom';
import type { NavItemConfig } from '../../types/navigation';

interface NavItemProps {
  item: NavItemConfig;
  isActive: boolean;
  onClick?: () => void;
  isCollapsed?: boolean;
}

export function NavItem({ item, isActive, onClick, isCollapsed = false }: NavItemProps) {
  const Icon = item.icon;

  const badgeStyles =
    item.badgeVariant === 'warning'
      ? 'bg-amber-100 text-amber-800'
      : item.badgeVariant === 'primary'
      ? 'bg-indigo-100 text-indigo-700'
      : 'bg-slate-100 text-slate-700';

  const dotStyles =
    item.badgeVariant === 'warning'
      ? 'bg-amber-500'
      : item.badgeVariant === 'primary'
      ? 'bg-indigo-600'
      : 'bg-slate-500';

  return (
    <Link
      to={item.href}
      onClick={onClick}
      title={isCollapsed ? item.label : undefined}
      aria-label={isCollapsed ? item.label : undefined}
      aria-current={isActive ? 'page' : undefined}
      className={`group relative flex items-center rounded-xl text-sm transition-all duration-150 ${
        isCollapsed
          ? 'justify-center p-2.5 mx-auto w-11 h-11'
          : 'justify-between px-3.5 py-2.5'
      } ${
        isActive
          ? 'bg-indigo-50/90 text-indigo-700 font-semibold shadow-xs ring-1 ring-indigo-500/20'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
      }`}
    >
      {isActive && !isCollapsed && (
        <span
          className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-r-md"
          aria-hidden="true"
        />
      )}

      <div className={`flex items-center min-w-0 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        <Icon
          size={20}
          className={`shrink-0 transition-colors duration-150 ${
            isActive
              ? 'text-indigo-600'
              : 'text-slate-400 group-hover:text-slate-600'
          }`}
          aria-hidden="true"
        />
        {!isCollapsed && <span className="truncate">{item.label}</span>}
      </div>

      {item.badge !== undefined && !isCollapsed && (
        <span
          className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${badgeStyles}`}
        >
          {item.badge}
        </span>
      )}

      {item.badge !== undefined && isCollapsed && (
        <span
          className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${dotStyles}`}
          title={`${item.label} (${item.badge})`}
          aria-hidden="true"
        />
      )}
    </Link>
  );
}
