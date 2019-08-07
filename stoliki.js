//buff = [];
// promien galki pozwalajacej na obrot obiektu
const rotationKnobRadius = 5;
const knobDistance = 2;
const knobStyle = {"stroke":"gray", "stroke-width":1, "fill":"white", "id":"knob"};

activeKnobs = []; // active(visible) rotation knobs
activeElement = null;
tables_count = 4;
movedElement = null;
movedTempEl = null;
activeResizeBorder = null;
elementClicked = false;
centroid = null;
ok = 'OK!';
cords = {
    x: null,
    y: null
}
rotate = 0;


// *****************************************
// zaczekaj na elementy svg  az sie zaladuja
window.addEventListener("load", getSVGObjects, false);
		
// uzyskaj dokument SVG z tagu <object>
function getDocument(embededEl) {
    drawingPanel = document.getElementById("drawingPanel");

    // atr. contentDocument dziala poprawnie w firefoxie
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
    var elems = document.querySelectorAll(".embededSVG");
    for (let i = 0; i < elems.length; i++){
        var  doc = getDocument(elems[i]);
        // jesli udalo sie pobrac pliki svg
        if(doc){
            for(let i=0;i<tables_count;i++){
                // konfiguracja stolow
                var svgEl = doc.getElementById('table'+i);
                svgEl.addEventListener("click",tableClicked,false);   
            }
        }
    }

    drawingPanel.style = "background-image:url(grid_background.svg); background-repeat: repeat;"
}




// rozpocznij przemieszczanie obiektu, gdy przytrzymano przycisk
// obsluga tylko lewym przyciskiem myszki
var drawableElementMouseD = function(e) {
    if(activeResizeBorder){
        // remove active 'resize' border
        activeResizeBorder.parentNode.removeChild(activeResizeBorder);
        activeResizeBorder = null;
    }


    // sprawdz czy lewy przycisk myszy
	if(e.button==0){
	    var shapeEl = getTempRect(this);
		movedTempEl = shapeEl;
		// ukryj element
		this.style = "visibility:hidden;";
		// wyswietl obrys (przerywana linia w ksztalcie obiektu)
		drawingPanel.appendChild(shapeEl);

		// polozenie kursora na panelu edycyjnym w momencie klikniecia - inicjalizacja
		cords.x = e.clientX-getOffset(drawingPanel).x;
		cords.y = e.clientY-getOffset(drawingPanel).y;

		movedTempEl  = shapeEl; // obrys obiektu, który będzie przesuwany po ekranie
		var offset = getOffset(drawingPanel);
        var shapeBoundries  = this.getBoundingClientRect();
        // dodaj atrybut wezla z polozeniem obiektu wzgledem panelu edycyjnego
		this.xPos = shapeBoundries.left - offset.x;
		this.yPos = shapeBoundries.top - offset.y;
        movedElement = this;
        
        // dodaj obsluge zdarzen do panelu edycyjnego, aktywny obiekt
        // jest przechowywany w zmiennych movedElement oraz movedTempEl
        // --upuszczenie obiektu
        drawingPanel.addEventListener("mouseup",drawableElementMouseUp,false);
        // --przemieszczanie obiektu
        drawingPanel.addEventListener("mousemove",drawableElementMoved,false);
        // --gdy kursor opuści panel
        drawingPanel.addEventListener("mouseleave",drawingPanelMouseLeave,false);
        
        // usun galki obrotu
        removeKnobs();
		}
}


