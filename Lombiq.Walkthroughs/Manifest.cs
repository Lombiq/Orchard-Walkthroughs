using OrchardCore.Modules.Manifest;
using static Lombiq.Walkthroughs.Constants.FeatureIds;

[assembly: Module(
    Name = "Lombiq Walkthroughs",
    Author = "Lombiq Technologies",
    Version = "0.0.1",
    Description = "Module for enabling the walkthroughs.",
    Website = "https://github.com/Lombiq/"
)]

[assembly: Feature(
    Id = Default,
    Name = "Lombiq Walkthroughs",
    Category = "Content",
    Description = "Module for enabling the walkthroughs.",
    Dependencies = new[]
    {
        "OrchardCore.Contents",
        "OrchardCore.ResourceManagement",
    }
)]