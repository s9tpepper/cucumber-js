var HtmlFormatter = function (options) {

  var Cucumber = require('../../cucumber');
  var report = "build/report/cucumber/cucumber.html";
  var self = Cucumber.Listener.Formatter(options);
  var summaryFormatter = Cucumber.Listener.SummaryFormatter(options);
  var htmlTemplate = HtmlFormatter.HtmlTemplate();

  var parentHear = self.hear;
  self.hear = function hear(event, callback) {
    summaryFormatter.hear(event, function () {
      parentHear(event, callback);
    });
  };

  self.handleBeforeFeatureEvent = function handleBeforeFeatureEvent(event, callback) {
    var feature = event.getPayloadItem('feature');
    var keyword = feature.getKeyword();
    var name = feature.getName();
    var tags = feature.getTags();
    htmlTemplate.addFeature(keyword, name, tags);
    callback();
  };

  self.handleBeforeScenarioEvent = function handleBeforeScenarioEvent(event, callback) {
    var scenario = event.getPayloadItem('scenario');
    var keyword = scenario.getKeyword();
    var name = scenario.getName();
    var tags = scenario.getTags();
    htmlTemplate.addScenario(keyword, name, tags);
    callback();
  };

  self.handleStepResultEvent = function handleStepResultEvent(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
    var step = stepResult.getStep();
    var keyword = step.getKeyword();
    var name = step.getName();
    htmlTemplate.addStepResult(keyword, name, step, stepResult);
    callback();
  };

  self.handleAfterScenarioEvent = function handleAfterScenarioEvent(event, callback) {
    callback();
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
    htmlTemplate.saveReport(report);
    callback();
  };

  self.toString = function toString() {
    return '[object HtmlFormatter]';
  };

  return self;
};

HtmlFormatter.HtmlTemplate = require('./html_formatter/html_template');

module.exports = HtmlFormatter;