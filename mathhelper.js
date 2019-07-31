//------------------------------
// MATH
//------------------------------

function vecScale(v, x) {
  var res = [];
  v.forEach(function(y){res.push(y*x);});
  return res;
}

// square scalar
function sq(x) {
  return x*x;
}

function vecNormSq(v) {
  var sum =0;
  for(var i=0; i<v.length;i++) {
    sum+=v[i]*v[i];
  }
  return sum;
}

// normalize vector
function normalize(v) {
  var sum = vecNormSq(v);
  if(sum === 0) {
    return -1;
  }
  sum = Math.sqrt(sum);
  var res = [];
  v.forEach(function(x){res.push(x/sum);});
  return res;
}


// real vector dot product
function dot(v1, v2) {
  if(v1.length != v2.length) {
    console.log("vector length mismatch error");
    return 0;
  }
  var sum = 0;
  for(var i=0; i<v1.length; i++) {
    sum += v1[i]*v2[i];
  }
  return sum;
}

// vector difference v1-v2
function vecMinus(v1, v2) {
  if(v1.length != v2.length) {
    console.log("vector length mismatch error");
    return 0;
  }
  var res = [];
  for(var i=0; i<v1.length; i++) {
    res.push(v1[i]-v2[i]);
  }
  return res;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// complex norm
function norm(z) {
  return Math.sqrt(z[0]*z[0] + z[1]*z[1]);
}

// complex multiplication
function FOIL(x, z) {
  var Re = x[0] * z[0] - x[1]*z[1];
  var Im = x[1] * z[0] + x[0]*z[1];
  return [Re, Im];
}

// complex addition
function addCC(x, z) {
  var Re = x[0] + z[0];
  var Im = x[1] + z[1];
  return [Re, Im];
}

// complex exponent
function euler(x) {
  var Re = Math.exp(x[0]) * Math.cos(x[1]);
  var Im = Math.exp(x[0]) * Math.sin(x[1]);
  return [Re, Im];
}

function factorial(n) {
  // why would you ever need to go higher than this? factorials of 0 through 21
  var factorials = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600, 6227020800, 87178291200, 1307674368000, 20922789888000, 355687428096000, 6402373705728000, 121645100408832000, 2432902008176640000, 51090942171709440000];
  if(n < factorials.length) {
    return factorials[n];
  }else{
    return factorial(n-1) * n;
  }
}

// max precision 
function matrixExponential(A, precision) {
  result = identityMatrix(A.length);
  for(var i=1; i<=precision; i++) {
    result = matrixAddition(result, scalarProduct(matrixPower(A, i), 1/factorial(i)));
  }
  return result;
}

function diagonalExponential(D) {
  result = identityMatrix(D.length);
  for(var i=0; i < D.length; i++) {
    result[i][i] = Math.exp(D[i][i]); 
  }
  return result;
}

function diagonalExponentialCC(D) {
  result = identityMatrixCC(D.length);
  for(var i=0; i < D.length; i++) {
    result[i][i] = euler(D[i][i]); 
  }
  return result;
}

function matrixPower(A, n) {
  if(n===0) {
    return identityMatrix(A.length);
  }
  result = A;
  for(var i=1; i<n; i++) {
    result = matrixProduct(result, A);
  }
  return result;
}

function scalarProduct(A, c) {
  result = [];
  for(var i=0; i < A.length; i++) {
    row = [];
    for(var j=0; j < A[0].length; j++) {
      row.push(A[i][j]*c);
    }
    result.push(row);
  }
  return result;
}

function scalarProductCC(A, c) {
  result = [];
  for(var i=0; i < A.length; i++) {
    row = [];
    for(var j=0; j < A[0].length; j++) {
      row.push(FOIL(A[i][j],c));
    }
    result.push(row);
  }
  return result;
}

function matrixAddition(A, B) {
  result = [];
  for(var i=0; i < A.length; i++) {
    row = [];
    for(var j=0; j < A[0].length; j++) {
      row.push(A[i][j] + B[i][j]);
    }
    result.push(row);
  }
  return result;
}

function matrixAdditionCC(A, B) {
  result = [];
  for(var i=0; i < A.length; i++) {
    row = [];
    for(var j=0; j < A[0].length; j++) {
      row.push(addCC(A[i][j],B[i][j]));
    }
    result.push(row);
  }
  return result;
}
  
  
function matrixProduct(A, B) {
  //we'll say that A is a x b and B is c x d
  var a = A.length;
  var b = A[0].length;
  var c = B.length;
  var d = B[0].length;
  
  if(b != c) {
    // dimension mismatch
    return -1;
  }
  
  result = [];
  for(var i=0; i < a; i++) {
    row = [];
    for(var j=0; j < d; j++) {
      // dot product--- A's ith row DOT B's jth column
      sum = 0;
      for(var k=0; k < b; k++) {
        sum += A[i][k] * B[k][j];
      }
      row.push(sum);
    }
    result.push(row);
  }
  return result;
}

