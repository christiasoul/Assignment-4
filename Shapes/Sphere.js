//
//  Sphere.js
//

function Sphere(slices, stacks) {
  this.positions = {};
  this.indices = {};

  this.primitives = [];

  this.slices = slices || 20; // Default number of slices
  this.stacks = stacks || 12; // Default number of stacks

  this.init = function () {

    this.program = initShaders(gl, 
        this.vertexShader || "Sphere-vertex-shader", 
        this.fragmentShader || "Sphere-fragment-shader");

    // Record the number of components for each vertex in the JavaScript's 
    // positions property (that's why there's a this preceding the 
    // positions here)
    this.positions.numComponents = 3;

    // Generate the sphere's geometry (i.e., positions)
    var dPhi = Math.PI / this.stacks;
    var dTheta = 2.0 * Math.PI / this.slices;
    
    var positions = [];

    positions.push(0.0, 0.0, 1.0);

    for ( var j = 1; j < this.stacks; ++j ) {
      var phi = j * dPhi;
      var z = Math.cos(phi);

      for ( var i = 0 ; i < this.slices; ++i ) {
        var theta = i * dTheta;
        var sinPhi = Math.sin(phi);
        var x = Math.cos(theta) * sinPhi;
        var y = Math.sin(theta) * sinPhi;

        positions.push(x, y, z);
      }
    }

    positions.push(0.0, 0.0, -1.0);

    this.count = positions.length / this.positions.numComponents;

    // Generate the sphere's topology (i.e., indices)
    var indices = [ ];

    // Generate the indices for the North Pole cap
    var start = indices.length;
    var offset = start * 2 /* sizeof(gl.UNSIGNED_SHORT) */;

    var n = 1;  // starting value of each "row" of indices

    indices.push(0);
    for ( var i = 0; i < this.slices; ++i ) {
      var m = n + i;
      indices.push(m);
    }
    indices.push(n);
    
    this.primitives.push({
      type : gl.TRIANGLE_FAN,
      count : indices.length,
      offset : offset
    });

    // Generate the indices for each band around the sphere
    start = indices.length;
    offset = start * 2 /* sizeof(gl.UNSIGNED_SHORT) */;

    for ( var j = 0; j < this.stacks - 2; ++j ) {
      for ( var i = 0; i < this.slices; ++i ) {
        var m = n + i;
        indices.push(m);
        indices.push(m + this.slices);
      }
      indices.push(n);
      indices.push(n + this.slices);

      n += this.slices;

      this.primitives.push({
        type : gl.TRIANGLE_STRIP,
        count : indices.length - start,
        offset : offset
      });

      start = indices.length;
      offset = start * 2 /* sizeof(gl.UNSIGNED_SHORT) */;
    }    

    // Generate the indices for the South Pole cap
    indices.push(n + this.slices);
    indices.push(n);
    for ( var i = 0; i < this.slices; ++i ) {
      var m = n + this.slices - i - 1;
      indices.push(m);
    }
    
    this.primitives.push({
      type : gl.TRIANGLE_FAN,
      count : indices.length - start,
      offset : offset
    });

    this.positions.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positions.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    this.indices.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), 
      gl.STATIC_DRAW);

    this.positions.attribute = gl.getAttribLocation(this.program, "vPosition");
  };

  this.draw = function () {
    
    gl.useProgram(this.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positions.buffer);
    gl.vertexAttribPointer(this.positions.attribute, 
      this.positions.numComponents, gl.FLOAT, gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(this.positions.attribute);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer);

    var pointMode = this.pointMode;
    this.primitives.forEach( function(prim) {
      gl.drawElements(pointMode ? gl.POINTS : prim.type, prim.count, 
        gl.UNSIGNED_SHORT, prim.offset);
    });
  };
};
