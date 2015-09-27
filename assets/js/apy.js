;(function () {

  var Apy = function (options) {
      this.options = options;
      this.validateBase();
      this.validateCollection();
      this.createRoute();
  };

  Apy.prototype = {
    validateBase: function () {
      if ( !this.options.base ) {
        return this.base = '/';
      }

      if ( !this.options.base.match(/\/$/) ) {
        this.options.base += '/';
      }

      this.base = this.options.base;
    },

    validateCollection: function () {
      if ( !this.options.collection ) {
        throw new Error('You must pass collection.');
      }

      if ( typeof this.options.collection !== 'string' ) {
        throw new Error('Collection must be passed as string.');
      }

      this.collection = this.options.collection;
    },

    createRoute: function () {
      this.route = this.base + this.collection + '/';
    },

    mapParams: function (params) {
      if (typeof params !== 'object') {
        throw new Error('Params must be passed as object.')
      }

      var arr = [];

      for( var key in params ) {
        arr.push( encodeURIComponent(key) + "=" + encodeURIComponent(params[key]) );
      }

      return arr.length === 0 ? '' : '?' + arr.join('&');
    },

    send: function (url, method, params, cb) {
      var xhr = new XMLHttpRequest();

      xhr.open(method, url, true);
      xhr.onreadystatechange = function () {
        // If call is good
        if(xhr.readyState == 4) {
            var data = xhr.responseText;

            // Try to parse response
            try {
                data = JSON.parse(data);
            }catch (err) {
              // cb(new Error('Can\'t parse response from the api.'), null);
            }
 
            cb(null, {
                body: data
              , status: xhr.status
            });

        } else {

          // Return err to callback if can't get data from api
          // cb(new Error('Can\'t get data from the api!'), null);
        }
      }

      var body = params ? JSON.stringify(params) : {}
        , chunks = [];

      xhr.setRequestHeader("Content-type", "application/json")

      // if (params) {
      //     for (var name in params) {
      //         chunks.push(name + '=' + encodeURIComponent(params[name]));
      //     }

      //     body = chunks.join('&');
      //     if ( body.length ) {
      //         xhr.setRequestHeader("Content-type", "application/json");
      //     }
      // }

      xhr.send(body);
    },

    all: function (cb, params) {
      var query = this.mapParams(params || {});
      this.send(this.route + query, 'GET', {}, cb);
    },

    find: function (id, cb, params) {
      var query = this.mapParams(params || {});
      this.send(this.route + id + query, 'GET', {}, cb);
    },

    save: function (data, cb, params) {
      var query = this.mapParams(params || {});
      this.send(this.route + query, 'POST', data, cb);
    },

    update: function (id, data, cb, params) {
      var query = this.mapParams(params || {});
      this.send(this.route + id + query, 'PUT', data, cb);
    },

    delete: function (id, cb, params) {
      var query = this.mapParams(params || {});
      this.send(this.route + id + query, 'DELETE', {}, cb);
    },

    post: function (endpoint, data, cb, params) {
      var query = this.mapParams(params || {});
      this.send(this.route + endpoint + query, 'POST', data, cb);
    }
  };

  window.Apy = Apy;

})();