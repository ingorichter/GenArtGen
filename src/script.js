import { random } from "@georgedoescode/generative-utils";
import { SVG } from "@svgdotjs/svg.js";
import tinycolor from "tinycolor2";
import gsap from "gsap";
import * as dat from 'dat.gui';

console.clear();

let draw, squareSize, numRows, numCols, colors, colorPalette;
let patterns = [];
let useColors = false;
let useBigBlock = true;

const configObject = {
  useColors: false,

  useBigBlock: true,

  saveSVG: function () {
    setDownloader('downloadLink', 'theGrid');
  },
  svgFileName: "theGrid.svg"
};

// Create a link and set the URL using `createObjectURL`
function downloadFile(file) {
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = URL.createObjectURL(file);
  link.download = file.name;

  // It needs to be added to the DOM so it can be clicked
  document.body.appendChild(link);
  link.click();

  // To make this work on Firefox we need to wait
  // a little while before removing it.
  setTimeout(() => {
    URL.revokeObjectURL(link.href);
    link.parentNode.removeChild(link);
  }, 0);
}

function setDownloader(linkId, svgId) {
  // Get svg element
  var svg = document.getElementById(svgId)

  // Get svg source
  var serializer = new XMLSerializer()
  var source = serializer.serializeToString(svg)

  // Add name spaces
  if (!source.match(/^<svg[^>]*?\sxmlns=(['"`])https?\:\/\/www\.w3\.org\/2000\/svg\1/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"')
  }
  if (!source.match(/^<svg[^>]*?\sxmlns:xlink=(['"`])http\:\/\/www\.w3\.org\/1999\/xlink\1/)) {
    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"')
  }

  // Add xml declaration
  source = '<?xml version="1.0" standalone="no"?>\r\n' + source

  // Convert SVG source to URI data scheme
  var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source)

  // Set url value to a element's href attribute
  // document.getElementById(linkId).href = url
  const svgFile = new File([source], 'theGrid.svg', { type: 'image/svg+xml' });
  downloadFile(svgFile);
}

const gui = new dat.GUI();
var colorSettingsFolder = gui.addFolder('Color Settings');
gui.add(configObject, 'useColors').onChange(val => {
  useColors = !useColors;
  generateNewGrid();
});
gui.add(configObject, 'useBigBlock').onChange(val => {
  useBigBlock = !useBigBlock;
  generateNewGrid();
});

var exportSettingsFolder = gui.addFolder('Export');
exportSettingsFolder.add(configObject, 'saveSVG');

function setupPatterns() {
  patterns = [];

  // generate 10 patterns with varying space between lines
  for (let i = 1; i <= 6; i = i + 0.5) {
    const lineDistance = 1 + i;
    let pattern = draw.pattern(lineDistance, lineDistance, function (add) {
      add.line(0, 0, 0, lineDistance).stroke({ color: '#868686', width: 2 });
    }).transform({ rotate: 90 });
    patterns.push(pattern);
  }
}

function getTwoColors(colors) {
  let colorList = [...colors];

  const colorIndex = random(0, colorList.length - 1, true);

  const background = colorList[colorIndex];

  colorList.splice(colorIndex, 1);

  const foreground = random(colorList);

  if (useColors) {
    return { foreground, background };
  } else {
    const foregroundColor = tinycolor(foreground);
    const backgroundColor = tinycolor(background);
    const foregroundColorRGB = foregroundColor.toRgb();
    const backgroundColorRGB = backgroundColor.toRgb();
    const fgIndex = Math.floor(foregroundColor.getBrightness() / 255 * patterns.length);
    const bgIndex = Math.floor(backgroundColor.getBrightness() / 255 * patterns.length);
    const foregroundColorAngle = foregroundColorRGB.g % 135
    let fg = patterns[fgIndex].transform({ rotate: foregroundColorAngle});
    let bg = patterns[bgIndex].transform({ rotate: backgroundColorRGB.b % (135 + 45) });
    return { foreground: fg, background: bg };
  }
}

function drawBlock(x, y, foreground, background) {
  const group = draw.group().addClass("draw-block");

  // group.rect(squareSize, squareSize).fill(background).move(x, y);
  group.rect(squareSize, squareSize).fill(background).move(x, y);
}

function fillRectWithDiagonalLines(x, y, parent, strokeColor) {
  // const rect = parent.rect(squareSize, squareSize).fill("#fff").move(x, y);

  for (let index = 0; index < squareSize * 2; index += 2) {
    parent.line(x, y + index, x + index, y).stroke(strokeColor);
  }
}

function drawCircleWithLines(x, y, foreground, background) {
  const group = draw.group().addClass("circle-with-lines").id(`circle-with-lines-${x}-${y}`);
  // draw rect and fill it with background color
  const circle = group.circle(squareSize).id("circle-clip").center(x + squareSize / 2, y + squareSize / 2);
  group.rect(squareSize, squareSize).attr('mask-path', circle).fill(background).move(x, y);
  group.rect(squareSize, squareSize).clipWith(circle).fill("#fff").move(x, y);
  // group.rect(squareSize, squareSize).attr('mask-path', circleMask).fill(background).move(x, y);
  group
    .circle(squareSize)
    .id("circle")
    .fill(foreground)
    .center(x + squareSize / 2, y + squareSize / 2);

  // const circleGroup = draw.group().id("circle-group");

  // const offset = random([
  //   // top left + bottom right
  //   [0, 0, squareSize, squareSize],
  //   // top right + bottom left
  //   [0, squareSize, squareSize, 0]
  // ]);

  // circleGroup.maskWith(circleMask);
  // circleGroup.clipWith(circleMask);

  // circleGroup
  //   .circle(squareSize)
  //   .id("circle")
  //   .fill(foreground)
  //   .clipWith(circleMask)
  //   .center(x + squareSize / 2, y + squareSize / 2);

  // circleGroup
  // .line(x, y + squareSize, x + squareSize, y)
  // .stroke("black");

  // fillRectWithDiagonalLines(x, y, circleGroup, "black");
  // circleGroup.fill(background);


  // circleGroup
  // .circle(squareSize)
  // .fill(foreground)
  // .center(x + offset[2], y = offset[3]);

  // group.add(circleGroup);
}

function drawCircle(x, y, foreground, background) {
  const group = draw.group().addClass("draw-circle").id(`draw-circle-${x}-${y}`);

  // this is okay when using real colors. When using pattern this will end up
  // being horrible because it will be a pattern of a pattern.
  group.rect(squareSize, squareSize).id('draw-circle-rect').fill(background).move(x, y);
  group.circle(squareSize).fill(foreground).move(x, y);

  // 30% of the time add inner circle
  if (Math.random() < 0.3) {
    group
      .circle(squareSize / 2)
      .fill(background)
      .move(x + squareSize / 4, y + squareSize / 4);
  }
}

function drawOppositeCircles(x, y, foreground, background) {
  const group = draw.group().addClass("opposite-circles").id(`opposite-circle-${x}-${y}`);
  group.rect(squareSize, squareSize).fill(background).id(`opposite-circle-rect-${x}-${y}`).move(x, y);

  const mask = draw.rect(squareSize, squareSize).fill("#fff").move(x, y);

  const offset = random([
    // top left + bottom right
    [0, 0, squareSize, squareSize],
    // top right + bottom left
    [0, squareSize, squareSize, 0]
  ]);

  const circleGroup = draw.group().id("circle-group");
  circleGroup
    .circle(squareSize)
    .fill(foreground)
    .center(x + offset[0], y + offset[1]);

  circleGroup
    .circle(squareSize)
    .fill(foreground)
    .center(x + offset[2], y = offset[3]);

  circleGroup.maskWith(mask);

  group.add(circleGroup);
}

function generateLittleBlock(i, j) {
  const { foreground, background } = getTwoColors(colorPalette);

  const blockStyleOptions = [drawCircle,
    drawOppositeCircles,
    drawCircleWithLines];
  //  drawBlock,
  //  drawCircleWithLines];

  const blockStyle = random(blockStyleOptions);

  const xPos = i * squareSize;
  const yPos = j * squareSize;

  blockStyle(xPos, yPos, foreground, background);
}

function generateBigBlock() {
  const { foreground, background } = getTwoColors(colorPalette);

  // options
  const blockStyleOptions = [
    drawCircle,
    drawOppositeCircles
  ];

  let prevSquareSize = squareSize;

  // random multiplier
  const multiplier = random([2, 3]);

  const xPos = random(0, numRows - multiplier, true) * prevSquareSize;
  const yPos = random(0, numCols - multiplier, true) * prevSquareSize;

  squareSize = multiplier * 100;
  const blockStyle = random(blockStyleOptions);
  blockStyle(xPos, yPos, foreground, background);

  squareSize = prevSquareSize;
}

async function drawGrid() {
  squareSize = 100;
  numRows = random(4, 8, true);
  numCols = random(4, 8, true);
  colorPalette = random(colors);

  if (useColors) {
    // set background color
    const bg = tinycolor.mix(colorPalette[0],
      colorPalette[1],
      50)
      .desaturate(10)
      .toString();

    // Make lighter version
    const bgInner = tinycolor(bg).lighten(10).toString();
    // and darker version
    const bgOuter = tinycolor(bg).darken(10).toString();

    gsap.to(".container", {
      "--bg-inner": bgInner,
      "--bg-outer": bgOuter,
      duration: 0.5
    });
  }

  draw = SVG()
    .addTo(".container")
    .id("theGrid")
    .size("100%", "100%")
    .viewbox(`0 0 ${numRows * squareSize} ${numCols * squareSize}`);

  // TODO(Ingo): move this to some other place
  setupPatterns();

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      generateLittleBlock(i, j);
    }
  }

  if (useBigBlock) {
    generateBigBlock();
  }
}

function generateNewGrid() {
  // Fade out SVG
  gsap.to(".container > svg", {
    opacity: 0,
    scale: 0.8,
    duration: 0.25,
    onComplete: () => {
      // Remove previous SVG from DOM
      document.querySelector(".container").innerHTML = "";
      // Start new SVG creation
      drawGrid();
    },
  });

  gsap.fromTo(
    ".container > svg",
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
  );
}

async function init() {
  colors = await fetch("https://unpkg.com/nice-color-palettes@3.0.0/100.json").then((response) => response.json());
  generateNewGrid();
  document.querySelector(".button").addEventListener("click", generateNewGrid);
}

init();
