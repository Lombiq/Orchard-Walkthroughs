using Microsoft.Extensions.Options;
using OrchardCore.ResourceManagement;

namespace Lombiq.Walkthroughs;

public class ResourceManagementOptionsConfiguration : IConfigureOptions<ResourceManagementOptions>
{
    private static readonly ResourceManifest _manifest = new();

    static ResourceManagementOptionsConfiguration() =>
        _manifest
            .DefineScript("shepherd.js")
            .SetUrl(
                "~/Lombiq.Walkthroughs/css/lombiq-privacy-consent-banner.min.css",
                "~/Lombiq.Walkthroughs/css/lombiq-privacy-consent-banner.css");

    public void Configure(ResourceManagementOptions options) => options.ResourceManifests.Add(_manifest);
}
