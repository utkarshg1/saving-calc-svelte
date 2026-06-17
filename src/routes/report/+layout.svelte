<script lang="ts">
	import '../layout.css';

	let { children } = $props();
</script>

<div class="report-preview-body">
	{@render children()}
</div>