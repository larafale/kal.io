var $vue
  , $els
  , $date
  , DEFAULT = {
      selection: {
        $start: false,
        $end: false,
        $duration: false,
        inProcess: false,
        sourceIndex: false,
        startIndex: false
      },
      reza: {
        start: false,
        duration: false,
        resource: false,
        sharedWith: false,
        day: false,
        user: false,
        note: ''
      }
    }



$date = location.hash ? moment(location.hash.substring(1), 'DDMMYY') : moment()
$els = { 
  kal: $('#kal'), 
  ruler: $('#kal .ruler'), 
  header: $('#kal .header'), 
  legend: $('.legend .content'), 
  container: $('#container'), 
  sources: $('#kal .sources')
}

// {
//   from: 9,
//   to: 21,
//   step: 1,
//   grid: (1/4),
//   highlight: false,
//   unzones: [ { start: 17, duration: 1 } ],
//   undays: ['0']
// }

$vue = new Vue({
  el: 'body',
  data: {
    options: {},
    config: {
      $date: $date,
      legend: [],
      week: [],
      width: 0,
      padding: 5,
      grids: {},
      display: false, // reza box
      edit: false, // reza box edition mode
      headerHeight: 0
    },
    selection: {},
    reza: {},
    sources: [],
    resources: {},
    users: {},
    user: {},
    freeSources: [],
    sourcesById: {}
  },
  methods: {
    select: function(e, source){
      var minutes, time
        , self = this
        , $el = $(e.target)
        , grid = source.grid || this.options.grid

      this.selection.inProcess = !this.selection.inProcess

      minutes = parseInt($el.attr('index'), 10) * grid
      minutes += this.options.from
      minutes *= 60

      time = new moment([this.config.$date.format('YYYY'), this.config.$date.format('MM'), this.config.$date.format('DD'), 0, minutes, 0, 0])

      if(this.selection.inProcess){
        $('.grid').removeClass('selected')
        this.selection.startIndex = $el.attr('index')
        this.selection.sourceIndex = $el.parents('.source').attr('index')
        $el.addClass('selected start')
        
        this.selection.$end = false
        this.selection.$duration = false
        this.selection.$start = time
        
        this.reza = _.clone(DEFAULT.reza)
        this.reza.start = ((time.hours() * 60) + time.minutes()) / 60
        this.reza.resource = this.sources[this.selection.sourceIndex].record
      }else{
        time.add('minute', grid * 60)
        
        this.selection.$end = time
        this.selection.$duration = moment.utc(this.selection.$end.diff(this.selection.$start))
        
        this.reza.end = ((time.hours() * 60) + time.minutes()) / 60
        this.reza.duration = this.reza.end - this.reza.start
        this.reza.day = this.config.$date.format('DDMMYY')
        this.config.display = true

        this.setFreeSources()
        this.reza.user = $vue.user.record
        $('#reza .who').val($vue.user.record)
        
      }
    },
    reset: function(){
      this.selection = _.clone(DEFAULT['selection'])
      this.reza = _.clone(DEFAULT['reza'])
      this.freeSources = []
      $('.grid').removeClass('selected')
    },
    ratio: function(){ return this.config.width / this.options.step },
    blockColor: function(source, block){ return block.color || source.color || '' },
    inHours: function(duration, format){ return moment.utc().hour(0).minute(0).add('minute', duration * 60).format(format || 'H:mm') },
    isUnday: function(day){ return _.find(this.options.undays, function(d){ return parseInt(d, 10) == parseInt(day, 10) }) },
    isCurrentDay: function(day){ return parseInt(day, 10) == parseInt(this.config.$date.format('d'), 10) },
    resize: function(e){ 
      // $vue.options.step = window.innerWidth <= 400 ? 2 : 1 
      $vue.config.headerHeight = $els.header.height()
      $vue.config.width = Math.floor($els.kal.width() / $vue.config.legend.length)
      $vue.config.fullWidth = $vue.config.width * $vue.config.legend.length
    },
    draw: function(block, real){
      var marginLeft = ((block.start - this.options.from) * this.ratio()) - 1
        , width = (block.duration * this.ratio()) - 0

      return block.start >= this.options.to || block.start < this.options.from
        ? 'display: none;'
        : 'margin-left: '+marginLeft+'px; width: '+(width)+'px;' 

    },
    init: function(e){ 
      $vue.loadUsers()
      $vue.loadResources()
      $vue.initLegend()
      $vue.initWeek()
      
      $vue.resize()
      $vue.loadData()
    },
    makeReservation: function(){
      Api.block.save(this.$data.reza, function(err, res){
        $err(err, res)
        $vue.loadData()
        $vue.reset()
        $vue.config.display = false
      })
    },
    editReservation: function(){
      Api.block.update(this.$data.reza.record, this.$data.reza, function(err, res){
        $err(err, res)
        $vue.loadData()
        $vue.reset()
        $vue.config.display = false
      })
    },
    setFreeSources: function(){
      var freeSources = $vue.reza.sharedWith ? [$vue.reza.sharedWith] : []
        , shareableSources = _.filter($vue.sources, { shareable: true })

      shareableSources = _.map(shareableSources, function(s){
        return _.some(s.data, function(b){
          return (b.start < $vue.reza.end) && ($vue.reza.start < (b.start + b.duration))
        }) ? null : s.record
      })

      this.freeSources = _.compact(_.union(shareableSources, freeSources))

      // display select
      setTimeout(function(){
        if($vue.reza.sharedWith) $('#reza .with').val($vue.reza.sharedWith) // select current
      }, 500)
    },
    showReservation: function(block){
      // this.freeSources = block.sharedWith ? [block.sharedWith] : []
      this.reza = block
      $vue.setFreeSources()
      this.config.display = true 
      this.config.edit = true 
    },
    hideReservation: function(e){
      if(e.target.id === 'reza' || e.target.nodeName == 'I'){
        this.config.display = false
        this.config.edit = false 
      }
    },
    deleteReservation: function(block){
      Api.block.delete(this.reza.record, function(err, res){
        $err(err, res)
        $vue.loadData()
        $vue.reset()
        $vue.config.edit = false 
        $vue.config.display = false
      })
    },
    loadData: function(date){
      $els.sources.css('opacity', 0.1)
      date = date || this.config.$date
      Api.block.find(date.format('DDMMYY'), function(err, res, status){
        $err(err, res)
        $vue.initData(res.body.items)
        $vue.sources = res.body.items
        $vue.sourcesById = _.indexBy(res.body.items, 'record')
        setTimeout(function(){ 
          $els.sources.css('opacity', 1)
          $('.v-enter').removeClass('v-enter') 
        }, 500)

        setTimeout(function(){
          $('.block').tooltip()
        }, 1000)
      })
    },
    loadUsers: function(){
      Api.user.all(function(err, res){
        $vue.$data.users = _.indexBy(res.body.items, 'record')
      })
    },
    loadResources: function(){
      Api.resource.all(function(err, res){
        if(!res.body.items.length) $vue.adminPanel = true
        $vue.$data.resources = _.indexBy(res.body.items, 'record')
      })
    },
    calendar: function(format, source){
      return typeof source == 'number'
        ? this.inHours(source, format)
        : source === 'now'
          ? this.config.$date.format(format)
          : ''
    },
    setDay: function(day){
      this.config.$date = new moment(day)
      this.loadData(this.config.$date)
      this.initWeek()
      this.reset('selection')
    },
    nextDay: function(){
      this.config.$date.add('d', 1)
      this.loadData(this.config.$date)
      this.initWeek()
      this.reset('selection')
    },
    prevDay: function(){
      this.config.$date.add('d', -1)
      this.loadData(this.config.$date)
      this.initWeek()
      this.reset('selection')
    },
    setWeek: function(week){
      if(week) 
        this.config.$date.add('w', week)

      week = week || 1

      week>0 ? this.config.$date.startOf('week') : this.config.$date.endOf('week')

      // select first enabled day
      while(this.isUnday(this.config.$date.format('d'))){
        this.config.$date.add('day', week)
      }

      this.initWeek()
      this.loadData()
      this.reset('selection')
    },
    initLegend: function(){
      for(var i = $vue.options.from; i < $vue.options.to; i = i + $vue.options.step)
        $vue.config.legend.push(i < 10 ? '0'+i : ''+i)
    },
    initWeek: function(){
      var start = new moment(this.config.$date).startOf('week').add('d', -1)

      this.config.week = _.times(7, function(i){
        start.add('day', 1)
        return [start.format('ddd'), start.format('DD'), start.format('MMM'), start.format('d'), start.format()]
      })
    },
    json: function(o){ return JSON.stringify(o, null, 4) },
    initData: function(resources){
      // check resources links
      var links = {}

      _.each(resources, function(R){

        if((R.grid || $vue.options.grid) && R.selectable !== false){

          var ratio = R.grid || $vue.options.grid
            , start = $vue.options.from
            , matrice = []

          for(var i = $vue.options.from; i < $vue.options.to; i += ratio){
            matrice.push({ start: start, duration: ratio })
            start = start + ratio
          }

          $vue.config.grids[R.record] = matrice
        }

        _.each(resources, function(r){
          if(r.record != R.record && r.data && r.data.length){
            links[R.record] = links[R.record] || []

            var blocks = _.filter(r.data, { sharedWith: R.record })

            _.each(blocks, function(b){
              b.linkedWith = r.title
            })

            links[R.record].push(blocks)
          }
        })
      })

      // merge resources links
      _.each(_.keys(links), function(id){
        var r = _.find(resources, function(r){ return r.record == id })
        r.data = _.flatten(links[id]).concat(r.data || [])
      })
    }
  }
})



