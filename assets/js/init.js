// Toaster

toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": true,
  "progressBar": true,
  "positionClass": "toast-top-right",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "100",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}

var $popup = function(err, res){
  // info, error, success
  if(err) toastr.error(err.message || '', 'Erreur')
  else if(res.status == 404) toastr.error(res.body || '404 not found', 'Erreur')
  else if(res.status == 500) toastr.error(res.body || 'Server is down, retry in 5minutes !', 'Erreur')
  else if(res.body.type == '_error') toastr['error'](res.body.err.message || '', res.body.err.title || 'Erreur')
  else if(res.body.popup) toastr['success'](res.body.popup.message || '', res.body.popup.title || 'Info')
}

// Errors 
var $err = function(err, res){

  // refresh on 401 Unauthorized
  if(res.status == 401) return window.location.reload()

  // auto popup
  $popup(err, res)

  return err || (res && res.body && res.body.type == '_error')
}

////
//
// Make Bootstrap column sticky
// ex: 
//      .row
//        .col-md-6
//        .col-md-6.sticky

var sticky = function(){
  $('.sticky').each(function(i, el){
    var s = $(el)

    // reset
    s.css({ position: '', width: '', left: '' })

    // clear prev timeout
    clearTimeout(sticky.prototype.timeouts[i])

    // apply sticky only if screen size <= 990px
    if(window.innerWidth <= 990) return

    sticky.prototype.timeouts[i] = setTimeout(function(){
      s.css({ 
          position: 'fixed'
        , width: s.outerWidth()+'px'
        , left: s.offset().left+'px' 
      })
    }, 100)
  })
} 

sticky.prototype.timeouts = {}

// init sticky on 'load' and on 'screen resize'
window.onresize = sticky
window.onload = sticky



////
//
// Standalone functions

function serialize(obj, prefix) {
  var str = [];
  for (var p in obj) {
    if (obj.hasOwnProperty(p)) {
      var k = prefix ? prefix + "[" + p + "]" : p
        , v = obj[p];
      str.push(typeof v == "object" ? serialize(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
  }
  return str.join("&");
}

function querize(url) {
  url = url || (window && window.location && window.location.search) || ""
  if(url.substring(0,1) == "?") url = url.substr(1)
  var query = {}, tmp = url.length ? url.split('&') : []
  for(var i = 0; i < tmp.length; i++){
    query[tmp[i].split('=')[0]] = tmp[i].split('=')[1]
  }
  return query
}


////
//
// FastClick for mobile device

$(document).on('ready', function(){

  FastClick.attach(document.body)

})
