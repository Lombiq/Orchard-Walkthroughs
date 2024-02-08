using Atata;
using Lombiq.Tests.UI.Extensions;
using Lombiq.Tests.UI.Services;
using OpenQA.Selenium;
using Shouldly;
using System.Threading.Tasks;

namespace Lombiq.Walkthroughs.Tests.UI.Extensions;

public static class TestCaseUITestContextExtensions
{
    public static async Task TestWalkthroughsBehaviorAsync(this UITestContext context)
    {
        Task AssertStepAndClickNextAsync(string header, string text)
        {
            AssertStep(header, text);
            return ClickOnNextButtonAsync(context);
        }

        void AssertStep(string header, string text)
        {
            context.Get(By.CssSelector(".shepherd-header")).Text.ShouldContain(header);
            context.Get(By.CssSelector(".shepherd-text")).Text.ShouldContain(text);
        }

        await AssertStepAndClickNextAsync("Select walkthrough!", "Welcome! The Lombiq.Walkthroughs module is active.");
        await AssertStepAndClickNextAsync("Orchard Core Admin Walkthrough", "This walkthrough covers");

        // Also testing the back button.
        await AssertStepAndClickNextAsync("Setup recipe", "The setup recipe in");
        AssertStep("Site setup", "To get to this point");
        await ClickOnBackButtonAsync(context);
        await AssertStepAndClickNextAsync("Setup recipe", "The setup recipe in");
        await AssertStepAndClickNextAsync("Site setup", "To get to this point");
    }

    // Just a selector on .shepherd-button-primary is not enough to find the button for some reason.
    private static Task ClickOnNextButtonAsync(UITestContext context) =>
        context.ClickReliablyOnThenWaitForUrlChangeAsync(By.XPath($"//button[contains(@class, 'shepherd-button-primary') and not(@id)]"));

    private static Task ClickOnBackButtonAsync(UITestContext context) =>
        context.ClickReliablyOnThenWaitForUrlChangeAsync(By.CssSelector(".shepherd-button-secondary"));
}
