jQuery(($) => {
    function removeShepherdQueryParams() {
        const urlObject = new URL(window.location.href);

        urlObject.searchParams.delete('shepherdTour');
        urlObject.searchParams.delete('shepherdStep');
        window.history.pushState(null, '', urlObject.toString());
    }

    function addShepherdQueryParams(shepherdTourValue, shepherdStepValue) {
        const urlObject = new URL(window.location.href);

        urlObject.searchParams.set('shepherdTour', shepherdTourValue);
        urlObject.searchParams.set('shepherdStep', shepherdStepValue);
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

        addShepherdQueryParams(Shepherd.activeTour.options.id, Shepherd.activeTour.getCurrentStep().id);
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
                        addShepherdQueryParams(Shepherd.activeTour.options.id, Shepherd.activeTour.getCurrentStep().id);
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
                        'configurations.They are used to streamline the setup of an Orchard Core site, making it easier to create consistent site' +
                        '  structures and content. Recipes can be executed during the initial setup of a site or at any point to apply ' +
                        'configurations or import content.',
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
                            const loginATag = $('.nav-link');
                            const loginURL = new URL(loginATag.prop('href'));

                            loginURL.searchParams.set('shepherdTour', 'orchardCoreAdminWalkthrough');
                            loginURL.searchParams.set('shepherdStep', 'login_page');
                            loginATag.attr('href', loginURL.toString());
                            addShepherdQueryParams(Shepherd.activeTour.options.id, Shepherd.activeTour.getCurrentStep().id);
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

                            //const loginButton = $('button[type="submit"]');
                            //loginButton.addEventListener('click', function redirectToNextStep() {
                            //    const redirectToNextStepURL = new URL(window.location.href.split('Login')[0]);
                            //    redirectToNextStepURL.searchParams.set('shepherdTour', 'orchardCoreAdminWalkthrough');
                            //    redirectToNextStepURL.searchParams.set('shepherdStep', 'login_logged_in');
                            //    window.location.href = redirectToNextStepURL.toString();
                            //});

                            addShepherdQueryParams(Shepherd.activeTour.options.id, Shepherd.activeTour.getCurrentStep().id);
                        },
                    },
                },
                {
                    title: 'Logged in',
                    text: 'Now you can log in!',
                    buttons: [
                        backButton,
                    ],
                    id: 'login_logged_in',
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
                    ' module is active. This module includes various walkthroughs. You can get back here, by pressing' +
                    ' the button on the homepage.Please select a walkthrough to start:',
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

    if (queryParams.shepherdTour !== null && queryParams.shepherdStep !== null) {
        const currentTour = walkthroughs[queryParams.shepherdTour];
        currentTour.start();
        currentTour.show(queryParams.shepherdStep);
    }

    const walkthroughSelectorButton = $('#walkthrough-selector-button');

    if (walkthroughSelectorButton !== null) {
        walkthroughSelectorButton.on('click', function startWalkthroughSelector() {
            // Assuming walkthroughSelector is a function or an object with a start method
            walkthroughSelector.start();
        });
    }
});
