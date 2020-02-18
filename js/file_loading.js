function setupFileLoadingPanel(e) {
    document.getElementById("load-data-button").onclick = function(e){
        var fileInput = document.getElementById("stoliki-file-input");
        if(fileInput.nodeValue == "" )
            return;
        else {
            document.getElementById('stoliki-obscure').style="display:none";
            file = fileInput.files[0];
            var stream = file.stream();
            var reader  = stream.getReader();
            reader.read().then(({ done, value }) => {
               //
               //
            });
                   
        }
    }

    document.getElementById("skip-button").onclick = function(e){
        document.getElementById('stoliki-obscure').style="visibility:hidden";
    }
}

function saveAsSvg(e){
    var savedBg = drawingPanel.style.backgroundImage;
    removeResizeGrips();
    removeKnobs();
    drawingPanel.style.backgroundImage = 'none';
    
    drawingPanel.width = drawingPanel.getBoundingClientRect().width;
    drawingPanel.height = drawingPanel.getBoundingClientRect().height;

    var data = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' + drawingPanel.outerHTML;
    var svg = new Blob([data], {type: 'text'});
    var svgUrl = URL.createObjectURL(svg);
    var link = document.getElementById('saveButton').firstChild;
    link.href = svgUrl;
    link.download = "stoły.svg";

    drawingPanel.style.backgroundImage = savedBg;
    if(activeElement){
        addResizeGrips(activeElement);
        addKnobs(activeElement);
    }

    var linkElement = document.querySelector("#saveButton a");
    if (e.target != linkElement)
        linkElement.click();
}