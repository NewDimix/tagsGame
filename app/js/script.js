try {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	window.audioContext = new window.AudioContext();
} catch (e) {
	console.log("No Web Audio API support");
}

const WebAudioAPISoundManager = function (context) {
	this.context = context;
	this.bufferList = {};
	this.playingSounds = {};
};

WebAudioAPISoundManager.prototype = {
	addSound: function (url) {
		// Load buffer asynchronously
		var request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.responseType = "arraybuffer";

		var self = this;

		request.onload = function () {
			// Asynchronously decode the
			// audio file data in request.response
			self.context.decodeAudioData(
				request.response,

				function (buffer) {
					if (!buffer) {
						console.log("error decoding file data: " + url);
						return;
					}
					self.bufferList[url] = buffer;
				}
			);
		};

		request.onerror = function () {
			console.log("BufferLoader: XHR error");
		};

		request.send();
	},

	stopSoundWithUrl: function (url) {
		if (this.playingSounds.hasOwnProperty(url)) {
			for (var i in this.playingSounds[url]) {
				if (this.playingSounds[url].hasOwnProperty(i)) {
					this.playingSounds[url][i].stop();
				}
			}
		}
	},
};

const WebAudioAPISound = function (url) {
	this.url = url + ".mp3";
	window.webAudioAPISoundManager = window.webAudioAPISoundManager || new WebAudioAPISoundManager(window.audioContext);
	this.manager = window.webAudioAPISoundManager;
	this.manager.addSound(this.url);
};

WebAudioAPISound.prototype = {
	play: function (options) {
		var buffer = this.manager.bufferList[this.url];

		this.settings = {
			loop: false,
			volume: 0.5,
		};

		for (var i in options) {
			if (options.hasOwnProperty(i)) {
				this.settings[i] = options[i];
			}
		}

		//Only play if it's loaded yet
		if (typeof buffer !== "undefined") {
			var source = this.makeSource(buffer);
			source.loop = this.settings.loop;
			source.start(0);

			if (!this.manager.playingSounds.hasOwnProperty(this.url)) {
				this.manager.playingSounds[this.url] = [];
			}
			this.manager.playingSounds[this.url].push(source);
		}
	},

	stop: function () {
		this.manager.stopSoundWithUrl(this.url);
	},

	makeSource: function (buffer) {
		var source = this.manager.context.createBufferSource();
		var gainNode = this.manager.context.createGain();
		gainNode.gain.value = this.settings.volume;
		source.buffer = buffer;
		source.connect(gainNode);
		gainNode.connect(this.manager.context.destination);
		return source;
	},
};

const moveSound = new WebAudioAPISound("sounds/move");
const coinSound = new WebAudioAPISound("sounds/coin");
const startFieldSound = new WebAudioAPISound("sounds/startField");
const winSound = new WebAudioAPISound("sounds/win");
const clickMeSound = new WebAudioAPISound("sounds/clickMe");
const btnClickSound = new WebAudioAPISound("sounds/btnClick");
const settingsClick = new WebAudioAPISound("sounds/settingsClick");
const tikTak = new WebAudioAPISound("sounds/tikTak");
const swosh = new WebAudioAPISound("sounds/swosh");
const swoshTimer = new WebAudioAPISound("sounds/swoshTimer");
const timerTik = new WebAudioAPISound("sounds/timerTik");
const timerEnd = new WebAudioAPISound("sounds/timerEnd");
const swoshFlip = new WebAudioAPISound("sounds/swoshFlip");
const titleStart = new WebAudioAPISound("sounds/title1");
const titleEnd = new WebAudioAPISound("sounds/title2");

// titleStart.play({
//     volume: 0.15
// });

window.onload = function () {
	const preloader = document.getElementById("preloader");

	preloader.classList.add("preloader_hide");
	setTimeout(function () {
		preloader.classList.add("preloader_hidden");
	}, 990);

	game.elements.settingsForm.style.display = "none";
};

