import { calculateSuite, type CalculationSuite } from '$lib/calculations/index';
import { DEFAULT_INPUTS, type SavingsInputs } from '$lib/calculations/savings';
import { DEFAULT_TDS_INPUTS, type TdsInputs } from '$lib/calculations/tds';
import { DEFAULT_ADVANCED_INPUTS, type AdvancedInputs } from '$lib/calculations/types';
import { parseScenarioFromUrl, type ScenarioSnapshot } from '$lib/url/serializeScenario';
import type { HistoricalPreset } from '$lib/presets/historicalPresets';

class ScenarioStore {
	inputs = $state<SavingsInputs>({ ...DEFAULT_INPUTS });
	tdsInputs = $state<TdsInputs>({ ...DEFAULT_TDS_INPUTS });
	advanced = $state<AdvancedInputs>({ ...DEFAULT_ADVANCED_INPUTS });
	suite = $derived(calculateSuite(this.inputs, this.tdsInputs, this.advanced));

	get snapshot(): ScenarioSnapshot {
		return {
			inputs: this.inputs,
			tdsInputs: this.tdsInputs,
			advanced: this.advanced
		};
	}

	loadSnapshot(snapshot: ScenarioSnapshot) {
		this.inputs = {
			...DEFAULT_INPUTS,
			...snapshot.inputs,
			stepUpTopUpAmount: snapshot.inputs.stepUpTopUpAmount ?? DEFAULT_INPUTS.stepUpTopUpAmount,
			stepUpCapAmount: snapshot.inputs.stepUpCapAmount ?? DEFAULT_INPUTS.stepUpCapAmount
		};
		this.tdsInputs = { ...DEFAULT_TDS_INPUTS, ...snapshot.tdsInputs };
		this.advanced = {
			lumpsumAmount: snapshot.advanced.lumpsumAmount ?? DEFAULT_ADVANCED_INPUTS.lumpsumAmount,
			stepUpPercentAnnual:
				snapshot.advanced.stepUpPercentAnnual ?? DEFAULT_ADVANCED_INPUTS.stepUpPercentAnnual
		};
	}

	loadFromUrl(url: URL) {
		const snapshot = parseScenarioFromUrl(url);
		if (snapshot) this.loadSnapshot(snapshot);
	}

	applyHistoricalPreset(preset: HistoricalPreset) {
		this.inputs = {
			...this.inputs,
			...(preset.inflationRatePercent !== undefined && {
				inflationRatePercent: preset.inflationRatePercent
			}),
			...(preset.rdInterestRatePercent !== undefined && {
				rdInterestRatePercent: preset.rdInterestRatePercent
			}),
			...(preset.sipReturnRatePercent !== undefined && {
				sipReturnRatePercent: preset.sipReturnRatePercent
			})
		};
	}
}

export const scenario = new ScenarioStore();
export type { CalculationSuite };