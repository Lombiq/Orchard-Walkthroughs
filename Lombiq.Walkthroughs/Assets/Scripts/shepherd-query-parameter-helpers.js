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