document.getElementById("startPageBtn").onclick = function () {
	document.getElementById("startPageBtn").setAttribute("disabled", true);
	game.elements.startPage.classList.add("startPage_hide");

	setTimeout(function () {
		game.elements.startPage.classList.add("startPage_hidden");

		game.elements.header.classList.remove("header_startPosition");
		game.elements.field.classList.remove("field_startPosition");

		game.elements.title.classList.add("title_startAnimation");

		setTimeout(function () {
			titleStart.play({
				volume: 0.075,
			});
		}, 1000);

		setTimeout(function () {
			titleEnd.play({
				volume: 0.15,
			});
		}, 2850);

		setTimeout(function () {
			swosh.play({
				volume: 0.1,
			});
		}, 4250);

		setTimeout(function () {
			game.timerStart.stop();
			game.timerStart.reset();
			game.timerStart.start();
		}, 5000);

		setTimeout(function () {
			game.elements.field.classList.add("field_defaultPosition");
		}, 5750);
	}, 490);
};

const game = {
	states: {
		canBeMoved: false,
		win: false,
		progress: 0,
		animation3D: true,
		animationForFocus3D: false,
	},
	settings: {
		sensitivity3D: 25,
		speed3D: 2,
	},
	elements: {
		startPage: document.getElementById("startPage"),
		startPageBtn: document.getElementById("startPageBtn"),
		title: document.getElementById("title"),
		header: document.getElementById("header"),
		field: document.getElementById("field"),
		fieldCube: document.getElementById("fieldCube"),
		progress: document.getElementById("progress"),
		startBtn: document.getElementById("start"),
		settingsBtn: document.getElementById("settings"),
		settingsForm: document.getElementById("settingsForm"),
		sensitivity3DRange: document.getElementById("sensitivity3D"),
		speed3DRange: document.getElementById("speed3D"),
		animationForFocusFieldset3D: document.getElementById("3DanimationForFocusFieldset"),
		sensitivity3DFieldset: document.getElementById("sensitivity3DFieldset"),
		speed3DFieldset: document.getElementById("speed3DFieldset"),
		disableElements: [document.getElementById("3DanimationForFocusFieldset"), document.getElementById("sensitivity3DFieldset"), document.getElementById("speed3DFieldset")],
	},
	timer: {
		el: document.getElementById("timer"),
		time: 0,
		set: 0,
		start: function () {
			game.timer.set = setInterval(function () {
				game.timer.tik();
				game.timer.draw();
			}, 1000);
		},
		tik: function () {
			game.timer.time++;
		},
		draw: function () {
			let seconds = "0" + (game.timer.time % 60);
			let minutes = "0" + Math.floor(game.timer.time / 60);

			game.timer.el.textContent = minutes.slice(-2) + ":" + seconds.slice(-2);
		},
		stop: function () {
			clearInterval(game.timer.set);
		},
		reset: function () {
			game.timer.time = 0;
			game.timer.el.textContent = "00:00";
		},
	},
	timerStart: {
		el: document.getElementById("timerStart"),
		elBlur: document.getElementById("blur"),
		elParts: document.getElementsByClassName("timerStart__part"),
		drawNumber: function (number) {
			for (let i = 0; i < game.timerStart.elParts.length; i++) {
				game.timerStart.elParts[i].classList.remove("timerStart__part_active");
			}

			let arrayParts;

			if (number == 3) {
				arrayParts = [1, 3, 5, 6, 7];
			} else if (number == 2) {
				arrayParts = [1, 3, 4, 6, 7];
			} else if (number == 1) {
				arrayParts = [3, 5];
			} else if (number == 0) {
				arrayParts = [1, 2, 3, 4, 5, 6];
			}

			for (let i = 0; i < arrayParts.length; i++) {
				game.timerStart.elParts[arrayParts[i] - 1].classList.add("timerStart__part_active");
			}
		},
		time: 3,
		set: 0,
		randomTextSet: 0,
		start: function () {
			game.elements.header.classList.remove("header_win");

			game.randomize(2000);

			game.states.canBeMoved = false;

			setTimeout(function () {
				game.classUpdate();
			}, 200);

			randomTextSet = setInterval(function () {
				for (let i = 0; i < game.cells.td.length; i++) {
					let number = getRandomInt(0, 16);
					game.cells.td[i].querySelector(".cell__sideNumber").textContent = number;
					game.cells.td[i].querySelector(".cell__number").textContent = number;
				}
			}, 200);

			game.timer.stop();
			game.timer.reset();

			if (game.cells.cubes[0].classList.contains("cell__cube_3D")) {
				for (let i = 0; i < game.cells.cubes.length; i++) {
					game.cells.cubes[i].classList.remove("cell__cube_3D");
				}
			}

			if (game.elements.fieldCube.hasAttribute("style")) {
				game.elements.fieldCube.style.transition = "transform 1s linear";
				game.elements.fieldCube.style.transform = `rotatey(${-degSettings}deg) rotatex(0deg)`;
			}
			game.elements.field.style.transition = "transform 3s linear";
			game.elements.field.style.transform = `scale(0.95)`;

			document.body.removeEventListener("mousemove", mouseRotate);
			game.elements.startBtn.setAttribute("disabled", true);
			game.elements.settingsBtn.setAttribute("disabled", true);
			clearInterval(floatingSet);

			game.timerStart.el.classList.add("timerStart_visible");
			game.timerStart.el.classList.add("timerStart_front");

			swoshTimer.play({
				volume: 0.1,
			});

			game.timerStart.elBlur.classList.add("blur_visible");

			game.timerStart.set = setInterval(function () {
				game.timerStart.tik();
				game.timerStart.draw();
			}, 1000);
		},
		tik: function () {
			game.timerStart.time--;
		},
		draw: function () {
			game.timerStart.drawNumber(game.timerStart.time);
			tikTak.play({
				volume: 0.8,
			});

			if (game.timerStart.time != 0) {
				timerTik.play({
					volume: 0.1,
				});
			} else {
				timerEnd.play({
					volume: 0.1,
				});
			}

			if (game.timerStart.time == 0) {
				game.elements.fieldCube.style.transition = "transform " + 0.5 + "s ease-in";
				game.elements.field.style.transition = "transform 2s ease";

				game.elements.fieldCube.style.transform = `rotatey(${-degSettings}deg) rotatex(0deg)`;
				game.elements.field.style.transform = `scale(1)`;
			}

			if (game.timerStart.time == 0) {
				swoshTimer.play({
					volume: 0.1,
				});

				game.timerStart.stop();
				game.timerStart.el.classList.remove("timerStart_front");
				game.timerStart.el.classList.add("timerStart_back");

				game.timerStart.elBlur.classList.remove("blur_visible");

				clearInterval(randomTextSet);

				resetAnimation(game.elements.field, "field_glow");
				game.elements.field.classList.add("field_glow");

				game.draw();
				game.classUpdate();

				game.states.win = false;
				game.states.canBeMoved = true;

				setTimeout(function () {
					game.timerStart.el.classList.remove("timerStart_visible");
					game.timerStart.el.classList.remove("timerStart_back");

					game.elements.startBtn.removeAttribute("disabled");
					game.elements.settingsBtn.removeAttribute("disabled");
					game.start();
					document.body.addEventListener("mousemove", mouseRotate);
				}, 500);
			}
		},
		stop: function () {
			clearInterval(game.timerStart.set);
		},
		reset: function () {
			game.timerStart.time = 3;
			game.timerStart.drawNumber(game.timerStart.time);
		},
	},
	field: {
		width: 4,
		height: 4,
		numberOfCells: 16,
	},
	cells: {
		td: document.getElementsByClassName("cell"),
		cubes: document.getElementsByClassName("cell__cube"),
		sides: document.getElementsByClassName("cell__side"),
		originalRanking: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, null],
		ranking: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, null],
		borders: {
			top: [0, 1, 2, 3],
			right: [3, 7, 11, 15],
			bottom: [12, 13, 14, 15],
			left: [0, 4, 8, 12],
		},
		directions: {
			top: [11, 7, 3],
			right: [],
			bottom: [],
			left: [14, 13, 12],
		},
		newBorder: function () {
			game.cells.borders.top.length = 0;
			game.cells.borders.right.length = 0;
			game.cells.borders.bottom.length = 0;
			game.cells.borders.left.length = 0;

			for (let i = 0; i < game.field.numberOfCells; i++) {
				if (i == 0) {
					game.cells.borders.left.push(i);
					game.cells.borders.right.push(i + game.field.width - 1);
				}

				if (i < game.field.width) {
					game.cells.borders.top.push(i);
				}

				if (i != 0 && i % game.field.width == 0) {
					game.cells.borders.left.push(i);
					game.cells.borders.right.push(i + game.field.width - 1);
				}

				if (i >= game.field.numberOfCells - game.field.width) {
					game.cells.borders.bottom.push(i);
				}
			}
		},
		newDirection: function () {
			let nullIndex = game.cells.ranking.indexOf(null);
			let end;
			let newCell;

			for (let key in game.cells.directions) {
				game.cells.directions[key].length = 0;
				end = false;
				newCell = nullIndex;
				while (end == false) {
					if (game.cells.borders[key].includes(nullIndex)) {
						end = true;
					} else {
						newCell = newCell - game.getStep(key);
						game.cells.directions[key].push(newCell);
						if (game.cells.borders[key].includes(newCell)) {
							end = true;
						}
					}
				}
			}
		},
	},
	start: function () {
		game.timer.start();
	},
	reset: function () {
		game.cells.ranking = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, null];
		game.timer.stop();
		game.timer.reset();

		game.draw();
		game.cells.newDirection();
		game.classUpdate();
	},
	moving: function (i, animated) {
		let move = game.checkMove(i);

		if (!move) {
			return;
		}

		let array = game.getArrayCells(i, move);

		if (animated) {
			moveSound.play({
				volume: 0.15,
			});
			game.states.canBeMoved = false;
			for (let i = 0; i < array.length; i++) {
				game.cells.td[game.cells.ranking.indexOf(array[i])].style.transition = "all .1s linear";
				game.cells.td[game.cells.ranking.indexOf(array[i])].classList.add("cell_" + move);

				if (game.cells.ranking.indexOf(array[i]) + game.getStep(move) + 1 == array[i]) {
					game.cells.td[game.cells.ranking.indexOf(array[i])].classList.add("cell_coincidence");
					coinSound.play({
						volume: 0.1,
					});
				} else {
					game.cells.td[game.cells.ranking.indexOf(array[i])].classList.remove("cell_coincidence");
				}
			}
		}

		let indicesArray = [];
		for (let i = 0; i < array.length; i++) {
			indicesArray.push(game.cells.ranking.indexOf(array[i]));
		}

		for (let i = 0; i < array.length; i++) {
			game.cells.ranking[indicesArray[i] + game.getStep(move)] = array[i];
		}
		game.cells.ranking[indicesArray[0]] = null;

		game.states.progress = game.states.progress + indicesArray.length;
		game.elements.progress.textContent = game.states.progress;
	},
	draw: function () {
		for (let i = 0; i < game.cells.td.length; i++) {
			game.cells.td[i].querySelector(".cell__sideNumber").textContent = game.cells.ranking[i];
			game.cells.td[i].querySelector(".cell__number").textContent = game.cells.ranking[i];
		}
	},
	checkMove: function (tdIndex) {
		for (let key in game.cells.directions) {
			if (game.cells.directions[key].includes(tdIndex)) {
				return key;
			}
		}
		return false;
	},
	getArrayCells: function (tdIndex, direction) {
		let step = 0;
		let arrayMove = [];

		for (let step = game.getStep(direction); game.cells.ranking[tdIndex] != null; tdIndex = tdIndex + step) {
			arrayMove.push(game.cells.ranking[tdIndex]);
		}
		return arrayMove;
	},
	getStep: function (direction) {
		if (direction == "top") {
			return game.field.width;
		} else if (direction == "right") {
			return -1;
		} else if (direction == "bottom") {
			return -game.field.width;
		} else if (direction == "left") {
			return 1;
		}
	},
	classUpdate: function () {
		for (let i = 0; i < game.cells.ranking.length; i++) {
			game.cells.td[i].classList.remove("cell_null", "cell_coincidence");

			if (game.cells.ranking[i] == i + 1) {
				game.cells.td[i].classList.add("cell_coincidence");
			} else if (game.cells.ranking[i] === null) {
				game.cells.td[i].classList.add("cell_null");
			}
		}
	},
	randomize: function (n) {
		for (let i = 0; i < n; i++) {
			game.moving(game.getRandom(), false);
			game.cells.newDirection();

			if (i == n - 1) {
				if (game.cells.ranking[game.cells.ranking.length - 1] != null || equalArrays(game.cells.originalRanking, game.cells.ranking) != 1) {
					i--;
				}
			}
		}

		game.states.progress = 0;
		game.elements.progress.textContent = game.states.progress;
	},
	getRandom: function () {
		let validСells = game.cells.directions.top.concat(game.cells.directions.right, game.cells.directions.bottom, game.cells.directions.left);

		let rand = Math.floor(Math.random() * validСells.length);
		return validСells[rand];
	},
	checkWin: function () {
		if (equalArrays(game.cells.originalRanking, game.cells.ranking) == game.cells.originalRanking.length) {
			game.states.win = true;
			game.timer.stop();
			return true;
		}
		return false;
	},
	flip: function () {
		swoshFlip.play({
			volume: 0.125,
		});

		let minflipTime = 0.8;
		let maxflipTime = 1.15;
		let rangeflipTime = maxflipTime - minflipTime;

		let flipTime = (Number(game.settings.speed3D) / Number(game.elements.speed3DRange.getAttribute("max"))) * rangeflipTime + minflipTime;

		game.elements.startBtn.setAttribute("disabled", true);
		game.elements.settingsBtn.setAttribute("disabled", true);

		clearInterval(floatingSet);

		document.body.removeEventListener("mousemove", mouseRotate);
		setTimeout(function () {
			document.body.addEventListener("mousemove", mouseRotate);
			game.elements.startBtn.removeAttribute("disabled");
			game.elements.settingsBtn.removeAttribute("disabled");

			if (!settingsEnabled) {
				game.elements.settingsForm.style.display = "none";
				game.elements.fieldCube.classList.remove("settingsRotate");
			} else {
				game.elements.fieldCube.classList.add("settingsRotate");
			}
		}, flipTime * 1000);

		degSettings = degSettings + 180;

		game.elements.fieldCube.style.transition = "transform " + flipTime + "s cubic-bezier(0.450, 0.180, 0.100, 1.385)";

		game.elements.fieldCube.style.transform = `rotatey(${-degSettings}deg) rotatex(0deg)`;
	},
	floating: function (el, x, y, sensitivity) {
		let xDeg = x + getRandomInt(-sensitivity, sensitivity);
		let yDeg = y + getRandomInt(-sensitivity, sensitivity);
		el.style.transform = `rotatey(${yDeg - degSettings}deg) rotatex(${xDeg}deg)`;
	},
	disableElementsFunc: function (array, action) {
		for (let i = 0; i < array.length; i++) {
			if (action == "remove") {
				array[i].classList.remove("settings__fieldset_disable");
				array[i].removeAttribute("disabled");
			} else if (action == "add") {
				array[i].classList.add("settings__fieldset_disable");
				array[i].setAttribute("disabled", "disabled");
			}
		}
	},
	getNumberTarget: function () {
		let cellTarget;

		if (!event.target.classList.contains("cell__sideNumber") && !event.target.classList.contains("cell__number")) {
			return;
		} else if (event.target.classList.contains("cell__sideNumber")) {
			cellTarget = event.target.parentNode.parentNode.parentNode;
		} else if (event.target.classList.contains("cell__number")) {
			cellTarget = event.target.parentNode;
		}

		return Array.prototype.indexOf.call(game.cells.td, cellTarget);
	},
	clickTarget: function (numberTarget) {
		if (!isNaN(parseFloat(numberTarget))) {
			if (game.states.win) {
				event.preventDefault();

				resetAnimation(game.elements.startBtn, "btn_clickMe");
				game.elements.startBtn.classList.add("btn_clickMe");
				clickMeSound.play({
					volume: 0.1,
				});
				return;
			} else if (game.checkMove(numberTarget) && game.states.canBeMoved) {
				game.moving(numberTarget, true);
			}
		}
	},
	transitionendTarget: function (numberTarget) {
		if (!isNaN(parseFloat(numberTarget))) {
			game.cells.td[numberTarget].style.transition = "none";
			game.cells.td[numberTarget].classList.remove("cell_top", "cell_right", "cell_bottom", "cell_left");

			game.draw();
			game.cells.newDirection();
			game.classUpdate();

			game.states.canBeMoved = true;

			if (game.checkWin()) {
				game.elements.field.classList.add("field_win");
				winSound.play({
					volume: 0.3,
				});
				game.elements.header.classList.add("header_win");
			}
		}
	},
	updateTable: function (number) {
		let table = document.getElementsByClassName("table");
		let tableRows = document.getElementsByClassName("table__row");
		let rowCells = tableRows[0].getElementsByClassName("table__cell");

		if (number == tableRows.length) {
			return;
		} else if (number > tableRows.length) {
			let newRows = number - tableRows.length;
			for (let i = 0; i < newRows; i++) {
				table[0].appendChild(tableRows[0].cloneNode(true));
			}

			let cellsOld = rowCells.length;

			for (let i = 0; i < tableRows.length; i++) {
				for (let y = 0; y < number - cellsOld; y++) {
					tableRows[i].appendChild(rowCells[0].cloneNode(true));
				}
			}
		} else if (number < tableRows.length) {
			let newRows = tableRows.length - number;
			for (let i = 0; i < newRows; i++) {
				table[0].removeChild(tableRows[tableRows.length - 1]);
			}

			let cellsOld = rowCells.length;

			for (let i = 0; i < tableRows.length; i++) {
				for (let y = 0; y < cellsOld - number; y++) {
					let removeCell = tableRows[i].getElementsByClassName("table__cell");
					tableRows[i].removeChild(removeCell[removeCell.length - 1]);
				}
			}
		}

		game.field.width = number;
		game.field.height = number;
		game.field.numberOfCells = number * number;

		game.cells.originalRanking.length = 0;
		game.cells.ranking.length = 0;

		for (let i = 0; i < number * number; i++) {
			if (number * number - 1 != i) {
				game.cells.originalRanking.push(i + 1);
				game.cells.ranking.push(i + 1);
			} else {
				game.cells.originalRanking.push(null);
				game.cells.ranking.push(null);
			}
		}

		game.cells.newBorder();
		game.cells.newDirection();

		// game.randomize(2000);
		game.draw();
		game.classUpdate();

		game.timer.stop();
		game.timer.reset();

		game.states.progress = 0;
		game.elements.progress.textContent = game.states.progress;

		game.elements.header.classList.remove("header_win");

		game.states.win = true;
	},
};

