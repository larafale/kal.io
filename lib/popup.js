module.exports = function(title, message){
  return {
    popup: {
        title: title || 'Info'
      , message: message || ''
    }
  }
}