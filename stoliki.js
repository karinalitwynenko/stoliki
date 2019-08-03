//buff = [];
// promien galki pozwalajacej na obrot obiektu
const rotationKnobRadius = 5;
const knobDistance = 2;
const knobStyle = {"stroke":"gray", "stroke-width":1, "fill":"white", "id":"knob"};
// aktualnie widoczne(aktywne) galki obrotu, kolejnosc od prawej gornej zg. z ruchem zegara
activeKnobs = [];

tables_count = 4;
movedElement = null;
movedTempEl = null;
elementClicked = false;
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

// zmienna do obslugi przenoszenia elementow po panelu
drawableElMouseCl = false;

/*
function tablesObjectLoaded(e){
    pickupPanel = document.getElementById('pickupPanel');
    drawingPanel = document.getElementById("drawingPanel");
    // pobierz dokument svg wewnatrz tagu object
    var tabObj = document.getElementById('tablesObject')
    console.log(tabObj);
    console.log(tabObj.contentDocument);
    this.contentDocument.onload = function(e){
        // konfiguracja stolow
        for(let i=0;i<drawableObjects.length;i++){
            var svgEl = document.getElementById('table'+i);
            svgEl.classList.add("table");
            svgEl.style.paddingLeft="15%";    
            svgEl.addEventListener("click",tableClicked,false);
        }
    }
}
*/

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
        drawingPanel.addEventListener("mouseup",drawableElementMouseUp,false);
        // --przemieszczanie obiektu
        drawingPanel.addEventListener("mousemove",drawableElementMoved,false);
        // --gdy kursor opuści panel
        drawingPanel.addEventListener("mouseleave",drawingPanelMouseLeave,false);
        
        // usun galki obrotu
        removeKnobs();
		}
}


// puszczenie obiektu
var drawableElementMouseUp = function(e){
	if(e.button==0){
		drawingPanel.removeEventListener("mousemove",drawableElementMoved);
        drawingPanel.removeEventListener("mouseup",drawableElementMouseUp);
        drawingPanel.removeEventListener("mouseleave",drawingPanelMouseLeave);

		el = movedElement;
		transformMatrix = movedElement.transform.baseVal.consolidate().matrix;
		var X = movedTempEl.xPos - movedElement.xPos;
		var Y = movedTempEl.yPos - movedElement.yPos;
		movedElement.xPos += X;
		movedElement.yPos += Y;
		X += transformMatrix.e;
		Y += transformMatrix.f;
		movedElement.setAttributeNS(null,"transform","matrix( 1 0 0 1 "+X+" "+ Y+")");
		movedElement.x = 
		movedElement.style = "visibility:visible;";

        movedTempEl.parentNode.removeChild(movedTempEl);
        
        // dodaj galki obrotu
        addKnobs(movedElement);
		movedElement = null;
        movedTempEl  = null;

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

// add table to drawing panel
var tableClicked = function(e){
	if(e.button==0){
		var drawableClone = this.cloneNode(true);
		// add default transform matrix
		drawableClone.setAttributeNS(null,"transform","matrix( 1 0 0 1 0 0)");
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
    console.log('rotate..');

}

function getTempRect(drawableEl){
    // offset wzgledem lewej krawedzi okna aplikacji
    var offset = getOffset(drawingPanel);
    // granice przekazanego obiektu
    var shapeBoundries  = drawableEl.getBoundingClientRect();
    var x = shapeBoundries.left - offset.x;
    var x2 = x + shapeBoundries.width;
    var y = shapeBoundries.top - offset.y;
    var y2 = y + shapeBoundries.height;
    var tempRect = document.createElementNS("http://www.w3.org/2000/svg","path");
    tempRect.setAttributeNS(null, "d", "M"+x+" "+y+" L"+x2+" "+y+" L"+x2+" "+y2+" L"+x+" "+y2+" Z");
    //tempRect.style = 'fille:"none";stroke:"grey";stroke-width:"1";stroke-dasharray:"10,10';
    tempRect.setAttributeNS(null, "fill", "none");
    tempRect.setAttributeNS(null, "stroke", "grey");
    tempRect.setAttributeNS(null, "stroke-width", "1");
    tempRect.setAttributeNS(null, "stroke-dasharray", "10,10");

    tempRect.xPos = x;
    tempRect.yPos = y;
    tempRect.x2Pos = x2;
    tempRect.y2Pos = y2;

	return tempRect;
	
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
    addAttributesNS(knob,knobStyle);
    drawingPanel.appendChild(knob);
    activeKnobs[0] = knob;

    knob = document.createElementNS("http://www.w3.org/2000/svg","circle");
    // set top-right knob
    knob.setAttributeNS(null, "cx", tempRect.x2Pos + knobDistance);
    knob.setAttributeNS(null, "cy", svgElement.yPos - knobDistance);
    knob.setAttributeNS(null, "r", rotationKnobRadius);
    addAttributesNS(knob,knobStyle);
    drawingPanel.appendChild(knob);
    activeKnobs[1] = knob;

    knob = document.createElementNS("http://www.w3.org/2000/svg","circle");
    // set bottom-right knob
    knob.setAttributeNS(null, "cx", tempRect.x2Pos + knobDistance);
    knob.setAttributeNS(null, "cy", tempRect.y2Pos + knobDistance);
    knob.setAttributeNS(null, "r", rotationKnobRadius);
    addAttributesNS(knob,knobStyle);
    drawingPanel.appendChild(knob);
    activeKnobs[2] = knob;


    knob = document.createElementNS("http://www.w3.org/2000/svg","circle");
    // set bottom-left knob
    knob.setAttributeNS(null, "cx", svgElement.xPos - knobDistance);
    knob.setAttributeNS(null, "cy", tempRect.y2Pos + knobDistance);
    knob.setAttributeNS(null, "r", rotationKnobRadius);
    addAttributesNS(knob,knobStyle);
    drawingPanel.appendChild(knob);
    activeKnobs[3] = knob;

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
