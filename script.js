'use strict'
// Board parameters
var ROWS = 7
var COLS = 7

// Tiles
var EMPTY = 'V'
var PLAYER1 = '🔴'
var PLAYER2 = '🟡'
var INSERT = 'B'
var PLAYER1_HOVER = 'XX'
var PLAYER2_HOVER = 'OO'

// Game state  
var gBoard = []
var gCurrPlayer
var gTurn
var gVsAI
var gGameOver
var gBlock

//  sizes
var scale = window.screen.width > 680 && window.screen.height > 800 ? 1 : 0.5
var discSize = 80 * scale
var discRadius = 30 * scale
var discCenter = 40 * scale
var hoverCenter = 20 * scale

var gStrHTML = {
    [EMPTY]: `<svg height="${discSize}" width="${discSize}">\n` +
        `   <circle r="${discRadius}" cx="${discCenter}" cy="${discCenter}" fill="${grey}"/>\n` +
        `</svg>`,
    [PLAYER1]: `<svg height="${discSize}" width="${discSize}">\n` +
        `   <circle r="${discRadius}" cx="${discCenter}" cy="${discCenter}" fill="red"/>\n` +
        `</svg>`,
    [PLAYER2]: `<svg height="${discSize}" width="${discSize}">\n` +
        `   <circle r="${discRadius}" cx="${discCenter}" cy="${discCenter}" fill="yellow"/>\n` +
        `</svg>`,
    [INSERT]: `<svg height="${discSize}" width="${discSize}">\n` +
        `   <rect height="100" width="100" cx="${discCenter}" cy="${discCenter}" fill="${grey}"/>\n` +
        `</svg>`,
    [PLAYER1_HOVER]: `<svg height="${discSize}" width="${discSize}" style="background-color: ${grey}">\n` +
        `   <circle r="${discRadius}" cx="${discCenter}" cy="${hoverCenter}" fill="red"/>\n` +
        `</svg>`,
    [PLAYER2_HOVER]: `<svg height="${discSize}" width="${discSize}" style="background-color: ${grey}">\n` +
        `   <circle r="${discRadius}" cx="${discCenter}" cy="${hoverCenter}" fill="yellow"/>\n` +
        `</svg>`,
}

function onInit() {
    gCurrPlayer = PLAYER1
    gTurn = 1
    gVsAI = true
    gGameOver = false
    gBlock = false
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
            strHTML += `\t<td onmousemove="onMove(${j})"
              onclick="onCellClick(${j})"
               data-i=${i} data-j=${j}>${gStrHTML[gBoard[i][j]]}</td>\n`
        }
        strHTML += '</tr>\n'
    }
    var boardEl = document.querySelector('.game-board')
    boardEl.innerHTML = strHTML
}

function onMove(col) {
    renderRow(0, gStrHTML[INSERT])
    if (gGameOver) return
    if (gBlock) return
    var playerEl = gStrHTML[gCurrPlayer == PLAYER1 ? PLAYER1_HOVER : PLAYER2_HOVER]
    renderCell({ i: 0, j: col }, playerEl)
}

function renderRow(row, value) {
    for (var j = 0; j < gBoard[row].length; j++) {
        renderCell({ i: row, j }, value)
    }
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

function makeMove(col, board, currPlayer) {

    var row = getLowestRowAt(col, board, EMPTY)
    if (!row) return
    // move is valid:

    // Update js model
    board[row][col] = currPlayer

    return { i: row, j: col }
}

function renderDisc(coord) {
    // Render disc to DOM
    var elDisc = gStrHTML[gCurrPlayer]
    elDisc = addAttribute(elDisc, 'class', 'falling' + (coord.i - 1))
    renderCell(coord, elDisc)
}

function onWin() {
    gGameOver = true
    document.querySelector('.win-modal').style.display = 'block'

    document.querySelector('.win-msg-span').innerHTML = gCurrPlayer

    // document.querySelector('.game-board').style.display = 'none'    
}

function onCellClick(col) {
    if (gBlock) return

    renderRow(0, gStrHTML[INSERT])
    play(col, gBoard, gCurrPlayer)

    // If vs AI, play his turn
    if (gVsAI) playAITurn()
}

function play(col, board, player) {
    if (gGameOver) return

    // Make move (js side only)
    var coord = makeMove(col, board, player)
    if (!coord) return

    // Render move
    renderDisc(coord)

    // Check win
    if (isWin(board)) {
        onWin()
        return
    }

    // Toggle current player
    gCurrPlayer = gCurrPlayer == PLAYER1 ? PLAYER2 : PLAYER1

    // Render current player
    document.querySelector('span.player-disc').innerHTML = gCurrPlayer

    // Is board full?
    if (gTurn++ == (ROWS - 1) * COLS) {
        tie()
        return
    }
}

function tie() {
    document.querySelector('.win-modal').style.display = 'block'
    document.querySelector('.win-msg-span').innerHTML = 'Nobody'

}

async function playAITurn() {
    if (gGameOver) return
    // Block player from playing
    gBlock = true

    // Simulate AI thinking
    await sleep()

    // Get all possible moves
    var possibleMoves = getBotCoords(gBoard, EMPTY)

    // Grade moves
    possibleMoves = possibleMoves.map(gradeMove)

    // Filter highest graded moves and pick one
    var col = getBestMove(possibleMoves)

    // Play turn
    play(col, gBoard, gCurrPlayer)

    // Unblock player
    gBlock = false
}

// TODO: teach block from 2 directions
function getBoardScore(board) {
    var score = 0
    var occupiedCells = getCellsWith([PLAYER1, PLAYER2], board)
    var consFuncs = [
        getConsN, getConsS,
        getConsE, getConsW,
        getConsNE, getConsSW,
        getConsNW, getConsSE,
    ]
    for (var ocIdx = 0; ocIdx < occupiedCells.length; ocIdx++) {
        var currCoord = occupiedCells[ocIdx]
        var currCell = board[currCoord.i][currCoord.j]
        var sign = currCell === PLAYER1 ? -1 : 1

        for (var fIdx = 0; fIdx < consFuncs.length - 1; fIdx += 2) {
            var consCount = 1 + consFuncs[fIdx](currCoord, 3, board, [currCell]).length +
                consFuncs[fIdx + 1](currCoord, 3, board, [currCell]).length
            var canConsWin = (1 + consFuncs[fIdx](currCoord, 3, board, [currCell, EMPTY]).length +
                consFuncs[fIdx + 1](currCoord, 3, board, [currCell, EMPTY]).length) >= 4
            if (canConsWin) score += sign * Math.pow(10, consCount - 1)
            if (consCount >= 4) return sign * Infinity
        }
    }
    console.log('score:', score)
    return score
}

function gradeMove(move) {
    // Create a copy of board
    var simBoard = _.cloneDeep(gBoard)

    // Make move
    makeMove(move.j, simBoard, gCurrPlayer)
    move.grade = getBoardScore(simBoard)

    // Check board state - this is grade
    return move
}

function getBestMove(possibleMoves) {
    var highestGrade = Math.max(...possibleMoves.map(m => m.grade))
    var bestMoves = possibleMoves.filter(m => m.grade === highestGrade)

    // Pick move from highest graded moves
    var moveIdx = getRandomInt(0, bestMoves.length)
    var col = bestMoves[moveIdx].j

    return col
}

function isWin(board) {
    var score = getBoardScore(board)
    return score === Infinity || score === -Infinity
}