using Atata;
using Lombiq.Tests.UI.Extensions;
using Lombiq.Tests.UI.Services;
using Newtonsoft.Json.Linq;
using OpenQA.Selenium;
using Shouldly;
using System.Threading.Tasks;

namespace Lombiq.Walkthroughs.Tests.UI.Extensions;

public static class TestCaseUITestContextExtensions
{
    public static async Task TestWalkthroughsBehaviorAsync(this UITestContext context)
    {
        const string welcomeStepQueryParameters = "shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=welcome";

        await context.EnableJsonEditorFeatureAsync();

        await context.ClickReliablyOnAsync(By.Id("walkthrough-selector-button"));
        context.WalkthroughWindowsShouldExist();

        await context.ClickOnNextButtonAsync();

        context.UriShouldContain(welcomeStepQueryParameters);
        context.WalkthroughWindowsShouldExist();

        await context.ClickOnNextButtonAsync();

        context.WalkthroughWindowsShouldExist();
        context.UriShouldContain("shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=setup_recipe");

        await context.ClickOnBackButtonAsync();
        context.WalkthroughWindowsShouldExist();

        context.UriShouldContain(welcomeStepQueryParameters);

        await context.SignInDirectlyAndGoToDashboardAsync();

        await context.GoToRelativeUrlAsync("admin?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=creating_article_dashboard");
    }

    private static Task ClickOnNextButtonAsync(this UITestContext context) =>
        context.ClickReliablyOnAsync(By.XPath($"//button[contains(@class, 'shepherd-button-primary')]"));

    private static Task ClickOnBackButtonAsync(this UITestContext context) =>
        context.ClickReliablyOnAsync(By.XPath($"//button[contains(@class, 'shepherd-button-secondary')]"));

    private static void WalkthroughWindowsShouldExist(this UITestContext context) =>
        context.Exists(By.XPath($"//div[@class='shepherd-content']"));

    private static void UriShouldContain(this UITestContext context, string shouldContain) =>
        context.GetCurrentUri().ToString().ShouldContain(shouldContain);

}
