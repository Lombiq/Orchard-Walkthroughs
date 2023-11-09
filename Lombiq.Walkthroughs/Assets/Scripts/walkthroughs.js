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
                        orchardCoreAdminWalkthrough.start();
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
    const currentTour = eval(queryParams.shepherdTour);
    currentTour.start();
    currentTour.show(queryParams.shepherdStep);
}

const walkthroughSelectorButton = document.getElementById('walkthrough-selector-button');

if (walkthroughSelectorButton !== null) {
    walkthroughSelectorButton.onclick = function startWalkthroughSelector() {
        walkthroughSelector.start();
    };
}
