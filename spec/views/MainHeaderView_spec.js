/* global requireMock */

var fakeView = sinon.createStubInstance(Backbone.View);

requireMock.requireWithStubs(
  {
    'views/search_criteria/SearchCriteriaView': sinon.stub().returns(fakeView)
  },
  [
    'views/MainHeaderView',
    'views/search_criteria/SearchCriteriaView',
    'lib/objectFactory'
  ],
  function (MainHeaderView, SearchCriteriaView, objectFactory) {

    describe('Main Header View', function () {

      describe('rendering the view', function () {
        var mainHeader;

        beforeEach(function () {
          objectFactory.register('SearchCriteriaView', {
            Ctor: SearchCriteriaView, configOptions: { preset: { searchButtonText: 'Find Data Now' } }
          });

          SearchCriteriaView.reset();
        });

        describe('rendering the ACADIS view', function () {
          beforeEach(function () {
            mainHeader = new MainHeaderView({templateId: 'ACADIS'}).render();
          });

          it('should create a correctly structured element as provided', function () {
            expect(mainHeader.$el.is('div')).toBeTruthy();
            expect(mainHeader.$el.find('#head-text').length).toBe(1);
          });

          it('should create a Search Criteria subview', function () {
            expect(SearchCriteriaView.callCount).toBe(1);
          });
        });

        describe('rendering the NSIDC view', function () {
          beforeEach(function () {
            mainHeader = new MainHeaderView({templateId: 'NSIDC'}).render();
          });

          it('should create a correctly structured element as provided', function () {
            expect(mainHeader.$el.is('div')).toBeTruthy();
            expect(mainHeader.$el.find('#globe-logo').length).toBe(1);
          });

          it('should create a Search Criteria subview', function () {
            expect(SearchCriteriaView.callCount).toBe(1);
          });
        });

        it('throws if the template ID is not supported', function () {
          mainHeader = new MainHeaderView({templateId: 'no_such_template'});
          expect(function () { mainHeader.render(); }).toThrow();
        });
      });
    });
  });