// drop element
var drawableElementMouseUp = function(e){
    // only for left mouse button up event 
	if(e.button == 0){
        // remove eventlisteners from element
		drawingPanel.removeEventListener("mousemove",drawableElementMoved);
        drawingPanel.removeEventListener("mouseup",drawableElementMouseUp);
        drawingPanel.removeEventListener("mouseleave",drawingPanelMouseLeave);

		el = movedElement;
        //var transformMatrix = movedElement.transform.baseVal.consolidate().matrix;
        // get previous translation
        var prevTranslation = movedElement.transform.baseVal.getItem(0);
        // calculate position for dropped element
		var X = movedTempEl.xPos - movedElement.xPos; 
        var Y = movedTempEl.yPos - movedElement.yPos;
        // update position data
		movedElement.xPos += X;
        movedElement.yPos += Y;

        var translation = drawingPanel.createSVGTransform();
        translation.setTranslate(X,Y);
		X += prevTranslation.matrix.e;
		Y += prevTranslation.matrix.f;
        prevTranslation.setTranslate(X,Y);

		//movedElement.setAttributeNS(null,"transform","matrix( 1 0 0 1 "+X+" "+ Y+")");
        //movedElement.transform.baseVal.appendItem(translation);
        movedElement.style = "visibility:visible;";

        movedTempEl.parentNode.removeChild(movedTempEl);
        activeElement = movedElement;
        movedElement = null;
        movedTempEl  = null;
        
        // add rotation knobs
        addKnobs(activeElement);
        // add 'resize' border
        addResizeBorder(activeElement);

        centroid = null;


	}
   
}

function drawableElementMoved(e) {
    // polozenie kursora na panelu edycyjnym
    cx = e.clientX-getOffset(drawingPanel).x;
    cy = e.clientY-getOffset(drawingPanel).y;
    // przesun o roznice polozen
    moveSvgObject(movedTempEl ,cx - cords.x,cy-cords.y);
    // zmienna gloabalna przechowujaca poprzednie polozenie kursora
    cords.x = cx;
    cords.y = cy;

}

// gdy podczas przesuwania elementu, kursor opuści pole edycyjne
function drawingPanelMouseLeave(e){
    var event = new MouseEvent('mouseup', {
        view: window,
        button: 0
      });
    drawingPanel.dispatchEvent(event); // wywołaj zdarzenie mouseup
}

// add table to the drawing panel
var tableClicked = function(e){
	if(e.button==0){
        var drawableClone = this.cloneNode(true);
        // clear transform list of the element
        drawableClone.transform.baseVal.clear();
        //drawableClone.transform.baseVal.initialize(drawingPanel.createSVGTransform().setTranslate(0,0));
        // add default translate and rotate transformation
        var translation = drawingPanel.createSVGTransform();
        drawableClone.transform.baseVal.appendItem(translation);
        translation.setTranslate(0,0);
        //drawableClone.transform.baseVal.getItem(0).setTranslate(0,0);
        //drawableClone.transform.baseVal.appendItem(translation);
        var rotation = drawingPanel.createSVGTransform();
        //drawableClone.transform.baseVal.getItem(0).setRotate(0,0,0);
        drawableClone.transform.baseVal.appendItem(rotation);
        rotation.setRotate(0,0,0);    
		drawableClone.addEventListener('mousedown', drawableElementMouseD,false);
		drawingPanel.appendChild(drawableClone);    

	}
}

