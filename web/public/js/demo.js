function ChessDemo(jsonURL) {
    // Constants:
    var MOVE_DURATION      = 50;
    var ANIMATION_INTERVAL = 100; // ANIMATION_INTERVAL > MOVE_DURATION

    // Variables:
    var board = $('#chess-board');
    var floatChess = $('#float-chess');
    var data = null;

    // Functions:
    function getBox(i, j) {
        return board.find('#box-' + i + '-' + j);
    }

    function drawTable() {
        for (var i = 8; i >= 0; --i) {
            var tr = $('<tr id="row-' + i + '">');
            for (var j = 0; j < 7; ++j) {
                var td = $('<td id="box-' + i + '-' + j + '">');
                td.data('row', i);
                td.data('col', j);
                tr.append(td);
            }
            board.append(tr);
        }
    }

    function putChess() {
        getBox(0, 0).addClass('ai0').addClass('img-5');
        getBox(0, 2).addClass('ai0').addClass('img-trap').data('default-css', 'ai0 img-trap');
        getBox(0, 3).addClass('ai0').addClass('img-cave');
        getBox(0, 4).addClass('ai0').addClass('img-trap').data('default-css', 'ai0 img-trap');
        getBox(0, 6).addClass('ai0').addClass('img-6');
        getBox(1, 1).addClass('ai0').addClass('img-1');
        getBox(1, 3).addClass('ai0').addClass('img-trap').data('default-css', 'ai0 img-trap');
        getBox(1, 5).addClass('ai0').addClass('img-3');
        getBox(2, 0).addClass('ai0').addClass('img-7');
        getBox(2, 2).addClass('ai0').addClass('img-2');
        getBox(2, 4).addClass('ai0').addClass('img-4');
        getBox(2, 6).addClass('ai0').addClass('img-0');

        getBox(8, 6).addClass('ai1').addClass('img-5');
        getBox(8, 4).addClass('ai1').addClass('img-trap').data('default-css', 'ai1 img-trap');
        getBox(8, 3).addClass('ai1').addClass('img-cave');
        getBox(8, 2).addClass('ai1').addClass('img-trap').data('default-css', 'ai1 img-trap');
        getBox(8, 0).addClass('ai1').addClass('img-6');
        getBox(7, 5).addClass('ai1').addClass('img-1');
        getBox(7, 3).addClass('ai1').addClass('img-trap').data('default-css', 'ai1 img-trap');
        getBox(7, 1).addClass('ai1').addClass('img-3');
        getBox(6, 6).addClass('ai1').addClass('img-7');
        getBox(6, 4).addClass('ai1').addClass('img-2');
        getBox(6, 2).addClass('ai1').addClass('img-4');
        getBox(6, 0).addClass('ai1').addClass('img-0');

        getBox(3, 1).addClass('river').data('default-css', 'river');
        getBox(4, 1).addClass('river').data('default-css', 'river');
        getBox(5, 1).addClass('river').data('default-css', 'river');
        getBox(3, 2).addClass('river').data('default-css', 'river');
        getBox(4, 2).addClass('river').data('default-css', 'river');
        getBox(5, 2).addClass('river').data('default-css', 'river');
        getBox(3, 4).addClass('river').data('default-css', 'river');
        getBox(4, 4).addClass('river').data('default-css', 'river');
        getBox(5, 4).addClass('river').data('default-css', 'river');
        getBox(3, 5).addClass('river').data('default-css', 'river');
        getBox(4, 5).addClass('river').data('default-css', 'river');
        getBox(5, 5).addClass('river').data('default-css', 'river');
    }

    function moveChess(sx, sy, tx, ty) {
        var source = getBox(sx, sy);
        var target = getBox(tx, ty);
        floatChess.attr('class', source.attr('class'));
        floatChess.offset(source.offset());

        if (source.data('default-css')) {
            source.attr('class', source.data('default-css'));
        } else {
            source.attr('class', '');
        }

        floatChess.animate(target.offset(), MOVE_DURATION, function() {
            target.attr('class', floatChess.attr('class'));
            floatChess.addClass('hidden');
        });
    }

    function getData() {
        $.getJSON(jsonURL, function(dt) {
            data = dt;
        });
    }

    function playDemo() {
        function loop(i, data, ANIMATION_INTERVAL) {
            console.log(i, ANIMATION_INTERVAL);
            if (i === data.step.length) return;
            var step = data.step[i];
            moveChess(step.source[0], step.source[1], step.target[0], step.target[1]);

            setTimeout(loop, ANIMATION_INTERVAL, i+1, data, ANIMATION_INTERVAL);
        }
        setTimeout(loop, ANIMATION_INTERVAL, 0, data, ANIMATION_INTERVAL);
    }

    // Main:
    drawTable();
    putChess();
    getData();

    setTimeout(playDemo, 500);
}