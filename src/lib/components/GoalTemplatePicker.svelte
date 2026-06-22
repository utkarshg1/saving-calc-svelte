<script lang="ts">
	import { GOAL_TEMPLATES } from '$lib/presets/goalTemplates';

	interface Props {
		onselect: (id: string) => void;
	}

	let { onselect }: Props = $props();
</script>

<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
	{#each GOAL_TEMPLATES as template}
		<button
			type="button"
			class="group flex flex-col items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 p-4 text-center transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-teal-600"
			onclick={() => onselect(template.id)}
		>
			<span class="text-2xl transition group-hover:scale-110">{template.icon}</span>
			<span class="text-sm font-semibold text-slate-800 dark:text-slate-100">{template.name}</span>
			<span class="text-[10px] leading-tight text-slate-400 dark:text-slate-500">{template.description}</span>
		</button>
	{/each}
</div>