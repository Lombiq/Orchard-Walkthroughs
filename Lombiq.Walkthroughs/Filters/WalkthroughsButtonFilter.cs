using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using OrchardCore.ContentManagement;
using OrchardCore.DisplayManagement;
using OrchardCore.DisplayManagement.Layout;
using OrchardCore.Modules;
using System.Threading.Tasks;

namespace Lombiq.Walkthroughs.Filters;

public class WalkthroughsButtonFilter(
    IShapeFactory shapeFactory,
    ILayoutAccessor layoutAccessor) : IAsyncResultFilter
{
    public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
    {
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
            var layout = await layoutAccessor.GetLayoutAsync();
            var contentZone = layout.Zones["Content"];

            await contentZone.AddAsync(await shapeFactory.CreateAsync("WalkthroughsButton"), "0");
        }

        await next();
    }
}
