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

        // We can't set a minified CSS here, since the file comes from a node module and it's originally a CSS file already, thus we are not processing it (we only do that with SCSS). It's also somewhat minified by default so that's not a big issue.
        _manifest
            .DefineStyle(Shepherd)
            .SetUrl("~/" + FeatureIds.Area + "/shepherd.js/css/shepherd.css");

        _manifest
            .DefineScript(Shepherd)
            .SetUrl(
                "~/" + FeatureIds.Area + "/shepherd.js/js/shepherd.min.js",
                "~/" + FeatureIds.Area + "/shepherd.js/js/shepherd.js");

        _manifest
            .DefineScript(ResourceNames.Walkthroughs)
            .SetDependencies("jQuery")
            .SetUrl(
                "~/" + FeatureIds.Area + "/js/walkthroughs.min.js",
                "~/" + FeatureIds.Area + "/js/walkthroughs.js");
    }

    public void Configure(ResourceManagementOptions options) => options.ResourceManifests.Add(_manifest);
}
