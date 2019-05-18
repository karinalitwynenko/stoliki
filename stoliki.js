buff = [];
tables_count = 4;
movedElement = null;
movedTempEl = null;
elementClicked = false; // co to
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
        console.log(elems[i]);
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

// przemieszczanie obiektu, gdy przytrzymano przycisk
var drawableElementMouseD = function(e) {
    var shapeEl = getTempRect(this);
    movedTempEl = shapeEl;
    // ukryj element
    this.style = "visibility:hidden;";
    // wyswietl obrys
    drawingPanel.appendChild(shapeEl);

    // polozenie kursora na panelu edycyjnym w momencie klikniecia - inicjalizacja
    cords.x = e.clientX-getOffset(drawingPanel).x;
    cords.y = e.clientY-getOffset(drawingPanel).y;
    
    movedTempEl  = shapeEl;

    var offset = getOffset(drawingPanel);
    var shapeBoundries  = this.getBoundingClientRect();
    this.x = shapeBoundries.left - offset.x;
    this.y = shapeBoundries.top - offset.y;
    movedElement = this;
    console.log("clicked - "+ movedElement);

    //dodaj obsluge zdarzen
    drawingPanel.addEventListener("mouseup",drawableElementMouseUp,false);
    drawingPanel.addEventListener('mousemove',drawableElementMoved,false);
    
    console.log('kliknieto na pozycje : X = '+cords.x + '  Y = '+cords.y);

}

// puszczenie obiektu
var drawableElementMouseUp = function(e){
    drawingPanel.removeEventListener("mousemove",drawableElementMoved);
    drawingPanel.removeEventListener("mouseup",drawableElementMouseUp);
    console.log(movedElement.transform.SVGMatrix);
    el = movedElement;
    //movedElement.setAttributeNS(null,"transform","translate("+X+" "+Y+")");
    transformMatrix = movedElement.transform.baseVal.consolidate().matrix;
    var X = movedTempEl.x - movedElement.x;
    var Y = movedTempEl.y - movedElement.y;
    movedElement.x += X;
    movedElement.y += Y;
    X += transformMatrix.e;
    Y += transformMatrix.f;
    movedElement.setAttributeNS(null,"transform","matrix( 1 0 0 1 "+X+" "+ Y+")");
    movedElement.x = 
    movedElement.style = "visibility:visible;";

    movedTempEl.parentNode.removeChild(movedTempEl);
    movedElement = null;
    movedTempEl  = null;
    

}

function drawableElementMoved(e) {
    // polozenie kursora na panelu edycyjnym
    cx = e.clientX-getOffset(drawingPanel).x;
    cy = e.clientY-getOffset(drawingPanel).y;
    // buff.push(cx,cy);
    // przesun o roznice polozen
    moveSvgObject(movedTempEl ,cx - cords.x,cy-cords.y);
    //console.log('przesuniecie po x: '+(cx-cords.x)+' i y: '+(cy-cords.y));
    // zmienna gloabalna przechowujaca poprzednie polozenie kursora
    cords.x = cx;
    cords.y = cy;

}

// funkcja dodajaca klikniety element do panelu edycyjnego
var tableClicked = function(e){
    var drawableClone = this.cloneNode(true);
    drawableClone.id = ""; // co to?
    // dodaj neutralną macierz transformacji
    drawableClone.setAttributeNS(null,"transform","matrix( 1 0 0 1 0 0)");
    drawableClone.addEventListener('mousedown', drawableElementMouseD,false);
    drawingPanel.appendChild(drawableClone);    
     // dodaj neutralną macierz transformacji
    drawableClone.setAttributeNS(null,"transform","matrix( 1 0 0 1 0 0)")
}

function moveSvgObject(svgObj,x,y) {
    var shapeBoundries  = svgObj.getBoundingClientRect();

    var X = svgObj.x + x;
    var Y = svgObj.y + y;
    var X2 = svgObj.x2 + x;
    var Y2 = svgObj.y2 + y;
    svgObj.setAttributeNS(null, "d", "M"+X+" "+Y+" L"+X2+" "+Y+" L"+X2+" "+Y2+" L"+X+" "+Y2+" Z");    
    svgObj.x = X;
    svgObj.y = Y;
    svgObj.x2 = X2;
    svgObj.y2 = Y2;
}

function getOffset(element){
    var rect = element.getBoundingClientRect();
    return {
        x: rect.left,
        y: rect.top
    };    
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

    tempRect.x = x;
    tempRect.y = y;
    tempRect.x2 = x2;
    tempRect.y2 = y2;

	return tempRect;
	
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