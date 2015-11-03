define(['vendor/requirejs/text!templates/result_item/get_data_button_multiple_urls.html',
       'vendor/requirejs/text!templates/result_item/get_data_button_single_url.html',
       'vendor/requirejs/text!templates/result_item/get_data_button_no_url.html'],
       function (multipleLinksTemplate, singleLinkTemplate, noLinkTemplate) {
  var templates, GetDataButtonView;

  templates = {
      multipleLinks: _.template(multipleLinksTemplate),
      singleLink: _.template(singleLinkTemplate),
      noLink: _.template(noLinkTemplate)
    };

// This is the constructor function that will be revealed
  GetDataButtonView = Backbone.View.extend({
    events: {
      'click .getdata-toggle, .getdata-icon': 'toggle',
      'click .getdata-value': 'openLink',
      'click button.gi-tract-data' : 'onGITractDataPressed'
    },

    toggle: function (event) {
      event.stopImmediatePropagation();
      this.$('.getdata-description').toggleClass('hidden');
    },

    openLink: function (event) {
      event.stopImmediatePropagation();
      window.open($(event.currentTarget).attr('get-data-link'));
    },

    onGIDiscoverResponse: function (result) {
      var element = $('#results');
      var paginator = result[0];

      var resultSet = paginator.resultSet();

      element.append('<h3>- Result Set -</h3>');
      element.append(JSON.stringify(resultSet, null, 4));

      var page = paginator.page();

      element.append('<h3>- Nodes of first results set page -</h3>');
      element.append('<pre>');

      while(page.hasNext()){
        // retrieving the next page node
        var node = page.next();

        // retrieving the node report
        var report = node.report();

        element.append(JSON.stringify(report,null,4));
      }
        element.append('</pre>');
    },

    onGITractDataPressed: function () {
      GIAPI.logger.enabled = true;
      var dab = GIAPI.DAB('http://bcube.geodab.eu/bcube-broker/');

      var constraints = {
        'where': {
          'west': -149.6,
          'south': 68.63,
          'east': -149.6,
          'north': 68.63
        }
      };
      dab.discover(this.onGIDiscoverResponse, constraints);
    },

    render : function () {
      var button_title, links, dataLinks, orderLinks, externalLinks;

      button_title = 'Get Data';

      dataLinks = this.model.get('dataUrls') || [];
      orderLinks = this.model.get('orderDataUrl') || [];
      externalLinks = this.model.get('externalDataUrl') || [];

      links = [].concat(dataLinks).concat(externalLinks);
      if (links.length === 0) {
        links = [].concat(orderLinks);
      }

      if (links && links.length >= 1) {
        this.$el.html(templates.multipleLinks({get_data_title: button_title, links: links}));
      }
      else {
        this.$el.html(templates.noLink());
      }
      // Backbone convention to return this from render()
      return this;
    }
  });

  // Reveal the constructor
  return GetDataButtonView;

});
