const d3 = require('d3');
const d3tip = require('d3-tip');
const Chance = require('chance');
const _ = require('lodash/core');
const MicroModal = require('micromodal');

const RingCalculator = require('../util/ringCalculator');

const Radar = function (size, radar) {
  var svg, radarElement, blipWidth = 22;

  var tip = d3tip().attr('class', 'd3-tip').html(function (text) {
    return text;
  });

  tip.direction(function () {
    if (d3.select('.quadrant-table.selected').node()) {
      var selectedQuadrant = d3.select('.quadrant-table.selected');
      if (selectedQuadrant.classed('first') || selectedQuadrant.classed('fourth'))
        return 'ne';
      else
        return 'nw';
    }
    return 'n';
  });

  var ringCalculator = new RingCalculator(radar.rings().length, center());

  var self = {};

  function center() {
    return Math.round(size / 2);
  }

  function toRadian(angleInDegrees) {
    return Math.PI * angleInDegrees / 180;
  }

  function plotLines(quadrantGroup, quadrant) {
    var startX = size * (1 - (-Math.sin(toRadian(quadrant.startAngle)) + 1) / 2);
    var endX = size * (1 - (-Math.sin(toRadian(quadrant.startAngle - 90)) + 1) / 2);

    var startY = size * (1 - (Math.cos(toRadian(quadrant.startAngle)) + 1) / 2);
    var endY = size * (1 - (Math.cos(toRadian(quadrant.startAngle - 90)) + 1) / 2);

    if (startY > endY) {
      var aux = endY;
      endY = startY;
      startY = aux;
    }

    quadrantGroup.append('line')
      .attr('x1', center()).attr('x2', center())
      .attr('y1', startY - 2).attr('y2', endY + 2)
      .attr('stroke-width', 10);

    quadrantGroup.append('line')
      .attr('x1', endX).attr('y1', center())
      .attr('x2', startX).attr('y2', center())
      .attr('stroke-width', 10);
  }

  function plotQuadrant(rings, quadrant) {
    var quadrantGroup = svg.append('g')
      .attr('class', 'quadrant-group quadrant-group-' + quadrant.order)
      .on('mouseover', mouseoverQuadrant.bind({}, quadrant.order))
      .on('mouseout', mouseoutQuadrant.bind({}, quadrant.order))
      .on('click', selectQuadrant.bind({}, quadrant.order, quadrant.startAngle));

    rings.forEach(function (ring, i) {
      var arc = d3.arc()
        .innerRadius(ringCalculator.getRadius(i))
        .outerRadius(ringCalculator.getRadius(i + 1))
        .startAngle(toRadian(quadrant.startAngle))
        .endAngle(toRadian(quadrant.startAngle - 90));

      quadrantGroup.append('path')
        .attr('d', arc)
        .attr('class', 'ring-arc-' + ring.order())
        .attr('transform', 'translate(' + center() + ', ' + center() + ')');
    });

    return quadrantGroup;
  }

  function plotTexts(quadrantGroup, rings, quadrant) {
    rings.forEach(function (ring, i) {
      if (quadrant.order === 'first' || quadrant.order === 'fourth') {
        quadrantGroup.append('text')
          .attr('class', 'line-text')
          .attr('y', center() + 4)
          .attr('x', center() + (ringCalculator.getRadius(i) + ringCalculator.getRadius(i + 1)) / 2)
          .attr('text-anchor', 'middle')
          .text(ring.name());
      } else {
        quadrantGroup.append('text')
          .attr('class', 'line-text')
          .attr('y', center() + 4)
          .attr('x', center() - (ringCalculator.getRadius(i) + ringCalculator.getRadius(i + 1)) / 2)
          .attr('text-anchor', 'middle')
          .text(ring.name());
      }
    });
  }

  function triangle(x, y, order, group) {
    return group.append('path').attr('d', "M412.201,311.406c0.021,0,0.042,0,0.063,0c0.067,0,0.135,0,0.201,0c4.052,0,6.106-0.051,8.168-0.102c2.053-0.051,4.115-0.102,8.176-0.102h0.103c6.976-0.183,10.227-5.306,6.306-11.53c-3.988-6.121-4.97-5.407-8.598-11.224c-1.631-3.008-3.872-4.577-6.179-4.577c-2.276,0-4.613,1.528-6.48,4.699c-3.578,6.077-3.26,6.014-7.306,11.723C402.598,306.067,405.426,311.406,412.201,311.406")
      .attr('transform', 'scale(' + (blipWidth / 34) + ') translate(' + (-404 + x * (34 / blipWidth) - 17) + ', ' + (-282 + y * (34 / blipWidth) - 17) + ')')
      .attr('class', order);
  }

  function triangleLegend(x, y,order,  group) {
    return group.append('path').attr('d', "M412.201,311.406c0.021,0,0.042,0,0.063,0c0.067,0,0.135,0,0.201,0c4.052,0,6.106-0.051,8.168-0.102c2.053-0.051,4.115-0.102,8.176-0.102h0.103c6.976-0.183,10.227-5.306,6.306-11.53c-3.988-6.121-4.97-5.407-8.598-11.224c-1.631-3.008-3.872-4.577-6.179-4.577c-2.276,0-4.613,1.528-6.48,4.699c-3.578,6.077-3.26,6.014-7.306,11.723C402.598,306.067,405.426,311.406,412.201,311.406")
      .attr('transform', 'scale(' + (blipWidth / 64) + ') translate(' + (-404 + x * (64 / blipWidth) - 17) + ', ' + (-282 + y * (64 / blipWidth) - 17) + ')')
  .attr('class', order);
  }

  function addRing(ring, order) {
    var table = d3.select('.quadrant-table.' + order);
    table.append('h3').text(ring);
    return table.append('ul');
  }

  function calculateBlipCoordinates(chance, minRadius, maxRadius, startAngle) {
    var adjustX = Math.sin(toRadian(startAngle)) - Math.cos(toRadian(startAngle));
    var adjustY = -Math.cos(toRadian(startAngle)) - Math.sin(toRadian(startAngle));

    var radius = chance.floating({min: minRadius + blipWidth / 2, max: maxRadius - blipWidth / 2});
    var angleDelta = Math.asin(blipWidth / 2 / radius) * 180 / Math.PI;
    angleDelta = angleDelta > 45 ? 45 : angleDelta;
    var angle = toRadian(chance.integer({min: angleDelta, max: 90 - angleDelta}));

    var x = center() + radius * Math.cos(angle) * adjustX;
    var y = center() + radius * Math.sin(angle) * adjustY;

    return [x, y];
  }

  function thereIsCollision(coordinates, allCoordinates) {
    return allCoordinates.some(function (currentCoordinates) {
      return (Math.abs(currentCoordinates[0] - coordinates[0]) < blipWidth) && (Math.abs(currentCoordinates[1] - coordinates[1]) < blipWidth)
    });
  }

  function plotBlips(quadrantGroup, rings, quadrantWrapper) {
    var blips, quadrant, startAngle, order;

    quadrant = quadrantWrapper.quadrant;
    startAngle = quadrantWrapper.startAngle;
    order = quadrantWrapper.order;

    d3.select('.quadrant-table.' + order)
      .append('h2')
      .attr('class', 'quadrant-table__name')
      .text(quadrant.name());

    blips = quadrant.blips();
    rings.forEach(function (ring, i) {
      var maxRadius, minRadius;

      minRadius = ringCalculator.getRadius(i);
      maxRadius = ringCalculator.getRadius(i + 1);

      var ringBlips = blips.filter(function (blip) {
        return blip.ring() == ring;
      });

      var sumRing = ring.name().split('').reduce(function (p, c) {
        return p + c.charCodeAt(0);
      }, 0);
      var sumQuadrant = quadrant.name().split('').reduce(function (p, c) {
        return p + c.charCodeAt(0);
      }, 0);
      var chance = new Chance(Math.PI * sumRing * ring.name().length * sumQuadrant * quadrant.name().length);

      var ringList = addRing(ring.name(), order);
      var allBlipCoordinatesInRing = [];

      ringBlips.forEach(function (blip) {
        var coordinates = calculateBlipCoordinates(chance, minRadius, maxRadius, startAngle);
        var maxIterations = 100;
        var iterationCounter = 0;

        while (thereIsCollision(coordinates, allBlipCoordinatesInRing) && (iterationCounter < maxIterations)) {
          coordinates = calculateBlipCoordinates(chance, minRadius, maxRadius, startAngle);
          iterationCounter++;
        }

        if (iterationCounter < maxIterations) {
          allBlipCoordinatesInRing.push(coordinates);
          var x = coordinates[0];
          var y = coordinates[1];

          var group = quadrantGroup.append('g').attr('class', 'blip-link');

          if (blip.capability()) {
           triangle(x, y, 'first', group);
          } else if(blip.capability()==false){
              triangle(x, y, 'third', group);
          }else if(blip.capability()===undefined){
              triangle(x, y, 'second', group);
          }
          group.append('text')
            .attr('x', x)
            .attr('y', y + 4)
            .attr('class', 'blip-text')
            .attr('text-anchor', 'middle')
            .text(blip.number());

          var blipListItem = ringList.append('li');
          var blipText = blip.number() + '. ' + blip.name() + (blip.topic() ? ('. - ' + blip.topic()) : '');
          blipListItem.append('div')
            .attr('class', 'blip-list-item')
            .text(blipText);

          var blipItemDescription = blipListItem.append('div')
            .attr('class', 'blip-item-description');
          if (blip.description()) {
            blipItemDescription.append('p').attr('class', 'blip-item-description-container').html(blip.description());
          }

          var mouseOver = function () {
            d3.selectAll('g.blip-link').attr('opacity', 0.3);
            group.attr('opacity', 1.0);
            blipListItem.selectAll('.blip-list-item').classed('highlight', true);
            tip.show(blip.name(), group.node());
          };

          var mouseOut = function () {
            d3.selectAll('g.blip-link').attr('opacity', 1.0);
            blipListItem.selectAll('.blip-list-item').classed('highlight', false);
            tip.hide().style('left', 0).style('top', 0);
          };

          blipListItem.on('mouseover', mouseOver).on('mouseout', mouseOut);
          group.on('mouseover', mouseOver).on('mouseout', mouseOut);

          var clickBlip = function () {
            d3.select('#modal-1-title').text(blip.name);
            d3.select('#modal-1-content').html(blip.description());
            MicroModal.show("modal-1");
            blipItemDescription.on('click', function () {
              d3.event.stopPropagation();
            });
          };

          blipListItem.on('click', clickBlip);

          group.on('click', clickBlip);

        }
      });
    });
  }

  function removeRadarLegend(){
    d3.select('.legend').remove();
  }

  function drawLegend(order) {
    removeRadarLegend();

    var triangleKeyGood = "Well developed";
    var triangleKeyAverage = "Underdeveloped";
    var triangleKeyPoor = "Little experience";


    var container = d3.select('svg').append('g')
      .attr('class', 'legend legend'+"-"+order);

    var x = 10;
    var y = 10;


    if(order == "first") {
      x = 4 * size / 5;
      y = 1 * size / 5;
    }

    if(order == "second") {
      x = 1 * size / 5 - 15;
      y = 1 * size / 5 - 20;
    }

    if(order == "third") {
      x = 1 * size / 5 - 15;
      y = 4 * size / 5 + 15;
    }

    if(order == "fourth") {
      x = 4 * size / 5;
      y = 4 * size / 5;
    }

    d3.select('.legend')
      .attr('class', 'legend legend-'+order)
      .transition()
      .style('visibility', 'visible');

    triangleLegend(x, y,'first', container);

    container
      .append('text')
      .attr('x', x + 15)
      .attr('y', y + 5)
      .attr('font-size', '0.7em')
      .text(triangleKeyGood);

      triangleLegend(x, y+20,'second', container);

    container
      .append('text')
      .attr('x', x + 15)
      .attr('y', y + 25)
      .attr('font-size', '0.7em')
      .text(triangleKeyAverage);

      triangleLegend(x, y+40,'third', container);

      container
          .append('text')
          .attr('x', x + 15)
          .attr('y', y + 45)
          .attr('font-size', '0.7em')
          .text(triangleKeyPoor);
  }

  function redrawFullRadar() {
    removeRadarLegend();

    svg.style('left', 0).style('right', 0);

    d3.selectAll('.button')
      .classed('selected', false)
      .classed('full-view', true);

    d3.selectAll('.quadrant-table').classed('selected', false);

    d3.selectAll('.quadrant-group')
      .transition()
      .duration(1000)
      .attr('transform', 'scale(1)');

    d3.selectAll('.quadrant-group .blip-link')
      .transition()
      .duration(1000)
      .attr('transform', 'scale(1)');

    d3.selectAll('.quadrant-group')
      .style('pointer-events', 'auto');
	}

	function plotRadarFooter() {
		var year = new Date().getFullYear();
		
		d3.select('body').insert('div', '#radar-plot + *')
			.attr('id', 'footer')
			.append('div')
			.attr('class', 'footer-content');
		
		var footer = d3.select('.footer-content');
		
		footer.append('p')
			  .html('All content copyright Capgemini © ' + year +
					  '<br/>Produced and distributed by Capgemini UK Public Sector Digital' +
					  '<br/>Build your own at <a href="https://gitlab.com/PSDU/build-your-own-radar">https://gitlab.com/PSDU/build-your-own-radar</a>' +
					  '<br/>Powered by Thoughtworks <a href="https://info.thoughtworks.com/visualize-your-tech-strategy-guide.html">https://info.thoughtworks.com/visualize-your-tech-strategy-guide.html</a>');
	}

	function plotRadarHeader() {
		var header = d3.select('body').insert('header', "#radar").append('div').style("margin", "auto").style("display", "table");


		header.append('div')
	        .attr('class', 'radar-logo')
	        .html('<a href="https://www.uk.capgemini.com"><img src="/images/capgemini-logo-new.svg" / ></a>');
	    
		header.append('div')
			.attr('class', 'radar-title')
			.append('div')
			.attr('class', 'radar-title__text')
			.append('h1')
			.text(document.title)
			.style('cursor', 'pointer')
			.on('click', redrawFullRadar);

		return header;
	}

  function plotQuadrantButtons(quadrants, header) {

    function addButton(quadrant, title) {
      radarElement
        .append('div')
        .attr('class', 'quadrant-table ' + quadrant.order);
      
      title.append('div')
        .attr('class', 'button ' + quadrant.order + ' full-view')
        .text(quadrant.quadrant.name())
        .on('mouseover', mouseoverQuadrant.bind({}, quadrant.order))
        .on('mouseout', mouseoutQuadrant.bind({}, quadrant.order))
        .on('click', selectQuadrant.bind({}, quadrant.order, quadrant.startAngle));
    }    
    
    var title = d3.select('.radar-title');

	  title.append('div')
	    .classed('button no-capitalize', true)
	    .text('Home')
	    .on('click', redrawFullRadar);

    _.each([0, 3, 2, 1], function (i) {
      addButton(quadrants[i], title);
    });

    title.append('div')
      .classed('print-radar button no-capitalize', true)
      .text('Print this radar')
      .on('click', window.print.bind(window));


    title.append('a')
      .classed('about-radar button no-capitalize', true)
      .text('About')
      .attr('href', "https://adc-confluence.uk.capgemini.com/display/PSD/Tech+Radar");

  }

  function mouseoverQuadrant(order) {
    d3.select('.quadrant-group-' + order).style('opacity', 1);
    d3.selectAll('.quadrant-group:not(.quadrant-group-' + order + ')').style('opacity', 0.3);
  }

  function mouseoutQuadrant(order) {
    d3.selectAll('.quadrant-group:not(.quadrant-group-' + order + ')').style('opacity', 1);
  }

  function selectQuadrant(order, startAngle) {

    d3.selectAll('.button').classed('selected', false).classed('full-view', false);
    d3.selectAll('.button.' + order).classed('selected', true);
    d3.selectAll('.quadrant-table').classed('selected', false);
    d3.selectAll('.quadrant-table.' + order).classed('selected', true);
    d3.selectAll('.blip-item-description').classed('expanded', false);

    var scale = 2;

    var adjustX = Math.sin(toRadian(startAngle)) - Math.cos(toRadian(startAngle));
    var adjustY = Math.cos(toRadian(startAngle)) + Math.sin(toRadian(startAngle));

    var translateX = (-1 * (1 + adjustX) * size / 2 * (scale - 1)) + (-adjustX * (1 - scale / 2) * size);
    var translateY = (-1 * (1 - adjustY) * (size / 2 - 7) * (scale - 1)) - ((1 - adjustY) / 2 * (1 - scale / 2) * size);

    var translateXAll = (1 - adjustX) / 2 * size * scale / 2 + ((1 - adjustX) / 2 * (1 - scale / 2) * size);
    var translateYAll = (1 + adjustY) / 2 * size * scale / 2;

    var moveRight = (1 + adjustX) * (0.8 * window.innerWidth - size) / 2;
    var moveLeft = (1 - adjustX) * (0.8 * window.innerWidth - size) / 2;

    var blipScale = 3 / 4;
    var blipTranslate = (1 - blipScale) / blipScale;

    svg.style('left', moveLeft + 'px').style('right', moveRight + 'px');
    d3.select('.quadrant-group-' + order)
      .transition()
      .duration(1000)
      .attr('transform', 'translate(' + translateX + ',' + translateY + ')scale(' + scale + ')');
    d3.selectAll('.quadrant-group-' + order + ' .blip-link text').each(function () {
      var x = d3.select(this).attr('x');
      var y = d3.select(this).attr('y');
      d3.select(this.parentNode)
        .transition()
        .duration(1000)
        .attr('transform', 'scale(' + blipScale + ')translate(' + blipTranslate * x + ',' + blipTranslate * y + ')');
    });

    d3.selectAll('.quadrant-group')
      .style('pointer-events', 'auto');

    d3.selectAll('.quadrant-group:not(.quadrant-group-' + order + ')')
      .transition()
      .duration(1000)
      .style('pointer-events', 'none')
      .attr('transform', 'translate(' + translateXAll + ',' + translateYAll + ')scale(0)');



    if (d3.select('.legend.legend-' + order).empty()){
      drawLegend(order);
    }
  }

  self.init = function () {
    MicroModal.init();
    radarElement = d3.select('body').append('div').attr('id', 'radar');
    return self;
  };

  self.plot = function () {
    var rings, quadrants;

    rings = radar.rings();
    quadrants = radar.quadrants();
    var header = plotRadarHeader();

    plotQuadrantButtons(quadrants, header);

    radarElement.style('height', size + 14 + 'px');
    svg = radarElement.append("svg").call(tip);
    svg.attr('id', 'radar-plot').attr('width', size).attr('height', size + 14);

    _.each(quadrants, function (quadrant) {
      var quadrantGroup = plotQuadrant(rings, quadrant);
      plotLines(quadrantGroup, quadrant);
      plotTexts(quadrantGroup, rings, quadrant);
      plotBlips(quadrantGroup, rings, quadrant);
    });

    plotRadarFooter();
  };

  return self;
};

module.exports = Radar;