game.elements.settingsForm.addEventListener("change", function () {
	settingsClick.play({
		volume: 0.3,
	});

	let table = document.getElementsByClassName("table");
	let fieldSize = Number(document.querySelector('input[name="fieldSize"]:checked').value);
	game.updateTable(fieldSize);
	table[0].classList.remove("table_4", "table_5", "table_6");
	table[0].classList.add("table_" + fieldSize);

	let theme = document.querySelector('input[name="theme"]:not(:checked)').value;
	let newTheme = document.querySelector('input[name="theme"]:checked').value;
	document.body.classList.remove(theme);
	document.body.classList.add(newTheme);

	let animation3D = document.querySelector('input[name="3Danimation"]:checked').value;
	game.states.animation3D = animation3D === "true";
	let removeOrAdd = game.states.animation3D ? "remove" : "add";
	game.disableElementsFunc(game.elements.disableElements, removeOrAdd);

	let animation3DFocus = document.querySelector('input[name="3DanimationForFocus"]:checked').value;
	game.states.animationForFocus3D = animation3DFocus === "true";

	game.settings.sensitivity3D = Number(game.elements.sensitivity3DRange.getAttribute("max")) + Number(game.elements.sensitivity3DRange.getAttribute("min")) - game.elements.sensitivity3DRange.value;

	game.settings.speed3D = Number(game.elements.speed3DRange.getAttribute("max")) + Number(game.elements.speed3DRange.getAttribute("min")) - game.elements.speed3DRange.value;
});

