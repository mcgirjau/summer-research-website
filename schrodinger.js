// Andrew Moore

//------------------------------
// Graph Data Setup
//------------------------------

// graph variables
var laplacian,V,D,Vinv,psi=[],newpsi,vecs = [[],[],[]],force,node,link,nodes,links,defs,svg;

// simulation variables
var time = 0;
var path = [];
var viewPath = [];
var viewGradient = false;

// run the animation
var running = true;

// setup graph selector
graphData = obj.data;
graphSelector = document.getElementById("graphSelect");
for(var i=0; i<graphData.length; i++) {
  graphDatum = graphData[i];
  opt = document.createElement("OPTION");
  opt.setAttribute("value",i);
  opt.innerHTML = graphDatum.name;
  graphSelector.appendChild(opt);
}
graphSelector.setAttribute("oninput", "loadGraph(parseInt(this.value));");

loadGraph(0);

//------------------------------
// D3 Setup
//------------------------------

//var color = d3.scale.category20c();
//var color = d3.interpolate("blue","red");

function makeGradients() {
  grads = [];
  for(var i = 0; i < links.length; i++) {
    d = links[i];
    var id = "S"+d.source.id +"T" + d.target.id;
    
    var grad = defs.append("linearGradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr('x2', function(df) { return d.source.x; })
      .attr('y2', function(df) { return d.source.y; })
      .attr('x1', function(df) { return d.target.x; })
      .attr('y1', function(df) { return d.target.y; })
      .attr("id",  id);
      //.attr("gradientTransform", "rotate(" + angle + ")");
    grad.append("stop").attr("offset", "0%").attr("stop-color", color(d.target.state[0]));
    grad.append("stop").attr("offset", "100%").attr("stop-color", color(d.source.state[0]));
    grads.push(grad);
  }
}

function visualUpdate() {
  link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
      
  node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  for(var i = 0; i < nodes.length; i++) {
    if(colortype == "norm") {
      d3.select("#N"+i).style("fill", color(norm(nodes[i].state)));
    }else if(colortype == "real") {
      d3.select("#N"+i).style("fill", color(nodes[i].state[0]));
    }else if(colortype == "imaginary") {
      d3.select("#N"+i).style("fill", color(nodes[i].state[1]));
    }
    if(nodes[i].state[1] >=0) {
      d3.select("#NT"+i).text(Math.floor(nodes[i].state[0]*10)/10 + " + " +  Math.floor(nodes[i].state[1]*10)/10 + "i");
    }else{
      d3.select("#NT"+i).text(Math.floor(nodes[i].state[0]*10)/10 + " - " +  Math.abs(Math.floor(nodes[i].state[1]*10)/10) + "i");
    }
    // NO TEXT 
    //d3.select("#NT"+i).text("");
  }

  for(var i = 0; i < links.length; i++) {
    d = links[i];
    var id = "S"+d.source.id +"T" + d.target.id;
    grad = document.getElementById(id);
    grad.setAttribute("x2", d.source.x);
    grad.setAttribute("y2", d.source.y);
    grad.setAttribute("x1", d.target.x);
    grad.setAttribute("y1", d.target.y);
    if(!fastrender) {
      if(colortype == "norm") {
        grad.childNodes[0].setAttribute("stop-color", color(norm(d.target.state))); // 0% stop
        grad.childNodes[1].setAttribute("stop-color", color(norm(d.source.state))); // 100% stop
      }else if(colortype == "real") {
        grad.childNodes[0].setAttribute("stop-color", color(d.target.state[0])); // 0% stop
        grad.childNodes[1].setAttribute("stop-color", color(d.source.state[0])); // 100% stop
      }else if(colortype == "imaginary") {
        grad.childNodes[0].setAttribute("stop-color", color(d.target.state[1])); // 0% stop
        grad.childNodes[1].setAttribute("stop-color", color(d.source.state[1])); // 100% stop
      }
    }else{
      if(colortype == "norm") {
        c = blend_colors(color(norm(d.target.state)), color(norm(d.source.state)), 0.5);
        grad.childNodes[0].setAttribute("stop-color", c); // 0% stop
        grad.childNodes[1].setAttribute("stop-color", c); // 100% stop
      }
    }
  }
}

console.log("d3 finished");
d3Loaded = true;

//------------------------------
// Projection Program
//------------------------------

// only true when user has selected exactly two planes to project on.
var validProjection = false;

// start animation
window.requestAnimationFrame(draw);

function draw() {
  if(view == "proj") {
    var context = document.getElementById('DemoCanvas').getContext('2d');
    context.imageSmoothingEnabled = true;
    
    // re-fill background
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, 1600, 600);
    
    // draw axes
    context.strokeStyle = "#000000";
    context.beginPath(); 
    x=800;
    y=300;
    context.moveTo(x,600);
    context.lineTo(x,0);
    context.moveTo(0,y);
    context.lineTo(1600,y);
    context.stroke();
    
    // draw path
    scaleFactor = scaleSlide.value;
    if(viewPath.length > 0) {
      for(var i=1; i<viewPath.length;i++) {
        context.beginPath();
        if(viewGradient) {
          var grad = context.createLinearGradient(viewPath[i-1][0]*scaleFactor+x, viewPath[i-1][1]*scaleFactor+y,viewPath[i][0]*scaleFactor+x, viewPath[i][1]*scaleFactor+y);
          grad.addColorStop(0, "red");
          grad.addColorStop(1, "blue");
          context.strokeStyle = grad;
        }else{
          context.strokeStyle = distanceColor(viewPath[i][2]);
        }
        context.moveTo(x+viewPath[i-1][0]*scaleFactor,y-viewPath[i-1][1]*scaleFactor);
        context.lineTo(x+viewPath[i][0]*scaleFactor, y-viewPath[i][1]*scaleFactor);
        context.stroke();
        
        // draw the current position at the end so we can see the oscillations
        if(i==viewPath.length-1) {
          context.fillStyle = "#000";
          context.beginPath();
          context.arc(x+viewPath[i][0]*scaleFactor, y-viewPath[i][1]*scaleFactor, 3, 0, 2 * Math.PI);
          context.fill();
        }
      }
    }
  }

  // keep animation going
  window.requestAnimationFrame(draw);
}

