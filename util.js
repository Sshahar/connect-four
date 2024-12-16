'use strict'

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

async function sleep(ms = 1000) {
    await new Promise(r => setTimeout(r, ms))
}

function distance(coord1, coord2) {
    // taxicab distance
    return Math.abs(coord1.i - coord2.i) + Math.abs(coord1.j - coord2.j)
}

function inRange(num, low, high) {
    return num >= low && num < high
}