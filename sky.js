// title:   Sky's Game
// author:  Gaffe
// desc:    A silly matching game about things that Sky likes!
// site:    not yet!
// license: MIT License (change this to your license of choice)
// version: 0.1
// script:  js

let initialized = false;
let game = {};

const CARD_DATA = [
	{
		name: "creeper",
		flavor: "It's a creeper from minecraft lol",
		sprite: 0,
	},
	{
		name: "kitty",
		flavor: "It's a kitty!",
		sprite: 0,
	},
	{
		name: "candle",
		flavor: "It's candle, ooh smells nice!",
		sprite: 0,
	},
	{
		name: "soap",
		flavor: "Mmm, soap, so sweet and floral!",
		sprite: 0,
	},
	{
		name: "candy",
		flavor: "Yum! This candy is super sour.",
		sprite: 0,
	},
	{
		name: "redpanda",
		flavor: "A cute red panda. Wah!",
		sprite: 0,
	},
	{
		name: "seal",
		flavor: "A seal, like a kiss from a rose.",
		sprite: 0,
	},
	{
		name: "leaf",
		flavor: "This leaf is really crispy...",
		sprite: 0,
	},
	{
		name: "spong",
		flavor: "Speng beb?",
		sprite: 0,
	},
	{
		name: "dookie",
		flavor: "Some kind of green day reference!",
		sprite: 0,
	},
	{
		name: "king",
		flavor: "Must be King Arthur's crown?",
		sprite: 0,
	},
	{
		name: "wirt",
		flavor: "Appears to be a garden denizen.",
		sprite: 0,
	},
];
const CARD_W = 24;
const CARD_H = 36;
const TOP_MARGIN = 2;
const LEFT_MARGIN = 16;
const C_GUTTER = 2;
const R_GUTTER = 2;

function TIC() {
	init();
	background();
	speechBubble(game.skySays);

	game?.TIC();
}

function init() {
	if (initialized) return;

	game = new Game();

	initialized = true;
}

class Game {
	timers = [];
	skySays = "Let's play a game together...";
	cards = [];
	chosenCards = [];
	matches = 0;
	mouse = new Mouse();
	canPickCard = false;

	constructor() {
		this.timers.push(new Timer(260, () => {
			this.skySays = "These are a few of my favorite things - match them!"
			this.canPickCard = true;
		}, false));

		const unshuffled = [];

		for (const card of CARD_DATA) {
			unshuffled.push(new Card(card));
			unshuffled.push(new Card(card));
		}

		this.cards = [];

		while (this.cards.length < 24) {
			const index = this.cards.length;
			const randomUnshuffledIndex = Math.floor(Math.random() * unshuffled.length);
			const card = unshuffled.splice(randomUnshuffledIndex, 1)[0];

			card.setIndex(index);

			this.cards.push(card);
		}
	}

	TIC() {
		this.mouse.TIC();

		for (const timer of this.timers) {
			timer.TIC();
		}
		this.timers = this.timers.filter(t => !t.triggered);

		for (const card of this.cards) {
			card.TIC();
		};

		const [mouseX, mouseY, leftClick] = mouse();

		if (this.canPickCard && this.mouse.leftClickUp) {
			const index = getIndexForCoords(this.mouse.x, this.mouse.y);
			const indexIsNull = index === null;
			const indexIsAlreadyChosen = this.chosenCards.filter(c => c.index === index).length > 0;

			if (!indexIsNull && !indexIsAlreadyChosen) {
				if (this.chosenCards.length < 2) {
					const chosenCard = this.cards[index];

					if (chosenCard.hidden) {
						chosenCard.flip();
						this.skySays = chosenCard.flavor;
						this.chosenCards.push(chosenCard);

						if (this.chosenCards.length === 2) {
							if (this.chosenCards[0].name !== this.chosenCards[1].name) {
								this.canPickCard = false;
								const card1 = this.chosenCards[0];
								const card2 = this.chosenCards[1];
								this.timers.push(new Timer(60, () => {
									card1.flip();
									card2.flip();
									this.canPickCard = true;
									this.skySays = "Keep trying!"
								}));
							} else {
								this.matches++;

								const winner = this.matches === 12;
								if (winner) {
									this.skySays = "You win!";
								} else {
									this.skySays = "It's a match!";
								}
							}
							this.chosenCards = [];
						}
					}
				}
			}
		}
	}
}

