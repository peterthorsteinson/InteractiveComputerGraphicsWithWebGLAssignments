"use strict";

var canvas;
var gl;
var points = [];
var numTimesToSubdivide = 0;
var theta = 0.0;
var program;
var bigTriangle = [vec2(-0.7, -0.4041), vec2(0, 0.8083), vec2(0.7, -0.4041)];
var bigSquare = [vec2(-0.6, -0.6), vec2(0.6, -0.6), vec2(0.6, 0.6), vec2(-0.6, 0.6)];
var initialPolygon = 0;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); } else {
        gl.viewport(0.0, 0.0, canvas.width, canvas.height);
        gl.clearColor(1.0, 1.0, 1.0, 1.0);  // clear white
        program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);

        $(function () {
            $("#numTimesToSubdivideSlider").slider({
                value: 0,
                min: 0,
                max: 10,
                step: 1,
                slide: function (event, ui) {
                    $("#textLevelOutput").val(ui.value);
                    numTimesToSubdivide = parseInt(ui.value);
                    render();
                }
            });
        });

        $(function () {
            $("#thetaSlider").slider({
                value: 0,
                min: -360,
                max: 360,
                step: 1,
                slide: function (event, ui) {
                    $("#thetaOutput").val(ui.value);
                    theta = parseInt(ui.value);
                    theta = (theta * Math.PI) / 180.0;
                    render();
                }
            });
        });

        $(function () {
            $("#initialPolygon").selectmenu({
                width: 150,
                change: function (event, ui) {
                    if (ui.item.value === "triangle") {
                        initialPolygon = 0;
                    }
                    if (ui.item.value === "square") {
                        initialPolygon = 1;
                    }
                    render();
                }
            });
        });

        render();
    }
}

function triangle(a, b, c) {
    points.push(a, b, c);
}

function divideTriangle(a, b, c, count) {
    if (count == 0) {
        triangle(a, b, c);
    } else {
        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);
        count--;
        divideTriangle(a, ab, ac, count);
        divideTriangle(c, ac, bc, count);
        divideTriangle(b, bc, ab, count);
        //divideTriangle(ab, ac, bc, count); // uncomment to get solid fill
    }
}

function tessellatePolygon() {
    if (initialPolygon == 0) {
        divideTriangle(bigTriangle[0], bigTriangle[1], bigTriangle[2], numTimesToSubdivide);
    }
    else if (initialPolygon == 1) {
        divideTriangle(bigSquare[0], bigSquare[1], bigSquare[2], numTimesToSubdivide);
        divideTriangle(bigSquare[0], bigSquare[2], bigSquare[3], numTimesToSubdivide);
    }
}

function render() {
    points = [];
    tessellatePolygon();
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.uniform1f(gl.getUniformLocation(program, "theta"), theta);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
    points = [];
}
