Demo = {
    // Variables:
    interval  : 200,
    jsonURL   : undefined,
    playing   : undefined,
    pause     : undefined,
    timeoutID : undefined,

    // DOM:
    board     : undefined,
    floatChess: undefined,
    hideChess : undefined,
    data      : undefined,
    demoText  : undefined,
    btnNext   : undefined,
    btnPlay   : undefined,
    btnPrev   : undefined,
    spanNext  : undefined,
    spanPlay  : undefined,
    spanPrev  : undefined,

    //Runtime data:
    chessData : undefined,
    optList : undefined,

    // Functions:
    getBox: function getBox(i, j) {
        return Demo.board.find('#box-' + i + '-' + j);
    },

    drawTable: function drawTable() {
        chessData = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
        ];
        optList = [[], []];
        for (var i = 0; i < 4; ++i) {
            for (var j = 0; j < 8; ++j) {
                chessData[i][j] = data.initChess[i][j];
            }
        }
        for (var i = 0; i < data.step.length; ++i) {
            var x = data.step.source[0];
            var y = data.step.source[1];
            var xx = data.step.target[0];
            var yy = data.step.target[1];
            if (xx == x && yy == y) {
                optList[0].push([x, y, chessData[x][y]]);
                optList[1].push([xx, yy, chessData[xx][yy]]);
            } else {
                optList[0].push([x, y, chessData[x][y]]);
                optList[1].push([xx, yy, chessData[xx][yy]]);
                chessData[xx][yy] = chessData[x][y];
                chessData[x][y] = 0;
            }
        }
        var table = $('<table id="chess-board">');
        table.append('<tr><td colspan="8" class="ai1 td-ai-name">AI2</td></tr>');
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
        table.append('<tr><td colspan="8" class="ai0 td-ai-name">AI1</td></tr>');
        Demo.board.replaceWith(table);
        Demo.board = $('#chess-board');
    },

    putChess: function putChess() {

        for (var i = 0; i < 4; ++i) {
            for (var j = 0; j < 8; ++j) {
                Demo.getBox(i, j).addClass('img-hide');
            }
        }
/*
        Demo.getBox(0, 0).addClass('ai0').addClass('img-5');
        Demo.getBox(0, 2).addClass('ai0').addClass('img-trap').data('default-css', 'ai0 img-trap');
        Demo.getBox(0, 3).addClass('ai0').addClass('img-cave');
        Demo.getBox(0, 4).addClass('ai0').addClass('img-trap').data('default-css', 'ai0 img-trap');
        Demo.getBox(0, 6).addClass('ai0').addClass('img-6');
        Demo.getBox(1, 1).addClass('ai0').addClass('img-1');
        Demo.getBox(1, 3).addClass('ai0').addClass('img-trap').data('default-css', 'ai0 img-trap');
        Demo.getBox(1, 5).addClass('ai0').addClass('img-3');
        Demo.getBox(2, 0).addClass('ai0').addClass('img-7');
        Demo.getBox(2, 2).addClass('ai0').addClass('img-2');
        Demo.getBox(2, 4).addClass('ai0').addClass('img-4');
        Demo.getBox(2, 6).addClass('ai0').addClass('img-0');

        Demo.getBox(8, 6).addClass('ai1').addClass('img-5');
        Demo.getBox(8, 4).addClass('ai1').addClass('img-trap').data('default-css', 'ai1 img-trap');
        Demo.getBox(8, 3).addClass('ai1').addClass('img-cave');
        Demo.getBox(8, 2).addClass('ai1').addClass('img-trap').data('default-css', 'ai1 img-trap');
        Demo.getBox(8, 0).addClass('ai1').addClass('img-6');
        Demo.getBox(7, 5).addClass('ai1').addClass('img-1');
        Demo.getBox(7, 3).addClass('ai1').addClass('img-trap').data('default-css', 'ai1 img-trap');
        Demo.getBox(7, 1).addClass('ai1').addClass('img-3');
        Demo.getBox(6, 6).addClass('ai1').addClass('img-7');
        Demo.getBox(6, 4).addClass('ai1').addClass('img-2');
        Demo.getBox(6, 2).addClass('ai1').addClass('img-4');
        Demo.getBox(6, 0).addClass('ai1').addClass('img-0');

        Demo.getBox(3, 1).addClass('river').data('default-css', 'river');
        Demo.getBox(4, 1).addClass('river').data('default-css', 'river');
        Demo.getBox(5, 1).addClass('river').data('default-css', 'river');
        Demo.getBox(3, 2).addClass('river').data('default-css', 'river');
        Demo.getBox(4, 2).addClass('river').data('default-css', 'river');
        Demo.getBox(5, 2).addClass('river').data('default-css', 'river');
        Demo.getBox(3, 4).addClass('river').data('default-css', 'river');
        Demo.getBox(4, 4).addClass('river').data('default-css', 'river');
        Demo.getBox(5, 4).addClass('river').data('default-css', 'river');
        Demo.getBox(3, 5).addClass('river').data('default-css', 'river');
        Demo.getBox(4, 5).addClass('river').data('default-css', 'river');
        Demo.getBox(5, 5).addClass('river').data('default-css', 'river');
*/
    },
    flipChess: function flipChess(x, y) {
        Demo.getBox(x, y)
    },

    moveChess: function moveChess(sx, sy, tx, ty) {
        if (sx == tx && sy == ty) {
            target.attr('class', Demo.)
        } else {
            var so   urce = Demo.getBox(sx, sy);
            var target = Demo.getBox(tx, ty);
            Demo.floatChess.attr('class', source.attr('class'));
            Demo.floatChess.offset(source.offset());

            if (source.data('default-css')) {
                source.attr('class', source.data('default-css'));
            } else {
                source.attr('class', '');
            }

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

    setupInvalidList: function setupInvalidList() {
        var ul = $('#invalid-list');
        for (var i = 0; i < Demo.data.step.length; ++i) {
            var step = Demo.data.step[i];
            if (!step.valid) {
                var info = step.message || 'Invalid Operation! (No Details)';
                ul.append('<li class="list-group-item"><strong>[Step ' + (i+1) + ']AI' + (step.player+1) + '</strong> ' + info + '</li>');
            }
        }
    },

    getData: function getData() {
        $.getJSON(Demo.jsonURL, function(dt) {
            Demo.data = dt;
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

    updateText: function updateText() {
        var i = Demo.playing;
        var step = Demo.data.step[i];

        if (step.player === 0) {
            Demo.demoText.attr('class', 'bg-success');
        } else {
            Demo.demoText.attr('class', 'bg-warning');
        }

        if (step.valid) {
            Demo.demoText.html('<strong>[Step ' + (i+1) + ']AI' + (step.player+1) + '</strong> Move (' + step.source[0] + ',' + step.source[1] + ') to (' + step.target[0] + ',' + step.target[1] + ')');
        } else {
            Demo.demoText.attr('class', 'bg-danger');
            var info = step.message || 'Invalid Operation! (No Details)';
            Demo.demoText.html('<strong>[Step ' + (i+1) + ']AI' + (step.player+1) + '</strong> ' + info);
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

        if (step.valid) {
            Demo.moveChess(step.source[0], step.source[1], step.target[0], step.target[1]);
        } else {
            Demo.setControls();
            if (!Demo.isPause) {
                ++Demo.playing;
                Demo.timeoutID = setTimeout(Demo.draw, Demo.interval*2);
            }
        }
    },

    playDemo: function playDemo() {
        Demo.drawTable();
        Demo.putChess();

        Demo.playing = 0;
        Demo.timeoutID = setTimeout(Demo.draw, Demo.interval);
    },

    quickMove: function quickMove(sx, sy, tx, ty) {
        var source = Demo.getBox(sx, sy);
        var target = Demo.getBox(tx, ty);

        target.attr('class', source.attr('class'));
        if (source.data('default-css')) {
            source.attr('class', source.data('default-css'));
        } else {
            source.attr('class', '');
        }
    },

    drawPrev: function drawPrev() {
        Demo.drawTable();
        Demo.putChess();

        for (var i = 0; i <= Demo.playing; ++i) {
            var step = Demo.data.step[i];
            if (step.valid) {
                Demo.quickMove(step.source[0], step.source[1], step.target[0], step.target[1]);
            }
        }

        Demo.setControls();
        Demo.updateText();
    },

    prevClick: function prevClick(e) {
        e.preventDefault();
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
        if (Demo.playing < Demo.data.step.length - 1) {
            Demo.btnNext.prop('disabled', true);
            Demo.btnPlay.prop('disabled', true);
            Demo.btnPrev.prop('disabled', true);
            ++Demo.playing;
            Demo.draw();
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
    },

    setup: function setup(jsonURL) {
        Demo.jsonURL = jsonURL;

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