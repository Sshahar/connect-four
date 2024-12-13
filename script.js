'use strict'
// Board parameters
var ROWS = 7
var COLS = 7

// Tiles
var EMPTY = 'V'
var PLAYER1 = 'Red'
var PLAYER2 = 'Yellow'
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
    for (var j=0; j<gBoard[row].length; j++) {
        renderCell({i: row, j}, value)
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

    // Filter highest graded moves
    var highestGrade = Math.max(...possibleMoves.map(m => m.grade))
    var bestMoves = possibleMoves.filter(m => m.grade === highestGrade)

    // Pick move from highest graded moves
    var moveIdx = getRandomInt(0, bestMoves.length)
    var col = bestMoves[moveIdx].j

    // Play turn
    play(col, gBoard, gCurrPlayer)

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