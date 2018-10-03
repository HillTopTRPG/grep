const fs = require("fs")
const path = require("path")
const readline = require("readline")

const grep = (dir, pathRegExp, textRegExp, exclusionPathRegExp, exclusionTextRegExp) => {
  const fileList = (dir) => {
    let results = []
    const promises = []  // Promiseの配列を入れる変数を用意
    return new Promise((res, rej) => {
      fs.readdir(dir, (err, files) => {
        if (err) {
          return rej(err)
        }
        files.forEach(file => {
          const fp = path.join(dir, file)
          if (fs.statSync(fp).isDirectory()) {
            // とりあえず配列に追加するだけ
            promises.push(fileList(fp))
          } else {
            results.push({
              fileName: file,
              directory: dir,
              path: fp
            })
          }
        })
        // 処理対象がすべて集まったらPromise.all
        Promise.all(promises)
          .then(ary => {
            ary.forEach(files => {
              results = results.concat(files)
            })
            res(results)
          })
      })
    })
  }
  const openLine = (paths) => {
    if (exclusionPathRegExp) {
      paths = paths.filter(pathObj => {
        return !exclusionPathRegExp.test(pathObj.path)
      })
    }
    paths = paths.filter(pathObj => {
      return pathRegExp.test(pathObj.path)
    })
    const targets = []
    const ps = paths.map((pathObj) => {
      return new Promise((res, rej) => {
        const stream = fs.createReadStream(pathObj.path, "utf8")
        const reader = readline.createInterface({ input: stream })
        let lineNum = 0
        reader.on("line", (data) => {
          lineNum++
          if (exclusionTextRegExp && exclusionTextRegExp.test(data)) {
            return
          }
          const match = data.match(textRegExp )
          if (match) {
            // console.log(`match:${match[0]}, capture:${match[1]}`)
            const obj = {
              path: pathObj.path,
              fileName: pathObj.fileName,
              directory: pathObj.directory,
              line: data,
              match: match.shift(),
              capture: match[0],
              lineNum: lineNum
            }
            targets.push(obj)
          }
        })
        reader.on("close", () => {
          res()
        })
      })
    })
    return Promise.all(ps)
      .then(() => {
        return targets
      })
  }

  return new Promise((res, rej) => {
    Promise.resolve()
      .then(() => {
        return fileList(dir)
      })
      .then(files => {
        return openLine(files)
      })
      .then(ary => {
        res(ary)
      })
  })
}
module.exports = grep;
