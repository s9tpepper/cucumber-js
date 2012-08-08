var HtmlFormatter = function (options) {
  var Cucumber = require('../../cucumber');
  var reportPath = "build/report/cucumber/cucumber.html";
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
    var desc = feature.getDescription();
    var tags = feature.getTags();
    var tagsStr = self.stringifyTags(tags);
    htmlTemplate.addFeature(keyword, name, desc, tagsStr);
    callback();
  };

  self.handleBeforeScenarioEvent = function handleBeforeScenarioEvent(event, callback) {
    var scenario = event.getPayloadItem('scenario');
    var keyword = scenario.getKeyword();
    var name = scenario.getName();
    var tags = scenario.getTags();
    var tagsStr = self.stringifyTags(tags);
    htmlTemplate.addScenario(keyword, name, tagsStr);
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
    htmlTemplate.lastScenarioTestingComplete();
    callback();
  };

  self.handleAfterFeatureEvent = function handleAfterFeatureEvent(event, callback) {
    htmlTemplate.lastFeatureTestingComplete();
    callback();
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
    var logs = self.getLogs();
    var path = self.getReportPath();
    htmlTemplate.saveReport(path, logs);
    callback();
  };

  self.getLogs = function getLogs() {
    var logs = summaryFormatter.getScenariosSummary();
    logs += "<br />";
    logs += summaryFormatter.getStepsSummary();
    return logs;
  };

  self.getReportPath = function getReportPath() {
    return reportPath;
  };

  self.stringifyTags = function stringifyTags(tags) {
    var tagNames = [];
    var tagName;
    var tag;
    for (var i = 0; i < tags.length; i++) {
      tag = tags[i];
      tagName = tag.getName();
      tagNames.push(tagName);
    }

    return tagNames.join(" ");
  };

  self.toString = function toString() {
    return '[object HtmlFormatter]';
  };

  return self;
};

HtmlFormatter.HtmlTemplate = require('./html_formatter/html_template');

module.exports = HtmlFormatter;