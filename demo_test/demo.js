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
    data      : undefined,
    demoText  : undefined,
    btnNext   : undefined,
    btnPlay   : undefined,
    btnPrev   : undefined,
    spanNext  : undefined,
    spanPlay  : undefined,
    spanPrev  : undefined,

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
        Demo.getBox(0, 0).addClass('img-chess img-red-1');
        Demo.getBox(0, 1).addClass('img-chess img-red-2');
        Demo.getBox(0, 2).addClass('img-chess img-red-3');
        Demo.getBox(0, 3).addClass('img-chess img-red-4');
        Demo.getBox(0, 4).addClass('img-chess img-red-5');
        Demo.getBox(0, 5).addClass('img-chess img-red-6');
        Demo.getBox(0, 6).addClass('img-chess img-red-7');
        Demo.getBox(0, 7).addClass('img-blank');

        Demo.getBox(1, 0).addClass('img-chess img-black-1');
        Demo.getBox(1, 1).addClass('img-chess img-black-2');
        Demo.getBox(1, 2).addClass('img-chess img-black-3');
        Demo.getBox(1, 3).addClass('img-chess img-black-4');
        Demo.getBox(1, 4).addClass('img-chess img-black-5');
        Demo.getBox(1, 5).addClass('img-chess img-black-6');
        Demo.getBox(1, 6).addClass('img-chess img-black-7');
        Demo.getBox(1, 7).addClass('img-blank');
    },

    setup: function setup() {
        Demo.board      = $('#chess-board');
        Demo.floatChess = $('#float-chess');
        Demo.drawTable();
        Demo.putChess();
    }

}