//------------------------------
// Schrodinger Calculation
//------------------------------

// Actual calculations, on loop
animationStep = 20;

// first path point in phase space
addToPath(psi);

setInterval(function() {
  //readVecs();
  if(running) {
    // calculate new state vector
    operator = diagonalExponentialCC(scalarProductCC(D, [0,-time]));
    operator = matrixProductCC(V, matrixProductCC(operator, Vinv));
    newpsi = matrixProductCC(operator,psi);
    
    // add onto path in phase space
    addToPath(newpsi);
    
    // advance the flow of time
    time+=0.02; //.1 = real time 0.02 = standard
    
    // project the path
    if(validProjection) {
      viewPath = projectPath();
    }
    
    // D3 Update
    for(var i = 0; i < nodes.length; i++) {
      nodes[i].state = newpsi[i][0];
    }
    visualUpdate();
  }
}, animationStep);

//------------------------------
// Helper Functions
//------------------------------

// projects the 2n-dimensional path to the plane spanned by vectors u and v.
function projectPath() {
  vp = [];
  var u = vecs[0];
  var v = vecs[1];
  var t = vecs[2];
  for(var i=0; i<path.length; i++) {
    var pathVec = vecMinus(path[i],t);
    var projU = dot(u, pathVec);
    var projV = dot(v, pathVec);
    var projlenSq = projU*projU + projV*projV;
    var perpLen = Math.sqrt(vecNormSq(pathVec) - projlenSq);
    vp.push([projU, projV, perpLen]);
  }
  return vp;
}

// returns CSS color based on a distance value
function distanceColor(d) {
  //console.log(d);
  return "hsl("+Math.min(240,d*100)+", 100%, 50%)";
}

// transform a complex matrix vector into a path element in phase space
function addToPath(vc) {
  pathPoint = [];
  for(var i=0; i<vc.length;i++){
    pathPoint.push(vc[i][0][0]);
  }
  for(var i=0; i<vc.length;i++){
    pathPoint.push(vc[i][0][1]);
  }
  path.push(pathPoint);
}

