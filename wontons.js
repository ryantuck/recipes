
// window dimensions
var width = 1200,
    height = 800;

// rect dimensions
var w_step = 160,
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

// given node and its index, compute coordinates
function get_coordinates(d, i) {

    var base = margin;

    if (d.type == 'ingredient') {
        // first col
        delX = 0;
    }
    else if (d.type == 'step') {
        delX = w_ingredient + x_spacing * (d.level+1) + w_step * (d.level);
    }

    return {
        'x': base + delX,
        'y': base + (h_ingredient + y_spacing)*i
    };
}

// read in json and position nodes and edges accordingly!
d3.json('wonton-soup.json', function(error, graph) {
    if (error) throw error;

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
    var step_nodes  = svg.selectAll(".asdf")
        .data(steps)
        .enter()
        .append("g")
        .attr("transform", function(d, i) {
            var c = get_coordinates(d,i);
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
        .text(function(d) {return d.title;})
        .call(wrap, w_step);


    // ------------------------------------------------
    // populate links
    // ------------------------------------------------

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

    var links  = svg.selectAll("link")
        .data(graph.links)
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("x1",function(l){

            // get starting node
            var sourceNode = graph
                .nodes
                .filter(function(d){
                    return d.id==l.from_id
                })[0];

            // determine index of starting node based on its type
            var i = 0;
            i = types[sourceNode.type].list.map(function(e) {
                return e.id;
            }).indexOf(l.from_id);


            // define y coord based on source node and index
            d3.select(this).attr("y1",function(){
                return get_coordinates(sourceNode, i).y + h_step/2;
            });

            // define x coord from source node and index
            return get_coordinates(sourceNode, i).x + types[sourceNode.type].width;
        })
        .attr("x2",function(l){
            // get target node
            var targetNode = graph
                .nodes
                .filter(function(d){
                    return d.id==l.to_id
                })[0];

            // determine index of target node based on its type
            var i = 0;
            i = types[targetNode.type].list.map(function(e) {
                return e.id;
            }).indexOf(l.to_id);


            // define y coord based on target node and index
            d3.select(this).attr("y2",function(){
                return get_coordinates(targetNode, i).y + h_step/2;
            });

            // define x coord from target node and index
            return get_coordinates(targetNode, i).x;
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
