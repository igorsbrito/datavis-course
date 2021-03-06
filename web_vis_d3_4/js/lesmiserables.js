function Network() {


  var allData = [],
  width = 1000,
  height = 800,
  // our force directed layout
  force = d3.layout.force(), 
  // these will point to the circles and lines
  // of the nodes and links
  link = null,
  node = null,
  // these will hold the svg groups for
  // accessing the nodes and links display
  linksG = null,
  nodesG = null,
  // tooltip used to display details
  tooltip = Tooltip("vis-tooltip", 230),
  network; //function

  // Helper function to map node id's to node objects.
  // Returns d3.map of ids -> nodes
  function mapNodes(nodes) {
    var nodesMap;
    nodesMap = d3.map();
    nodes.forEach(function(n) {
      return nodesMap.set(n.id, n);
    });
    return nodesMap;
  }


  

  function setupData(data) {

    var circleRadius, countExtent, countConnections, arrayCountConnections;
    // initialize circle radius scale
    arrayCountConnections = [];

    
    countExtent = d3.extent(data.nodes, function(d) {
      return d.group;
      });
    console.log(countExtent);

    countConnections = d3.extent(data.nodes, function(n){
      var count = 0;
      var name = n.id;

      data.links.forEach(function(l){
        if(l.source == name || l.target == name) count = count + 1;
      });
      return count;

    });

    console.log(countConnections);
    console.log(data.nodes);
    circleRadius = d3.scale.sqrt().range([1, 15]).domain(countConnections);

    //First let's randomly dispose data.nodes (x/y) within the the width/height
    // of the visualization and set a fixed radius for now
    data.nodes.forEach(function(n) {
      var randomnumber;
      var count = 0;
      data.links.forEach(function(l){
            if(l.source == n.id || l.target == n.id) count = count + 1;
      });
      n.connections =  count;
      // set initial x/y to values within the width/height
      // of the visualization
      n.x = randomnumber = Math.floor(Math.random() * width);
      n.y = randomnumber = Math.floor(Math.random() * height);

      // add radius to the node so we can use it later
      n.radius = circleRadius(3*n.connections);
    });

    // Then we will create a map with
    // id's -> node objects
    // using the mapNodes function above and store it in the nodesMap variable.
    var nodesMap = mapNodes(data.nodes);

    // Then we will switch links to point to node objects instead of id's
    data.links.forEach(function(l) {
      l.source = nodesMap.get(l.source);
      l.target = nodesMap.get(l.target);
    });

    return data;

  }

  // Mouseover tooltip function
  function showDetails(d, i) {
      var content;
    content = '<p class="main"> Name: ' + d.id + '</span></p>';
    content += '<hr class="tooltip-hr">';
    content += '<p class="main"> Grup: ' + d.group + '</span></p>';
    tooltip.showTooltip(content, d3.event);

    // highlight the node being moused over
    return d3.select(this).style("stroke", "black").style("stroke-width", 2.0);


  }

  // Mouseout function
  function hideDetails(d, i) {
    tooltip.hideTooltip();
    // watch out - don't mess with node if search is currently matching
    node
      .style("stroke", function(n) {
        return "#555";
      })
      .style("stroke-width", function(n) {
        return 1.0;
      });
  }

  // enter/exit display for nodes
  function updateNodes() {
    //select all node elements in svg group of nodes
    node = nodesG.selectAll("circle.node")
      .data(allData.nodes, function(d) {
        return d.id; });

    // set cx, cy, r attributes and stroke-width style
    node.enter()
      .append("circle").attr("class", "node").attr("cx", function(d) {
        return d.x;})
      .attr("cy", function(d) {
        return d.y;})
      .attr("r", function(d) {
        return d.radius;})
      .attr('color','#1f12aa')
      .style("stroke-width", 1.0)
      .attr("style", "fill: #6447bc" )
      .on("mouseover", showDetails).on("mouseout", hideDetails);

  }

  // enter/exit display for links
  function updateLinks() {
    link = linksG.selectAll("line.link")
      .data(allData.links, function(d) { return `${d.source.id}_${d.target.id}`; });

    link.enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke", "#ddd").attr("stroke-opacity", 0.8)
      .attr("x1", function(d) {
        return d.source.x; })
      .attr("y1", function(d) {
        return d.source.y; })
      .attr("x2", function(d) {
        return d.target.x; })
      .attr("y2", function(d) {
        return d.target.y; });


  }

  // tick function for force directed layout
  var forceTick = function(e) {
    node.attr("cx", function(d) {
      return d.x; })
    .attr("cy", function(d) {
      return d.y; });

    link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) {
        return d.source.y; })
      .attr("x2", function(d) {
        return d.target.x; })
      .attr("y2", function(d) {
        return d.target.y;});
  };

  // Starting point for network visualization
  // Initializes visualization and starts force layout
  network = function(selection, data) {
    var vis;
    // format our data
    allData = setupData(data);

    // create our svg and groups
    vis = d3.select(selection).append("svg").attr("width", width).attr("height", height);
    linksG = vis.append("g").attr("id", "links");
    nodesG = vis.append("g").attr("id", "nodes");

    // setup the size of the force environment
    force.size([width, height]);

    // setup nodes and links
    force.nodes(allData.nodes);
    force.links(allData.links);
    
    // enter / exit for nodes
    updateNodes();
    
    // enter / exit for links
    updateLinks();
    
    // set the tick callback, charge and linkDistance
    force.on("tick", forceTick).charge(-250).linkDistance(160);
    
    // perform rendering and start force layout
    return force.start();
   
  };

  return network;
}
