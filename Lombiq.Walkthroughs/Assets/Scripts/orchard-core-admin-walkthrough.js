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

const orchardCoreAdminWalkthrough = new Shepherd.Tour({
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
                        orchardCoreAdminWalkthrough.complete();
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
                ' Orchard Core application. Recipes can include predefined content types, widgets, menus, content items, and other configurations.' +
                ' They are used to streamline the setup of an Orchard Core site, making it easier to create consistent site structures and content.' +
                ' Recipes can be executed during the initial setup of a site or at any point to apply configurations or import content.',
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
    ],
});
