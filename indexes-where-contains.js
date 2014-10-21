var computed = require('observ/computed')

module.exports = computedIndexesWhereContains

function computedIndexesWhereContains(observable, match){
  return computed([observable], function(grid){
    var result = []
    grid.data.forEach(appendIndexIfMatch, {target: result, match: match})
    return result
  })
}

function appendIndexIfMatch(value, index){
  var target = this.target
  var match = this.match
  if (~value.indexOf(match)){
    target.push(index)
  }
}