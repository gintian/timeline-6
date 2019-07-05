// Get the data
d3.json('data.json').then(function(data) {

    var width = 8000,
        height = 1120,
        start = -7000,
        colors = ['#b4c8da', '#787d80'],
        //colors = ['#303952', '#546de5'],
        zoneHeight = height / data.zone.length,
        zoneCornerWidth = zoneHeight,
        circleSize = 6,
        eventWidth = 84,
        zoneMinX = start,
        zoneMaxX = d3.max(data.zone, function(d) {
            return d['end'];
        }),
        eventMinX = d3.min(data.event, function(d) {
            return d['date'];
        }),
        eventMaxX = d3.max(data.event, function(d) {
            return d['date'];
        }),
        globalMinX = Math.min(zoneMinX, eventMinX),
        globalMaxX = Math.max(zoneMaxX, eventMaxX);

    var steps = [start, 1350, 1700, 1915, 2000, globalMaxX];
    var stepsWidth = width / (steps.length - 1);
    var stepsValue = [0, stepsWidth, stepsWidth * 2, stepsWidth * 3, stepsWidth * 4, width];

    var xScale = d3.scaleLinear()
        .domain(steps)
        .range(stepsValue);

    var yScale = d3.scaleBand()
        .domain(data.zone.map(d => d.pos))
        .range([0, height]);

    var xAxis = d3.axisBottom(xScale)
        .ticks(data.event.length) // read data from event data
        .tickValues(d3.set(data.event.map(function(d) {
            return d.date
        })).values())
        .tickSize(height) // full height line
        .tickFormat(d3.format("d")); // remove comma from thousand delimeter

    var colorInterpolation = d3.quantize(d3.interpolateHcl(colors[0], colors[1]), data.zone.length);

    var zoneX = function(d, i) {
            return xScale(start);
        },
        zoneY = function(d) {
            return yScale(d.pos);
        },
        zoneW = function(d, i) {
            return xScale(d.end) - xScale(start)
        },
        zoneH = zoneHeight;

    // rect with bottom right angle cutted (x - rect height)
    var polyZone = function(d, i) {
        return [
            [
                0,
                0
            ],
            [
                0,
                yScale(d.pos)
            ],
            [
                0,
                yScale(d.pos) + zoneHeight
            ],
            [
                xScale(d.end) - zoneCornerWidth,
                yScale(d.pos) + zoneHeight
            ],
            [
                xScale(d.end),
                yScale(d.pos)
            ],
            [
                xScale(d.end),
                0
            ]
        ];
    };
    // distribute event on zones/thematics
    var eventX = function(d, i) {
            return xScale(d['date']);
        },
        eventY = function(d) {
            return yScale(d.pos) + zoneHeight / 2;
        };

    /**
     * TIMEMLINE BACK
     */
    var chartBack = d3.select('#timeline--background')
        .attr('width', width)
        .attr('height', height)
        .append('g');

    // Add zones
    var zone = chartBack.selectAll('.timeline-zone')
        .data(data.zone.reverse())
        .enter().append('g')
        .classed('timeline-zone', true);

    var poly = zone.append('polygon')
        .attr('x', zoneX)
        .attr('y', zoneY)
        .attr('points', polyZone)
        .style('fill', function(d, i) {
            return colorInterpolation[i];
        });

    // Add x axis
    chartBack.append('g')
        .attr('class', 'axis axis-x');

    chartBack.select('.axis-x')
        .call(xAxis)
        .selectAll('text')
        .attr('y', 4)
        .attr('dy', 0)
        .style('text-anchor', 'middle')
        .attr('transform', 'rotate(-90) translate(-20,-7)');

    var label = zone.append('text')
        .attr('x', 8)
        .attr('y', zoneY)
        .attr('transform', 'translate(0, ' + zoneHeight / 2 + ')')
        .attr('dy', '.35em')
        .text(function(d, i) {
            return d.label;
        });
    /**
     * TIMEMLINE FRONT
     */
    var chartFront = d3.select('#timeline--content')
        .style('width', width)
        .style('height', height);

    var eventsBlocks = [];

    for (let e = 0; e < data.event.length - 1; e++) {

        if (data.event[e].title && data.event[e].date && data.event[e].pos) {

            var event = chartFront.append('div')
                .datum(data.event[e])
                .classed('timeline--content--event', true)
                .style('left', eventX)
                .style('top', eventY);

            var eventContainer = event.append('div')
                .attr('class', 'event-inner');

            var title = eventContainer.append('h3')
                .text(function(d) {
                    return d.title;
                });

            if (data.event[e].text) {
                var text = eventContainer.append('p')
                    .text(function(d) {
                        if (d.text) {
                            return d.text;
                        }
                    });
            }
            if (data.event[e].link) {
                var link = eventContainer.append('a')
                    .attr('href', data.event[e].link)
                    .text('+');
            }
        }
    }

});