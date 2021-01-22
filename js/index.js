
console

const continueBtn = document.getElementById("continue-btn");
continueBtn.addEventListener("click", continueStep1);

const mapInput = document.getElementById("map-input");
const tilesetInput = document.getElementById("tileset-input");
const tileWidthInput = document.getElementById("tile-width-input");
const tileHeightInput = document.getElementById("tile-height-input");
const tmxNameInput = document.getElementById("tmx-name-input");
const tsxNameInput = document.getElementById("tsx-name-input");

let tileArr = [];
let tilesetArr = [];
let gotMap = false;
let gotTileset = false;
let gotTileWidth = false;
let gotTileHeight = false;
let gotTMXname = false;
let gotTSXname = false;
let colorsArrTemp = [];

let evaluatedMap = false;
let evaluatedTS = false;

let mapWidth;
let mapHeight;
let tileWidth;
let tileHeight;
let tilesetWidth;
let tilesetHeight;

let tmxName;
let tsxName;
let tsxNameWithExtension;

let tileCount = 0;
let tileColumns;

let tilesetPNGname;

let tmxString;

let tileButton;
let colorTable;

let tmxFull;
let tsxFull;

const illegalCharacters = ["\\", "/", "<", ">", "*", "|",":"]

const mapImage = new Image();
const tilesetImage = new Image();


// setup tile class
function Tile(r, g, b, a, posX, posY, tileIndex) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    this.posX = posX;
    this.posY = posY;
    this.tileIndex = tileIndex;
}

// setup rbga key class
function RGBAkeyOBJECT(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
}

// setup color info class
function ColorInfo(r, g, b, a, ID) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    this.ID = ID;
}

// handle map input and set bool
mapInput.addEventListener("change", function(e) {

    gotMap = true;
    const mapReader = new FileReader();
    mapReader.readAsDataURL(mapInput.files[0]);
    
    mapReader.onload = function() {
        mapImage.src = mapReader.result;
    }
})


// handle tileset input and set bool
tilesetInput.addEventListener("change", function(e) {
    
    tilesetPNGname = getFileName(tilesetInput.value);
    gotTileset = true;
    const tilesetReader = new FileReader();
    tilesetReader.readAsDataURL(tilesetInput.files[0]);

    tilesetReader.onload = function() {
        tilesetImage.src = tilesetReader.result;
    }
})


function getFileName(fullPath) {

    let targetIndex;

    for(let i = fullPath.length - 1; i > 0; i--) {
        if(fullPath.charAt(i) == "/" || fullPath.charAt(i) == "\\") {
            targetIndex = i;
            break;
        }
    }

    if(targetIndex == undefined) {
        alert('Something about the path of your provided file is fucked. You will need to manually correct the "source" property of the generated output file');
    }

    return fullPath.substring(targetIndex + 1);
}


// handle additional input and set respective bools
tileWidthInput.addEventListener("change", function() {
    gotTileWidth = true;
})


tileHeightInput.addEventListener("change", function() {
    gotTileHeight = true;
})

tmxNameInput.addEventListener("change", function() {

    if(evalFileNameInput(tmxNameInput.value, illegalCharacters)) {
        tmxName = tmxNameInput.value;
        gotTMXname = true;
    } else {
        tmxNameInput.value = "";
        alert("Invalid Input. Please refrain from using illegal characters");
    }
    
})

tsxNameInput.addEventListener("change", function() {

    if(evalFileNameInput(tsxNameInput.value, illegalCharacters)) {
        tsxName = tsxNameInput.value;
        tsxNameWithExtension = tsxName.concat(".tsx");
        gotTSXname = true;
    } else {
        tsxNameInput.value = "";
        alert("Invalid Input. Please refrain from using illegal characters");
    }
    
})

function evalFileNameInput(nameInput, illegalCharacters) {
    let legal = true;
    for(let i = 0; i < illegalCharacters.length; i++) {
        if(nameInput.includes(illegalCharacters[i])) {
            legal = false;
        }
    }
    return legal;
}




