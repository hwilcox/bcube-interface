define(['lib/utility_functions', 'lib/JSONResults'],
  function (UtilityFunctions, JSONResults) {
    function getBoundingBoxFrom(xml) {
      var bboxes, boxObj, boxArr;

      bboxes = $(xml).filterNode('georss:box'); //$(xml).find('georss\\:box, box');
      boxArr = [];

      _.each(bboxes, function (box) {
        var coords = $(box).text().split(' ');
        boxObj = {
          north: coords[2],
          east: coords[3],
          south: coords[0],
          west: coords[1]
        };

        boxArr.push(boxObj);
      });

      return boxArr;
    }

    function getDateRangeFrom(xml) {
      var dates, rangeObj, rangeArr, dateRegex = new RegExp('(.*)\/(.*)');

      dates = $(xml).filterNode('dc:date');
      rangeArr = [];

      _.each(dates, function (date) {
        var dateParts = $(date).text().match(dateRegex);
        rangeObj = {
          startDate: dateParts[1],
          endDate: dateParts[2]
        };

        rangeArr.push(rangeObj);

      });

      return rangeArr;
    }

    function getDataUrlsFrom(xml) {
      var links, linkArr = [];
      links = $(xml).find('link[rel=download-data]');

      _.each(links, function (link) {
        var linkObj = getLinkObj(link);
        linkArr.push(linkObj);
      });

      var datasetId = $(xml).filterNode('id').text();
      var capabilities_link = getBCubeAccessCapabilitesUrls(datasetId);
      if (!_.isUndefined(capabilities_link)) {
        var linkObj = {
          title: 'GI-Tract Data',
          href: capabilities_link,
          description: 'Query GI-Cat and return data found.'
        };
        linkArr.push(linkObj);
      }

      return linkArr;
    }

    function getBCubeAccessCapabilitesUrls(nsidc_id) {
      var discover_result;
      var discover_url = 'http://localhost:8081/gi-cat/services/cswisogeo?service=CSW&request=GetRecordById&' +
        'id=http://nsidc.org/api/opensearch/1.1/dataset/' + nsidc_id +
        '&outputschema=http://www.isotc211.org/2005/gmi&elementSetName=full';
      var capabilities_url = 'http://localhost:8081/gi-axe/services/http-get?request=execute&service=WPS&' +
        'identifier=gi-axe-capabilities&jsondataoutput=true&DataInputs=descriptor%3Dhttp%253A%252F%252F' +
        'bcube.geodab.eu/bcube-broker%252Fservices%252Fcswiso%253Frequest%253DGetRecordById%2526version%253D' +
        '2.0.2%2526service%253DCSW%2526ElementSetName%253Dfull%2526outputSchema%253Dhttp%253A%252F%252F' +
        'www.isotc211.org%252F2005%252Fgmi%2526id%253Dhttp%25253A%25252F%25252Fnsidc.org%25252Fapi%25252F' +
        'opensearch%25252F1.1%25252Fdataset%25252F' + nsidc_id;
      $.ajax({
        url: discover_url,
        dataType: 'xml',
        async: false,
        success: function (data) {
          var ggd906_protocol = String('NSIDCGGD906');
          $(data).each(function () {
            var node_text = $(this).text();
            if (node_text.indexOf(ggd906_protocol) > -1) {
              discover_result = capabilities_url;
            }
          });
        }
      });
      return discover_result;
    }

    function getLinkObj(linkXml) {
      var linkObj, link = $(linkXml);

      if (link.length > 0) {
        linkObj = {
          title: link.attr('title'),
          href: link.attr('href'),
          description: link.attr('nsidc:description')
        };
      }
      return linkObj;
    }

    function getSortedArray(xml, selector) {
      var arr = UtilityFunctions.getArrayFromjQueryArrayTextContents($(xml).filterNode(selector));
      if (arr !== undefined) {
        arr = arr.sort();
      }
      return _.uniq(arr);
    }

    function processOsEntries(entryXml) {
      var results = [];

      entryXml.find('entry').each(function () {
        var entryObj, entry = $(this);

        entryObj = {
          title: entry.filterNode('title').text(),
          authoritativeId: entry.filterNode('nsidc:authoritativeId').text(),
          dataUrl: entry.find('link[rel=enclosure]').attr('href'),
          catalogUrl: entry.find('link[rel=describedBy]').attr('href'),
          boundingBoxes: getBoundingBoxFrom(this),
          dateRanges: getDateRangeFrom(this),
          updated: entry.find('updated').text(),
          summary: UtilityFunctions.removeWhitespace(UtilityFunctions.removeTags(entry.filterNode('summary').text())),
          author: UtilityFunctions.getArrayFromjQueryArrayTextContents(entry.filterNode('author')),
          parameters: getSortedArray(this, 'dif:Detailed_Variable'),
          keywords: getSortedArray(this, 'dif:Keyword'),
          dataFormats: getSortedArray(this, 'dif:Distribution'),
          dataUrls: getDataUrlsFrom(this),
          orderDataUrl: getLinkObj(entry.find('link[rel=order-data]')),
          externalDataUrl: getLinkObj(entry.find('link[rel=external-data]')),
          supportingPrograms: getSortedArray(this, 'nsidc:supportingProgram'),
          dataCenterNames: getSortedArray(this, 'nsidc:dataCenter')
        };
        results.push(entryObj);
      });

      return results;
    }

    var NsidcOpenSearchResponse = function () {
      this.fromXml = function (xml, osParameters) {
        var entryXml = $($.parseXML(xml)),
          jsonOptions = {
            results: processOsEntries(entryXml),
            totalCount: parseInt(entryXml.filterNode('os:totalResults').text(), 10),
            currentIndex: parseInt(entryXml.filterNode('os:startIndex').text(), 10),
            itemsPerPage: parseInt(entryXml.filterNode('os:itemsPerPage').text(), 10),
            keyword: osParameters.osSearchTerms,
            authorTerms: osParameters.osAuthor,
            parameterTerms: osParameters.osParameter,
            sensorTerms: osParameters.osSensor,
            titleTerms: osParameters.osTitle,
            startDate: osParameters.osDtStart,
            endDate: osParameters.osDtEnd,
            sortKeys: osParameters.osSortKeys,
            geoBoundingBox: osParameters.geoBoundingBox,
            facetFilters: osParameters.osFacetFilters
          };

        return new JSONResults(jsonOptions);
      };
    };

    return NsidcOpenSearchResponse;
  }
);