class Card {
	x = 250;
	y = 65;
	w = 24;
	h = 36;

	name = "";
	flavor = "";
	sprite = 0;

	tweens = [];
	timers = [];
	index = 0;

	hidden = true;

	constructor(cardConfig) {
		this.name = cardConfig.name;
		this.flavor = cardConfig.flavor;
		this.sprite = cardConfig.sprite;
	}

	setIndex(index) {
		const endCoords = getCoordsForIndex(index);
		this.index = index;

		this.tweens.push(new Tween({
			target: this,
			durationFrames: 20,
			delayFrames: 10 * index,
			easing: easeOutOvershoot,
			startX: -64,
			startY: 300,
			endX: endCoords.x,
			endY: endCoords.y,
			//callback: () => this.flip(),
		}));
	}

	TIC() {
		for (const t of this.tweens) {
			t.TIC();
		}
		this.tweens = this.tweens.filter(t => !t.done);

		for (const timer of this.timers) {
			timer.TIC();
		}
		this.timers = this.timers.filter(t => !t.triggered);

		this.draw();
	}

	draw() {
		if (this.hidden) {
			rect(this.x + (CARD_W - this.w) / 2, this.y + (CARD_H - this.h) / 2, this.w, this.h, 3);
			rectb(this.x + (CARD_W - this.w) / 2, this.y + (CARD_H - this.h) / 2, this.w, this.h, 0);
			clip(this.x + (CARD_W - this.w) / 2, this.y + (CARD_H - this.h) / 2, this.w, this.h);
			spr(0, this.x + 4, this.y + 6, 0, 1, 0, 0, 2, 3);
			clip();
		}
		else {
			rect(this.x + (CARD_W - this.w) / 2, this.y + (CARD_H - this.h) / 2, this.w, this.h, 3);
			rectb(this.x + (CARD_W - this.w) / 2, this.y + (CARD_H - this.h) / 2, this.w, this.h, 0);
			clip(this.x + (CARD_W - this.w) / 2, this.y + (CARD_H - this.h) / 2, this.w, this.h);
			spr(this.sprite + 2, this.x + 4, this.y + 6, 0, 1, 0, 0, 2, 3);
			print(this.name, this.x, this.y, 0, false, 1, true);
			clip();
		}
	}

	flip() {
		const flipCallback = () => {
			this.hidden = !this.hidden;
			this.tweens.push(
				new Tween({
					target: this,
					startW: 0,
					endW: CARD_W,
					durationFrames: 15,
				}));
		};

		this.tweens.push(new Tween({
			target: this,
			startW: CARD_W,
			endW: 0,
			durationFrames: 15,
			callback: flipCallback,
		}));
	}
}

class Mouse {
	x = 0;
	y = 0;
	leftClickUp = false;
	leftClick = false;

	TIC() {
		const [mouseX, mouseY, leftClick] = mouse();

		this.x = mouseX;
		this.y = mouseY;
		this.leftClickUp = leftClick === false && this.leftClick === true;
		this.leftClick = leftClick;
	}
}

function background() {
	const BG_COLOR = 1;
	const FRAME_COLOR = 2;

	cls(BG_COLOR);

	for (let i = 0; i < 24; i++) {
		const { x, y } = getCoordsForIndex(i);

		rectb(
			x,
			y,
			CARD_W,
			CARD_H,
			FRAME_COLOR);
	}
}

function getRowAndColForIndex(index) {
	const row = Math.floor(index / 8);
	const col = index - row * 8;

	return { row, col };
}

function getCoordsForIndex(index) {
	const { row, col } = getRowAndColForIndex(index);

	const x = LEFT_MARGIN + (col * CARD_W) + (col * C_GUTTER);
	const y = TOP_MARGIN + (row * CARD_H) + (R_GUTTER * row);

	return { x, y };
}

