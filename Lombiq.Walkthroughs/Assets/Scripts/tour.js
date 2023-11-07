const walkthroughSelector = new Shepherd.Tour({
    defaultStepOptions: {
        cancelIcon: {
            enabled: true,
        },
    },
    useModalOverlay: true,
});

const orchardCoreAdminWalkthrough = new Shepherd.Tour({
    defaultStepOptions: {
        cancelIcon: {
            enabled: true,
        },
    },
    useModalOverlay: true,
});

walkthroughSelector.addStep({
    title: 'Select walkthrough!',
    text: 'Welcome! Please select a walkthrough to start:',
    buttons: [
        {
            text: 'Orchard Core Admin Walkthrough',
            action: function () {
                orchardCoreAdminWalkthrough.start();
                walkthroughSelector.complete();
            },
            classes: 'shepherd-button shepherd-button-primary',
        },
        // Add new walktroughs here.
    ],
    id: 'walkthroughSelector',
});

orchardCoreAdminWalkthrough.addStep({
    title: 'Welcome!',
    text: 'Ligma',
    buttons: [
        {
            action: function () {
                return this.next();
            },
            text: 'Next',
        },
    ],
    id: 'creating',
});

walkthroughSelector.start();
