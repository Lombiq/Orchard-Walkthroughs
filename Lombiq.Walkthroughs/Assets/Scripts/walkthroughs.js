jQuery(($) => {
    (function LoadShepherd(Shepherd) {
        function getCookieValue(cookieName) {
            const name = cookieName + '=';
            const cookieArray = document.cookie.split(';').map((cookie) => cookie.trim());
            const resultCookie = cookieArray.find((cookie) => cookie.startsWith(name));
            return resultCookie ? decodeURIComponent(resultCookie.substring(name.length)) : null;
        }

        function deleteWalkthroughCookies() {
            const expireCookie = '=; expires = Thu, 01 Jan 1970 00:00:00 UTC; path = /;';
            document.cookie = 'Walkthrough' + expireCookie;
            document.cookie = 'WalkthroughStep' + expireCookie;
            document.cookie = 'IgnoreQueryStep' + expireCookie;
        }

        function setWalkthroughCookies(walkthroughValue, stepValue, ignoreQueryStepValue) {
            deleteWalkthroughCookies();
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getTime() + (1 * 60 * 60 * 1000));

            const WalkthroughCookieString = encodeURIComponent('Walkthrough') + '=' + encodeURIComponent(walkthroughValue) +
                '; expires=' + expirationDate.toUTCString() + '; path=/';
            document.cookie = WalkthroughCookieString;

            const WalkthroughStepCookieString = encodeURIComponent('WalkthroughStep') + '=' + encodeURIComponent(stepValue) +
                '; expires=' + expirationDate.toUTCString() + '; path=/';
            document.cookie = WalkthroughStepCookieString;

            const ignoreQueryStepString = encodeURIComponent('IgnoreQueryStep') + '=' + encodeURIComponent(ignoreQueryStepValue) +
                '; expires=' + expirationDate.toUTCString() + '; path=/';
            document.cookie = ignoreQueryStepString;
        }

        function getWalkthroughCookies() {
            const walkthroughCookieValue = getCookieValue('Walkthrough');
            const walkthroughStepCookieValue = getCookieValue('WalkthroughStep');
            const ignoreQueryStepCookieValue = getCookieValue('IgnoreQueryStep');

            return { walkthroughCookieValue, walkthroughStepCookieValue, ignoreQueryStepCookieValue };
        }

        // Unfortunately there are cases where, we can't go back with  "goToRelativePage()". For example the blog's
        // content item id is random and it's in the URL. So we can't hard code it in "goToRelativePage()". So we are
        // storing the URL in the cookie, before the next "Back" button. The drawback of this, is that if you call
        // "goToStoredStepUrl()" before the step that stored the URL (e.g. you went to the step not with the buttons,
        // but by typing it in the query parameters and jumping right to it), then it can break the walkthrough. So by
        // default "goToRelativePage()" is used and we are only using this function when there is no other choice.
        function setStoredStepUrlCookie() {
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getTime() + (1 * 60 * 60 * 1000));

            const storedStepUrlValueString = encodeURIComponent('StoredStepUrl') + '=' + encodeURIComponent(window.location.href) +
                '; expires=' + expirationDate.toUTCString() + '; path=/';
            document.cookie = storedStepUrlValueString;
        }

        function goToStoredStepUrl() {
            window.location.href = getCookieValue('StoredStepUrl');
        }

        function removeShepherdQueryParams() {
            const urlObject = new URL(window.location.href);

            urlObject.searchParams.delete('shepherdTour');
            urlObject.searchParams.delete('shepherdStep');
            window.history.pushState(null, '', urlObject.toString());
        }

        function addShepherdQueryParams() {
            const urlObject = new URL(window.location.href);

            urlObject.searchParams.set('shepherdTour', Shepherd.activeTour.options.id);
            urlObject.searchParams.set('shepherdStep', Shepherd.activeTour.getCurrentStep().id);
            window.history.pushState(null, '', urlObject.toString());
        }

        function getShepherdQueryParams() {
            const urlObject = new URL(window.location.href);

            const tourParam = urlObject.searchParams.get('shepherdTour');
            const stepParam = urlObject.searchParams.get('shepherdStep');

            return {
                shepherdTour: tourParam,
                shepherdStep: stepParam,
            };
        }

        function preventSubmit() {
            $('form').on('submit', function preventSubmitForForm(event) {
                event.preventDefault();
            });

            addShepherdQueryParams();
        }

        const backButton = {
            action: function () {
                return this.back();
            },
            classes: 'shepherd-button-secondary',
            text: 'Back',
        };

        const nextButton = {
            action: function () {
                return this.next();
            },
            text: 'Next',
        };

        // First part of current page means, what's after the first "/", from the relative URL. So if we have a tenant
        // which prefix is "test" and we have this URL:
        // https://localhost:44335/test/Admin/Contents/ContentItems/something, then it will be "Admin".
        function goToRelativePage(shepherdTour, shepherdStep, firstPartOfCurrentPage, nextPage) {
            let splitString = firstPartOfCurrentPage;

            if (!splitString) {
                splitString = '?';
            }
            else {
                splitString = new RegExp(splitString, 'i');
            }

            const goToRelativePageURL = new URL(
                window.location.href.split(splitString)[0] + (nextPage ?? ''));
            goToRelativePageURL.searchParams.set('shepherdTour', shepherdTour);
            goToRelativePageURL.searchParams.set('shepherdStep', shepherdStep);
            window.location.href = goToRelativePageURL.toString();
        }

        ['complete', 'cancel'].forEach((event) => Shepherd.on(event, () => {
            removeShepherdQueryParams();
            deleteWalkthroughCookies();
        }));

        // Add new walkthroughs here.
        const walkthroughs = {
            orchardCoreAdminWalkthrough: new Shepherd.Tour({
                // Tour id should be the same as the tour variable's name.
                id: 'orchardCoreAdminWalkthrough',
                useModalOverlay: true,
                defaultStepOptions: {
                    cancelIcon: {
                        enabled: true,
                    },
                    when: {
                        show() {
                            addShepherdQueryParams();
                        },
                    },
                },
                steps: [
                    {
                        title: 'Welcome in the<br>Orchard Core Admin Walkthrough!',
                        text: 'This walkthrough covers key Orchard Core features, such as content management, user roles, ' +
                            'and theme selection, and points users to further learning resources.',
                        buttons: [
                            {
                                action: function () {
                                    removeShepherdQueryParams();
                                    walkthroughs.orchardCoreAdminWalkthrough.complete();
                                    // The walkthroughSelector is later defined and orchardCoreAdminWalkthrough is only used later.
                                    // eslint-disable-next-line no-use-before-define
                                    walkthroughSelector.start();
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'welcome',
                    },
                    {
                        title: 'Setup recipe',
                        text: 'The setup recipe in <a href="https://github.com/Lombiq/Orchard-Walkthroughs">Lombiq.Walktroughs module</a>' +
                            ' used the <a href="https://github.com/OrchardCMS/OrchardCore/blob/main/src/OrchardCore.Themes/TheBlogTheme/Recipes/blog.recipe.json">Blog recipe</a>' +
                            ' as a base recipe. In Orchard Core, a <a href="https://docs.orchardcore.net/en/main/docs/reference/modules/Recipes/">recipe</a> ' +
                            'is a json file that defines a set of instructions for setting up and configuring an' +
                            ' Orchard Core application. Recipes can include predefined content types, widgets, menus, content items, and other' +
                            'configurations.They are used to streamline the setup of an Orchard Core site, making it easier ' +
                            '  to create consistent site structures and content. Recipes can be executed during the initial' +
                            ' setup of a site or at any point to apply configurations or import content.',
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'setup_recipe',
                    },
                    {
                        title: 'Site setup',
                        text: 'To get to this same point (a set up site), first you will need to get trhough the' +
                            ' <a href="https://github.com/OrchardCMS/OrchardCore/blob/main/src/OrchardCore.Themes/TheBlogTheme/Recipes/blog.recipe.json">' +
                            'setup screen</a>. You can also select there the before mentioned setup recipe.',
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'site_setup',
                    },
                    {
                        title: 'Log in',
                        text: 'Let\'s log in! Please go to the following URL <i>"~/Login"</i>, by clicking on the' +
                            ' <i>"Next"</i> button.',
                        buttons: [
                            backButton,
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'login_page', null, 'Login');
                                },
                                text: 'Next',
                            },
                        ],
                        id: 'logging_in',
                    },
                    {
                        title: 'Log in page',
                        text: 'Here you can log in. You will need to input a username or email address and a password.',
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'logging_in', 'Login');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'login_page',
                        when: {
                            show() {
                                // If the user typed a wrong URL don't go ahead.
                                // The best way to check this, is to check for specific element(s). We don't want to
                                // check the URL, since the case can vary and also, we can't account for the tenant.
                                if (!$('button[type="Submit"]').length) {
                                    deleteWalkthroughCookies();
                                    Shepherd.activeTour.back();
                                    return;
                                }

                                // If the user presses enter, the form will be submitted and the steps will be skipped.
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Username',
                        attachTo: { element: '#UserName', on: 'bottom' },
                        text: 'Input your username, for test sites the usually used username is <i>"admin"</i>.',
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'login_username',
                        when: {
                            show() {
                                // Needs to be added to other steps in this page, so a reload doesn't break it.
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Username',
                        attachTo: { element: '#Password', on: 'bottom' },
                        text: 'Input your password, for test sites the usually used password is <i>"Password1!"</i>.',
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'login_password',
                        when: {
                            show() {
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Logging in',
                        attachTo: { element: 'button[type="Submit"]', on: 'bottom' },
                        text: 'Now you can log in!',
                        buttons: [
                            backButton,
                        ],
                        id: 'login_login',
                        when: {
                            show() {
                                $('form').off('submit');

                                $('form').on('submit', function addWalkthroughCookieValue() {
                                    setWalkthroughCookies(Shepherd.activeTour.options.id, 'login_logged_in');
                                });

                                addShepherdQueryParams();
                            },
                        },
                    },
                    {
                        title: 'Logged in',
                        text: 'Now you logged in!',
                        buttons: [
                            // The user already logged in, there is no reason to go back to the login page.
                            nextButton,
                        ],
                        id: 'login_logged_in',
                        when: {
                            show() {
                                // If login is failed don't go ahead.
                                if ($('.field-validation-error[data-valmsg-for="Password"]').length ||
                                    $('.field-validation-error[data-valmsg-for="UserName"]').length) {
                                    deleteWalkthroughCookies();
                                    Shepherd.activeTour.back();
                                    return;
                                }
                                addShepherdQueryParams();
                            },
                        },
                    },
                    {
                        title: 'Admin dashboard',
                        text: 'Let\'s see the admin dashboard now. Please go to the following URL <i>"~/Admin"</i>, ' +
                            'by clicking on the <i>"Next"</i> button.',
                        buttons: [
                            backButton,
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'admin_dashboard_page', null, 'Admin');
                                },
                                text: 'Next',
                            },
                        ],
                        id: 'admin_dashboard_enter',
                    },
                    {
                        title: 'Admin dashboard',
                        text: 'Welcome to the admin dashboard! The admin dashboard serves as the centralized ' +
                            'control panel for managing and configuring various aspects of the Orchard Core ' +
                            'application.',
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'admin_dashboard_enter', 'Admin');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'admin_dashboard_page',
                        when: {
                            show() {
                                // If the user typed a wrong URL don't go ahead.
                                if (!$('h4:contains("Welcome to Orchard Core")').length) {
                                    deleteWalkthroughCookies();
                                    Shepherd.activeTour.back();
                                    return;
                                }

                                addShepherdQueryParams();
                            },
                        },
                    },
                    {
                        title: 'Side menu',
                        text: 'This is the side menu, that organizes essential functionalities. This menu includes' +
                            ' key sections such as content management, security settings, and other administrative' +
                            ' options.',
                        attachTo: { element: '#ta-left-sidebar', on: 'right' },

                        // Making side navigation unclickable, so the user can't go somewhere else.
                        canClickTarget: false,
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'admin_dashboard_side_menu',
                    },
                    {
                        title: 'Top menu',
                        text: 'This is the top menu. Here you can switch between dark and light mode, go to the' +
                            ' homepage and log off or take a look at your profile.',
                        attachTo: { element: '.nav.navbar.user-top-navbar', on: 'bottom' },

                        // Making top navigation unclickable, so the user can't go somewhere else.
                        canClickTarget: false,
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'admin_dashboard_top_menu',
                    },
                    {
                        title: 'Creating a new blog post',
                        text: 'Let\'s create a new blog post. The blog post content type is already defined because' +
                            ' the setup recipe used the <a href="https://github.com/OrchardCMS/OrchardCore/blob/main/src/OrchardCore.Themes/TheBlogTheme/Recipes/blog.recipe.json">' +
                            'Blog recipe</a> as a base. There is also a singular blog content item and there is a ' +
                            'menu point for it. Click on the <i>"Blog"</i> button and you will see all the blog ' +
                            'posts within the blog.',
                        attachTo: { element: '.icon-class-fas.icon-class-fa-rss.item-label.d-flex', on: 'right' },
                        buttons: [
                            backButton,
                        ],
                        id: 'creating_blog_post',
                        when: {
                            show() {
                                setWalkthroughCookies(this.tour.options.id, 'creating_blog_post_blog');
                                addShepherdQueryParams();
                            },
                        },
                    },
                    {
                        title: 'Creating a new blog post',
                        text: 'Here you can see the blog posts inside the blog. There is already an example one ' +
                            'beacuse of the <a href="https://github.com/OrchardCMS/OrchardCore/blob/main/src/OrchardCore.Themes/TheBlogTheme/Recipes/blog.recipe.json">' +
                            'Blog recipe</a>.',
                        attachTo: { element: '#ci-sortable', on: 'top' },

                        // Making the blog posts unclickable, so the user can't go somewhere else.
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'creating_blog_post', 'Admin', 'Admin');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'creating_blog_post_blog',
                    },
                    {
                        title: 'Creating a new blog post',
                        text: 'Click here to create a new blog post!',
                        attachTo: { element: '.btn.btn-secondary[href*="BlogPost/Create"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'creating_blog_post_create_button',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setStoredStepUrlCookie();
                                setWalkthroughCookies(this.tour.options.id, 'creating_blog_post_content_editor');
                            },
                        },
                    },
                    {
                        title: 'Creating a new blog post',
                        text: 'Here you can create the blog post.',
                        buttons: [
                            {
                                action: function () {
                                    goToStoredStepUrl();
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'creating_blog_post_content_editor',
                    },
                    {
                        title: 'Title',
                        text: 'Let\'s give it a title!',
                        attachTo: { element: '#TitlePart_Title', on: 'bottom' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'creating_blog_post_title',
                        when: {
                            show() {
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Permalink',
                        text: 'You can give it an URL, but you can leave it empty to auto-generate it!',
                        attachTo: { element: '#AutoroutePart_Path', on: 'bottom' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'creating_blog_post_permalink',
                        when: {
                            show() {
                                // Needs to be added to other steps in this page, so a reload doesn't break it.
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Markdown editor',
                        text: 'This is a Markdown editor, the core of your blog post.' +
                            ' <a href="https://www.markdownguide.org/basic-syntax/">Here is a guide for Markdown syntax</a>.' +
                            ' The Markdown editor uses' +
                            ' <a href="https://github.com/Ionaru/easy-markdown-editor#easymde---markdown-editor">EasyMDE</a>.',
                        attachTo: { element: '.EasyMDEContainer', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'creating_blog_post_markdown_editor',
                        when: {
                            show() {
                                // Needs to be added to other steps in this page, so a reload doesn't break it.
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Subtitle',
                        text: 'You can set the subtitle of your blog post.',
                        attachTo: { element: '#BlogPost_Subtitle_Text', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'creating_blog_post_subtitle',
                        when: {
                            show() {
                                // Needs to be added to other steps in this page, so a reload doesn't break it.
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Banner image',
                        text: 'You can add an image for your blog post, if you want. Click on the <i>"+"</i> sign.',
                        attachTo: { element: '#BlogPost_Image', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'creating_blog_post_banner_image',
                        when: {
                            show() {
                                $('a.btn.btn-secondary.btn-sm:not(.disabled)').on('click', function moveOverlay() {
                                    // 1050 is when the media library window is in front of the overlay, but everything
                                    // else is under it.
                                    $('.shepherd-modal-overlay-container').css('z-index', 1050);
                                    $('div[data-shepherd-step-id="creating_blog_post_banner_image"]').css('z-index', 1050);
                                });

                                // Needs to be added to other steps in this page, so a reload doesn't break it.
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Tags',
                        text: 'You can add tags to your blog post.',
                        attachTo: { element: '#BlogPost_Tags_TermContentItemIds_FieldWrapper', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'creating_blog_post_tags',
                        when: {
                            show() {
                                // Needs to be added to other steps in this page, so a reload doesn't break it.
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Category',
                        text: 'You can also select the category of your blog post.',
                        attachTo: { element: '#BlogPost_Category_TermEntries_FieldWrapper', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'creating_blog_post_category',
                        when: {
                            show() {
                                // Needs to be added to other steps in this page, so a reload doesn't break it.
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Preview',
                        text: 'Before publishing your blog post, you can preview what would it look like on the ' +
                            'frontend. You could click on the preview button, but since we are finished, let\'s just' +
                            ' publish it.',
                        attachTo: { element: '#previewButton', on: 'top' },

                        // We don't want to go back and forth between the admin dashboard, so we won't allow the
                        // user, to actually use the preview button, but we will let one know.
                        canClickTarget: false,
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'creating_blog_post_preview',
                        when: {
                            show() {
                                // Needs to be added to other steps in this page, so a reload doesn't break it.
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Publishing',
                        text: 'We are ready, let\'s publish the blog post. Click on the publish button.',
                        attachTo: { element: 'button[name="submit.Publish"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'creating_blog_post_publishing',
                        when: {
                            show() {
                                $('form').off('submit');
                                addShepherdQueryParams();
                                setStoredStepUrlCookie();

                                // The return URL would redirect us to the "creating_blog_post_create_button" step, so
                                // we are ignoring the query parameter.
                                setWalkthroughCookies(this.tour.options.id, 'creating_blog_post_published', 'creating_blog_post_create_button');
                            },
                        },
                    },
                    {
                        title: 'Viewing the blog post',
                        text: 'The blog post is published. Click on the <i>"View"</i> button to see it.',
                        attachTo: { element: '.btn.btn-sm.btn-success.view', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToStoredStepUrl();
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'creating_blog_post_published',
                        when: {
                            show() {
                                setWalkthroughCookies(this.tour.options.id, 'creating_blog_post_inspecting');
                                addShepherdQueryParams();
                                setStoredStepUrlCookie();
                            },
                        },
                    },
                    {
                        title: 'Viewing the blog post',
                        text: 'Here is you published blog post.',
                        attachTo: { element: 'body', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToStoredStepUrl();
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'creating_blog_post_inspecting',
                    },
                    {
                        title: 'Creating a new article',
                        text: 'Now let\'s create an article. Just as the blog post content type, article is already' +
                            ' defined and it comes from the <a href="https://github.com/OrchardCMS/OrchardCore/blob/main/src/OrchardCore.Themes/TheBlogTheme/Recipes/blog.recipe.json">' +
                            'Blog recipe</a> that we used as the base of the setup recipe. Go to the admin dashboard ' +
                            'by clicking on the <i>"Next"</i> button.',
                        buttons: [
                            backButton,
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'creating_article_dashboard', 'blog', 'Admin');
                                },
                                text: 'Next',
                            },
                        ],
                        id: 'creating_article_intro',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setStoredStepUrlCookie();
                            },
                        },
                    },
                    {
                        title: 'Creating a new article',
                        text: 'Click on the <i>"Content"</i> dropdown.',
                        attachTo: { element: '#content', on: 'right' },
                        buttons: [
                            {
                                action: function () {
                                    goToStoredStepUrl();
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'creating_article_dashboard',
                        advanceOn: { selector: '#content', event: 'click' },
                    },
                    {
                        title: 'Creating a new article',
                        text: 'Now click on the <i>"Content Types"</i> dropdown to see what type of content items you' +
                            ' can create.',
                        // There is no proper basic JS selector, to select the element, so we need to use a
                        // function.
                        savedElement: $('[title="Content Types"]').parent().get(0),
                        attachTo: {

                            element: function getContentTypesButton() {
                                return this.options.savedElement;
                            },
                            on: 'right',
                        },
                        buttons: [
                            {
                                action: function () {
                                    $('[data-title="Content"]').removeClass('show');
                                    this.back();
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'creating_article_content_types',
                        // We should "advanceOn" the same button as "attachTo", but shepherd.js doesn't accept a
                        // function for that, so we are adding an event listener.
                        when: {
                            show() {
                                addShepherdQueryParams();
                                const element = this.options.savedElement;

                                if (element.getAttribute('listener') !== 'true') {
                                    element.addEventListener('click', function advanceToNextStep() {
                                        element.setAttribute('listener', 'true');
                                        Shepherd.activeTour.next();
                                    });
                                }
                            },
                        },
                    },
                    {
                        title: 'Creating a new article',
                        text: 'Here we have the article content type. Click on it.',
                        attachTo: { element: 'a[href*= "Article"]', on: 'right' },
                        buttons: [
                            {
                                action: function () {
                                    $('[data-title="Content Types"]').removeClass('show');
                                    this.back();
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'creating_article_content_types_article',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'creating_article_articles');
                            },
                        },
                    },
                    {
                        title: 'Creating a new article',
                        text: 'Here you can see all the articles. As you can see, there is already one.',
                        attachTo: { element: '.list-group.with-checkbox', on: 'top' },
                        // Making the list unclickable, so the user can't go somewhere else.
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'creating_article_content_types_article', 'Admin', 'Admin');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'creating_article_articles',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'creating_article_create_button');
                            },
                        },
                    },
                    {
                        title: 'Creating a new article',
                        text: 'Click here to create a new article.',
                        attachTo: { element: '.btn.btn-secondary[href*="Article/Create"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'creating_article_create_button',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'creating_article_editor');
                                setStoredStepUrlCookie();
                            },
                        },
                    },
                    {
                        title: 'Creating a new article',
                        text: 'Here you can create the article.',
                        buttons: [
                            {
                                action: function () {
                                    goToStoredStepUrl();
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'creating_article_editor',
                        when: {
                            show() {
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Title',
                        text: 'Let\'s give it a title.',
                        attachTo: { element: '#TitlePart_Title', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'creating_article_title',
                        when: {
                            show() {
                                // Needs to be added to other steps in this page, so a reload doesn't break it.
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Permalink',
                        text: 'You can give it an URL, but you can leave it empty to auto-generate it!',
                        attachTo: { element: '#AutoroutePart_Path', on: 'bottom' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'creating_article_permalink',
                        when: {
                            show() {
                                // Needs to be added to other steps in this page, so a reload doesn't break it.
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Set as homepage',
                        text: 'You can set this article as the homepage, but let\'s not do that now.',
                        attachTo: { element: '#AutoroutePart_SetHomepage', on: 'top' },
                        canClickTarget: false,
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'creating_article_set_as_homepage',
                        when: {
                            show() {
                                // Needs to be added to other steps in this page, so a reload doesn't break it.
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'HTML Body',
                        text: 'This is the HTML Body, the core of an article. The HTML Body editor in Orchard Core' +
                            ' enables direct input of HTML code with rich formatting options and multimedia ' +
                            'embedding, offering extensive control over layout and styling.In contrast, the Markdown' +
                            ' editor for Blog Post simplifies content creation using text- based Markdown syntax, ' +
                            'promoting ease of use and consistency but with fewer advanced formatting choices' +
                            ' compared to HTML.',
                        attachTo: { element: '.content-part-wrapper.content-part-wrapper-html-body-part', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'creating_article_html_body',
                        when: {
                            show() {
                                // Needs to be added to other steps in this page, so a reload doesn't break it.
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Subtitle',
                        text: 'You can set the subtitle of your article.',
                        attachTo: { element: '#Article_Subtitle_Text', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'creating_article_subtitle',
                        when: {
                            show() {
                                // Needs to be added to other steps in this page, so a reload doesn't break it.
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Banner image',
                        text: 'You can add an image for your article, if you want. Click on the <i>"+"</i> sign.',
                        attachTo: { element: '#Article_Image', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'creating_article_banner_image',
                        when: {
                            show() {
                                $('a.btn.btn-secondary.btn-sm:not(.disabled)').on('click', function moveOverlay() {
                                    // 1050 is when the media library window is in front of the overlay, but everything
                                    // else is under it.
                                    $('.shepherd-modal-overlay-container').css('z-index', 1050);
                                    $('div[data-shepherd-step-id="creating_article_banner_image"]').css('z-index', 1050);
                                });

                                // Needs to be added to other steps in this page, so a reload doesn't break it.
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Preview',
                        text: 'Before publishing your article, you can preview what would it look like on the ' +
                            'frontend (as with the blog post). You could click on the preview button, but since we' +
                            ' are finished, let\'s just publish it.',
                        attachTo: { element: '#previewButton', on: 'top' },

                        // We don't want to go back and forth between the admin dashboard, so we won't allow the
                        // user, to actually use the preview button, but we will let one know.
                        canClickTarget: false,
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'creating_blog_post_preview',
                        when: {
                            show() {
                                // Needs to be added to other steps in this page, so a reload doesn't break it.
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Publishing',
                        text: 'We are ready, let\'s publish the article. Click on the publish button.',
                        attachTo: { element: 'button[name="submit.Publish"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'creating_article_publishing',
                        when: {
                            show() {
                                $('form').off('submit');
                                addShepherdQueryParams();
                                setStoredStepUrlCookie();

                                // The return URL would redirect us to the "creating_article_create_button" step, so
                                // we are ignoring the query parameter.
                                setWalkthroughCookies(this.tour.options.id, 'creating_article_published', 'creating_article_create_button');
                            },
                        },
                    },
                    {
                        title: 'Viewing the article',
                        text: 'The article is published. Click on the <i>"View"</i> button to see it.',
                        attachTo: { element: '.btn.btn-sm.btn-success.view', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToStoredStepUrl();
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'creating_article_published',
                        when: {
                            show() {
                                setWalkthroughCookies(this.tour.options.id, 'creating_article_inspecting');
                                addShepherdQueryParams();
                                setStoredStepUrlCookie();
                            },
                        },
                    },
                    {
                        title: 'Viewing the article',
                        text: 'Here is you published article.',
                        attachTo: { element: 'body', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToStoredStepUrl();
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'creating_article_inspecting',
                    },
                    {
                        title: 'Adding article to menu',
                        text: 'As you can see, the sample article that was created from the recipe is in the menu.' +
                            'Click on <i>"About"</i>.',
                        attachTo: { element: 'a[href*="about"', on: 'bottom' },
                        buttons: [
                            backButton,
                        ],
                        id: 'adding_article_to_menu_intro',
                        when: {
                            show() {
                                setWalkthroughCookies(this.tour.options.id, 'adding_article_to_menu_about');
                                addShepherdQueryParams();
                                setStoredStepUrlCookie();
                            },
                        },

                    },
                    {
                        title: 'Adding article to menu',
                        text: 'As you can see, you can access easily to itm through the menu. Let\'s add the' +
                            ' article that we are created too. Go to the admin dashboard by clicking on the' +
                            ' <i>"Next"</i> button.',
                        attachTo: { element: 'body', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToStoredStepUrl();
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'adding_article_to_menu_dashboard', 'about', 'Admin');
                                },
                                text: 'Next',
                            },
                        ],
                        id: 'adding_article_to_menu_about',
                    },
                    {
                        title: 'Adding article to menu',
                        text: 'Click on the <i>"Main Menu"</i> button.',
                        attachTo: { element: '.icon-class-fas.icon-class-fa-sitemap.item-label.d-flex', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'adding_article_to_menu_about', 'Admin', 'about');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'adding_article_to_menu_dashboard',
                        when: {
                            show() {
                                setWalkthroughCookies(this.tour.options.id, 'adding_article_to_menu_main_menu');
                                addShepherdQueryParams();
                            },
                        },
                    },
                    {
                        title: 'Adding article to menu',
                        text: 'Here you can see all the menu items.',
                        attachTo: { element: '.edit-body', on: 'top' },
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'adding_article_to_menu_dashboard', 'Admin', 'Admin');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'adding_article_to_menu_main_menu',
                    },
                    {
                        title: 'Adding article to menu',
                        text: 'Let\'s add the new article that we created. Click on the <i>"Add Menu Item"</i> button.',
                        attachTo: { element: 'button[data-bs-target="#modalMenuItems"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'adding_article_to_menu_add_menu_item_button',
                        advanceOn: { selector: 'button[data-bs-target="#modalMenuItems"]', event: 'click' },
                    },
                    {
                        title: 'Adding article to menu',
                        text: 'You can choose between mutliple menu items. Read the description too see how they' +
                            ' are different.',
                        attachTo: { element: '.modal-body', on: 'top' },
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    if ($('#modalMenuItems').attr('aria-hidden') !== 'true') {
                                        $('button[data-bs-target="#modalMenuItems"]').click();
                                    }
                                    this.back();
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'adding_article_to_menu_add_menu_item_selecting',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                const modal = $('#modalMenuItems');

                                if (!modal || modal.attr('aria-hidden') === 'true') {
                                    $('button[data-bs-target="#modalMenuItems"]').click();
                                }
                            },
                        },
                    },
                    {
                        title: 'Adding article to menu',
                        text: 'For now let\'s go with the, Link Menu Item one. Click on the <i>"Add"</i> button.',
                        attachTo: { element: 'a[href*="Create/LinkMenuItem"]', on: 'bottom' },
                        buttons: [
                            backButton,
                        ],
                        id: 'adding_article_to_menu_link_menu_item',
                        when: {
                            show() {
                                setWalkthroughCookies(this.tour.options.id, 'adding_article_to_menu_link_menu_item_name');
                                addShepherdQueryParams();
                                setStoredStepUrlCookie();
                                const modal = $('#modalMenuItems');

                                if (!modal || modal.attr('aria-hidden') === 'true') {
                                    $('button[data-bs-target="#modalMenuItems"]').click();
                                }
                            },
                        },
                    },
                    {
                        title: 'Adding article to menu',
                        text: 'Let\'s give it a name.',
                        attachTo: { element: '#LinkMenuItemPart_Name', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToStoredStepUrl();
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'adding_article_to_menu_link_menu_item_name',
                        when: {
                            show() {
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Adding article to menu',
                        text: 'Let\'s give it your article\'s URL. Make sure to include the relative path <i>"~"</i>.',
                        attachTo: { element: '#LinkMenuItemPart_Url', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'adding_article_to_menu_link_menu_item_url',
                        when: {
                            show() {
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Adding article to menu',
                        text: 'We are ready, let\'s publish the link menu item. Click on the publish button.',
                        attachTo: { element: 'button[name="submit.Publish"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'adding_article_to_menu_publishing',
                        when: {
                            show() {
                                $('form').off('submit');
                                addShepherdQueryParams();
                                setStoredStepUrlCookie();
                                setWalkthroughCookies(this.tour.options.id, 'adding_article_to_menu_published');
                            },
                        },
                    },
                    {
                        title: 'Adding article to menu',
                        text: 'You can reorder menu items by dragging them.',
                        attachTo: { element: '#menu', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToStoredStepUrl();
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'adding_article_to_menu_published',
                    },
                    {
                        title: 'Adding article to menu',
                        text: 'You will also need to publish the menu itself too, click on the publish button!',
                        attachTo: { element: 'button[name="submit.Publish"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'adding_article_to_menu_publishing2',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'adding_article_to_menu_published2');
                            },
                        },
                    },
                    {
                        title: 'Adding article to menu',
                        text: 'Your article is now available from the menu. Let\'s see it, click on the' +
                            ' <i>"Next"</i> button to go to the home page.',
                        buttons: [
                            backButton,
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'adding_article_to_menu_inspecting', 'Admin');
                                },
                                text: 'Next',
                            },
                        ],
                        id: 'adding_article_to_menu_published2',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setStoredStepUrlCookie();
                            },
                        },
                    },
                    {
                        title: 'Adding article to menu',
                        text: 'Your article is now available from the menu. Let\'s see it, click on the' +
                            ' <i>"Next"</i> button to go to the home page.',
                        buttons: [
                            {
                                action: function () {
                                    goToStoredStepUrl();
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'adding_article_to_menu_inspecting',
                    },
                    {
                        title: 'Content list',
                        text: 'Now let\'s go back to the admin dashboard. Click on the <i>"Next</i> button.',
                        buttons: [
                            backButton,
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'content_list_admin_dashboard', null, 'Admin');
                                },
                                text: 'Next',
                            },
                        ],
                        id: 'content_list_intro',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setStoredStepUrlCookie();
                            },
                        },
                    },
                    {
                        title: 'Content list',
                        text: 'Click on the <i>"Content"</i> dropdown.',
                        attachTo: { element: '#content', on: 'right' },
                        buttons: [
                            {
                                action: function () {
                                    goToStoredStepUrl();
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'content_list_admin_dashboard',
                        advanceOn: { selector: '#content', event: 'click' },
                    },
                    {
                        title: 'Content list',
                        text: 'Now click on the <i>"Content Items"</i> button.',
                        // There is no proper basic JS selector, to select the element, so we need to use a
                        // function.
                        savedElement: $('[title="Content Items"]').parent().get(0),
                        attachTo: {

                            element: function getContentItemsButton() {
                                return this.options.savedElement;
                            },
                            on: 'right',
                        },
                        buttons: [
                            {
                                action: function () {
                                    $('[data-title="Content"]').removeClass('show');
                                    this.back();
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'content_list_admin_content_items_menu',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'content_list_admin_content_items');
                            },
                        },
                    },
                    {
                        title: 'Content list',
                        text: 'Notice how we can see (and filter for) all the content items (articles, blog' +
                            ' posts etc.). Previously we accessed these from various menu shortcuts.',
                        attachTo: { element: '#items-form', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'content_list_admin_content_items_menu', 'Admin', 'Admin');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'content_list_admin_content_items',
                    },
                ],
            }),

        };

        ['complete', 'cancel'].forEach((event) => walkthroughs.orchardCoreAdminWalkthrough.on(event, () => {
            // Remove any form submit prevention.
            $('form').off('submit');
        }));

        const walkthroughSelector = new Shepherd.Tour({
            id: 'walkthroughSelector',
            useModalOverlay: true,

            defaultStepOptions: {
                cancelIcon: {
                    enabled: true,
                },
            },
            steps: [
                {
                    title: 'Select walkthrough!',
                    text: 'Welcome! The <a href="https://github.com/Lombiq/Orchard-Walkthroughs">Lombiq.Walktroughs module</a>' +
                        ' module is active. This module includes various walkthroughs. You can get back here, by ' +
                        ' canceling the current walkthrough and pressing the button on the homepage. Please only use, ' +
                        'the walkthroughs\' built in navigations! Please select a walkthrough to start:',
                    buttons: [
                        {
                            text: 'Orchard Core Admin Walkthrough',
                            action: function () {
                                walkthroughSelector.complete();
                                walkthroughs.orchardCoreAdminWalkthrough.start();
                            },
                            classes: 'shepherd-button shepherd-button-primary',
                        },
                        // Add new walkthroughs here.
                    ],
                    id: 'walkthroughSelector',
                },
            ],
        });

        const queryParams = getShepherdQueryParams();
        const walkthroughCookies = getWalkthroughCookies();

        if (queryParams.shepherdTour &&
            queryParams.shepherdStep &&
            walkthroughCookies.ignoreQueryStepCookieValue !== queryParams.shepherdStep) {
            const currentTour = walkthroughs[queryParams.shepherdTour];
            currentTour.start();
            currentTour.show(queryParams.shepherdStep);
        }
        else if (walkthroughCookies.walkthroughCookieValue && walkthroughCookies.walkthroughStepCookieValue) {
            const walktrough = walkthroughCookies.walkthroughCookieValue;
            const step = walkthroughCookies.walkthroughStepCookieValue;

            deleteWalkthroughCookies();

            const currentTour = walkthroughs[walktrough];
            currentTour.start();
            currentTour.show(step);

            addShepherdQueryParams();
        }

        const walkthroughSelectorButton = $('#walkthrough-selector-button');

        if (walkthroughSelectorButton) {
            walkthroughSelectorButton.on('click', function startWalkthroughSelector() {
                walkthroughSelector.start();
            });
        }
    })(window.Shepherd);
});
