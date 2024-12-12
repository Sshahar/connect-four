'use strict'
// Board parameters
var gBoard = []
var ROWS = 7
var COLS = 7

// Tiles
var EMPTY = 'V'
var PLAYER1 = 'red'
var PLAYER2 = 'yellow'
var INSERT = 'B'
var PLAYER1_HOVER = 'XX'
var PLAYER2_HOVER = 'OO'

// Game state  
var gCurrPlayer
var gTurn
var gVsAI
var gGameOver
var gBlock

// String HTML
var gStrHTML = {
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

function onInit() {
    gCurrPlayer = PLAYER1
    gTurn = 1
    gVsAI = true
    gGameOver = false
    gBoard = createBoard(EMPTY)
    setRow(0, INSERT, gBoard)

    document.querySelector('.win-modal').style.display = 'none'
    document.querySelector('.game-board').style.display = 'block'
    renderBoard()
}

function renderBoard() {
    var strHTML = ''
    for (var i = 0; i < ROWS; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < COLS; j++) {
            strHTML += `\t<td onmouseenter="onCellHover(${j})"
             onmouseleave="onCellLeave(${j})"
              onclick="onCellClick(${j})"
               data-i=${i} data-j=${j}>${gStrHTML[gBoard[i][j]]}</td>\n`
        }
        strHTML += '</tr>\n'
    }
    var boardEl = document.querySelector('.game-board')
    boardEl.innerHTML = strHTML
}

function onCellHover(col) {
    if (gGameOver) return
    var playerEl = gStrHTML[gCurrPlayer == PLAYER1 ? PLAYER1_HOVER : PLAYER2_HOVER]
    renderCell({ i: 0, j: col }, playerEl)
}

function onCellLeave(col) {
    renderCell({ i: 0, j: col }, gStrHTML[INSERT])
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

function placeDisc(col, board) {

}

function playTurn(col, board) {
    // one of three options:
    // AI simulates game
    // Player's turn
    // AI's turn

    var row = getLowestRowAt(col, board, EMPTY)
    var playerEl = gStrHTML[gCurrPlayer]

    if (!row) return // column full
    board[row][col] = gCurrPlayer
    playerEl = addAttribute(playerEl, 'class', 'falling' + (row - 1))
    renderCell({ i: row, j: col }, playerEl)

    if (isWin(board)) {
        onWin()
        return
    }

    // Update current player
    if (!gVsAI) onCellLeave(col)
    gCurrPlayer = gCurrPlayer == PLAYER1 ? PLAYER2 : PLAYER1
    if (!gVsAI) onCellHover(col)
    gTurn++
    if (gTurn == (ROWS - 1) * COLS) alert('board full')
}

function onWin() {
    gGameOver = true
    document.querySelector('.win-modal').style.display = 'block'

    document.querySelector('.win-msg').innerHTML = `player ${gCurrPlayer} won!`

    // document.querySelector('.game-board').style.display = 'none'    
}

function onCellClick(col) {
    if (gGameOver) return
    if (gBlock) return

    playTurn(col, gBoard)

    if (gVsAI && !gGameOver) {
        playAITurn()
    }
}

function getOffensiveMovesAI() {
    // offensive AI
    // first tile - random location
    // next tiles - near a tile it already has
    if (gTurn === 2) {
        col = getRandomInt(0, COLS)
        playTurn(col, gBoard)
        return
    }

    var ourTiles = getCoordsWith(PLAYER2, gBoard)
    var optionalTiles = []

    for (var i = 0; i < ourTiles.length; i++) {
        var currTile = ourTiles[i]
        optionalTiles = optionalTiles.concat(getNegCoords(currTile))
    }

    return optionalTiles
}

function getDefensiveMovesAI() {
    // Defensive AI
    // find enemy tiles
    // place next to those tiles

    var enemyTiles = getCoordsWith(PLAYER1, gBoard)
    var optionalTiles = []

    for (var i = 0; i < enemyTiles.length; i++) {
        var currTile = enemyTiles[i]
        optionalTiles = optionalTiles.concat(getNegCoords(currTile))
    }
    // Only get possible tiles
    optionalTiles = optionalTiles.filter(t => t.i === getLowestRowAt(t.j, gBoard, EMPTY))

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

async function playAITurn() {
    // Block player from playing
    gBlock = true

    // Simulate AI thinking
    await sleep()

    // Get all possible moves
    var possibleMoves = getBotCoords(gBoard, EMPTY)

    // Grade moves
    possibleMoves = possibleMoves.map(gradeMove)

    // Filter highest graded moves
    var highestGrade = Math.max(...possibleMoves.map(m => m.grade))
    var bestMoves = possibleMoves.filter(m => m.grade === highestGrade)

    // Pick move from highest graded moves
    var moveIdx = getRandomInt(0, bestMoves.length)
    var col = bestMoves[moveIdx].j

    // Play turn
    playTurn(col, gBoard)

    // Unblock player
    gBlock = false
}


function gradeMove(move) {
    // var tempBoard = _.cloneDeep(gBoard)
    // if (isWin(boardAfterMove)) return { ...move, grade: Infinity }
    // var boardAfterMove = playTurn(move.j, tempBoard)

    return { ...move, grade: 1 }
}

function bestMove(move) {

}

function isWin(board) {
    for (var i = 0; i < ROWS; i++) {
        for (var j = 0; j < COLS; j++) {
            var currVal = board[i][j]
            if (currVal === EMPTY || currVal === INSERT) continue
            var coord = { i, j }
            if (1 + getConsRight(coord, COLS, board, currVal).length >= 4) return true
            if (1 + getConsBelow(coord, ROWS, board, currVal).length >= 4) return true
            if (countConsecutiveRightDown(coord, board) >= 4) return true
            if (countConsecutiveLeftUp(coord, board) >= 4) return true
        }
    }
    return false
}