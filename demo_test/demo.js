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

		// Demo.getBox(0, 0).addClass('img-chess img-red-1');
		// Demo.getBox(0, 1).addClass('img-chess img-red-2');
		// Demo.getBox(0, 2).addClass('img-chess img-red-3');
		// Demo.getBox(0, 3).addClass('img-chess img-red-4');
		// Demo.getBox(0, 4).addClass('img-chess img-red-5');
		// Demo.getBox(0, 5).addClass('img-chess img-red-6');
		// Demo.getBox(0, 6).addClass('img-chess img-red-7');
		// Demo.getBox(0, 7).addClass('img-blank');

		// Demo.getBox(1, 0).addClass('img-chess img-black-1');
		// Demo.getBox(1, 1).addClass('img-chess img-black-2');
		// Demo.getBox(1, 2).addClass('img-chess img-black-3');
		// Demo.getBox(1, 3).addClass('img-chess img-black-4');
		// Demo.getBox(1, 4).addClass('img-chess img-black-5');
		// Demo.getBox(1, 5).addClass('img-chess img-black-6');
		// Demo.getBox(1, 6).addClass('img-chess img-black-7');
		// Demo.getBox(1, 7).addClass('img-blank');

		for (var i = 0; i < 4; ++i) {
			for (var j = 0; j < 8; ++j) {
				Demo.getBox(i, j).addClass('img-blank');
			}
		}
	},

	getImg : function getImg(chess) {
		if (chess[0] ==  0) {
			return '';
		}
		if (chess[1] == true && Demo.hideChess == true) {
			return 'img-blank';
		} else {
			if (chess[0] == -7) {return 'img-chess img-black-7';}
			if (chess[0] == -6) {return 'img-chess img-black-6';}
			if (chess[0] == -5) {return 'img-chess img-black-5';}
			if (chess[0] == -4) {return 'img-chess img-black-4';}
			if (chess[0] == -3) {return 'img-chess img-black-3';}
			if (chess[0] == -2) {return 'img-chess img-black-2';}
			if (chess[0] == -1) {return 'img-chess img-black-1';}
			if (chess[0] ==  7) {return 'img-chess img-red-7';}
			if (chess[0] ==  6) {return 'img-chess img-red-6';}
			if (chess[0] ==  5) {return 'img-chess img-red-5';}
			if (chess[0] ==  4) {return 'img-chess img-red-4';}
			if (chess[0] ==  3) {return 'img-chess img-red-3';}
			if (chess[0] ==  2) {return 'img-chess img-red-2';}
			if (chess[0] ==  1) {return 'img-chess img-red-1';}
		}
	},

	flushBoard : function flushBoard() {
		for (var i = 0; i < 4; ++i) {
			for (var j = 0; j < 8; ++j) {
				var img = Demo.getImg(oldBoard[Demo.data.step.length - 1][i][j]);
				Demo.getBox(i, j).attr('class', img);
			}
		}
	},

	setupInvalidList: function setupInvalidList() {
		// var ul = $('#invalid-list');
		// for (var i = 0; i < Demo.data.step.length; ++i) {
		//     var step = Demo.data.step[i];
		//     if (!step.valid) {
		//         var info = step.message || 'Invalid Operation! (No Details)';
		//         ul.append('<li class="list-group-item"><strong>[Step ' + (i+1) + ']AI' + (step.player+1) + '</strong> ' + info + '</li>');
		//     }
		// }
	},

	getData: function getData() {
		$.getJSON(Demo.jsonURL, function(dt) {
			Demo.data = dt;
			Demo.prepare();
			Demo.setupInvalidList();
			Demo.btnPlay.prop('disabled', false);
			Demo.spanPlay.html('');
			Demo.playing = dt.step.length-1;
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
		oldBoard.push(Demo.cloneObject(curBoard));
		for (var i = 0; i < Demo.data.step.length; ++i) {
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
			oldBoard.push(Demo.cloneObject(curBoard));
		}
	},

	bindEvents: function bindEvents() {
		// Demo.btnPrev.on('click', Demo.prevClick);
		// Demo.btnPlay.on('click', Demo.playClick);
		// Demo.btnNext.on('click', Demo.nextClick);

		$("#btn-speed-slow")  .on('click', function(){Demo.interval=500});
		$("#btn-speed-normal").on('click', function(){Demo.interval=200});
		$("#btn-speed-fast")  .on('click', function(){Demo.interval= 50});

		$("#btn-chess-show").on('click', function(){Demo.hideChess = false;Demo.flushBoard()});
		$("#btn-chess-hide").on('click', function(){Demo.hideChess =  true;Demo.flushBoard()});
	},

	setup: function setup() {
		Demo.jsonURL = 'http://localhost:8000/demo_test/test.json';

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