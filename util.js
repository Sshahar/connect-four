function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min))
}

function getRandomColor() {
    const letters = '0123456789ABCDEF'
    var color = '#'

    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}

function sum(arr) {
    var arrSum = 0
    for (var i=0; i<arr.length; i++) {
        arrSum += arr[i]
    }
    return arrSum
}
