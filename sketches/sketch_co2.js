// sketch_co2.js
// Uses: data/co2_dataset.csv
// Headers: Yr, co2, co2_normalize

let co2Table;
let co2Rows;

let co2CenterX, co2CenterY;
let co2Index = 0;

let co2Playing = true;
let co2SpeedSlider;
let co2PlayPauseButton;
let co2YearInput, co2GotoButton;
let co2YearSlider;

function preload() {
  co2Table = loadTable('data/co2_dataset.csv', 'csv', 'header');
}

function setup() {
  createCanvas(700, 700);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();
  frameRate(60);

  co2Rows = co2Table.getRowCount();
  co2CenterX = width / 2;
  co2CenterY = height / 2;

  textSize(18);
  textAlign(CENTER, CENTER);

  // ---- UI controls ----
  createP("CO₂ – Animation speed (years per frame):");
  co2SpeedSlider = createSlider(1, 10, 3, 1);
  co2SpeedSlider.style('width', '200px');

  co2PlayPauseButton = createButton('Pause');
  co2PlayPauseButton.mousePressed(co2TogglePlayPause);

  createP("CO₂ – Jump directly to a year:");
  co2YearInput = createInput('');
  co2YearInput.attribute('placeholder', 'Year (e.g. 1980)');
  co2GotoButton = createButton('Go to year');
  co2GotoButton.mousePressed(() => {
    let y = co2YearInput.value().trim();
    co2GotoYear(y);
  });

  createP("CO₂ – Scrub through the years:");
  co2YearSlider = createSlider(0, co2Rows - 1, 0, 1);
  co2YearSlider.style('width', '400px');
  co2YearSlider.input(() => {
    let idx = int(co2YearSlider.value());
    co2RenderUpTo(idx + 1);
    co2Playing = false;
    co2PlayPauseButton.html('Play');
  });

  background(0);
  co2RenderUpTo(1);
}

function draw() {
  // --- CO₂ animation ---
  if (co2Playing && co2Index < co2Rows - 1) {
    let steps = int(co2SpeedSlider.value());
    for (let k = 0; k < steps && co2Index < co2Rows - 1; k++) {
      co2Index++;
      co2DrawCircle(co2Index);
    }
    co2YearSlider.value(co2Index);
  }

  // Top overlay
  let idx = constrain(co2Index, 0, co2Rows - 1);
  let yr = co2Table.getString(idx, 'Yr');
  let co2 = co2Table.getString(idx, 'co2');

  noStroke();
  fill(0);
  rect(0, 0, width, 80);

  fill(255);
  text(`Year: ${yr}   CO₂: ${co2} ppm`, width / 2, 40);

  // Bottom legend + message
  fill(0);
  rect(0, height - 80, width, 80);

  fill(255);
  text("Blue: Low CO₂  |  Red: High CO₂", width / 2, height - 50);

  let co2Num = float(co2);
  let msg = "";
  if (co2Num < 320) msg = "Relatively safe levels";
  else if (co2Num < 380) msg = "Rising concern";
  else if (co2Num < 420) msg = "High – climate risk";
  else msg = "Very high – climate emergency";

  text(msg, width / 2, height - 25);

  // Paused label
  if (!co2Playing) {
    fill(0, 150);
    rect(width - 140, 10, 130, 30);
    fill(255);
    textSize(16);
    text("PAUSED", width - 75, 25);
    textSize(18);
  }
}

// ---- CO₂ helpers ----

function co2DrawCircle(i) {
  let norm = co2Table.getNum(i, 'co2_normalize');
  let radius = map(norm, 0, 1, 50, 320);
  let hue = map(norm, 0, 1, 210, 0);

  fill(hue, 70, 100, 40);
  ellipse(co2CenterX, co2CenterY, radius * 2, radius * 2);
}

function co2RenderUpTo(target) {
  background(0);
  let maxIndex = constrain(target, 0, co2Rows);
  for (let i = 0; i < maxIndex; i++) {
    co2DrawCircle(i);
  }
  co2Index = maxIndex - 1;
  if (co2YearSlider) co2YearSlider.value(co2Index);
}

function co2TogglePlayPause() {
  co2Playing = !co2Playing;
  co2PlayPauseButton.html(co2Playing ? 'Pause' : 'Play');
}

function co2GotoYear(yearStr) {
  if (!yearStr) return;
  let found = -1;
  for (let i = 0; i < co2Rows; i++) {
    if (co2Table.getString(i, 'Yr') === yearStr) {
      found = i;
      break;
    }
  }
  if (found !== -1) {
    co2RenderUpTo(found + 1);
    co2Playing = false;
    co2PlayPauseButton.html('Play');
  } else {
    console.log('CO₂ year not found:', yearStr);
  }
}

function keyPressed() {
  if (key === ' ') {
    co2TogglePlayPause();
  } else if (key === 'r' || key === 'R') {
    co2RenderUpTo(1);
    co2Playing = true;
    co2PlayPauseButton.html('Pause');
  }
}
