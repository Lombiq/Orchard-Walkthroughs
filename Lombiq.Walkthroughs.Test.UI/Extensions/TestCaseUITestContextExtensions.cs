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
    private const string _shepherdTargetClass = "shepherd-target";
    private static readonly By _byShepherdTarget = By.ClassName(_shepherdTargetClass);
    private static readonly By _byShepherdTargetNotBody = By.CssSelector("*:not(body)." + _shepherdTargetClass);

    public static async Task TestWalkthroughsBehaviorAsync(this UITestContext context)
    {
        Task AssertStepAndClickNextAsync(string header, string text, bool assertShepherdTargetIsNotBody = true)
        {
            AssertStep(header, text, assertShepherdTargetIsNotBody);
            return ClickOnNextButtonAsync();
        }

        Task AssertStepAndClickShepherdTargetAsync(string header, string text, bool assertShepherdTargetIsNotBody = true)
        {
            AssertStep(header, text, assertShepherdTargetIsNotBody);
            return ClickShepherdTargetAsync();
        }

        async Task AssertStepAndFillInShepherdTargetAndClickNextAsync(
            string header,
            string text,
            string targetText,
            bool assertShepherdTargetIsNotBody = true)
        {
            AssertStep(header, text, assertShepherdTargetIsNotBody);
            await FillInShepherdTargetWithRetriesAsync(targetText);
            await ClickOnNextButtonAsync();
        }

        void AssertStep(string header, string text, bool assertShepherdTargetIsNotBody = true)
        {
            context.Get(By.CssSelector(".shepherd-header")).Text.ShouldContain(header);
            context.Get(By.CssSelector(".shepherd-text")).Text.ShouldContain(text);
            context.Exists(assertShepherdTargetIsNotBody ? _byShepherdTargetNotBody : _byShepherdTarget);
        }

        Task ClickShepherdTargetAsync() => context.ClickReliablyOnUntilUrlChangeAsync(_byShepherdTarget);

        Task FillInShepherdTargetWithRetriesAsync(string text) => context.FillInWithRetriesAsync(_byShepherdTarget, text);

        // Just a selector on .shepherd-button-primary is not enough to find the button for some reason.
        Task ClickOnNextButtonAsync() =>
            context.ClickReliablyOnUntilUrlChangeAsync(By.XPath($"//button[contains(@class, 'shepherd-button-primary') and not(@id)]"));

        Task ClickOnBackButtonAsync() =>
            context.ClickReliablyOnUntilUrlChangeAsync(By.CssSelector(".shepherd-button-secondary"));

        void SwitchToLastWindowAndSetDefaultBrowserSize()
        {
            context.SwitchToLastWindow();
            // The new tab will open in a small size when in headless mode.
            context.SetDefaultBrowserSize();
        }

        // If you want to change or expand these steps, and don't want to start from the beginning every time, you can
        // jump to a step right away with the URLs you can see below at the beginning of each section (you'll need to
        // temporarily comment out the steps before it. For most of the steps you'll also need to sign in with the below
        // shortcut.
        ////await context.SignInDirectlyAsync("testuser"); // #spell-check-ignore-line

        // The below steps could be split into multiple tests, one for each section. For now, this would only bring some
        // performance benefit if any of the steps fail (because then not the whole tests would need to be retried) but
        // these shouldn't be too flaky (with the reliability features for each command) anyway. Otherwise, there would
        // be a large overhead starting multiple tests, even if launching them from the same setup snapshot. With xUnit
        // 3 and it bringing parallelization within test classes too, this would matter more.

        // Introduction
        await context.ExecuteLoggedAsync(
            "Introduction",
            async () =>
            {
                await AssertStepAndClickNextAsync(
                    "Select walkthrough!", "Welcome! The Lombiq.Walkthroughs", assertShepherdTargetIsNotBody: false);
                await AssertStepAndClickNextAsync(
                    "Orchard Core Admin Walkthrough", "This walkthrough covers", assertShepherdTargetIsNotBody: false);

                // Also testing the back button.
                await AssertStepAndClickNextAsync("Setup recipe", "The setup recipe in", assertShepherdTargetIsNotBody: false);
                AssertStep("Site setup", "To get to this point", assertShepherdTargetIsNotBody: false);
                await ClickOnBackButtonAsync();
                await AssertStepAndClickNextAsync("Setup recipe", "The setup recipe in", assertShepherdTargetIsNotBody: false);
                await AssertStepAndClickNextAsync("Site setup", "To get to this point", assertShepherdTargetIsNotBody: false);
            });

        // Login
        await context.ExecuteLoggedAsync(
            "Login",
            async () =>
            {
                ////await context.GoToRelativeUrlAsync("/?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=logging_in");
                await AssertStepAndClickNextAsync("Log in", "Let's log in!", assertShepherdTargetIsNotBody: false);
                await AssertStepAndClickNextAsync("Log in page", "Here you can log in.", assertShepherdTargetIsNotBody: false);
                await AssertStepAndFillInShepherdTargetAndClickNextAsync(
                    "Username", "Provide your username.", "testuser"); // #spell-check-ignore-line
                await AssertStepAndFillInShepherdTargetAndClickNextAsync("Password", "Provide your password.", "Password1!");
                await AssertStepAndClickShepherdTargetAsync("Logging in", "Now you can log in!");
                await AssertStepAndClickNextAsync("Logged in", "Now you are logged in!", assertShepherdTargetIsNotBody: false);
            });

        // Dashboard
        await context.ExecuteLoggedAsync(
            "Dashboard",
            async () =>
            {
                ////await context.GoToRelativeUrlAsync("/?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=admin_dashboard_enter");
                await AssertStepAndClickNextAsync("Admin dashboard", "Let's see the admin dashboard now!", assertShepherdTargetIsNotBody: false);
                await AssertStepAndClickNextAsync("Admin dashboard", "Welcome to the admin dashboard!", assertShepherdTargetIsNotBody: false);
                await AssertStepAndClickNextAsync("Side menu", "This is the side menu");
                await AssertStepAndClickNextAsync("Top menu", "This is the top menu.");
            });

        // Blog
        await context.ExecuteLoggedAsync(
            "Blog",
            async () =>
            {
                await context.GoToAdminRelativeUrlAsync("?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=creating_blog_post");
                await AssertStepAndClickShepherdTargetAsync("Creating a new blog post", "Let's create a new blog post!");
                await AssertStepAndClickNextAsync("Blog posts", "Here you can see the blog posts inside the blog.");
                await AssertStepAndClickShepherdTargetAsync("Creating a new blog post", "Click here to create a new blog post.");
            });

        // Blog Post editor
        await context.ExecuteLoggedAsync(
            "Blog Post editor",
            async () =>
            {
                // The ID of the blog will be random, so we can't have a start URL here.
                await AssertStepAndClickNextAsync(
                    "Creating a new blog post", "Here is the editor of your new blog post.", assertShepherdTargetIsNotBody: false);
                await AssertStepAndFillInShepherdTargetAndClickNextAsync("Title", "Let's give it a title!", "Sample Blog Post");
                await AssertStepAndClickNextAsync("Permalink", "You can give the blog post an URL by hand");
                await AssertStepAndClickNextAsync("Markdown editor", "This is the editor where you can write");
                await AssertStepAndFillInShepherdTargetAndClickNextAsync(
                    "Subtitle", "You can also give a subtitle to your blog post.", "Sample subtitle");
                await AssertStepAndClickNextAsync("Banner image", "You can add an image to your blog post");
                await AssertStepAndClickNextAsync("Tags", "You can add tags to your blog post");
                await AssertStepAndClickNextAsync("Category", "You can also select the category of your blog post.");
                await AssertStepAndClickNextAsync("Preview", "Before publishing your blog post");
                await AssertStepAndClickShepherdTargetAsync("Publishing", "We are ready, let's publish the blog post");
            });

        // Blog Post display
        await context.ExecuteLoggedAsync(
            "Blog Post display",
            async () =>
            {
                // The ID of the blog will be random, so we can't have a start URL here.
                AssertStep("Viewing the blog post", "The blog post is published, good job!");
                // The URL is not changing here so can't use ClickShepherdTargetAsync().
                await context.ClickReliablyOnAsync(_byShepherdTarget);
                SwitchToLastWindowAndSetDefaultBrowserSize();
                await AssertStepAndClickNextAsync(
                    "Viewing the blog post", "Here is your published blog post", assertShepherdTargetIsNotBody: false);
            });

        // Article introduction
        await context.ExecuteLoggedAsync(
            "Article introduction",
            async () =>
            {
                ////await context.GoToRelativeUrlAsync("/?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=creating_article_intermediate_step");
                await AssertStepAndClickShepherdTargetAsync("Creating a new article", "Now let's create an article!");
                await AssertStepAndClickNextAsync(
                    "Creating a new article", "Just as the Blog Post content type", assertShepherdTargetIsNotBody: false);
                await AssertStepAndClickShepherdTargetAsync("Creating a new article", "Click on the \"Content\" dropdown.");
                await AssertStepAndClickShepherdTargetAsync("Creating a new article", "Now click on the \"Content Types\" dropdown");
                await AssertStepAndClickShepherdTargetAsync("Creating a new article", "Here we have the article content type.");
                await AssertStepAndClickNextAsync("Creating a new article", "Here you can see all the articles.");
                await AssertStepAndClickShepherdTargetAsync("Creating a new article", "Click here to create a new article.");
            });

        // Article editor
        await context.ExecuteLoggedAsync(
            "Article editor",
            async () =>
            {
                ////await context.GoToAdminRelativeUrlAsync(
                ////    "/Contents/ContentTypes/Article/Create?returnUrl=%2FAdmin%2FContents%2FContentItems" + // #spell-check-ignore-line
                ////    "&shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=creating_article_editor");
                await AssertStepAndClickNextAsync(
                    "Creating a new article", "Here you can create the article.", assertShepherdTargetIsNotBody: false);
                await AssertStepAndFillInShepherdTargetAndClickNextAsync("Title", "Let's give it a title!", "Sample article");
                await AssertStepAndClickNextAsync("Permalink", "Again, you can provide a URL");
                await AssertStepAndClickNextAsync("Set as homepage", "You can set this article as the homepage.");
                await AssertStepAndClickNextAsync("HTML Body", "This is the HTML Body, where");
                await AssertStepAndClickNextAsync("Subtitle", "You can set the subtitle of your article too.");
                await AssertStepAndClickNextAsync("Banner image", "You can add a banner image to your article too.");
                await AssertStepAndClickNextAsync("Preview", "Before publishing your article,");
                await AssertStepAndClickShepherdTargetAsync("Publishing", "We are ready, let's publish the article!");
            });

        // Article display
        await context.ExecuteLoggedAsync(
            "Article display",
            async () =>
            {
                // The URL for this section depends on the article created in the previous one, so this can't be started on its
                // own.
                // The URL is not changing here so can't use ClickShepherdTargetAsync().
                AssertStep("Viewing the article", "The article is now published.");
                await context.ClickReliablyOnAsync(_byShepherdTarget);
                SwitchToLastWindowAndSetDefaultBrowserSize();
                await AssertStepAndClickNextAsync(
                    "Viewing the article", "Here is you published article.", assertShepherdTargetIsNotBody: false);
            });

        // Managing the menu
        await context.ExecuteLoggedAsync(
            "Managing the menu",
            async () =>
            {
                ////await context.GoToRelativeUrlAsync("/?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=adding_article_to_menu_intro");
                await AssertStepAndClickShepherdTargetAsync("Managing the menu", "The sample article that was created from");
                await AssertStepAndClickNextAsync(
                    "Managing the menu", "As you can see, you can easily access", assertShepherdTargetIsNotBody: false);
                await AssertStepAndClickShepherdTargetAsync("Managing the menu", "Click on the \"Main Menu\" link.");
                await AssertStepAndClickNextAsync("Managing the menu", "Here you can see the menu's editor");
                await AssertStepAndClickShepherdTargetAsync("Managing the menu", "Let's add a menu item for the new article we created!");
                // The overlay on the overlay of the menu item type selector is strange, including that its text can't be
                // highlighted in the browser. Its buttons can't be clicked with ClickReliablyAsync() so we need to do this.
                AssertStep("Managing the menu", "You can choose between multiple types of menu items.");
                var originalUri = context.GetCurrentUri();
                context.Get(By.XPath($"//button[contains(@class, 'shepherd-button-primary') and not(@id)]")).Click();
                context.DoWithRetriesOrFail(() => context.GetCurrentUri() != originalUri);
                await AssertStepAndClickShepherdTargetAsync("Managing the menu", "For now, let's go with the Link Menu Item one.");
            });

        // Adding a menu item
        await context.ExecuteLoggedAsync(
            "Adding a menu item",
            async () =>
            {
                // The URL of the menu item will be random, so we can't have a start URL here.
                await AssertStepAndFillInShepherdTargetAndClickNextAsync(
                    "Managing the menu", "Let's give the menu item a name!", "Sample article");
                await AssertStepAndFillInShepherdTargetAndClickNextAsync(
                    "Managing the menu", "Let's give it your article's URL!", "~/sample-article");
                await AssertStepAndClickShepherdTargetAsync("Managing the menu", "We are ready, let's publish the menu item!");
                await AssertStepAndClickNextAsync("Managing the menu", "Your new menu item is now here.");
                await AssertStepAndClickShepherdTargetAsync("Managing the menu", "You will also need to publish the menu itself too.");
                await AssertStepAndClickNextAsync(
                    "Managing the menu", "Your article is now linked from the menu.", assertShepherdTargetIsNotBody: false);
                await AssertStepAndClickNextAsync("Managing the menu", "The new menu item should appear up here.");
            });

        // Content listing
        await context.ExecuteLoggedAsync(
            "Content listing",
            async () =>
            {
                ////await context.GoToRelativeUrlAsync("/?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=content_list_intro");
                await AssertStepAndClickNextAsync(
                    "Content listing", "Now let's go back to the admin dashboard!", assertShepherdTargetIsNotBody: false);
                await AssertStepAndClickShepherdTargetAsync("Content listing", "Click on the \"Content\" dropdown.");
                await AssertStepAndClickShepherdTargetAsync("Content listing", "Now click on the \"Content Items\" button.");
                await AssertStepAndClickNextAsync("Content listing", "Notice how we can see");
            });

        // Taxonomies
        await context.ExecuteLoggedAsync(
            "Taxonomies",
            async () =>
            {
                ////await context.GoToAdminRelativeUrlAsync("?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=taxonomies_intro");
                await AssertStepAndClickNextAsync(
                    "Taxonomies", "We'll now see how to use the Taxonomies module", assertShepherdTargetIsNotBody: false);
                await AssertStepAndClickNextAsync("Taxonomies", "You can access this list by filtering");
                await AssertStepAndClickShepherdTargetAsync("Taxonomies", "Let's see how we can edit taxonomies!");
                await AssertStepAndClickShepherdTargetAsync("Taxonomies", "You can add a new category by clicking here.");
                await AssertStepAndFillInShepherdTargetAndClickNextAsync("Taxonomies", "You can name your category.", "Sample category");
                AssertStep("Taxonomies", "You can select an icon for the category.");
                await context.ClickReliablyOnAsync(By.Id("Category_Icon"));
                await context.ClickReliablyOnAsync(By.ClassName("iconpicker-item")); // #spell-check-ignore-line
                await ClickOnNextButtonAsync();
                await AssertStepAndClickNextAsync("Taxonomies", "And you can set a permalink for it");
                await AssertStepAndClickShepherdTargetAsync("Taxonomies", "Let's publish the new category! ");
                await AssertStepAndClickShepherdTargetAsync("Taxonomies", "Your category is now published.");
            });

        // Media management
        await context.ExecuteLoggedAsync(
            "Media management",
            async () =>
            {
                ////await context.GoToAdminRelativeUrlAsync("?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=media_management_intro");
                await AssertStepAndClickNextAsync(
                    "Media management", "We're now done with Taxonomies.", assertShepherdTargetIsNotBody: false);
                await AssertStepAndClickShepherdTargetAsync("Media management", "Click on the \"Content\" dropdown.");
                await AssertStepAndClickShepherdTargetAsync("Media management", "Now click on the \"Media Library\" button.");
                await AssertStepAndClickNextAsync(
                    "Media management", "This is the media library.", assertShepherdTargetIsNotBody: false);
                // The .shepherd-target element is hidden until a hover.
                context.Driver.Perform(actions => actions.MoveToElement(context.Get(_byShepherdTarget.Hidden())));
                await AssertStepAndClickNextAsync("Media management", "You can edit the files' names, delete, and view them.");
                await AssertStepAndClickNextAsync("Media management", "You can see the different folders here");
                await AssertStepAndClickNextAsync("Media management", "You can filter files by their name here.");
                await AssertStepAndClickNextAsync("Media management", "You can upload new files here.");
                await AssertStepAndClickNextAsync(
                    "Media management", "New files you upload will show up", assertShepherdTargetIsNotBody: false);
            });

        // Flow Part
        await context.ExecuteLoggedAsync(
            "Flow Part",
            async () =>
            {
                ////await context.GoToAdminRelativeUrlAsync("?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=flow_part_content");
                await AssertStepAndClickShepherdTargetAsync("Flow Part", "This was our intro to the Media Library.");
                await AssertStepAndClickShepherdTargetAsync("Flow Part", "Now click on the \"Content Items\" button.");
                await AssertStepAndClickShepherdTargetAsync("Flow Part", "We'll create a new Page content item.");
                await AssertStepAndClickShepherdTargetAsync("Flow Part", "Click on \"Page\" to create a new page.");
                await AssertStepAndFillInShepherdTargetAndClickNextAsync(
                    "Flow Part", "You can give it a title, just like", "Sample page");
                await AssertStepAndClickNextAsync("Flow Part", "Surely you know the drill");
                await AssertStepAndClickNextAsync("Flow Part", "The page has a part called \"Flow Part\".");
                await AssertStepAndClickShepherdTargetAsync("Flow Part", "You will see the different widgets here");
                await AssertStepAndClickShepherdTargetAsync("Flow Part", "Let's add a blockquote, for example!");
                await AssertStepAndClickNextAsync(
                    "Flow Part", "Now you added the blockquote to your page.", assertShepherdTargetIsNotBody: false);
                await AssertStepAndClickShepherdTargetAsync("Flow Part", "Click on the dropdown to edit it!");
                await AssertStepAndFillInShepherdTargetAndClickNextAsync(
                    "Flow Part", "Can you think of a good quote?", "Sample blockquote");
                await AssertStepAndClickShepherdTargetAsync("Flow Part", "We are ready, let's publish the page!");
                AssertStep("Viewing the page", "The page is published!");
                await context.ClickReliablyOnAsync(_byShepherdTarget);
                SwitchToLastWindowAndSetDefaultBrowserSize();
                await AssertStepAndClickNextAsync(
                    "Viewing the page", "Here is you published page", assertShepherdTargetIsNotBody: false);
            });

        // Layout widgets
        await context.ExecuteLoggedAsync(
            "Layout widgets",
            async () =>
            {
                ////await context.GoToRelativeUrlAsync("/?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=adding_widgets_to_the_layout_intro");
                await AssertStepAndClickShepherdTargetAsync("Layout widgets", "The fun with widgets doesn't stop here!");
                await AssertStepAndClickNextAsync(
                    "Layout widgets", "Go to the admin dashboard by clicking", assertShepherdTargetIsNotBody: false);
                await AssertStepAndClickShepherdTargetAsync("Layout widgets", "Click on the \"Design\" dropdown.");
                await AssertStepAndClickShepherdTargetAsync("Layout widgets", "Now click on the \"Widgets\" menu item.");
                await AssertStepAndClickNextAsync("Layout widgets", "These are the layout zones.");
                await AssertStepAndClickNextAsync("Layout widgets", "Widgets are put not just into zones,");
                await AssertStepAndClickShepherdTargetAsync("Layout widgets", "Let's add a widget to the content zone!");
                await AssertStepAndClickShepherdTargetAsync("Layout widgets", "Now click on \"Paragraph\"");
                await AssertStepAndFillInShepherdTargetAndClickNextAsync("Layout widgets", "Give it a title.", "Sample paragraph widget");
                await AssertStepAndClickNextAsync("Layout widgets", "Give it some content.");
                await AssertStepAndClickShepherdTargetAsync("Layout widgets", "We are ready, let's publish it!");
                // In Orchard Core 1.8 this link doesn't open a new tab anymore so these three lines will need to be switched to
                // just AssertStepAndClickShepherdTargetAsync() after an Orchard upgrade.
                AssertStep(
                    "Layout widgets", "Your paragraph widget is now published.", assertShepherdTargetIsNotBody: false);
                await context.ClickReliablyOnAsync(_byShepherdTarget);
                SwitchToLastWindowAndSetDefaultBrowserSize();
                await AssertStepAndClickNextAsync(
                    "Layout widgets", "You should see your paragraph", assertShepherdTargetIsNotBody: false);
            });

        // Content type editor
        await context.ExecuteLoggedAsync(
            "Content type editor",
            async () =>
            {
                ////await context.GoToRelativeUrlAsync("/?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=content_type_editor_intro");
                await AssertStepAndClickNextAsync(
                    "Content type editor", "We'll now take a look at how the", assertShepherdTargetIsNotBody: false);
                await AssertStepAndClickShepherdTargetAsync("Content type editor", "Click on the \"Content\" dropdown.");
                await AssertStepAndClickShepherdTargetAsync("Content type editor", "Now click on the \"Content Definition\" dropdown.");
                await AssertStepAndClickShepherdTargetAsync("Content type editor", "Click on the \"Content Types\" button.");
                await AssertStepAndClickNextAsync("Content type editor", "Here you can see and edit all the content types.");
                await AssertStepAndClickShepherdTargetAsync("Content type editor", "Let's edit the Blog Post content type");
                await AssertStepAndClickNextAsync("Content type editor", "Here you can see the content type's editor.");
                await AssertStepAndClickShepherdTargetAsync("Content type editor", "You can add a new field by clicking here.");
                await AssertStepAndFillInShepherdTargetAndClickNextAsync(
                    "Content type editor", "Let's suppose that you're", "Sample field");
                AssertStep("Content type editor", "Select Text Field.");
                await context.ClickReliablyOnAsync(By.CssSelector($".{_shepherdTargetClass} input"));
                await ClickOnNextButtonAsync();
                await AssertStepAndClickShepherdTargetAsync("Content type editor", "Okay, now save it.");
                await AssertStepAndClickShepherdTargetAsync("Content type editor", "Now let's edit the text field to see");
                await AssertStepAndClickNextAsync("Content type editor", "Most of the options are well explained.");
                await AssertStepAndClickNextAsync("Content type editor", "You can select the editor type here.");
                await AssertStepAndClickNextAsync("Content type editor", "You can also select the display mode here.");
                await AssertStepAndClickShepherdTargetAsync("Content type editor", "Okay, now save it.");
                await AssertStepAndClickShepherdTargetAsync("Content type editor", "The text field is now saved. You will also");
                await AssertStepAndClickNextAsync(
                    "Content type editor", "Congratulations, you just tinkered", assertShepherdTargetIsNotBody: false);
            });

        // Audit Trail
        await context.ExecuteLoggedAsync(
            "Audit Trail",
            async () =>
            {
                ////await context.GoToAdminRelativeUrlAsync("?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=audit_trail_intro");
                await AssertStepAndClickNextAsync(
                    "Audit Trail", "The Audit Trail module provides an immutable", assertShepherdTargetIsNotBody: false);
                await AssertStepAndClickShepherdTargetAsync("Audit Trail", "Click on \"Configuration\".");
                await AssertStepAndClickShepherdTargetAsync("Audit Trail", "Click on \"Settings\".");
                await AssertStepAndClickShepherdTargetAsync("Audit Trail", "Click on \"Audit Trail\".");
                await AssertStepAndClickNextAsync("Audit Trail", "Here you can see and turn on or off all the events");
                await AssertStepAndClickShepherdTargetAsync("Audit Trail", "Click here to see the trimming settings.");
                await AssertStepAndClickNextAsync("Audit Trail", "To not let the Audit Trail database grow indefinitely");
                await AssertStepAndClickShepherdTargetAsync("Audit Trail", "Click here to see the content types whose events");
                await AssertStepAndClickNextAsync("Audit Trail", "These are the content whose events are currently recorded.");
                await AssertStepAndClickShepherdTargetAsync("Audit Trail", "Now let's see how we can see the details of the");
                await AssertStepAndClickNextAsync("Audit Trail", "Here you can see all the recorded events.");
            });

        // User management
        await context.ExecuteLoggedAsync(
            "User management",
            async () =>
            {
                ////await context.GoToAdminRelativeUrlAsync("?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=user_management_intro");
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
            });

        // Roles
        await context.ExecuteLoggedAsync(
            "Roles",
            async () =>
            {
                ////await context.GoToAdminRelativeUrlAsync("/Users/Index?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=roles_intro");
                await AssertStepAndClickShepherdTargetAsync("Roles", "Since you're surely curious about those roles");
                await AssertStepAndClickShepherdTargetAsync("Roles", "Now click on \"Roles\".");
                await AssertStepAndClickNextAsync("Roles", "Here you can see all the existing roles and edit their");
                await AssertStepAndClickShepherdTargetAsync("Roles", "Let's see one! Click on the \"Edit\" button.");
                await AssertStepAndClickNextAsync("Roles", "A role is a collection of permissions that the user has.");
                await AssertStepAndClickShepherdTargetAsync("Roles", "Not much to tune on this role, but click on the \"Save\"");
                await AssertStepAndClickNextAsync(
                    "Roles", "If you change permissions of a role, then", assertShepherdTargetIsNotBody: false);
            });

        // Deployment
        await context.ExecuteLoggedAsync(
            "Deployment",
            async () =>
            {
                ////await context.GoToAdminRelativeUrlAsync("?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=deployment_intro");
                await AssertStepAndClickNextAsync(
                    "Deployment", "Let's take a look at exporting and importing,", assertShepherdTargetIsNotBody: false);
                await AssertStepAndClickShepherdTargetAsync("Deployment", "Click on \"Configuration\".");
                await AssertStepAndClickShepherdTargetAsync("Deployment", "Click on \"Import/Export\".");
                await AssertStepAndClickShepherdTargetAsync("Deployment", "We'll start with \"Deployment Plans\".");
                await AssertStepAndClickNextAsync("Deployment", "Here you would see the deployment plans, but we currently have");
                await AssertStepAndClickShepherdTargetAsync("Deployment", "Let's create a deployment plan! Click here.");
                AssertStep("Deployment", "Give it a name.");
                await FillInShepherdTargetWithRetriesAsync("Sample deployment plan");
                await ClickOnNextButtonAsync();
                await AssertStepAndClickShepherdTargetAsync("Deployment", "Now click on the \"Create\" button.");
                await AssertStepAndClickShepherdTargetAsync("Deployment", "Now we have a deployment plan, but it's empty.");
                await AssertStepAndClickShepherdTargetAsync("Deployment", "Click on the \"Add Step\" button.");
                await AssertStepAndClickNextAsync("Deployment", "Here you can see all the steps that you can use.");
                await AssertStepAndClickNextAsync("Deployment", "Let's filter for \"Update Content Definitions\"!");
                await AssertStepAndClickShepherdTargetAsync("Deployment", "\"Update Content Definitions\" exports the chosen");
                await AssertStepAndClickNextAsync("Deployment", "Here you can select which content types and parts you want");
                await AssertStepAndClickShepherdTargetAsync("Deployment", "If you're finished, click on the \"Create\" button.");
                await AssertStepAndClickNextAsync("Deployment", "As you can see, you added the step to the deployment plan. ");
                await AssertStepAndClickShepherdTargetAsync("Deployment", "Once you finished adding steps, you can click on");
                // The file will be downloaded to the default download location. It doesn't really matter.
                await AssertStepAndClickShepherdTargetAsync("Deployment", "Here you can use \"File Download\" so the exported");
                await AssertStepAndClickShepherdTargetAsync("Deployment", "We've now seen how to export content.");
                await AssertStepAndClickShepherdTargetAsync("Deployment", "Click on \"Import/Export\" again.");
                await AssertStepAndClickShepherdTargetAsync("Deployment", "Click on \"Package Import\".");
                await AssertStepAndClickNextAsync("Deployment", "Here you can import your exported deployment plan");
                // This will cause a validation error since we didn't select a file, but it's easier this way and an actual
                // upload is not necessary.
                await AssertStepAndClickShepherdTargetAsync(
                    "Deployment", "After you selected the file, click on \"Import\" to import");
                await AssertStepAndClickNextAsync(
                    "Deployment", "You can also import a piece of JSON", assertShepherdTargetIsNotBody: false);
            });

        // Themes and modules
        await context.ExecuteLoggedAsync(
            "Themes and modules",
            async () =>
            {
                ////await context.GoToAdminRelativeUrlAsync(
                ////    "/DeploymentPlan/Import/Index?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=features_and_themes_themes_intro");
                await AssertStepAndClickNextAsync(
                    "Themes and modules", "Now let's take a look at how plugins", assertShepherdTargetIsNotBody: false);
                await AssertStepAndClickShepherdTargetAsync("Themes and modules", "Click on \"Design\".");
                await AssertStepAndClickShepherdTargetAsync("Themes and modules", "Click on \"Themes\".");
                await AssertStepAndClickNextAsync("Themes and modules", "Here you can see and change the themes.");
                await AssertStepAndClickNextAsync(
                    "Themes and modules", "We'll continue with modules", assertShepherdTargetIsNotBody: false);
                await AssertStepAndClickShepherdTargetAsync("Themes and modules", "Click on \"Configuration\".");
                await AssertStepAndClickShepherdTargetAsync("Themes and modules", "Click on \"Features\".");
                await AssertStepAndClickNextAsync("Themes and modules", "Here you can see all the features");
            });

        // Outro #spell-check-ignore-line
        context.ExecuteLogged(
            "Outro", // #spell-check-ignore-line
            () => AssertStep(
                "Walkthrough completed", "Congratulations! You completed the walkthrough.", assertShepherdTargetIsNotBody: false));
    }
}
