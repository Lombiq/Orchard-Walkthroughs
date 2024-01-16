using Lombiq.Tests.UI.Extensions;
using Lombiq.Tests.UI.Services;
using System.Threading.Tasks;

namespace Lombiq.Walkthroughs.Tests.UI.Extensions;

public static class UITestContextExtensions
{
    public static Task EnableWalkthroughsFeatureAsync(this UITestContext context) =>
        context.EnableFeatureDirectlyAsync("Lombiq.Walkthroughs");
}
