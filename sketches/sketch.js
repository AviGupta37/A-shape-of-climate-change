let table;
let numRows;

let centerX, centerY;
let currentYearIndex = 0;   // 0 … numRows-1

let isPlaying = true;
let speedSlider;
let playPauseButton;
let yearInput, gotoButton;
let yearSlider;

// ----------------- DATA -----------------
function preload() {
  table = loadTable('data/co2_dataset.csv', 'csv', 'header');
}

// ----------------- SETUP -----------------
function setup() {
  createCanvas(700, 700);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();
  frameRate(60);

  numRows = table.getRowCount();
  centerX = width / 2;
  centerY = height / 2;

  textSize(18);
  textAlign(CENTER, CENTER);

  // -------- UI CONTROLS --------

  // Speed slider: how many years per frame
  createP("Animation speed (years per frame):");
  speedSlider = createSlider(1, 10, 3, 1);   // min, max, default, step
  speedSlider.style('width', '200px');

  // Play/Pause button
  playPauseButton = createButton('Pause');
  playPauseButton.mousePressed(togglePlayPause);

  // Direct year input + Go button
  createP("Jump directly to a year from the dataset:");
  yearInput = createInput('');
  yearInput.attribute('placeholder', 'Year (e.g. 1980)');
  gotoButton = createButton('Go to year');
  gotoButton.mousePressed(() => {
    let y = yearInput.value().trim();
    gotoYear(y);
  });

  // Year scrubber slider (interactive timeline)
  createP("Scrub through the years:");
  yearSlider = createSlider(0, numRows - 1, 0, 1); // index-based
  yearSlider.style('width', '400px');

  // When user drags slider, pause and go to that year
  yearSlider.input(() => {
    let idx = int(yearSlider.value());
    renderUpTo(idx + 1);
    isPlaying = false;
    playPauseButton.html('Play');
  });

  // ---- initial render AFTER controls exist ----
  background(0);
  renderUpTo(1);   // draw up to first row (index 0)
}

// ----------------- DRAW LOOP -----------------
function draw() {
  // 1. If playing, advance animation using speedSlider
  if (isPlaying && currentYearIndex < numRows - 1) {
    let yearsPerFrame = int(speedSlider.value());

    for (let k = 0; k < yearsPerFrame && currentYearIndex < numRows - 1; k++) {
      currentYearIndex++;
      drawCircleForRow(currentYearIndex);
    }
    // update year slider position to match animation
    yearSlider.value(currentYearIndex);
  }

  // 2. OVERLAY: year + CO2 text (top band)
  let idx = constrain(currentYearIndex, 0, numRows - 1);
  let yr  = table.getString(idx, 'Yr');
  let co2 = table.getString(idx, 'co2');

  noStroke();
  // clear top band
  fill(0);
  rect(0, 0, width, 80);

  fill(255);
  text(`Year: ${yr}   CO₂: ${co2} ppm`, width / 2, 40);

  // 3. OVERLAY: legend + simple “mood” text (bottom band)
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

  // 4. PAUSED label (top-right)
  if (!isPlaying) {
    fill(0, 150);
    rect(width - 140, 10, 130, 30);
    fill(255);
    textSize(16);
    text("PAUSED", width - 75, 25);
    textSize(18);
  }
}

// ----------------- DRAW HELPERS -----------------

function drawCircleForRow(i) {
  let co2_norm = table.getNum(i, 'co2_normalize');  // 0 → 1
  let radius   = map(co2_norm, 0, 1, 50, 320);
  let col      = map(co2_norm, 0, 1, 210, 0);        // blue → red

  fill(col, 70, 100, 40);  // slightly transparent
  ellipse(centerX, centerY, radius * 2, radius * 2);
}

// Redraw everything from start up to given index
function renderUpTo(targetIndex) {
  background(0);
  let maxIndex = constrain(targetIndex, 0, numRows);

  for (let i = 0; i < maxIndex; i++) {
    drawCircleForRow(i);
  }

  currentYearIndex = maxIndex - 1;

  // only update slider if it exists
  if (yearSlider) {
    yearSlider.value(currentYearIndex);
  }
}

// ----------------- UI FUNCTIONS -----------------

function togglePlayPause() {
  isPlaying = !isPlaying;
  playPauseButton.html(isPlaying ? 'Pause' : 'Play');
}

// Jump directly to a specific year in the CSV
function gotoYear(yearStr) {
  if (!yearStr) return;

  let foundIndex = -1;
  for (let i = 0; i < numRows; i++) {
    if (table.getString(i, 'Yr') === yearStr) {
      foundIndex = i;
      break;
    }
  }

  if (foundIndex !== -1) {
    renderUpTo(foundIndex + 1); // redraw circles up to that year
    isPlaying = false;
    playPauseButton.html('Play');
  } else {
    console.log('Year not found in dataset:', yearStr);
  }
}

// Quick keyboard shortcuts
function keyPressed() {
  if (key === ' ') {          // Space to play/pause
    togglePlayPause();
  } else if (key === 'r' || key === 'R') {  // R to restart
    renderUpTo(1);
    isPlaying = true;
    playPauseButton.html('Pause');
  }
}
