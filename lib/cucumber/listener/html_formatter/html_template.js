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

    lastFeatureTestingComplete: function lastFeatureTestingComplete() {
      var lastFeature = self.lastFeature();

      if ("feature" === lastFeature.className) {
        lastFeature.className = "feature passed";
      }
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

    lastScenarioTestingComplete: function lastScenarioTestingComplete() {
      var lastScenario = self.lastScenario();

      if ("scenario" === lastScenario.className) {
        lastScenario.className = "scenario passed";
      }
    },

    addStepResult: function addStepResult(keyword, name, step, stepResult) {
      var stepHtml = HtmlTemplate.STEP_TEMPLATE.replace("%KEYWORD%", keyword)
        .replace("%NAME%", name);

      var stepResultHtml = document.createElement("li");
      stepResultHtml.className = "step";

      var stepFailed = stepResult.isFailed();
      if (stepFailed) {
        stepResultHtml.className = "step failed";
        self.lastScenario().className = "scenario failed";
        self.lastFeature().className = "feature failed";
      }

      var stepSuccessful = stepResult.isSuccessful();
      if (stepSuccessful) {
        stepResultHtml.className = "step passed";
      }

      var stepSkipped = stepResult.isSkipped();
      if (stepSkipped) {
        stepResultHtml.className = "step skipped";
      }

      var stepPending = stepResult.isPending();
      if (stepPending) {
        stepResultHtml.className = "step pending";

        if ("feature" === self.lastFeature().className) {
          self.lastFeature().className = "feature pending";
        }

        if ("scenario" === self.lastScenario().className) {
          self.lastScenario().className = "scenario pending";
        }
      }

      var stepUndefined = stepResult.isUndefined();
      if (stepUndefined) {
        stepResultHtml.className = "step undefinedStep";

        if ("feature" === self.lastFeature().className) {
          self.lastFeature().className = "feature undefinedStep";
        }

        if ("scenario" === self.lastScenario().className) {
          self.lastScenario().className = "scenario undefinedStep";
        }
      }

      stepResultHtml.innerHTML = stepHtml;

      var lastScenario = self.lastScenario();
      var stepsList = lastScenario.getElementsByClassName("steps");
      var steps = stepsList.item(0);
      steps.appendChild(stepResultHtml);
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
    padding: 80px 13px 13px 13px;\n\
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
    color: gray;\n\
  }\n\
  li.feature.passed h2.featureTitle {\n\
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
    margin-right: 13px;\n\
  }\n\
  \n\
  .scenario {\n\
    background-color: #DEDEDE;\n\
    margin-bottom: 21px;\n\
    padding: 8px;\n\
    border: 1px solid gray;\n\
  }\n\
  .scenario.passed {\n\
    background-color: #E6F8E2;\n\
    border: 1px solid green;\n\
    color: green;\n\
  }\n\
  .scenario.pending {\n\
    background-color: #fafad2;\n\
    border: 1px solid orange;\n\
    color: orange;\n\
  }\n\
  .scenario.passed h2.scenarioTitle {\n\
    color: green;\n\
  }\n\
  .scenario.pending h2.scenarioTitle {\n\
    color: orange;\n\
  }\n\
  \n\
  .steps {\n\
    margin-top: 3px;\n\
    margin-left: 21px;\n\
    list-style-type: none;\n\
    padding-top: 5px;\n\
  }\n\
  \n\
  .steps li {\n\
    margin-bottom: 5px;\n\
  }\n\
  .step h2 {\n\
    font-size: 105%;\n\
  }\n\
  li.feature h2.featureTitle {\n\
    border-left: 30px solid #DEDEDE;\n\
    padding-left: 13px;\n\
    margin-bottom: 13px;\n\
    font-weight: normal;\n\
    color: gray;\n\
  }\n\
  li.feature.passed h2.featureTitle {\n\
    border-left: 30px solid #71B72C;\n\
    font-weight: normal;\n\
    color: #71B72C;\n\
  }\n\
  \n\
  li.scenario h2.scenarioTitle, li.step h2 {\n\
    font-weight: normal;\n\
  }\n\
  \n\
  \n\
  li.feature.failed h2.featureTitle {\n\
    color: red;\n\
    border-left: 30px solid red;\n\
    padding-left: 13px;\n\
  }\n\
  \n\
  li.scenario.failed {\n\
    border: 1px solid red;\n\
    background-color: #ffded8;\n\
    text-shadow: 0px 1px rgba(255,255,255,.6);\n\
  }\n\
  \n\
  li.scenario.failed h2.scenarioTitle {\n\
    color: red;\n\
  }\n\
  li.scenario.undefinedStep {\n\
    border: 1px solid #20b2aa;\n\
    background-color: #c2eeff;\n\
    text-shadow: 0px 1px rgba(255,255,255,.6);\n\
  }\n\
  \n\
  li.scenario.undefinedStep h2.scenarioTitle {\n\
    color: #20b2aa;\n\
  }\n\
  \n\
  li.step.failed h2 {\n\
    color: red;\n\
  }\n\
  li.step.passed h2 {\n\
    color: green;\n\
  }\n\
  li.step.pending h2 {\n\
    color: orange;\n\
  }\n\
  li.step.undefinedStep h2 {\n\
    color: #20b2aa;\n\
  }\n\
  \n\
  #header {\n\
    position: fixed;\n\
    width: 100%;\n\
    padding: 21px;\n\
    background-color: #E6F8E2;\n\
    border-bottom: 1px solid green;\n\
  }\n\
  .cucumberjs {\n\
    color: green;\n\
    font-size: 20px;\n\
  }\n\
  \n\
  #summary {\n\
    float: right;\n\
    margin-right: 42px;\n\
  }\n\
  li.step.skipped h2 {\n\
    color: #b2b2b2;\n\
  }\n\
  \n\
  </style>\n\
</head>\n\
<body>\n\
  <div id="header">\n\
    <span class="cucumberjs">Cucumber.js</span>\n\
    <span id="summary"></span>\n\
  </div>\n\
  <ul id="features">\n\
  </ul>\n\
</body>\n\
</html>';

HtmlTemplate.FEATURE_TEMPLATE = '\n\
  <h2 class="featureTitle"><strong>%KEYWORD%:</strong> %NAME%</h2>\n\
  <p class="featureTags">%TAGS%</p>\n\
  <p>%DESCRIPTION%</p>\n\
  <ul class="scenarios">\n\
  </ul>';

HtmlTemplate.SCENARIO_TEMPLATE = '\n\
  <h2 class="scenarioTitle"><strong>%KEYWORD%:</strong> %NAME%</h2>\n\
  <p class="scenarioTags">%TAGS%</p>\n\
  <ul class="steps">\n\
  </ul>';

HtmlTemplate.STEP_TEMPLATE = '\n\
  <h2 class="stepTitle"><strong>%KEYWORD%</strong> %NAME%</h2>\n\
  <ul class="errors">\n\
  </ul>';

module.exports = HtmlTemplate;
