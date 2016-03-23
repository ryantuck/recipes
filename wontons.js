
// window dimensions
var width = 1600,
    height = 1200;

// rect dimensions
var w_step = 200,
    h_step = 60;

// rect dimensions
var w_ingredient = 200,
    h_ingredient = 60;

// spacing between nodes
var x_spacing = 40,
    y_spacing = 40;

// margin around content
var margin = 100;

// set color palette
// var c10 = d3.scale.category10();

// create main svg body
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);


// read in json and position nodes and edges accordingly!
d3.json('wonton-soup.json', function(error, graph) {
    if (error) throw error;

    // given node and its index, compute coordinates
    function get_coordinates(d, i) {

        var base = margin;

        if (d.type == 'ingredient') {
            // first col
            delX = 0;
            delY = (h_ingredient + y_spacing)*i;
        }
        else if (d.type == 'step') {
            delX = w_ingredient + x_spacing * (d.level+1) + w_step * (d.level);
            delY = (h_ingredient + y_spacing)*d.row;
        }

        return {
            'x': base + delX,
            'y': base + delY
        };
    }

    // ------------------------------------------------
    // parse node data
    // ------------------------------------------------

    // get unique list of ingredients
    var ingredients = graph
        .nodes
        .filter(function(d) {
            return d.type == 'ingredient'
        });

    // get unique list of steps
    var steps = graph
        .nodes
        .filter(function(d) {
            return d.type == 'step'
        });

    var step_levels = [5];
    for (var i=0; i<5; i++) {
        step_levels[i] = steps.filter(function(d) {
            return d.level == i;
        });
    }
    console.log(step_levels);


    // ------------------------------------------------
    // position and populate ingredient nodes
    // ------------------------------------------------

    // define positions
    var ingredient_nodes  = svg.selectAll("node")
        .data(ingredients)
        .enter()
        .append("g")
        .attr("transform", function(d, i) {
            var c = get_coordinates(d,i);
            return "translate(" + c.x + "," + c.y + ")";
        });

    // define rectangles
    ingredient_nodes.append("rect")
        .attr("class", "node")
        .attr("width", w_ingredient)
        .attr("height", h_ingredient)
        .attr("fill", function(d,i){ return "white"; });

    // text - title
    ingredient_nodes.append("text")
        .attr("dy", ".35em")
        .attr("y", "10")
        .text(function(d) { return d.title; })
        .attr('transform', 'translate(65,0)')
        .call(wrap, w_step);

    // quantities text
    ingredient_nodes.append("text")
        .attr("dy", ".35em")
        .attr("y", "40")
        .text(function(d) { return d.quantity; })
        .attr('transform', 'translate(65,0)')
        .call(wrap, w_step);

    // append images
    ingredient_nodes.append('svg:image')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 60)
        .attr('height', 60)
        .attr('xlink:href', function(d) { return 'img/' + d.img;});

    // ------------------------------------------------
    // position and populate step nodes
    // ------------------------------------------------

    // define positions
    for (var j=0; j<5; j++) {
        console.log(step_levels[j]);

        var step_nodes  = svg.selectAll(".asdf" + j)
            .data(step_levels[j])
            .enter()
            .append("g")
            .attr("transform", function(d, i) {
                var c = get_coordinates(d,i);
                console.log(c);
                return "translate(" + c.x + "," + c.y + ")";
            });

        // define rectanges
        step_nodes.append("rect")
            .attr("class", "asdf")
            .attr("width", w_step)
            .attr("height", h_step)
            .attr("fill", function(d,i){ return "white"; });

        // define text
        step_nodes.append("text")
            .attr("dy", ".35em")
            .attr("y", "10")
            .attr('transform','translate(65,0)')
            .text(function(d) {return d.title;})
            .call(wrap, w_step-65);

        // append images
        step_nodes.append('svg:image')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 60)
            .attr('height', 60)
            .attr('xlink:href', function(d) { return 'img/' + d.img;});
    }


    // ------------------------------------------------
    // populate links
    // ------------------------------------------------

    // define vars for both ingredients and steps
    var types = {
        'ingredient': {
            'list': ingredients,
            'width': w_ingredient
        },
        'step': {
            'list': steps,
            'width': w_step
        }
    };

    // create links elements
    var links = svg.selectAll("link")
        .data(graph.links)
        .enter()
        .append('g');

    links.each(function(d) {

        // get starting node
        var sourceNode = graph
            .nodes
            .filter(function(x){
                return x.id==d.from_id
            })[0];

        // get target node
        var targetNode = graph
            .nodes
            .filter(function(x){
                return x.id==d.to_id
            })[0];

        // determine index of starting node based on its type
        if (sourceNode.type == 'step') {
            var source_i = step_levels[sourceNode.level].map(function(e) {
                return e.id;
            }).indexOf(d.from_id);
        } else {
            var source_i = types[sourceNode.type].list.map(function(e) {
                return e.id;
            }).indexOf(d.from_id);
        }

        // determine index of target node based on its type
        var target_level = targetNode.level;
        var target_i = step_levels[target_level].map(function(e) {
            return e.id;
        }).indexOf(d.to_id);

        // determine start and end coordinates of line
        var ys = get_coordinates(sourceNode, source_i).y + h_step/2;
        var xs = get_coordinates(sourceNode, source_i).x + types[sourceNode.type].width;
        var yt = get_coordinates(targetNode, target_i).y + h_step/2;
        var xt = get_coordinates(targetNode, target_i).x;

        // translate the g element for this line into place
        var x = Math.min(xs,xt);
        var y = Math.min(ys,yt);
        d3.select(this)
            .attr('transform','translate('+x+','+y+')');

        // append line
        d3.select(this)
            .append("line")
            .attr("class", "link")
            .attr("x1", xs-x)
            .attr("y1", ys-y)
            .attr("x2", xt-x)
            .attr("y2", yt-y);

        // append text to proper location
        d3.select(this).append('text')
            .attr('x', function() {
                return Math.abs(xs - xt)/2;
            })
            .attr('y', function() {
                return Math.abs(ys - yt)/2;
            })
            .attr('dy', ".35em")
            .text(function(d) {
                return d.text;
            });
    });
});


// handles text wrapping in elements
function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}
