

var width = 960,
    height = 800;

var c10 = d3.scale.category10();

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

function get_coordinates(d, i) {
    var base = 100;
    if (d.type == 'ingredient') {
        delX = 0;
    }
    else if (d.type == 'step') {
        delX = 200 + 120 * d.level;
    }

    var x = base + delX;
    var y = base + 50*i;

    return {'x': x, 'y': y};
}


d3.json('wonton-soup.json', function(error, graph) {
    if (error) throw error;

    var ingredients = graph.nodes.filter(function(d) { return d.type == 'ingredient'});
    var steps = graph.nodes.filter(function(d) { return d.type == 'step'});

    var ingredient_nodes  = svg.selectAll("node")
        .data(ingredients)
        .enter()
        .append("rect")
        .attr("class","node")
        .attr("x",function(d,i) {return get_coordinates(d,i).x;})
        .attr("y",function(d,i) {return get_coordinates(d,i).y;})
        .attr("width",100)
        .attr("height",50)
        .attr("fill", function(d,i){ return c10(i); })
        .append("text")
        .attr("text", function(d) {return d.title;});

    var step_nodes  = svg.selectAll(".asdf")
        .data(steps)
        .enter()
        .append("rect")
        .attr("class","asdf")
        .attr("x",function(d,i) {return get_coordinates(d,i).x;})
        .attr("y",function(d,i) {return get_coordinates(d,i).y;})
        .attr("width",100)
        .attr("height",50)
        .attr("fill", function(d,i){ return c10(i); });

    var links  = svg.selectAll("link")
        .data(graph.links)
        .enter()
        .append("line")
        .attr("class","link")
        .attr("x1",function(l){
            var sourceNode = graph.nodes.filter(function(d){ return d.id==l.from_id })[0];
            var i = 0;
            if (sourceNode.type == 'ingredient') {
                i = ingredients.map(function(e) {return e.id}).indexOf(l.from_id);
            } else if (sourceNode.type == 'step') {
                i = steps.map(function(e) {return e.id}).indexOf(l.from_id);
            }
            console.log(sourceNode);
            console.log(get_coordinates(sourceNode,i));
            d3.select(this).attr("y1",function(){ return get_coordinates(sourceNode,i).y});

            return get_coordinates(sourceNode,i).x;
        })
        .attr("x2",function(l){
            var targetNode = graph.nodes.filter(function(d){ return d.id==l.to_id })[0];
            var i = 0;
            if (targetNode.type == 'ingredient') {
                i = ingredients.map(function(e) {return e.id}).indexOf(l.to_id);
            } else if (targetNode.type == 'step') {
                i = steps.map(function(e) {return e.id}).indexOf(l.to_id);
            }
            console.log(targetNode);
            console.log(get_coordinates(targetNode,i));
            d3.select(this).attr("y2",function(){ return get_coordinates(targetNode,i).y});
            return get_coordinates(targetNode, i).x;
        })
        .attr("fill","green")
        .attr("stroke", "gray");

});