for (let i = 0; i < game.cells.cubes.length; i++) {
	game.cells.cubes[i].addEventListener("transitionend", function () {
		event.stopPropagation();
	});
}

game.elements.fieldCube.addEventListener("mousedown", function () {
	game.clickTarget(game.getNumberTarget());
});

game.elements.fieldCube.addEventListener("touchstart", function () {
	game.clickTarget(game.getNumberTarget());
});

game.elements.fieldCube.addEventListener("transitionend", function () {
	if (event.target.classList.contains("cell")) {
		game.transitionendTarget(Array.prototype.indexOf.call(game.cells.td, event.target));
	}
});

function equalArrays(a, b) {
	let coincidences = 0;

	for (let i = 0; i < a.length; i++) {
		if (a[i] == b[i]) {
			coincidences++;
		}
	}

	return coincidences;
}

function resetAnimation(el, className) {
	el.classList.remove(className);
	el.style.animation = "none";
	el.offsetHeight; /* trigger reflow */
	el.style.animation = null;
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}

//game.randomize(5000);
game.draw();
//game.classUpdate();

game.elements.startBtn.onclick = function () {
	btnClickSound.play({
		volume: 0.15,
	});
	resetAnimation(game.elements.startBtn, "btn_clickMe");
	game.elements.field.classList.remove("field_win");

	if (settingsEnabled) {
		let minflipTime = 0.8;
		let maxflipTime = 1.15;
		let rangeflipTime = maxflipTime - minflipTime;

		let flipTime = (Number(game.settings.speed3D) / Number(game.elements.speed3DRange.getAttribute("max"))) * rangeflipTime + minflipTime;

		settingsEnabled = false;
		plusOrMinus = -1;

		game.flip();

		setTimeout(function () {
			game.timerStart.stop();
			game.timerStart.reset();
			game.timerStart.start();
		}, flipTime * 1000);
	} else {
		game.timerStart.stop();
		game.timerStart.reset();
		game.timerStart.start();
	}
};

