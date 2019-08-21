const resizeGripSize = 8; 
const resizeGripStyle = { "stroke":"gray", "fill":"#3489eb", "id":"resizeGrip"};

activeResizeGrips = [];
activeResizeGrip = null;
/*
adds resize "grips" to an element
called when element is clicked or dropped (mouseup)
*/
function addResizeGrips(element){
    // "clear" active grips array
    activeResizeGrips.length = 0;
    // grips distance from active element
    var gripOffset = 4 + resizeGripSize/2; 
    var grip = document.createElementNS("http://www.w3.org/2000/svg","rect");
    // get element's position and dimensions
    var elemPosition =  getRelativePos(element);
    var gripsPositions = [
        {
            // left-upper corner
            negationX: true, // get opposite value for x axis scaling 
            negationY: true, // get opposite value for y axis scaling 
            x: elemPosition.x - gripOffset, // x position of the grip
            y: elemPosition.y - gripOffset,  // y position of the grip
            cursor: "nw-resize-grip" // cursor style class
        }, 
        {   
            // right-upper corner
            negationX: false,
            negationY: true,
            x: elemPosition.x + elemPosition.width,
            y: elemPosition.y - gripOffset,
            cursor: "ne-resize-grip"

        },
        {   // left-bottom corner
            negationX: true,
            negationY: false,
            x: elemPosition.x - gripOffset,
            y: elemPosition.y + elemPosition.height,
            cursor: "sw-resize-grip"

        }, 
        {   
            // right-bottom corner
            negationX:false,
            negationY:false,
            x: elemPosition.x + elemPosition.width,
            y: elemPosition.y + elemPosition.height,
            cursor: "se-resize-grip"
        }, 
    ];

    var tempGrip;
    gripsPositions.forEach(function(gripInfo){
        // clone the rect element
        tempGrip = grip.cloneNode(false);
        // set position and size
        tempGrip.setAttributeNS(null,"x", gripInfo.x);
        tempGrip.setAttributeNS(null,"y", gripInfo.y);
        tempGrip.setAttributeNS(null,"width", resizeGripSize);
        tempGrip.setAttributeNS(null,"height", resizeGripSize);
        tempGrip.classList.add(gripInfo.cursor);
    
        // add style 
        addAttributesNS(tempGrip,resizeGripStyle);
        // add eventlistener for mousedown
        tempGrip.addEventListener('mousedown',gripMouseDown);
        // apend element to the drawing panel
        drawingPanel.appendChild(tempGrip);
        // information if scaling value should be negated
        tempGrip.setAttribute("data-negationX",gripInfo.negationX);
        tempGrip.setAttribute("data-negationY",gripInfo.negationY);
        // add grip as active
        activeResizeGrips.push(tempGrip);

        
    });
}

function gripMouseDown(e){
    removeKnobs();
    activeResizeGrip = this;
    var offset = getOffset(drawingPanel);
    cords.x = e.clientX - offset.x;
    cords.y = e.clientY - offset.y;
    activeBBox = getTransformBBox(activeElement);
    drawingPanel.addEventListener('mouseup',stopResizing, true);
    drawingPanel.addEventListener("mouseleave",drawingPanelMouseLeave);
    drawingPanel.addEventListener('mousemove',resize,true);
    
}


function stopResizing(e){
    drawingPanel.removeEventListener('mousemove',resize,true);
    drawingPanel.removeEventListener("mouseleave",drawingPanelMouseLeave);
    drawingPanel.removeEventListener('mouseup',stopResizing,true);
    addKnobs(activeElement);
}

/* 
remove active resize grips
called when another element becomes active
*/
 function removeResizeGrips(){
    activeResizeGrips.forEach(function(el){
        drawingPanel.removeChild(el);
    });
    // "clear" active grips array
    activeResizeGrips.length = 0;
}

// resize callback function
function resize(e){
    // get scale item
    var scale  = activeElement.transform.baseVal.getItem(1);
    var relMovement = getRelativeMouseMovement(e);
    var dx = relMovement.dx;
    var dy = relMovement.dy;

    if(activeResizeGrip.getAttribute("data-negationX")=="true"){
        dx = -dx; // get inverse for x axis
    }
  
    if(activeResizeGrip.getAttribute("data-negationY")=="true"){
        dy = -dy; // inverse for y axis
    }

    var prevRect = getRelativePos(activeElement);


    var scaleValueX = Number(activeElement.getAttribute("data-scaleX"));
    var scaleValueY = Number(activeElement.getAttribute("data-scaleY"));
    var prevScaleValueX = scaleValueX;
    var prevScaleValueY = scaleValueY;
    scaleValueX += dx/30;
    scaleValueY += dy/30;

    // if element is too small - prevent scaling for negative values
    if((scaleValueX < 0.3) || (scaleValueY < 0.3)){
        scaleValueX = prevScaleValueX;
        scaleValueY = prevScaleValueY;
        return;
    }

    scale.setScale(scaleValueX,scaleValueY);
    // update scale data
    activeElement.setAttribute("data-scaleX",scaleValueX.toFixed(2));
    activeElement.setAttribute("data-scaleY",scaleValueY.toFixed(2));
    
    var rect = getRelativePos(activeElement);
    // get current translation
    var translate = activeElement.transform.baseVal.getItem(0);

    var sx = rect.width - prevRect.width;
    var sy =  rect.height - prevRect.height;
    sx/=2;
    sy/=2;
    //console.log("sx = "+sx + " sy ="+ sy);
    var tx = rect.x -  prevRect.x + sx;
    var ty = rect.y -  prevRect.y + sy;

    activeBBox = rect;
    var translateX = translate.matrix.e - tx;
    var translateY = translate.matrix.f - ty;
    removeResizeGrips();
    // apply translation so object stays in the same position
    translate.setTranslate(translateX,translateY);
    addResizeGrips(activeElement);

}
