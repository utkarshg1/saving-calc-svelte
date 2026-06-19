<script lang="ts">
	import type { SavingsResult } from '$lib/calculations/savings';
	import { formatINR, formatPercent } from '$lib/utils/format';
	import ResultCard from './ResultCard.svelte';

	interface Props {
		result: SavingsResult;
	}

	let { result }: Props = $props();
</script>

<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
	<ResultCard label="Inflation Adjusted" value={formatINR(result.inflationAdjusted)} delay={0} />
	<ResultCard label="Estimated Amount" value={formatINR(result.estimatedAmount)} delay={50} />
	<ResultCard label="Yearly Savings" value={formatINR(result.yearlyAmount)} delay={100} />
	<ResultCard label="Monthly (Exact)" value={formatINR(result.monthlyAmount)} delay={150} />
	<ResultCard
		label="Monthly RD Deposit"
		value={formatINR(result.roundedMonthly)}
		highlight={true}
		subtitle="Rounded up to nearest ₹1,000"
		delay={200}
	/>
	<ResultCard label="RD Maturity" value={formatINR(result.rdMaturity)} delay={250} />
	<ResultCard label="Principal Saved" value={formatINR(result.principalSaved)} delay={300} />
	<ResultCard
		label="Interest Earned"
		value={formatINR(result.interestEarned)}
		highlight={true}
		subtitle={formatPercent(result.percentageInterest) + ' of principal'}
		delay={350}
	/>
</div>