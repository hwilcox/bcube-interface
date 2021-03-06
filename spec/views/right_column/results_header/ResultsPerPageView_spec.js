var createFakeModel = function () { return sinon.createStubInstance(Backbone.Model); };

requireMock.requireWithStubs(
  {
    'models/SearchParamsModel': sinon.stub().returns(createFakeModel())
  },
  [
    'views/right_column/results_header/ResultsPerPageView',
    'models/SearchParamsModel',
    'collections/SearchResultsCollection'
  ],
  function (ResultsPerPageView, SearchParamsModel, SearchResultsCollection) {

    describe('the results per page dropdown', function () {
      var features,
          view;

      features = { resultsPerPage: [10, 25, 37] };

      beforeEach(function () {
        var resultsCollection = new SearchResultsCollection(),
            searchParamsModel = new SearchParamsModel();

        searchParamsModel.setItemsPerPage = sinon.stub();
        sinon.stub(resultsCollection, 'getItemsPerPage').returns(37);
        view = new ResultsPerPageView({
          features: features,
          model: searchParamsModel,
          collection: resultsCollection
        });
        view.render();
      });

      it('gets the currently selected choice based on the search results collection', function () {
        expect(view.getSelectedOption()).toBe(37);
      });

      it('renders "per page" text in the label', function () {
        expect(view.$el.find('label').text()).toBe('Per page:');
      });

      it('returns the id that the dropdown button element should have', function () {
        expect(view.getButtonId()).toBe('results-per-page');
      });

    });

  });
