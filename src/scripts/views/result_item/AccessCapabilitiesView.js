define(['lib/mediator_mixin'
  ],
  function (mediatorMixin) {

    var AccessCapabilitiesView;

    AccessCapabilitiesView = Backbone.View.extend({

      initialize: function () {
        this.message = '';
        this.bindEvents();
      },

      bindEvents: function () {
        this.mediatorBind('search:accessCapabilitiesLinkOpen', this.getAccessCapabilities, this);
      },

      events: {
        'click #bcube-action': 'hideAccessCapabilities'
      },

      render: function () {
        return this;
      },

      getAccessCapabilities: function (access_capabilities_url) {
        var element = $('.getdata-gi-axe');
        $.ajax({
            url: access_capabilities_url,
            dataType: 'jsonp',
            callback: 'displayAccessCapabilities'
          })
          .done(function (data) {
            var validOptions = data.validOptions;
            var defaultOptions = data.defaultOptions;
            element.html('');

            _.map(validOptions[0], function (value, key) {
              var selectClass = key + '-valid';
              var wrapClass = key + '-wrap';
              element.append('<label class="' + wrapClass + '">' + key + '</label>');
              if (_.has(defaultOptions, key)) {
                element.append('<option selected class="' + selectClass + '" value="' + value + '">' + value + '</option>');
              } else {
                element.append('<option class="' + selectClass + '" value="' + value + '">' + value + '</option>');
              }
              var selectId = key + '-valid-id';
              element.find('.' + selectClass).wrapAll('<select class="' + wrapClass + '" id="' + selectId + '"></select>');
              element.find('.' + wrapClass).wrapAll('<p></p>');
            });

            _.map(defaultOptions, function (value, key) {
              if (!_.has(validOptions[0], key)) {
                var selectClass = key + '-default';
                element.append('<label class="' + selectClass + '">' + key + '</label></p>');
                _.map(value, function (option, label) {
                  var selectClass = label + '-default';
                  var selectId = label + '-default-id';
                  element.append('<label class="' + selectClass + '">' + label + '</label>');
                  element.append('<input id="' + selectId + '" type="text" class="' + selectClass + '" name="' + label + '" value="' + option + '"></input></p>');
                  element.find('.' + selectClass).wrapAll('<p></p>');
                });
              }
            });

            var outputCrsValue = _.isUndefined($('#crs-valid-id').val()) ? '' : $('#crs-valid-id').val();
            var outputRasterFormatValue = _.isUndefined($('#rasterFormat-valid-id').val()) ? '' : $('#rasterFormat-valid-id').val();
            var outputSpatialSubset = (_.isUndefined($('#west-default-id').val()) ? '' : $('#west-default-id').val()) +
              (_.isUndefined($('#north-default-id').val()) ? '' : '%252C' + $('#north-default-id').val()) +
              (_.isUndefined($('#east-default-id').val()) ? '' : '%252C' + $('#east-default-id').val()) +
              (_.isUndefined($('#south-default-id').val()) ? '' : '%252C' + $('#south-default-id').val());

            element.append("<p><a id='bcube-action' " +
              "href='http://localhost:8081/gi-axe/services/http-get?" +
              "request=execute" +
              "&service=WPS" +
              "&identifier=gi-axe-transform" +
              "&DataInputs=descriptor%3Dhttp%253A%252F%252Fbcube.geodab.eu%252Fbcube-broker" +
              "%252Fservices%252Fcswiso%253Frequest%253DGetRecordById%2526version%253D2.0.2" +
              "%2526service%253DCSW" +
              "%2526ElementSetName%253Dfull" +
              "%2526outputSchema%253Dhttp%253A%252F%252Fwww.isotc211.org%252F2005%252Fgmi" +
              "%2526id%253Dhttp%25253A%25252F%25252Fnsidc.org%25252Fapi%25252Fopensearch%25252F1.1%25252Fdataset%25252FGGD906" +
              "%3BoutputRasterFormat%3D" + outputRasterFormatValue +
              "%3BoutputCRS%3D" + outputCrsValue +
              "%3BoutputSubset%3D" + outputSpatialSubset +
              "&RawDataOutput=resource'>Download Me!</a>" +
              "<button id='bcube-action'>Cancel</button></p>");
            $('.get-data').removeClass('open');
          })
          .fail(function (message) {
            element.append('<p>Call to get capabilities failed!</p>');
            element.removeClass('hidden');
          })
      },

      hideAccessCapabilities: function () {
        console.log("hiding element");
        this.$el.addClass('hidden');
        return this;
      },

      showAccessCapabilities: function () {
        this.$el.removeClass('hidden');
      }
    });

    // Mix in the mediator behaviour
    _.extend(AccessCapabilitiesView.prototype, mediatorMixin);

    return AccessCapabilitiesView;
  });

'http://localhost:8081/gi-axe/services/http-get?request=execute&' +
'service=WPS' +
'&identifier=gi-axe-transform' +
'&DataInputs=descriptor%3Dhttp%253A%252F%252Fbcube.geodab.eu%252Fbcube-broker%252Fservices%252Fcswiso%253Frequest%253D' +
'GetRecordById%2526version%253D2.0.2%2526' +
'service%253DCSW' +
'%2526ElementSetName%253Dfull' +
'%2526outputSchema%253Dhttp%253A%252F%252Fwww.isotc211.org%252F2005%252Fgmi' +
'%2526id%253Dhttp%25253A%25252F%25252Fnsidc.org%25252Fapi%25252Fopensearch%25252F1.1%25252Fdataset%25252FGGD906' +
'%3BoutputRasterFormat%3Dzip' +
'%3BoutputCRS%3DEPSG:4326' +
'%3BoutputSubset%3D68.63%252C149.6%252C68.63%252C149.6' +
'&RawDataOutput=resource'

'http://bcubeaxe.geodab.eu/bcube-broker-axe/services/http-get?' +
'request=execute&' +
'service=WPS' +
'&identifier=gi-axe-transform' +
'&DataInputs=descriptor%3Dhttp%253A%252F%252Fbcube.geodab.eu%252Fbcube-broker%252Fservices%252Fcswiso%253Frequest' +
'%253DGetRecordById%2526version%253D2.0.2' +
'%2526service%253DCSW' +
'%2526ElementSetName%253Dfull' +
'%2526outputSchema%253Dhttp%253A%252F%252Fwww.isotc211.org%252F2005%252Fgmi' +
'%2526id%253Dhttp%25253A%25252F%25252Fnsidc.org%25252Fapi%25252Fopensearch%25252F1.1%25252Fdataset%25252FGGD906' +
'%3BoutputRasterFormat%3Dzip' +
'%3BoutputCRS%3DEPSG%253A4326' +
'%3BoutputSubset%3D149.6%252C68.63%252C149.6%252C68.63' +
'&RawDataOutput=resource'