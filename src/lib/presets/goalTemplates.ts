import type { SavingsInputs } from '$lib/calculations/savings';
import { DEFAULT_INPUTS } from '$lib/calculations/savings';

export interface GoalTemplate {
	id: string;
	name: string;
	icon: string;
	description: string;
	inputs: Partial<SavingsInputs>;
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
	{
		id: 'car',
		name: 'Car',
		icon: '🚗',
		description: 'Mid-range car purchase in 3–5 years',
		inputs: {
			targetAmount: 800_000,
			years: 4,
			inflationRatePercent: 6,
			investmentPath: 'sip'
		}
	},
	{
		id: 'home',
		name: 'Home Down Payment',
		icon: '🏠',
		description: '20% down payment on a ₹50L home',
		inputs: {
			targetAmount: 1_000_000,
			years: 7,
			inflationRatePercent: 7,
			fdLoanPercent: 80,
			investmentPath: 'rd',
			rdInterestRatePercent: 6.5
		}
	},
	{
		id: 'wedding',
		name: 'Wedding',
		icon: '💍',
		description: 'Wedding fund with conservative RD path',
		inputs: {
			targetAmount: 1_500_000,
			years: 5,
			inflationRatePercent: 8,
			investmentPath: 'rd',
			rdInterestRatePercent: 6.4
		}
	},
	{
		id: 'education',
		name: 'Education',
		icon: '🎓',
		description: 'Higher education corpus',
		inputs: {
			targetAmount: 2_000_000,
			years: 10,
			inflationRatePercent: 9,
			investmentPath: 'sip'
		}
	},
	{
		id: 'emergency',
		name: 'Emergency Fund',
		icon: '🛡️',
		description: '6 months expenses safety net',
		inputs: {
			targetAmount: 300_000,
			years: 2,
			inflationRatePercent: 5,
			fdLoanPercent: 100,
			investmentPath: 'rd',
			rdInterestRatePercent: 6.5
		}
	}
];

export function applyTemplate(templateId: string): SavingsInputs {
	const template = GOAL_TEMPLATES.find((t) => t.id === templateId);
	if (!template) return { ...DEFAULT_INPUTS };
	return { ...DEFAULT_INPUTS, ...template.inputs };
}