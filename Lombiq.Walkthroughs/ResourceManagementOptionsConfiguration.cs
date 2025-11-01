using Lombiq.Walkthroughs.Constants;
using Microsoft.Extensions.Options;
using OrchardCore.ResourceManagement;
using static Lombiq.Walkthroughs.Constants.ResourceNames;

namespace Lombiq.Walkthroughs;

public class ResourceManagementOptionsConfiguration : IConfigureOptions<ResourceManagementOptions>
{
    private const string Module = $"~/{FeatureIds.Area}/";
    private const string Vendors = Module + "vendors/";
    private const string Shepherd = Vendors + "shepherd.js/dist/";
    private const string Js = Module + "js/";

    private static readonly ResourceManifest _manifest = new();

    static ResourceManagementOptionsConfiguration()
    {
        _manifest.DefineResource("$" + nameof(FeatureIds.Area), FeatureIds.Area);

        _manifest
            .DefineStyle(Shepherd)
            .SetUrl(Shepherd + "css/shepherd.min.css", Shepherd + "css/shepherd.css");

        _manifest
            .DefineScript(Shepherd)
            .SetAttribute("type", "module")
            .SetUrl(Shepherd + "esm/shepherd.mjs");

        _manifest
            .DefineScript(ShepherdToWindow)
            .SetAttribute("type", "module")
            .SetUrl(Js + "shepherd-to-window.js");

        _manifest
            .DefineScript(ResourceNames.Walkthroughs)
            .SetDependencies("jQuery")
            .SetUrl(Js + "walkthroughs.js");
    }

    public void Configure(ResourceManagementOptions options) => options.ResourceManifests.Add(_manifest);
}
