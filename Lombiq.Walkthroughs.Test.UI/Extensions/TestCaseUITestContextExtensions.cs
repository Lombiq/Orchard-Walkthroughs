using Atata;
using Lombiq.Tests.UI.Extensions;
using Lombiq.Tests.UI.Services;
using Newtonsoft.Json.Linq;
using OpenQA.Selenium;
using Shouldly;
using System.Threading.Tasks;

namespace Lombiq.JsonEditor.Tests.UI.Extensions;

public static class TestCaseUITestContextExtensions
{
    private const string SampleContentItemId = "4xapn6ykttkk6wbbwgg1aaxqda";
    private const string HelloValue = "hello";
    private const string WorldValue = "world";
    private const string TestField = "testField";
    private const string TestValue = "testValue";

    private static readonly By ObjectByXPath = By.XPath($"//div[@class='jsoneditor-readonly' and contains(text(),'object')]");
    private static readonly By ObjectCountByXPath = By.XPath($"//div[@class='jsoneditor-value jsoneditor-object' and contains(text(),'{{2}}')]");
    private static readonly By ArrayByXPath = By.XPath($"//div[@class='jsoneditor-field' and contains(text(),'printThese')]");
    private static readonly By ArrayCountByXPath = By.XPath($"//div[@class='jsoneditor-value jsoneditor-array' and contains(text(),'[2]')]");
    private static readonly By FieldByXPath = By.XPath($"//div[@class='jsoneditor-field' and contains(text(), '{TestField}')]");

    public static async Task TestJsonEditorBehaviorAsync(this UITestContext context)
    {
        await context.EnableJsonEditorFeatureAsync();

        await context.ExecuteJsonEditorSampleRecipeDirectlyAsync();

        // Checking if the sample item is displayed correctly.
        await context.GoToContentItemByIdAsync(SampleContentItemId);

        context.Exists(By.XPath($"//div[contains(text(),'These are coming from the JSON field:')]"));
        context.Exists(By.XPath($"//li[contains(text(),'{HelloValue}')]"));
        context.Exists(By.XPath($"//li[contains(text(),'{WorldValue}')]"));

        await context.SignInDirectlyAsync();
        await context.GoToContentItemEditorByIdAsync(SampleContentItemId);

        // Testing if input is saved.
        await context.ClickReliablyOnAsync(
            By.XPath($"//tr[contains(@class,'jsoneditor-expandable jsoneditor-collapsed')]" +
                "/td/button[@class='jsoneditor-button jsoneditor-contextmenu-button']"));

        await context.ClickReliablyOnAsync(By.XPath($"//div[contains(text(),'Append')]"));

        context.Get(By.XPath($"//div[@class='jsoneditor-field jsoneditor-empty']")).FillInWith(TestField);
        context.Get(By.XPath($"//div[@class='jsoneditor-value jsoneditor-string jsoneditor-empty']")).FillInWith(TestValue);
        await context.ClickPublishAsync();

        // Checking if the sample item is displayed correctly in all tree style mode.
        await context.TestTreeStyleModeAsync();

        await context.SwitchToModeAsync("View");
        await context.TestTreeStyleModeAsync();

        await context.SwitchToModeAsync("Form");
        await context.TestTreeStyleModeAsync();

        // Checking if the sample item is displayed correctly in all code style mode.
        await context.SwitchToModeAsync("Code");
        context.TestCodeStyleMode();

        await context.SwitchToModeAsync("Text");
        context.TestCodeStyleMode();

        await context.SwitchToModeAsync("Preview");
        context.TestCodeStyleMode();
    }

    private static void CheckValueInTreeMode(this UITestContext context, string arrayValue, bool exists = true)
    {
        var arrayValueByXPath =
            By.XPath($"//div[@class='jsoneditor-value jsoneditor-string' and contains(text(),'{arrayValue}')]");

        context.CheckExistence(arrayValueByXPath, exists);
    }

    private static Task ClickOnExpandAllAsync(this UITestContext context) =>
        context.ClickReliablyOnAsync(By.XPath($"//button[@class='jsoneditor-expand-all']"));

    private static Task ClickOnCollapseAllAsync(this UITestContext context) =>
        context.ClickReliablyOnAsync(By.XPath($"//button[@class='jsoneditor-collapse-all']"));

    private static async Task SwitchToModeAsync(this UITestContext context, string editorName)
    {
        await context.ClickReliablyOnAsync(By.XPath($"//button[@class='jsoneditor-modes jsoneditor-separator']"));
        await context.ClickReliablyOnAsync(By.XPath($"//div[@class='jsoneditor-text' and contains(text(),'{editorName}')]"));
    }

    private static async Task TestTreeStyleModeAsync(this UITestContext context)
    {
        await context.ClickOnExpandAllAsync();

        // Checking object {1}.
        context.Exists(ObjectByXPath);
        context.Exists(ObjectCountByXPath);

        // Checking printThese [2].
        context.Exists(ArrayByXPath);
        context.Exists(ArrayCountByXPath);

        context.Exists(FieldByXPath);

        // Checking "hello" and "word" and "testValue".
        context.CheckValueInTreeMode(HelloValue);
        context.CheckValueInTreeMode(WorldValue);
        context.CheckValueInTreeMode(TestValue);

        // Collapse button should hide things.
        await context.ClickOnCollapseAllAsync();

        context.Exists(ObjectByXPath);
        context.Exists(ObjectCountByXPath);

        context.Missing(ArrayByXPath);
        context.Missing(ArrayCountByXPath);

        context.Missing(FieldByXPath);

        context.CheckValueInTreeMode(HelloValue, exists: false);
        context.CheckValueInTreeMode(WorldValue, exists: false);
        context.CheckValueInTreeMode(TestValue, exists: false);
    }

    private static void TestCodeStyleMode(this UITestContext context)
    {
        // This field is hidden, but its content reflects what's in the editor.
        var editorContent = JObject
            .Parse(context.Get(By.XPath($"//input[@class='jsonEditor__input']").OfAnyVisibility())
            .GetValue());

        ((string)editorContent["printThese"][0]).ShouldBe(HelloValue);
        ((string)editorContent["printThese"][1]).ShouldBe(WorldValue);
        ((string)editorContent[TestField]).ShouldBe(TestValue);
    }
}