// not used much--- transforms a state into a string of its real elements.
function stateStringReals(ps) {
  var str = "";
  for(var i=0; i<ps.length; i++) {
    str += ps[i][0][0] + " ";
  }
  return str;
}

function restartSim() {
  time = 0;
  path = [];
  viewPath = [];
  turnOnRunning();
  graphReloaded=true;
}

// loads a new state vector from the input form & restarts the simulation
function reloadPsi() {
  var inps = stateInput.value.split(/ /);
  var ps = [];
  for(var i=0; i<inps.length;i++) {
    if(inps[i].length > 0) {
      ps.push([[parseInt(inps[i]),0]]);
    }
  }
  psi = ps;
  restartSim();
}

// creates a new slider for modifying the vectors
function addNumSlider(container, vecname, vecnum, vecpart) {
  var id = vecname + vecnum + vecpart;
  rangeBox = document.createElement("DIV");
  container.appendChild(rangeBox);
  rangeBox.setAttribute("style", "display:inline-block;width:100%");
  slide = document.createElement("INPUT");
  rangeBox.appendChild(slide);
  slide.setAttribute("type", "range");
  slide.setAttribute("class", "thinslider");
  slide.setAttribute("style", "display: inline-block;vertical-align:top");
  dispTextBox = document.createElement("DIV");
  container.appendChild(dispTextBox);
  dispTextBox.setAttribute("style", "display:inline-block;width:20%");
  dispText = document.createElement("DIV");
  dispTextBox.appendChild(dispText);
  dispText.setAttribute("class","rangeTextSmall");
  dispText.setAttribute("style", "transform: translateX(-46px);text-align:right;");
  dispText.innerHTML = "-0.00";
  nameBox = document.createElement("DIV");
  container.appendChild(nameBox);
  nameBox.setAttribute("style", "display:inline-block;width:20%");
  nameText = document.createElement("DIV");
  nameBox.appendChild(nameText);
  nameText.setAttribute("class","rangeTextSmall");
  nameText.setAttribute("style", "transform: translateX(-294px);");
  nameText.innerHTML = "<i>" + vecname + "</i><sub>" + vecnum + "</sub>" + vecpart;
  container.appendChild(document.createElement("BR"));

  slide.id = id + "V";
  slide.min = -1.0;
  slide.max = 1.0;
  slide.step = 0.01;
  slide.value = 0.0;
  slide.setAttribute("oninput", "readVecs()");
  
  dispText.innerHTML = slide.value;
  dispText.setAttribute("id", id + "D");
}

// updates the display of a single slider & returns its value
function updateVecDisplay(id) {
  val = document.getElementById(id + "V");
  disp = document.getElementById(id + "D");
  num = val.value;
  disp.innerHTML = num + "";
  return num;
}

// updates all the sliders & processes the vectors they refer to.
function readVecs() {
  // read off vectors from the input form
  for(var i=0; i<psi.length; i++) {
    vecs[0][i] = updateVecDisplay("u" + i + "Re");
    vecs[1][i] = updateVecDisplay("v" + i + "Re");
    vecs[2][i] = updateVecDisplay("t" + i + "Re");
  }
  for(i=0; i<psi.length; i++) {
    vecs[0][i+psi.length] = updateVecDisplay("u" + i + "Im");
    vecs[1][i+psi.length] = updateVecDisplay("v" + i + "Im");
    vecs[2][i+psi.length] = updateVecDisplay("t" + i + "Im");
  }
  
  var uNorm = normalize(vecs[0]);
  var vNorm = normalize(vecs[1]);
  var tNorm = normalize(vecs[2]);
  
  // normalize vectors & see if we can project
  if(uNorm == -1 || vNorm == -1) {
    validProjection = false;
    viewPath = [];
  }else{  
    vecs[0] = uNorm;
    vecs[1] = vNorm;
    if(tNorm != -1) {
      vecs[2] = vecScale(tNorm,tanSlide.value);
    }
    validProjection = true;
    // update projection
    viewPath = projectPath();
  }
}

