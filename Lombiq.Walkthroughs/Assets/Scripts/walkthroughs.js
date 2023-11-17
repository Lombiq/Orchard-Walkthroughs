jQuery(($) => {
    (function LoadShepherd(Shepherd) {
        function deleteWalkthroughCookies() {
            document.cookie = 'Walkthrough=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'WalkthroughStep=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }

        function setWalkthroughCookies(walkthroughValue, stepValue) {
            deleteWalkthroughCookies();
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getTime() + (1 * 60 * 60 * 1000));

            const WalkthroughCookieString = encodeURIComponent('Walkthrough') + '=' + encodeURIComponent(walkthroughValue) +
                '; expires=' + expirationDate.toUTCString() + '; path=/';
            document.cookie = WalkthroughCookieString;

            const WalkthroughStepCookieString = encodeURIComponent('WalkthroughStep') + '=' + encodeURIComponent(stepValue) +
                '; expires=' + expirationDate.toUTCString() + '; path=/';
            document.cookie = WalkthroughStepCookieString;
        }

        function getWalkthroughCookies() {
            const getCookieValue = (cookieName) => {
                const name = cookieName + '=';
                const cookieArray = document.cookie.split(';').map((cookie) => cookie.trim());
                const resultCookie = cookieArray.find((cookie) => cookie.startsWith(name));
                return resultCookie ? decodeURIComponent(resultCookie.substring(name.length)) : null;
            };

            const walkthroughCookieValue = getCookieValue('Walkthrough');
            const walkthroughStepCookieValue = getCookieValue('WalkthroughStep');

            return { walkthroughCookieValue, walkthroughStepCookieValue };
        }

        function removeShepherdQueryParams() {
            const urlObject = new URL(window.location.href);

            urlObject.searchParams.delete('shepherdTour');
            urlObject.searchParams.delete('shepherdStep');
            window.history.replaceState(null, '', urlObject.toString());
        }

        function addShepherdQueryParams() {
            const urlObject = new URL(window.location.href);

            urlObject.searchParams.set('shepherdTour', Shepherd.activeTour.options.id);
            urlObject.searchParams.set('shepherdStep', Shepherd.activeTour.getCurrentStep().id);
            window.history.replaceState(null, '', urlObject.toString());
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

        function getBackToHomePage(shepherdTour, shepherdStep) {
            let currentPage = window.location.href;
            currentPage = currentPage.substring(
                currentPage.lastIndexOf('/') + 1,
                currentPage.indexOf('?')
            );

            const returnToHomePageURL = new URL(window.location.href.split(currentPage)[0]);
            returnToHomePageURL.searchParams.set('shepherdTour', shepherdTour);
            returnToHomePageURL.searchParams.set('shepherdStep', shepherdStep);
            window.location.href = returnToHomePageURL.toString();
        }

        function goToRelativePage(page) {
            removeShepherdQueryParams();
            window.location.href += page;
        }

        function enableOrDisableClickingOnElement(element, enableOrDisable) {
            const enableOrDisableElementClick = typeof enableOrDisable === 'boolean' ? enableOrDisable : false;

            element.css({
                'pointer-events': enableOrDisableElementClick ? 'auto' : 'none',
            });
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
                        // We could link the login page, but if the site is on a subtenant, then we can't get the relative path.
                        text: 'Let\'s log in! Please go to the following URL, by typing it into the search bar' +
                            ' <i>"~/Login"</i>, or click on the <i>"Next"</i> button.',
                        buttons: [
                            backButton,
                            {
                                action: function () {
                                    goToRelativePage('Login');
                                },
                                text: 'Next',
                            },
                        ],
                        id: 'logging_in',
                        when: {
                            show() {
                                setWalkthroughCookies(this.tour.options.id, 'login_page');
                                addShepherdQueryParams();
                            },
                        },
                    },
                    {
                        title: 'Log in page',
                        text: 'Here you can log in. You will need to input a username or email address and a password.',
                        buttons: [
                            {
                                action: function () {
                                    getBackToHomePage(Shepherd.activeTour.options.id, 'logging_in');
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
                        // We could link the admin page, but if the site is on a subtenant, then we can't get the relative path.
                        text: 'Let\'s see the admin dashboard now. Please go to the following URL, by typing it into' +
                            ' the search bar <i>"~/Admin"</i>, or click on the <i>"Next"</i> button.',
                        buttons: [
                            backButton,
                            {
                                action: function () {
                                    goToRelativePage('Admin');
                                },
                                text: 'Next',
                            },
                        ],
                        id: 'admin_dashboard_enter',
                        when: {
                            show() {
                                setWalkthroughCookies(this.tour.options.id, 'admin_dashboard_page');
                                addShepherdQueryParams();
                            },
                        },
                    },
                    {
                        title: 'Admin dashboard',
                        text: 'Welcome to the admin dashboard! The admin dashboard serves as the centralized ' +
                            'control panel for managing and configuring various aspects of the Orchard Core ' +
                            'application.',
                        buttons: [
                            {
                                action: function () {
                                    getBackToHomePage(Shepherd.activeTour.options.id, 'admin_dashboard_enter');
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
                        buttons: [
                            backButton,
                            {
                                action: function () {
                                    enableOrDisableClickingOnElement($('#left-nav'), true);
                                    return this.next();
                                },
                                text: 'Next',
                            },
                        ],
                        id: 'admin_dashboard_side_menu',
                        when: {
                            show() {
                                // Making side navigation unclickable, so the user can't go somewhere else.
                                enableOrDisableClickingOnElement($('#left-nav'));
                                addShepherdQueryParams();
                            },
                        },
                    },
                    {
                        title: 'Top menu',
                        text: 'This is the top menu. Here you can switch between dark and light mode, go to the' +
                            ' homepage and log off or take a look at your profile.',
                        attachTo: { element: '.nav.navbar.user-top-navbar', on: 'bottom' },
                        buttons: [
                            backButton,
                            {
                                action: function () {
                                    enableOrDisableClickingOnElement($('.nav.navbar.user-top-navbar'), true);
                                    return this.next();
                                },
                                text: 'Next',
                            },
                        ],
                        id: 'admin_dashboard_top_menu',
                        when: {
                            show() {
                                // Making top navigation unclickable, so the user can't go somewhere else.
                                enableOrDisableClickingOnElement($('.nav.navbar.user-top-navbar'));
                                addShepherdQueryParams();
                            },
                        },
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
                        buttons: [
                            {
                                action: function () {
                                    // Need -2 because of the addShepherdQueryParams() function.
                                    window.history.go(-2);
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'creating_blog_post_blog',
                        when: {
                            show() {
                                // Making the blog posts unclickable, so the user can't go somewhere else.
                                enableOrDisableClickingOnElement($('#ci-sortable'));
                                addShepherdQueryParams();
                            },
                        },
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
                                setWalkthroughCookies(this.tour.options.id, 'creating_blog_post_content_editor');
                                addShepherdQueryParams();

                                // We need this to avoid having a step in the return url.
                                $('.btn.btn-secondary[href*="BlogPost/Create"]').on('click', function removeShepherdQueryParamsBeforePageSwitch() {
                                    removeShepherdQueryParams();
                                });
                            },
                        },
                    },
                    {
                        title: 'Creating a new blog post',
                        text: 'Here you can create the blog post.',
                        buttons: [
                            {
                                action: function () {
                                    // Need -2 because of the addShepherdQueryParams() function.
                                    window.history.go(-2);
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
                        id: 'creating_blog_post_URL',
                        when: {
                            show() {
                                // Needs to be added to other steps in this page, so a reload doesn't break it.
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Markdown editor',
                        text: 'This is a Markdown editor, the core of you blog post.' +
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
                        text: 'You can set the subtitle of you blog post.',
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
                        text: 'You can add an image for you blog post, if you want. Click on the <i>"+"</i> sign.',
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
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'creating_blog_post_preview',
                        when: {
                            show() {
                                // Needs to be added to other steps in this page, so a reload doesn't break it.
                                preventSubmit();

                                // We don't want to go back and forth between the admin dashboard, so we won't allow the
                                // user, to actually use the preview button, but we will let one know.
                                enableOrDisableClickingOnElement($('#previewButton'));
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
                                setWalkthroughCookies(this.tour.options.id, 'creating_blog_post_published');
                            },
                        },
                    },
                    {
                        title: 'Blog post',
                        text: 'We are ready, let\'s publish the blog post. Click on the publish button.',
                        attachTo: { element: '.btn.btn-sm.btn-success.view', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    // Need -2 because of the addShepherdQueryParams() function.
                                    window.history.go(-2);
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'creating_blog_post_published',
                        when: {
                            show() {
                                setWalkthroughCookies(this.tour.options.id, 'creating_blog_post_inspecting');
                                enableOrDisableClickingOnElement($('#ci-sortable'), true);
                            },
                        },
                    },
                    {
                        title: 'Blog post',
                        text: 'We are ready, let\'s publish the blog post. Click on the publish button.',
                        attachTo: { element: '.btn.btn-sm.btn-success.view', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'creating_blog_post_inspecting',
                    },
                ],
            }),

        };

        ['complete', 'cancel'].forEach((event) => walkthroughs.orchardCoreAdminWalkthrough.on(event, () => {
            // Remove any form submit prevention.
            $('form').off('submit');

            // Making elements clickable again, on the admin dashboard.
            enableOrDisableClickingOnElement($('#left-nav'), true);
            enableOrDisableClickingOnElement($('.nav.navbar.user-top-navbar'), true);
            enableOrDisableClickingOnElement($('#ci-sortable'), true);
            enableOrDisableClickingOnElement($('#previewButton'), true);
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

        if (queryParams.shepherdTour !== null && queryParams.shepherdStep !== null) {
            const currentTour = walkthroughs[queryParams.shepherdTour];
            currentTour.start();
            currentTour.show(queryParams.shepherdStep);
        }
        else if (walkthroughCookies.walkthroughCookieValue !== null && walkthroughCookies.walkthroughStepCookieValue !== null) {
            const walktrough = walkthroughCookies.walkthroughCookieValue;
            const step = walkthroughCookies.walkthroughStepCookieValue;

            deleteWalkthroughCookies();

            const currentTour = walkthroughs[walktrough];
            currentTour.start();
            currentTour.show(step);

            addShepherdQueryParams();
        }

        const walkthroughSelectorButton = $('#walkthrough-selector-button');

        if (walkthroughSelectorButton !== null) {
            walkthroughSelectorButton.on('click', function startWalkthroughSelector() {
                walkthroughSelector.start();
            });
        }
    })(window.Shepherd);
});