let degSettings = 0;
let plusOrMinus = -1;
let settingsEnabled = false;
game.elements.settingsBtn.onclick = function () {
	btnClickSound.play({
		volume: 0.15,
	});
	if (settingsEnabled) {
		settingsEnabled = false;
		plusOrMinus = -1;

		if (!game.states.win) {
			game.timer.start();
		}
	} else {
		game.elements.settingsForm.style.display = "";

		settingsEnabled = true;
		plusOrMinus = 1;

		if (!game.states.win) {
			game.timer.stop();
		}
	}

	game.flip();
};

document.body.addEventListener("keydown", function (event) {
	if (game.states.win || !game.states.canBeMoved || settingsEnabled) {
		return;
	}

	if (event.code == "KeyW" || event.code == "ArrowUp") {
		game.moving(game.cells.directions.bottom[0], true);
	} else if (event.code == "KeyD" || event.code == "ArrowRight") {
		game.moving(game.cells.directions.left[0], true);
	} else if (event.code == "KeyS" || event.code == "ArrowDown") {
		game.moving(game.cells.directions.top[0], true);
	} else if (event.code == "KeyA" || event.code == "ArrowLeft") {
		game.moving(game.cells.directions.right[0], true);
	}
});

let userTouch = false;
document.body.addEventListener("touchstart", function () {
	userTouch = true;
});

