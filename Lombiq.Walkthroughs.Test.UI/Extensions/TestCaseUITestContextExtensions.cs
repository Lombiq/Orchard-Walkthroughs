using Atata;
using Lombiq.Tests.UI.Extensions;
using Lombiq.Tests.UI.Services;
using OpenQA.Selenium;
using System.Threading.Tasks;

namespace Lombiq.Walkthroughs.Tests.UI.Extensions;

public static class TestCaseUITestContextExtensions
{
    public static async Task TestWalkthroughsBehaviorAsync(this UITestContext context)
    {
        const string adminTopMenuStepQueryParameters = "shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=admin_dashboard_top_menu";

        WalkthroughPopupShouldExist(context);

        await ClickOnNextButtonAsync(context);

        WalkthroughPopupShouldExist(context);

        await ClickOnNextButtonAsync(context);

        WalkthroughPopupShouldExist(context);

        await ClickOnBackButtonAsync(context);
        WalkthroughPopupShouldExist(context);

        await context.SignInDirectlyAndGoToDashboardAsync();

        await context.GoToRelativeUrlAsync("admin?" + adminTopMenuStepQueryParameters);
        WalkthroughPopupShouldExist(context);

        await ClickOnNextButtonAsync(context);
        WalkthroughPopupShouldExist(context);

        await ClickOnBackButtonAsync(context);
        WalkthroughPopupShouldExist(context);
    }

    // Just a selector on .shepherd-button-primary is not enough to find the button for some reason.
    private static Task ClickOnNextButtonAsync(UITestContext context) =>
        context.ClickReliablyOnAsync(By.XPath($"//button[contains(@class, 'shepherd-button-primary') and not(@id)]"));

    private static Task ClickOnBackButtonAsync(UITestContext context) =>
        context.ClickReliablyOnAsync(By.CssSelector(".shepherd-button-secondary"));

    private static void WalkthroughPopupShouldExist(UITestContext context) =>
        context.Exists(By.CssSelector(".shepherd-content"));
}
