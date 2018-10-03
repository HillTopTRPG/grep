const grep = require("./grep.js")
const fs = require("fs")

const dir = `C:\\Users\\`
const pathRegExp  = /(\.txt$)|(\.json$)|(\.html$)/
const textRegExp  = /<([^>]+)>/
const textRegExp2  = /a([^a]+)a/

Promise.resolve()
  .then(() => {
    return grep(dir, pathRegExp, textRegExp)
      .then(results => {
        const output = []
        results.forEach(result => {
          const text = `####     <${result.match}: ${result.capture}> ${result.fileName}(${result.lineNum})`
          // console.log(text)
          output.push(text)
        })
        fs.writeFile('./output/a.txt', output.join('\r\n'), function (err) {
          if (err) {
            throw err;
          }
        });
      })
  })
  .then(() => {
    return grep(dir, pathRegExp, textRegExp2)
      .then(results => {
        const output = []
        results.forEach(result => {
          const text = `-------     <${result.match}: ${result.capture}> ${result.fileName}(${result.lineNum})`
          // console.log(text)
          output.push(text)
        })
        fs.writeFile('./output/b.txt', output.join('\r\n'), function (err) {
          if (err) {
            throw err;
          }
        });
      })
  })
