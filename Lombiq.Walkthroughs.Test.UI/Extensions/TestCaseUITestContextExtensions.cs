using Atata;
using Lombiq.Tests.UI.Extensions;
using Lombiq.Tests.UI.Services;
using OpenQA.Selenium;
using Shouldly;
using System.Threading.Tasks;

namespace Lombiq.Walkthroughs.Tests.UI.Extensions;

public static class TestCaseUITestContextExtensions
{
    public static async Task TestWalkthroughsBehaviorAsync(this UITestContext context)
    {
        Task AssertStepAndClickNextAsync(string header, string text)
        {
            AssertStep(header, text);
            return ClickOnNextButtonAsync();
        }

        void AssertStep(string header, string text)
        {
            context.Get(By.CssSelector(".shepherd-header")).Text.ShouldContain(header);
            context.Get(By.CssSelector(".shepherd-text")).Text.ShouldContain(text);
        }

        // Just a selector on .shepherd-button-primary is not enough to find the button for some reason.
        Task ClickOnNextButtonAsync() =>
            context.ClickReliablyOnThenWaitForUrlChangeAsync(By.XPath($"//button[contains(@class, 'shepherd-button-primary') and not(@id)]"));

        Task ClickOnBackButtonAsync() =>
            context.ClickReliablyOnThenWaitForUrlChangeAsync(By.CssSelector(".shepherd-button-secondary"));

        // If you want to change or expand these steps, and don't want to start from the beginning every time, you can
        // log in the user and jump to a step right away like you can see below.
        //await context.SignInDirectlyAsync("testuser");
        //await context.GoToAdminRelativeUrlAsync("?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=creating_blog_post");

        await AssertStepAndClickNextAsync("Select walkthrough!", "Welcome! The Lombiq.Walkthroughs module is active.");
        await AssertStepAndClickNextAsync("Orchard Core Admin Walkthrough", "This walkthrough covers");

        // Also testing the back button.
        await AssertStepAndClickNextAsync("Setup recipe", "The setup recipe in");
        AssertStep("Site setup", "To get to this point");
        await ClickOnBackButtonAsync();
        await AssertStepAndClickNextAsync("Setup recipe", "The setup recipe in");
        await AssertStepAndClickNextAsync("Site setup", "To get to this point");

        // Login
        await AssertStepAndClickNextAsync("Log in", "Let's log in!");
        await AssertStepAndClickNextAsync("Log in page", "Here you can log in.");
        AssertStep("Username", "Provide your username.");
        await context.FillInWithRetriesAsync(By.Id("UserName"), "testuser"); // #spell-check-ignore-line
        await ClickOnNextButtonAsync();
        AssertStep("Password", "Provide your password.");
        await context.FillInWithRetriesAsync(By.Id("Password"), "Password1!");
        await ClickOnNextButtonAsync();
        AssertStep("Logging in", "Now you can log in!");
        await context.ClickReliablyOnSubmitAsync();
        await AssertStepAndClickNextAsync("Logged in", "Now you are logged in!");

        // Dashboard
        await AssertStepAndClickNextAsync("Admin dashboard", "Let's see the admin dashboard now!");
        await AssertStepAndClickNextAsync("Admin dashboard", "Welcome to the admin dashboard!");
        await AssertStepAndClickNextAsync("Side menu", "This is the side menu");
        await AssertStepAndClickNextAsync("Top menu", "This is the top menu.");

        // Blog
        AssertStep("Creating a new blog post", "Let's create a new blog post!");
        await context.ClickReliablyOnByLinkTextAsync("Blog");
        await AssertStepAndClickNextAsync("Blog posts", "Here you can see the blog posts inside the blog.");
        AssertStep("Creating a new blog post", "Click here to create a new blog post.");
        await context.ClickReliablyOnByLinkTextAsync("Create Blog Post");

        // Blog Post editor
        await AssertStepAndClickNextAsync("Creating a new blog post", "Here is the editor of your new blog post.");
        await AssertStepAndClickNextAsync("Title", "Let's give it a title!");
        await context.FillContentItemTitleAsync("Sample Blog Post");
        await AssertStepAndClickNextAsync("Permalink", "You can give the blog post an URL by hand");
        AssertStep("Markdown editor", "This is the editor where you can write");
        await context.FillInCodeMirrorEditorWithRetriesAsync(
            By.CssSelector(".CodeMirror.cm-s-easymde.CodeMirror-wrap"), "Hello world."); // #spell-check-ignore-line
        await ClickOnNextButtonAsync();
        AssertStep("Subtitle", "You can also give a subtitle to your blog post.");
        await context.FillInWithRetriesAsync(By.Id("BlogPost_Subtitle_Text"), "Sample subtitle");
        await ClickOnNextButtonAsync();
        await AssertStepAndClickNextAsync("Banner image", "You can add an image to your blog post");
        await AssertStepAndClickNextAsync("Tags", "You can add tags to your blog post");
        await AssertStepAndClickNextAsync("Category", "You can also select the category of your blog post.");
        await AssertStepAndClickNextAsync("Preview", "Before publishing your blog post");
        AssertStep("Publishing", "We are ready, let's publish the blog post");
        await context.ClickPublishAsync();

        // Blog Post display
        AssertStep("Viewing the blog post", "The blog post is published, good job!");
        await context.ClickReliablyOnByLinkTextAsync("View");
        context.SwitchToLastWindow();
        await AssertStepAndClickNextAsync("Viewing the blog post", "Here is your published blog post");

        // Article
        AssertStep("Creating a new article", "Now let's create an article!");
        await context.ClickReliablyOnAsync(By.ClassName("navbar-brand"));
        await AssertStepAndClickNextAsync("Creating a new article", "Just as the Blog Post content type");
        AssertStep("Creating a new article", "Click on the \"Content\" dropdown.");
        await context.ClickReliablyOnByLinkTextAsync("Content");
        AssertStep("Creating a new article", "Now click on the \"Content Types\" dropdown");
        await context.ClickReliablyOnByLinkTextAsync("Content Types");
        AssertStep("Creating a new article", "Here we have the article content type.");
        await context.ClickReliablyOnByLinkTextAsync("Article");
        await AssertStepAndClickNextAsync("Creating a new article", "Here you can see all the articles.");
        AssertStep("Creating a new article", "Click here to create a new article.");
        await context.ClickReliablyOnByLinkTextAsync("New Article");

        // Article editor
        await AssertStepAndClickNextAsync("Creating a new article", "Here you can create the article.");
        await AssertStepAndClickNextAsync("Title", "Let's give it a title!");
        await context.FillContentItemTitleAsync("Sample article");
        await AssertStepAndClickNextAsync("Permalink", "Again, you can provide a URL");
        await AssertStepAndClickNextAsync("Set as homepage", "You can set this article as the homepage.");
        await AssertStepAndClickNextAsync("HTML Body", "This is the HTML Body, where");
        await AssertStepAndClickNextAsync("Subtitle", "You can set the subtitle of your article too.");
        await AssertStepAndClickNextAsync("Banner image", "You can add a banner image to your article too.");
        await AssertStepAndClickNextAsync("Preview", "Before publishing your article,");
        AssertStep("Publishing", "We are ready, let's publish the article!");
        await context.ClickPublishAsync();

        // Article display
        AssertStep("Viewing the article", "The article is now published.");
        await context.ClickReliablyOnByLinkTextAsync("View");
        context.SwitchToLastWindow();
        await AssertStepAndClickNextAsync("Viewing the article", "Here is you published article.");

        // Managing the menu
        AssertStep("Managing the menu", "The sample article that was created from");
        await context.ClickReliablyOnByLinkTextAsync("ABOUT");
        await AssertStepAndClickNextAsync("Managing the menu", "As you can see, you can easily access");
        AssertStep("Managing the menu", "Click on the \"Main Menu\" link.");
        await context.ClickReliablyOnByLinkTextAsync("Main Menu");
        await AssertStepAndClickNextAsync("Managing the menu", "Here you can see the menu's editor");
        AssertStep("Managing the menu", "Let's add a menu item for the new article we created!");
        await context.ClickReliablyOnAsync(By.XPath("//button[normalize-space() = 'Add Menu Item']"));
        // The overlay on the overlay of the menu item type selector is strange, including that its text can't be
        // highlighted in the browser. Its buttons can't be clicked with ClickReliablyAsync() so we need to do this.
        AssertStep("Managing the menu", "You can choose between multiple types of menu items.");
        var originalUri = context.GetCurrentUri();
        context.Get(By.XPath($"//button[contains(@class, 'shepherd-button-primary') and not(@id)]")).Click();
        context.DoWithRetriesOrFail(() => context.GetCurrentUri() != originalUri);
        AssertStep("Managing the menu", "For now, let's go with the Link Menu Item one.");

        // Adding a menu item
        await context.ClickReliablyOnByLinkTextAsync("Add");
        AssertStep("Managing the menu", "Let's give the menu item a name!");
        await context.FillInWithRetriesAsync(By.Id("LinkMenuItemPart_Name"), "Sample article");
        await ClickOnNextButtonAsync();
        AssertStep("Managing the menu", "Let's give it your article's URL!");
        await context.FillInWithRetriesAsync(By.Id("LinkMenuItemPart_Url"), "~/sample-article");
        await ClickOnNextButtonAsync();
        AssertStep("Managing the menu", "We are ready, let's publish the menu item!");
        await context.ClickPublishAsync();
        await AssertStepAndClickNextAsync("Managing the menu", "Your new menu item is now here.");
        AssertStep("Managing the menu", "You will also need to publish the menu itself too.");
        await context.ClickPublishAsync();
        await AssertStepAndClickNextAsync("Managing the menu", "Your article is now linked from the menu.");
        await AssertStepAndClickNextAsync("Managing the menu", "The new menu item should appear up here.");

        // Content list
        await AssertStepAndClickNextAsync("Content list", "Now let's go back to the admin dashboard!");
        return;
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
    }
}
