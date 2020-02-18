activeElement = null;
movedElement = null;
movedTempEl = null;
activeBBox = null;
drawingEnabled = false;
drawableElementWasClicked = false;
cords = {
    x: null,
    y: null
}

// *****************************************
window.onload = function(e){
    getSVGObjects();
    setupLabelsPanel();
    setupDeleting();
    setupDrawing();
    document.getElementById("saveButton").onclick = saveAsSvg;
}

function setupDeleting(){
    document.getElementById('deleteButton').onclick = function(e){
        if(!activeElement)
            return;
        drawingPanel.removeChild(activeElement);
        activeElement = null;
        document.getElementById('deleteButton').style.color = '';
        document.getElementById('deleteButton').style.background = '';
        removeResizeGrips();
        removeKnobs();
    }
}

// get svg document from <object> tag
function getDocument(embededEl) {
    // atr. contentDocument works in firefox
    if (embededEl.contentDocument) {
        return embededEl.contentDocument;
    } 
    else {
        var doc = null;
        try {
            doc = embededEl.getSVGDocument();
        } catch(e) {}
        return doc;
    }
}
        
function getSVGObjects() {
    drawingPanel = document.getElementById("drawingPanel");
    var elems = document.querySelectorAll(".embededSVG");
    for (let i = 0; i < elems.length; i++){
        var  doc = getDocument(elems[i]);
        // success
        if(doc){
            var svgEl = doc.getElementsByClassName("table")[0];
            svgEl.addEventListener("click",tableClicked,false);   
        }
    }
    
    // set drawing panel background
    drawingPanel.style = `background-image:url('graphics/svg/grid_background.svg'); background-repeat: repeat;`
    var panelOnClick = function(e){
        if(e.button == 0 && !drawableElementWasClicked){
            activeElement = null;
            removeResizeGrips();
            removeKnobs();
            document.getElementById('deleteButton').style.color = '';
            document.getElementById('deleteButton').style.background = '';
        }
        drawableElementWasClicked = false;
    }    
    drawingPanel.addEventListener('click', panelOnClick, false);
}

// whe mouse button pressed - start moving selected object
var drawableElementMouseD = function(e) {
    // check if left button was pressed
    if(e.button != 0  || drawingEnabled)
        return false;
    
    drawableElementWasClicked = true;
    document.getElementById('deleteButton').style.color = 'white';
    document.getElementById('deleteButton').style.background ='#d15656';

    var shapeEl = getTempRect(this);
    movedTempEl = shapeEl;
    // hide object
    this.style = "visibility:hidden;";
    // when moving occurs, show temporary shape 
    drawingPanel.appendChild(shapeEl);

    // initialise drawing panel cursor coords
    cords.x = e.clientX-getOffset(drawingPanel).x;
    cords.y = e.clientY-getOffset(drawingPanel).y;

    movedTempEl  = shapeEl; // object that will be moved
    var offset = getOffset(drawingPanel);
    var shapeBoundries  = this.getBoundingClientRect();
    // saves position of selected object
    this.xPos = shapeBoundries.left - offset.x;
    this.yPos = shapeBoundries.top - offset.y;
    movedElement = this;
    activeElement = movedElement;

    // add listeners 
    // -- dropping
    drawingPanel.addEventListener("mouseup",drawableElementMouseUp);
    // -- moving
    drawingPanel.addEventListener("mousemove",drawableElementMoved);
    // -- cursor leaves drawing panel
    drawingPanel.addEventListener("mouseleave",drawingPanelMouseLeave);
    
    // delete knobs and resize grips
    removeKnobs();
    removeResizeGrips();
}

