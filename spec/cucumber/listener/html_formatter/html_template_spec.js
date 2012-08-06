require("../../../support/spec_helper");

describe("Cucumber.Listener.HtmlFormatter.HtmlTemplate", function () {

  var loadModule = require("../../../support/load_module").loadModule;

  var module = "lib/cucumber/listener/html_formatter/html_template.js";

  var HtmlTemplate, htmlTemplate, fsSpy, jsdomSpy, initialTemplate,
      document, element, newElement;

  beforeEach(function () {
    fsSpy = createSpyWithStubs("fs", {existsSync: null, writeFileSync: null});

    element = createSpyWithStubs("element", {appendChild: null});
    newElement = createSpyWithStubs("newElement", {});
    document = createSpyWithStubs("document", {createElement: newElement, getElementById: element});
    jsdomSpy = createSpyWithStubs("jsdom", {jsdom: document});

    HtmlTemplate = loadModule(module, {fs: fsSpy, jsdom: jsdomSpy}).HtmlTemplate;
    htmlTemplate = HtmlTemplate();
    initialTemplate = HtmlTemplate.PAGE_TEMPLATE;
  });

  describe("constructor", function () {
    it("creates a new DOM", function () {
      expect(jsdomSpy.jsdom).toHaveBeenCalledWith(initialTemplate);
    });
  });

  describe("addFeature()", function () {
    var featureTemplateKey, featureTemplateName, featureTemplateDesc,
        featureTemplateTags, finishedTemplate, keyword, name, tags;

    beforeEach(function () {
      keyword = "Feature:"
      name = "A Feature Name";
      tags = "dev";
      finishedTemplate = createSpy("finished template");
      featureTemplateTags = createSpyWithStubs("feature template string for tags", {replace: finishedTemplate});
      featureTemplateDesc = createSpyWithStubs("feature template string for desc", {replace: featureTemplateTags});
      featureTemplateName = createSpyWithStubs("feature template string for name", {replace: featureTemplateDesc});
      featureTemplateKey = createSpyWithStubs("feature template string for keyword", {replace: featureTemplateName});

      HtmlTemplate.FEATURE_TEMPLATE = featureTemplateKey;
    });

    it("builds the feature html from the feature template", function () {
      htmlTemplate.addFeature(keyword, name, tags);

      expect(featureTemplateKey.replace).toHaveBeenCalledWith("%KEYWORD%", keyword);
      expect(featureTemplateName.replace).toHaveBeenCalledWith("%NAME%", name);
      expect(featureTemplateDesc.replace).toHaveBeenCalledWith("%DESCRIPTION%", "No description");
      expect(featureTemplateTags.replace).toHaveBeenCalledWith("%TAGS%", tags);
    });

    it("creates a new li element to put the feature in", function () {
      htmlTemplate.addFeature(keyword, name, tags);

      expect(document.createElement).toHaveBeenCalledWith("li");
    });

    it("adds the 'feature' class to the li element", function () {
      htmlTemplate.addFeature(keyword, name, tags);

      expect(newElement.className).toBe("feature");
    });

    it("adds the built feature html to the new li's innerHTML", function () {
      htmlTemplate.addFeature(keyword, name, tags);

      expect(newElement.innerHTML).toBe(finishedTemplate);
    });

    it("gets the features html element", function () {
      htmlTemplate.addFeature(keyword, name, tags);

      expect(document.getElementById).toHaveBeenCalledWith("features");
    });

    it("adds the new feature li element to the features element", function () {
      htmlTemplate.addFeature(keyword, name, tags);

      expect(element.appendChild).toHaveBeenCalledWith(newElement);
    });

    it("sets the new feature li as the last feature", function () {
      expect(htmlTemplate.lastFeature()).not.toBe(newElement);

      htmlTemplate.addFeature(keyword, name, tags);

      expect(htmlTemplate.lastFeature()).toBe(newElement);
    });
  });

  describe("addScenario()", function () {
    var scenarioTemplateKey, scenarioTemplateName, lastFeature, elements,
        scenarioTemplateTags, finishedTemplate, keyword, name, tags;

    beforeEach(function () {
      keyword = "Scenario:"
      name = "A scenario description";
      tags = "dev";
      finishedTemplate = createSpy("finished scenario template");
      scenarioTemplateTags = createSpyWithStubs("scenario template string with tags token", {replace: finishedTemplate});
      scenarioTemplateName = createSpyWithStubs("scenario template string with name token", {replace: scenarioTemplateTags});
      scenarioTemplateKey = createSpyWithStubs("scenario template string with keyword token", {replace: scenarioTemplateName});

      elements = createSpyWithStubs("elements array", {item: element});
      lastFeature = createSpyWithStubs("last feature", {getElementsByClassName: elements});
      spyOn(htmlTemplate, "lastFeature").andReturn(lastFeature);

      HtmlTemplate.SCENARIO_TEMPLATE = scenarioTemplateKey;
    });

    it("builds the scenario html from the scenario template", function () {
      htmlTemplate.addScenario(keyword, name, tags);

      expect(scenarioTemplateKey.replace).toHaveBeenCalledWith("%KEYWORD%", keyword);
      expect(scenarioTemplateName.replace).toHaveBeenCalledWith("%NAME%", name);
      expect(scenarioTemplateTags.replace).toHaveBeenCalledWith("%TAGS%", tags);
    });

    it("creates a new li element to put the scenario in", function () {
      htmlTemplate.addScenario(keyword, name, tags);

      expect(document.createElement).toHaveBeenCalledWith("li");
    });

    it("adds the 'scenario' class to the li element", function () {
      htmlTemplate.addScenario(keyword, name, tags);

      expect(newElement.className).toBe("scenario");
    });

    it("adds the built scenario html to the new li's innerHTML", function () {
      htmlTemplate.addScenario(keyword, name, tags);

      expect(newElement.innerHTML).toBe(finishedTemplate);
    });

    it("gets the last feature added", function () {
      htmlTemplate.addScenario(keyword, name, tags);

      expect(htmlTemplate.lastFeature).toHaveBeenCalled();
    });

    it("gets a list of elements with the 'scenarios' class from the last feature added", function () {
      htmlTemplate.addScenario(keyword, name, tags);

      expect(lastFeature.getElementsByClassName).toHaveBeenCalledWith("scenarios");
    });

    it("gets the first element found with the class scenarios", function () {
      htmlTemplate.addScenario(keyword, name, tags);

      expect(elements.item).toHaveBeenCalledWith(0);
    });

    it("adds the new scenario li to the element with the scenarios class", function () {
      htmlTemplate.addScenario(keyword, name, tags);

      expect(element.appendChild).toHaveBeenCalledWith(newElement);
    });

    it("sets the new scenario li as the last scenario", function () {
      expect(htmlTemplate.lastScenario()).not.toBe(newElement);

      htmlTemplate.addScenario(keyword, name, tags);

      expect(htmlTemplate.lastScenario()).toBe(newElement);
    });
  });

  describe("addStepResult()", function () {
    var step, stepResult, stepTemplateKey, stepTemplateName, lastScenario, elements,
        finishedTemplate, keyword, name;

    beforeEach(function() {
      step = createSpy("step");
      stepResult = createSpy("step result");

      keyword = "When"
      name = "something happens";
      finishedTemplate = createSpy("finished step result template");
      stepTemplateName = createSpyWithStubs("step result template string with name token", {replace: finishedTemplate});
      stepTemplateKey = createSpyWithStubs("step result template string with keyword token", {replace: stepTemplateName});

      elements = createSpyWithStubs("elements array", {item: element});
      lastScenario = createSpyWithStubs("last scenario", {getElementsByClassName: elements});
      spyOn(htmlTemplate, "lastScenario").andReturn(lastScenario);

      HtmlTemplate.STEP_TEMPLATE = stepTemplateKey;
    });

    it("builds the step result html from the step result template", function () {
      htmlTemplate.addStepResult(keyword, name, step, stepResult);

      expect(stepTemplateKey.replace).toHaveBeenCalledWith("%KEYWORD%", keyword);
      expect(stepTemplateName.replace).toHaveBeenCalledWith("%NAME%", name);
    });

    it("creates a new li element to put the scenario in", function () {
      htmlTemplate.addStepResult(keyword, name, step, stepResult);

      expect(document.createElement).toHaveBeenCalledWith("li");
    });

    it("adds the 'step' class to the li element", function () {
      htmlTemplate.addStepResult(keyword, name, step, stepResult);

      expect(newElement.className).toBe("step");
    });

    it("adds the built step result html to the new li's innerHTML", function () {
      htmlTemplate.addStepResult(keyword, name, step, stepResult);

      expect(newElement.innerHTML).toBe(finishedTemplate);
    });

    it("gets the last scenario added", function () {
      htmlTemplate.addStepResult(keyword, name, step, stepResult);

      expect(htmlTemplate.lastScenario).toHaveBeenCalled();
    });

    it("gets a list of elements with the 'steps' class from the last scenario added", function () {
      htmlTemplate.addStepResult(keyword, name, step, stepResult);

      expect(lastScenario.getElementsByClassName).toHaveBeenCalledWith("steps");
    });

    it("gets the first element found with the class steps", function () {
      htmlTemplate.addStepResult(keyword, name, step, stepResult);

      expect(elements.item).toHaveBeenCalledWith(0);
    });

    it("adds the new step result li to the element with the steps class", function () {
      htmlTemplate.addStepResult(keyword, name, step, stepResult);

      expect(element.appendChild).toHaveBeenCalledWith(newElement);
    });
  });

  describe("saveReport()", function () {
    var html;
    beforeEach(function () {
      html = createSpy("html");
      spyOn(htmlTemplate, "getHtml").andReturn(html);
    });

    it("saves the generated HTML to the file path specified", function () {
      var reportPath = "/path/to/cuke_report.html";

      htmlTemplate.saveReport(reportPath);

      expect(htmlTemplate.getHtml).toHaveBeenCalled();
      expect(fsSpy.writeFileSync).toHaveBeenCalledWith(reportPath, html);
    });
  });
});