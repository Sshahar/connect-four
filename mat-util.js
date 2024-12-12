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

function getNegCoords(coord) {
    if (!isMatInit()) return
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

function isMatInit() {
    if (!ROWS || !COLS) {
        console.log('Please initialize ROWS, COLS')
        return false
    }
    return true
}

function getCoordsWith(value, board) {
    if (!isMatInit()) return
    var tiles = []

    for (var i = 0; i < ROWS; i++) {
        for (var j = 0; j < COLS; j++) {
            if (board[i][j] == value) tiles.push({ i, j })
        }
    }

    return tiles
}

function getLowestRowAt(col, board) {
    if (!isMatInit()) return
    if (EMPTY === undefined) return
    for (var row = ROWS - 1; row >= 0; row--) {
        if (board[row][col] === EMPTY) return row
    }
    return -1
}

function countConsecutiveRight(coord, board) {
    if (!isMatInit()) return
    var count = 0

    var i = coord.i
    for (var j = coord.j; j < COLS; j++) {
        if (board[i][j] == board[coord.i][coord.j]) count++
        else break
    }

    return count
}

function countConsecutiveDown(coord, board) {
    if (!isMatInit()) return
    var count = 0

    for (var i = coord.i, j = coord.j; i < ROWS; i++) {
        if (board[i][j] == board[coord.i][coord.j]) count++
        else break
    }

    return count
}

function countConsecutiveRightDown(coord, board) {
    if (!isMatInit()) return
    var count = 0

    for (var i = coord.i, j = coord.j; i < ROWS && j < COLS; i++, j++) {
        if (board[i][j] == board[coord.i][coord.j]) count++
        else break
    }

    return count
}

function countConsecutiveLeftUp(coord, board) {
    if (!isMatInit()) return
    var count = 0

    for (var i = coord.i, j = coord.j; i >= 0 && j < COLS; i--, j++) {
        if (board[i][j] == board[coord.i][coord.j]) count++
        else break
    }

    return count
}

function getConsAbove(coord, maxMoves, board, val = '') {
    var res = []
    for (var i = coord.i - 1, j = coord.j; i >= 0; i--) {
        if (board[i][j] === val) res.push({ i, j })
        else break
    }
    return res.slice(0, maxMoves)
}

function getConsBelow(coord, maxMoves, board, val = '') {
    var res = []
    for (var i = coord.i + 1, j = coord.j; i < ROWS; i++) {
        if (board[i][j] === val) res.push({ i, j })
        else break
    }
    return res.slice(0, maxMoves)
}

function getConsLeft(coord, maxMoves, board, val = '') {
    var res = []

    for (var i = coord.i, j = coord.j - 1; j >= 0; j--) {
        if (board[i][j] === val) res.push({ i, j })
        else break
    }
    return res.slice(0, maxMoves)
}

function getConsRight(coord, maxMoves, board, val = '') {
    var res = []

    for (var i = coord.i, j = coord.j + 1; j < COLS; j++) {
        if (board[i][j] === val) res.push({ i, j })
        else break
    }
    return res.slice(0, maxMoves)
}

function getEmptyUpRight(pieceCoord, maxMoves) {
    var coords = []
    for (var i = pieceCoord.i - 1, j = pieceCoord.j + 1; i >= 0 && j < COLS; i--, j++) {
        var coord = { i, j }
        if (!isEmptyCell(coord)) break
        coords.push(coord)
    }
    return coords.slice(0, maxMoves)
}

function getEmptyUpLeft(pieceCoord, maxMoves) {
    var coords = []
    for (var i = pieceCoord.i - 1, j = pieceCoord.j - 1; i >= 0 && j >= 0; i--, j--) {
        var coord = { i, j }
        if (!isEmptyCell(coord)) break
        coords.push(coord)
    }
    return coords.slice(0, maxMoves)
}

function getEmptyBotRight(pieceCoord, maxMoves) {
    var coords = []
    for (var i = pieceCoord.i + 1, j = pieceCoord.j + 1; i < ROWS && j < COLS; i++, j++) {
        var coord = { i, j }
        if (!isEmptyCell(coord)) break
        coords.push(coord)
    }
    return coords.slice(0, maxMoves)
}

function getEmptyBotLeft(pieceCoord, maxMoves) {
    var coords = []
    for (var i = pieceCoord.i + 1, j = pieceCoord.j - 1; i < ROWS && j >= 0; i++, j--) {
        var coord = { i, j }
        if (!isEmptyCell(coord)) break
        coords.push(coord)
    }
    return coords.slice(0, maxMoves)
}