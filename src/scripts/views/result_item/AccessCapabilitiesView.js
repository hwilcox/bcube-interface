/* jshint ignore:start */
function hideAccessCapabilities() {
  $('.getdata-gi-axe').html('');
}
/* jshint ignore:end */

define(['lib/mediator_mixin'],

  function (mediatorMixin) {

    var AccessCapabilitiesView;

    AccessCapabilitiesView = Backbone.View.extend({

      accessCapabilitiesUrl: '',
      elementId: '',

      initialize: function () {
        this.bindEvents();
      },

      bindEvents: function () {
        this.mediatorBind('search:accessCapabilitiesLinkOpen', this.getAccessCapabilities, this);
      },

      render: function () {
        return this;
      },

      setElementId: function (newId) {
        this.elementId = newId;
      },

      getAccessCapabilities: function (access_capabilities_url, elementId) {
        var elemIdSelector = '#' + this.elementId;
        var element = $(elemIdSelector);
        var this_var = this;
        $.ajax({
            url: access_capabilities_url,
            dataType: 'jsonp'
          })
          .done(function (data) {
            if(this_var.elementId === elementId) {
              var validOptions = data.validOptions;
              var defaultOptions = data.defaultOptions;
              element.html('');

              this_var.processValidOptions(validOptions, defaultOptions, element);

              this_var.processDefaultOptions(validOptions, defaultOptions, element);

              this_var.addBCubeDownloadLink(element);

              $('.get-data').removeClass('open');
            }
          })
          .fail(function (message) {
            element.append('<p>Call to get capabilities failed!</p>');
            element.append('<p>' + message + '</p>');
          });
      },

      getWestString: function () {
        return (_.isUndefined($('#west-default-id').val()) ? '' : $('#west-default-id').val());
      },

      getNorthString: function () {
        return (_.isUndefined($('#north-default-id').val()) ? '' : '%252C' + $('#north-default-id').val());
      },

      getEastString: function () {
        return (_.isUndefined($('#east-default-id').val()) ? '' : '%252C' + $('#east-default-id').val());
      },

      getSouthString: function () {
        return (_.isUndefined($('#south-default-id').val()) ? '' : '%252C' + $('#south-default-id').val());
      },

      getCrsString: function () {
        return _.isUndefined($('#crs-valid-id').val()) ? '' : $('#crs-valid-id').val();
      },

      getRasterFormatString: function () {
        return _.isUndefined($('#rasterFormat-valid-id').val()) ? '' : $('#rasterFormat-valid-id').val();
      },

      addBCubeDownloadLink: function (element) {
        var outputCrsValue = this.getCrsString();
        var outputRasterFormatValue = this.getRasterFormatString();
        var outputSpatialSubset = this.getWestString() + this.getNorthString() + this.getEastString() + this.getSouthString();

        element.append('<p style="margin-left: 10px">' +
          '<a id=\'bcube-action\' onclick="hideAccessCapabilities()"' +
          'href=\'http://' + window.location.host + '/gi-axe/services/http-get?' +
          'request=execute' +
          '&service=WPS' +
          '&identifier=gi-axe-transform' +
          '&DataInputs=descriptor%3Dhttp%253A%252F%252Fbcube.geodab.eu%252Fbcube-broker' +
          '%252Fservices%252Fcswiso%253Frequest%253DGetRecordById%2526version%253D2.0.2' +
          '%2526service%253DCSW' +
          '%2526ElementSetName%253Dfull' +
          '%2526outputSchema%253Dhttp%253A%252F%252Fwww.isotc211.org%252F2005%252Fgmi' +
          '%2526id%253Dhttp%25253A%25252F%25252Fnsidc.org%25252Fapi%25252Fopensearch%25252F1.1%25252Fdataset%25252FGGD906' +
          '%3BoutputRasterFormat%3D' + outputRasterFormatValue +
          '%3BoutputCRS%3D' + outputCrsValue +
          '%3BoutputSubset%3D' + outputSpatialSubset +
          '&RawDataOutput=resource\'>Download Data</a>' +
          '<button style="margin-left: 10px" id=\'bcube-action\' onclick="hideAccessCapabilities()">Cancel</button></p>');
      },

      processValidOptions: function (validOptions, defaultOptions, element) {
        _.map(validOptions[0], function (value, key) {
          var selectClass = key + '-valid';
          var wrapClass = key + '-wrap';
          element.append('<label class="' + wrapClass + '" style="margin-right: 10px;">' + key + '</label>');
          if (_.has(defaultOptions, key)) {
            element.append('<option selected class="' + selectClass + '" value="' + value + '">' + value + '</option>');
          } else {
            element.append('<option class="' + selectClass + '" value="' + value + '">' + value + '</option>');
          }
          var selectId = key + '-valid-id';
          element.find('.' + selectClass).wrapAll('<select class="' + wrapClass + '" id="' + selectId + '"></select>');
          element.find('.' + wrapClass).wrapAll('<p style="margin-left: 10px;"></p>');
        });
      },

      processDefaultOptions: function (validOptions, defaultOptions, element) {
        _.map(defaultOptions, function (value, key) {
          if (!_.has(validOptions[0], key)) {
            var selectClass = key + '-default';
            element.append('<label class="' + selectClass + '">' + key + '</label></p>');
            _.map(value, function (option, label) {
              var selectClass = label + '-default';
              var selectId = label + '-default-id';
              element.append('<label class="' + selectClass + '" style="margin-right: 10px;">' + label + '</label>');
              element.append('<input id="' + selectId + '" type="text" class="' + selectClass + '" value="' + option + '" READONLY/></p>');
              element.find('.' + selectClass).wrapAll('<p style="margin-left: 10px;"></p>');
            });
          }
        });
      }
    });

    // Mix in the mediator behaviour
    _.extend(AccessCapabilitiesView.prototype, mediatorMixin);

    return AccessCapabilitiesView;
  });

