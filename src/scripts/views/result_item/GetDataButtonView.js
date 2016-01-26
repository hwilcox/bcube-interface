define(['vendor/requirejs/text!templates/result_item/get_data_button_multiple_urls.html',
       'vendor/requirejs/text!templates/result_item/get_data_button_single_url.html',
       'vendor/requirejs/text!templates/result_item/get_data_button_no_url.html',
       'lib/mediator_mixin',
       'lib/objectFactory'],
       function (multipleLinksTemplate, singleLinkTemplate, noLinkTemplate, mediatorMixin, objectFactory) {
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
      'click .getdata-value': 'openLink'
    },

    toggle: function (event) {
      event.stopImmediatePropagation();
      this.$('.getdata-description').toggleClass('hidden');
    },

    openLink: function (event) {
      event.stopImmediatePropagation();
      var data_link = $(event.currentTarget).attr('get-data-link');
      if (data_link.indexOf('gi-axe-capabilities') > -1) {
        var accessCapabilitiesId = 'getdata-gi-axe-' + this.cid;
        this.AccessCapabilitiesView.getAccessCapabilities(data_link, accessCapabilitiesId);
      } else {
        window.open(data_link);
      }
    },

    render : function () {
      var button_title, links, dataLinks, orderLinks, externalLinks;

      var accessCapabilitiesId = 'getdata-gi-axe-' + this.cid;
      var acElement = this.$el.parent().find('.getdata-gi-axe');
      acElement.attr('id', accessCapabilitiesId);
      this.AccessCapabilitiesView = objectFactory.createInstance('AccessCapabilitiesView', {
        el: acElement
      }).render();
      this.AccessCapabilitiesView.setElementId(accessCapabilitiesId);

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

  // Mix in the mediator behaviour
  _.extend(GetDataButtonView.prototype, mediatorMixin);

  // Reveal the constructor
  return GetDataButtonView;

});
