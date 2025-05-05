using Lombiq.HelpfulLibraries.OrchardCore.ResourceManagement;
using Lombiq.Walkthroughs.Constants;
using Lombiq.Walkthroughs.Filters;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using OrchardCore.Modules;
using OrchardCore.ResourceManagement;
using System;
using static Lombiq.Walkthroughs.Constants.ResourceNames;

namespace Lombiq.Walkthroughs;

public sealed class Startup : StartupBase
{
    public override void ConfigureServices(IServiceCollection services)
    {
        services.AddTransient<IConfigureOptions<ResourceManagementOptions>, ResourceManagementOptionsConfiguration>();
        services.AddResourceFilter(builder => builder.Always()
            .RegisterStylesheet(Shepherd)
            .RegisterFootScript(Shepherd)
            .RegisterFootScript(ResourceNames.Walkthroughs)
            .RegisterFootScript(ShepherdToWindow));
        services.Configure<MvcOptions>(options => options.Filters.Add(typeof(WalkthroughsButtonFilter)));
    }

    public override void Configure(IApplicationBuilder app, IEndpointRouteBuilder routes, IServiceProvider serviceProvider) =>
        app.UseResourceFilters();
}
