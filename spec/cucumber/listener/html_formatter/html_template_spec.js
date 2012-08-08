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
        featureTemplateTags, finishedTemplate, keyword, name, tags, desc;

    beforeEach(function () {
      keyword = "Feature:"
      name = "A Feature Name";
      desc = "feature-description";
      tags = "dev";
      finishedTemplate = createSpy("finished template");
      featureTemplateTags = createSpyWithStubs("feature template string for tags", {replace: finishedTemplate});
      featureTemplateDesc = createSpyWithStubs("feature template string for desc", {replace: featureTemplateTags});
      featureTemplateName = createSpyWithStubs("feature template string for name", {replace: featureTemplateDesc});
      featureTemplateKey = createSpyWithStubs("feature template string for keyword", {replace: featureTemplateName});

      HtmlTemplate.FEATURE_TEMPLATE = featureTemplateKey;
    });

    it("builds the feature html from the feature template", function () {
      htmlTemplate.addFeature(keyword, name, desc, tags);

      expect(featureTemplateKey.replace).toHaveBeenCalledWith("%KEYWORD%", keyword);
      expect(featureTemplateName.replace).toHaveBeenCalledWith("%NAME%", name);
      expect(featureTemplateDesc.replace).toHaveBeenCalledWith("%DESCRIPTION%", desc);
      expect(featureTemplateTags.replace).toHaveBeenCalledWith("%TAGS%", tags);
    });

    it("creates a new li element to put the feature in", function () {
      htmlTemplate.addFeature(keyword, name, desc, tags);

      expect(document.createElement).toHaveBeenCalledWith("li");
    });

    it("adds the 'feature' class to the li element", function () {
      htmlTemplate.addFeature(keyword, name, desc, tags);

      expect(newElement.className).toBe("feature");
    });

    it("adds the built feature html to the new li's innerHTML", function () {
      htmlTemplate.addFeature(keyword, name, desc, tags);

      expect(newElement.innerHTML).toBe(finishedTemplate);
    });

    it("gets the features html element", function () {
      htmlTemplate.addFeature(keyword, name, desc, tags);

      expect(document.getElementById).toHaveBeenCalledWith("features");
    });

    it("adds the new feature li element to the features element", function () {
      htmlTemplate.addFeature(keyword, name, desc, tags);

      expect(element.appendChild).toHaveBeenCalledWith(newElement);
    });

    it("sets the new feature li as the last feature", function () {
      expect(htmlTemplate.lastFeature()).not.toBe(newElement);

      htmlTemplate.addFeature(keyword, name, desc, tags);

      expect(htmlTemplate.lastFeature()).toBe(newElement);
    });
  });

  describe("lastFeatureTestingComplete()", function () {
    var lastFeature;

    beforeEach(function () {
      lastFeature = createSpy("last feature");
      spyOn(htmlTemplate, "lastFeature").andReturn(lastFeature);
    });

    it("gets the last feature", function () {
      htmlTemplate.lastFeatureTestingComplete();

      expect(htmlTemplate.lastFeature).toHaveBeenCalled();
    });

    describe("when the last feature's class name is still 'feature'", function () {
      beforeEach(function () {
        lastFeature.className = "feature";
      });

      it("changes the class name to 'feature passed'", function () {
        htmlTemplate.lastFeatureTestingComplete();

        expect(lastFeature.className).toBe("feature passed");
      });
    });

    describe("when the last feature's class name is something other than 'feature'", function () {
      var modifiedClassName = "feature with other classes";
      beforeEach(function () {
        lastFeature.className = modifiedClassName;
      });

      it("leaves the current class name intact", function () {
        htmlTemplate.lastFeatureTestingComplete();
        expect(lastFeature.className).toBe(modifiedClassName);
      });
    });
  });

  describe("lastScenarioTestingComplete", function () {

    var lastScenario;

    beforeEach(function () {
      lastScenario = createSpy("last scenario");
      spyOn(htmlTemplate, "lastScenario").andReturn(lastScenario);
    });

    it("gets the last scenario", function () {
      htmlTemplate.lastScenarioTestingComplete();
      expect(htmlTemplate.lastScenario).toHaveBeenCalled();
    });

    describe("when the last scenario's class name is still 'scenario'", function () {
      beforeEach(function () {
        lastScenario.className = "scenario";
      });

      it("changes the class name to 'scenario passed'", function () {
        htmlTemplate.lastScenarioTestingComplete();
        expect(lastScenario.className).toBe("scenario passed");
      });
    });

    describe("when the last scenario's class name is something other than 'scenario'", function () {
      var modifiedClassName = "scenario with other classes";
      beforeEach(function () {
        lastScenario.className = modifiedClassName;
      });

      it("leaves the current class name intact", function () {
        htmlTemplate.lastScenarioTestingComplete();
        expect(lastScenario.className).toBe(modifiedClassName);
      });
    });
  });

  describe("addScenario()", function () {
    var scenarioTemplateKey, scenarioTemplateName, lastFeature, elements,
        scenarioTemplateTags, finishedTemplate, keyword, name, tags;

    beforeEach(function () {
      keyword = "Scenario:";
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
        finishedTemplate, keyword, name, stepTemplateAttachment, attachment;

    beforeEach(function() {
      attachment = "attachment";
      step = createSpyWithStubs("step", {hasAttachment: false, getAttachmentContents: attachment});

      stepResult = createSpyWithStubs("step result", {isFailed: null, isSkipped: null,
                                                      isSuccessful: null, isPending: null,
                                                      isUndefined: null});
      keyword = "When"
      name = "something happens";
      finishedTemplate = createSpy("finished step result template");
      stepTemplateAttachment = createSpyWithStubs("step result template string with attachment token", {replace: finishedTemplate});
      stepTemplateName = createSpyWithStubs("step result template string with name token", {replace: stepTemplateAttachment});
      stepTemplateKey = createSpyWithStubs("step result template string with keyword token", {replace: stepTemplateName});

      elements = createSpyWithStubs("elements array", {item: element});
      lastScenario = createSpyWithStubs("last scenario", {getElementsByClassName: elements});
      spyOn(htmlTemplate, "lastScenario").andReturn(lastScenario);

      HtmlTemplate.STEP_TEMPLATE = stepTemplateKey;
    });

    it("checks if the step has an attachment", function () {
      htmlTemplate.addStepResult(keyword, name, step, stepResult);
      expect(step.hasAttachment).toHaveBeenCalled();
    });

    describe("when it doesn't have an attachment", function () {
      it("replaces the %ATTACHMENT% token with an empty string", function () {
        htmlTemplate.addStepResult(keyword, name, step, stepResult);

        expect(stepTemplateAttachment.replace).toHaveBeenCalledWith("%ATTACHMENT%", "");
      });
    });

    describe("when it has an attachment", function () {
      beforeEach(function () {
        step.hasAttachment.andReturn(true);
      });

      it("gets the attachment contents from the step", function () {
        htmlTemplate.addStepResult(keyword, name, step, stepResult);
        expect(step.getAttachmentContents).toHaveBeenCalled();
      });

      it("replaces the %ATTACHMENT% token with the attachment contents", function () {
        htmlTemplate.addStepResult(keyword, name, step, stepResult);
        expect(stepTemplateAttachment.replace).toHaveBeenCalledWith("%ATTACHMENT%", attachment);
      });
    });

    it("replaces the %KEYWORD% token with the keyword in the step template", function () {
      htmlTemplate.addStepResult(keyword, name, step, stepResult);

      expect(stepTemplateKey.replace).toHaveBeenCalledWith("%KEYWORD%", keyword);
    });

    it("replaces the %NAME% token with the keyword in the step template", function () {
      htmlTemplate.addStepResult(keyword, name, step, stepResult);

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

    it("checks if the step failed", function () {
      htmlTemplate.addStepResult(keyword, name, step, stepResult);

      expect(stepResult.isFailed).toHaveBeenCalled();
    });

    describe("when the step failed", function () {
      var lastFeature;
      beforeEach(function () {
        stepResult.isFailed.andReturn(true);

        lastFeature = createSpy("last feature");
        spyOn(htmlTemplate, "lastFeature").andReturn(lastFeature);
        lastFeature.className = "feature";
      });

      it("adds the failed class to the li element", function () {
        htmlTemplate.addStepResult(keyword, name, step, stepResult);

        expect(newElement.className).toBe("step failed");
      });

      it("adds the failed class to the last scenario", function () {
        htmlTemplate.addStepResult(keyword, name, step, stepResult);

        expect(lastScenario.className).toBe("scenario failed");
      });

      it("adds the failed class to the last feature", function () {
        htmlTemplate.addStepResult(keyword, name, step, stepResult);

        expect(htmlTemplate.lastFeature().className).toBe("feature failed");
      });
    });

    describe("when the step passed", function () {
      var lastFeature;

      beforeEach(function () {
        stepResult.isSuccessful.andReturn(true);
      });

      it("checks if the step was successful", function () {
        htmlTemplate.addStepResult(keyword, name, step, stepResult);

        expect(stepResult.isSuccessful).toHaveBeenCalled();
      });

      it("adds the passed class to the li element", function () {
        htmlTemplate.addStepResult(keyword, name, step, stepResult);

        expect(newElement.className).toBe("step passed");
      });
    });

    it("checks if the step is skipped", function () {
      htmlTemplate.addStepResult(keyword, name, step, stepResult);

      expect(stepResult.isSkipped).toHaveBeenCalled();
    });

    describe("when step is skipped", function () {
      beforeEach(function () {
        stepResult.isSkipped.andReturn(true);
        newElement.className = "step";
      });

      it("adds the skipped class to the step li element", function () {
        htmlTemplate.addStepResult(keyword, name, step, stepResult);

        expect(newElement.className).toBe("step skipped");
      });
    });


    it("checks if the step is pending", function () {
      htmlTemplate.addStepResult(keyword, name, step, stepResult);

      expect(stepResult.isPending).toHaveBeenCalled();
    });

    describe("when the step is pending", function () {
      var lastFeature;
      beforeEach(function () {
        stepResult.isPending.andReturn(true);
        newElement.className = "step";

        lastFeature = createSpy("last feature");
        lastFeature.className = "feature";
        spyOn(htmlTemplate, "lastFeature").andReturn(lastFeature);
      });

      it("adds the pending class to the step li element", function () {
        htmlTemplate.addStepResult(keyword, name, step, stepResult);

        expect(newElement.className).toBe("step pending");
      });

      it("adds the pending class to the last feature if its class is 'feature'", function () {
        lastFeature.className = "feature";

        htmlTemplate.addStepResult(keyword, name, step, stepResult);

        expect(lastFeature.className).toBe("feature pending");
      });

      it("adds the pending class to the last scenario if its class is 'scenario'", function () {
        lastScenario.className = "scenario";

        htmlTemplate.addStepResult(keyword, name, step, stepResult);

        expect(lastScenario.className).toBe("scenario pending");
      });
    });

    it("checks if the step is undefined", function () {
      htmlTemplate.addStepResult(keyword, name, step, stepResult);

      expect(stepResult.isUndefined).toHaveBeenCalled();
    });

    describe("when step is undefined", function () {
      var lastFeature;

      beforeEach(function () {
        stepResult.isUndefined.andReturn(true);
        newElement.className = "step";

        lastFeature = createSpy("last feature");
        lastFeature.className = "feature";
        spyOn(htmlTemplate, "lastFeature").andReturn(lastFeature);

        lastScenario.className = "scenario";
      });

      it("adds the undefinedStep class to the step li element", function () {
        htmlTemplate.addStepResult(keyword, name, step, stepResult);

        expect(newElement.className).toBe("step undefinedStep");
      });

      it("adds the undefinedStep class to the last feature if class is 'feature'", function () {
        htmlTemplate.addStepResult(keyword, name, step, stepResult);

        expect(lastFeature.className).toBe("feature undefinedStep");
      });

      it("adds the undefinedStep class to the last scenario if class is 'scenario'", function () {
        htmlTemplate.addStepResult(keyword, name, step, stepResult);

        expect(lastScenario.className).toBe("scenario undefinedStep");
      });
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
    var html, reportPath, logs, summaryElement;
    beforeEach(function () {
      summaryElement = createSpy("summaryElement");
      logs = createSpy("logs");
      reportPath = "/path/to/cuke_report.html";
      html = createSpy("html");
      spyOn(htmlTemplate, "getHtml").andReturn(html);
      document.getElementById.andReturn(summaryElement);
    });

    it("gets the summary report element", function () {
      htmlTemplate.saveReport(reportPath, logs);

      expect(document.getElementById).toHaveBeenCalledWith("summary");
    });

    it("adds the logs to the summary element's innerHTML", function () {
      htmlTemplate.saveReport(reportPath, logs);

      expect(summaryElement.innerHTML).toBe(logs);
    });

    it("gets the HTML for the report", function () {
      htmlTemplate.saveReport(reportPath, logs);

      expect(htmlTemplate.getHtml).toHaveBeenCalled();
    });

    it("saves the generated HTML to the file path specified", function () {
      htmlTemplate.saveReport(reportPath, logs);

      expect(fsSpy.writeFileSync).toHaveBeenCalledWith(reportPath, html);
    });
  });
});