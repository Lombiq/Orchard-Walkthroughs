using System;

namespace Lombiq.Walkthroughs.Constants;

public static class ResourceNames
{
    private const string Prefix = FeatureIds.Area + ".";

    public const string Shepherd = Prefix + "shepherd.js";
    public const string Walkthroughs = nameof(Walkthroughs);

    [Obsolete("This resource name is no longer used.")]
    public const string ShepherdToWindow = "shepherd-to-window.js";
}
