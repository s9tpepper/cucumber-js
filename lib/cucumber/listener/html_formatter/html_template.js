var HtmlTemplate = function () {
  var jsdom = require("jsdom");
  var fs = require("fs");
  var html = HtmlTemplate.PAGE_TEMPLATE;
  var document = jsdom.jsdom(html);

  var lastAddedFeature, lastAddedScenario;

  var self = {
    addFeature: function addFeature(keyword, name, tags) {
      var featureHtml = HtmlTemplate.FEATURE_TEMPLATE.replace("%KEYWORD%", keyword)
        .replace("%NAME%", name)
        .replace("%DESCRIPTION%", "No description")
        .replace("%TAGS%", tags);

      var feature = document.createElement("li");
      feature.className = "feature";
      feature.innerHTML = featureHtml;

      var features = document.getElementById("features");
      features.appendChild(feature);

      lastAddedFeature = feature;
    },

    lastFeature: function lastFeature() {
      return lastAddedFeature;
    },

    addScenario: function addScenario(keyword, name, tags) {
      var scenarioHtml = HtmlTemplate.SCENARIO_TEMPLATE.replace("%KEYWORD%", keyword)
        .replace("%NAME%", name)
        .replace("%TAGS%", tags);

      var scenario = document.createElement("li");
      scenario.className = "scenario";
      scenario.innerHTML = scenarioHtml;

      var lastFeature = self.lastFeature();
      var scenariosList = lastFeature.getElementsByClassName("scenarios");
      var scenarios = scenariosList.item(0);
      scenarios.appendChild(scenario);

      lastAddedScenario = scenario;
    },

    lastScenario: function lastScenario() {
      return lastAddedScenario;
    },

    addStepResult: function addStepResult(keyword, name, step, stepResult) {
      var stepHtml = HtmlTemplate.STEP_TEMPLATE.replace("%KEYWORD%", keyword)
        .replace("%NAME%", name);

      var stepResult = document.createElement("li");
      stepResult.className = "step";
      stepResult.innerHTML = stepHtml;

      var lastScenario = self.lastScenario();
      var stepsList = lastScenario.getElementsByClassName("steps");
      var steps = stepsList.item(0);
      steps.appendChild(stepResult);
    },

    saveReport: function saveReport(file) {
      fs.writeFileSync(file, self.getHtml());
    },

    getHtml: function getHtml() {
      return document.innerHTML;
    }
  };

  return self;
};
HtmlTemplate.PAGE_TEMPLATE = '<html>\n\
<head>\n\
  <title>Cucumber.js Report</title>\n\
  <script type="text/javascript">\n\
  </script>\n\
  <style type="text/css">\n\
  * {\n\
    margin: 0;\n\
    padding: 0;\n\
  }\n\
  \n\
  body {\n\
    font-family: Arial;\n\
    text-shadow: 0px 1px rgba(255,255,255,1);\n\
  }\n\
  \n\
  #features {\n\
    padding: 13px;\n\
    list-style-type: none;\n\
  }\n\
  \n\
  .feature {\n\
    background-color: #f8f0eb;\n\
    padding: 8px;\n\
    margin: 13px;\n\
  }\n\
  \n\
  .feature h2 {\n\
    display: block;\n\
    color: #71B72C;\n\
  }\n\
  \n\
  .feature p {\n\
    text-indent: 13px;\n\
  }\n\
  \n\
  .feature ul {\n\
    margin-left: 13px;\n\
  }\n\
  \n\
  .scenarios {\n\
    list-style-type: none;\n\
    margin-top: 13px;\n\
  }\n\
  \n\
  .scenario {\n\
    background-color: #E6F8E2;\n\
    margin-bottom: 21px;\n\
    padding: 8px;\n\
    border: 1px solid green;\n\
  }\n\
  \n\
  .steps {\n\
    margin-top: 3px;\n\
    margin-left: 21px;\n\
  }\n\
  \n\
  .step h2 {\n\
    font-size: 105%;\n\
  }\n\
  </style>\n\
</head>\n\
<body>\n\
  <ul id="features">\n\
  </ul>\n\
</body>\n\
</html>';

HtmlTemplate.FEATURE_TEMPLATE = '\n\
  <h2>%KEYWORD% %NAME%</h2>\n\
  <h3>%TAGS%</h3>\n\
  <p>%DESCRIPTION%</p>\n\
  <ul class="scenarios">\n\
  </ul>';

HtmlTemplate.SCENARIO_TEMPLATE = '\n\
  <h2>%KEYWORD% %NAME%</h2>\n\
  <h3>%TAGS%</h3>\n\
  <ul class="steps">\n\
  </ul>';

HtmlTemplate.STEP_TEMPLATE = '\n\
  <h2>%KEYWORD% %NAME%</h2>\n\
  <ul class="errors">\n\
  </ul>';

module.exports = HtmlTemplate;
