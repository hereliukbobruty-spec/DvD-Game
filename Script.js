// DVD-style bouncing text + clones on touch/click for `#myElement`
const baseEl = document.getElementById('myElement');

if (!baseEl) {
	console.warn('Script.js: element with id "myElement" not found');
} else {
	// common styling for all items
	function applyBaseStyles(node) {
		Object.assign(node.style, {
			position: 'absolute',
			margin: '0',
			padding: '8px 12px',
			borderRadius: '6px',
			background: 'darkblue',
			color: 'white',
			fontFamily: 'Arial, sans-serif',
			whiteSpace: 'nowrap',
			userSelect: 'none',
			cursor: 'pointer',
			transform: 'translateZ(0)'
		});
		node.classList.add('dvd-item');
	}

	applyBaseStyles(baseEl);

	// items array: each item is { el, x, y, vx, vy }
	const items = [];

	function randColor() {
		return `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
	}

	function createItem(node, startX, startY, vx, vy) {
		const rect = node.getBoundingClientRect();
		const item = {
			el: node,
			x: startX != null ? startX : rect.left,
			y: startY != null ? startY : rect.top,
			vx: vx != null ? vx : ((Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3)),
			vy: vy != null ? vy : ((Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3))
		};
		node.style.left = Math.round(item.x) + 'px';
		node.style.top = Math.round(item.y) + 'px';
		items.push(item);
		return item;
	}

	// Initialize the base element at a random position
	const rect = baseEl.getBoundingClientRect();
	const startX = Math.random() * Math.max(0, window.innerWidth - rect.width);
	const startY = Math.random() * Math.max(0, window.innerHeight - rect.height);
	createItem(baseEl, startX, startY);

	// Animation loop for all items — plus game features
	let rafId = null;
	let running = true;

	function step() {
		const w = window.innerWidth;
		const h = window.innerHeight;
		for (let i = items.length - 1; i >= 0; i--) {
			const it = items[i];
			const elRect = it.el.getBoundingClientRect();
			it.x += it.vx;
			it.y += it.vy;

			if (it.x <= 0) { it.x = 0; it.vx = Math.abs(it.vx); it.el.style.background = randColor(); }
			if (it.y <= 0) { it.y = 0; it.vy = Math.abs(it.vy); it.el.style.background = randColor(); }
			if (it.x + elRect.width >= w) { it.x = w - elRect.width; it.vx = -Math.abs(it.vx); it.el.style.background = randColor(); }
			if (it.y + elRect.height >= h) { it.y = h - elRect.height; it.vy = -Math.abs(it.vy); it.el.style.background = randColor(); }

			it.el.style.left = Math.round(it.x) + 'px';
			it.el.style.top = Math.round(it.y) + 'px';
		}
		rafId = requestAnimationFrame(step);
	}

	function start() { if (!rafId) { rafId = requestAnimationFrame(step); running = true; } }
	function stop() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; running = false; } }

	// --- Game logic ---
	const scoreEl = document.getElementById('score');
	const timeEl = document.getElementById('time');
	const startBtn = document.getElementById('startBtn');
	const overlay = document.getElementById('overlayMessage');

	let score = 0;
	let timeLeft = 30; // seconds
	let gameRunning = false;
	let timerInterval = null;
	let spawnInterval = null;
	let spawnBadInterval = null;
	const MAX_ITEMS = 12;

	function updateHUD() {
		if (scoreEl) scoreEl.textContent = String(score);
		if (timeEl) timeEl.textContent = String(timeLeft);
	}

	function clearClones() {
		// remove all items except baseEl
		for (let i = items.length - 1; i >= 0; i--) {
			if (items[i].el !== baseEl) {
				items[i].el.remove();
				items.splice(i, 1);
			}
		}
		// reposition baseEl randomly
		const r = baseEl.getBoundingClientRect();
		let nx = Math.random() * Math.max(0, window.innerWidth - r.width);
		let ny = Math.random() * Math.max(0, window.innerHeight - r.height);
		if (items.length === 0) createItem(baseEl, nx, ny);
	}

	function spawnOne() {
		// spawn a clone of baseEl
		const template = baseEl;
		const rect = template.getBoundingClientRect();
		const clone = template.cloneNode(true);
		clone.removeAttribute('id');
		applyBaseStyles(clone);
		const left = Math.random() * Math.max(0, window.innerWidth - rect.width);
		const top = Math.random() * Math.max(0, window.innerHeight - rect.height);
		clone.style.left = left + 'px';
		clone.style.top = top + 'px';
		clone.style.background = randColor();
		document.body.appendChild(clone);
		const vx = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3 + (score/10));
		const vy = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3 + (score/10));
		createItem(clone, left, top, vx, vy);
	}

	// spawn a bad DVD: labeled 'World' — clicking it ends the game
	function spawnBad() {
		// do not spawn too many bad items
		const existingBad = items.filter(it => it.el.classList && it.el.classList.contains('dvd-bad')).length;
		if (existingBad >= 2) return;

		const template = baseEl;
		const rect = template.getBoundingClientRect();
		const bad = template.cloneNode(true);
		bad.removeAttribute('id');
		applyBaseStyles(bad);
		bad.classList.add('dvd-bad');
		bad.textContent = 'World, die!';
		// style to look dangerous
		bad.style.background = '#111';
		bad.style.color = '#ff6666';
		bad.style.fontWeight = '700';

		const left = Math.random() * Math.max(0, window.innerWidth - rect.width);
		const top = Math.random() * Math.max(0, window.innerHeight - rect.height);
		bad.style.left = left + 'px';
		bad.style.top = top + 'px';
		document.body.appendChild(bad);
		// faster velocity
		const vx = (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 4 + (score/10));
		const vy = (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 4 + (score/10));
		createItem(bad, left, top, vx, vy);
	}

	function startGame() {
		score = 0; timeLeft = 30; updateHUD();
		clearClones();
		// create a few starting clones
		for (let i = 0; i < 3; i++) spawnOne();
		gameRunning = true;
		overlay.style.display = 'none';
		// spawn periodically
		spawnInterval = setInterval(() => {
			if (items.length < MAX_ITEMS) spawnOne();
		}, 2000);
		// occasionally spawn a bad DVD
		spawnBadInterval = setInterval(() => {
			if (gameRunning) spawnBad();
		}, 7000 + Math.floor(Math.random() * 5000));
		// timer countdown
		timerInterval = setInterval(() => {
			timeLeft -= 1; updateHUD();
			if (timeLeft <= 0) endGame();
		}, 1000);
	}

	function endGame() {
		gameRunning = false;
		clearInterval(spawnInterval); spawnInterval = null;
		clearInterval(spawnBadInterval); spawnBadInterval = null;
		clearInterval(timerInterval); timerInterval = null;
		overlay.textContent = `Game Over — Score: ${score}`;
		overlay.style.display = 'block';
	}

	// pointer handler: if game is running, clicking a dvd item scores and removes it; otherwise it clones
	document.addEventListener('pointerdown', (e) => {
		const t = e.target;
		if (t && t.classList && t.classList.contains('dvd-item')) {
			// if it's a bad dvd and the game is running -> immediate loss
			if (t.classList.contains('dvd-bad') && gameRunning) {
				overlay.textContent = 'World, die!';
				overlay.style.display = 'block';
				endGame();
				return;
			}

			if (gameRunning) {
				// score and remove
				score += 1;
				updateHUD();
				// remove from items
				for (let i = items.length - 1; i >= 0; i--) {
					if (items[i].el === t) {
						items[i].el.remove(); items.splice(i, 1); break;
					}
				}
				// small pop visual
				t.style.transform = 'scale(1.1)';
				setTimeout(() => { if (t.parentElement) t.style.transform = 'translateZ(0)'; }, 120);
			} else {
				// clone (non-game mode)
				// reuse previous cloning behavior but limited
				const MAX = 12;
				if (items.length >= MAX) return;
				const rect = t.getBoundingClientRect();
				const clone = t.cloneNode(true);
				clone.removeAttribute('id');
				applyBaseStyles(clone);
				clone.style.left = rect.left + 'px'; clone.style.top = rect.top + 'px';
				clone.style.background = randColor();
				document.body.appendChild(clone);
				const vx = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3);
				const vy = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3);
				createItem(clone, rect.left, rect.top, vx, vy);
			}
		}
	});

	// Start button
	if (startBtn) startBtn.addEventListener('click', () => {
		if (!gameRunning) startGame(); else { endGame(); }
	});

	// Resize safety: ensure items remain in viewport
	window.addEventListener('resize', () => {
		for (const it of items) {
			const r = it.el.getBoundingClientRect();
			if (it.x + r.width > window.innerWidth) it.x = Math.max(0, window.innerWidth - r.width);
			if (it.y + r.height > window.innerHeight) it.y = Math.max(0, window.innerHeight - r.height);
			it.el.style.left = it.x + 'px'; it.el.style.top = it.y + 'px';
		}
	});

	// Start animation
	start();

	// Keyboard toggles: F2 or Ctrl+Shift+D
	document.addEventListener('keydown', function (e) {
		const target = e.target || e.srcElement;
		const tag = (target && target.tagName) || '';
		if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return;
		if (e.key === 'F2') { e.preventDefault(); if (running) stop(); else start(); }
		if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') { e.preventDefault(); if (running) stop(); else start(); }
	});
}