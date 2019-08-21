// adds multiple attributes to ns node
function addAttributesNS(element, attrs){
    for( key in attrs){
        element.setAttributeNS(null,key,attrs[key]);
    }
}

// gets relative mouse movement coords based on passed MouseEvent parameter
function getRelativeMouseMovement(e) {
    // get postition of the mouse cursor  relative to the drawing panel
    var cx = e.clientX-getOffset(drawingPanel).x;
    var cy = e.clientY-getOffset(drawingPanel).y;
    // get relative movement values
    var dx = cx - cords.x;
    var dy = cy - cords.y;
    // update current mouse position
    cords.x = cx;
    cords.y = cy;

    return {
	   dx: dx,
	   dy: dy 
    };
}

// gets posttion of an element relative to the drawing panel
function getRelativePos(element){
    var offset = drawingPanel.getBoundingClientRect();
    var boundingRect = element.getBoundingClientRect();
    var x = boundingRect.x - offset.x;
    var y = boundingRect.y - offset.y;
    x = Number(x.toFixed(2));
    y = Number(y.toFixed(2));
    return {
        x,
        y,
        width: Number(boundingRect.width.toFixed(2)),
        height: Number(boundingRect.height.toFixed(2))
    };
}

// draws red point at x,y on the drawing panel
function drawPoint(x,y){
    var point = document.createElementNS("http://www.w3.org/2000/svg","circle");
    point.setAttributeNS(null,"cx",x);
    point.setAttributeNS(null,"cy",y);
    point.setAttributeNS(null,"r",2);
    point.setAttributeNS(null,"fill","red");
    drawingPanel.appendChild(point);
}

// gets element's distance from client view edge
function getOffset(element){
    var rect = element.getBoundingClientRect();
    return {
        x: rect.left,
        y: rect.top
    };    
}




//##############################################
/*
// functions for calculating rotation angle
//

// get vector from coordinates of two points
// p1 - vector's initial point
// p2 - vector's terminal point
function getVector(p1,p2){
    return [p2[0]-p1[0],p2[1]-p1[1]];
}

// dot product of two vectors [a1,b1] and [a2,b2]
function dotProd(a,b){
    return a[0]*a[1] + b[0]*b[1];
}

// vector length
function getVectorLen(v){
    return Math.sqrt(v[0]*v[0] + v[1]*v[1]);
}

function getAngle(center,point1,point2){
    var vec1 = getVector(point1,center);
    var vec2 = getVector(point2,center);
    var dotP = dotProd(vec1,vec2);
    var lenP = (getVectorLen(vec1) * getVectorLen(vec2));
    if(lenP == 0)
        return 0;
    var cosAlpha = dotP / lenP;
    var angle = Math.acos(cosAlpha) * (180/Math.PI);
    if(Number.isFinite(angle))
        return angle;
    else return 0;
}

*/