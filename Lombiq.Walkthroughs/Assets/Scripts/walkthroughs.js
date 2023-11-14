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

        Shepherd.on('cancel complete', () => {
            removeShepherdQueryParams();
            deleteWalkthroughCookies();
        });

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
                        text: 'Let\'s create a new blog post. The blog post content type is already defined because' +
                            ' the setup recipe used the <a href="https://github.com/OrchardCMS/OrchardCore/blob/main/src/OrchardCore.Themes/TheBlogTheme/Recipes/blog.recipe.json">' +
                            'Blog recipe</a> as a base. There is also a singular blog content item and there is a ' +
                            'menu point for it. Click on the <i>"Blog"</i> button and you will see all the blog ' +
                            'posts within the blog.',
                        attachTo: { element: '.icon-class-fas.icon-class-fa-rss.item-label.d-flex', on: 'right' },
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
                        id: 'creating_blog_post_blog',
                    },
                ],
            }),

        };

        walkthroughs.orchardCoreAdminWalkthrough.on('cancel', () => {
            // Remove any form submit prevention.
            $('form').off('submit');

            // Making side and top navigation clickable again, on the admin dashboard.
            enableOrDisableClickingOnElement($('#left-nav'), true);
            enableOrDisableClickingOnElement($('.nav.navbar.user-top-navbar'), true);
        });

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
            const currentTour = walkthroughs[walkthroughCookies.walkthroughCookieValue];
            currentTour.start();
            currentTour.show(walkthroughCookies.walkthroughStepCookieValue);
            addShepherdQueryParams();
            deleteWalkthroughCookies();
        }

        const walkthroughSelectorButton = $('#walkthrough-selector-button');

        if (walkthroughSelectorButton !== null) {
            walkthroughSelectorButton.on('click', function startWalkthroughSelector() {
                walkthroughSelector.start();
            });
        }
    })(window.Shepherd);
});
