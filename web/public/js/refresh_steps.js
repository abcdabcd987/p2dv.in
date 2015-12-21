// Demo page
function refresh_step(url) {
    var span_status = $("#span-status");
    var span_steps = $("#span-steps");
    var dd_steps = $("#dd-steps");
    $.getJSON(url, function(data) {
        if (data.status === 'Running') {
            if (span_status.html() === 'Pending') {
                span_status.attr('class', 'label label-warning');
                dd_steps.html('<img src="/images/ball.svg"> <span id="span-steps">loading</span>');
                span_steps = $("#span-steps");
                span_status.html(data.status);
            }
            span_steps.html(data.step);
        } else if (data.status === 'Finished') {
            span_status.attr('class', 'label label-success');
            span_status.html(data.status);
            span_steps.html(data.step);
            window.location.reload();
            return;
        }
        setTimeout(refresh_step, 50, url);
    });
};

// List page
function watch(trID, url) {
    var tr = $(trID);
    var span_status = tr.find('.status').eq(0);
    var td_steps = tr.find('.steps').eq(0);
    $.getJSON(url, function(data) {
        if (data.status === 'Running') {
            if (span_status.html() === 'Pending') {
                span_status.attr('class', 'label label-warning');
                span_status.html(data.status);
            }
            td_steps.html(data.step);
        } else if (data.status === 'Finished') {
            span_status.attr('class', 'label label-success');
            span_status.html(data.status);
            td_steps.html(data.step);
            window.location.reload();
            return;
        }
        setTimeout(watch, 150, trID, url);
    })
}

// Update Contest Infomation
function contest_watcher(url) {
    var pending = $("#count-pending-battles");
    var running = $("#count-running-battles");
    var finished = $("#count-finished-battles");
    $.getJSON(url, function(data) {
        for (var i = 0; i < data.ais.length; ++i) {
            var ai = data.ais[i];
            var html = "";
            html += '<td>' + ai.rank + '</td>';
            html += '<td><a href="/ai/' + ai.ai_id + '">' + ai.name + '</a> of <small>' + ai.user + ' ('+ ai.idOfUser + ')</small></td>';
            html += '<td class="success">' + ai.win + '</td>'
            html += '<td class="warning">' + ai.draw + '</td>'
            html += '<td class="danger">' + ai.lose + '</td>'
            html += '<td>' + ai.score + '</td>'
            html += '<td></td>'
            $("#contest-row-" + ai.ai_id).html(html);
        }
        pending.html("" + data.recs.Pending);
        running.html("" + data.recs.Running);
        finished.html("" + data.recs.Finished);

        if (data.recs.Running || data.recs.Pending) {
            setTimeout(contest_watcher, 150, url);
        }
    })
}