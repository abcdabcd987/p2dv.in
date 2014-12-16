ratingChart = {
    jsonURL: undefined,
    chart: undefined,

    setup: function setup(jsonURL) {
        ratingChart.jsonURL = jsonURL;
        $.getJSON(jsonURL, function(dt) {
            ratingChart.chart = c3.generate({
                data: dt,
                bindto: '#chart',
                axis: {
                    x: {
                        type: 'timeseries',
                        tick: {
                            format: '%m-%d %H:%M',
                            count: 32,
                        }
                    }
                }
            });
        });
    }
};