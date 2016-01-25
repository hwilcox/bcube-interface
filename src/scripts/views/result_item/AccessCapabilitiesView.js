define(['lib/mediator_mixin',
       'vendor/requirejs/text!templates/result_item/access_capabilities_view.html'
       ],
       function (mediatorMixin,
                 messageTemplate) {

  var AccessCapabilitiesView, templates;

  templates = {
    msgTemplate : _.template(messageTemplate)
  };

  AccessCapabilitiesView = Backbone.View.extend({

    initialize : function () {
      this.message = '';
      this.bindEvents();
    },

    bindEvents: function () {
      this.mediatorBind('search:accessCapabilitiesLinkOpen', this.getAccessCapabilities, this);
    },

    events: {
      'click .icon-remove-sign': 'hideAccessCapabilities'
    },

    render: function () {
      console.log("Rendering AccessCapabilitiesView");
      this.$el.append(templates.msgTemplate({messageTitle: this.message.title, messageContent: this.message.content}));
      return this;
    },

    getAccessCapabilities: function (access_capabilities_url) {
      var element = this.$el;
      $.ajax({
            url: access_capabilities_url,
            dataType: 'jsonp'
          })
       .done(function(data) {
           var content = JSON.stringify(data);
           console.log("done: " + content);
           element.html(templates.msgTemplate({messageTitle: 'Returned capabilities', messageContent: content}));
           element.find('#access-capabilities').removeClass('hidden');
          })
       .fail(function(message) {
           element.append(templates.msgTemplate({messageTitle: 'Call to get capabilities failed!', messageContent: message}));
           element.find('.alert').removeClass('hidden');
          })
    },

    hideAccessCapabilities: function () {
      this.$el.find('#access-capabilities').addClass('hidden');
    },

    showAccessCapabilities: function () {
      this.$el.find('#access-capabilities').removeClass('hidden');
    }
  });

  // Mix in the mediator behaviour
  _.extend(AccessCapabilitiesView.prototype, mediatorMixin);

  return AccessCapabilitiesView;
});
