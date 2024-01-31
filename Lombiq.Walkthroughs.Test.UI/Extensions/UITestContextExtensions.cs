using Lombiq.Tests.UI.Extensions;
using Lombiq.Tests.UI.Services;
using System.Threading.Tasks;

namespace Lombiq.Walkthroughs.Tests.UI.Extensions;

public static class UITestContextExtensions
{
    public static async Task RunSetupAndTestWalkthroughsBehaviorAsync(this UITestContext context)
    {
        await context.GoToSetupPageAndSetupOrchardCoreWithWalkthroughsRecipeAsync();
        await context.TestWalkthroughsBehaviorAsync();
    }

    public static Task GoToSetupPageAndSetupOrchardCoreWithWalkthroughsRecipeAsync(this UITestContext context) =>
        context.GoToSetupPageAndSetupOrchardCoreAsync("Lombiq.Walkthroughs.Setup");

    public static Task EnableWalkthroughsFeatureAsync(this UITestContext context) =>
        context.EnableFeatureDirectlyAsync("Lombiq.Walkthroughs");
}