function getIndexForCoords(x, y) {
	for (let i = 0; i < 24; i++) {
		const cardCoords = getCoordsForIndex(i);
		if (x >= cardCoords.x
			&& x <= cardCoords.x + CARD_W
			&& y >= cardCoords.y
			&& y <= cardCoords.y + CARD_H) {
			return i;
		}
	}

	return null;
}

function speechBubble(text) {
	const BORDER_COLOR = 4;
	const BUBBLE_COLOR = 3;
	const TEXT_COLOR = 0;

	rectb(47, 115, 191, 20, BORDER_COLOR);
	rectb(46, 116, 193, 18, BORDER_COLOR);
	rect(47, 116, 191, 18, BUBBLE_COLOR);

	print(text, 48, 123, TEXT_COLOR, false, 1, true);
}

class Tween {
	frameCounter = 0
	frameCounterIncrement = 1
	delayCompleted = false
	done = false
	repeatCounter = 0
	paused = false

	config = {
		target: {},
		durationFrames: 0,
		delayFrames: 0,
		repeat: 0,
		yoyo: false,
		easing: (t) => t,
		startX: 0,
		startY: 0,
		startW: 0,
		endX: 0,
		endY: 0,
		endW: 0,
		callback: () => { },
	}

	constructor(config) {
		this.config = {
			...config,
			delayFrames: config.delayFrames ?? this.config.delayFrames,
			repeat: config.repeat ?? this.config.repeat,
			yoyo: config.yoyo ?? this.config.yoyo,
			easing: config.easing ?? this.config.easing,
			callback: config.callback ?? this.config.callback,
		}
	}

	getAbsoluteProgress() {
		let progress = this.frameCounter / this.config.durationFrames
		progress = Math.min(progress, 1)
		progress = Math.max(progress, 0)

		return progress
	}

	getEasedProgress() {
		const absoluteProgress = this.getAbsoluteProgress()
		const easedProgress = this.config.easing(absoluteProgress)

		return easedProgress
	}

	setPaused(paused) {
		this.paused = paused
	}

	TIC() {
		if (this.done) return
		if (this.paused) return


		if (!this.delayCompleted && this.frameCounter >= this.config.delayFrames) {
			this.delayCompleted = true
			this.frameCounter = 0
		}

		if (this.delayCompleted) {
			const absoluteProgress = this.getAbsoluteProgress()
			const easedProgress = this.getEasedProgress()

			if (this.config.startX !== undefined && this.config.endX !== undefined) {
				this.config.target.x = lerp(this.config.startX, this.config.endX, easedProgress)
			}
			if (this.config.startY !== undefined && this.config.endY !== undefined) {
				this.config.target.y = lerp(this.config.startY, this.config.endY, easedProgress)
			}
			if (this.config.startW !== undefined && this.config.endW !== undefined) {
				this.config.target.w = lerp(this.config.startW, this.config.endW, easedProgress)
			}

			if (this.frameCounterIncrement > 0 && absoluteProgress === 1) {
				if (this.config.yoyo) {
					this.frameCounterIncrement = -1
				} else {
					this.repeatCounter++
					this.frameCounter = 0
				}
			} else if (this.frameCounterIncrement < 0 && absoluteProgress === 0) {
				this.repeatCounter++
				this.frameCounterIncrement = 1
			}

			if (this.config.repeat >= 0 && this.repeatCounter > this.config.repeat) {
				this.config.callback()
				this.done = true
			}
		}

		this.frameCounter += this.frameCounterIncrement
	}
}

class Timer {
	triggerAfterFrames = 0
	triggered = false
	paused = true
	frames = 0
	callback = () => { }

	constructor(framesUntilTriggered, callback, paused) {
		this.triggerAfterFrames = framesUntilTriggered
		this.callback = callback
		this.paused = !!paused
	}

	start() {
		this.paused = false
	}

	stop() {
		this.paused = true
	}

	reset() {
		this.paused = true
		this.frames = 0
		this.triggered = false
	}

	getProgress() {
		return 1 - ((this.triggerAfterFrames - this.frames) / this.triggerAfterFrames)
	}

