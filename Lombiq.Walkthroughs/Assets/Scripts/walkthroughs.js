jQuery(($) => {
    (function LoadShepherd(Shepherd) {
        function getCookieValue(cookieName) {
            const name = cookieName + '=';
            const cookieArray = document.cookie.split(';').map((cookie) => cookie.trim());
            const resultCookie = cookieArray.find((cookie) => cookie.startsWith(name));
            return resultCookie ? decodeURIComponent(resultCookie.substring(name.length)) : null;
        }

        function deleteWalkthroughCookies() {
            const expireCookie = '=; expires = Thu, 01 Jan 1970 00:00:00 UTC; path = /;'; // #spell-check-ignore-line
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
            classes: 'shepherd-button-primary',
            text: 'Next',
        };

        // First part of current page means, what's after the first "/", from the relative URL. So if we have a tenant
        // which prefix is "test" and we have this URL:
        // https://localhost:44335/test/Admin/Contents/ContentItems/something, then it will be "Admin".
        function goToRelativePage(shepherdTour, shepherdStep, firstPartOfCurrentPage, nextPage) {
            let splitString = firstPartOfCurrentPage;
            let goToRelativePageString;

            if (splitString === '/') {
                goToRelativePageString = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
            }
            else {
                if (!splitString) {
                    splitString = '?';
                }
                else {
                    splitString = new RegExp(splitString, 'i');
                }

                // eslint-disable-next-line prefer-destructuring
                goToRelativePageString = window.location.href.split(splitString)[0];

                if (!goToRelativePageString.endsWith('/')) {
                    goToRelativePageString += '/';
                }
            }

            const goToRelativePageURL = new URL(goToRelativePageString + (nextPage ?? ''));
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
                        title: 'Welcome to the<br>Orchard Core Admin Walkthrough!',
                        text: `This walkthrough covers key Orchard Core features, such as content management, user roles, 
                            and theme selection, and points you to further learning resources.`,
                        buttons: [
                            {
                                action: function () {
                                    removeShepherdQueryParams();
                                    walkthroughs.orchardCoreAdminWalkthrough.complete();
                                    // The walkthroughSelector is later defined and orchardCoreAdminWalkthrough is only
                                    // used later.
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
                        text: `<p>The setup recipe in the Walkthroughs module used the 
                            <a href="https://docs.orchardcore.net/en/latest/docs/getting-started/starter-recipes/#theblogtheme-and-blog-recipe" target="_blank">
                            Blog recipe</a> as a base recipe.</p>
                            <p>In Orchard Core, a 
                            <a href="https://docs.orchardcore.net/en/main/docs/reference/modules/Recipes/" target="_blank">
                            recipe</a> is a JSON file that defines a set of instructions for setting up and configuring
                            an Orchard Core application. Recipes can include predefined content types, widgets, menus,
                            content items, and other configuration. They are used to streamline the setup of an Orchard
                            Core site, making it easier to create consistent site structures and content.</p>
                            <p>Setup recipes can be executed during the initial setup of a site, and non-setup recipes 
                            at any point to apply configuration or import content.</p>`,
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'setup_recipe',
                    },
                    {
                        title: 'Site setup',
                        text: `To get to this point (a set up site), first you will need to get through the setup 
                            screen. There you can decide which setup recipe you'd like to use. Currently, we are using
                            the Walkthroughs recipe.`,
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'site_setup',
                    },
                    {
                        title: 'Log in',
                        text: `Let's log in! Please go to the <em>"~/Login"</em>, by clicking on the <em>"Next"</em> 
                            button.`,
                        buttons: [
                            backButton,
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'login_page', null, 'Login');
                                },
                                classes: 'shepherd-button-primary',
                                text: 'Next',
                            },
                        ],
                        id: 'logging_in',
                    },
                    {
                        title: 'Log in page',
                        text: 'Here you can log in. You will need to provide a username or email address and a password.',
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
                        text: 'Provide your username. This recipe included a user. The username is <em>"testuser"</em>.',
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
                        title: 'Password',
                        attachTo: { element: '#Password', on: 'bottom' },
                        text: 'Provide your password. The password for the test user is <em>"Password1!"</em>.',
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
                        text: 'Now you are logged in!',
                        buttons: [
                            // The user already logged in, there is no reason to go back to the login page.
                            nextButton,
                        ],
                        id: 'login_logged_in',
                        when: {
                            show() {
                                // If login is failed don't go ahead.
                                if ($('.field-validation-error[data-valmsg-for="Password"]').length || // #spell-check-ignore-line
                                    $('.field-validation-error[data-valmsg-for="UserName"]').length) { // #spell-check-ignore-line
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
                        text: `Let's see the admin dashboard now! Please go to the <em>"~/Admin"</em> URL by 
                            clicking on the <em>"Next"</em> button.`,
                        buttons: [
                            backButton,
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'admin_dashboard_page', null, 'Admin');
                                },
                                classes: 'shepherd-button-primary',
                                text: 'Next',
                            },
                        ],
                        id: 'admin_dashboard_enter',
                    },
                    {
                        title: 'Admin dashboard',
                        text: `Welcome to the admin dashboard! The admin dashboard serves as the centralized control
                            panel for managing and configuring various aspects of the Orchard Core application.`,
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
                        text: `This is the side menu, which organizes essential functionalities. This menu includes key
                            sections such as content management, security settings, and other administrative.`,
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
                        text: `This is the top menu. Here you can switch between dark and light modes, go to the 
                    homepage, log off, or take a look at your profile.`,
                        attachTo: { element: '.user-top-navbar', on: 'bottom' },

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
                        text: `<p>Let's create a new blog post!</p>
                            <p>The Blog Post content type is already defined because the setup recipe used the Blog
                            recipe</a> as a base. There is also a singular blog content item and there is a menu
                            pointing to it.</p>
                            <p>Click on the <em>"Blog"</em> link and you will see all the blog posts within the blog.</p>`,
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
                        title: 'Blog posts',
                        text: `Here you can see the blog posts inside the blog. There is already an example one because
                            of the  Blog recipe</a>.`,
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
                        text: 'Click here to create a new blog post.',
                        attachTo: { element: '.btn.btn-secondary[href*="BlogPost/Create"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'creating_blog_post_create_button',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'creating_blog_post_content_editor');
                            },
                        },
                    },
                    {
                        title: 'Creating a new blog post',
                        text: 'Here is the editor of your new blog post.',
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
                        text: `You can give the blog post an URL by hand, but you can leave it empty to let Orchard 
                            Core auto-generate it. We recommend you let Orchard do its magic.`,
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
                        text: `<p>This is the editor where you can write the body of your blog post. It uses the
                            Markdown syntax to give you simple formatting options.</p>
                            <p>You don't need to learn the Markdown syntax since you can just use the GUI of the
                            editor, but it makes things a lot quicker! Check out
                            <a href="https://www.markdownguide.org/basic-syntax/" target="_blank">this guide</a> for
                            more info.</p>`,
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
                        text: `You can also give a subtitle to your blog post. This will be displayed under its title
                            on the frontend.`,
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
                        text: `You can add an image to your blog post that'll be displayed in the header if you'd like.
                            Click on the <em>"+"</em> button if you want to add one..`,
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
                        text: 'You can add tags to your blog post to make it easier to search and list related posts.',
                        attachTo: { element: '#BlogPost_Tags_TermContentItemIds_FieldWrapper', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'creating_blog_post_tags',
                        when: {
                            show() {
                                // We need to remove this custom attribute, because it's buggy with the taxonomy
                                // dropdown.
                                $('div[data-shepherd-step-id="creating_blog_post_tags"]').removeAttr('tabindex');

                                // Overlay is in the way, so we have to set the position to relative.
                                $('.multiselect__content-wrapper').css('position', 'relative');

                                // Needs to be added to other steps in this page, so a reload doesn't break it.
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Category',
                        text: `You can also select the category of your blog post. Similarly to tags, this helps your
                            readers find relevant blog posts.`,
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
                        text: `Before publishing your blog post, you can preview what would it look like on the
                            frontend. You can click on the preview button to check it out, but since we are finished,
                            let's just publish it!`,
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
                            },
                        },
                    },
                    {
                        title: 'Publishing',
                        text: 'We are ready, let\'s publish the blog post! Click on the publish button.',
                        attachTo: { element: 'button[name="submit.Publish"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'creating_blog_post_publishing',
                        when: {
                            show() {
                                $('form').off('submit');
                                addShepherdQueryParams();
                                // The return URL would redirect us to the "creating_blog_post_create_button" step, so
                                // we are ignoring the query parameter.
                                setWalkthroughCookies(this.tour.options.id, 'creating_blog_post_published', 'creating_blog_post_create_button');
                            },
                        },
                    },
                    {
                        title: 'Viewing the blog post',
                        text: 'The blog post is published, good job! Click on the <em>"View"</em> button to see it.',
                        attachTo: { element: '.btn.btn-sm.btn-success.view', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'creating_blog_post', 'Admin', 'Admin');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'creating_blog_post_published',
                        when: {
                            show() {
                                if ($('.validation-summary-errors').length) {
                                    deleteWalkthroughCookies();
                                    Shepherd.activeTour.back();
                                    return;
                                }

                                setWalkthroughCookies(this.tour.options.id, 'creating_blog_post_inspecting');
                                addShepherdQueryParams();
                            },
                        },
                    },
                    {
                        title: 'Viewing the blog post',
                        text: 'Here is your published blog post in all of its glory!',
                        attachTo: { element: 'body', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'creating_blog_post', 'blog', 'Admin');
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
                        text: 'Now let\'s create an article! First go to the homepage.',
                        attachTo: { element: '.navbar-brand', on: 'bottom' },
                        buttons: [
                            backButton,
                        ],
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'creating_article_intro');
                            },
                        },
                        id: 'creating_article_intermediate_step',
                    },
                    {
                        title: 'Creating a new article',
                        text: `<p>Just as the Blog Post content type, Article is already defined and it comes from the
                            Blog recipe</a> that we used as the base of the setup recipe. We can use it for simpler
                            static content pages like an About page.</p>
                            <p>Go to the admin dashboard again by clicking on the <em>"Next"</em> button.<p>`,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'creating_blog_post', 'Admin', 'Admin');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'creating_article_dashboard', '', 'Admin');
                                },
                                classes: 'shepherd-button-primary',
                                text: 'Next',
                            },
                        ],
                        id: 'creating_article_intro',
                    },
                    {
                        title: 'Creating a new article',
                        text: `Click on the <em>"Content"</em> dropdown.`,
                        attachTo: { element: '#content', on: 'right' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'creating_article_intro', 'Admin', '');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'creating_article_dashboard',
                        advanceOn: { selector: '#content', event: 'click' },
                        when: {
                            show() {
                                addShepherdQueryParams();
                                $('ul.show').removeClass('show');
                            },
                        },
                    },
                    {
                        title: 'Creating a new article',
                        text: `Now click on the <em>"Content Types"</em> dropdown to see what type of content items you
                            can create.`,
                        // There is no proper basic JS selector, to select the element, so we need to use a function.
                        savedElement: $('[title="Content Types"]').parent().get(0),
                        attachTo: {
                            element: function getContentTypesButton() {
                                return this.options.savedElement;
                            },
                            on: 'right',
                        },
                        buttons: [
                            backButton,
                        ],
                        id: 'creating_article_content_types',
                        // We should "advanceOn" the same button as "attachTo", but shepherd.js doesn't accept a
                        // function for that, so we are adding an event listener.
                        when: {
                            show() {
                                addShepherdQueryParams();
                                const element = this.options.savedElement;
                                $('ul.show').removeClass('show');

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
                        text: `Here we have the article content type. Click on it.`,
                        attachTo: { element: 'a[href*= "Article"]', on: 'right' },
                        buttons: [
                            backButton,
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
                        text: `Here you can see all the articles. As you can see, there is already one.`,
                        attachTo: { element: '.list-group.with-checkbox', on: 'top' },
                        // Making the list unclickable, so the user can't go somewhere else.
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'creating_article_content_types', 'Admin', 'Admin');
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
                        text: `Click here to create a new article.`,
                        attachTo: { element: '.btn.btn-secondary[href*="Article/Create"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'creating_article_create_button',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'creating_article_editor');
                            },
                        },
                    },
                    {
                        title: 'Creating a new article',
                        text: `Here you can create the article.`,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'creating_article_create_button',
                                        'Admin',
                                        'Admin/Contents/ContentItems/Article');
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
                        text: `Let's give it a title!`,
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
                        text: `Again, you can provide a URL by hand or let Orchard Core auto-generate it. Perhaps go
                            with the latter?`,
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
                        text: `You can set this article as the homepage. This can be done with any content item but
                            let's not do that now.`,
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
                        text: `<p>This is the HTML Body, where you can add the body of an article.</p>
                            The HTML Body editor in Orchard Core provides rich formatting options and multimedia
                            embedding, offering extensive control over layout and styling. If you'd like, you can
                            also directly edit its HTML code.</p>
                            <p>In contrast, the Markdown editor of Blog Post simplifies content creation using the
                            text-based Markdown syntax, promoting ease of use and consistency but with fewer advanced
                            formatting options compared to HTML.</p>`,
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
                        text: `You can set the subtitle of your article too.`,
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
                        text: `You can add a banner image to your article too.`,
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
                        text: `Before publishing your article, you can preview what would it look like on the frontend,
                            just as with blog posts. Let's just publish it!`,
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
                        text: `We are ready, let's publish the article! Click on the publish button.`,
                        attachTo: { element: 'button[name="submit.Publish"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'creating_article_publishing',
                        when: {
                            show() {
                                $('form').off('submit');
                                addShepherdQueryParams();

                                // The return URL would redirect us to the "creating_article_create_button" step, so
                                // we are ignoring the query parameter.
                                setWalkthroughCookies(this.tour.options.id, 'creating_article_published', 'creating_article_create_button');
                            },
                        },
                    },
                    {
                        title: 'Viewing the article',
                        text: `The article is now published. Click on the <em>"View"</em> button to see it.`,
                        attachTo: { element: '.btn.btn-sm.btn-success.view', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'creating_article_create_button',
                                        'Admin',
                                        'Admin/Contents/ContentItems/Article');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'creating_article_published',
                        when: {
                            show() {
                                if ($('.validation-summary-errors').length) {
                                    deleteWalkthroughCookies();
                                    Shepherd.activeTour.back();
                                    return;
                                }

                                setWalkthroughCookies(this.tour.options.id, 'creating_article_inspecting');
                                addShepherdQueryParams();
                            },
                        },
                    },
                    {
                        title: 'Viewing the article',
                        text: 'Here is you published article. Isn\'t it beautiful?',
                        attachTo: { element: 'body', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'creating_article_published',
                                        '/',
                                        'Admin/Contents/ContentItems/Article');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'creating_article_inspecting',
                    },
                    {
                        title: 'Managing the menu',
                        text: `The sample article that was created from the recipe has a link in the menu. Click on
                            <em>"About"</em>.`,
                        attachTo: { element: 'a[href*="about"', on: 'bottom' },
                        buttons: [
                            backButton,
                        ],
                        id: 'adding_article_to_menu_intro',
                        when: {
                            show() {
                                setWalkthroughCookies(this.tour.options.id, 'adding_article_to_menu_about');
                                addShepherdQueryParams();
                            },
                        },

                    },
                    {
                        title: 'Managing the menu',
                        text: `<p>As you can see, you can easily access it via the menu. It's a pity our new article 
                            doesn't have this... Let's add a menu item for it too!</p>
                            <p>Go back to the admin dashboard by clicking on the <em>"Next"</em> button.</p>`,
                        attachTo: { element: 'body', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'creating_article_published',
                                        'about',
                                        'Admin/Contents/ContentItems/Article');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'adding_article_to_menu_dashboard', 'about', 'Admin');
                                },
                                classes: 'shepherd-button-primary',
                                text: 'Next',
                            },
                        ],
                        id: 'adding_article_to_menu_about',
                    },
                    {
                        title: 'Managing the menu',
                        text: 'Click on the <em>"Main Menu"</em> link.',
                        attachTo: { element: '.icon-class-fas.icon-class-fa-sitemap.item-label.d-flex', on: 'right' }, // #spell-check-ignore-line
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
                        title: 'Managing the menu',
                        text: 'Here you can see the menu\'s editor, including all the menu items.',
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
                        title: 'Managing the menu',
                        text: 'Let\'s add a menu item for the new article we created! Click on the <em>"Add Menu Item"</em> button.',
                        attachTo: { element: 'button[data-bs-target="#modalMenuItems"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'adding_article_to_menu_add_menu_item_button',
                        advanceOn: { selector: 'button[data-bs-target="#modalMenuItems"]', event: 'click' },
                    },
                    {
                        title: 'Managing the menu',
                        text: `You can choose between multiple types of menu items. Read the descriptions too see how
                            they are different.`,
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
                        title: 'Managing the menu',
                        text: `<p>For now, let's go with the Link Menu Item one. This can be used to easily add menu 
                            items for any URL.</p>
                            <p>Click on the <em>"Add"</em> button.</p>`,
                        attachTo: { element: 'a[href*="Create/LinkMenuItem"]', on: 'bottom' },
                        buttons: [
                            backButton,
                        ],
                        id: 'adding_article_to_menu_link_menu_item',
                        when: {
                            show() {
                                setWalkthroughCookies(this.tour.options.id, 'adding_article_to_menu_link_menu_item_name');
                                addShepherdQueryParams();

                                const modal = $('#modalMenuItems');

                                if (!modal || modal.attr('aria-hidden') === 'true') {
                                    $('button[data-bs-target="#modalMenuItems"]').click();
                                }
                            },
                        },
                    },
                    {
                        title: 'Managing the menu',
                        text: 'Let\'s give the menu item a name! This is the text that\'ll be displayed in the menu.',
                        attachTo: { element: '#LinkMenuItemPart_Name', on: 'top' },
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
                        id: 'adding_article_to_menu_link_menu_item_name',
                        when: {
                            show() {
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Managing the menu',
                        text: `Let's give it your article's URL! Use its relative URL, the one that's generated as its
                            permalink. Make sure to prefix it with a slash and tilde characters (<em>"/~"</em>) to
                            denote it as a relative URL (e.g. "~/sample-article").`,
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
                        title: 'Managing the menu',
                        text: 'We are ready, let\'s publish the menu item! Click on the publish button.',
                        attachTo: { element: 'button[name="submit.Publish"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'adding_article_to_menu_publishing',
                        when: {
                            show() {
                                $('form').off('submit');
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'adding_article_to_menu_published');
                            },
                        },
                    },
                    {
                        title: 'Managing the menu',
                        text: 'Your new menu item is now here. You can reorder menu items by dragging them.',
                        attachTo: { element: '#menu', on: 'top' },
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
                        id: 'adding_article_to_menu_published',
                    },
                    {
                        title: 'Managing the menu',
                        text: 'You will also need to publish the menu itself too. Click on the publish button.',
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
                        title: 'Managing the menu',
                        text: `Your article is now linked from the menu. Let's see it! Click on the <em>"Next"</em>
                            button to go to the home page.`,
                        buttons: [
                            backButton,
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'adding_article_to_menu_inspecting', 'Admin');
                                },
                                classes: 'shepherd-button-primary',
                                text: 'Next',
                            },
                        ],
                        id: 'adding_article_to_menu_published2',
                    },
                    {
                        title: 'Managing the menu',
                        text: 'The new menu item should appear up here.',
                        attachTo: { element: '#navbarResponsive', on: 'bottom' },
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'adding_article_to_menu_dashboard', '', 'Admin');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'adding_article_to_menu_inspecting',
                    },
                    {
                        title: 'Content listing',
                        text: `Now let's go back to the admin dashboard! We'll check out how you can list all the 
                            content of your website. Click on the <em>"Next"</em> button.`,
                        buttons: [
                            backButton,
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'content_list_admin_dashboard', null, 'Admin');
                                },
                                classes: 'shepherd-button-primary',
                                text: 'Next',
                            },
                        ],
                        id: 'content_list_intro',
                    },
                    {
                        title: 'Content listing',
                        text: 'Click on the <em>"Content"</em> dropdown.',
                        attachTo: { element: '#content', on: 'right' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'adding_article_to_menu_dashboard', 'Admin', '');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'content_list_admin_dashboard',
                        advanceOn: { selector: '#content', event: 'click' },
                        when: {
                            show() {
                                addShepherdQueryParams();
                                $('ul.show').removeClass('show');
                            },
                        },
                    },
                    {
                        title: 'Content listing',
                        text: 'Now click on the <em>"Content Items"</em> button.',
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
                            backButton,
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
                        title: 'Content listing',
                        text: `Notice how we can see (and filter for) all the content items (articles, blog posts,
                            etc.). Previously, we accessed these from various menu shortcuts.`,
                        attachTo: { element: '#items-form', on: 'top' },
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'content_list_admin_dashboard', 'Admin', 'Admin');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'taxonomies_intro', 'Admin', 'Admin');
                                },
                                classes: 'shepherd-button-primary',
                                text: 'Next',
                            },
                        ],
                        id: 'content_list_admin_content_items',
                    },
                    {
                        title: 'Taxonomies',
                        text: `<p>We'll now see how to use the Taxonomies module for categorization (remember the Tags
                            and Categories fields of blog posts?).</p>
                            <p>With this module you can create Taxonomy content items that can contain Taxonomy Terms. 
                            These will be the specific categories or tags, and they can even be organized as a 
                            hierarchy (like News → Sports). Then, you can use the Taxonomy Field on other content items 
                            (like blog posts) to add these terms to them.</p>`,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'content_list_admin_content_items_menu', 'Admin', 'Admin');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'taxonomies_intro2',
                                        'Admin',
                                        'Admin/Contents/ContentItems?q=type%3ATaxonomy'); // #spell-check-ignore-line
                                },
                                classes: 'shepherd-button-primary',
                                text: 'Next',
                            },
                        ],
                        id: 'taxonomies_intro',
                    },
                    {
                        title: 'Taxonomies',
                        text: `<p>You can access this list by filtering for the <em>"Taxonomy"</em> content type (see 
                            top-right corner).</p>
                            <p>There are two taxonomies here: Categories and Tags. These are both used for blog posts.</p>`,
                        attachTo: { element: '.list-group.with-checkbox', on: 'top' },
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'taxonomies_intro', 'Admin', 'Admin');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'taxonomies_intro2',
                    },
                    {
                        title: 'Taxonomies',
                        text: 'Let\'s see how we can edit taxonomies! Click on the <em>"Edit"</em> button.',
                        attachTo: { element: '.btn-sm.btn-primary.edit', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'taxonomies_categories',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'taxonomies_adding_category');
                            },
                        },
                    },
                    {
                        title: 'Taxonomies',
                        text: 'You can add a new category by clicking here.',
                        attachTo: { element: '.btn.btn-primary.btn-sm', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'taxonomies_categories',
                                        'Admin',
                                        'Admin/Contents/ContentItems?q=type%3ATaxonomy'); // #spell-check-ignore-line
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'taxonomies_adding_category',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'taxonomies_category_title');
                            },
                        },
                    },
                    {
                        title: 'Taxonomies',
                        text: 'You can name your category.',
                        attachTo: { element: '#TitlePart_Title', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'taxonomies_category_title',
                        when: {
                            show() {
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Taxonomies',
                        text: `You can select an icon for the category. This will be displayed as decoration when 
                            listing categories on the frontend (like <a href="/categories" target="_blank">here</a>). 
                            You need to pick an icon, otherwise you can't publish your category.)`,
                        attachTo: { element: '.btn-toolbar', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'taxonomies_category_icon',
                        when: {
                            show() {
                                $('#Category_Icon').on('click', function moveOverlay() {
                                    $('.shepherd-modal-overlay-container').css('z-index', 1100);
                                    $('.iconpicker-container').css('z-index', 1101); // #spell-check-ignore-line
                                });

                                // Needs to be added to other steps in this page, so a reload doesn't break it.
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Taxonomies',
                        text: `And you can set a permalink for it or just leave it blank for Orchard Core to 
                            auto-generate it.`,
                        attachTo: { element: '#AutoroutePart_Path', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'taxonomies_category_permalink',
                        when: {
                            show() {
                                // Needs to be added to other steps in this page, so a reload doesn't break it.
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Taxonomies',
                        text: 'Let\'s publish the new category! Click on the <em>"Publish"</em> button.',
                        attachTo: { element: 'button[name="submit.Publish"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'taxonomies_category_publishing',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'taxonomies_category_published');
                                $('form').off('submit');
                            },
                        },
                    },
                    {
                        title: 'Taxonomies',
                        text: `<p>Your category is now published. The next time when you are editing blog post, you
                            will be able to select it.</p>
                            <p>However, just as with menus, you'll also need to publish the taxonomy too, so let's do
                            that!</p>`,
                        attachTo: { element: 'button[name="submit.Publish"]', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'taxonomies_categories',
                                        'Admin',
                                        'Admin/Contents/ContentItems?q=type%3ATaxonomy'); // #spell-check-ignore-line
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'taxonomies_category_published',

                        when: {
                            show() {
                                // If publishing is failed (no icon was set) don't go ahead.
                                if ($('.validation-summary-errors').length) {
                                    deleteWalkthroughCookies();
                                    Shepherd.activeTour.back();
                                    return;
                                }

                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'media_management_intro');
                            },
                        },
                    },
                    {
                        title: 'Media management',
                        text: `<p>We're now done with Taxonomies.</p>
                            <p>Let's see media management next! Click on the <em>"Next"</em> button.</p>`,
                        buttons: [
                            backButton,
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'media_management_menu1', 'Admin', 'Admin');
                                },
                                classes: 'shepherd-button-primary',
                                text: 'Next',
                            },
                        ],
                        id: 'media_management_intro',
                    },
                    {
                        title: 'Media management',
                        text: 'Click on the <em>"Content"</em> dropdown.',
                        attachTo: { element: '#content', on: 'right' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'taxonomies_categories',
                                        'Admin',
                                        'Admin/Contents/ContentItems?q=type%3ATaxonomy'); // #spell-check-ignore-line
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'media_management_menu1',
                        advanceOn: { selector: '#content', event: 'click' },
                        when: {
                            show() {
                                addShepherdQueryParams();
                                $('ul.show').removeClass('show');
                            },
                        },
                    },
                    {
                        title: 'Media management',
                        text: 'Now click on the <em>"Media Library"</em> button.',
                        // There is no proper basic JS selector, to select the element, so we need to use a
                        // function.
                        savedElement: $('[title="Media Library"]').parent().get(0),
                        attachTo: {
                            element: function getContentItemsButton() {
                                return this.options.savedElement;
                            },
                            on: 'right',
                        },
                        buttons: [
                            backButton,
                        ],
                        id: 'media_management_menu2',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'media_management_media_library');
                            },
                        },
                    },
                    {
                        // The Media app loads asynchronously so targeting something like #mediaContainer won't always
                        // work.
                        title: 'Media management',
                        text: `This is the media library. Here you can see all the uploaded media, including images and
                            other files. When using Media Fields under content items to quickly upload or select media
                            (remember the banner image of blog posts?) you're interacting with the Media Library too.'`,
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'media_management_menu1', 'Admin', 'Admin');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'media_management_media_library',
                    },
                    {
                        title: 'Media management',
                        text: 'You can edit the files\' names, delete, and view them. Hover here.',
                        canClickTarget: false,
                        attachTo: { element: '.buttons-container', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'media_management_file_buttons',
                    },
                    {
                        title: 'Media management',
                        text: 'You can see the different folders here, and you can also add new ones.',
                        attachTo: { element: '#folder-tree', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'media_management_folders',
                    },
                    {
                        title: 'Media management',
                        text: 'You can filter files by their name here. Try it out, write "home"!',
                        attachTo: { element: '.media-filter', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'media_management_filtering',
                    },
                    {
                        title: 'Media management',
                        text: 'You can upload new files here.',
                        attachTo: { element: '.btn.btn-sm.btn-primary.fileinput-button.upload-button', on: 'top' }, // #spell-check-ignore-line
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'media_management_upload_button',
                    },
                    {
                        title: 'Media management',
                        text: 'New files you upload will show up here in the file list.',
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'media_management_file_list',
                    },
                    {
                        title: 'Flow Part',
                        text: `<p>This was our intro to the Media Library. Not too complex, isn't it?</p>
                            <p>We'll now take a look at building more complex layouts with Flow Part. You can use Flow
                            Part to create pages that are more than just some simple text. They can contain various
                            widgets in a responsive layout.</p>
                            <p>Click on the <em>"Content"</em> dropdown to continue.</p>`,
                        attachTo: { element: '#content', on: 'right' },
                        buttons: [
                            backButton,
                        ],
                        id: 'flow_part_content',
                        advanceOn: { selector: '#content', event: 'click' },
                        when: {
                            show() {
                                addShepherdQueryParams();
                                $('ul.show').removeClass('show');
                            },
                        },
                    },
                    {
                        text: 'Now click on the <em>"Content Items"</em> button.',
                        title: 'Flow Part',
                        // There is no proper basic JS selector, to select the element, so we need to use a function.
                        savedElement: $('[title="Content Items"]').parent().get(0),
                        attachTo: {

                            element: function getContentTypesButton() {
                                return this.options.savedElement;
                            },
                            on: 'right',
                        },
                        buttons: [
                            backButton,
                        ],
                        id: 'flow_part_content_items',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'flow_part_content_items_new');
                            },
                        },
                    },
                    {
                        title: 'Flow Part',
                        text: 'We\'ll create a new Page content item. Click on the <em>"New"</em> button.',
                        attachTo: { element: '#new-dropdown', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'flow_part_content', 'Admin', 'Admin/Media');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'flow_part_content_items_new',
                        advanceOn: { selector: '#new-dropdown', event: 'click' },
                    },
                    {
                        title: 'Flow Part',
                        text: 'Click on <em>"Page"</em> to create a new page.',
                        attachTo: { element: 'a.dropdown-item[href*="Page"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'flow_part_content_items_new_page',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'flow_part_page_title');
                            },
                        },
                    },
                    {
                        title: 'Flow Part',
                        text: 'You can give it a title, just like for a blog post or an article. It\'s the same thing, really.',
                        attachTo: { element: '#TitlePart_Title', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id, 'flow_part_content_items_new', 'Admin', 'Admin/Contents/ContentItems');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'flow_part_page_title',
                        when: {
                            show() {
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Flow Part',
                        text: 'Surely you know the drill with Permalink by now!',
                        attachTo: { element: '#AutoroutePart_Path', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'flow_part_page_permalink',
                        when: {
                            show() {
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Flow Part',
                        text: `<p>The page has a part called <em>"Flow Part"</em>. It allows you to add different 
                            widgets to your page, building complex layouts that are displayed in a responsive way, so
                            they look good on all screen sizes (hence the name "flow").</p>
                            <p>If you want a simple page, with only some simpler HTML content, it's better to create an
                            article. However if you want something more involved, and perhaps you created your own
                            widget and you want to add that, then it's better to use a Flow Part.`,
                        attachTo: { element: 'button[title="Add Widget"]', on: 'left' },
                        canClickTarget: false,
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'flow_part_page_flow_part',
                        when: {
                            show() {
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Flow Part',
                        text: `<p>You will see the different widgets here that you can add. Blockquote, Image, Paragraph, 
                            and Raw Html are all just what their names suggest. Container is a container for widgets, 
                            so you can build some multi-level structure.</p>
                            <p>These widgets came with the Blog recipe, but modules can add new ones too, and you can
                            create your own widget types as well!</p>
                            <p>Enough of theory, let's click on the <em>"+"</em> icon!</em>`,
                        attachTo: { element: 'button[title="Add Widget"]', on: 'left' },
                        buttons: [
                            backButton,
                        ],
                        id: 'flow_part_page_flow_part_widgets',
                        advanceOn: { selector: 'button[title="Add Widget"]', event: 'click' },
                        when: {
                            show() {
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Flow Part',
                        text: 'Let\'s add a blockquote, for example! Can you guess what it\'ll contain? :)',
                        attachTo: { element: 'a[data-widget-type="Blockquote"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'flow_part_page_flow_part_blockquote',
                        advanceOn: { selector: 'a[data-widget-type="Blockquote"]', event: 'click' },
                        when: {
                            show() {
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Flow Part',
                        text: 'Now you added the blockquote to your page. This is a quotable moment!',
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'flow_part_page_flow_part_blockquote2',
                        when: {
                            show() {
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Flow Part',
                        text: 'Click on the dropdown to edit it!',
                        attachTo: {
                            element: '.btn.btn-outline-secondary.btn-sm.widget-editor-btn-toggle.widget-editor-btn-expand',
                            on: 'top',
                        },
                        buttons: [
                            backButton,
                        ],
                        id: 'flow_part_page_flow_part_blockquote_dropdown',
                        advanceOn: {
                            selector: '.btn.btn-outline-secondary.btn-sm.widget-editor-btn-toggle.widget-editor-btn-expand',
                            event: 'click',
                        },
                        when: {
                            show() {
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Flow Part',
                        text: `Can you think of a good quote? My favorite is "Don't believe everything you read on the
                            internet." by Abraham Lincoln.`,
                        attachTo: {
                            element: '#FlowPart-0_Blockquote_Quote_Text',
                            on: 'top',
                        },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'flow_part_page_flow_part_blockquote_edit',
                        when: {
                            show() {
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Flow Part',
                        text: 'We are ready, let\'s publish the page! Click on the publish button.',
                        attachTo: { element: 'button[name="submit.Publish"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'flow_part_page_publishing',
                        when: {
                            show() {
                                $('form').off('submit');
                                addShepherdQueryParams();

                                // The return URL would redirect us to the "flow_part_content_items_new_page" step, so
                                // we are ignoring the query parameter.
                                setWalkthroughCookies(this.tour.options.id, 'flow_part_page_published', 'flow_part_content_items_new');
                            },
                        },
                    },
                    {
                        title: 'Viewing the page',
                        text: 'The page is published! Click on the <em>"View"</em> button to see it.',
                        attachTo: { element: '.btn.btn-sm.btn-success.view', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id, 'flow_part_content_items_new', 'Admin', 'Admin/Contents/ContentItems');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'flow_part_page_published',
                        when: {
                            show() {
                                if ($('.validation-summary-errors').length) {
                                    deleteWalkthroughCookies();
                                    Shepherd.activeTour.back();
                                    return;
                                }

                                setWalkthroughCookies(this.tour.options.id, 'flow_part_page_inspecting');
                                addShepherdQueryParams();
                            },
                        },
                    },
                    {
                        title: 'Viewing the page',
                        text: 'Here is you published page with the blockquote.',
                        attachTo: { element: 'body', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id, 'flow_part_page_published', '/', 'Admin/Contents/ContentItems');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'flow_part_page_inspecting',
                    },
                    {
                        title: 'Layout widgets',
                        text: `The fun with widgets doesn't stop here! You can also add them to the layout itself. Go
                            to homepage by clicking here.`,
                        attachTo: { element: '.navbar-brand', on: 'bottom' },
                        buttons: [
                            backButton,
                        ],
                        id: 'adding_widgets_to_the_layout_intro',
                        when: {
                            show() {
                                setWalkthroughCookies(this.tour.options.id, 'adding_widgets_to_the_layout_admin');
                                addShepherdQueryParams();
                            },
                        },
                    },
                    {
                        title: 'Layout widgets',
                        text: 'Go to the admin dashboard by clicking on the <em>"Next"</em> button.',
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id, 'flow_part_page_published', '', 'Admin/Contents/ContentItems');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id, 'adding_widgets_to_the_layout_design', '', 'Admin');
                                },
                                classes: 'shepherd-button-primary',
                                text: 'Next',
                            },
                        ],
                        id: 'adding_widgets_to_the_layout_admin',
                    },
                    {
                        title: 'Layout widgets',
                        text: 'Click on the <em>"Design"</em> dropdown.',
                        attachTo: { element: '#themes', on: 'right' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id, 'adding_widgets_to_the_layout_admin', 'Admin', '');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'adding_widgets_to_the_layout_design',
                        advanceOn: { selector: '#themes', event: 'click' },
                        when: {
                            show() {
                                addShepherdQueryParams();
                                $('ul.show').removeClass('show');
                            },
                        },
                    },
                    {
                        title: 'Layout widgets',
                        text: 'Now click on the <em>"Widgets"</em> menu item.',
                        attachTo: { element: 'a[href*=Layers]', on: 'right' },
                        buttons: [
                            backButton,
                        ],
                        id: 'adding_widgets_to_the_layout_widgets',
                        when: {
                            show() {
                                setWalkthroughCookies(this.tour.options.id, 'adding_widgets_to_the_layout_zones');
                                addShepherdQueryParams();
                            },
                        },
                    },
                    {
                        title: 'Layout widgets',
                        text: `<p>These are the layout zones. The Orchard Core layout is divided into multiple such
                            zones, providing sections where you can put widgets (and much more, but that's a
                            development topic).</p>
                            <p>Currently, we have <em>"Content"</em> and <em>"Footer"</em>. You can add new zones by
                            going to <em>Design → Settings → Zones</em>, but keep in mind, that these zones should then
                            also be displayed by the current theme on the frontend. That's also a development topic, so
                            perhaps leave it for another day.</p>`,
                        attachTo: { element: '.col-md-8', on: 'top' },
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id, 'adding_widgets_to_the_layout_design', 'Admin', 'Admin');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'adding_widgets_to_the_layout_zones',
                    },
                    {
                        title: 'Layout widgets',
                        text: `<p>Widgets are put not just into zones, but also layers. Zones define <em>where</em> a
                            given widget is displayed on the layout, while layers specify <em>when</em> it's displayed.
                            E.g., if you put a widget on the <em>"Homepage"</em> layer, it will only appear on the
                            homepage.</p>
                            <p>You can add new layers and edit their rules, i.e. the logic that determines when they're
                            active. More infor is avaialable in the
                            <a href="https://docs.orchardcore.net/en/latest/docs/reference/modules/Layers/" target="_blank">
                            official docs</a>.</p>`,
                        attachTo: { element: '.col-md-4.col-md-pull-end', on: 'top' },
                        canClickTarget: false,
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'adding_widgets_to_the_layout_layers',
                    },
                    {
                        title: 'Layout widgets',
                        text: 'Let\'s add a widget to the content zone! Click on <em>"Add Widget"</em>.',
                        attachTo: { element: '.btn.btn-primary.btn-sm.dropdown-toggle', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'adding_widgets_to_the_layout_add_widget',
                        advanceOn: { selector: '.btn.btn-primary.btn-sm.dropdown-toggle', event: 'click' },
                    },
                    {
                        title: 'Layout widgets',
                        text: 'Now click on <em>"Paragraph"</em> to add a simple widget that can contain a paragraph of text..',
                        attachTo: { element: 'a[data-widget-type="Paragraph"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'adding_widgets_to_the_layout_paragraph',
                        when: {
                            show() {
                                setWalkthroughCookies(this.tour.options.id, 'adding_widgets_to_the_layout_paragraph_title');
                                addShepherdQueryParams();
                            },
                        },
                    },
                    {
                        title: 'Layout widgets',
                        text: `Give it a title. This will show up in the previous screen, and can also optionally be
                            rendered on the frontend.`,
                        attachTo: { element: '#LayerMetadata_Title', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id, 'adding_widgets_to_the_layout_add_widget', 'Admin', 'Admin/Layers');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'adding_widgets_to_the_layout_paragraph_title',
                        when: {
                            show() {
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Layout widgets',
                        text: 'Give it some content.',
                        attachTo: { element: '.edit-item-parts', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id, 'adding_widgets_to_the_layout_add_widget', 'Admin', 'Admin/Layers');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'adding_widgets_to_the_layout_paragraph_content',
                        when: {
                            show() {
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'Layout widgets',
                        text: 'We are ready, let\'s publish it! Click on the publish button.',
                        attachTo: { element: 'button[name="submit.Publish"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'adding_widgets_to_the_layout_paragraph_publishing',
                        when: {
                            show() {
                                $('form').off('submit');
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'adding_widgets_to_the_layout_paragraph_published');
                            },
                        },
                    },
                    {
                        title: 'Layout widgets',
                        text: 'Your paragraph widget is now published. Let\'s go to the homepage to see it!',
                        attachTo: { element: 'a[data-bs-original-title="Visit Site"]', on: 'bottom' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id, 'adding_widgets_to_the_layout_add_widget', 'Admin', 'Admin/Layers');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'adding_widgets_to_the_layout_paragraph_published',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'adding_widgets_to_the_layout_paragraph_inspecting');
                            },
                        },
                    },
                    {
                        title: 'Layout widgets',
                        text: 'You should see your paragraph if you scroll down.',
                        attachTo: { element: 'body', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id, 'adding_widgets_to_the_layout_paragraph_published', null, 'Admin/Layers');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'adding_widgets_to_the_layout_paragraph_inspecting',
                    },
                    {
                        title: 'Content type editor',
                        text: `<p>We'll now take a look at how the sausage is made!</p>
                            <p>Until now, we've edited content items, i.e. pieces of content. We haven't yet seen where
                            the settings of those come from. E.g., where is it set that a Blob Post has a title and a
                            Markdown-formatted body? This is all configured in content types, i.e. the blueprints of
                            content items.</p>
                            <p>Let's check out content types and their editors on the admin. Click on the
                            <em>"Next"</em> button once you've gathered all your strength!</p>`,
                        buttons: [
                            backButton,
                            {
                                action: function () {
                                    goToRelativePage(Shepherd.activeTour.options.id, 'content_type_editor_content', null, 'Admin');
                                },
                                classes: 'shepherd-button-primary',
                                text: 'Next',
                            },
                        ],
                        id: 'content_type_editor_intro',
                    },
                    {
                        title: 'Content type editor',
                        text: 'Click on the <em>"Content"</em> dropdown.',
                        attachTo: { element: '#content', on: 'right' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id, 'content_type_editor_intro', 'Admin', '');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'content_type_editor_content',
                        advanceOn: { selector: '#content', event: 'click' },
                        when: {
                            show() {
                                addShepherdQueryParams();
                                $('ul.show').removeClass('show');
                            },
                        },
                    },
                    {
                        title: 'Content type editor',
                        text: 'Now click on the <em>"Content Definition"</em> dropdown.',
                        // There is no proper basic JS selector, to select the element, so we need to use a
                        // function.
                        savedElement: $('[title="Content Definition"]').parent().get(0),
                        attachTo: {

                            element: function getContentTypesButton() {
                                return this.options.savedElement;
                            },
                            on: 'right',
                        },
                        buttons: [
                            backButton,
                        ],
                        id: 'content_type_editor_content_definition',
                        // We should "advanceOn" the same button as "attachTo", but shepherd.js doesn't accept a
                        // function for that, so we are adding an event listener.
                        when: {
                            show() {
                                addShepherdQueryParams();
                                const element = this.options.savedElement;
                                $('[data-title="Content Definition"]').removeClass('show');

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
                        title: 'Content type editor',
                        text: `Click on the <em>"Content Types"</em> button. Note how this is now NOT the top "Content
                            Types" button.`,
                        attachTo: { element: 'a[href*= "ContentTypes"]', on: 'right' },
                        buttons: [
                            backButton,
                        ],
                        id: 'content_type_editor_content_types_button',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'content_type_editor_content_types');
                            },
                        },
                    },
                    {
                        title: 'Content type editor',
                        text: 'Here you can see and edit all the content types.',
                        attachTo: { element: '.ta-content', on: 'top' },
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id, 'content_type_editor_content', 'Admin', 'Admin');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'content_type_editor_content_types',
                    },
                    {
                        title: 'Content type editor',
                        text: 'Let\'s edit the Blog Post content type since we know that already very well! Click here.',
                        attachTo: { element: 'a[role="btn-edit-BlogPost"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'content_type_editor_content_types_blog_post',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'content_type_editor_blog_post_edit');
                            },
                        },
                    },
                    {
                        title: 'Content type editor',
                        text: `<p>Here you can see the content type's editor. All the options are explained here.</p>
                            <p>If you scroll down, you can also see the familiar Title and MarkdownBody <em>content
                            parts</em>. That's another term: content parts are the basic building blocks of content
                            types. They're reusable, so e.g. the title of blog posts and articles are all handled by
                            the same Title Part.</p>
                            <p>But what if you want to add a new field, like a text field? Let's see that next! <em>
                            Content fields</em> are also building blocks of content types, smaller ones, usually only
                            storing a single piece of data. But unlike parts, they can be added to the same content
                            type multiple times (e.g., your content type can only have a single MarkdownBody, but can
                            have any number of Text Fields). If your head hurts, check out the docs
                            <a href="https://docs.orchardcore.net/en/latest/docs/glossary/#content-item" target="_blank">
                            here</a>.</p>`,
                        attachTo: { element: '.ta-content', on: 'top' },
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'content_type_editor_content_types_blog_post',
                                        'Admin',
                                        'Admin/ContentTypes/List');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'content_type_editor_blog_post_edit',
                    },
                    {
                        title: 'Content type editor',
                        text: 'You can add a new field by clicking here.',
                        scrollTo: true,
                        attachTo: { element: '.btn.btn-info.btn-sm', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'content_type_editor_blog_post_add_field',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'content_type_editor_blog_post_adding_field');
                            },
                        },
                    },
                    {
                        title: 'Content type editor',
                        text: `<p>Let's suppose that you're writing a travel blog, and want to display the locations
                            where the blog post takes place, like "Budapest, Hungary and Lake Balaton, Hungary". So,
                            perhaps name the field "Location"? (Or you can think of a different example too, of
                            course.)</p>
                            <p>Fields also have a technical name, but that'll be auto-generated for you.</p>`,
                        attachTo: { element: '#DisplayName', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'content_type_editor_blog_post_add_field',
                                        'Admin',
                                        'Admin/ContentTypes/Edit/BlogPost');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'content_type_editor_blog_post_adding_field',
                    },
                    {
                        title: 'Content type editor',
                        text: `Select Text Field. Notice how there are many more fields available? You can try them out
                            later.`,
                        attachTo: { element: 'input[value="TextField"]', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'content_type_editor_blog_post_adding_text_field',
                    },
                    {
                        title: 'Content type editor',
                        text: 'Okay, now save it.',
                        attachTo: { element: 'button.btn.btn-primary.save[type="Submit"]', on: 'bottom' },
                        buttons: [
                            backButton,
                        ],
                        id: 'content_type_editor_blog_post_save_text_field',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(
                                    this.tour.options.id,
                                    'content_type_editor_blog_post_edit_text_field',
                                    'content_type_editor_blog_post_add_field');
                            },
                        },
                    },
                    {
                        title: 'Content type editor',
                        text: 'Now let\'s edit the text field to see what we can do with it!',
                        scrollTo: true,
                        // There is no proper basic JS selector, to select the element, so we need to use a function.
                        savedElement: $('.btn.btn-primary.btn-sm').get(1),
                        attachTo: {

                            element: function getContentTypesButton() {
                                return this.options.savedElement;
                            },
                            on: 'top',
                        },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'content_type_editor_blog_post_save_text_field',
                                        'Admin',
                                        'Admin/ContentTypes/AddFieldsTo/BlogPost');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'content_type_editor_blog_post_edit_text_field',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'content_type_editor_blog_post_editing_text_field');
                            },
                        },
                    },
                    {
                        title: 'Content type editor',
                        text: 'Most of the options are well explained.',
                        attachTo: { element: '.ta-content', on: 'top' },
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'content_type_editor_blog_post_edit_text_field',
                                        'Admin',
                                        'Admin/ContentTypes/Edit/BlogPost');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'content_type_editor_blog_post_editing_text_field',
                    },
                    {
                        title: 'Content type editor',
                        text: `You can select the editor type here. This affects whether you have a simple text field,
                            a field to edit e-mail addresses or phone numbers, or even a code editor. There are many
                            options, check them out!`,
                        attachTo: { element: '#field-editor-select', on: 'right' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'content_type_editor_content_types_blog_post_text_field_editor',
                    },
                    {
                        title: 'Content type editor',
                        text: `You can also select the display mode here. This affects how the text will appear on the
                            frontend. By the way, all of these options are extensible, so if you're willing to write
                            some code, you can have your own editors or displays too!`,
                        attachTo: { element: '#field-display-select', on: 'right' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'content_type_editor_blog_post_text_field_display_mode',
                    },
                    {
                        title: 'Content type editor',
                        text: 'Okay, now save it.',
                        attachTo: { element: 'button.btn.btn-primary.save[type="Submit"]', on: 'bottom' },
                        buttons: [
                            backButton,
                        ],
                        id: 'content_type_editor_blog_post_text_field_edit_save',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(
                                    this.tour.options.id,
                                    'content_type_editor_blog_post_text_field_edit_saved',
                                    'content_type_editor_blog_post_edit_text_field');
                            },
                        },
                    },
                    {
                        title: 'Content type editor',
                        text: 'The text field is now saved. You will also have to save the blog post content type.',
                        scrollTo: true,
                        attachTo: { element: 'button.btn.btn-primary.save[type="Submit"]', on: 'bottom' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'content_type_editor_blog_post_edit_text_field',
                                        'Admin',
                                        'Admin/ContentTypes/Edit/BlogPost');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'content_type_editor_blog_post_text_field_edit_saved',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'content_type_editor_blog_post_edit_saved');
                            },
                        },
                    },
                    {
                        title: 'Content type editor',
                        text: `Congratulations, you just tinkered with what's under the hood! Now if you edit a blog
                            post, the new text field's editor will appear and once you published the blog post, your
                            new field's content will be visible on the frontend too.`,
                        buttons: [
                            backButton,
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'audit_trail_intro',
                                        'Admin',
                                        'Admin');
                                },
                                classes: 'shepherd-button-primary',
                                text: 'Next',
                            },
                        ],
                        id: 'content_type_editor_blog_post_edit_saved',
                    },
                    {
                        title: 'Audit Trail',
                        text: `<p>The Audit Trail module provides an immutable (for users, even administrators, but not 
                            for developers), auditable log of certain changes and events in the system. This includes
                            e.g. creation or deletion of content items, and events like user login failures. For
                            content items, previous versions and deleted items can be restored, and changes can be
                            tracked.</p>
                            <p>All this is quite useful especially if multiple admins are editing content. But even if
                            you're working alone, it's handy to be able to see content changes and go back to previous
                            versions.</p>
                            <p>Audit Trail was turned on and configured by the setup recipe. Let's take a look!</p>`,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'content_type_editor_blog_post_edit_saved',
                                        'Admin',
                                        'Admin/ContentTypes/Edit/BlogPost');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'audit_trail_intro',
                    },
                    {
                        title: 'Audit Trail',
                        text: 'Click on <em>"Configuration"</em>. Most of the Orchard Core settings are available here.',
                        attachTo: { element: '#configuration', on: 'right' },
                        scrollTo: true,
                        buttons: [
                            backButton,
                        ],
                        id: 'audit_trail_configuration',
                        advanceOn: { selector: '#configuration', event: 'click' },
                        when: {
                            show() {
                                addShepherdQueryParams();
                                $('ul.show').removeClass('show');
                            },
                        },
                    },
                    {
                        title: 'Audit Trail',
                        text: 'Click on <em>"Settings"</em>.',
                        // There is no proper basic JS selector, to select the element, so we need to use a function.
                        savedElement: $('[data-title="Configuration"]')
                            .find('[title="Settings"]')
                            .first()
                            .parent()
                            .get(0),
                        attachTo: {

                            element: function getContentTypesButton() {
                                return this.options.savedElement;
                            },
                            on: 'right',
                        },
                        buttons: [
                            backButton,
                        ],
                        id: 'audit_trail_settings',
                        // We should "advanceOn" the same button as "attachTo", but shepherd.js doesn't accept a
                        // function for that, so we are adding an event listener.
                        when: {
                            show() {
                                addShepherdQueryParams();
                                const element = this.options.savedElement;
                                $('[data-title="Settings"]').removeClass('show');

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
                        title: 'Audit Trail',
                        text: 'Click on <em>"Audit Trail"</em>.',
                        attachTo: { element: '#audittrailSettings', on: 'right' }, // #spell-check-ignore-line
                        buttons: [
                            backButton,
                        ],
                        id: 'audit_trail_audit_trail',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'audit_trail_settings_page');
                            },
                        },
                    },
                    {
                        title: 'Audit Trail',
                        text: 'Here you can see and turn on or off all the events that we are tracking.',
                        attachTo: { element: '.edit-item', on: 'top' },
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'audit_trail_intro',
                                        'Admin',
                                        'Admin');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'audit_trail_settings_page',
                    },
                    {
                        title: 'Audit Trail',
                        text: 'Click here to see the trimming settings.',
                        attachTo: { element: 'a[href="#tab-trimming"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'audit_trail_trimming_tab_button',
                        advanceOn: { selector: 'a[href="#tab-trimming"]', event: 'click' },
                    },
                    {
                        title: 'Audit Trail',
                        text: `To not let the Audit Trail database grow indefinitely, you can configure a periodic
                            trimming. This will clean up old entries. A retention period of 90 days is a good default
                            (hence why it's the default!).`,
                        attachTo: { element: '.edit-item', on: 'top' },
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'audit_trail_settings_page',
                                        'Admin',
                                        'Admin/Settings/AuditTrail');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'audit_trail_trimming_tab',
                    },
                    {
                        title: 'Audit Trail',
                        text: 'Click here to see the content types whose events are recorded.',
                        attachTo: { element: 'a[href="#tab-content"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'audit_trail_content_tab_button',
                        advanceOn: { selector: 'a[href="#tab-content"]', event: 'click' },
                    },
                    {
                        title: 'Audit Trail',
                        text: 'These are the content whose events are currently recorded. Feel free to change this.',
                        attachTo: { element: '.edit-item', on: 'top' },
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'audit_trail_settings_page',
                                        'Admin',
                                        'Admin/Settings/AuditTrail');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'audit_trail_content_tab',
                    },
                    {
                        title: 'Audit Trail',
                        text: `Now let's see how we can see the details of the recorded events! Click on the <em>"Audit
                            Trail"</em> button.`,
                        attachTo: { element: '#audittrail', on: 'right' }, // #spell-check-ignore-line
                        buttons: [
                            backButton,
                        ],
                        id: 'audit_trail_recorded_events',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'audit_trail_log');
                            },
                        },
                    },
                    {
                        title: 'Audit Trail',
                        text: `Here you can see all the recorded events. You may find your previous content changes
                            listed here, as well as logins.`,
                        attachTo: { element: '.ta-content', on: 'top' },
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'audit_trail_settings_page',
                                        'Admin',
                                        'Admin/Settings/AuditTrail');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'user_management_intro',
                                        'Admin',
                                        'Admin');
                                },
                                classes: 'shepherd-button-primary',
                                text: 'Next',
                            },
                        ],
                        id: 'audit_trail_log',
                    },
                    {
                        title: 'User management',
                        text: `It's too quiet if you're alone in your Orchard Core app. Time to invite your colleagues
                            or friends, perhaps? Let's take a look at user management! Click on the <em>"Security"</em>
                            dropdown.`,
                        attachTo: { element: '#security', on: 'right' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'audit_trail_log',
                                        'Admin',
                                        'Admin/AuditTrail');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'user_management_intro',
                        advanceOn: { selector: '#security', event: 'click' },
                        when: {
                            show() {
                                addShepherdQueryParams();
                                $('ul.show').removeClass('show');
                            },
                        },
                    },
                    {
                        title: 'User management',
                        text: `This menu contains all security and role-based access control-related settings. For now,
                            we're only interestd in user management specifically, so click on <em>"Users"</em>.`,
                        attachTo: { element: '.users', on: 'right' },
                        buttons: [
                            backButton,
                        ],
                        id: 'user_management_users_button',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'user_management_users');
                            },
                        },
                    },
                    {
                        title: 'User management',
                        text: 'Here you can see all the users, including your current account, "testuser".', // #spell-check-ignore-line
                        attachTo: { element: '.ta-content', on: 'top' },
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'user_management_intro',
                                        'Admin',
                                        'Admin');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'user_management_users',
                    },
                    {
                        title: 'User management',
                        text: `You can edit existing users and add add new ones (this also works if user registration
                            is not enabled, which is the case by default). Click here to add a new user.`,
                        attachTo: { element: 'a[href*="Users/Create"', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'user_management_adding_user',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'user_management_create_user_user_name');
                            },
                        },
                    },
                    {
                        title: 'User management',
                        text: `Think of someone you like so much you want them in your Orchard Core app, then add a
                            user name for them.`,
                        attachTo: { element: '#User_UserName', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'user_management_adding_user',
                                        'Admin',
                                        'Admin/Users/Index');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'user_management_create_user_user_name',
                        when: {
                            show() {
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'User management',
                        text: 'Add their e-mail address.',
                        attachTo: { element: '#User_Email', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'user_management_create_user_email',
                        when: {
                            show() {
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'User management',
                        text: `You can enter a phone number too, but it's optional. It becomes more interesting if you
                            enable SMS-based
                            <a href="https://docs.orchardcore.net/en/latest/docs/reference/modules/Users/#two-factor-authentication" target="_blank">
                            two-factor authentication</a>.`,
                        attachTo: { element: '#User_PhoneNumber', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'user_management_create_user_phone_number',
                        when: {
                            show() {
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'User management',
                        text: `You can disable the user, though for a new one this kind of misses the point. This
                            option is also available for existing users. If a user is disabled then they will not be
                            able to log in.`,
                        attachTo: { element: '#User_IsEnabled', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'user_management_create_user_is_enabled',
                        when: {
                            show() {
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'User management',
                        text: `You can enter a password or generate a strong one automatically. Don't forget to copy it
                            though if you generate it, otherwise nobody will know it!`,
                        attachTo: { element: '.password-generator-wrapper', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'user_management_create_user_password',
                        when: {
                            show() {
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'User management',
                        text: `Finally, you can select one or more roles for the user. Each role gives different
                            permissions for users. We will take a look at that later. If you don't select anything here,
                            the user will only have the default Authenticated role after they log in, and Anonymous
                            before that.`,
                        savedElement: $('#User_Roles_0__Role').parent().parent().get(0),
                        attachTo: {
                            element: function getContentTypesButton() {
                                return this.options.savedElement;
                            },
                            on: 'top',
                        },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'user_management_create_user_roles',
                        when: {
                            show() {
                                preventSubmit();
                            },
                        },
                    },
                    {
                        title: 'User management',
                        text: 'We are ready, let\'s publish the user! Click on the publish button.',
                        attachTo: { element: 'button.btn.btn-primary.save[type="Submit"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'user_management_create_user_publishing',
                        when: {
                            show() {
                                $('form').off('submit');
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'user_management_create_user_published');
                            },
                        },
                    },
                    {
                        title: 'User management',
                        text: 'You should see the newly created user here.',
                        attachTo: { element: '.ta-content', on: 'top' },
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'user_management_adding_user',
                                        'Admin',
                                        'Admin/Users/Index');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'user_management_create_user_published',
                        when: {
                            show() {
                                if ($('.validation-summary-errors').length) {
                                    deleteWalkthroughCookies();
                                    Shepherd.activeTour.back();
                                    return;
                                }

                                addShepherdQueryParams();
                            },
                        },
                    },
                    {
                        title: 'Roles',
                        text: `Since you're surely curious about those roles we've seen a glimpse of, let's actually
                            see them now! Click on the <em>"Security"</em> dropdown.`,
                        attachTo: { element: '#security', on: 'right' },
                        buttons: [
                            backButton,
                        ],
                        id: 'roles_intro',
                        advanceOn: { selector: '#security', event: 'click' },
                        when: {
                            show() {
                                addShepherdQueryParams();
                                $('ul.show').removeClass('show');
                            },
                        },
                    },
                    {
                        title: 'Roles',
                        text: 'Now click on <em>"Roles"</em>.',
                        attachTo: { element: '.roles', on: 'right' },
                        buttons: [
                            backButton,
                        ],
                        id: 'roles_roles_button',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'roles_roles_page');
                            },
                        },
                    },
                    {
                        title: 'Roles',
                        text: `Here you can see all the existing roles and edit their permissions. All users will be in
                            the "Anonymous" role by default. Once they log in, they'll have the "Authenticated" role
                            istead. Then, you can configure further logged-in roles (users can have multiple roles) here.`,
                        attachTo: { element: '.ta-content', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'user_management_create_user_published',
                                        'Admin',
                                        'Admin/Users/Index');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'roles_roles_page',
                    },
                    {
                        title: 'Roles',
                        text: 'Let\'s see one! Click on the <em>"Edit"</em> button.',
                        attachTo: { element: '.edit.btn.btn-primary.btn-sm', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'roles_edit_button',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'roles_edit');
                            },
                        },
                    },
                    {
                        title: 'Roles',
                        text: `<p>A role is a collection of permissions that the user has. And permissions specify what a
                            user can do in Orchard Core.</p>
                            <p>Since we're looking a the Administrator role, these users are very powerful. Sine the
                            role also has the "Site Owners Permission" (see below), they can do just about anything.
                            By the way, you're one of them :).</p>`,
                        attachTo: { element: '.ta-content', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'roles_edit_button',
                                        'Admin',
                                        'Admin/Roles/Index');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'roles_edit',
                    },
                    {
                        title: 'Roles',
                        text: 'Not much to tune on this role, but click on the <em>"Save"</em> button to save any changes.',
                        attachTo: { element: 'button.btn.btn-primary.save[type="Submit"]', on: 'top' },
                        scrollTo: true,
                        buttons: [
                            backButton,
                        ],
                        id: 'roles_publishing',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'roles_published');
                            },
                        },
                    },
                    {
                        title: 'Roles',
                        text: `If you change permissions of a role, then all users with that role will lose or gain
                            those permissions.`,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'roles_edit_button',
                                        'Admin',
                                        'Admin/Roles/Index');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'deployment_intro',
                                        'Admin',
                                        'Admin');
                                },
                                classes: 'shepherd-button-primary',
                                text: 'Next',
                            },
                        ],
                        id: 'roles_published',
                    },
                    {
                        title: 'Deployment',
                        text: `Let's take a look at exporting and importing, deployment and deployment plans! These
                            features will allow you to move content and configuration between Orchard Core instances.`,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'roles_published',
                                        'Admin',
                                        'Admin/Roles/Index');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'deployment_intro',
                    },
                    {
                        title: 'Deployment',
                        text: 'Click on <em>"Configuration"</em>.',
                        attachTo: { element: '#configuration', on: 'right' },
                        scrollTo: true,
                        buttons: [
                            backButton,
                        ],
                        id: 'deployment_configuration',
                        advanceOn: { selector: '#configuration', event: 'click' },
                        when: {
                            show() {
                                addShepherdQueryParams();
                                $('ul.show').removeClass('show');
                            },
                        },
                    },
                    {
                        title: 'Deployment',
                        text: 'Click on <em>"Import/Export"</em>.',
                        savedElement: $('[title="Import/Export"]').parent().get(0),
                        attachTo: {

                            element: function getContentTypesButton() {
                                return this.options.savedElement;
                            },
                            on: 'right',
                        },
                        buttons: [
                            backButton,
                        ],
                        id: 'deployment_import_export',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                const element = this.options.savedElement;
                                $('[data-title="Import/Export"]').removeClass('show');

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
                        title: 'Deployment',
                        text: `<p>We'll start with <em>"Deployment Plans"</em>. A Deployment Plan is a collection of steps
                            that build an export of your site. The result will be a downloadable recipe file (or it can
                            even be automatically sent to another Orchard Core instance with Remote Deployment).</p>
                            <p>You've already used recipes before, right when you've run the setup in the very
                            beginning. Recipes are simply JSON files.</p>`,
                        attachTo: { element: 'a[href*="DeploymentPlan"]', on: 'right' },
                        buttons: [
                            backButton,
                        ],
                        id: 'deployment_deployment_plan',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'deployment_deployment_plans');
                            },
                        },
                    },
                    {
                        title: 'Deployment',
                        text: 'Here you would see the deployment plans, but we currently have none.',
                        attachTo: { element: '.ta-content', on: 'top' },
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'deployment_intro',
                                        'Admin',
                                        'Admin');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'deployment_deployment_plans',
                    },
                    {
                        title: 'Deployment',
                        text: 'Let\'s create a deployment plan! Click here.',
                        attachTo: { element: '.btn.btn-secondary.create', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'deployment_add_deployment_plan',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'deployment_creating_deployment_plan');
                            },
                        },
                    },
                    {
                        title: 'Deployment',
                        text: 'Give it a name.',
                        attachTo: { element: '#Name', on: 'top' },
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'deployment_creating_deployment_plan',
                    },
                    {
                        title: 'Deployment',
                        text: 'Now click on the <em>"Create"</em> button.',
                        attachTo: { element: '.btn.btn-primary.create', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'deployment_deployment_plan_publishing',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'deployment_deployment_plan_published');
                            },
                        },
                    },
                    {
                        title: 'Deployment',
                        text: `Now we have a deployment plan, but it's empty. Let's add steps! Click on the <em>"Manage
                            Steps"</em> button.`,
                        attachTo: { element: '.btn.btn-info.btn-sm', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'deployment_add_deployment_plan',
                                        'Admin',
                                        'Admin/DeploymentPlan/Index');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'deployment_deployment_plan_published',
                        when: {
                            show() {
                                if ($('.validation-summary-errors').length) {
                                    deleteWalkthroughCookies();
                                    Shepherd.activeTour.back();
                                    return;
                                }

                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'deployment_add_step');
                            },
                        },
                    },
                    {
                        title: 'Deployment',
                        text: 'Click on the <em>"Add Step"</em> button.',
                        attachTo: { element: '.btn.btn-primary.btn-sm', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'deployment_deployment_plan_published',
                                        'Admin',
                                        'Admin/DeploymentPlan/Index');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                        ],
                        id: 'deployment_add_step',
                        advanceOn: { selector: '.btn.btn-primary.btn-sm', event: 'click' },
                    },
                    {
                        title: 'Deployment',
                        text: `Here you can see all the steps that you can use. Just as anything in Orchard Core, this
                            list is extensible. Built-in modules and ones developed by you can add more steps.`,
                        attachTo: { element: '.modal-body', on: 'top' },
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'deployment_deployment_plan_published',
                                        'Admin',
                                        'Admin/DeploymentPlan/Index');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'deployment_manage_steps',
                        advanceOn: { selector: '.btn.btn-primary.btn-sm', event: 'click' },
                    },
                    {
                        title: 'Deployment',
                        text: `<p>Let's filter for <em>"Update Content Definitions"</em>! (Click on the <em>"Next"</em>
                            button.)</p>
                            <p>This step will allow you to export all the content definition from this site (so, all
                            the content types and their configuration, together with content parts). Then, when
                            importing the recipe on the target site, it'll create or update all content definition it
                            brought.</p>`,
                        attachTo: { element: '#search-box', on: 'top' },
                        canClickTarget: false,
                        scrollTo: true,
                        buttons: [
                            backButton,
                            {
                                action: function () {
                                    const searchBox = $('#search-box');
                                    searchBox.val('Update Content Definitions');
                                    searchBox.trigger('keyup'); // #spell-check-ignore-line
                                    return this.next();
                                },
                                classes: 'shepherd-button-primary',
                                text: 'Next',
                            },
                        ],
                        id: 'deployment_filter_steps',
                    },
                    {
                        title: 'Deployment',
                        text: `<p><em>"Update Content Definitions"</em> exports the chosen content types and parts (you 
                            can configure it later which ones).</p>
                            <p>After running the deployment plan, each step will add its own JSON to the final
                            <em>"recipe.json"</em> file, which you can later download. You can then import this file on
                            maybe another Orchard Core site and it will add all the content/configuration that you
                            exported. Click on <em>"Add"</em>.`,
                        attachTo: { element: '.btn.btn-primary.btn-sm[href*="ContentDefinitionDeploymentStep"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'deployment_update_content_definitions',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'deployment_update_content_definitions_edit');
                            },
                        },
                    },
                    {
                        title: 'Deployment',
                        text: `<p>Here you can select which content types and parts you want to include. How about
                            choosing Article and Blog Post, since we already know them?</p>
                            <p>Note how you can hoose content parts too. This is useful since content parts can have
                            their own configuration too. This is useful when reusing them among multiple content types.</p>
                            <p>Be sure to tick all parts for the content types you select too!</p>`,
                        attachTo: { element: '.ta-content', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'deployment_deployment_plan_published',
                                        'Admin',
                                        'Admin/DeploymentPlan/Index');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'deployment_update_content_definitions_edit',
                    },
                    {
                        title: 'Deployment',
                        text: 'If you\'re finished, click on the <em>"Create"</em> button.',
                        attachTo: { element: '.btn.btn-primary.create', on: 'top' },
                        scrollTo: true,
                        buttons: [
                            backButton,
                        ],
                        id: 'deployment_update_content_definitions_publishing',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'deployment_update_content_definitions_published');
                            },
                        },
                    },
                    {
                        title: 'Deployment',
                        text: `As you can see, you added the step to the deployment plan. You could add more steps;
                            e.g., <em>"All Content"</em> would export all the content <strong>items</strong>.`,
                        attachTo: { element: '.ta-content', on: 'top' },
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'deployment_deployment_plan_published',
                                        'Admin',
                                        'Admin/DeploymentPlan/Index');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'deployment_update_content_definitions_published',
                    },
                    {
                        title: 'Deployment',
                        text: 'Once you finished adding steps, you can click on <em>"Execute"</em> to run the deployment.',
                        attachTo: { element: '.btn.btn-success.btn-sm', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'deployment_execute',
                        advanceOn: { selector: '.btn.btn-success.btn-sm', event: 'click' },
                    },
                    {
                        title: 'Deployment',
                        text: `Here you can use <em>"File Download"</em> so the exported <em>recipe.json</em> file will 
                            be downloaded (inside a zip file).`,
                        attachTo: { element: '.btn.btn-primary.btn-sm[href*="ExportFile"]', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'deployment_file_download',
                        advanceOn: { selector: '.btn.btn-primary.btn-sm[href*="ExportFile"]', event: 'click' },
                    },
                    {
                        title: 'Deployment',
                        text: `We've now seen how to export content. But you surely want to see how to import it! We'll
                            do exactly that. Click on <em>"Configuration"</em>.`,
                        attachTo: { element: '#configuration', on: 'right' },
                        scrollTo: true,
                        buttons: [
                            backButton,
                        ],
                        id: 'deployment_import_configuration',
                        advanceOn: { selector: '#configuration', event: 'click' },
                        when: {
                            show() {
                                addShepherdQueryParams();
                                $('ul.show').removeClass('show');
                            },
                        },
                    },
                    {
                        title: 'Deployment',
                        text: 'Click on <em>"Import/Export"</em> again.',
                        savedElement: $('[title="Import/Export"]').parent().get(0),
                        attachTo: {

                            element: function getContentTypesButton() {
                                return this.options.savedElement;
                            },
                            on: 'right',
                        },
                        buttons: [
                            backButton,
                        ],
                        id: 'deployment_import_import_export',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                const element = this.options.savedElement;
                                $('[data-title="Import/Export"]').removeClass('show');

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
                        title: 'Deployment',
                        text: 'Click on <em>"Package Import"</em>.',
                        attachTo: { element: 'a[href*="DeploymentPlan/Import/Index"]', on: 'right' },
                        buttons: [
                            backButton,
                        ],
                        id: 'deployment_import_package_import',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'deployment_import_package_import_choose_file');
                                // scrollTo: true doesn't work here.
                                setTimeout(() => { $('#adminMenu').get(0).scrollTo(0, 9999); }, 200);
                            },
                        },
                    },
                    {
                        title: 'Deployment',
                        text: 'Here you can import your exported deployment plan (a JSON file directly or ZIP in a file).',
                        attachTo: { element: '#file', on: 'top' },
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'deployment_deployment_plan_published',
                                        'Admin',
                                        'Admin/DeploymentPlan/Index');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'deployment_import_package_import_choose_file',
                    },
                    {
                        title: 'Deployment',
                        text: `After you selected the file, click on <em>"Import"</em> to import it. This will add, 
                            delete, or change everything that is configured in the deployment plan.`,
                        attachTo: { element: '.btn.btn-primary.import', on: 'top' },
                        buttons: [
                            backButton,
                        ],
                        id: 'deployment_import_package_import_import',
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'deployment_import_package_import_imported');
                            },
                        },
                    },
                    {
                        title: 'Deployment',
                        text: `You can also import a piece of JSON text directly too. It's under the same
                            <em>"Import/Export"</em> dropdown called <em>"JSON import"</em>.`,
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'deployment_import_package_import_imported',
                    },
                    {
                        title: 'Themes and modules',
                        text: `<p>Now let's take a look at how plugins work in Orchard Core. Note that we call them
                            extensions here.</p> 
                            <p>There are many built-in extensions (like all the ones that you use during this
                            walkthrough), and you or other developers can create their own ones too.</p>
                            <p>We have two kinds of extensions: Themes and modules. Themes define how a website looks
                            and feels by controlling its graphics, layouts, styles, and UX, without altering the site's
                            core functionality. They enable easy customization and allow you to switch the appearance
                            of your website quickly.</p>
                            </p>We'll first take a look at themes, and then see what modules do.</p>`,
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'features_and_themes_themes_intro',
                    },
                    {
                        title: 'Themes and modules',
                        text: 'Click on <em>"Design"</em>.',
                        attachTo: { element: '#themes', on: 'right' },
                        buttons: [
                            backButton,
                        ],
                        id: 'features_and_themes_design',
                        advanceOn: { selector: '#themes', event: 'click' },
                        when: {
                            show() {
                                addShepherdQueryParams();
                                $('ul.show').removeClass('show');
                            },
                        },
                    },
                    {
                        title: 'Themes and modules',
                        text: 'Click on <em>"Themes"</em>.',
                        attachTo: { element: 'a[href*="Admin/Themes"]', on: 'right' },
                        buttons: [
                            backButton,
                        ],
                        id: 'features_and_themes_themes',
                        advanceOn: { selector: 'a[href*="Admin/Themes"]', event: 'click' },
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'features_and_themes_themes_page');
                            },
                        },
                    },
                    {
                        title: 'Themes and modules',
                        text: 'Here you can see and change the themes. Currently the site is using the blog theme.',
                        attachTo: { element: '.ta-content', on: 'top' },
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'features_and_themes_themes_intro',
                                        'Admin',
                                        'Admin/DeploymentPlan/Import/Index');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'features_and_themes_themes_page',
                    },
                    {
                        title: 'Themes and modules',
                        text: 'Take a look at features. Features in Orchard Core are modular components that add ' +
                            'specific functionalities to a website, providing a way to extend the system by ' +
                            'enabling or disabling distinct capabilities.',
                        buttons: [
                            backButton,
                            nextButton,
                        ],
                        id: 'features_and_themes_features_intro',
                    },
                    {
                        title: 'Themes and modules',
                        text: 'Click on <em>"Configuration"</em>.',
                        attachTo: { element: '#configuration', on: 'right' },
                        buttons: [
                            backButton,
                        ],
                        id: 'features_and_themes_features_configuration',
                        advanceOn: { selector: '#configuration', event: 'click' },
                        when: {
                            show() {
                                addShepherdQueryParams();
                                $('ul.show').removeClass('show');
                            },
                        },
                    },
                    {
                        title: 'Themes and modules',
                        text: 'Click on <em>"Features"</em>.',
                        attachTo: { element: 'a[href*="Admin/Features"]', on: 'right' },
                        buttons: [
                            backButton,
                        ],
                        id: 'features_and_themes_features_features',
                        advanceOn: { selector: 'a[href*="Admin/Features"]', event: 'click' },
                        when: {
                            show() {
                                addShepherdQueryParams();
                                setWalkthroughCookies(this.tour.options.id, 'features_and_themes_features_features_page');
                            },
                        },
                    },
                    {
                        title: 'Themes and modules',
                        text: 'Here you can see all the features and you can turn them on or off.',
                        attachTo: { element: '.ta-content', on: 'top' },
                        canClickTarget: false,
                        buttons: [
                            {
                                action: function () {
                                    goToRelativePage(
                                        Shepherd.activeTour.options.id,
                                        'features_and_themes_features_intro',
                                        'Admin',
                                        'Admin/Themes');
                                },
                                classes: 'shepherd-button-secondary',
                                text: 'Back',
                            },
                            nextButton,
                        ],
                        id: 'features_and_themes_features_features_page',
                    },
                    {
                        title: 'Walkthrough completed',
                        text: 'Congratulations! You completed the walkthrough. For further learning points, you can ' +
                            'watch these videos: <ul><li><a href ="https://www.youtube.com/watch?v=6jJH9ntqi_A&list=PLuskKJW0FhJcSX7j0Bd-1X5hq3dgCtYwO&index=13" target="_blank">Searching and indexing Orchard Core content items - Dojo Course 3 (11)</a></li><li><a href ="https://www.youtube.com/watch?v=pi_WiSqp5x4&list=PLuskKJW0FhJcSX7j0Bd-1X5hq3dgCtYwO&index=14" target="_blank">Automating tasks in Orchard Core with Workflows and Liquid markup - Dojo Course 3 (12)</a></li><li><a href ="https://www.youtube.com/watch?v=Sd-aYy5DblI&list=PLuskKJW0FhJcSX7j0Bd-1X5hq3dgCtYwO&index=15" target="_blank">Building a form from the admin in Orchard Core (Forms, Workflows, Liquid) - Dojo Course 3 (13)</a></li></ul>',
                        buttons: [
                            backButton,
                            {
                                action: function () {
                                    return this.next();
                                },
                                classes: 'shepherd-button-primary',
                                text: 'End',
                            },
                        ],
                        id: 'outro', // #spell-check-ignore-line
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
                    text: `<p>Welcome! The <a href="https://github.com/Lombiq/Orchard-Walkthroughs" target="_blank">
                        Lombiq.Walkthroughs module</a> is active. This module includes various walkthroughs that 
                        provide hands-on tutorials guided by interactive tooltips.</p>
                        <p>Do you prefer tutorial videos or deep-diving into the code instead? Check out 
                        <a href="https://orcharddojo.net/orchard-training/dojo-course-3-the-full-orchard-core-tutorial" target="_blank">
                        Dojo Course 3</a>!</p>
                        <p>You can pause a walkthrough at any time. Just bookmark the page and you can open it later to
                        continue where you left off.</p>
                        <p>You can get back here by canceling the current walkthrough and pressing the below button on
                        the homepage. Please only use the walkthroughs' built-in navigation!<p>
                        <p>Please select a walkthrough to start:</p>`,

                    buttons: [
                        {
                            text: 'Orchard Core Admin Walkthrough',
                            action: function () {
                                walkthroughSelector.complete();
                                walkthroughs.orchardCoreAdminWalkthrough.start();
                            },
                            classes: 'shepherd-button-primary',
                        },
                        // Add new walkthroughs here.
                    ],
                    id: 'walkthroughSelector',
                },
            ],
        });

        const queryParams = getShepherdQueryParams();
        const walkthroughCookies = getWalkthroughCookies();
        const walkthroughSelectorButton = $('#walkthrough-selector-button');

        if (queryParams.shepherdTour &&
            queryParams.shepherdStep &&
            walkthroughCookies.ignoreQueryStepCookieValue !== queryParams.shepherdStep) {
            const currentTour = walkthroughs[queryParams.shepherdTour];
            currentTour.start();
            currentTour.show(queryParams.shepherdStep);
        }
        else if (walkthroughCookies.walkthroughCookieValue && walkthroughCookies.walkthroughStepCookieValue) {
            const walkthrough = walkthroughCookies.walkthroughCookieValue;
            const step = walkthroughCookies.walkthroughStepCookieValue;

            deleteWalkthroughCookies();

            const currentTour = walkthroughs[walkthrough];
            currentTour.start();
            currentTour.show(step);

            addShepherdQueryParams();

            // Auto-start the walkthrough if we are on the homepage and not in the walkthrough yet.
        }
        else if (walkthroughSelectorButton.length) {
            walkthroughSelector.start();
        }

        // The walkthrough will automatically start, but there is still a way to manually start it.
        if (walkthroughSelectorButton) {
            walkthroughSelectorButton.on('click', function startWalkthroughSelector() {
                walkthroughSelector.start();
            });
        }
    })(window.Shepherd);
});
