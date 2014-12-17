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
                },
                regions: [
                    {axis: 'y', end: 1200, class: 'rankcolor-0'},
                    {axis: 'y', start: 1200, end: 1350, class: 'rankcolor-1'},
                    {axis: 'y', start: 1350, end: 1500, class: 'rankcolor-2'},
                    {axis: 'y', start: 1500, end: 1700, class: 'rankcolor-3'},
                    {axis: 'y', start: 1700, end: 1900, class: 'rankcolor-4'},
                    {axis: 'y', start: 1900, end: 2050, class: 'rankcolor-5'},
                    {axis: 'y', start: 2050, end: 2200, class: 'rankcolor-6'},
                    {axis: 'y', start: 2200, end: 2600, class: 'rankcolor-7'},
                    {axis: 'y', start: 2600, class: 'rankcolor-8'},
                ],
                grid: {
                    y: {
                        lines: [
                            {value: 1200},
                            {value: 1350},
                            {value: 1500},
                            {value: 1700},
                            {value: 1900},
                            {value: 2050},
                            {value: 2200},
                            {value: 2600}
                        ]
                    }
                }
            });
        });
    }
};