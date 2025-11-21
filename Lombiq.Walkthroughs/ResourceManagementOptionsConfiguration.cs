using Lombiq.HelpfulLibraries.Attributes;
using Lombiq.Walkthroughs.Constants;
using Microsoft.Extensions.Options;
using OrchardCore.ResourceManagement;

namespace Lombiq.Walkthroughs;

[LibManVersions]
public partial class ResourceManagementOptionsConfiguration : IConfigureOptions<ResourceManagementOptions>
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
            .DefineStyle(ResourceNames.Shepherd)
            .SetUrl(Shepherd + "css/shepherd.min.css", Shepherd + "css/shepherd.css")
            .SetVersion(LibManVersions.ShepherdJs);

        _manifest
            .DefineScript(ResourceNames.Shepherd)
            .SetAttribute("type", "module")
            .SetUrl(Shepherd + "esm/shepherd.mjs")
            .SetVersion(LibManVersions.ShepherdJs);

        _manifest
            .DefineScript(ResourceNames.ShepherdToWindow)
            .SetAttribute("type", "module")
            .SetUrl(Js + "shepherd-to-window.js");

        _manifest
            .DefineScript(ResourceNames.Walkthroughs)
            .SetDependencies("jQuery")
            .SetUrl(Js + "walkthroughs.js");
    }

    public void Configure(ResourceManagementOptions options) => options.ResourceManifests.Add(_manifest);
}
