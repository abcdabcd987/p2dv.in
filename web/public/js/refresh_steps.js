// Demo page
function refresh_step(url) {
    var span_status = $("#span-status");
    var span_steps = $("#span-steps");
    var dd_steps = $("#dd-steps");
    $.getJSON(url, function(data) {
        if (data.status === 'Running') {
            if (span_status.html() === 'Pending') {
                span_status.attr('class', 'label label-warning');
                dd_steps.html('<img src="/images/jumping-ball.gif"> <span id="span-steps">loading</span>');
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