const labelStyle = { "stroke":"gray", "fill":"white"};
customLabelTextInput = null;
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function setupLabelsPanel(e){
    var addCustomLabel = document.getElementById("addCustomLabel");
    customLabelTextInput = document.getElementById("customLabelText");
    addCustomLabel.addEventListener("click", onCustomLabelCreate,false);

    var guests = document.getElementsByClassName('stoliki-guest');
    for (let el of guests) {
        el.onclick = function(e){
            drawLabel(el.textContent, "");
            el.parentNode.removeChild(el);
        }
    }
}

function onCustomLabelCreate(e){
    if(e.button != 0)
        return;
    var text = customLabelTextInput.value;
    if(text == '')
        return;
    else 
        drawLabel(text,'');
}

function drawLabel(textContent, extraClass){
    // label element is defined by svg group
    var labelGroup = document.createElementNS("http://www.w3.org/2000/svg","g");
    // create label container
    var label = document.createElementNS("http://www.w3.org/2000/svg","rect");
    // create svg text
    var text = document.createElementNS("http://www.w3.org/2000/svg","text");
    // x and y text position values are based on label default position
    text.setAttributeNS(null,"x",102);     
    text.setAttributeNS(null,"y",119); 
    text.setAttributeNS(null,"font-size",20);
    text.setAttributeNS(null,"text-length",4);

    // create text node - content for label
    var textNode = document.createTextNode(textContent);
    text.appendChild(textNode);

    // default label position
    label.setAttributeNS(null,"x",100);
    label.setAttributeNS(null,"y",100);
    label.setAttributeNS(null,"height",25);
    addAttributesNS(label,labelStyle); // apply label's style
    // group text and label
    labelGroup.appendChild(label);
    labelGroup.appendChild(text);
    // append to drawing panel
    drawingPanel.appendChild(labelGroup);
    // now text width can be computed
    var textWidth = text.getComputedTextLength() + 4; // +4 for extra padding
    label.setAttributeNS(null,"width",textWidth);
    
    // add default translation
    var translation = drawingPanel.createSVGTransform();
    labelGroup.transform.baseVal.appendItem(translation);
    translation.setTranslate(0,0);

    // add scale
    var scale = drawingPanel.createSVGTransform();
    labelGroup.transform.baseVal.appendItem(scale);
    scale.setScale(1,1);
    labelGroup.setAttribute("data-scale-x",1); // append x-scale data
    labelGroup.setAttribute("data-scale-y",1); // append y-scale data

    labelGroup.setAttribute("data-rotation-enabled","false"); // disable rotation
    labelGroup.classList.add("noselect");
    labelGroup.classList.add("label");

    // add moving listener
    labelGroup.addEventListener('mousedown',drawableElementMouseD,false);

    if(extraClass != ''){
        labelGroup.classList.add(extraClass);
    }
    labelGroup.onmousemove = showInfo;
    labelGroup.onmouseleave = hideInfo;
}

function showInfo(e){
    var infoContainer = document.getElementById('guest-info');
    var text = document.getElementById('info-text');
    infoContainer.style.display = 'block';
    text.textContent = 'Your guest';
}

function hideInfo(e){
    var infoContainer = document.getElementById('guest-info');
    sleep(500).then(() => {
        infoContainer.style.display = 'none';
    })
}