using Lombiq.HelpfulLibraries.OrchardCore.ResourceManagement;
using Lombiq.Walkthroughs.Filters;
using Lombiq.Walkthroughs.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using OrchardCore.Modules;
using OrchardCore.ResourceManagement;
using System;

namespace Lombiq.Walkthroughs;

public class Startup : StartupBase
{
    public override void ConfigureServices(IServiceCollection services)
    {
        services.AddTransient<IConfigureOptions<ResourceManagementOptions>, ResourceManagementOptionsConfiguration>();
        services.AddScoped<IResourceFilterProvider, ResourceFilters>();
        services.Configure<MvcOptions>(options => options.Filters.Add(typeof(WalkthroughsButtonFilter)));
    }

    public override void Configure(IApplicationBuilder app, IEndpointRouteBuilder routes, IServiceProvider serviceProvider) =>
        app.UseResourceFilters();
}
