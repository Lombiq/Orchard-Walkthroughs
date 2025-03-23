using Atata;
using Lombiq.Tests.UI.Extensions;
using Lombiq.Tests.UI.Services;
using OpenQA.Selenium;
using Shouldly;
using System;
using System.Threading.Tasks;
using Xunit;

namespace Lombiq.Walkthroughs.Tests.UI.Extensions;

public static class TestCaseUITestContextExtensions
{
    private const string _shepherdTargetClass = "shepherd-target";
    private static readonly By _byShepherdTarget = By.ClassName(_shepherdTargetClass);
    private static readonly By _byShepherdTargetNotBody = By.CssSelector("*:not(body)." + _shepherdTargetClass);

    public static async Task TestWalkthroughsBehaviorAsync(this UITestContext context)
    {
        void AssertStepAndClickNext(string header, string text, bool assertShepherdTargetIsNotBody = true)
        {
            AssertStep(header, text, assertShepherdTargetIsNotBody);
            ClickOnNextButton();
        }

        void AssertStepAndClickShepherdTarget(string header, string text, bool assertShepherdTargetIsNotBody = true)
        {
            AssertStep(header, text, assertShepherdTargetIsNotBody);
            ClickShepherdTarget();
        }

        async Task AssertStepAndClickAndFillInShepherdTargetAndClickNextAsync(
            string header,
            string text,
            string targetText,
            bool assertShepherdTargetIsNotBody = true)
        {
            AssertStep(header, text, assertShepherdTargetIsNotBody);
            await ClickAndFillInShepherdTargetWithRetriesAsync(targetText);
            ClickOnNextButton();
        }

        void AssertStep(string header, string text, bool assertShepherdTargetIsNotBody = true)
        {
            context.Get(By.CssSelector(".shepherd-header")).Text.ShouldContain(header);
            context.Get(By.CssSelector(".shepherd-text")).Text.ShouldContain(text);
            context.Exists(assertShepherdTargetIsNotBody ? _byShepherdTargetNotBody : _byShepherdTarget);
        }

        // Under Ubuntu Chrome, the Shepherd target can randomly become not clickable for some reason. Clicking with
        // JavaScript works around this.
        void ClickShepherdTarget() => context.ExecuteScript("arguments[0].click();", context.Get(_byShepherdTarget));

        Task ClickShepherdTargetWithScriptAsync() =>
            context.RetryIfNotStaleOrFailAsync(() =>
            {
                context.ExecuteScript($"document.querySelector('.{_shepherdTargetClass}').click()");
                return Task.FromResult(context.Exists(_byShepherdTarget.Safely()));
            });

        Task ClickAndFillInShepherdTargetWithRetriesAsync(string text) =>
            context.ClickAndFillInWithRetriesAsync(_byShepherdTarget, text);

        // Just a selector on .shepherd-button-primary is not enough to find the button for some reason.
        void ClickOnNextButton()
        {
            var buttonBy = By.XPath($"//button[contains(@class, 'shepherd-button-primary') and not(@id)]");

            // Under Ubuntu Chrome, the Next button of a step can randomly become not clickable with the "cursor:
            // not-allowed;" styling coming from .shepherd-button:disabled, despite the button not being disabled.
            // Removing the styling doesn't fix this alone, but clicking with JavaScript does.
            context.ExecuteScript("arguments[0].click();", context.Get(buttonBy));
        }

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
        ////await context.SignInDirectlyAsync("testuser");

        // The below steps could be split into multiple tests, one for each section. For now, this would only bring some
        // performance benefit if any of the steps fail (because then not the whole tests would need to be retried) but
        // these shouldn't be too flaky (with the reliability features for each command) anyway. Otherwise, there would
        // be a large overhead starting multiple tests, even if launching them from the same setup snapshot. If xUnit
        // will bring parallelization within test classes too (see https://github.com/xunit/xunit/issues/1986), this
        // would matter more.

        // Introduction
        await context.ExecuteLoggedAsync(
            "Introduction",
            async () =>
            {
                AssertStepAndClickNext(
                    "Select walkthrough!", "Welcome! The Lombiq.Walkthroughs", assertShepherdTargetIsNotBody: false);
                AssertStepAndClickNext(
                    "Orchard Core Admin Walkthrough", "This walkthrough covers", assertShepherdTargetIsNotBody: false);

                // Also testing the back button.
                AssertStepAndClickNext("Setup recipe", "The setup recipe in", assertShepherdTargetIsNotBody: false);
                AssertStep("Site setup", "To get to this point", assertShepherdTargetIsNotBody: false);
                await ClickOnBackButtonAsync();
                AssertStepAndClickNext("Setup recipe", "The setup recipe in", assertShepherdTargetIsNotBody: false);
                AssertStepAndClickNext("Site setup", "To get to this point", assertShepherdTargetIsNotBody: false);
            });

        // Login
        await context.ExecuteLoggedAsync(
            "Login",
            async () =>
            {
                ////await context.GoToRelativeUrlAsync("/?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=logging_in");
                AssertStepAndClickNext("Log in", "Let's log in!", assertShepherdTargetIsNotBody: false);
                AssertStepAndClickNext("Log in page", "Here you can log in.", assertShepherdTargetIsNotBody: false);
                await AssertStepAndClickAndFillInShepherdTargetAndClickNextAsync(
                    "Username", "Provide your username.", "testuser");
                await AssertStepAndClickAndFillInShepherdTargetAndClickNextAsync("Password", "Provide your password.", "Password1!");

                // Under Ubuntu Chrome, the click on this step will randomly not work. Working it around like this.
                try
                {
                    AssertStepAndClickShepherdTarget("Logging in", "Now you can log in!");
                }
                catch (TimeoutException)
                {
                    context.Configuration.TestOutputHelper.WriteLineTimestampedAndDebug(
                        "Clicking the Next button on the Logging in step failed; working around by going directly to " +
                        "the next step.");

                    await context.SignInDirectlyAsync("testuser");
                    await context.GoToRelativeUrlAsync("/?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=login_logged_in");
                }

                (await context.GetCurrentUserNameAsync()).ShouldBe("testuser");
                await context.Driver.Navigate().BackAsync();

                AssertStepAndClickNext("Logged in", "Now you are logged in!", assertShepherdTargetIsNotBody: false);
            });

        // Dashboard
        context.ExecuteLogged(
            "Dashboard",
            () =>
            {
                ////await context.GoToRelativeUrlAsync("/?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=admin_dashboard_enter");
                AssertStepAndClickNext("Admin dashboard", "Let's see the admin dashboard now!", assertShepherdTargetIsNotBody: false);
                AssertStepAndClickNext("Admin dashboard", "Welcome to the admin dashboard!", assertShepherdTargetIsNotBody: false);
                AssertStepAndClickNext("Side menu", "This is the side menu");
                AssertStepAndClickNext("Top menu", "This is the top menu.");
            });

        // Blog
        await context.ExecuteLoggedAsync(
            "Blog",
            async () =>
            {
                await context.GoToAdminRelativeUrlAsync("?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=creating_blog_post");
                AssertStepAndClickShepherdTarget("Creating a new blog post", "Let's create a new blog post!");
                AssertStepAndClickNext("Blog posts", "Here you can see the blog posts inside the blog.");
                AssertStepAndClickShepherdTarget("Creating a new blog post", "Click here to create a new blog post.");
            });

        // Blog Post editor
        await context.ExecuteLoggedAsync(
            "Blog Post editor",
            async () =>
            {
                // The ID of the blog will be random, so we can't have a start URL here.
                AssertStepAndClickNext(
                    "Creating a new blog post", "Here is the editor of your new blog post.", assertShepherdTargetIsNotBody: false);
                await AssertStepAndClickAndFillInShepherdTargetAndClickNextAsync("Title", "Let's give it a title!", "Sample Blog Post");
                AssertStepAndClickNext("Permalink", "You can give the blog post an URL by hand");
                AssertStepAndClickNext("Markdown editor", "This is the editor where you can write");
                await AssertStepAndClickAndFillInShepherdTargetAndClickNextAsync(
                    "Subtitle", "You can also give a subtitle to your blog post.", "Sample subtitle");
                AssertStepAndClickNext("Banner image", "You can add an image to your blog post");
                AssertStepAndClickNext("Tags", "You can add tags to your blog post");
                AssertStepAndClickNext("Category", "You can also select the category of your blog post.");
                AssertStepAndClickNext("Preview", "Before publishing your blog post");
                AssertStepAndClickShepherdTarget("Publishing", "We are ready, let's publish the blog post");
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
                AssertStepAndClickNext(
                    "Viewing the blog post", "Here is your published blog post", assertShepherdTargetIsNotBody: false);
            });

        // Article introduction
        context.ExecuteLogged(
            "Article introduction",
            () =>
            {
                ////await context.GoToRelativeUrlAsync("/?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=creating_article_intermediate_step");
                AssertStepAndClickShepherdTarget("Creating a new article", "Now let's create an article!");
                AssertStepAndClickNext(
                    "Creating a new article", "Just as the Blog Post content type", assertShepherdTargetIsNotBody: false);
                AssertStepAndClickShepherdTarget("Creating a new article", "Click on the \"Content\" dropdown.");
                AssertStepAndClickShepherdTarget("Creating a new article", "Now click on the \"Content Types\" dropdown");
                AssertStepAndClickShepherdTarget("Creating a new article", "Here we have the article content type.");
                AssertStepAndClickNext("Creating a new article", "Here you can see all the articles.");
                AssertStepAndClickShepherdTarget("Creating a new article", "Click here to create a new article.");
            });

        // Article editor
        await context.ExecuteLoggedAsync(
            "Article editor",
            async () =>
            {
                ////await context.GoToAdminRelativeUrlAsync(
                ////    "/Contents/ContentTypes/Article/Create?returnUrl=%2FAdmin%2FContents%2FContentItems" +
                ////    "&shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=creating_article_editor");
                AssertStepAndClickNext(
                    "Creating a new article", "Here you can create the article.", assertShepherdTargetIsNotBody: false);
                await AssertStepAndClickAndFillInShepherdTargetAndClickNextAsync("Title", "Let's give it a title!", "Sample article");
                AssertStepAndClickNext("Permalink", "Again, you can provide a URL");
                AssertStepAndClickNext("Set as homepage", "You can set this article as the homepage.");
                AssertStepAndClickNext("HTML Body", "This is the HTML Body, where");
                AssertStepAndClickNext("Subtitle", "You can set the subtitle of your article too.");
                AssertStepAndClickNext("Banner image", "You can add a banner image to your article too.");
                AssertStepAndClickNext("Preview", "Before publishing your article,");
                AssertStep("Publishing", "We are ready, let's publish the article!");
                // The button is largely out of the viewport and thus while clicking it seemingly works, it doesn't
                // actually register (but for some reason only when using the project from NuGet). So, making sure it's
                // scrolled into view.
                context.ScrollTo(_byShepherdTarget);
                ClickShepherdTarget();
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
                AssertStepAndClickNext(
                    "Viewing the article", "Here is you published article.", assertShepherdTargetIsNotBody: false);
            });

        // Managing the menu
        context.ExecuteLogged(
            "Managing the menu",
            () =>
            {
                ////await context.GoToRelativeUrlAsync("/?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=adding_article_to_menu_intro");
                AssertStepAndClickShepherdTarget("Managing the menu", "The sample article that was created from");
                AssertStepAndClickNext(
                    "Managing the menu", "As you can see, you can easily access", assertShepherdTargetIsNotBody: false);
                AssertStepAndClickShepherdTarget("Managing the menu", "Click on the \"Main Menu\" link.");
                AssertStepAndClickNext("Managing the menu", "Here you can see the menu's editor");
                AssertStepAndClickShepherdTarget("Managing the menu", "Let's add a menu item for the new article we created!");
                // The overlay on the overlay of the menu item type selector is strange, including that its text can't be
                // highlighted in the browser. Its buttons can't be clicked with ClickReliablyAsync() so we need to do this.
                AssertStep("Managing the menu", "You can choose between multiple types of menu items.");
                var originalUri = context.GetCurrentUri();
                context.Get(By.XPath($"//button[contains(@class, 'shepherd-button-primary') and not(@id)]")).Click();
                context.DoWithRetriesOrFail(() => context.GetCurrentUri() != originalUri);
                AssertStepAndClickShepherdTarget("Managing the menu", "For now, let's go with the Link Menu Item one.");
            });

        // Adding a menu item
        await context.ExecuteLoggedAsync(
            "Adding a menu item",
            async () =>
            {
                // The URL of the menu item will be random, so we can't have a start URL here.
                await AssertStepAndClickAndFillInShepherdTargetAndClickNextAsync(
                    "Managing the menu", "Let's give the menu item a name!", "Sample article");
                await AssertStepAndClickAndFillInShepherdTargetAndClickNextAsync(
                    "Managing the menu", "Let's give it your article's URL!", "~/sample-article");
                AssertStepAndClickShepherdTarget("Managing the menu", "We are ready, let's publish the menu item!");
                AssertStepAndClickNext("Managing the menu", "Your new menu item is now here.");
                AssertStepAndClickShepherdTarget("Managing the menu", "You will also need to publish the menu itself too.");
                AssertStepAndClickNext(
                    "Managing the menu", "Your article is now linked from the menu.", assertShepherdTargetIsNotBody: false);
                AssertStepAndClickNext("Managing the menu", "The new menu item should appear up here.");
            });

        // Content listing
        context.ExecuteLogged(
            "Content listing",
            () =>
            {
                ////await context.GoToRelativeUrlAsync("/?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=content_list_intro");
                AssertStepAndClickNext(
                    "Content listing", "Now let's go back to the admin dashboard!", assertShepherdTargetIsNotBody: false);
                AssertStepAndClickShepherdTarget("Content listing", "Click on the \"Content\" dropdown.");
                AssertStepAndClickShepherdTarget("Content listing", "Now click on the \"Content Items\" button.");
                AssertStepAndClickNext("Content listing", "Notice how we can see");
            });

        // Taxonomies
        await context.ExecuteLoggedAsync(
            "Taxonomies",
            async () =>
            {
                ////await context.GoToAdminRelativeUrlAsync("?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=taxonomies_intro");
                AssertStepAndClickNext(
                    "Taxonomies", "We'll now see how to use the Taxonomies module", assertShepherdTargetIsNotBody: false);
                AssertStepAndClickNext("Taxonomies", "You can access this list by filtering");
                AssertStepAndClickShepherdTarget("Taxonomies", "Let's see how we can edit taxonomies!");
                AssertStepAndClickShepherdTarget("Taxonomies", "You can add a new category by clicking here.");
                await AssertStepAndClickAndFillInShepherdTargetAndClickNextAsync("Taxonomies", "You can name your category.", "Sample category");
                AssertStep("Taxonomies", "You can select an icon for the category.");
                await context.ClickReliablyOnAsync(By.Id("Category_Icon"));
                await context.ClickReliablyOnAsync(By.ClassName("iconpicker-item"));
                ClickOnNextButton();
                AssertStepAndClickNext("Taxonomies", "And you can set a permalink for it");
                AssertStepAndClickShepherdTarget("Taxonomies", "Let's publish the new category! ");
                AssertStep("Taxonomies", "Your category is now published.");
                await ClickShepherdTargetWithScriptAsync();
            });

        // Media management
        context.ExecuteLogged(
            "Media management",
            () =>
            {
                ////await context.GoToAdminRelativeUrlAsync("?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=media_management_intro");
                AssertStepAndClickNext(
                    "Media management", "We're now done with Taxonomies.", assertShepherdTargetIsNotBody: false);
                AssertStepAndClickShepherdTarget("Media management", "Click on the \"Content\" dropdown.");
                AssertStepAndClickShepherdTarget("Media management", "Now click on the \"Media Library\" button.");
                AssertStepAndClickNext(
                    "Media management", "This is the media library.", assertShepherdTargetIsNotBody: false);
                // The .shepherd-target element is hidden until a hover.
                context.Driver.Perform(actions => actions.MoveToElement(context.Get(_byShepherdTarget.Hidden())));
                AssertStepAndClickNext("Media management", "You can edit the files' names, delete, and view them.");
                AssertStepAndClickNext("Media management", "You can see the different folders here");
                AssertStepAndClickNext("Media management", "You can filter files by their name here.");
                AssertStepAndClickNext("Media management", "You can upload new files here.");
                AssertStepAndClickNext(
                    "Media management", "New files you upload will show up", assertShepherdTargetIsNotBody: false);
            });

        // Flow Part
        await context.ExecuteLoggedAsync(
            "Flow Part",
            async () =>
            {
                ////await context.GoToAdminRelativeUrlAsync("?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=flow_part_content");
                AssertStepAndClickShepherdTarget("Flow Part", "This was our intro to the Media Library.");
                AssertStepAndClickShepherdTarget("Flow Part", "Now click on the \"Content Items\" button.");
                AssertStepAndClickShepherdTarget("Flow Part", "We'll create a new Page content item.");
                AssertStepAndClickShepherdTarget("Flow Part", "Click on \"Page\" to create a new page.");
                await AssertStepAndClickAndFillInShepherdTargetAndClickNextAsync(
                    "Flow Part", "You can give it a title, just like", "Sample page");
                AssertStepAndClickNext("Flow Part", "Surely you know the drill");
                AssertStepAndClickNext("Flow Part", "The page has a part called \"Flow Part\".");
                AssertStepAndClickShepherdTarget("Flow Part", "You will see the different widgets here");
                AssertStepAndClickShepherdTarget("Flow Part", "Let's add a blockquote, for example!");
                AssertStepAndClickNext(
                    "Flow Part", "Now you added the blockquote to your page.", assertShepherdTargetIsNotBody: false);
                AssertStepAndClickShepherdTarget("Flow Part", "Click on the dropdown to edit it!");
                await AssertStepAndClickAndFillInShepherdTargetAndClickNextAsync(
                    "Flow Part", "Can you think of a good quote?", "Sample blockquote");
                AssertStepAndClickShepherdTarget("Flow Part", "We are ready, let's publish the page!");
                AssertStep("Viewing the page", "The page is published!");
                await context.ClickReliablyOnAsync(_byShepherdTarget);
                SwitchToLastWindowAndSetDefaultBrowserSize();
                AssertStepAndClickNext(
                    "Viewing the page", "Here is you published page", assertShepherdTargetIsNotBody: false);
            });

        // Layout widgets
        await context.ExecuteLoggedAsync(
            "Layout widgets",
            async () =>
            {
                ////await context.GoToRelativeUrlAsync("/?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=adding_widgets_to_the_layout_intro");
                AssertStepAndClickShepherdTarget("Layout widgets", "The fun with widgets doesn't stop here!");
                AssertStepAndClickNext(
                    "Layout widgets", "Go to the admin dashboard by clicking", assertShepherdTargetIsNotBody: false);
                AssertStepAndClickShepherdTarget("Layout widgets", "Click on the \"Design\" dropdown.");
                AssertStepAndClickShepherdTarget("Layout widgets", "Now click on the \"Widgets\" menu item.");
                AssertStepAndClickNext("Layout widgets", "These are the layout zones.");
                AssertStepAndClickNext("Layout widgets", "Widgets are put not just into zones,");
                AssertStepAndClickShepherdTarget("Layout widgets", "Let's add a widget to the content zone!");
                AssertStepAndClickShepherdTarget("Layout widgets", "Now click on \"Paragraph\"");
                await AssertStepAndClickAndFillInShepherdTargetAndClickNextAsync("Layout widgets", "Give it a title.", "Sample paragraph widget");
                AssertStepAndClickNext("Layout widgets", "Give it some content.");
                AssertStepAndClickShepherdTarget("Layout widgets", "We are ready, let's publish it!");
                AssertStepAndClickShepherdTarget(
                    "Layout widgets", "Your paragraph widget is now published.", assertShepherdTargetIsNotBody: false);
                AssertStepAndClickNext(
                    "Layout widgets", "You should see your paragraph", assertShepherdTargetIsNotBody: false);
            });

        // Content type editor
        await context.ExecuteLoggedAsync(
            "Content type editor",
            async () =>
            {
                ////await context.GoToRelativeUrlAsync("/?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=content_type_editor_intro");
                AssertStepAndClickNext(
                    "Content type editor", "We'll now take a look at how the", assertShepherdTargetIsNotBody: false);
                AssertStepAndClickShepherdTarget("Content type editor", "Click on the \"Content\" dropdown.");
                AssertStepAndClickShepherdTarget("Content type editor", "Now click on the \"Content Definition\" dropdown.");
                AssertStepAndClickShepherdTarget("Content type editor", "Click on the \"Content Types\" button.");
                AssertStepAndClickNext("Content type editor", "Here you can see and edit all the content types.");
                AssertStepAndClickShepherdTarget("Content type editor", "Let's edit the Blog Post content type");
                AssertStepAndClickNext("Content type editor", "Here you can see the content type's editor.");
                AssertStepAndClickShepherdTarget("Content type editor", "You can add a new field by clicking here.");
                await AssertStepAndClickAndFillInShepherdTargetAndClickNextAsync(
                    "Content type editor", "Let's suppose that you're", "Sample field");
                AssertStep("Content type editor", "Select Text Field.");
                await context.ClickReliablyOnAsync(By.CssSelector($".{_shepherdTargetClass} input"));
                ClickOnNextButton();
                AssertStepAndClickShepherdTarget("Content type editor", "Okay, now save it.");
                AssertStepAndClickShepherdTarget("Content type editor", "Now let's edit the text field to see");
                AssertStepAndClickNext("Content type editor", "Most of the options are well explained.");
                AssertStepAndClickNext("Content type editor", "You can select the editor type here.");
                AssertStepAndClickNext("Content type editor", "You can also select the display mode here.");
                AssertStepAndClickShepherdTarget("Content type editor", "Okay, now save it.");
                AssertStep("Content type editor", "The text field is now saved. You will also");
                await ClickShepherdTargetWithScriptAsync();
                AssertStepAndClickNext(
                    "Content type editor", "Congratulations, you just tinkered", assertShepherdTargetIsNotBody: false);
            });

        // Audit Trail
        context.ExecuteLogged(
            "Audit Trail",
            () =>
            {
                ////await context.GoToAdminRelativeUrlAsync("?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=audit_trail_intro");
                AssertStepAndClickNext(
                    "Audit Trail", "The Audit Trail module provides an immutable", assertShepherdTargetIsNotBody: false);
                AssertStepAndClickShepherdTarget("Audit Trail", "Click on \"Configuration\".");
                AssertStepAndClickShepherdTarget("Audit Trail", "Click on \"Settings\".");
                AssertStepAndClickShepherdTarget("Audit Trail", "Click on \"Audit Trail\".");
                AssertStepAndClickNext("Audit Trail", "Here you can see and turn on or off all the events");
                AssertStepAndClickShepherdTarget("Audit Trail", "Click here to see the trimming settings.");
                AssertStepAndClickNext("Audit Trail", "To not let the Audit Trail database grow indefinitely");
                AssertStepAndClickShepherdTarget("Audit Trail", "Click here to see the content types whose events");
                AssertStepAndClickNext("Audit Trail", "These are the content whose events are currently recorded.");
                AssertStepAndClickShepherdTarget("Audit Trail", "Now let's see how we can see the details of the");
                AssertStepAndClickNext("Audit Trail", "Here you can see all the recorded events.");
            });

        // User management
        await context.ExecuteLoggedAsync(
            "User management",
            async () =>
            {
                ////await context.GoToAdminRelativeUrlAsync("?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=user_management_intro");
                AssertStepAndClickShepherdTarget("User management", "It's too quiet if you're alone in your Orchard");
                AssertStepAndClickShepherdTarget("User management", "This menu contains all security and role-based");
                AssertStepAndClickNext("User management", "Here you can see all the users, including");
                AssertStepAndClickShepherdTarget("User management", "You can edit existing users and add add new");
                AssertStep("User management", "Think of someone you like so much you want them in your Orchard Core app");
                await ClickAndFillInShepherdTargetWithRetriesAsync("sample.user");
                ClickOnNextButton();
                AssertStep("User management", "Add their e-mail address.");
                await ClickAndFillInShepherdTargetWithRetriesAsync("sample.user@example.com");
                ClickOnNextButton();
                AssertStepAndClickNext("User management", "You can enter a phone number too, but it's optional.");
                AssertStepAndClickNext("User management", "You can disable the user, though for a new one this");
                AssertStep("User management", "You can enter a password or generate a strong one automatically.");
                await context.ClickReliablyOnAsync(By.ClassName("password-generator-button"));
                ClickOnNextButton();
                AssertStepAndClickNext("User management", "Finally, you can select one or more roles for the user.");
                // Without this it won't find the Save button to click on.
                context.ScrollTo(_byShepherdTarget);
                AssertStepAndClickShepherdTarget("User management", "We are ready, let's publish the user!");
                AssertStepAndClickNext("User management", "You should see the newly created user here.");
            });

        // Roles
        context.ExecuteLogged(
            "Roles",
            () =>
            {
                ////await context.GoToAdminRelativeUrlAsync("/Users/Index?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=roles_intro");
                AssertStepAndClickShepherdTarget("Roles", "Since you're surely curious about those roles");
                AssertStepAndClickShepherdTarget("Roles", "Now click on \"Roles\".");
                AssertStepAndClickNext("Roles", "Here you can see all the existing roles and edit their");
                AssertStepAndClickNext("Roles", "The System permissions at the top");
                AssertStepAndClickShepherdTarget("Roles", "Let's see a role we can edit!");
                AssertStepAndClickNext("Roles", "A role is a collection of permissions that the user has.");
                AssertStepAndClickShepherdTarget("Roles", "Not much to tune on this role, but click on the \"Save\"");
                AssertStepAndClickNext(
                    "Roles", "If you change permissions of a role, then", assertShepherdTargetIsNotBody: false);
            });

        // Deployment
        await context.ExecuteLoggedAsync(
            "Deployment",
            async () =>
            {
                ////await context.GoToAdminRelativeUrlAsync("?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=deployment_intro");
                AssertStepAndClickNext(
                    "Deployment", "Let's take a look at exporting and importing,", assertShepherdTargetIsNotBody: false);
                AssertStepAndClickShepherdTarget("Deployment", "Click on \"Configuration\".");
                AssertStepAndClickShepherdTarget("Deployment", "Click on \"Import/Export\".");
                AssertStepAndClickShepherdTarget("Deployment", "We'll start with \"Deployment Plans\".");
                AssertStepAndClickNext("Deployment", "Here you would see the deployment plans, but we currently have");
                AssertStepAndClickShepherdTarget("Deployment", "Let's create a deployment plan! Click here.");
                AssertStep("Deployment", "Give it a name.");
                await ClickAndFillInShepherdTargetWithRetriesAsync("Sample deployment plan");
                ClickOnNextButton();
                AssertStepAndClickShepherdTarget("Deployment", "Now click on the \"Create\" button.");
                AssertStepAndClickShepherdTarget("Deployment", "Now we have a deployment plan, but it's empty.");
                AssertStepAndClickShepherdTarget("Deployment", "Click on the \"Add Step\" button.");
                AssertStepAndClickNext("Deployment", "Here you can see all the steps that you can use.");
                AssertStepAndClickNext("Deployment", "Let's filter for \"Update Content Definitions\"!");
                AssertStepAndClickShepherdTarget("Deployment", "\"Update Content Definitions\" exports the chosen");
                AssertStepAndClickNext("Deployment", "Here you can select which content types and parts you want");
                AssertStepAndClickShepherdTarget("Deployment", "If you're finished, click on the \"Create\" button.");
                AssertStepAndClickNext("Deployment", "As you can see, you added the step to the deployment plan. ");
                AssertStepAndClickShepherdTarget("Deployment", "Once you finished adding steps, you can click on");
                // The file will be downloaded to the default download location. It doesn't really matter.
                AssertStepAndClickShepherdTarget("Deployment", "Here you can use \"File Download\" so the exported");
                AssertStepAndClickShepherdTarget("Deployment", "We've now seen how to export content.");
                AssertStepAndClickShepherdTarget("Deployment", "Click on \"Import/Export\" again.");
                AssertStepAndClickShepherdTarget("Deployment", "Click on \"Package Import\".");
                AssertStepAndClickNext("Deployment", "Here you can import your exported deployment plan");
                // This will cause a validation error since we didn't select a file, but it's easier this way and an actual
                // upload is not necessary.
                AssertStepAndClickShepherdTarget(
                    "Deployment", "After you selected the file, click on \"Import\" to import");
                AssertStepAndClickNext(
                    "Deployment", "You can also import a piece of JSON", assertShepherdTargetIsNotBody: false);
            });

        // Themes and modules
        context.ExecuteLogged(
            "Themes and modules",
            () =>
            {
                ////await context.GoToAdminRelativeUrlAsync(
                ////    "/DeploymentPlan/Import/Index?shepherdTour=orchardCoreAdminWalkthrough&shepherdStep=features_and_themes_themes_intro");
                AssertStepAndClickNext(
                    "Themes and modules", "Now let's take a look at how plugins", assertShepherdTargetIsNotBody: false);
                AssertStepAndClickShepherdTarget("Themes and modules", "Click on \"Design\".");
                AssertStepAndClickShepherdTarget("Themes and modules", "Click on \"Themes\".");
                AssertStepAndClickNext("Themes and modules", "Here you can see and change the themes.");
                AssertStepAndClickNext(
                    "Themes and modules", "We'll continue with modules", assertShepherdTargetIsNotBody: false);
                AssertStepAndClickShepherdTarget("Themes and modules", "Click on \"Configuration\".");
                AssertStepAndClickShepherdTarget("Themes and modules", "Click on \"Features\".");
                AssertStepAndClickNext("Themes and modules", "Here you can see all the features");
            });

        // Outro
        context.ExecuteLogged(
            "Outro",
            () => AssertStep(
                "Walkthrough completed", "Congratulations! You completed the walkthrough.", assertShepherdTargetIsNotBody: false));
    }
}
