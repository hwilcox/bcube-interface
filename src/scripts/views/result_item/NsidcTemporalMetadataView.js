define(
  ['vendor/requirejs/text!templates/result_item/acadis_temporal_metadata.html',
   'vendor/requirejs/text!templates/result_item/nsidc_temporal_metadata.html'],
  function (acadisTemporalTemplate,
            nsidcTemporalTemplate) {
    var TemporalMetadataView;

    // expose a constructor
    TemporalMetadataView = Backbone.View.extend({

      initialize: function (options) {
        this.forceRender = options.forceRender;

        if (options.spaced === true) {
          this.template = _.template(acadisTemporalTemplate);
        } else {
          this.template = _.template(nsidcTemporalTemplate);
        }
      },

      render: function () {
        var ranges = this.model.get('dateRanges');

        ranges = _.filter(ranges, function (range) {
          return range.startDate && moment(range.startDate).isValid();
        }, this);

        if (ranges.length > 0 || this.forceRender) {
          this.$el.html(this.template({dateRanges: ranges}));
        }

        return this;
      }
    });

    return TemporalMetadataView;
  }
);
