module.exports = watchGridChanges

function watchGridChanges(grid, handler){

  var lastData = grid() && grid().data || []

  var remove = grid(function(value, isRevert){
    var length = value.shape[0] * value.shape[1]
    var changes = []

    if (!isRevert){
      for (var i=0;i<length;i++){
        if (value.data[i] !== lastData[i]){
          var coords = value.coordsAt(i)
          changes.push([coords[0], coords[1], value.data[i]])
        }
      }  
    }

    lastData = value.data
    handler(changes, isRevert)
  })

  return remove
}