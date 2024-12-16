'use strict'

function createBoard(defaultCell = '') {
    if (!isMatInit()) return
    var mat = []

    for (var i = 0; i < ROWS; i++) {
        mat[i] = []
        for (var j = 0; j < COLS; j++) {
            mat[i][j] = defaultCell
        }
    }
    return mat
}

function setRow(row, val, board) {
    for (var col = 0; col < board[row].length; col++) {
        board[row][col] = val
    }
}

function getRow(row, mat) {
    var coords = []
    for (var col = 0; col < mat[row].length; col++) {
        coords[col] = { i: row, j: col }
    }
    return coords
}

function getCol(col, mat) {
    var coords = []
    for (var row = 0; row < mat.length; row++) {
        coords[row] = { i: row, j: col }
    }
    return coords
}

function isSquare(mat) {
    for (var i = 0; i < mat.length; i++) {
        if (mat[i].length !== mat.length) return false
    }
    return true
}

function getMainDiag(mat) {
    if (!isSquare(mat)) return
    var coords = []
    for (var d = 0; d < mat.length; d++) {
        coords[d] = mat[d][d]
    }
    return coords
}

function getSecDiag(mat) {
    if (!isSquare(mat)) return
    var coords = []
    for (var d = 0; d < mat.length; d++) {
        coords[d] = mat[d][mat.length - 1 - d]
    }
    return coords
}

function getNegs(coord) {
    if (!isMatInit()) return
    var tiles = []

    for (var i = coord.i - 1; i < ROWS && i <= coord.i + 1; i++) {
        for (var j = coord.j - 1; j < COLS && j <= coord.j + 1; j++) {
            if (i < 0 || j < 0) continue
            if (i === coord.i && j === coord.j) continue
            tiles.push({ i, j })
        }
    }

    return tiles
}

function isMatInit() {
    if (!ROWS || !COLS) {
        console.log('Please initialize ROWS, COLS')
        return false
    }
    return true
}

function getCellsWith(values, board) {
    if (!isMatInit()) return
    var tiles = []

    for (var i = 0; i < ROWS; i++) {
        for (var j = 0; j < COLS; j++) {
            values.forEach(v => {
                if (board[i][j] === v) tiles.push({ i, j })
            })
        }
    }

    return tiles
}

function getConsN(coord, maxMoves, board, vals) {
    var coords = []
    for (var i = coord.i - 1, j = coord.j; i >= 0; i--) {
        if (vals.includes(board[i][j])) coords.push({ i, j })
        else break
    }
    return coords.slice(0, maxMoves)
}

function getConsS(coord, maxMoves, board, vals) {
    var coords = []
    for (var i = coord.i + 1, j = coord.j; i < ROWS; i++) {
        if (vals.includes(board[i][j])) coords.push({ i, j })
        else break
    }
    return coords.slice(0, maxMoves)
}

function getConsW(coord, maxMoves, board, vals) {
    var coords = []

    for (var i = coord.i, j = coord.j - 1; j >= 0; j--) {
        if (vals.includes(board[i][j])) coords.push({ i, j })
        else break
    }
    return coords.slice(0, maxMoves)
}

function getConsE(coord, maxMoves, board, vals) {
    var coords = []

    for (var i = coord.i, j = coord.j + 1; j < COLS; j++) {
        if (vals.includes(board[i][j])) coords.push({ i, j })
        else break
    }
    return coords.slice(0, maxMoves)
}

function getConsNE(coord, maxMoves, board, vals) {
    var coords = []

    for (var i = coord.i - 1, j = coord.j + 1; i >= 0 && j < COLS; i--, j++) {
        if (vals.includes(board[i][j])) coords.push({ i, j })
        else break
    }
    return coords.slice(0, maxMoves)
}

function getConsNW(coord, maxMoves, board, vals) {
    var coords = []
    for (var i = coord.i - 1, j = coord.j - 1; i >= 0 && j >= 0; i--, j--) {
        if (vals.includes(board[i][j])) coords.push({ i, j })
        else break
    }
    return coords.slice(0, maxMoves)
}

function getConsSE(coord, maxMoves, board, vals) {
    var coords = []
    for (var i = coord.i + 1, j = coord.j + 1; i < ROWS && j < COLS; i++, j++) {
        if (vals.includes(board[i][j])) coords.push({ i, j })
        else break
    }
    return coords.slice(0, maxMoves)
}

function getConsSW(coord, maxMoves, board, vals) {
    var coords = []
    for (var i = coord.i + 1, j = coord.j - 1; i < ROWS && j >= 0; i++, j--) {
        if (vals.includes(board[i][j])) coords.push({ i, j })
        else break
    }
    return coords.slice(0, maxMoves)
}

function getLowestRowAt(col, board, empty) {
    if (!isMatInit()) return
    if (empty === undefined) return // undefined to exclude empty string as well
    for (var row = ROWS - 1; row >= 0; row--) {
        if (board[row][col] === empty) return row
    }
}

function getBotCoords(board, empty) {
    var lowestRow = []
    for (var col = 0; col < COLS; col++) {
        var row = getLowestRowAt(col, board, empty)
        if (row) lowestRow.push({ i: row, j: col })
    }
    return lowestRow
}