// generate RGBA key
function genRGBAkey(r, g, b, a) {
    let keyTemp = "";
    let key = keyTemp.concat(r.toString(),',',g.toString(),',',b.toString(),',',a.toString());
    return key;
}



function continueStep1() {

    if(gotMap && gotTileset && gotTileWidth && gotTileHeight && gotTMXname && gotTSXname) {

        tileWidth = tileWidthInput.value;
        tileHeight = tileHeightInput.value;

        document.getElementById("step1-container").classList.add("hide");

        initImageEvaluation();

    } else {
       alert("Make sure all fields are filled out!");
    }
}


function initImageEvaluation() {
    document.getElementById("step1.5").classList.remove("hide");
    const canvas = document.getElementById("info-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const context = canvas.getContext("2d");

    context.drawImage(mapImage, 0, 0);
    evalMapData(mapImage, context);

    context.drawImage(tilesetImage, 0, 0);
    evalTilesetData(tilesetImage, context);
}

function evalMapData(image, context) {

    let vRows = image.height;
    let hRows = image.width;

    mapWidth = image.width;
    mapHeight = image.height;

    for(let iY = 0; iY < vRows; iY++) {
        for(let i = 0; i < hRows; i++) {
            let colorR = context.getImageData(i, iY, 1, 1).data[0];
            let colorG = context.getImageData(i, iY, 1, 1).data[1];
            let colorB = context.getImageData(i, iY, 1, 1).data[2];
            let colorA = context.getImageData(i, iY, 1, 1).data[3];
            tileArr.push(new Tile(colorR, colorG, colorB, colorA, i, iY));

            let rbgaKey = genRGBAkey(colorR, colorG, colorB, colorA);
            if(!colorsArrTemp.includes(rbgaKey)) {
                colorsArrTemp.push(rbgaKey);
            }

        }
    }
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    evaluatedMap = true;
    checkForImageData();

}

function evalTilesetData(image, context) {

    tilesetWidth = image.width;
    tilesetHeight = image.height;

    tileCount = (tilesetWidth / tileWidth) * (tilesetHeight / tileHeight);
    tileColumns = tileCount / (tilesetHeight / tileHeight);

    let vRows = image.height;
    let hRows = image.width;

    for(let iY = 0; iY < vRows; iY++) {
        for(let i = 0; i < hRows; i++) {
            let colorR = context.getImageData(i, iY, 1, 1).data[0];
            let colorG = context.getImageData(i, iY, 1, 1).data[1];
            let colorB = context.getImageData(i, iY, 1, 1).data[2];
            let colorA = context.getImageData(i, iY, 1, 1).data[3];
            tilesetArr.push(new Tile(colorR, colorG, colorB, colorA, i, iY));
        }
    }
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    evaluatedTS = true;
    checkForImageData();
}

function checkForImageData() {
    if(evaluatedMap && evaluatedTS) {
        document.getElementById("step1.5").classList.add("hide");
        initStep2();
    }
}


function initStep2() {

    let colorsArr = [];
    for(let i = 0; i < colorsArrTemp.length; i++) {
        var test = colorsArrTemp[i].split(",");
        colorsArr.push(new RGBAkeyOBJECT(test[0], test[1], test[2], test[3]))
    }
    document.getElementById("step2").classList.remove("hide");
    colorTable = document.getElementById("color-table");
    genTable(colorTable, colorsArr);
    initStep2Canvases();
}

// STEP 2
function initStep2Canvases() {

    const tilesetCanvas = document.getElementById("tileset-canvas");
    const mapCanvas = document.getElementById("map-canvas");
    const contextTS = tilesetCanvas.getContext("2d");
    const contextMap = mapCanvas.getContext("2d");

    let scaleFactorMap = determineScale(mapImage, mapCanvas)
    let scaleFactorTS = determineScale(tilesetImage, tilesetCanvas);

    drawStep2(mapImage, contextMap, scaleFactorMap, tileArr);
    drawStep2(tilesetImage, contextTS, scaleFactorTS, tilesetArr);
    drawIDsText(contextTS, scaleFactorTS);
}

function determineScale(image, canvas) {
    let counter = 0;
    let stepRef = 1; // 0.1
    let stepDyn = 0;
    
    while(stepDyn * image.width < canvas.width && stepDyn * image.height < canvas.height) {
        counter += stepRef;
        stepDyn += stepRef;
    } 
    
    if(counter <= 0) {
        counter = 1;
    }
    
    return Math.floor(counter);
    
}


function drawStep2(image, ctx, scale, arr) {
    let vRows = image.height;
    let hRows = image.width;
    let iterator = 0;
    let yPos = 0;

    for(let iY = 0; iY < vRows; iY++) {
        for(let i = 0; i < hRows; i++) {
            ctx.fillStyle = `rgb(${arr[iterator].r}, ${arr[iterator].g}, ${arr[iterator].b})`;
            ctx.fillRect(scale * i, yPos, scale, scale);
            iterator++;
        } 
        yPos += scale; 
    } 
} 


function drawIDsText(ctx, scale) {
    let vRows = tileColumns;
    let hRows = tileCount / tileColumns;
    let iterator = 1;
    scale *= tileWidth;
    let yPos = scale * 0.5;
    
    for(let iY = 0; iY < vRows; iY++) {
        for(let i = 0; i < hRows; i++) {
            ctx.fillStyle = "white";
            ctx.font = `30px Arial`;
            ctx.fillText(iterator, (scale * i) + (scale * 0.5), yPos);
            iterator++; 
        } 
        yPos += scale; 
    } 
}


function genTable(colorTable, data) {

    let CheckForDupeIDs = [];

    let tableRows = colorTable.querySelectorAll("tr");
    for (let i = 0; i < tableRows.length; i++) {
        tableRows[i].remove();
    }

    for (let element of data) {

        if(element.a == 255) {
            let row = colorTable.insertRow();

            let cell = row.insertCell();
            cell.style.backgroundColor = `rgba(${element.r}, ${element.g}, ${element.b}, ${element.a})`;
            cell.id = "tile-id-color";
            cell.className = "fake-3d";
            
            let input = document.createElement("INPUT");
            input.setAttribute("type", "number");
            input.setAttribute("data-colorR", `${element.r}`)
            input.setAttribute("data-colorG", `${element.g}`)
            input.setAttribute("data-colorB", `${element.b}`)
            input.setAttribute("data-colorA", `${element.a}`)
            input.className = "tile-id-input";
            row.appendChild(input);

            input.addEventListener("change", function() {

                if(CheckForDupeIDs.includes(input.value)) {
                    input.value = "";
                    alert("ID must be unique");
                } else if(input.value <= 0 || input.value > tileCount) {
                    input.value = "";
                    alert("ID must be within valid range");
                } else {
                    CheckForDupeIDs.push(input.value);
                }

            })
        }
    }
    
    tileButton = document.getElementById("tile-btn");
    
    tileButton.addEventListener("click", function(e) {
        let tileInputs = document.getElementsByClassName("tile-id-input");
        let allFieldsFilled = true;

        for(let i = 0; i < tileInputs.length; i++) {
            if(tileInputs[i].value == "") {
                allFieldsFilled = false;
            }
        }

        if(allFieldsFilled == false) {
            alert("Make sure all fields are filled out!");
        } else {
            let tileIDsArr = [];
            for(let i = 0; i < tileInputs.length; i++) {
                tileIDsArr.push(new ColorInfo(
                                tileInputs[i].getAttribute("data-colorR"),
                                tileInputs[i].getAttribute("data-colorG"),
                                tileInputs[i].getAttribute("data-colorB"),
                                tileInputs[i].getAttribute("data-colorA"), 
                                tileInputs[i].value));
            }
            assignIDtoTiles(tileIDsArr)
            genTMX();
            genTSX();
            initFinal();
        }
    })
}


function assignIDtoTiles(tileInputsArr) {

    for(let i = 0; i < tileArr.length; i++) {

        tileArr[i].tileIndex = getTileID(tileArr[i], tileInputsArr)
       
    }
}


function getTileID(currentTile, tileInputsArr) {
    let ID;

    for(let i = 0; i < tileInputsArr.length; i++) {
        if(
            tileInputsArr[i].r == currentTile.r &&
            tileInputsArr[i].g == currentTile.g &&
            tileInputsArr[i].b == currentTile.b
        ) {
            return tileInputsArr[i].ID;
        }
    }

}

 

  // STEP 3 STEP 3 STEP 3 STEP 3 STEP 3 STEP 3 STEP 3 STEP 3 STEP 3 STEP 3 STEP 3 

function genTMX() {
tmxString = genMapString();
tmxString = tmxString.substring(1);

tmxFull = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.2" tiledversion="4.20" orientation="orthogonal" renderorder="right-down" width="${mapWidth}" height="${mapHeight}" tilewidth="${tileWidth}" tileheight="${tileHeight}" infinite="0" nextlayerid="2" nextobjectid="1">
 <tileset firstgid="1" source="${tsxNameWithExtension}"/>
 <layer id="1" name="Bruh Layer 1" width="${mapWidth}" height="${mapHeight}">
  <data encoding="csv">
${tmxString}
</data>
 </layer>
</map>`

}


function genMapString() {
    let tmxString = ""
    let iterator = -1;

    for(let i = 0; i < tileArr.length; i++) {

        iterator++;
        tmxString = tmxString.concat(",")

        if(iterator == mapWidth) {
            tmxString = tmxString.concat("\n")
            iterator = -1;
        }

        if(tileArr[i].tileIndex == undefined) {
            tmxString = tmxString.concat("0");
        } else {
            tmxString = tmxString.concat(tileArr[i].tileIndex.toString());
        }
    }
    return tmxString;
}


function genTSX() {
    
tsxFull = `<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.2" tiledversion="4.20" name="${tsxName}" tilewidth="${tileWidth}" tileheight="${tileHeight}" tilecount="${tileCount}" columns="${tileColumns}">
 <image source="${tilesetPNGname}" width="${tilesetWidth}" height="${tilesetHeight}"/>
</tileset>`

}


function initFinal() {
    document.getElementById("step2").classList.add("hide");
    document.getElementById("step3").classList.remove("hide");

    document.getElementById("download-tmx").addEventListener("click", function() {

        let tmxBlob = new Blob([tmxFull], {type:"text/plain"});
        let tmxURL = window.URL.createObjectURL(tmxBlob);
     
        let tmxDownloadLink = document.createElement("a");
        tmxDownloadLink.download = tmxName;
        tmxDownloadLink.href = tmxURL;
        tmxDownloadLink.style.display = "none";
        document.body.appendChild(tmxDownloadLink);
     
        tmxDownloadLink.click();
    })

    document.getElementById("download-tsx").addEventListener("click", function() {

        let tsxBlob = new Blob([tsxFull], {type:"text/plain"});
        let tsxURL = window.URL.createObjectURL(tsxBlob);
     
        let tsxDownloadLink = document.createElement("a");
        tsxDownloadLink.download = tsxName;
        tsxDownloadLink.href = tsxURL;
        tsxDownloadLink.style.display = "none";
        document.body.appendChild(tsxDownloadLink);
     
        tsxDownloadLink.click();
    })

}




// funny title stuff
let HTMLtitle = document.querySelector("title");

function initTitle() {
    const helloArr = ["H", "e", "l", "l", "o", "!"];
    let iterator = 0; 
    setTitle(iterator, helloArr);
}

function setTitle(iterator, arr) {
    if(iterator < arr.length) {
        HTMLtitle.innerText += arr[iterator];
        iterator++
        setTimeout(setTitle, 300, iterator, arr);
    } else {
        HTMLtitle.innerText = "-> ";
        iterator = 0;
        setTimeout(setTitle, 300, iterator, arr);
    }
}

initTitle();

