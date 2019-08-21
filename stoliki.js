

const resizeGripStyle = { "stroke":"gray", "fill":"#3489eb", "id":"resizeGrip"};
activeResizeGrips = [];
activeElement = null;
tables_count = 2;
movedElement = null;
movedTempEl = null;
elementClicked = false;
activeBBox = null;
ok = 'OK!';
cords = {
    x: null,
    y: null
}


// *****************************************
// zaczekaj na elementy svg  az sie zaladuja
window.addEventListener("load", getSVGObjects, false);
		
// uzyskaj dokument SVG z tagu <object>
function getDocument(embededEl) {


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
    drawingPanel = document.getElementById("drawingPanel");
    var elems = document.querySelectorAll(".embededSVG");
    for (let i = 0; i < elems.length; i++){
        var  doc = getDocument(elems[i]);
        // jesli udalo sie pobrac pliki svg
        if(doc){
            var svgEl = doc.getElementsByClassName("table")[0];
            svgEl.addEventListener("click",tableClicked,false);   
            
        }
    }

    drawingPanel.style = "background-image:url(grid_background.svg); background-repeat: repeat;"
}




// rozpocznij przemieszczanie obiektu, gdy przytrzymano przycisk
// obsluga tylko lewym przyciskiem myszki
var drawableElementMouseD = function(e) {
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
        drawingPanel.addEventListener("mouseup",drawableElementMouseUp);
        // --przemieszczanie obiektu
        drawingPanel.addEventListener("mousemove",drawableElementMoved);
        // --gdy kursor opuści panel
        drawingPanel.addEventListener("mouseleave",drawingPanelMouseLeave);
        
        // delete knobs and resize grips
        removeKnobs();
        removeResizeGrips();
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

        //var transformMatrix = movedElement.transform.baseVal.consolidate().matrix;
        // get previous translation
        var prevTranslation = movedElement.transform.baseVal.getItem(0);
        // calculate position for dropped element
		var X = movedTempEl.xPos - movedElement.xPos; 
        var Y = movedTempEl.yPos - movedElement.yPos;
        // update position data
		movedElement.xPos += X;
        movedElement.yPos += Y;

		X += prevTranslation.matrix.e;
		Y += prevTranslation.matrix.f;
        prevTranslation.setTranslate(X,Y);
        movedElement.style = "visibility:visible;";

        movedTempEl.parentNode.removeChild(movedTempEl);
        
        activeElement = movedElement;
        // append active element as last child so it overlaps other visible elements
        drawingPanel.appendChild(activeElement);
        movedElement = null;
        movedTempEl  = null;
        
        // add rotation knobs
        addKnobs(activeElement);
        // add resize grips
        addResizeGrips(activeElement);

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

        // add scale
        var scale = drawingPanel.createSVGTransform();
        drawableClone.transform.baseVal.appendItem(scale);
        scale.setScale(1,1);
        drawableClone.setAttribute("data-scaleX",1); // append x-scale data
        drawableClone.setAttribute("data-scaleY",1); // append y-scale data
        
        // add rotation
        var rotation = drawingPanel.createSVGTransform();
        drawableClone.transform.baseVal.appendItem(rotation);
        rotation.setRotate(0,0,0);
        drawableClone.setAttribute("data-rotation",0); // append rotation data

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
    //return leftCorner;
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


// ################################################
// "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files
// /usr/bin/google-chrome-stable %U --allow-file-access-from-files




