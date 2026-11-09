import type { ComponentType, SVGProps } from 'react';

export type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { className?: string; size?: number }>;

export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  icon: IconComponent;
  badge?: string | number;
  badgeVariant?: 'default' | 'primary' | 'warning' | 'success';
}

export interface NavSectionConfig {
  title: string;
  items: NavItemConfig[];
}

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  avatarUrl?: string;
  status?: 'online' | 'busy' | 'away' | 'offline';
}
