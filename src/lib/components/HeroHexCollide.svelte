<script lang="ts">
	import { onMount } from 'svelte';

	interface Hex {
		id: number;
		color: string;
		size: number;
		x: number;
		y: number;
		vx: number;
		vy: number;
		rotation: number;
		vr: number;
		opacity: number;
		smOnly?: boolean;
	}

	let container: HTMLDivElement | undefined = $state();
	let hexes = $state<Hex[]>([]);
	let reducedMotion = $state(false);

	const HEX_DEFS: Omit<Hex, 'x' | 'y'>[] = [
		{ id: 1, color: '#0d9488', size: 40, vx: 0.45, vy: 0.32, rotation: 0, vr: 0.15, opacity: 0.48 },
		{ id: 2, color: '#4f46e5', size: 32, vx: -0.38, vy: 0.42, rotation: 20, vr: -0.2, opacity: 0.42 },
		{
			id: 3,
			color: '#f59e0b',
			size: 36,
			vx: 0.28,
			vy: -0.36,
			rotation: -12,
			vr: 0.12,
			opacity: 0.45,
			smOnly: true
		}
	];

	function initHexes(width: number, height: number): Hex[] {
		const starts = [
			{ x: width * 0.55, y: height * 0.25 },
			{ x: width * 0.2, y: height * 0.55 },
			{ x: width * 0.7, y: height * 0.7 }
		];

		return HEX_DEFS.map((def, i) => ({
			...def,
			x: starts[i].x,
			y: starts[i].y
		}));
	}

	function bounceOffWalls(hex: Hex, width: number, height: number) {
		const half = hex.size / 2;
		const damping = 0.92;

		if (hex.x - half <= 0) {
			hex.x = half;
			hex.vx = Math.abs(hex.vx) * damping;
		} else if (hex.x + half >= width) {
			hex.x = width - half;
			hex.vx = -Math.abs(hex.vx) * damping;
		}

		if (hex.y - half <= 0) {
			hex.y = half;
			hex.vy = Math.abs(hex.vy) * damping;
		} else if (hex.y + half >= height) {
			hex.y = height - half;
			hex.vy = -Math.abs(hex.vy) * damping;
		}
	}

	onMount(() => {
		reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!container) return;

		const updateSize = () => {
			if (!container) return;
			const { clientWidth, clientHeight } = container;
			if (clientWidth === 0 || clientHeight === 0) return;
			if (hexes.length === 0) {
				hexes = initHexes(clientWidth, clientHeight);
			}
		};

		updateSize();
		const resizeObserver = new ResizeObserver(updateSize);
		resizeObserver.observe(container);

		if (reducedMotion) {
			return () => resizeObserver.disconnect();
		}

		let frameId = 0;

		const tick = () => {
			if (!container || document.visibilityState === 'hidden') {
				frameId = requestAnimationFrame(tick);
				return;
			}

			const { clientWidth: w, clientHeight: h } = container;
			if (w > 0 && h > 0) {
				for (const hex of hexes) {
					hex.x += hex.vx;
					hex.y += hex.vy;
					hex.rotation += hex.vr;
					bounceOffWalls(hex, w, h);
				}
				hexes = [...hexes];
			}

			frameId = requestAnimationFrame(tick);
		};

		frameId = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(frameId);
			resizeObserver.disconnect();
		};
	});
</script>

<div
	bind:this={container}
	class="geo-hex-zone pointer-events-none absolute top-0 right-0 h-full w-[40%] sm:w-[45%]"
	aria-hidden="true"
>
	{#each hexes as hex (hex.id)}
		<div
			class="geo-hex absolute {hex.smOnly ? 'hidden sm:block' : ''}"
			style="
				width: {hex.size}px;
				height: {hex.size}px;
				background: {hex.color};
				opacity: {hex.opacity};
				transform: translate({hex.x - hex.size / 2}px, {hex.y - hex.size / 2}px) rotate({hex.rotation}deg);
				box-shadow: 0 0 20px {hex.color}33;
			"
		></div>
	{/each}
</div>