function matrixProductCC(A, B) {
  //we'll say that A is a x b and B is c x d
  var a = A.length;
  var b = A[0].length;
  var c = B.length;
  var d = B[0].length;
  
  if(b != c) {
    // dimension mismatch
    return -1;
  }
  
  result = [];
  for(var i=0; i < a; i++) {
    row = [];
    for(var j=0; j < d; j++) {
      // dot product--- A's ith row DOT B's jth column
      sum = [0,0];
      for(var k=0; k < b; k++) {
        sum = addCC(sum, FOIL(A[i][k],B[k][j]));
      }
      row.push(sum);
    }
    result.push(row);
  }
  return result;
}

function identityMatrix(n) {
  result = [];
  for(var i=0; i < n; i++) {
    row = [];
    for(var j=0; j < n; j++) {
      if(i==j) { 
        row.push(1);
      }else{
        row.push(0);
      }
    }
    result.push(row);
  }
  return result;
}

function identityMatrixCC(n) {
  result = [];
  for(var i=0; i < n; i++) {
    row = [];
    for(var j=0; j < n; j++) {
      if(i==j) { 
        row.push([1,0]);
      }else{
        row.push([0,0]);
      }
    }
    result.push(row);
  }
  return result;
}

//------------------------------
// COLORS
//------------------------------

function blend_colors(color1, color2, percentage) {
    // check input
    color1 = color1 || '#000000';
    color2 = color2 || '#ffffff';
    percentage = percentage || 0.5;

    // 1: validate input, make sure we have provided a valid hex
    if (color1.length != 4 && color1.length != 7)
        throw new error('colors must be provided as hexes');

    if (color2.length != 4 && color2.length != 7)
        throw new error('colors must be provided as hexes');    

    if (percentage > 1 || percentage < 0)
        throw new error('percentage must be between 0 and 1');


    // 2: check to see if we need to convert 3 char hex to 6 char hex, else slice off hash
    //      the three character hex is just a representation of the 6 hex where each character is repeated
    //      ie: #060 => #006600 (green)
    if (color1.length == 4)
        color1 = color1[1] + color1[1] + color1[2] + color1[2] + color1[3] + color1[3];
    else
        color1 = color1.substring(1);
    if (color2.length == 4)
        color2 = color2[1] + color2[1] + color2[2] + color2[2] + color2[3] + color2[3];
    else
        color2 = color2.substring(1);   


    // 3: we have valid input, convert colors to rgb
    color1 = [parseInt(color1[0] + color1[1], 16), parseInt(color1[2] + color1[3], 16), parseInt(color1[4] + color1[5], 16)];
    color2 = [parseInt(color2[0] + color2[1], 16), parseInt(color2[2] + color2[3], 16), parseInt(color2[4] + color2[5], 16)];


    // 4: blend
    var color3 = [ 
        (1 - percentage) * color1[0] + percentage * color2[0], 
        (1 - percentage) * color1[1] + percentage * color2[1], 
        (1 - percentage) * color1[2] + percentage * color2[2]
    ];


    // 5: convert to hex
    color3 = '#' + int_to_hex(color3[0]) + int_to_hex(color3[1]) + int_to_hex(color3[2]);


    // return hex
    return color3;
}

/*
    convert a Number to a two character hex string
    must round, or we will end up with more digits than expected (2)
    note: can also result in single digit, which will need to be padded with a 0 to the left
    @param: num         => the number to conver to hex
    @returns: string    => the hex representation of the provided number
*/
function int_to_hex(num) {
    var hex = Math.round(num).toString(16);
    if (hex.length == 1)
        hex = '0' + hex;
    return hex;
}

function color(x) {
  aboveColor = Math.floor(x+1);
  belowColor = Math.floor(x);
  if(belowColor >= spectrum.length-1) {
    return spectrum[spectrum.length-1];
  }
  if(aboveColor <= 0) {
    return spectrum[0];
  }
  if(x-belowColor < 0.05) {
    return spectrum[belowColor];
  }
  return blend_colors(spectrum[belowColor], spectrum[aboveColor], x-belowColor);
}