	TIC() {
		if (!this.paused) {
			if (this.frames < this.triggerAfterFrames) this.frames++

			if (this.frames >= this.triggerAfterFrames && !this.triggered) {
				this.triggered = true
				this.callback()
			}
		}
	}
}

function lerp(a, b, t) {
	return a + (b - a) * t
}

function invLerp(a, b, v) {
	return (v - a) / (b - a)
}

function easeOutElastic(t) {
	if (t == 1) return 1
	return 1 - 2 ** (-10 * t) * turnCos(2 * t)
}

function easeInElastic(t) {
	if (t == 0) return 0
	return 2 ** (10 * t - 10) * turnsSin(2 * t - 2)
}

function easeInOvershoot(t) {
	return 2.7 * t * t * t - 1.7 * t * t
}

function easeOutOvershoot(t) {
	t -= 1
	return 1 + 2.7 * t * t * t + 1.7 * t * t
}

function easeInBounce(t) {
	t = 1 - t
	const n1 = 7.5625
	const d1 = 2.75

	if (t < 1 / d1) {
		return 1 - n1 * t * t;
	}
	else if (t < 2 / d1) {
		t -= 1.5 / d1
		return 1 - n1 * t * t - .75;
	}
	else if (t < 2.5 / d1) {
		t -= 2.25 / d1
		return 1 - n1 * t * t - .9375;
	}
	else {
		t -= 2.625 / d1
		return 1 - n1 * t * t - .984375;
	}
}

function easeOutBounce(t) {
	const n1 = 7.5625
	const d1 = 2.75

	if (t < 1 / d1) return n1 * t * t
	else if (t < 2 / d1) {
		t -= 1.5 / d1
		return n1 * t * t + .75;
	}
	else if (t < 2.5 / d1) {
		t -= 2.25 / d1
		return n1 * t * t + .9375;
	}
	else {
		t -= 2.625 / d1
		return n1 * t * t + .984375;
	}
}

function easeOutQuad(t) {
	t -= 1
	return 1 - t * t
}

function easeInQuad(t) {
	return t * t
}

function turnsSin(turns) {
	const rads = turns * (Math.PI * 2)
	const result = -Math.sin(rads)

	return result
}

function turnCos(turns) {
	const rads = turns * (Math.PI * 2)
	const result = Math.cos(rads)

	return result
}

// <TILES>
// 000:bbbbbbbbb0001111b0001121b0002111b0022441b0222441b0244211b0244412
// 001:bbbbbbbb2200000b1111110b1114210b1111112b1442222b2222442b2444442b
// 002:ccccceee8888cceeaaaa0cee888a0ceeccca0ccc0cca0c0c0cca0c0c0cca0c0c
// 003:eccccccccc888888caaaaaaaca888888cacccccccacccccccacc0ccccacc0ccc
// 004:ccccceee8888cceeaaaa0cee888a0ceeccca0cccccca0c0c0cca0c0c0cca0c0c
// 016:b0244414b0244414b0224414b0002244b0000224b0000022b0000002b0000000
// 017:2444442b2444442b2444422b2442220b2422000b2220000b2000000b0000000b
// 018:ccca00ccaaaa0ccecaaa0ceeaaaa0ceeaaaa0cee8888ccee000cceeecccceeee
// 019:cacccccccaaaaaaacaaacaaacaaaaccccaaaaaaac8888888cc000cccecccccec
// 020:ccca00ccaaaa0ccecaaa0ceeaaaa0ceeaaaa0cee8888ccee000cceeecccceeee
// 032:b0000000b0000000b0000000b0000000b0000000b0000000b0000000bbbbbbbb
// 033:0000000b0000000b0000000b0000000b0000000b0000000b0000000bbbbbbbbb
// </TILES>

// <WAVES>
// 000:00000000ffffffff00000000ffffffff
// 001:0123456789abcdeffedcba9876543210
// 002:0123456789abcdef0123456789abcdef
// </WAVES>

// <SFX>
// 000:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000304000000000
// </SFX>

// <TRACKS>
// 000:100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// </TRACKS>

// <PALETTE>
// 000:1a1c2cda652cc24c20f4f4f4ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57
// </PALETTE>

