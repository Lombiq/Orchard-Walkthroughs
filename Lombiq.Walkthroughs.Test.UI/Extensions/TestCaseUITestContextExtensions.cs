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
        const string welcomeStepQueryParameters = "shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=welcome";
        const string adminTopMenuStepQueryParameters = "shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=admin_dashboard_top_menu";

        context.WalkthroughPopupShouldExist();

        await context.ClickOnNextButtonAsync();

        context.UriShouldContain(welcomeStepQueryParameters);
        context.WalkthroughPopupShouldExist();

        await context.ClickOnNextButtonAsync();

        context.WalkthroughPopupShouldExist();
        context.UriShouldContain("shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=setup_recipe");

        await context.ClickOnBackButtonAsync();
        context.WalkthroughPopupShouldExist();

        context.UriShouldContain(welcomeStepQueryParameters);

        await context.SignInDirectlyAndGoToDashboardAsync();

        await context.GoToRelativeUrlAsync("admin?" + adminTopMenuStepQueryParameters);
        context.WalkthroughPopupShouldExist();

        await context.ClickOnNextButtonAsync();
        context.WalkthroughPopupShouldExist();
        context.UriShouldContain("shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=creating_blog_post");

        await context.ClickOnBackButtonAsync();
        context.WalkthroughPopupShouldExist();

        context.UriShouldContain(adminTopMenuStepQueryParameters);
    }

    private static Task ClickOnNextButtonAsync(this UITestContext context) =>
        context.ClickReliablyOnAsync(By.XPath($"//button[contains(@class, 'shepherd-button-primary') and not(@id)]"));

    private static Task ClickOnBackButtonAsync(this UITestContext context) =>
        context.ClickReliablyOnAsync(By.XPath($"//button[contains(@class, 'shepherd-button-secondary')]"));

    private static void WalkthroughPopupShouldExist(this UITestContext context) =>
        context.Exists(By.XPath($"//div[@class='shepherd-content']"));

    private static void UriShouldContain(this UITestContext context, string shouldContain) =>
        context.GetCurrentUri().ToString().ShouldContain(shouldContain);
}