// przesuwanie obrysu o wartosc x i y
function moveSvgObject(svgObj,x,y) {
    var shapeBoundries  = svgObj.getBoundingClientRect();
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

function getOffset(element){
    var rect = element.getBoundingClientRect();
    return {
        x: rect.left,
        y: rect.top
    };    
}

// function for handling knob's mousedown event 
function rotateElement(e){
    if(centroid == null)
        centroid = getCentroid(activeElement);
    var rotation = activeElement.transform.baseVal.getItem(1);

    /* point indicating rotation center - for debugging purposes
    point = document.createElementNS("http://www.w3.org/2000/svg","circle");
    point.setAttributeNS(null,"fill","red");
    point.setAttributeNS(null,"r","2");
    point.setAttributeNS(null,"cx",centroid[0]);
    point.setAttributeNS(null,"cy",centroid[1]);
    activeElement.appendChild(point);
    */

    // rotate left
    if(this == activeKnobs[1]){
        rotate+=20;
        rotation.setRotate(rotateL,centroid[0],centroid[1]);
    }
    else{
        rotate-=20;
        rotation.setRotate(rotateR,centroid[0],centroid[1]);
    }

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
    if(large){
        tempRect.setAttributeNS(null, "d", "M"+(x-2)+" "+(y-2)+" L"+(x2+2)+" "+(y-2)+" L"+(x2+2)+" "+(y2+2)+" L"+(x-2)+" "+(y2+2)+" Z");
        tempRect.setAttributeNS(null, "stroke-width", "5");
        tempRect.setAttributeNS(null, "stroke-opacity", "0");
    }
    else{
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

// add invisible border around element so it can capture resize events
function addResizeBorder(element){
    var tempRect = getTempRect(element,true);
    tempRect.classList.add('resize-pointer');   
    activeResizeBorder = tempRect;
    tempRect.addEventListener('mousedown',resize);
    
    drawingPanel.appendChild(tempRect);
}


function resize(e){
    var offset = getOffset(drawingPanel);

    this.addEventListener('mousemove', function(e){
        console.log("x = " + e.clientX - offset.x );
        console.log("y = " + e.clientY - offset.y );
    });

    this.addEventListener('mouseup', function(e){
        this.onmousemove = null;
        this.onmouseup = null;
    });


}


function addKnobs(svgElement){
    // use getTempRect function - get evaluated position of the element
    var tempRect = getTempRect(svgElement);
    // create svg circle
    var knob = document.createElementNS("http://www.w3.org/2000/svg","circle");
    // set top-letf knob
    knob.setAttributeNS(null, "cx", svgElement.xPos - knobDistance);
    knob.setAttributeNS(null, "cy", svgElement.yPos - knobDistance);
    knob.setAttributeNS(null, "r", rotationKnobRadius);
    knob.setAttributeNS(null, "transform", "rotate(0,0,0)");

    addAttributesNS(knob,knobStyle);
    drawingPanel.appendChild(knob);
    activeKnobs[0] = knob;

    knob = document.createElementNS("http://www.w3.org/2000/svg","circle");
    // set top-right knob
    knob.setAttributeNS(null, "cx", tempRect.x2Pos + knobDistance);
    knob.setAttributeNS(null, "cy", svgElement.yPos - knobDistance);
    knob.setAttributeNS(null, "r", rotationKnobRadius);
    knob.setAttributeNS(null, "transform", "rotate(0,0,0)");

    addAttributesNS(knob,knobStyle);
    drawingPanel.appendChild(knob);
    activeKnobs[1] = knob;

    // add mousedown event listeners
    for(let i=0; i < activeKnobs.length; i++){
        activeKnobs[i].addEventListener("mousedown",rotateElement);
    }

}

// delete active rotation knobs
function removeKnobs(){
    for(let i=0; i < activeKnobs.length; i++){
        drawingPanel.removeChild(activeKnobs[i]);
    }
    activeKnobs = [];
}

// adding multiple attributes to ns node
function addAttributesNS(element, attrs){
    for( key in attrs){
        element.setAttributeNS(null,key,attrs[key]);
    }
}

//
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
    console.log("vec1 = "+ vec1 + "vec2 = " + vec2);
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



function getCentroid(element){
    var box = element.getBBox();
    var halfX = (box.width)/2 + box.x;
    var halfY = (box.height)/2 + box.y;
    return [halfX,halfY];
}


// get relative mouse movement coords based on passed MouseEvent parameter
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

/*
 //rysowanie czarna kreska po panelu

lines = [];

var click = false;
drawingPanel.onmousedown = function (e) {
    console.log(ok);
    var polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.style = "fill:none;stroke:black;stroke-width:1";
    polyline.setAttributeNS(null, "points", (e.clientX-getOffset(drawingPanel).x) + "," + (e.clientY-getOffset(drawingPanel).y));
    lines.push(polyline);

    drawingPanel.onmousemove = function (e) {
        var polyline = lines[lines.length - 1];
        var points = polyline.getAttributeNS(null, "points");
        console.log(" " + (e.clientX-getOffset(drawingPanel).x) + "," + (e.clientY-getOffset(drawingPanel).y));
        polyline.setAttributeNS(null, "points", points + " " + (e.clientX-getOffset(drawingPanel).x) + "," + (e.clientY-getOffset(drawingPanel).y));
        lines[lines.length - 1] = polyline;
        drawingPanel.appendChild(polyline);

    }

}
drawingPanel.onmouseup = function (e) {
    drawingPanel.onmousemove = null;

}

function clicked() {
    click = !click;
}

*/
