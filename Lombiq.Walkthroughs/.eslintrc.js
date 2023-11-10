module.exports = {
    // Setting root=true prevents ESLint from taking into account .eslintrc files higher up in the directory tree.
    root: true,

    // The following path may have to be adjusted to your directory structure.
    extends: '../../../Utilities/Lombiq.NodeJs.Extensions/Lombiq.NodeJs.Extensions/config/.eslintrc.lombiq-base.js',

    globals: {
        // sheperd.js is loaded first, so it will be (and it needs to be) always available.
        Shepherd: 'readonly',
    },
    // Add custom rules and overrides here.
    rules: {
    },
};
