const rotate_cursor = "rotate-cursor";  // rotate cursor style class
const rotationKnobRadius = 5;           // rotation knob radius
const knobOffset = 15;                  // knob offset from active element
const knobStyle = {"stroke":"gray", "stroke-width":1, "fill":"white", "id":"knob"}; // knob style

centroid = null;
activeKnobs = []; // active(visible) rotation knobs

function addKnobs(element){
    // use getTempRect function - get evaluated position of the element
    var elemPosition =  getRelativePos(element);
    // create svg circle
    var knob = document.createElementNS("http://www.w3.org/2000/svg","circle");
    // set left rotation knob
    knob.setAttributeNS(null, "cx", elemPosition.x - knobOffset);
    knob.setAttributeNS(null, "cy", elemPosition.y - knobOffset);
    knob.setAttributeNS(null, "r", rotationKnobRadius);
    knob.classList.add(rotate_cursor);
    addAttributesNS(knob,knobStyle);
    drawingPanel.appendChild(knob);
    activeKnobs.push(knob);

    knob = document.createElementNS("http://www.w3.org/2000/svg","circle");
    // set right rotation knob
    knob.setAttributeNS(null, "cx", elemPosition.x + elemPosition.width + knobOffset);
    knob.setAttributeNS(null, "cy", elemPosition.y - knobOffset);
    knob.setAttributeNS(null, "r", rotationKnobRadius);
    knob.classList.add(rotate_cursor);

    addAttributesNS(knob,knobStyle);
    drawingPanel.appendChild(knob);
    activeKnobs.push(knob);

    // add mousedown event listeners
    for(let i=0; i < activeKnobs.length; i++)
        activeKnobs[i].addEventListener("mousedown",rotateElement);
}


// delete active rotation knobs
function removeKnobs(){
    activeKnobs.forEach(knob => 
        drawingPanel.removeChild(knob));
    // "clear" active knobs array
    activeKnobs.length = 0;
}

// function for handling knob's mousedown event 
function rotateElement(e){
    if(e.button != 0)
        return;
    drawableElementWasClicked = true;
    if(centroid == null)
        centroid = getCentroid(activeElement);

    // get current rotation item    
    var rotation = activeElement.transform.baseVal.getItem(2);
    
    var rotationValue = Number(activeElement.getAttribute("data-rotation"));
    
    if(this == activeKnobs[1]) 
        rotationValue+=15; // rotate right
    else 
        rotationValue-=15; // rotate left
    rotation.setRotate(rotationValue,centroid[0],centroid[1]); // apply rotation
    activeElement.setAttribute("data-rotation",rotationValue); // update rotation data
}

// gets centroid of an element
function getCentroid(element){
    var box = element.getBBox();
    var halfX = (box.width)/2 + box.x;
    var halfY = (box.height)/2 + box.y;
    return [halfX,halfY];
}