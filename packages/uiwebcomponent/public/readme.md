### This needs:  

./static  
&nbsp;&nbsp;&nbsp;./assets   
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ./fonts   
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;    all the Kiosk fonts in their respective directories

fontawesome has to be included with all the scss sources, not just the font files.   
To achieve that you will have to set the $font-path variable for fontawesome in the file `_variables.scss`:

    $fa-font-path           : "static/assets/fonts/fontawesome-free-6.4.0-web/webfonts" !default;


Also make sure that you add this to font awesome:   

    @font-face {
        font-family: 'Font Awesome 5 Free';
        font-style: normal;
        font-weight: 400;
        font-display: $fa-font-display;
        src: url('#{$fa-font-path}/fa-regular-400.woff2') format('woff2'),
        url('#{$fa-font-path}/fa-regular-400.ttf') format('truetype');
    }

The point here is that there is a `Font Awesome 5 Free` font as that is what some css styles refer to.   
<br/>

You also have to run sass to turn all the sass files in public into css files.
Add a File Watcher in WebStorm only on the public folder.