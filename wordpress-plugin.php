<?php
/*
Plugin Name: Diputados Chat Widget
*/

function add_chat_widget() {
    wp_enqueue_script('diputados-chat', 'https://tu-dominio.com/widget/widget.js', [], '1.0.0', true);
    echo '<div id="diputados-chat-widget"></div>';
    echo '<script>
        document.addEventListener("DOMContentLoaded", function() {
            DiputadosChat.init("diputados-chat-widget", {
                apiUrl: "https://tu-dominio.com/api"
            });
        });
    </script>';
}
add_action('wp_footer', 'add_chat_widget'); 