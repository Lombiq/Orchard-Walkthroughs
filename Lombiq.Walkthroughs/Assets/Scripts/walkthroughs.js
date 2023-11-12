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

        Shepherd.on('cancel', () => {
            removeShepherdQueryParams();
            deleteWalkthroughCookies();

            // Remove any form submit prevention.
            $('form').off('submit');
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
                        title: 'Welcome in the Orchard Core Admin Walkthrough!',
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
                        attachTo: { element: '.nav-link', on: 'bottom' },
                        text: 'Let\'s log in! After clicking on the log in button, you will be redirected to the log in page.' +
                            'If you are already logged in, please log out and restart the tutorial.',
                        buttons: [
                            backButton,
                        ],
                        id: 'login_button',
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
                                    const returnToHomePageURL = new URL(window.location.href.split('Login')[0]);
                                    returnToHomePageURL.searchParams.set('shepherdTour', 'orchardCoreAdminWalkthrough');
                                    returnToHomePageURL.searchParams.set('shepherdStep', 'login_button');
                                    window.location.href = returnToHomePageURL.toString();
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'login_page',
                        when: {
                            show() {
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
                                if ($('.field-validation-error[data-valmsg-for="Password"]').length > 0 ||
                                    $('.field-validation-error[data-valmsg-for="UserName"]').length > 0) {
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
                        attachTo: { element: '.nav-link.dropdown-toggle', on: 'bottom' },
                        text: 'Let\'s see the admin dashboard now. Please, click on the dropdown!',
                        buttons: [
                            backButton,
                        ],
                        id: 'admin_dashboard',
                        when: {
                            show() {
                                const tour = this.tour;
                                $('.nav-link.dropdown-toggle').on('click', function goToNextStep() {
                                    tour.next();
                                });

                                addShepherdQueryParams();
                            },
                        },
                    },
                    {
                        title: 'Admin dashboard',
                        attachTo: { element: '.dropdown-item[href*="/Admin"]', on: 'bottom' },
                        text: 'Now click on the <i>"Dashboard"</i> button!',
                        buttons: [
                            backButton,
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
                        attachTo: { element: '.dropdown-item[href*="/Admin"]', on: 'bottom' },
                        text: 'Now click on the <i>"Dashboard"</i> button!',
                        buttons: [
                            backButton,
                        ],
                        id: 'admin_dashboard_page',
                        when: {
                            show() {
                                $('.nav-link.dropdown-toggle').on('click', function goToNextStep() { this.tour.next(); });

                                addShepherdQueryParams();
                            },
                        },
                    },
                ],
            }),

        };
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