let floatingSet;
let count = 0;

function mouseRotate(ev) {
	count++;

	if (!userTouch) {
		if (count % 10 != 0) {
			return;
		}
	}

	let timingFunc;

	//    sound.play({
	//        volume: 0.2
	//    });

	if (game.settings.speed3D < 0.5) {
		timingFunc = "linear";
	} else {
		timingFunc = "cubic-bezier(0.225, 0.540, 0.235, 0.900)";
	}

	if (game.settings.speed3D <= 0.3) {
		game.settings.speed3D = 0.3;
	}

	game.elements.fieldCube.style.transition = "transform " + game.settings.speed3D + "s " + timingFunc;

	let field = game.elements.fieldCube.getBoundingClientRect();
	let x = ev.clientX - field.left;
	let y = ev.clientY - field.top;

	if ((ev.clientX > field.left && ev.clientX < field.right && ev.clientY > field.top && ev.clientY < field.bottom && !game.states.animationForFocus3D) || !game.states.animation3D) {
		clearInterval(floatingSet);

		timingFunc = "linear";

		game.elements.fieldCube.style.transition = "transform " + 0.4 + "s " + timingFunc;

		game.elements.fieldCube.style.transform = `rotatey(${-degSettings}deg) rotatex(0deg)`;

		if (game.cells.cubes[0].classList.contains("cell__cube_3D")) {
			for (let i = 0; i < game.cells.cubes.length; i++) {
				game.cells.cubes[i].classList.remove("cell__cube_3D");
			}
		}
	} else {
		clearInterval(floatingSet);

		let yDeg = Math.round((x - game.elements.fieldCube.offsetWidth / 2) / game.settings.sensitivity3D);
		let xDeg = Math.round(((y - game.elements.fieldCube.offsetHeight / 2) / game.settings.sensitivity3D) * +plusOrMinus);

		game.elements.fieldCube.style.transform = `rotatey(${yDeg - degSettings}deg) rotatex(${xDeg}deg)`;

		if (!game.cells.cubes[0].classList.contains("cell__cube_3D")) {
			for (let i = 0; i < game.cells.cubes.length; i++) {
				game.cells.cubes[i].classList.add("cell__cube_3D");
			}
		}

		floatingSet = setTimeout(function () {
			timingFunc = "linear";
			game.elements.fieldCube.style.transition = "transform " + 7 + "s " + timingFunc;
			game.floating(game.elements.fieldCube, xDeg, yDeg, 10);

			floatingSet = setInterval(function () {
				game.floating(game.elements.fieldCube, xDeg, yDeg, 15);
			}, 7000);
		}, game.settings.speed3D * 1000);
	}
}
