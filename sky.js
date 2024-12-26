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
		sprite: 2,
	},
	{
		name: "kitty",
		flavor: "It's a kitty!",
		sprite: 4,
	},
	{
		name: "candle",
		flavor: "It's candle, ooh smells nice!",
		sprite: 6,
	},
	{
		name: "soap",
		flavor: "Mmm, soap, so sweet and floral!",
		sprite: 8,
	},
	{
		name: "candy",
		flavor: "Yum! This candy is super sour.",
		sprite: 10,
	},
	{
		name: "redpanda",
		flavor: "A cute red panda. Wah!",
		sprite: 12,
	},
	{
		name: "seal",
		flavor: "A seal, like a kiss from a rose.",
		sprite: 14,
	},
	{
		name: "leaf",
		flavor: "This leaf is really crispy...",
		sprite: 48,
	},
	{
		name: "spong",
		flavor: "Speng beb?",
		sprite: 50,
	},
	{
		name: "dookie",
		flavor: "Some kind of green day reference!",
		sprite: 52,
	},
	{
		name: "king",
		flavor: "Must be King Arthur's crown?",
		sprite: 54,
	},
	{
		name: "wirt",
		flavor: "Appears to be a garden denizen.",
		sprite: 56,
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
	canDismissTitle = false;
	canReset = false;
	title = {};
	winner = {};
	sky = {};

	constructor() {
		this.title = new Title(() => this.canDismissTitle = true);
		this.winner = new Winner();
		this.sky = new Sky();
	}

	dismissTitleShuffleAndDeal() {
		this.timers.push(new Timer(260, () => {
			this.skySays = "These are a few of my favorite things - match them!"
			this.canPickCard = true;
			this.sky.happyChitter();
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

		if (this.canReset && leftClick && mouseY > 100) {
			game = new Game();
			return;
		}

		if (this.canDismissTitle && this.mouse.leftClick) {
			this.canDismissTitle = false;
			this.title.hide(() => this.dismissTitleShuffleAndDeal());
		}

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
						this.sky.chitter();
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
									this.skySays = "Keep trying!";
									this.sky.chitter();
								}));
							} else {
								this.matches++;

								const winner = this.matches === 12;
								if (winner) {
									this.winner.show(() => this.canReset = true);
									this.skySays = "Click me to play again!";
									this.sky.happyChitter();
								} else {
									this.skySays = "It's a match!";
									this.sky.happyChitter();
									sfx(2);
								}
							}
							this.chosenCards = [];
						}
					}
				}
			}
		}

		this.title.TIC();
		this.winner.TIC();
		this.sky.TIC();
	}
}

class Sky {
	x = 0;
	y = 136;
	tweens = [];
	timers = [];
	sprite = 256;

