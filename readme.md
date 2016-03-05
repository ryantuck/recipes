# recipe layout

given json input containing nodes and links, the javascript should automatically generate a DAG using d3.

initially, i simply want to interpret ingredients and steps separately from one another for layout purposes. link graphics already work as expected. i need the steps to lay out properly according to their index value in the steps list.

completed.

once i accomplish that, then i can start baking in timing into the data model for the recipe. that can help determine the x coordinate (as a first pass) for the next step in the process.



