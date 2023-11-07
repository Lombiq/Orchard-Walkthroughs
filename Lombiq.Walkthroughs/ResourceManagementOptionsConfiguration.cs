using Lombiq.Walkthroughs.Constants;
using Microsoft.Extensions.Options;
using OrchardCore.ResourceManagement;
using static Lombiq.Walkthroughs.Constants.ResourceNames;

namespace Lombiq.Walkthroughs;

public class ResourceManagementOptionsConfiguration : IConfigureOptions<ResourceManagementOptions>
{
    private static readonly ResourceManifest _manifest = new();

    static ResourceManagementOptionsConfiguration()
    {
        _manifest.DefineResource("$" + nameof(FeatureIds.Area), FeatureIds.Area);

        _manifest
            .DefineStyle(Shepherd)
            .SetUrl(
                "~/" + FeatureIds.Area + "/shepherd.js/css/shepherd.min.css",
                "~/" + FeatureIds.Area + "/shepherd.js/css/shepherd.css");

        _manifest
            .DefineScript(Shepherd)
            .SetUrl(
                "~/" + FeatureIds.Area + "/shepherd.js/js/shepherd.min.js",
                "~/" + FeatureIds.Area + "/shepherd.js/js/shepherd.js");

        _manifest
            .DefineScript("Tour")
            .SetUrl(
                "~/" + FeatureIds.Area + "/js/tour.min.js",
                "~/" + FeatureIds.Area + "/js/tour.js");
    }

    public void Configure(ResourceManagementOptions options) => options.ResourceManifests.Add(_manifest);
}