window.onresize = $vue.resize

$els.kal.on('mouseenter', '.grid', function(e){
  if(!$vue.selection.inProcess)
    return

  var gridIndex = parseInt($(e.target).attr('index'), 10)
    , sourceIndex = parseInt($(e.target).parents('.source').attr('index'), 10)

  if(gridIndex < $vue.selection.startIndex || sourceIndex != $vue.selection.sourceIndex)
    return $vue.reset('selection')

  $('.grid.selected').removeClass('selected')

  for(var i = $vue.selection.startIndex; i <= gridIndex; i++){
    $('[id="grid-'+$vue.selection.sourceIndex+'-'+i+'"]').addClass('selected')
  }

})




$els.kal.on('mousemove', function(e){

  var className = e.target.className 
    , target = $(e.target)
    , isGrid = /^grid/.test(className) 
    , isBlock = /^block/.test(className) 
    , isPreview = /^preview hidden-xs/.test(className) 
    , grid = $(e.target)
    , prev = grid.prev()


  // stop selection if not hover a grid
  if(!isGrid && $vue.selection.inProcess){
    $vue.reset('selection')
  }

  if(isGrid)
    $('.timeline').removeClass('hover') && target.parent().addClass('hover')

  var offset = $els.kal.find('.timeline:eq(0)').offset()
    , x = e.pageX - (offset && offset.left)
    , nearIndex = Math.round((x * $vue.config.legend.length)/($vue.config.legend.length * $vue.config.width))

  if(!isGrid && !isBlock){
    $('.timeline').removeClass('hover')
    $els.ruler.css({ 'opacity': 0 })
    return 
  }

  $els.ruler.css({ 
    'margin-left': (parseInt(target.css('margin-left').replace('px',''), 10) - 1)+'px',
    'opacity': 0.2,
    'width': (target[0].getBoundingClientRect().width - 1) + 'px' 
  })

})

