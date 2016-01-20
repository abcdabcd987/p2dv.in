Demo = {
	// Variables:
	interval  : 200,
	hideChess : true,
	jsonURL   : undefined,
	playing   : undefined,
	pause     : undefined,
	timeoutID : undefined,

	// DOM:
	board     : undefined,
	floatChess: undefined,
	data      : undefined,
	demoText  : undefined,
	btnNext   : undefined,
	btnPlay   : undefined,
	btnPrev   : undefined,
	spanNext  : undefined,
	spanPlay  : undefined,
	spanPrev  : undefined,

	//Demo Runtime Data
	oldBoard : undefined,
	demoPlayed : false,

	// Functions:
	getBox: function getBox(i, j) {
		return Demo.board.find('#box-' + i + '-' + j);
	},

	drawTable: function drawTable() {
		var table = $('<table id="chess-board">');
		for (var i = 0; i < 4; ++i) {
			var tr = $('<tr id="row-' + i + '">');
			for (var j = 0; j < 8; ++j) {
				var td = $('<td id="box-' + i + '-' + j + '">');
				td.data('row', i);
				td.data('col', j);
				tr.append(td);
			}
			table.append(tr);
		}
		Demo.board.replaceWith(table);
		Demo.board = $('#chess-board');
	},

	putChess: function putChess() {
		for (var i = 0; i < 4; ++i) {
			for (var j = 0; j < 8; ++j) {
				Demo.getBox(i, j).attr('class', 'img-chess img-blank');
			}
		}
	},

	getImg : function getImg(chess) {
		if (chess[0] ===  0) {
			return '';
		}
		if (chess[1] === true && Demo.hideChess === true) {
			return 'img-chess img-blank';
		} else {
			if (chess[0] === -7) {return 'img-chess img-black-7';}
			if (chess[0] === -6) {return 'img-chess img-black-6';}
			if (chess[0] === -5) {return 'img-chess img-black-5';}
			if (chess[0] === -4) {return 'img-chess img-black-4';}
			if (chess[0] === -3) {return 'img-chess img-black-3';}
			if (chess[0] === -2) {return 'img-chess img-black-2';}
			if (chess[0] === -1) {return 'img-chess img-black-1';}
			if (chess[0] ===  7) {return 'img-chess img-red-7';}
			if (chess[0] ===  6) {return 'img-chess img-red-6';}
			if (chess[0] ===  5) {return 'img-chess img-red-5';}
			if (chess[0] ===  4) {return 'img-chess img-red-4';}
			if (chess[0] ===  3) {return 'img-chess img-red-3';}
			if (chess[0] ===  2) {return 'img-chess img-red-2';}
			if (chess[0] ===  1) {return 'img-chess img-red-1';}
		}
	},

	flushBoard : function flushBoard() {
		for (var i = 0; i < 4; ++i) {
			for (var j = 0; j < 8; ++j) {
				var img = Demo.getImg(oldBoard[Demo.playing][i][j]);
				Demo.getBox(i, j).attr('class', img);
			}
		}
	},

	setupInvalidList: function setupInvalidList() {
		var ul = $('#invalid-list');
		if (Demo.data.err[0])
			ul.append('<li class="list-group-item"><strong>AI0 Err:</strong> ' + Demo.data.err[0] + '</li>');
		if (Demo.data.err[1])
			ul.append('<li class="list-group-item"><strong>AI1 Err:</strong> ' + Demo.data.err[1] + '</li>');
		for (var i = 0; i < Demo.data.step.length; ++i) {
		    var step = Demo.data.step[i];
		    if ('err' in step) {
		        var info = step.err || 'Invalid Operation! (No Details)';
		        ul.append('<li class="list-group-item"><strong>[Step ' + (i+1) + ']AI' + (i%2) + '</strong> ' + info + '</li>');
		    }
		}
	},

	getData: function getData() {
		$.getJSON(Demo.jsonURL, function(dt) {
			Demo.data = dt;
			Demo.prepare();
			Demo.setupInvalidList();
			Demo.btnPlay.prop('disabled', false);
			Demo.spanPlay.html('');
			Demo.playing = dt.step.length - 1;
			Demo.isPause = true;
			Demo.spanPlay.attr('class', 'glyphicon glyphicon-play');
			Demo.setControls();
		});
	},

	setControls: function setControls() {
		var i = Demo.playing;
		var step = Demo.data.step;
		if (Demo.isPause) {
			if (i === 0 && i < step.length-1) {
				Demo.btnPrev.prop('disabled', true);
				Demo.btnNext.prop('disabled', false);
			} else if (0 < i && i === step.length-1) {
				Demo.btnPrev.prop('disabled', false);
				Demo.btnNext.prop('disabled', true);
			} else {
				Demo.btnPrev.prop('disabled', false);
				Demo.btnNext.prop('disabled', false);
			}
		} else {
			Demo.btnPrev.prop('disabled', true);
			Demo.btnNext.prop('disabled', true);
		}
		Demo.btnPlay.prop('disabled', false);
	},

	updateText: function updateText() {
		var i = Demo.playing;
		var step = Demo.data.step[i];

		if (i%2 === 0) {
			Demo.demoText.attr('class', 'bg-red');
		} else {
			Demo.demoText.attr('class', 'bg-black');
		}

		if (Demo.playing === -1) {
			Demo.demoText.html('<strong>initial chessboard</strong>');
		}

		if ('err' in step) {
			Demo.demoText.html('<strong>[Step ' + (i+1) + ']AI' + (i % 2) + '</strong> Error: ' + step.err);
			Demo.demoText.attr('class', 'bg-warning');
		} else if (step.posx == step.tox && step.posy == step.toy) {
			Demo.demoText.html('<strong>[Step ' + (i+1) + ']AI' + (i % 2) + '</strong> Flipped (' + step.posx + ',' + step.posy + ')');
		} else {
			Demo.demoText.html('<strong>[Step ' + (i+1) + ']AI' + (i % 2) + '</strong> Moved (' + step.posx + ',' + step.posy + ') to (' + step.tox + ',' + step.toy + ')');
		}
	},

	cloneObject : function cloneObject(objectToBeCloned) {
		// Basis.
		if (!(objectToBeCloned instanceof Object)) {
			return objectToBeCloned;
		}

		var objectClone;

		var Constructor = objectToBeCloned.constructor;
		switch (Constructor) {
			case RegExp:
				objectClone = new Constructor(objectToBeCloned);
				break;
			case Date:
				objectClone = new Constructor(objectToBeCloned.getTime());
				break;
			default:
				objectClone = new Constructor();
		}

		for (var prop in objectToBeCloned) {
			objectClone[prop] = Demo.cloneObject(objectToBeCloned[prop]);
		}
		return objectClone;
	},

	prepare : function prepare() {
		var curBoard = [[],[],[],[]];
		for (var i = 0; i < 4; ++i) {
			for (var j = 0; j < 8; ++j) {
				if (Demo.data["init-board"][i][j].color == 0) {
					curBoard[i].push([Demo.data["init-board"][i][j].kind + 1, true]);
				} else if (Demo.data["init-board"][i][j].color == 1) {
					curBoard[i].push([-(Demo.data["init-board"][i][j].kind + 1), true]);
				}
			}
		}
		oldBoard = [];
		for (var i = 0; i < Demo.data.step.length; ++i) {
			if (!('err' in Demo.data.step[i])) {
				var x = Demo.data.step[i].posx;
				var y = Demo.data.step[i].posy;
				var xx = Demo.data.step[i].tox;
				var yy = Demo.data.step[i].toy;
				if (x == xx && y == yy) {
					curBoard[x][y][1] = false;
				} else {
					curBoard[xx][yy] = Demo.cloneObject(curBoard[x][y]);
					curBoard[x][y] = [0, false];
				}
			}
			oldBoard.push(Demo.cloneObject(curBoard));
		}

		function set_ai_color_span(id, jdom) {
			if (id == 0) jdom.attr('class', 'label label-danger').html('红');
			else jdom.attr('class', 'label bg-black').html('黑');
		}
		set_ai_color_span(Demo.data.id[0], $('#span-ai0-color'));
		set_ai_color_span(Demo.data.id[1], $('#span-ai1-color'));
	},

	moveChess: function moveChess(sx, sy, tx, ty) {
		var source = Demo.getBox(sx, sy);
		var target = Demo.getBox(tx, ty);
		if (sx == tx && sy == ty) {
			target.attr('class', Demo.getImg(oldBoard[Demo.playing][tx][ty]));
			Demo.setControls();
			if (!Demo.isPause) {
				++Demo.playing;
				Demo.timeoutID = setTimeout(Demo.draw, Demo.interval);
			}
		} else {
			Demo.floatChess.attr('class', source.attr('class'));
			Demo.floatChess.offset(source.offset());

			source.attr('class', '');

			Demo.floatChess.animate(target.offset(), Demo.interval, function() {
				target.attr('class', Demo.floatChess.attr('class'));
				Demo.floatChess.addClass('hidden');
				Demo.setControls();
				if (!Demo.isPause) {
					++Demo.playing;
					Demo.timeoutID = setTimeout(Demo.draw, Demo.interval);
				}
			});
		}
	},

	draw: function draw() {
		var i = Demo.playing;
		var step = Demo.data.step[i];

		if (i === Demo.data.step.length) {
			Demo.isPause = true;
			Demo.spanPlay.attr('class', 'glyphicon glyphicon-play');
			return;
		}

		Demo.updateText();

		Demo.moveChess(step.posx, step.posy, step.tox, step.toy);
	},

	drawNext: function drawNext() {

		++Demo.playing;
		var i = Demo.playing;
		var step = Demo.data.step[i];

		if (i === Demo.data.step.length) {
			Demo.isPause = true;
			Demo.spanPlay.attr('class', 'glyphicon glyphicon-play');
			return;
		}

		Demo.moveChess(step.posx, step.posy, step.tox, step.toy);
		Demo.updateText();

	},

	playDemo: function playDemo() {
		Demo.drawTable();
		Demo.putChess();

		Demo.playing = 0;
		Demo.timeoutID = setTimeout(Demo.draw, Demo.interval);
	},

	drawPrev: function drawPrev() {
		Demo.drawTable();
		Demo.putChess();

		Demo.flushBoard();

		Demo.setControls();
		Demo.updateText();
	},

	prevClick: function prevClick(e) {
		e.preventDefault();
		Demo.demoPlayed = true;
		if (Demo.playing > 0) {
			Demo.btnNext.prop('disabled', true);
			Demo.btnPlay.prop('disabled', true);
			Demo.btnPrev.prop('disabled', true);
			--Demo.playing;
			setTimeout(Demo.drawPrev, 0);
		}
		$(this).blur();
		return false;
	},

	playClick: function playClick(e) {
		e.preventDefault();
		Demo.demoPlayed = true;
		if (Demo.isPause) {
			Demo.isPause = false;
			++Demo.playing;
			Demo.spanPlay.attr('class', 'glyphicon glyphicon-pause');
			Demo.btnPrev.attr('disabled', true);
			Demo.btnNext.attr('disabled', true);
			if (Demo.playing >= Demo.data.step.length) {
				Demo.playDemo();
			} else {
				Demo.timeoutID = setTimeout(Demo.draw, Demo.interval);
			}
		} else {
			clearTimeout(Demo.timeoutID);
			--Demo.playing;
			Demo.isPause = true;
			Demo.spanPlay.attr('class', 'glyphicon glyphicon-play');
			Demo.setControls();
		}
		$(this).blur();
		return false;
	},

	nextClick: function nextClick(e) {
		e.preventDefault();
		Demo.demoPlayed = true;
		if (Demo.playing < Demo.data.step.length) {
			Demo.btnNext.prop('disabled', true);
			Demo.btnPlay.prop('disabled', true);
			Demo.btnPrev.prop('disabled', true);
			Demo.drawNext();
		}
		$(this).blur();
		return false;
	},

	bindEvents: function bindEvents() {
		Demo.btnPrev.on('click', Demo.prevClick);
		Demo.btnPlay.on('click', Demo.playClick);
		Demo.btnNext.on('click', Demo.nextClick);

		$("#btn-speed-slow")  .on('click', function(){Demo.interval=500});
		$("#btn-speed-normal").on('click', function(){Demo.interval=200});
		$("#btn-speed-fast")  .on('click', function(){Demo.interval= 50});

		$("#btn-chess-show").on('click', function(){
			Demo.hideChess = false;
			if (Demo.demoPlayed === false) {
				Demo.playing = 0;
				Demo.flushBoard();
				Demo.playing = Demo.data.step.length - 1;
			} else {
				Demo.flushBoard();
			}
		});
		$("#btn-chess-hide").on('click', function(){
			Demo.hideChess =  true;
			if (Demo.demoPlayed === false) {
				console.log("~~~");
				Demo.putChess();
			} else {
				Demo.flushBoard();
			}
		});
	},

	setup: function setup(jsonURL) {
		Demo.jsonURL = jsonURL;

		Demo.board      = $('#chess-board');
		Demo.floatChess = $('#float-chess');

		Demo.board      = $('#chess-board');
		Demo.floatChess = $('#float-chess');
		Demo.demoText   = $("#demo-text");
		Demo.btnPrev    = $('#btn-prev');
		Demo.btnPlay    = $("#btn-play");
		Demo.btnNext    = $('#btn-next');
		Demo.spanPrev   = $('#span-prev');
		Demo.spanPlay   = $('#span-play');
		Demo.spanNext   = $('#span-next');


		Demo.drawTable();
		Demo.putChess();
		Demo.getData();
		Demo.bindEvents();
	}

}