// drop element
var drawableElementMouseUp = function(e){
    // check if left button was pressed
	if(e.button == 0){
        // remove eventlisteners from element        
        drawingPanel.removeEventListener("mouseup",drawableElementMouseUp);
		drawingPanel.removeEventListener("mousemove",drawableElementMoved);
        drawingPanel.removeEventListener("mouseleave",drawingPanelMouseLeave);

        // get previous translation
        var prevTranslation = movedElement.transform.baseVal.getItem(0);
        // calculate new position for dropped element
		var X = movedTempEl.xPos - movedElement.xPos; 
        var Y = movedTempEl.yPos - movedElement.yPos;

		X += prevTranslation.matrix.e;
		Y += prevTranslation.matrix.f;
        prevTranslation.setTranslate(X,Y);
        movedElement.style = "visibility:visible;";

        movedTempEl.parentNode.removeChild(movedTempEl); // remove temporary shape
        
        // append active element as last child so it overlaps other visible elements
        drawingPanel.appendChild(activeElement);
        movedElement = null;
        movedTempEl  = null;
        
        // add rotation knobs
        if(activeElement.getAttribute("data-rotation-enabled") == "true")
            addKnobs(activeElement);
        // add resize grips
        addResizeGrips(activeElement);
	}
}

function drawableElementMoved(e) {
    // get cursor position relative to drawing panel
    cx = e.clientX-getOffset(drawingPanel).x;
    cy = e.clientY-getOffset(drawingPanel).y;
    // move object
    moveSvgObject(movedTempEl ,cx - cords.x,cy-cords.y);
    // update cursor position
    cords.x = cx;
    cords.y = cy;
}

// if cursor leaves drawing panel and moving was in progress
function drawingPanelMouseLeave(e){
    var event = new MouseEvent('mouseup', {
        view: window,
        button: 0
      });
    // dispatch mouseup event
    drawingPanel.dispatchEvent(event); 
}

// add table to the drawing panel
var tableClicked = function(e){
	if(e.button==0){
        var drawableClone = this.cloneNode(true);
        // clear transform list of the element
        drawableClone.transform.baseVal.clear();
        
        // add default translation
        var translation = drawingPanel.createSVGTransform();
        drawableClone.transform.baseVal.appendItem(translation);
        translation.setTranslate(0,0);

        // add scale
        var scale = drawingPanel.createSVGTransform();
        drawableClone.transform.baseVal.appendItem(scale);
        scale.setScale(1,1);
        drawableClone.setAttribute("data-scale-x",1); // append x-scale data
        drawableClone.setAttribute("data-scale-y",1); // append y-scale data
        
        // add rotation
        var rotation = drawingPanel.createSVGTransform();
        drawableClone.transform.baseVal.appendItem(rotation);
        rotation.setRotate(0,0,0);
        drawableClone.setAttribute("data-rotation",0); // append rotation data

        drawableClone.setAttribute("data-rotation-enabled","true"); // disable rotation
		drawableClone.addEventListener('mousedown', drawableElementMouseD,true);
		drawingPanel.appendChild(drawableClone);    
	}
}

function moveSvgObject(svgObj,x,y) {
    var X = svgObj.xPos + x;
    var Y = svgObj.yPos + y;
    var X2 = svgObj.x2Pos + x;
    var Y2 = svgObj.y2Pos + y;
    svgObj.setAttributeNS(null, "d", "M"+X+" "+Y+" L"+X2+" "+Y+" L"+X2+" "+Y2+" L"+X+" "+Y2+" Z");    
    svgObj.xPos = X;
    svgObj.yPos = Y;
    svgObj.x2Pos = X2;
    svgObj.y2Pos = Y2;
}


function getTempRect(drawableEl,large = null){
    //get drawing panel offset
    var offset = getOffset(drawingPanel);
    // get boundries of the passed element
    var shapeBoundries  = drawableEl.getBoundingClientRect();
    // get position of the element for drawing panel coordinate system
    var x = shapeBoundries.left - offset.x;
    var x2 = x + shapeBoundries.width;
    var y = shapeBoundries.top - offset.y;
    var y2 = y + shapeBoundries.height;
    var tempRect = document.createElementNS("http://www.w3.org/2000/svg","path");
    if(large) {
        tempRect.setAttributeNS(null, "d", "M"+(x-2)+" "+(y-2)+" L"+(x2+2)+" "+(y-2)+" L"+(x2+2)+" "+(y2+2)+" L"+(x-2)+" "+(y2+2)+" Z");
        tempRect.setAttributeNS(null, "stroke-width", "5");
        tempRect.setAttributeNS(null, "stroke-opacity", "0");
    }
    else {
        tempRect.setAttributeNS(null, "d", "M"+x+" "+y+" L"+x2+" "+y+" L"+x2+" "+y2+" L"+x+" "+y2+" Z");
        tempRect.setAttributeNS(null, "stroke-width", "1");
        tempRect.setAttributeNS(null, "stroke-dasharray", "10,10");
    }
    tempRect.setAttributeNS(null, "fill", "none");
    tempRect.setAttributeNS(null, "stroke", "grey");

    tempRect.xPos = x;
    tempRect.yPos = y;
    tempRect.x2Pos = x2;
    tempRect.y2Pos = y2;

	return tempRect;
} 


