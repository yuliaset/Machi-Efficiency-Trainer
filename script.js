var deck = [];
let currentHand = [];
let selectedTile = null;

// Mark a tile as selected when clicked
function selectTile(event) {
  if (selectedTile) {
    selectedTile.classList.remove("selected");
  }
  selectedTile = event.target;
  //console.log("a");
  selectedTile.classList.add("selected");
}

// Allow moving the selected tile with arrow keys
document.addEventListener("keydown", function(e) {
  if (!selectedTile) return;
  const parent = selectedTile.parentNode;
  if (e.key === "ArrowLeft") {
    const prev = selectedTile.previousElementSibling;
    if (prev) {
      parent.insertBefore(selectedTile, prev);
    }
  } else if (e.key === "ArrowRight") {
    const next = selectedTile.nextElementSibling;
    if (next) {
      parent.insertBefore(next, selectedTile);
    }
  }
});

function createDeck() {
  let deck = [];
  const suits = ["Man", "Sou", "Pin"];
  suits.forEach(suit => {
    for (let num = 1; num <= 9; num++) {
      for (let i = 0; i < 4; i++) {
        // File names are kept as "Man1.svg", etc.
        deck.push(suit + num + ".svg");
      }
    }
  });
  const honors = ["Haku", "Hatsu", "Chun", "Shaa", "Nan", "Pei", "Ton"];
  honors.forEach(tile => {
    for (let i = 0; i < 4; i++) {
      deck.push(tile + ".svg");
    }
  });
  return deck;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Utility functions for meld detection and efficiency evaluation
function isRun(threeTiles) {
  return threeTiles[1] === threeTiles[0] + 1 &&
         threeTiles[2] === threeTiles[1] + 1;
}

function isTriplet2(threeTiles) {
  return threeTiles[0] === threeTiles[1] && threeTiles[1] === threeTiles[2];
}

function combinations(arr, k) {
  const result = [];
  function combine(start, curr) {
    if (curr.length === k) {
      result.push([...curr]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      curr.push(arr[i]);
      combine(i + 1, curr);
      curr.pop();
    }
  }
  combine(0, []);
  return result;
}

function formsMeld(tiles) {
  if (tiles.length < 3) return false;
  const combs = combinations(tiles, 3);
  for (let combo of combs) {
    const sortedCombo = combo.slice().sort((a, b) => a - b);
    if (isRun(sortedCombo) || isTriplet2(sortedCombo)) {
      return true;
    }
  }
  return false;
}

function leftoverCopies(tile, shape) {
  const count = shape.filter(x => x === tile).length;
  return Math.max(4 - count, 0);
}

function acceptanceOfTiles(shape) {
  let total = 0;
  for (let t = 1; t <= 9; t++) {
    if (leftoverCopies(t, shape) > 0 && formsMeld([...shape, t])) {
      total += leftoverCopies(t, shape);
    }
  }
  return total;
}

function waitTiles(shape) {
  const wtiles = [];
  for (let t = 1; t <= 9; t++) {
    if (leftoverCopies(t, shape) > 0 && formsMeld([...shape, t])) {
      wtiles.push(t);
    }
  }
  return wtiles;
}

function improvingTiles(shape) {
  const originalAcc = acceptanceOfTiles(shape);
  const improving = [];
  for (let t = 1; t <= 9; t++) {
    if (leftoverCopies(t, shape) === 0) continue;
    if (formsMeld([...shape, t])) continue;
    const newAcc = acceptanceOfTiles([...shape, t]);
    if (newAcc > originalAcc) {
      improving.push(t);
    }
  }
  return improving;
}

function betterWaitCount(shape) {
  let totalImprove = 0;
  const itiles = improvingTiles(shape);
  for (let t of itiles) {
    totalImprove += leftoverCopies(t, shape);
  }
  return totalImprove;
}

function evaluateShape(shape) {
  return {
    completesMeld: acceptanceOfTiles(shape),
    betterWait: betterWaitCount(shape)
  };
}

function generateHand() {
  deck = createDeck();
  deck = shuffle(deck).slice(0, 18);
  //console.log(deck);
  const handTiles = deck.slice(0, 14);
  const drawnTile = deck.slice(deck.length-1, deck.length);
  deck.slice(0, 1)[0];

  currentHand = handTiles.concat([drawnTile]);
  currentHand.pop();
  displayHand(handTiles, drawnTile);

  // Clear previous displays
  document.getElementById("sortedHand").innerHTML = "";
  document.getElementById("blocks").innerHTML = "";
  document.getElementById("efficiency").innerHTML = "";

  document.getElementById("drawnTile").style.display = "none";
  document.getElementById("sortedHandTitle").style.display = "none";
  document.getElementById("sortedHand").style.display = "none";
  document.getElementById("blocksTitle").style.display = "none";
  document.getElementById("blocks").style.display = "none";
  document.getElementById("efficiencyTitle").style.display = "none";
  document.getElementById("efficiency").style.display = "none";
  showStatistics();

  document.getElementById("tileCount").innerText = "Pedras restantes: " + deck.length;
}

function displayHand(handTiles, drawnTile) {
  const handDiv = document.getElementById("hand");
  handDiv.innerHTML = "";
  handTiles.forEach(tile => {
    const img = document.createElement("img");
    // Prepend the images folder to the tile filename
    img.src = "images/" + tile;
    img.alt = tile;
    img.className = "tile";
    img.addEventListener("click", selectTile);
    img.addEventListener("dblclick", replaceTile);
    handDiv.appendChild(img);
  });

  const drawnTileDiv = document.getElementById("drawnTile");
  drawnTileDiv.innerHTML = "";
  const drawnImg = document.createElement("img");
  drawnImg.src = "images/" + drawnTile;
  drawnImg.alt = drawnTile;
  drawnImg.className = "tile";
  drawnImg.addEventListener("click", selectTile);
  drawnTileDiv.appendChild(drawnImg);
  console.log(drawnImg.src)
}

function replaceTile(event) {
  if (deck.length === 0) {
    alert("Acabaram as pedras, crie uma mão nova.");
    return;
  }
  if (event.target.parentNode.id !== "hand") return;
  //console.log(deck.length);
  //console.log(deck);

  const handDiv = document.getElementById("hand");
  const drawnTileDiv = document.getElementById("drawnTile");
  const drawnImg = drawnTileDiv.firstElementChild;
  if (!drawnImg) {
    console.log("No drawn tile available.");
    return;
  }
  const drawnTileSrc = drawnImg.alt;

  const newHandImg = document.createElement("img");
  newHandImg.src = "images/" + drawnTileSrc;
  newHandImg.alt = drawnTileSrc;
  newHandImg.className = "tile";
  newHandImg.addEventListener("click", selectTile);
  newHandImg.addEventListener("dblclick", replaceTile);
  handDiv.appendChild(newHandImg);
  currentHand.push(drawnTileSrc);

  const tileToRemove = event.target;
  handDiv.removeChild(tileToRemove);
  const removedTile = tileToRemove.alt;
  const index = currentHand.indexOf(removedTile);
  if (index > -1) {
    currentHand.splice(index, 1);
  }

  if (deck.length > 0) {
    const newDrawnTile = deck[0];
    deck.splice(0, 1)[0];
    drawnTileDiv.innerHTML = "";
    const newDrawnImg = document.createElement("img");
    newDrawnImg.src = "images/" + newDrawnTile;
    newDrawnImg.alt = newDrawnTile;
    newDrawnImg.className = "tile";
    newDrawnImg.addEventListener("click", selectTile);
    drawnTileDiv.appendChild(newDrawnImg);
  } else {
    drawnTileDiv.style.display = "inline";
    drawnTileDiv.innerHTML = "No more tiles in deck";
  }

  showStatistics();
  document.getElementById("tileCount").innerText = "Pedras restantes: " + deck.length;
}

function tileSort(a, b) {
  function getTileInfo(tile) {
    const name = tile.replace(".svg", "");
    let group = 0;
    let value = 0;
    if (name.startsWith("Man")) {
      group = 1;
      value = parseInt(name.substring(3));
    } else if (name.startsWith("Pin")) {
      group = 2;
      value = parseInt(name.substring(3));
    } else if (name.startsWith("Sou")) {
      group = 3;
      value = parseInt(name.substring(3));
    } else if (name === "Haku" || name === "Hatsu" || name === "Chun") {
      group = 4;
      value = name;
    } else if (name === "Shaa" || name === "Nan" || name === "Pei" || name === "Ton") {
      group = 5;
      value = name;
    }
    return { group, value };
  }
  
  const infoA = getTileInfo(a);
  const infoB = getTileInfo(b);
  
  if (infoA.group === infoB.group) {
    if (typeof infoA.value === "number" && typeof infoB.value === "number") {
      return infoA.value - infoB.value;
    } else {
      return infoA.value.localeCompare(infoB.value);
    }
  }
  return infoA.group - infoB.group;
}

function parseTile(tileStr) {
  let fileName = tileStr;
  if (tileStr.includes("/")) {
    const parts = tileStr.split("/");
    fileName = parts[parts.length - 1];
  }
  const base = fileName.replace(".svg", "");
  let suit = null;
  let number = null;

  if (base.startsWith("Man") || base.startsWith("Pin") || base.startsWith("Sou")) {
    suit = base.substring(0, 3);
    number = parseInt(base.substring(3));
  } else {
    suit = base;
    number = 0;
  }
  return {
    suit: suit,
    number: number,
    name: base,
    fullName: fileName
  };
}

function isSameSuit(a, b, c) {
  return a.suit === b.suit && b.suit === c.suit && (a.number !== 0 && b.number !== 0 && c.number !== 0);
}
function isSequence(a, b, c) {
  return isSameSuit(a, b, c) && (b.number === a.number + 1) && (c.number === a.number + 2);
}
function isTriplet(a, b, c) {
  return a.name === b.name && b.name === c.name;
}

function evaluateWaits(blockNumbers) {
  let waitTiles = 0;
  let waitList = [];

  if (blockNumbers.length === 2) {
    const [a, b] = blockNumbers;
    if (b === a + 1) {
      let candidates = [];
      let c1 = a - 1;
      if (c1 >= 1 && c1 <= 9) {
        candidates.push(c1);
      }
      let c2 = b + 1;
      if (c2 >= 1 && c2 <= 9) {
        candidates.push(c2);
      }
      waitTiles = candidates.length * 4;
      waitList = candidates;
    }
  }

  let improveTiles = 0;
  let improveList = [];
  if (blockNumbers.length === 2) {
    const [a, b] = blockNumbers;
    if (b === a + 1) {
      let candidate1 = a;
      let candidate2 = b;
      improveTiles = (candidate1 >= 1 && candidate1 <= 9 ? 3 : 0) +
                     (candidate2 >= 1 && candidate2 <= 9 ? 3 : 0);

      if (candidate1 >= 1 && candidate1 <= 9) improveList.push(candidate1);
      if (candidate2 >= 1 && candidate2 <= 9) improveList.push(candidate2);
    }
  }

  const denominator = 70;
  let currentWaitPercent = (waitTiles / denominator) * 100;
  let improveWaitPercent = (improveTiles / denominator) * 100;

  return {
    block: blockNumbers,
    waitList: waitList,
    waitTiles: waitTiles,
    currentWaitPercent: currentWaitPercent,
    improveList: improveList,
    improveTiles: improveTiles,
    improveWaitPercent: improveWaitPercent
  };
}

function buildBlocks(parsedTiles) {
  let tiles = [...parsedTiles];
  const blocks = [];

  function ruleMoreThanFourPairs() {
    let totalPairs = 0;
    for (let i = 0; i < tiles.length - 1; i++) {
      if (tiles[i].name === tiles[i+1].name) {
        totalPairs++;
        i++;
      }
    }
    if (totalPairs > 4) {
      let i = 0;
      while (i < tiles.length - 1) {
        if (tiles[i].name === tiles[i+1].name) {
          blocks.push([tiles[i], tiles[i+1]]);
          tiles.splice(i, 2);
        } else {
          i++;
        }
      }
      while (tiles.length > 0) {
        blocks.push([tiles.shift()]);
      }
    }
  }

  function ruleCompleteGroups() {
    let i = 0;
    while (i < tiles.length - 2) {
      const t1 = tiles[i];
      const t2 = tiles[i+1];
      const t3 = tiles[i+2];
      if (isTriplet(t1, t2, t3) || isSequence(t1, t2, t3)) {
        let group = [t1, t2, t3];
        tiles.splice(i, 3);
        blocks.push(group);
      } else {
        i++;
      }
    }
  }

  function ruleFourSequences() {
    let i = 0;
    while (i < tiles.length - 3) {
      const t1 = tiles[i];
      const t2 = tiles[i+1];
      const t3 = tiles[i+2];
      const t4 = tiles[i+3];
      if (
        t1.suit === t2.suit && t2.suit === t3.suit && t3.suit === t4.suit &&
        t1.number !== 0 && t2.number !== 0 && t3.number !== 0 && t4.number !== 0 &&
        t2.number === t1.number + 1 &&
        t3.number === t1.number + 2 &&
        t4.number === t1.number + 3
      ) {
        blocks.push([t1, t2, t3, t4]);
        tiles.splice(i, 4);
      } else {
        i++;
      }
    }
  }

  function ruleKanchanWithPair() {
    let i = 0;
    while (i < tiles.length - 2) {
      const t1 = tiles[i];
      const t2 = tiles[i+1];
      const t3 = tiles[i+2];
      if (
        t1.suit === t2.suit &&
        t2.suit === t3.suit &&
        t1.number !== 0 && t2.number !== 0 && t3.number !== 0
      ) {
        if (t1.number === t2.number && t3.number === t1.number + 2) {
          blocks.push([t1, t2, t3]);
          tiles.splice(i, 3);
          continue;
        }
        if (t2.number === t3.number && t2.number === t1.number + 2) {
          blocks.push([t1, t2, t3]);
          tiles.splice(i, 3);
          continue;
        }
      }
      i++;
    }
  }

  function rulePairWithAdjacent() {
    let i = 0;
    while (i < tiles.length - 2) {
      const t1 = tiles[i];
      const t2 = tiles[i+1];
      const t3 = tiles[i+2];
      if (
        t1.suit === t2.suit &&
        t2.suit === t3.suit &&
        t1.number !== 0 && t2.number !== 0 && t3.number !== 0
      ) {
        if (t1.number === t2.number && t3.number === t1.number + 1) {
          blocks.push([t1, t2, t3]);
          tiles.splice(i, 3);
          continue;
        }
        if (t2.number === t3.number && t2.number === t1.number + 1) {
          blocks.push([t1, t2, t3]);
          tiles.splice(i, 3);
          continue;
        }
      }
      i++;
    }
  }

  function ruleRyanmen() {
    let i = 0;
    while (i < tiles.length - 1) {
      const t1 = tiles[i];
      const t2 = tiles[i+1];
      if (
        t1.suit === t2.suit &&
        t1.number !== 0 && t2.number !== 0 &&
        t2.number === t1.number + 1
      ) {
        let group = [t1, t2];
        tiles.splice(i, 2);
        if (i < tiles.length) {
          const nextTile = tiles[i];
          if (nextTile.suit === t2.suit && nextTile.number === t2.number) {
            group.push(nextTile);
            tiles.splice(i, 1);
          }
        }
        blocks.push(group);
      } else {
        i++;
      }
    }
  }

  function ruleKanchan() {
    let i = 0;
    while (i < tiles.length - 1) {
      const t1 = tiles[i];
      const t2 = tiles[i+1];
      if (
        t1.suit === t2.suit &&
        t1.number !== 0 && t2.number !== 0 &&
        t2.number === t1.number + 2
      ) {
        let group = [t1, t2];
        tiles.splice(i, 2);
        if (i < tiles.length) {
          const nextTile = tiles[i];
          if (nextTile.suit === t2.suit && nextTile.number === t2.number) {
            group.push(nextTile);
            tiles.splice(i, 1);
          }
        }
        blocks.push(group);
      } else {
        i++;
      }
    }
  }

  function rulePairBeforeSequence() {
    let i = 0;
    while (i <= tiles.length - 5) {
      const t1 = tiles[i];
      const t2 = tiles[i+1];
      const t3 = tiles[i+2];
      const t4 = tiles[i+3];
      const t5 = tiles[i+4];
      if (
        t1.name === t2.name && t1.number !== 0 &&
        t3.suit === t4.suit && t4.suit === t5.suit &&
        t3.number !== 0 &&
        t4.number === t3.number + 1 &&
        t5.number === t4.number + 1
      ) {
        blocks.push([t1, t2]);
        blocks.push([t3, t4, t5]);
        tiles.splice(i, 5);
        continue;
      }
      i++;
    }
  }

  function ruleHonorTriplets() {
    let i = 0;
    while (i < tiles.length) {
      const tile = tiles[i];
      if (["Haku", "Hatsu", "Chun", "Shaa", "Nan", "Pei", "Ton"].includes(tile.name)) {
        let indices = [];
        for (let j = 0; j < tiles.length; j++) {
          if (tiles[j].name === tile.name) {
            indices.push(j);
          }
        }
        if (indices.length >= 3) {
          indices.sort((a, b) => b - a);
          let block = [];
          for (let k = 0; k < 3; k++) {
            block.push(tiles.splice(indices[k], 1)[0]);
          }
          blocks.push(block);
          i = 0;
          continue;
        }
      }
      i++;
    }
  }

  function ruleHonorPair() {
    let i = 0;
    const honors = ["Haku", "Hatsu", "Chun", "Shaa", "Nan", "Pei", "Ton"];
    while (i < tiles.length) {
      const tile = tiles[i];
      if (honors.includes(tile.name)) {
        let indices = [];
        for (let j = 0; j < tiles.length; j++) {
          if (tiles[j].name === tile.name) {
            indices.push(j);
          }
        }
        if (indices.length === 2) {
          indices.sort((a, b) => b - a);
          let block = [];
          for (let k = 0; k < 2; k++) {
            block.push(tiles.splice(indices[k], 1)[0]);
          }
          blocks.push(block);
          i = 0;
          continue;
        }
      }
      i++;
    }
  }

  function rulePairs() {
    let i = 0;
    while (i < tiles.length - 1) {
      const t1 = tiles[i];
      const t2 = tiles[i+1];
      if (t1.name === t2.name) {
        blocks.push([t1, t2]);
        tiles.splice(i, 2);
      } else {
        i++;
      }
    }
  }

  function ruleSingles() {
    while (tiles.length > 0) {
      blocks.push([tiles.shift()]);
    }
  }

  function ruleKan() {
    let i = 0;
    while (i < tiles.length) {
      const tile = tiles[i];
      let indices = [];
      for (let j = 0; j < tiles.length; j++) {
        if (tiles[j].name === tile.name) {
          indices.push(j);
        }
      }
      if (indices.length >= 4) {
        indices.sort((a, b) => b - a);
        let block = [];
        for (let k = 0; k < 4; k++) {
          block.push(tiles.splice(indices[k], 1)[0]);
        }
        blocks.push(block);
        i = 0;
        continue;
      }
      i++;
    }
  }

  function ruleHakuGroup() {
    let hakuIndices = [];
    for (let i = 0; i < tiles.length; i++) {
      if (tiles[i].name === "Haku") {
        hakuIndices.push(i);
      }
    }
    tiles.forEach((i) => {
      //console.log(i);
    });
    
    if (hakuIndices.length === 3) {
      hakuIndices.sort((a, b) => b - a);
      let block = [];
      for (let j = 0; j < 3; j++) {
        block.push(tiles.splice(hakuIndices[j], 1)[0]);
      }
      blocks.push(block);
    }
    else if (hakuIndices.length === 2) {
      hakuIndices.sort((a, b) => b - a);
      let block = [];
      for (let j = 0; j < 2; j++) {
        block.push(tiles.splice(hakuIndices[j], 1)[0]);
      }
      blocks.push(block);
    }
  }

  const rulesPipeline = [
    ruleHakuGroup,
    ruleMoreThanFourPairs,
    ruleHonorPair,
    ruleHonorTriplets,
    ruleKan,
    ruleCompleteGroups,
    ruleFourSequences,
    rulePairBeforeSequence,
    ruleRyanmen,
    ruleKanchanWithPair,
    rulePairWithAdjacent,
    ruleKanchan,
    rulePairs,
    ruleSingles
  ];
  for (let ruleFunc of rulesPipeline) {
    ruleFunc();
  }
  return blocks;
}

function countPairs(blocks) {
  let totalPairs = 0;
  blocks.forEach(b => {
    if (b.length === 2 && b[0].name === b[1].name) {
      totalPairs++;
    }
  });
  return totalPairs;
}

function analyzeBlock(block) {
  const n = block.length;
  const n1 = block[0] ? block[0].number : null;
  const n2 = block[1] ? block[1].number : null;
  const n3 = block[2] ? block[2].number : null;
  var improvement = "";
  
  if (n === 3 && isTriplet(block[0], block[1], block[2])) {
    return "grupo completo: trinca";
  }
  if (n === 3 && isSequence(block[0], block[1], block[2])) {
    return "grupo completo: sequência";
  }

  if (n === 2) {
    if (n1 === 1 && n2 === 2) {
      return "espera penchan: \neficiência: " + (evaluateShape([n1, n2]).completesMeld/70*100).toFixed(2) + "%\nmelhora: " + (evaluateShape([n1, n2]).betterWait/70*100).toFixed(2) + "%";
    }
    if (n1 === 8 && n2 === 9) {
      return "espera penchan: \neficiência: " + (evaluateShape([n1, n2]).completesMeld/70*100).toFixed(2) + "%\nmelhora: " + (evaluateShape([n1, n2]).betterWait/70*100).toFixed(2) + "%";
    }
  }

  if (n === 2 && (n2 === n1 + 1) && n1 !== 1) {
    return "espera ryanmen: \neficiência: " + (evaluateShape([n1, n2]).completesMeld/70*100).toFixed(2) + "%\nmelhora: " + (evaluateShape([n1, n2]).betterWait/70*100).toFixed(2) + "%";
  }

  if (n === 3 && 
      (n2 === n1 + 1 && 
      n3 === n1 + 1) ||
    (n1 === n2 && 
    n2 === n3 - 1)
  ) {
      return "par ryanmen: \neficiência: " + (evaluateShape([n1, n2, n3]).completesMeld/70*100).toFixed(2) + "%\nmelhora: " + (evaluateShape([n1, n2, n3]).betterWait/70*100).toFixed(2) + "%";
  }

  if (n == 2){
    if (
      (n1 === 1 && n2 === 3) ||
      (n1 === 2 && n2 === 4) ||
      (n1 === 7 && n2 === 9) ||
      (n1 === 6 && n2 === 8)
    ) {
      return "espera kanchan interna: \neficiência: " + (evaluateShape([n1, n2]).completesMeld/70*100).toFixed(2) + "%\nmelhora: " + (evaluateShape([n1, n2]).betterWait/70*100).toFixed(2) + "%";
    }
  }

  if (n === 3 && ( 
  (n1 === n2 && 
  n3 === n1 + 2) ||
  (n2 === n3 && 
  n1 === n2 + 2))
      ) {
    return "par kanchan: \neficiência: " + (evaluateShape([n1, n2, n3]).completesMeld/70*100).toFixed(2) + "%\nmelhora: " + (evaluateShape([n1, n2, n3]).betterWait/70*100).toFixed(2) + "%";
  }

  if (n === 2 && (n2 === n1 + 2)) {
    return "espera kanchan externa: \neficiência: " + (evaluateShape([n1, n2]).completesMeld/70*100).toFixed(2) + "%\nmelhora: " + (evaluateShape([n1, n2]).betterWait/70*100).toFixed(2) + "%";
  }

  if (n === 3) {
    if (n1 === n2 && n3 === n1 + 2) {
      if (!((n1===1 && n3===3) || (n1===2 && n3===4))) {
        return "par kanchan: \neficiência: " + (evaluateShape([n1, n2, n3]).completesMeld/70*100).toFixed(2) + "%\nmelhora: " + (evaluateShape([n1, n2, n3]).betterWait/70*100).toFixed(2) + "%";
      }
    }
    if (n2 === n3 && n2 === n1 + 2) {
      if (!((n1===1 && n2===3) || (n1===2 && n2===4))) {
        return "par kanchan: \neficiência: " + (evaluateShape([n1, n2, n3]).completesMeld/70*100).toFixed(2) + "%\nmelhora: " + (evaluateShape([n1, n2, n3]).betterWait/70*100).toFixed(2) + "%";
      }
    }
  }

  if (n === 3 && n1 === 1 && n2 === 1 && n3 === 2) {
    return "par penchan: \neficiência: " + (evaluateShape([n1, n2]).completesMeld/70*100).toFixed(2) + "%\nmelhora: " + (evaluateShape([n1, n2]).betterWait/70*100).toFixed(2) + "%";
  }
  
  if (n === 2 && block[0].name === block[1].name) {
      if (n1 == 0){
          return "par: \neficiência: 2.86% para mão fechada, potencial maior em mãos abertas\nmelhora: " + (evaluateShape([n1, n2]).betterWait/70*100).toFixed(2) + "%";
      }
      else {
          return "par: \neficiência: " + (evaluateShape([n1, n2]).completesMeld/70*100).toFixed(2) + "%\nmelhora: " + (evaluateShape([n1, n2]).betterWait/70*100).toFixed(2) + "%";
      }
  } 

  if (n === 1) {
      if (n1 == 1 || n1 == 9){
          return "ponta isolada: baixa eficiência";
      }
      if (n1 == 2 || n1 == 8){
          return "2/8 isolado: próximo à ponta, eficiência mediana";
      }
      if (n1 == 0){
          return "vento/dragão isolado: eficiência baixa a curto prazo";
      }
      else {
          return "3-7 isolado: boa eficiência";
      }
  }
  return "";
}

function displayBlocks(blocks) {
  const blocksDiv = document.getElementById("blocks");
  blocksDiv.innerHTML = "";
  blocks.forEach(block => {
    const blockDiv = document.createElement("div");
    blockDiv.className = "block";
    block.forEach(tileObj => {
      const img = document.createElement("img");
      // Prepend "images/" to the tile filename
      img.src = "images/" + tileObj.fullName;
      img.alt = tileObj.fullName;
      img.className = "tile";
      blockDiv.appendChild(img);
    });
    blocksDiv.appendChild(blockDiv);
  });
}

function displayEfficiency(blocks) {
  const effDiv = document.getElementById("efficiency");
  effDiv.innerHTML = "";
  blocks.forEach(block => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.margin = "5px 10px";
    block.forEach(tileObj => {
      const img = document.createElement("img");
      img.src = "images/" + tileObj.fullName;
      img.alt = tileObj.fullName;
      img.className = "tile";
      row.appendChild(img);
    });
    const textSpan = document.createElement("span");
    textSpan.style.marginLeft = "12px";
    textSpan.innerText = analyzeBlock(block);
    row.appendChild(textSpan);
    effDiv.appendChild(row);
  });
}

function showStatistics() {
  if (currentHand.length === 0) return;
  const sortedHand = currentHand.slice().sort(tileSort);

  document.getElementById("sortedHandTitle").style.display = "inline-block";
  document.getElementById("sortedHand").style.display = "flex";
  document.getElementById("blocksTitle").style.display = "inline-block";
  document.getElementById("blocks").style.display = "flex";
  document.getElementById("efficiencyTitle").style.display = "inline-block";
  document.getElementById("efficiency").style.display = "block";

  const sortedDiv = document.getElementById("sortedHand");
  sortedDiv.innerHTML = "";
  sortedHand.forEach(tile => {
    const img = document.createElement("img");
    // Prepend the images folder
    img.src = "images/" + tile;
    img.alt = tile;
    img.className = "tile";
    sortedDiv.appendChild(img);
  });

  const parsed = sortedHand.map(t => parseTile(t));
  const blocks = buildBlocks(parsed);
  displayBlocks(blocks);
  displayEfficiency(blocks);
}

window.onload = generateHand;
