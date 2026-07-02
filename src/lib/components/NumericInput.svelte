<script lang="ts">
	interface Props {
		id: string;
		value: number;
		oncommit?: (value: number) => void;
		min?: number;
		max?: number;
		step?: number;
		prefix?: string;
		suffix?: string;
		/** Whole numbers only (e.g. years) */
		integer?: boolean;
		disabled?: boolean;
		class?: string;
	}

	let {
		id,
		value,
		oncommit,
		min,
		max,
		step,
		prefix,
		suffix,
		integer = false,
		disabled = false,
		class: className = ''
	}: Props = $props();

	let draft = $state('');
	let focused = $state(false);

	function formatCommitted(n: number): string {
		return integer ? String(Math.round(n)) : String(n);
	}

	function sanitize(raw: string): string {
		if (integer) {
			return raw.replace(/[^\d]/g, '');
		}
		let cleaned = raw.replace(/[^\d.]/g, '');
		const dotIndex = cleaned.indexOf('.');
		if (dotIndex !== -1) {
			cleaned =
				cleaned.slice(0, dotIndex + 1) + cleaned.slice(dotIndex + 1).replace(/\./g, '');
		}
		return cleaned;
	}

	function clamp(n: number): number {
		let result = n;
		if (min !== undefined) result = Math.max(min, result);
		if (max !== undefined) result = Math.min(max, result);
		if (integer) result = Math.round(result);
		else if (step !== undefined && step > 0) {
			const decimals = (step.toString().split('.')[1] ?? '').length;
			result = Math.round(result / step) * step;
			if (decimals > 0) result = Number(result.toFixed(decimals));
		}
		return result;
	}

	function shouldSkipLiveCommit(trimmed: string): boolean {
		if (trimmed === '' || trimmed === '.') return true;
		if (/^0+$/.test(trimmed) && trimmed.length > 1) return true;
		return false;
	}

	function tryLiveCommit(raw: string) {
		const trimmed = raw.trim();
		if (shouldSkipLiveCommit(trimmed)) return;

		const parsed = parseFloat(trimmed);
		if (!Number.isFinite(parsed) || parsed < 0) return;

		const committed = clamp(parsed);
		if (committed !== value) {
			oncommit?.(committed);
		}
	}

	function commit() {
		const trimmed = draft.trim();
		if (trimmed === '' || trimmed === '.') {
			draft = formatCommitted(value);
			focused = false;
			return;
		}

		const parsed = parseFloat(trimmed);
		if (!Number.isFinite(parsed) || parsed < 0) {
			draft = formatCommitted(value);
			focused = false;
			return;
		}

		const committed = clamp(parsed);
		draft = formatCommitted(committed);
		focused = false;
		if (committed !== value) {
			oncommit?.(committed);
		}
	}

	$effect(() => {
		if (!focused) {
			draft = formatCommitted(value);
		}
	});
</script>

<div class="relative">
	{#if prefix}
		<span class="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400">{prefix}</span>
	{/if}
	<input
		{id}
		type="text"
		inputmode={integer ? 'numeric' : 'decimal'}
		value={draft}
		{disabled}
		class="w-full max-w-full rounded-xl border-slate-200 bg-white py-3 text-slate-800 shadow-sm transition focus:border-teal-400 focus:ring-teal-400
			{prefix ? 'pl-8 pr-4' : suffix ? 'py-3 pr-8 pl-4' : 'px-4'}
			{disabled ? 'cursor-not-allowed opacity-50' : ''}
			{className}"
		onfocus={() => {
			focused = true;
			draft = formatCommitted(value);
		}}
		oninput={(e) => {
			draft = sanitize(e.currentTarget.value);
			tryLiveCommit(draft);
		}}
		onblur={commit}
		onkeydown={(e) => {
			if (e.key === 'Enter') e.currentTarget.blur();
		}}
	/>
	{#if suffix}
		<span class="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-400">{suffix}</span>
	{/if}
</div>