function loadGraph(index) {
  laplacian = graphData[index].laplacian;
  V = graphData[index].v;
  D = graphData[index].d;
  Vinv = graphData[index].v_inverse;
  if(psi.length != laplacian.length) {
    psi = [];
    laplacian.forEach(function(e) {psi.push([[1,0]]);});
    stateInput.value = stateStringReals(psi);
  }
  newpsi = psi;
  
  // create vector input panels
  vecs = [[],[],[]];
  
  // clear old panels
  uPanel.innerHTML = "";
  vPanel.innerHTML = "";
  tPanel.innerHTML = "";
  
  // add new sliders
  for(var i=0; i<psi.length; i++) {
      addNumSlider(uPanel, "u", i, "Re");
      addNumSlider(uPanel, "u", i, "Im");
      addNumSlider(vPanel, "v", i, "Re");
      addNumSlider(vPanel, "v", i, "Im");
      addNumSlider(tPanel, "t", i, "Re");
      addNumSlider(tPanel, "t", i, "Im");
      [0,0,1,1,2,2].forEach(function(element) {
        vecs[element].push(0);
      });
  }
  
  // D3 Setup
  createD3();
  
  // Start the sim again
  restartSim();
}

function loadD3Nodes() {
  nodes = [];
  links = [];
  
  for (var i = 0; i < laplacian.length; i++) {
      nodes.push({ x: width/2+getRandomInt(0,20), y: height/2+getRandomInt(0,20), state: psi[i][0], id: i}); //{name: names[i], id: i, reflexive: false, highlighted:false } );
  }
  
  if(directed) {
    for (var i = 0; i < laplacian.length; i++) {
        for (var j = 0; j < laplacian.length; j++) {
          if( i != j && laplacian[i][j][0] == -1) {
            links.push( { source: i, target: j } );
          }
        }
    }
  }else{
    for (var i = 0; i < laplacian.length; i++) {
        for (var j = i; j < laplacian.length; j++) {
          if( i != j && laplacian[i][j][0] == -1) {
            links.push( { source: i, target: j } );
          }
        }
    }
  }
}


function createD3() {
  document.getElementById("graphDiv").innerHTML = "";
  loadD3Nodes();
  
  svg = d3.select('#graphDiv').append('svg')
        .attr('width', "100%")
        .attr('height', height-120)
        .attr('id','svgEle');
    //.style("background-color", '#202020');
  svg.append("rect")
      .attr("width", "100%")
      .attr("height", height-120);
      
  defs = svg.append("defs");
  
  force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .size([width, height])
    .linkDistance(150) //30 or 60
    .linkStrength(3)
    .charge(-500) // -500
    .gravity(0.1); //0.01
    
  force.start();
  
  makeGradients();
  
  if(directed) {
    defs.selectAll("marker")
      .data(["child"])
      .enter().append("svg:marker")
      .attr("id", String)
      .attr("markerUnits", "userSpaceOnUse")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 42) //60
      .attr("refY", 0) //-1.1
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .style("fill", function(d) { return "white"; })
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");
  }
  
  link = svg.selectAll('.link')
      .data(links)
      .enter().append('line')
      .attr('class', 'link')
      .attr("marker-end", "url(#child)")
      .attr('x1', function(d) { return d.source.x; })
      .attr('y1', function(d) { return d.source.y; })
      .attr('x2', function(d) { return d.target.x; })
      .attr('y2', function(d) { return d.target.y; })
      .style("stroke-width", function(d) { return 10; })
      .style("stroke", function(d){
            var id = "S"+d.source.id +"T" + d.target.id;
            return "url(#" + id + ")";  // gradient mode
            //return "#ff0000";
            
        });
      
  node = svg.selectAll('.node')
      .data(nodes)
      .enter().append("g")
          .attr("class", "node")
          .call(force.drag);
      
  node.append("circle")
          .attr("class", "node")
          .attr("x", function(d) { return d.x; })
          .attr("y", function(d) { return d.y; })
          .attr("r", 5)
          .attr('id', function(d) {
        return "N"+d.id;
      })
      .style("fill", function(d){
            var id = "N"+d.id;
            return "url(#" + id + ")";
        })
      .style("stroke", "black");
      
  node.append("text")
          .attr("class", "nodetext")
          .attr("dx", 12)
          .attr("dy", ".35em")
          .text(function(d) { return d.state })
          //.style("fill", "white")
          .attr('id', function(d) {
        return "NT"+d.id;
      });
      
  force.on('tick', visualUpdate);
  
}