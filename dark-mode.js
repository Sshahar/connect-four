// String HTML
var grey = `#3d4245`

var selectorsToChange = ['body', 'h1.index-page']

selectorsToChange.forEach(s => {
    document.querySelector(s).classList.add('dark-mode')

})