function getTransformBBox(element){
    // get element's bbox
    var bbox = element.getBBox();
    // set svg attributes
    var rect = document.createElementNS("http://www.w3.org/2000/svg","rect");
    rect.setAttributeNS(null,"x",bbox.x.toFixed(2));
    rect.setAttributeNS(null,"y",bbox.y.toFixed(2));
    rect.setAttributeNS(null,"height",bbox.height.toFixed(2));
    rect.setAttributeNS(null,"width",bbox.width.toFixed(2));

    // get element's transform matrix
    var transformMatrix = element.getCTM();
    transformMatrix.scale = true;
    // create transform matrix in string form
    var tr = rect.transform.baseVal.createSVGTransformFromMatrix(element.getCTM());
    stringMatrix = transformMatrix.a.toFixed(2)+", "+transformMatrix.b.toFixed(2)+", "+transformMatrix.c.toFixed(2);
    stringMatrix += ", "+transformMatrix.d.toFixed(2)+", "+transformMatrix.e.toFixed(2)+", "+transformMatrix.f.toFixed(2);
    rect.setAttributeNS(null,"transform","matrix("+stringMatrix+")");
    rect.style = "visibility:hidden;";
    drawingPanel.appendChild(rect);
    var leftCorner = getRelativePos(rect);
    var boundingRect = rect.getBoundingClientRect();
    var w = Number(boundingRect.width.toFixed(2));
    var h = Number(boundingRect.height.toFixed(2));
    drawingPanel.removeChild(rect);
    return {
        x: leftCorner.x,
        y: leftCorner.y,
        w: w,
        h: h,
        rect:rect,
    }
}

// for pen drawing functionality
function setupDrawing(e){
    document.getElementById('pencilButton').onclick = function(e) {
        if(e.button != 0)
            return;
        if(drawingEnabled){
            drawingPanel.onmousemove = null;
            drawingPanel.onmousedown = null;
            drawingPanel.onmouseup = null;
            drawingPanel.style.cursor = 'auto';
            this.style.color = '';
            this.style.background = '';
        }
        else {
            this.style.color = 'white';
            this.style.background = '#74c46c';
            drawingPanel.style.cursor = 'crosshair';
            drawingPanel.onmousedown = onStartDrawing;
            drawingPanel.onmouseup = function (e) {
                drawingPanel.onmousemove = null;
                lines = [];
            }
            drawingPanel.onmouseleave = function (e) {
            var event = new MouseEvent('mouseup', {
                view: window,
                button: 0
              });
            // dispatch mouseup event
            drawingPanel.dispatchEvent(event);
            }
        }
        drawingEnabled = !drawingEnabled;
    }
}

function onStartDrawing(e){
    polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.style = "fill:none;stroke:#202a54;stroke-width:2.5;";
    polyline.setAttributeNS(null, "points", (e.clientX-getOffset(drawingPanel).x) + "," + (e.clientY-getOffset(drawingPanel).y));

    drawingPanel.onmousemove = function (e) {
        var points = polyline.getAttributeNS(null, "points");
        polyline.setAttributeNS(null, "points", points + " " + (e.clientX-getOffset(drawingPanel).x) + "," + (e.clientY-getOffset(drawingPanel).y));
        drawingPanel.appendChild(polyline);
    }
}
