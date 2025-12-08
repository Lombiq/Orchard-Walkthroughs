using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using OrchardCore.DisplayManagement;
using OrchardCore.DisplayManagement.Layout;
using OrchardCore.Modules;
using System.Threading.Tasks;

namespace Lombiq.Walkthroughs.Filters;

public sealed class WalkthroughsButtonFilter : IAsyncResultFilter
{
    private readonly IShapeFactory _shapeFactory;
    private readonly ILayoutAccessor _layoutAccessor;

    public WalkthroughsButtonFilter(
        IShapeFactory shapeFactory,
        ILayoutAccessor layoutAccessor)
    {
        _shapeFactory = shapeFactory;
        _layoutAccessor = layoutAccessor;
    }

    public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
    {
        var layout = await _layoutAccessor.GetLayoutAsync();
        var contentZone = layout.Zones["Content"];
        await contentZone.AddAsync(await _shapeFactory.CreateAsync("WalkthroughsMeta"), "0");

        if (context.IsAdmin())
        {
            await next();
            return;
        }

        var actionRouteController = context.ActionDescriptor.RouteValues["Controller"];
        var actionRouteValue = context.ActionDescriptor.RouteValues["Action"];

        // These are BlogTheme specific.
        if (actionRouteController.EqualsOrdinalIgnoreCase("Item") &&
            actionRouteValue.EqualsOrdinalIgnoreCase("Display") &&
            context.Result is ViewResult viewResult &&
            ((string)(viewResult.Model as dynamic)?.ContentItem?.ContentType).EqualsOrdinalIgnoreCase("Blog"))
        {
            await contentZone.AddAsync(await _shapeFactory.CreateAsync("WalkthroughsButton"), "0");
        }

        await next();
    }
}
