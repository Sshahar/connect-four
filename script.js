var ROWS = 7
var COLS = 7
var EMPTY = 'V'
var PLAYER1 = 'X'
var PLAYER2 = 'O'
var INSERT = 'B'
var PLAYER1_HOVER = 'XX'
var PLAYER2_HOVER = 'OO'
// Game state  
var gBoard = []
var gCurrPlayer = PLAYER1
var gTurn = 1
var gVsAI = true

var gElements = {
    [EMPTY]: '<svg height="80" width="80">\n' +
        '   <circle r="30" cx="40" cy="40" fill="#bebcbf"/>\n' +
        '</svg>',
    [PLAYER1]: '<svg height="80" width="80">\n' +
        '   <circle r="30" cx="40" cy="40" fill="red"/>\n' +
        '</svg>',
    [PLAYER2]: '<svg height="80" width="80">\n' +
        '   <circle r="30" cx="40" cy="40" fill="yellow"/>\n' +
        '</svg>',
    [INSERT]: '<svg height="80" width="80">\n' +
        '   <rect height="100" width="100" cx="40" cy="40" fill="#bebcbf"/>\n' +
        '</svg>',
    [PLAYER1_HOVER]: '<svg height="80" width="80" style="background-color: #bebcbf">\n' +
        '   <circle r="30" cx="40" cy="20" fill="red"/>\n' +
        '</svg>',
    [PLAYER2_HOVER]: '<svg height="80" width="80" style="background-color: #bebcbf">\n' +
        '   <circle r="30" cx="40" cy="20" fill="yellow"/>\n' +
        '</svg>',
}

gBoard = createBoard()
renderBoard()

function createBoard() {
    var board = []

    for (var i = 0; i < ROWS; i++) {
        board[i] = []
        for (var j = 0; j < COLS; j++) {
            var tile = EMPTY
            if (i == 0) tile = INSERT
            board[i][j] = tile
        }
    }

    return board
}

function renderBoard() {
    var strHTML = ''
    for (var i = 0; i < ROWS; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < COLS; j++) {
            strHTML += `\t<td onmouseenter="onTdHover(${j})" onmouseleave="onTdLeave(${j})" onclick="onTdClick(${j})" data-i=${i} data-j=${j}>${gElements[gBoard[i][j]]}</td>\n`
        }
        strHTML += '</tr>\n'
    }
    var boardEl = document.getElementById('game-board')
    boardEl.innerHTML = strHTML
}

function onTdHover(col) {
    var playerEl = gElements[gCurrPlayer == PLAYER1 ? PLAYER1_HOVER : PLAYER2_HOVER]
    renderCell({ i: 0, j: col }, playerEl)
}

function onTdLeave(col) {
    renderCell({ i: 0, j: col }, gElements[INSERT])
}

function renderCell(coord, value) {
    const cellSelector = `td[data-i="${coord.i}"][data-j="${coord.j}"]`
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}

function addAttribute(elementTxt, htmlClass, value) {
    var startIdx = elementTxt.indexOf(' ')
    var elArr = elementTxt.split('')
    elArr.splice(startIdx, 0, ` ${htmlClass}="${value}"`)
    elementTxt = elArr.join('')

    return elementTxt
}

function playTurn(col) {
    var row = getLowestRowAt(col)
    var playerEl = gElements[gCurrPlayer]

    if (row === -1) return // column full
    gBoard[row][col] = gCurrPlayer
    playerEl = addAttribute(playerEl, 'class', 'falling' + (row - 1))
    renderCell({ i: row, j: col }, playerEl)

    if (isWin()) {
        setTimeout(() => alert('player won!'), 100)
    }
    // Update current player
    if (!gVsAI) onTdLeave(col)
    gCurrPlayer = gCurrPlayer == PLAYER1 ? PLAYER2 : PLAYER1
    if (!gVsAI) onTdHover(col)
    gTurn++
    if (gTurn == (ROWS - 1) * COLS) alert('board full')
}

function onTdClick(col) {
    playTurn(col)

    if (gVsAI) {
        playAITurn()
    }
}

