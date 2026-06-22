<script lang="ts">
	interface Props {
		title: string;
		description: string;
		accent?: string;
	}

	let { title, description, accent = 'teal' }: Props = $props();

	const accentClasses: Record<string, string> = {
		teal: 'from-teal-500/20 to-teal-600/5 border-teal-200/50',
		indigo: 'from-indigo-500/20 to-indigo-600/5 border-indigo-200/50',
		emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-200/50',
		amber: 'from-amber-500/20 to-amber-600/5 border-amber-200/50',
		violet: 'from-violet-500/20 to-violet-600/5 border-violet-200/50',
		rose: 'from-rose-500/20 to-rose-600/5 border-rose-200/50'
	};
</script>

<div class="animate-fade-up mb-6 rounded-2xl border bg-gradient-to-br p-5 sm:p-6 {accentClasses[accent]}">
	<h1 class="font-display text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
	<p class="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>
</div>