using Atata;
using Lombiq.Tests.UI.Extensions;
using Lombiq.Tests.UI.Services;
using OpenQA.Selenium;
using Shouldly;
using System;
using System.Threading.Tasks;

namespace Lombiq.Walkthroughs.Tests.UI.Extensions;

public static class TestCaseUITestContextExtensions
{
    private static readonly By _byShepherdTarget = By.ClassName("shepherd-target");

    public static async Task TestWalkthroughsBehaviorAsync(this UITestContext context)
    {
        Task AssertStepAndClickNextAsync(string header, string text, bool assertShepherdTargetExists = true)
        {
            AssertStep(header, text, assertShepherdTargetExists);
            return ClickOnNextButtonAsync();
        }

        Task AssertStepAndClickShepherdTargetAsync(string header, string text, bool assertShepherdTargetExists = true)
        {
            AssertStep(header, text, assertShepherdTargetExists);
            return ClickShepherdTargetAsync();
        }

        void AssertStep(string header, string text, bool assertShepherdTargetExists = true)
        {
            context.Get(By.CssSelector(".shepherd-header")).Text.ShouldContain(header);
            context.Get(By.CssSelector(".shepherd-text")).Text.ShouldContain(text);
            if (assertShepherdTargetExists) context.Exists(_byShepherdTarget);
        }

        Task ClickShepherdTargetAsync() => context.ClickReliablyOnThenWaitForUrlChangeAsync(_byShepherdTarget);

        Task FillInShepherdTargetWithRetriesAsync(string text) => context.FillInWithRetriesAsync(_byShepherdTarget, text);

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
        AssertStep("Content list", "Click on the \"Content\" dropdown.");
        AssertStep("Content list", "Now click on the \"Content Items\" button.");
        await AssertStepAndClickNextAsync("Content list", "Notice how we can see");
        AssertStep("Content listing", "Click on the \"Content\" dropdown.");
        await context.ClickReliablyOnByLinkTextAsync("Content");
        AssertStep("Content listing", "Now click on the \"Content Items\" button.");
        await context.ClickReliablyOnByLinkTextAsync("Content Items");
        await AssertStepAndClickNextAsync("Content listing", "Notice how we can see");

        // Taxonomies
        await AssertStepAndClickNextAsync("Taxonomies", "We'll now see how to use the Taxonomies module");
        await AssertStepAndClickNextAsync("Taxonomies", "You can access this list by filtering");
        AssertStep("Taxonomies", "Let's see how we can edit taxonomies!");
        await context.ClickReliablyOnByLinkTextAsync("Edit");
        AssertStep("Taxonomies", "You can add a new category by clicking here.");
        await context.ClickReliablyOnByLinkTextAsync("Add Category");
        await AssertStepAndClickNextAsync("Taxonomies", "You can name your category.");
        await context.FillContentItemTitleAsync("Sample category");
        AssertStep("Taxonomies", "You can select an icon for the category.");
        await context.ClickReliablyOnAsync(By.Id("Category_Icon"));
        await context.ClickReliablyOnAsync(By.ClassName("iconpicker-item"));
        await ClickOnNextButtonAsync();
        await AssertStepAndClickNextAsync("Taxonomies", "And you can set a permalink for it");
        AssertStep("Taxonomies", "Let's publish the new category! ");
        await context.ClickPublishAsync();
        AssertStep("Taxonomies", "Your category is now published.");
        await context.ClickPublishAsync();

        // Media management
        await AssertStepAndClickNextAsync("Media management", "We're now done with Taxonomies.");
        AssertStep("Media management", "Click on the \"Content\" dropdown.");
        await context.ClickReliablyOnByLinkTextAsync("Content");
        AssertStep("Media management", "Now click on the \"Media Library\" button.");
        await context.ClickReliablyOnByLinkTextAsync("Media Library");
        await AssertStepAndClickNextAsync("Media management", "This is the media library.");
        await AssertStepAndClickNextAsync("Media management", "You can edit the files' names, delete, and view them.");
        await AssertStepAndClickNextAsync("Media management", "You can see the different folders here");
        await AssertStepAndClickNextAsync("Media management", "You can filter files by their name here.");
        await AssertStepAndClickNextAsync("Media management", "You can upload new files here.");
        await AssertStepAndClickNextAsync("Media management", "New files you upload will show up");

        // Flow Part
        AssertStep("Flow Part", "This was our intro to the Media Library.");
        await context.ClickReliablyOnByLinkTextAsync("Content");
        AssertStep("Flow Part", "Now click on the \"Content Items\" button.");
        await context.ClickReliablyOnByLinkTextAsync("Content Items");
        AssertStep("Flow Part", "We'll create a new Page content item.");
        await context.ClickReliablyOnAsync(By.XPath("//button[normalize-space() = 'New']"));
        AssertStep("Flow Part", "Click on \"Page\" to create a new page.");
        await context.ClickReliablyOnByLinkTextAsync("Page");
        AssertStep("Flow Part", "You can give it a title, just like");
        await context.FillContentItemTitleAsync("Sample page");
        await ClickOnNextButtonAsync();
        await AssertStepAndClickNextAsync("Flow Part", "Surely you know the drill");
        await AssertStepAndClickNextAsync("Flow Part", "The page has a part called \"Flow Part\".");
        AssertStep("Flow Part", "You will see the different widgets here");
        await context.ClickReliablyOnAsync(By.XPath("//button[@title='Add Widget']"));
        AssertStep("Flow Part", "Let's add a blockquote, for example!");
        await context.ClickReliablyOnByLinkTextAsync("Blockquote");
        await AssertStepAndClickNextAsync("Flow Part", "Now you added the blockquote to your page.");
        AssertStep("Flow Part", "Click on the dropdown to edit it!");
        await context.ClickReliablyOnAsync(By.ClassName("shepherd-target"));
        AssertStep("Flow Part", "Can you think of a good quote?");
        await context.FillInWithRetriesAsync(By.Id("FlowPart-0_Blockquote_Quote_Text"), "Sample blockquote");
        await ClickOnNextButtonAsync();
        AssertStep("Flow Part", "We are ready, let's publish the page!");
        await context.ClickPublishAsync();
        AssertStep("Viewing the page", "The page is published!");
        await context.ClickReliablyOnByLinkTextAsync("View");
        context.SwitchToLastWindow();
        await AssertStepAndClickNextAsync("Viewing the page", "Here is you published page with the blockquote.");

        // Layout widgets
        AssertStep("Layout widgets", "The fun with widgets doesn't stop here!");
        await context.ClickReliablyOnAsync(By.ClassName("navbar-brand"));
        await AssertStepAndClickNextAsync("Layout widgets", "Go to the admin dashboard by clicking");
        AssertStep("Layout widgets", "Click on the \"Design\" dropdown.");
        await context.ClickReliablyOnByLinkTextAsync("Design");
        AssertStep("Layout widgets", "Now click on the \"Widgets\" menu item.");
        await context.ClickReliablyOnByLinkTextAsync("Widgets");
        await AssertStepAndClickNextAsync("Layout widgets", "These are the layout zones.");
        await AssertStepAndClickNextAsync("Layout widgets", "Widgets are put not just into zones,");
        await AssertStepAndClickShepherdTargetAsync("Layout widgets", "Let's add a widget to the content zone!");
        await AssertStepAndClickShepherdTargetAsync("Layout widgets", "Now click on \"Paragraph\"");
        AssertStep("Layout widgets", "Give it a title.");
        await FillInShepherdTargetWithRetriesAsync("Sample paragraph widget");
        await ClickOnNextButtonAsync();
        await AssertStepAndClickNextAsync("Layout widgets", "Give it some content.");
        await AssertStepAndClickShepherdTargetAsync("Layout widgets", "We are ready, let's publish it!");
        await AssertStepAndClickShepherdTargetAsync("Layout widgets", "Your paragraph widget is now published.");
        // In Orchard Core 1.8 this link doesn't open a new tab anymore so this will need to be removed after an Orchard
        // upgrade.
        context.SwitchToLastWindow();
        await AssertStepAndClickNextAsync("Layout widgets", "You should see your paragraph if you scroll down.");

        // Content type editor
        await AssertStepAndClickNextAsync("Content type editor", "We'll now take a look at how the sausage is made!");
        await AssertStepAndClickShepherdTargetAsync("Content type editor", "Click on the \"Content\" dropdown.");
        await AssertStepAndClickShepherdTargetAsync("Content type editor", "Now click on the \"Content Definition\" dropdown.");
        await AssertStepAndClickShepherdTargetAsync("Content type editor", "Click on the \"Content Types\" button.");
        await AssertStepAndClickNextAsync("Content type editor", "Here you can see and edit all the content types.");
        await AssertStepAndClickShepherdTargetAsync("Content type editor", "Let's edit the Blog Post content type");
        await AssertStepAndClickNextAsync("Content type editor", "Here you can see the content type's editor.");
        await AssertStepAndClickShepherdTargetAsync("Content type editor", "You can add a new field by clicking here.");
        AssertStep("Content type editor", "Let's suppose that you're writing a travel blog");
        await FillInShepherdTargetWithRetriesAsync("Sample field");
        await ClickOnNextButtonAsync();
        await AssertStepAndClickShepherdTargetAsync("Content type editor", "Select Text Field.");
        await ClickOnNextButtonAsync();
        await AssertStepAndClickShepherdTargetAsync("Content type editor", "Okay, now save it.");
        await AssertStepAndClickShepherdTargetAsync("Content type editor", "Now let's edit the text field to see");
        await AssertStepAndClickNextAsync("Content type editor", "Most of the options are well explained.");
        await AssertStepAndClickNextAsync("Content type editor", "You can select the editor type here.");
        await AssertStepAndClickNextAsync("Content type editor", "You can also select the display mode here.");
        await AssertStepAndClickShepherdTargetAsync("Content type editor", "Okay, now save it.");
        await AssertStepAndClickShepherdTargetAsync("Content type editor", "The text field is now saved. You will also");
        await AssertStepAndClickNextAsync("Content type editor", "Congratulations, you just tinkered with what's");

        // Audit Trail
        await AssertStepAndClickNextAsync("Audit Trail", "The Audit Trail module provides an immutable");
        await AssertStepAndClickShepherdTargetAsync("Audit Trail", "Click on \"Configuration\".");
        await AssertStepAndClickShepherdTargetAsync("Audit Trail", "Click on \"Settings\".");
        await AssertStepAndClickShepherdTargetAsync("Audit Trail", "Click on \"Audit Trail\".");
        await AssertStepAndClickNextAsync("Audit Trail", "Here you can see and turn on or off all the events");
        await AssertStepAndClickShepherdTargetAsync("Audit Trail", "Click here to see the trimming settings.");

        // For some reason, clicking Next on this step is flaky, so need to retry.
        var trimmingStepLeft = false;
        var trimmingStepLeaveAttemptIndex = 0;
        while (!trimmingStepLeft)
        {
            try
            {
                await AssertStepAndClickNextAsync("Audit Trail", "To not let the Audit Trail database grow indefinitely");
                trimmingStepLeft = true;
            }
            catch (TimeoutException)
            {
                trimmingStepLeaveAttemptIndex++;

                // False alarm: https://github.com/SonarSource/sonar-dotnet/issues/8736.
#pragma warning disable S2583 // Conditionally executed code should be reachable
                if (trimmingStepLeaveAttemptIndex == 5)
                {
                    throw new TimeoutException(
                        "Attempting to leave the Trimming tab of the Audit Trail didn't succeed even after 5 attempts.");
                }
#pragma warning restore S2583 // Conditionally executed code should be reachable
            }
        }

        await AssertStepAndClickShepherdTargetAsync("Audit Trail", "Click here to see the content types whose events");
        await AssertStepAndClickNextAsync("Audit Trail", "These are the content whose events are currently recorded.");
        await AssertStepAndClickShepherdTargetAsync("Audit Trail", "Now let's see how we can see the details of the");
        await AssertStepAndClickNextAsync("Audit Trail", "Here you can see all the recorded events.");

        // User management
        await AssertStepAndClickShepherdTargetAsync("User management", "It's too quiet if you're alone in your Orchard");
        await AssertStepAndClickShepherdTargetAsync("User management", "This menu contains all security and role-based");
        await AssertStepAndClickNextAsync("User management", "Here you can see all the users, including");
        await AssertStepAndClickShepherdTargetAsync("User management", "You can edit existing users and add add new");
        AssertStep("User management", "Think of someone you like so much you want them in your Orchard Core app");
        await FillInShepherdTargetWithRetriesAsync("sample.user");
        await ClickOnNextButtonAsync();
        AssertStep("User management", "Add their e-mail address.");
        await FillInShepherdTargetWithRetriesAsync("sample.user@example.com");
        await ClickOnNextButtonAsync();
        await AssertStepAndClickNextAsync("User management", "You can enter a phone number too, but it's optional.");
        await AssertStepAndClickNextAsync("User management", "You can disable the user, though for a new one this");
        AssertStep("User management", "You can enter a password or generate a strong one automatically.");
        await context.ClickReliablyOnAsync(By.ClassName("password-generator-button"));
        await ClickOnNextButtonAsync();
        await AssertStepAndClickNextAsync("User management", "Finally, you can select one or more roles for the user.");
        // Without this it won't find the Save button to click on.
        context.ScrollTo(_byShepherdTarget);
        await AssertStepAndClickShepherdTargetAsync("User management", "We are ready, let's publish the user!");
        await AssertStepAndClickNextAsync("User management", "You should see the newly created user here.");

        // Roles
        await AssertStepAndClickShepherdTargetAsync("Roles", "Since you're surely curious about those roles");
        await AssertStepAndClickShepherdTargetAsync("Roles", "Now click on \"Roles\".");
        await AssertStepAndClickNextAsync("Roles", "Here you can see all the existing roles and edit their");
        await AssertStepAndClickShepherdTargetAsync("Roles", "Let's see one! Click on the \"Edit\" button.");
        await AssertStepAndClickNextAsync("Roles", "A role is a collection of permissions that the user has.");
        await AssertStepAndClickShepherdTargetAsync("Roles", "Not much to tune on this role, but click on the \"Save\"");
        await AssertStepAndClickNextAsync("Roles", "If you change permissions of a role, then");

        // Deployment
        await AssertStepAndClickNextAsync("Deployment", "Let's take a look at exporting and importing,");
        return;
        await AssertStepAndClickNextAsync("Deployment", "");
        await AssertStepAndClickNextAsync("Deployment", "");
        await AssertStepAndClickNextAsync("Deployment", "");
        await AssertStepAndClickNextAsync("Deployment", "");
        await AssertStepAndClickNextAsync("Deployment", "");
        await AssertStepAndClickNextAsync("Deployment", "");
        await AssertStepAndClickNextAsync("Deployment", "");
        await AssertStepAndClickNextAsync("Deployment", "");
        await AssertStepAndClickNextAsync("Deployment", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
        await AssertStepAndClickNextAsync("", "");
    }
}
