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
           var validOptions = data.validOptions;
           var defaultOptions = data.defaultOptions;

           _.map(validOptions[0], function(value, key) {
             var selectClass = key + '-select';
             element.append('<label>' + key + '</label>');
             if(_.has(defaultOptions, key)) {
               element.append('<option selected class="' + selectClass + '" value="' + value + '">' + value + '</option>');
             } else {
               element.append('<option class="' + selectClass + '" value="' + value + '">' + value + '</option>');
             }
             element.find('.' + selectClass).wrapAll('<select id="' + key + '-select-id"></select>');
           });

           _.map(defaultOptions, function(value, key){
             if(!_.has(validOptions[0], key)) {
               var selectClass = key + '-select';
               element.append('<label>' + key + '</label>');
               _.map(value, function(option, label){
                 element.append('<label>' + label + '</label>');
                 element.append('<input type="text" class="' + selectClass + '" name="' + label + '" value="' + option + '"></input>');
               });
             }
           });

           element.append("<a href='http://localhost:8081/gi-axe/services/http-get?request=execute&service=WPS&identifier=gi-axe-transform&DataInputs=descriptor%3Dhttp%253A%252F%252Fbcube.geodab.eu%252Fbcube-broker%252Fservices%252Fcswiso%253Frequest%253DGetRecordById%2526version%253D2.0.2%2526service%253DCSW%2526ElementSetName%253Dfull%2526outputSchema%253Dhttp%253A%252F%252Fwww.isotc211.org%252F2005%252Fgmi%2526id%253Dhttp%25253A%25252F%25252Fnsidc.org%25252Fapi%25252Fopensearch%25252F1.1%25252Fdataset%25252FGGD906%3BoutputRasterFormat%3Dzip%3BoutputCRS%3DEPSG%253A4326%3BoutputSubset%3D149.6%252C68.63%252C149.6%252C68.63&RawDataOutput=resource'>Download Me!</a>");
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
