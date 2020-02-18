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

// gets position of an element relative to the drawing panel
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
