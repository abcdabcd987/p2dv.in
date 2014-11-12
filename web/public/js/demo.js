function ChessDemo(jsonURL) {
    // Global Constants:
    ANIMATION_INTERVAL = 200;

    // Variables:
    var board = $('#chess-board');
    var floatChess = $('#float-chess');
    var data = null;
    var that = this;

    // Functions:
    function getBox(i, j) {
        return board.find('#box-' + i + '-' + j);
    }

    function drawTable() {
        var table = $('<table id="chess-board">');
        for (var i = 8; i >= 0; --i) {
            var tr = $('<tr id="row-' + i + '">');
            for (var j = 0; j < 7; ++j) {
                var td = $('<td id="box-' + i + '-' + j + '">');
                td.data('row', i);
                td.data('col', j);
                tr.append(td);
            }
            table.append(tr);
        }
        board.replaceWith(table);
        board = $('#chess-board');
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

        floatChess.animate(target.offset(), ANIMATION_INTERVAL, function() {
            target.attr('class', floatChess.attr('class'));
            floatChess.addClass('hidden');
        });
    }

    function getData() {
        $.getJSON(jsonURL, function(dt) {
            data = dt;
            $('#btn-playdemo').prop('disabled', false).html('Play Demo');
        });
    }

    function playDemo() {
        drawTable();
        putChess();
        $('#btn-playdemo').prop('disabled', true);

        function loop(i, data) {
            if (i === data.step.length) {
                $('#btn-playdemo').prop('disabled', false);
                $('#demo-text').attr('class', 'bg-primary').html('Done');
                return;
            }
            var step = data.step[i];

            if (step.player == 0) {
                $("#demo-text").attr('class', 'bg-success');
            } else {
                $("#demo-text").attr('class', 'bg-warning');
            }

            if (step.valid) {
                $("#demo-text").html('<strong>[Step ' + (i+1) + ']AI' + (step.player+1) + '</strong> Move (' + step.source[0] + ',' + step.source[1] + ') to (' + step.target[0] + ',' + step.target[1] + ')');
                moveChess(step.source[0], step.source[1], step.target[0], step.target[1]);
            } else {
                $("#demo-text").html('<strong>[Step ' + (i+1) + ']AI' + (step.player+1) + '</strong> Invalid Operation!');
            }

            setTimeout(loop, ANIMATION_INTERVAL*2, i+1, data);
        }
        setTimeout(loop, ANIMATION_INTERVAL*2, 0, data);
    }

    function bindEvents() {
        $("#btn-playdemo").on('click', playDemo);
        $("#btn-speed-slow")  .on('click', function(){ANIMATION_INTERVAL=500});
        $("#btn-speed-normal").on('click', function(){ANIMATION_INTERVAL=200});
        $("#btn-speed-fast")  .on('click', function(){ANIMATION_INTERVAL= 50});
    }

    // Main:
    drawTable();
    putChess();
    getData();
    bindEvents();
}