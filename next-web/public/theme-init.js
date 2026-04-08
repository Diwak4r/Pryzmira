(function () {
    try {
        var theme = localStorage.getItem('theme');
        var root = document.documentElement;
        if (theme === 'light') {
            root.classList.remove('dark');
            root.classList.add('light');
            return;
        }

        root.classList.remove('light');
        root.classList.add('dark');
    } catch {
        // Ignore storage/runtime failures; default class from HTML stays in effect.
    }
})();