function getOffensiveMovesAI() {
    // offensive AI
    // first tile - random location
    // next tiles - near a tile it already has
    if (gTurn === 2) {
        col = getRandomInt(0, COLS)
        playTurn(col)
        return
    }

    var ourTiles = getTilesWith(PLAYER2, gBoard)
    var optionalTiles = []

    for (var i = 0; i < ourTiles.length; i++) {
        var currTile = ourTiles[i]
        optionalTiles = optionalTiles.concat(getNeiborTiles(currTile))
    }
    
    return optionalTiles
}

function getDefensiveMovesAI() {
    // Defensive AI
    // find enemy tiles
    // place next to those tiles

    var enemyTiles = getTilesWith(PLAYER1, gBoard)
    var optionalTiles = []

    for (var i = 0; i < enemyTiles.length; i++) {
        var currTile = enemyTiles[i]
        optionalTiles = optionalTiles.concat(getNeiborTiles(currTile))
    }
    // Only get possible tiles
    optionalTiles = optionalTiles.filter(t => t.i === getLowestRowAt(t.j))
    
    optionalTiles = optionalTiles.filter(t => {
        var keep = false

        // keep tiles near enemy
        enemyTiles.forEach(et => {
            if (distance(t, et) === 1) keep = true
        })
        return keep
    })

    return optionalTiles
}

function distance(coord1, coord2) {
    return Math.abs(coord1.i - coord2.i) + Math.abs(coord1.j - coord2.j)
}

async function playAITurn() {
    optionalTiles = getDefensiveMovesAI()

    // Get random tile 
    var tileIdx = getRandomInt(0, optionalTiles.length)
    var col = optionalTiles[tileIdx].j
    playTurn(col)
}

async function sleep() {
    await new Promise(r => setTimeout(r, 1000))
}

function getNeiborTiles(coord) {
    var tiles = []
    for (var i = coord.i - 1; i < ROWS && i <= coord.i + 1; i++) {
        for (var j = coord.j - 1; j < COLS && j <= coord.j + 1; j++) {
            if (i < 0 || j < 0) continue
            if (i == coord.i && j == coord.j) continue
            tiles.push({ i, j })
        }
    }

    return tiles
}

function getTilesWith(value, board) {
    var tiles = []

    for (var i = 0; i < ROWS; i++) {
        for (var j = 0; j < COLS; j++) {
            if (board[i][j] == value) tiles.push({ i, j })
        }
    }

    return tiles
}

function getLowestRowAt(col) {
    for (var row = ROWS - 1; row >= 0; row--) {
        if (gBoard[row][col] === EMPTY) return row
    }
    return -1
}

function countConsecutiveRight(coord) {
    var count = 0

    var i = coord.i
    for (var j = coord.j; j < COLS; j++) {
        if (gBoard[i][j] == gBoard[coord.i][coord.j]) count++
        else break
    }

    return count
}

function countConsecutiveDown(coord) {
    var count = 0

    for (var i = coord.i, j = coord.j; i < ROWS; i++) {
        if (gBoard[i][j] == gBoard[coord.i][coord.j]) count++
        else break
    }

    return count
}

function countConsecutiveRightDown(coord) {
    var count = 0

    for (var i = coord.i, j = coord.j; i < ROWS && j < COLS; i++, j++) {
        if (gBoard[i][j] == gBoard[coord.i][coord.j]) count++
        else break
    }

    return count
}

function countConsecutiveLeftUp(coord) {
    var count = 0

    for (var i = coord.i, j = coord.j; i >= 0 && j < COLS; i--, j++) {
        if (gBoard[i][j] == gBoard[coord.i][coord.j]) count++
        else break
    }

    return count
}


function isWin() {
    for (var i = 0; i < ROWS; i++) {
        for (var j = 0; j < COLS; j++) {
            if (gBoard[i][j] === EMPTY || gBoard[i][j] === INSERT) continue
            if (countConsecutiveRight({ i, j }) >= 4) return true
            if (countConsecutiveDown({ i, j }) >= 4) return true
            if (countConsecutiveRightDown({ i, j }) >= 4) return true
            if (countConsecutiveLeftUp({ i, j }) >= 4) return true
        }
    }
    return false
}

function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min))
}