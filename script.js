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
var gTurn = 0

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

function onTdClick(col) {
    var row = findEmptyDepth(col)
    var playerEl = gElements[gCurrPlayer]

    if (row === -1) return // column full
    gBoard[row][col] = gCurrPlayer
    onTdLeave(col)
    playerEl = addAttribute(playerEl, 'class', 'falling' + (row-1))
    renderCell({ i: row, j: col }, playerEl)

    if (isWin()) {
        setTimeout(() => alert('player won!'), 100)
    }
    gCurrPlayer = gCurrPlayer == PLAYER1 ? PLAYER2 : PLAYER1
    onTdHover(col)
    gTurn++
    if (gTurn == (ROWS - 1) * COLS) alert('board full')
}

function findEmptyDepth(col) {
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