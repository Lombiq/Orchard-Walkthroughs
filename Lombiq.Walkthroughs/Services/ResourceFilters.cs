using Lombiq.HelpfulLibraries.OrchardCore.ResourceManagement;
using static Lombiq.Walkthroughs.Constants.ResourceNames;

namespace Lombiq.Walkthroughs.Services;

public class ResourceFilters : IResourceFilterProvider
{
    public void AddResourceFilter(ResourceFilterBuilder builder)
    {
        builder.Always().RegisterStylesheet(Shepherd);
        builder.Always().RegisterFootScript(Shepherd);
        builder.Always().RegisterFootScript("ShepherdQueryParameterHelpers");
        builder.Always().RegisterFootScript("OrchardCoreAdminWalkthrough");
        builder.Always().RegisterFootScript("Walkthroughs");
    }
}
