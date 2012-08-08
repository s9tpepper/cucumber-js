require("../../support/spec_helper");

describe("Cucumber.Listener.HtmlFormatter", function () {

  var Cucumber = requireLib('cucumber');
  var options,
    formatter,
    htmlFormatter,
    summaryFormatter,
    formatterHearMethod,
    htmlTemplate;

  beforeEach(function () {
    options = createSpy("options");

    formatter = createSpyWithStubs("formatter", {log: null});
    formatterHearMethod = spyOnStub(formatter, 'hear');
    spyOn(Cucumber.Listener, 'Formatter').andReturn(formatter);

    summaryFormatter = createSpy("summary formatter");
    spyOn(Cucumber.Listener, 'SummaryFormatter').andReturn(summaryFormatter);

    htmlTemplate = createSpyWithStubs("html template", { addFeature: null, addScenario: null, addStepResult: null,
                                                         saveReport: null, lastFeatureTestingComplete: null,
                                                         lastScenarioTestingComplete: null});
    spyOn(Cucumber.Listener.HtmlFormatter, "HtmlTemplate").andReturn(htmlTemplate);

    htmlFormatter = Cucumber.Listener.HtmlFormatter(options);
  });

  describe("constructor", function () {
    it("creates a formatter", function () {
      expect(Cucumber.Listener.Formatter).toHaveBeenCalledWith(options);
    });

    it("extends the formatter", function () {
      expect(htmlFormatter).toBe(formatter);
    });

    it("creates a summaryFormatter", function () {
      expect(Cucumber.Listener.SummaryFormatter).toHaveBeenCalledWith(options);
    });

    it("creates an htmlTemplate", function () {
      expect(Cucumber.Listener.HtmlFormatter.HtmlTemplate).toHaveBeenCalled();
    });

    it("returns an HtmlFormatter", function () {
      expect(htmlFormatter.toString()).toBe('[object HtmlFormatter]');
    });
  });

  describe("hear()", function () {

    var event, callback;

    beforeEach(function () {
      event = createSpy("event");
      callback = createSpy("callback");
      spyOnStub(summaryFormatter, "hear");
    });

    it("tells the summary formatter to listen to the event", function () {
      htmlFormatter.hear(event, callback);
      expect(summaryFormatter.hear).toHaveBeenCalled();
      expect(summaryFormatter.hear).toHaveBeenCalledWithValueAsNthParameter(event, 1);
      expect(summaryFormatter.hear).toHaveBeenCalledWithAFunctionAsNthParameter(2);
    });

    describe("summary formatter callback", function () {
      var summaryFormatterCallback;

      beforeEach(function () {
        htmlFormatter.hear(event, callback);
        summaryFormatterCallback = summaryFormatter.hear.mostRecentCall.args[1];
      });

      it("tells the formatter to listen to the event", function () {
        summaryFormatterCallback();
        expect(formatterHearMethod).toHaveBeenCalledWith(event, callback);
      });
    });

  });

  describe("handleBeforeFeatureEvent()", function () {

    var feature, event, callback, keyword, name, tags;

    beforeEach(function () {
      keyword  = "feature-keyword";
      name     = "feature-name";
      tags     = "feature-tags";
      feature  = createSpyWithStubs("feature", { getKeyword: keyword, getName: name, getTags: tags });
      event    = createSpyWithStubs("event", { getPayloadItem: feature });
      callback = createSpy("callback");
    });

    it("gets the feature from the event payload", function () {
      htmlFormatter.handleBeforeFeatureEvent(event, callback);
      expect(event.getPayloadItem).toHaveBeenCalledWith('feature');
    });

    it("gets the feature keyword", function () {
      htmlFormatter.handleBeforeFeatureEvent(event, callback);
      expect(feature.getKeyword).toHaveBeenCalled();
    });

    it("gets the feature name", function () {
      htmlFormatter.handleBeforeFeatureEvent(event, callback);
      expect(feature.getName).toHaveBeenCalled();
    });

    it("gets the feature tags", function () {
      htmlFormatter.handleBeforeFeatureEvent(event, callback);
      expect(feature.getTags).toHaveBeenCalled();
    });

    it("adds the feature to the html template", function () {
      htmlFormatter.handleBeforeFeatureEvent(event, callback);
      expect(htmlTemplate.addFeature).toHaveBeenCalledWith(keyword, name, tags);
    });

    it("calls back", function () {
      htmlFormatter.handleBeforeFeatureEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });

  });

  describe("handleBeforeScenarioEvent()", function () {

    var event, scenario, keyword, name, tags, callback;

    beforeEach(function () {
      keyword = "scenario-keyword";
      name = "scenario-name";
      tags = "scenario-tags";
      scenario = createSpyWithStubs("scenario", {getKeyword: keyword, getName: name, getTags: tags});
      event = createSpyWithStubs("event", {getPayloadItem: scenario});
      callback = createSpy("callback");
    });

    it("gets the scenario from the event payload.", function () {
      htmlFormatter.handleBeforeScenarioEvent(event, callback);
      expect(event.getPayloadItem).toHaveBeenCalledWith("scenario");
    });

    it("gets the scenario keyword", function () {
      htmlFormatter.handleBeforeScenarioEvent(event, callback);
      expect(scenario.getKeyword).toHaveBeenCalled();
    });

    it("gets the scenario name", function () {
      htmlFormatter.handleBeforeScenarioEvent(event, callback);
      expect(scenario.getName).toHaveBeenCalled();
    });

    it("gets the scenario tags", function () {
      htmlFormatter.handleBeforeScenarioEvent(event, callback);
      expect(scenario.getTags).toHaveBeenCalled();
    });

    it("adds the scenario to the html template", function () {
      htmlFormatter.handleBeforeScenarioEvent(event, callback);
      expect(htmlTemplate.addScenario).toHaveBeenCalledWith(keyword, name, tags);
    });

    it("calls back", function () {
      htmlFormatter.handleBeforeScenarioEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    })

  });

  describe("handleStepResultEvent()", function () {

    var event, stepResult, keyword, name, step, callback;

    beforeEach(function () {
      keyword = "step-keyword";
      name = "step-name";
      step = createSpyWithStubs("step", {getKeyword: keyword, getName: name});
      stepResult = createSpyWithStubs("step result", {getStep: step, isFailed: null});
      event = createSpyWithStubs("event", {getPayloadItem: stepResult});
      callback = createSpy("callback");
    });

    it("gets the step result from the event payload", function () {
      htmlFormatter.handleStepResultEvent(event, callback);
      expect(event.getPayloadItem).toHaveBeenCalledWith("stepResult");
    });

    it("gets the step from the step result", function () {
      htmlFormatter.handleStepResultEvent(event, callback);
      expect(stepResult.getStep).toHaveBeenCalled();
    });

    it("gets the step keyword", function () {
      htmlFormatter.handleStepResultEvent(event, callback);
      expect(step.getKeyword).toHaveBeenCalled();
    });

    it("gets the step name", function () {
      htmlFormatter.handleStepResultEvent(event, callback);
      expect(step.getName).toHaveBeenCalled();
    });

    it("adds the step and results to the html template", function () {
      htmlFormatter.handleStepResultEvent(event, callback);
      expect(htmlTemplate.addStepResult).toHaveBeenCalledWith(keyword, name, step, stepResult);
    });

    it("calls back", function () {
      htmlFormatter.handleStepResultEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });

  });

  describe("handleAfterScenarioEvent()", function () {

    var event, callback;

    beforeEach(function () {
      callback = createSpy("callback");
    });

    it("tells the html template the last scenario has completed being tested", function () {
      htmlFormatter.handleAfterScenarioEvent(event, callback);
      expect(htmlTemplate.lastScenarioTestingComplete).toHaveBeenCalled();
    });

    it("calls back", function () {
      htmlFormatter.handleAfterScenarioEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });

  });

  describe("handleAfterFeatureEvent", function () {

    var event, callback, lastFeature;

    beforeEach(function () {
      event = createSpy("event");
      callback = createSpy("callback");
    });

    it("tells the html template the last feature has completed being tested", function () {
      htmlFormatter.handleAfterFeatureEvent(event, callback);

      expect(htmlTemplate.lastFeatureTestingComplete).toHaveBeenCalled();
    });

    it("calls back", function () {
      htmlFormatter.handleAfterFeatureEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });

  });

  describe("handleAfterFeaturesEvent()", function () {

    var event, callback;

    beforeEach(function () {
      event = createSpy("event");
      callback = createSpy("callback");
    });

    it("tells the html template to save the report file", function () {
      htmlFormatter.handleAfterFeaturesEvent(event, callback);
      expect(htmlTemplate.saveReport).toHaveBeenCalled();
    });

    it("calls back", function () {
      htmlFormatter.handleAfterFeaturesEvent(event, callback);
      expect(callback).toHaveBeenCalled();
    });

  });

});