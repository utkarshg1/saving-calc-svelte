export type NavAccent = 'teal' | 'indigo' | 'emerald' | 'rose';

export interface AppNavItem {
	href: string;
	label: string;
	accent: NavAccent;
}

export const APP_NAV: AppNavItem[] = [
	{ href: '/', label: 'Plan', accent: 'teal' },
	{ href: '/compare', label: 'Compare', accent: 'indigo' },
	{ href: '/analyze', label: 'Analyze', accent: 'emerald' },
	{ href: '/export', label: 'Export', accent: 'rose' }
];

export function isNavActive(pathname: string, href: string): boolean {
	if (href === '/') return pathname === '/';
	return pathname === href || pathname.startsWith(`${href}/`);
}

export function navAccentClasses(accent: NavAccent, active: boolean): string {
	const map: Record<NavAccent, { active: string; idle: string }> = {
		teal: {
			active: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200/80',
			idle: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
		},
		indigo: {
			active: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/80',
			idle: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
		},
		emerald: {
			active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80',
			idle: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
		},
		rose: {
			active: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200/80',
			idle: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
		}
	};
	return active ? map[accent].active : map[accent].idle;
}

const bottomBarActive: Record<NavAccent, string> = {
	teal: 'text-teal-700',
	indigo: 'text-indigo-700',
	emerald: 'text-emerald-700',
	rose: 'text-rose-700'
};

const bottomBarIconActive: Record<NavAccent, string> = {
	teal: 'text-teal-600',
	indigo: 'text-indigo-600',
	emerald: 'text-emerald-600',
	rose: 'text-rose-600'
};

export function navBottomBarClasses(accent: NavAccent, active: boolean): string {
	return active ? bottomBarActive[accent] : 'text-slate-500';
}

export function navBottomBarIconClasses(accent: NavAccent, active: boolean): string {
	return active ? bottomBarIconActive[accent] : 'text-slate-400';
}