	constructor() {
		this.tweens.push(new Tween({
			target: this,
			durationFrames: 60,
			startY: 136,
			endY: 88,
			easing: easeOutElastic,
			callback: () => this.chitter(),
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

		spriteWithBorder(this.sprite, this.x, this.y, 0, 1, 0, 0, 6, 6, 3);
		rect(this.x + 3, this.y + 47, 48 - 6, 64, 1);
		line(this.x + 3, this.y + 47, this.x + 3, 136, 2);
		line(this.x + 48 - 4, this.y + 47, this.x + 48 - 4, 136, 2);
		line(this.x + 2, this.y + 47, this.x + 2, 136, 3);
		line(this.x + 48 - 3, this.y + 47, this.x + 48 - 3, 136, 3);

		if (this.timers.length === 0 && this.tweens.length === 0) {
			this.timers = [
				new Timer(
					60 * 3 + Math.floor(Math.random() * 60 * 4),
					() => {
						this.sprite = 352;
						this.timers.push(new Timer(
							15,
							() => { this.sprite = 256 }
						));
					},
					false
				)
			];
		}
	}

	chitter() {
		this.tweens = [];
		this.timers = [];
		this.sprite = 262;

		let count = 0;
		const callback = () => {
			if (count < 18) {
				this.timers.push(new Timer(
					4,
					() => {
						this.sprite = this.sprite === 256 ? 262 : 256;
						count++;
						callback();
					},
					false
				));
			}
		};

		this.timers.push(new Timer(
			4,
			callback,
			false
		));

		this.tweens.push(new Tween({
			target: this,
			durationFrames: 6,
			startY: 88,
			endY: 86,
			easing: easeOutQuad,
			yoyo: true,
			repeat: 4,
			callback: () => { this.sprite = 256 },
		}));
	}

	happyChitter() {
		this.tweens = [];
		this.timers = [];
		this.sprite = 358;

		let count = 0;
		const callback = () => {
			if (count < 18) {
				this.timers.push(new Timer(
					4,
					() => {
						this.sprite = this.sprite === 352 ? 358 : 352;
						count++;
						callback();
					},
					false
				));
			}
		};

		this.timers.push(new Timer(
			4,
			callback,
			false
		));

		this.tweens.push(new Tween({
			target: this,
			durationFrames: 6,
			startY: 88,
			endY: 86,
			easing: easeOutQuad,
			yoyo: true,
			repeat: 4,
			callback: () => { this.sprite = 352 },
		}));
	}
}

class Winner {
	x = 120;
	y = -64;

	tweens = [];
	timers = [];

	constructor(callback) { }

	show(callback) {
		this.tweens.push(new Tween({
			target: this,
			durationFrames: 120,
			startY: -64,
			endY: 20,
			easing: easeOutBounce,
			callback: callback
		}));
	}

	TIC() {
		const textColor = 0;
		const bgColor = 3;

		for (const t of this.tweens) {
			t.TIC();
		}
		this.tweens = this.tweens.filter(t => !t.done);

		for (const timer of this.timers) {
			timer.TIC();
		}
		this.timers = this.timers.filter(t => !t.triggered);

		printWithBorder("YOU WIN!!!", this.x, this.y + 20, textColor, bgColor, false, 3, false, true);
	}
}

class Title {
	x = 120;
	y = 20;

	tweens = [];
	timers = [];

	constructor(callback) {
		this.tweens.push(new Tween({
			target: this,
			durationFrames: 120,
			startY: -64,
			endY: 20,
			easing: easeOutBounce,
			callback: callback
		}));
	}

	hide(callback) {
		this.tweens.push(new Tween({
			target: this,
			durationFrames: 15,
			startY: 20,
			endY: -64,
			callback: callback
		}));
	}

	TIC() {
		const textColor = 0;
		const bgColor = 3;

		for (const t of this.tweens) {
			t.TIC();
		}
		this.tweens = this.tweens.filter(t => !t.done);

		for (const timer of this.timers) {
			timer.TIC();
		}
		this.timers = this.timers.filter(t => !t.triggered);

		printWithBorder("A Few of Sky's", this.x, this.y, textColor, bgColor, false, 3, true, true);
		printWithBorder("FAVORITE", this.x, this.y + 20, textColor, bgColor, false, 3, false, true);
		printWithBorder("THINGS", this.x, this.y + 40, textColor, bgColor, false, 3, false, true);
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
			rect(this.x + (CARD_W - this.w) / 2, this.y + (CARD_H - this.h) / 2, this.w, this.h, 4);
			rectb(this.x + (CARD_W - this.w) / 2, this.y + (CARD_H - this.h) / 2, this.w, this.h, 0);
			clip(this.x + (CARD_W - this.w) / 2, this.y + (CARD_H - this.h) / 2, this.w, this.h);
			spriteWithBorder(0, this.x + 4, this.y + 6, 0, 1, 0, 0, 2, 3, 3);
			clip();
		}
		else {
			rect(this.x + (CARD_W - this.w) / 2, this.y + (CARD_H - this.h) / 2, this.w, this.h, 3);
			rectb(this.x + (CARD_W - this.w) / 2, this.y + (CARD_H - this.h) / 2, this.w, this.h, 0);
			clip(this.x + (CARD_W - this.w) / 2, this.y + (CARD_H - this.h) / 2, this.w, this.h);
			spriteWithBorder(this.sprite, this.x + 4, this.y + 6, 0, 1, 0, 0, 2, 3, 0);
			clip();
		}
	}

	flip() {
		const flipCallback = () => {
			if (this.hidden) sfx(1); else sfx(0);
			this.hidden = !this.hidden;
			this.tweens.push(
				new Tween({
					target: this,
					startW: 0,
					endW: CARD_W,
					durationFrames: 15,
				}));
		};

		if (this.hidden) sfx(0); else sfx(1);
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
	const BG_COLOR = 15;
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

function printWithBorder(text, x, y, color, bgColor, fixed, scale, smallFont, centered) {
	let xOffset = 0
	let w = 0
	if (centered) {
		clip(0, 0, 0, 0)
		w = print(text, 0, 0, color, fixed, scale, smallFont)
		clip()

		xOffset = -w / 2
	}

	if (bgColor !== null) {
		print(text, x + xOffset - 1, y, bgColor, fixed, scale, smallFont)
		print(text, x + xOffset + 1, y, bgColor, fixed, scale, smallFont)
		print(text, x + xOffset, y - 1, bgColor, fixed, scale, smallFont)
		print(text, x + xOffset, y + 1, bgColor, fixed, scale, smallFont)
	}

	return print(text, x + xOffset, y, color, fixed, scale, smallFont)
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

function pal(c0, c1) {
	if (arguments.length == 2)
		poke4(0x3ff0 * 2 + c0, c1)
	else
		for (var i = 0; i < 16; i++)
			poke4(0x3ff0 * 2 + i, i)
}

function spriteWithBorder(sprite, x, y, colorKey, scale, flip, rotate, w, h, borderColor) {
	const palette = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
	const colorsToSwap = palette.filter(c => c !== colorKey && c !== borderColor)
	for (let color of colorsToSwap) {
		pal(color, borderColor)
	}
	spr(sprite, x + 1, y, colorKey, scale, flip, rotate, w, h)
	spr(sprite, x - 1, y, colorKey, scale, flip, rotate, w, h)
	spr(sprite, x, y + 1, colorKey, scale, flip, rotate, w, h)
	spr(sprite, x, y - 1, colorKey, scale, flip, rotate, w, h)
	pal()
	spr(sprite, x, y, colorKey, scale, flip, rotate, w, h)
}

// <TILES>
// 000:0000000000000000000050000005050000500055005000500005255502245555
// 001:0000000000000000050000005050000000050000505000005555000055442200
// 002:0000000000006666000666660066622600666226006666660066622200062262
// 003:0000000066660000666660006226600062266000666660006222600022626000
// 004:0000000000000000000000000000000200000002000000040000000400000044
// 005:0000000000000000000000000002000040420000404400004444000034344000
// 006:0000000000000000000000000000000000000004000000040000000000000000
// 007:0000000010000000000000001400000004000000100000004000000050000000
// 010:0000000000000000000000000000000000000000000000000000000000000335
// 011:0000000000000000000000000000000000000000000000000000000053300000
// 012:0000000000000000000030000000330000003355000055230000533200005933
// 013:0000000000000000003000000330000053300000255000003350000039500000
// 015:0000000000000000000550000055550000555500000550000009300000333300
// 016:0211455502445554024455110244554402445544024455440244454402444444
// 017:5554420044551200415542002455420024544200245442002444420024444200
// 018:0000666600000066000000660000006600000066000000660000006600000066
// 019:6666000066600000666000006660000066600000666000006660000066600000
// 020:0200033300200003000400300004000000040000000400040000404400004444
// 021:4243333044430000444030004440000044400000444000004440000044400000
// 022:0000000003333333030000000033000000330000003314440033414400341441
// 023:2000000033333330200000302000030020000300414443004444430044444300
// 024:0000000000000088000088770008777708877777877777888777777787777777
// 025:8888880077777780777777787777777877887778887777807777778078777800
// 026:0005533500055533000333330003333300055533000553330000333500000355
// 027:5355000053553000335330003333550033355500333333003555300033550000
// 028:0999555599999933990053330005333300053333000553330005533300099533
// 029:5559999039999999335000993350000033500000355000003550000035900000
// 031:0033330003933300033333000333330003333300333330003333300033333000
// 032:0014444400011444000001440000001100000000000000000000000000000000
// 033:2444100024410000241000002100000000000000000000000000000000000000
// 034:0000066600006666000066660000666000006660000022200002222000000000
// 035:6666000066666000666666000006660000066600000222000002222000000000
// 036:0000444400004444000042440000222400000000000000000000000000000000
// 037:2420000024200000242000002242000000000000000000000000000000000000
// 038:0033414400331414000333330000000000000000000000000000000000000000
// 039:4444430041444300333330000000000000000000000000000000000000000000
// 040:8777777787777777087777770088888800033333000003330000000000000000
// 041:7877800077373000787300008330000033300333300033300000000000000000
// 042:0000005500000000000000000000000000000000000000000000000000000000
// 043:3300000000000000000000000000000000000000000000000000000000000000
// 044:0099953309999555999900550990005500000055000005550000055500000050
// 045:3999000059990000009990000009990000009000000000000000000000000000
// 046:0030000330330003333300330333033300033333000333330000333300000000
// 047:3333330033333330333330303333000033330000333000003300000000000000
// 048:0000000000000000000000000aa000000aa000000aa0aaa00a6a333a00a66663
// 049:00000000000000000000000000000000000000000000000000000000a0000000
// 050:0000000000000000000000000000000000000000000144440004444400044544
// 051:0000000000000000000000000000000000000000444440004444100044544000
// 052:0000000000000000000001000000100100001001000001000000010000001001
// 053:0000000000000000100100000010000000100000100100001001000000100000
// 054:000000000000000000000000000000000000000000000000000000000b00000b
// 055:00000000000000000000000000000000000000000000000000000000b00000b0
// 056:0000000500000055000000550000055500000555000055550000555500005555
// 057:5000000055000000550000005550000055500000555500005555000055550000
// 064:0a6666660a6666660a66aa660a6666a60a66666a0a6666660a66666600a66666
// 065:3a00000063a0000066a00000666a0000666a0000a66a0000a66a0000a66a0000
// 066:0004444401144444111445441104445511014444110999991109999900099999
// 067:4444400044444110445441115544401144414011999990119999901199999000
// 068:0000000000000000000009990000992200009999000099990099222209999999
// 069:0000000000000000000000009990000099900000999990009929990099999900
// 070:b5b000b5b5b000b50b00000b0b00b00b0b0bbb0b0bbb5bbb0bb555b50bbb5bb5
// 071:5b000b5b5b000b5bb00000b0b00b00b0b0bbb0b0bbb5bbb05b555bb05bb5bbb0
// 072:0000555500005555000555550005555500055555000511110055433400544394
// 073:5555000055550000555550005555500055555000111150004334550049344500
// 080:00a66666000a66660000a66600000a66000000a60000000a0000000000000000
// 081:a66a000066a0000066a00000666a0000666a0000aa66a00000aa000000000000
// 082:0009999900000110000001100000011000000110000099900000999000000000
// 083:9999900001100000011000000110000001100000099900000999000000000000
// 084:0999999909999999009999990000000000000000000000000000000000000000
// 085:9999900099900000000000000000000000000000000000000000000000000000
// 086:0bbbbbbb00000000000000000000000000000000000000000000000000000000
// 087:bbbbbbb000000000000000000000000000000000000000000000000000000000
// 088:0014433400144441001444110004444400004441000004440008888400888888
// 089:4334410014444100114441004444400014440000444000004888800088888800
// </TILES>

// <SPRITES>
// 003:0000000000000000000000000000000000000000000000000000000000000009
// 009:0000000000000000000000000000000000000000000000000000000000000009
// 017:0000000000000000000000000000000000000000000000000000009900000949
// 018:0000000000000000000000000000000000000009000009999999949449499949
// 019:0000000900000099000099440009444499949444494944449494444449444444
// 020:0000090000099490999444494444444444444444444444444444449944444900
// 021:0000000000000000000000009000000049990000999000000000000000000000
// 023:0000000000000000000000000000000000000000000000000000009900000949
// 024:0000000000000000000000000000000000000009000009999999949449499949
// 025:0000000900000099000099440009444499949444494944449494444449444444
// 026:0000090000099490999444494444444444444444444444444444449944444900
// 027:0000000000000000000000009000000049990000999000000000000000000000
// 033:0000949400009444000944440094444409444444944444449444444409444444
// 034:9494999444494499444999994449999944499999449ccccc449ccccc449c222c
// 035:9444444449444444949444449944444499449944c949c944cc9c9449c222999c
// 036:444444904444444944444444444444444444444499994444dd009999dcd00000
// 037:0000000090000000490000004490000044490000444900009990000000000000
// 039:0000949400009444000944440094444409444444944444449444444409444444
// 040:9494999444494499444999994449999944499999449ccccc449ccccc449c222c
// 041:9444444449444444949444449944444499449944c949c944cc9c9449c222999c
// 042:444444904444444944444444444444444444444499994444dd009999dcd00000
// 043:0000000090000000490000004490000044490000444900009990000000000000
// 049:009944490000999d00003ccd0000dccd000093cd000943dd0094444409444444
// 050:99c2222ccccccccccc33ee3cccc3ee3dcccc33cdccccccdddcddccdddcddccdd
// 051:c2292cccccccccccc3ee33ccd3ee3cccdc33ccccddccccccddccddcdddccddcd
// 052:dccd0000dccd0000dcc30000dccd0000dc390000dd3490004444490044444490
// 055:009944490000999d00003ccd0000dccd000093cd000943dd0094444409444444
// 056:99c2222ccccccccccc33ee3cccc3ee3dcccc33cdccccccdddcddccdddcddccdd
// 057:c2292cccccccccccc3ee33ccd3ee3cccdc33ccccddccccccddccddcdddccddcd
// 058:dccd0000dccd0000dcc30000dccd0000dc390000dd3490004444490044444490
// 064:0000000000000009000000000000000000000000000000000000000000000000
// 065:9444444499994444000094440009444900094490000099000000000000000000
// 066:dccccccc4dcc2ccc49dcc222900dcccc0000ddcc0000dcdd0000dccc2222cccc
// 067:cccccccdccc2ccd4222ccd94ccccd009ccdd0000ddcd0000cccd0000cccc2222
// 068:4444444944449999444900009444900009449000009900000000000000000000
// 069:0000000090000000000000000000000000000000000000000000000000000000
// 070:0000000000000009000000000000000000000000000000000000000000000000
// 071:9444444499994444000094440009444900094490000099000000000000000000
// 072:dccccccc4dccc22249dccc22900dccc20000ddcc0000dcdd0000dccc2222cccc
// 073:cccccccd222cccd422cccd942cccd009ccdd0000ddcd0000cccd0000cccc2222
// 074:4444444944449999444900009444900009449000009900000000000000000000
// 075:0000000090000000000000000000000000000000000000000000000000000000
// 080:0000000000000000000000020000002100000211000021110000211100021111
// 081:0000222222221111111111111111111111111111111111111111111111211111
// 082:1112cccc11112ccc111112221111111111111111111111111111111111111111
// 083:cccc2111ccc21111222111111111111111111111111111111111111111111111
// 084:2222000011112222111111111111111111111111111111111111111111111211
// 085:0000000000000000200000001200000011200000111200001112000011112000
// 086:0000000000000000000000020000002100000211000021110000211100021111
// 087:0000222222221111111111111111111111111111111111111111111111211111
// 088:1112cccc11112ccc111112221111111111111111111111111111111111111111
// 089:cccc2111ccc21111222111111111111111111111111111111111111111111111
// 090:2222000011112222111111111111111111111111111111111111111111111211
// 091:0000000000000000200000001200000011200000111200001112000011112000
// 099:0000000000000000000000000000000000000000000000000000000000000009
// 105:0000000000000000000000000000000000000000000000000000000000000009
// 113:0000000000000000000000000000000000000000000000000000009900000949
// 114:0000000000000000000000000000000000000009000009999999949449499949
// 115:0000000900000099000099440009444499949444494944449494444449444444
// 116:0000090000099490999444494444444444444444444444444444449944444900
// 117:0000000000000000000000009000000049990000999000000000000000000000
// 119:0000000000000000000000000000000000000000000000000000009900000949
// 120:0000000000000000000000000000000000000009000009999999949449499949
// 121:0000000900000099000099440009444499949444494944449494444449444444
// 122:0000090000099490999444494444444444444444444444444444449944444900
// 123:0000000000000000000000009000000049990000999000000000000000000000
// 129:0000949400009444000944440094444409444444944444449444444409444444
// 130:9494999444494499444999994449999944499999449ccccc449ccccc449c222c
// 131:9444444449444444949444449944444499449944c949c944cc9c9449c222999c
// 132:444444904444444944444444444444444444444499994444dd009999dcd00000
// 133:0000000090000000490000004490000044490000444900009990000000000000
// 135:0000949400009444000944440094444409444444944444449444444409444444
// 136:9494999444494499444999994449999944499999449ccccc449ccccc449c222c
// 137:9444444449444444949444449944444499449944c949c944cc9c9449c222999c
// 138:444444904444444944444444444444444444444499994444dd009999dcd00000
// 139:0000000090000000490000004490000044490000444900009990000000000000
// 145:009944490000999d00003ccd0000dccd000093cd000943dd0094444409444444
// 146:99c2222cccccccccccc2222ccc2ccc2dcccccccdccccccdddcddccdddcddccdd
// 147:c2292cccccccccccc2222cccd2ccc2ccdcccccccddccccccddccddcdddccddcd
// 148:dccd0000dccd0000dcc30000dccd0000dc390000dd3490004444490044444490
// 151:009944490000999d00003ccd0000dccd000093cd000943dd0094444409444444
// 152:99c2222cccccccccccc2222ccc2ccc2dcccccccdccccccdddcddccdddcddccdd
// 153:c2292cccccccccccc2222cccd2ccc2ccdcccccccddccccccddccddcdddccddcd
// 154:dccd0000dccd0000dcc30000dccd0000dc390000dd3490004444490044444490
// 160:0000000000000009000000000000000000000000000000000000000000000000
// 161:9444444499994444000094440009444900094490000099000000000000000000
// 162:dccccccc4dcc2ccc49dcc222900dcccc0000ddcc0000dcdd0000dccc2222cccc
// 163:cccccccdccc2ccd4222ccd94ccccd009ccdd0000ddcd0000cccd0000cccc2222
// 164:4444444944449999444900009444900009449000009900000000000000000000
// 165:0000000090000000000000000000000000000000000000000000000000000000
// 166:0000000000000009000000000000000000000000000000000000000000000000
// 167:9444444499994444000094440009444900094490000099000000000000000000
// 168:dccccccc4dccc22249dccc22900dccc20000ddcc0000dcdd0000dccc2222cccc
// 169:cccccccd222cccd422cccd942cccd009ccdd0000ddcd0000cccd0000cccc2222
// 170:4444444944449999444900009444900009449000009900000000000000000000
// 171:0000000090000000000000000000000000000000000000000000000000000000
// 176:0000000000000000000000020000002100000211000021110000211100021111
// 177:0000222222221111111111111111111111111111111111111111111111211111
// 178:1112cccc11112ccc111112221111111111111111111111111111111111111111
// 179:cccc2111ccc21111222111111111111111111111111111111111111111111111
// 180:2222000011112222111111111111111111111111111111111111111111111211
// 181:0000000000000000200000001200000011200000111200001112000011112000
// 182:0000000000000000000000020000002100000211000021110000211100021111
// 183:0000222222221111111111111111111111111111111111111111111111211111
// 184:1112cccc11112ccc111112221111111111111111111111111111111111111111
// 185:cccc2111ccc21111222111111111111111111111111111111111111111111111
// 186:2222000011112222111111111111111111111111111111111111111111111211
// 187:0000000000000000200000001200000011200000111200001112000011112000
// </SPRITES>

// <WAVES>
// 000:00000000ffffffff00000000ffffffff
// 001:0123456789abcdeffedcba9876543210
// 002:0123456789abcdef0123456789abcdef
// </WAVES>

// <SFX>
// 000:0101010201020103010401050106010701070107f100f100f100f100f100f100f100f100f100f100f100f100f100f100f100f100f100f100f100f100c29000000000
// 001:0100010f010e010d010c010b010a010901080100f100f100f100f100f100f100f100f100f100f100f100f100f100f100f100f100f100f100f100f100c29000000000
// 002:001000100020006000a000d0f040f080f080f010f030f050f070f090f0a0f010f000f000f000f000f000f000f000f000f000f000f000f000f000f000c7b000000000
// </SFX>

// <TRACKS>
// 000:100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// </TRACKS>

// <PALETTE>
// 000:1a1c2cda652cc24c20f4f4f4ffcd75f3060504b9232ca5da126f96af7753047623f4ff00f4cfb5e7a1828ea879333c57
// </PALETTE>

