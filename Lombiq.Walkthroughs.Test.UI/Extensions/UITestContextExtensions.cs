using Lombiq.Tests.UI.Extensions;
using Lombiq.Tests.UI.Services;
using System.Threading.Tasks;

namespace Lombiq.JsonEditor.Tests.UI.Extensions;

public static class UITestContextExtensions
{
    public static Task ExecuteJsonEditorSampleRecipeDirectlyAsync(this UITestContext context) =>
        context.ExecuteRecipeDirectlyAsync("Lombiq.JsonEditor.Sample");

    public static Task EnableJsonEditorFeatureAsync(this UITestContext context) =>
        context.EnableFeatureDirectlyAsync("Lombiq.JsonEditor");
}
