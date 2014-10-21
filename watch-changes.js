var adiff = require('adiff')

module.exports = watchGridChanges

function watchGridChanges(grid, handler){

  var lastData = grid() && grid().data || []

  var remove = grid(function(value, isRevert){
    var changes = []
    if (!isRevert && value._diff){
      // try and use supplied _diff if available
      changes = value._diff
    } else {
      // manually perform a diff of the grid against last known values
      adiff.diff(lastData, value.data).forEach(function(diff){
        diff.slice(2).forEach(function(v, i){
          var coords = value.coordsAt(diff[0]+i)
          changes.push([coords[0], coords[1], v])
        })
      })
    }
    lastData = value.data
    handler(changes, isRevert)
  })

  return remove
}