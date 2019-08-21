const labelStyle = { "stroke":"gray", "fill":"white"};

customLabelTextInput = null;
function setupLabelsPanel(e){
    var addCustomLabel = document.getElementById("addCustomLabel");
    customLabelTextInput = document.getElementById("customLabelText");
    addCustomLabel.addEventListener("click", drawLabel,false);

}

function drawLabel(e){
    var labelGroup = document.createElementNS("http://www.w3.org/2000/svg","g");
    var label = document.createElementNS("http://www.w3.org/2000/svg","rect");
    var text = document.createElementNS("http://www.w3.org/2000/svg","text");
    text.setAttributeNS(null,"x",102);     
    text.setAttributeNS(null,"y",117); 
    text.setAttributeNS(null,"font-size","20");
    text.setAttributeNS(null,"text-length",4);

    var textNode = document.createTextNode(customLabelTextInput.value);
    text.appendChild(textNode);
    drawingPanel.appendChild(text);
    var box = text.getBBox();
    label.setAttributeNS(null,"x",100);
    label.setAttributeNS(null,"y",100);
    //label.setAttributeNS(null,"width",textWidth);
    label.setAttributeNS(null,"height",25);
    addAttributesNS(label,labelStyle);
    labelGroup.appendChild(label);
    labelGroup.appendChild(text);
    drawingPanel.appendChild(labelGroup);
    var textWidth = text.getComputedTextLength()+2;
    label.setAttributeNS(null,"width",textWidth);
    labelGroup.addEventListener('mousedown',drawableElementMouseD,false);
    
    // add default translation
    var translation = drawingPanel.createSVGTransform();
    labelGroup.transform.baseVal.appendItem(translation);
    translation.setTranslate(0,0);

    // add scale
    var scale = drawingPanel.createSVGTransform();
    labelGroup.transform.baseVal.appendItem(scale);
    scale.setScale(1,1);
    labelGroup.setAttribute("data-scaleX",1); // append x-scale data
    labelGroup.setAttribute("data-scaleY",1); // append y-scale data

    labelGroup.setAttribute("data-rotationEnabled","false"); // disable rotation
    labelGroup.classList.add("noselect");

}