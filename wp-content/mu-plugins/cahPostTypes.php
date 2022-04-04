<?php
    function cahPostTypes(){
           register_post_type("member", array(
            'show_in_rest' => true,
            'supports' => array('title'),
            'rewrite' => array(
                'slug' => 'members'
            ),         
            'has_archive' => true,
            'public' => true,
            'labels' => array(
                'name' => 'Members',
                'add_new_item' => 'Add New Member' ,
                'edit_item' => 'Edit Member',
                'all_items' => 'All Members',
                'singular_name' => 'Member'
            ),
            'menu_icon' => 'dashicons-buddicons-buddypress-logo'
        ));

        register_post_type("property", array(
            'show_in_rest' => true,
            'supports' => array('title'),
            'rewrite' => array(
                'slug' => 'properties'
            ),         
            'has_archive' => true,
            'public' => true,
            'labels' => array(
                'name' => 'Properties',
                'add_new_item' => 'Add New Property' ,
                'edit_item' => 'Edit Property',
                'all_items' => 'All Properties',
                'singular_name' => 'Property'
            ),
            'menu_icon' => 'dashicons-admin-multisite'
        ));

        register_post_type("update", array(
            'show_in_rest' => true,
            'supports' => array('title'),
            'rewrite' => array(
                'slug' => 'updates'
            ),         
            'has_archive' => true,
            'public' => true,
            'labels' => array(
                'name' => 'Updates',
                'add_new_item' => 'Add New Update' ,
                'edit_item' => 'Edit Update',
                'all_items' => 'All Updates',
                'singular_name' => 'Property Update'
            ),
            'menu_icon' => 'dashicons-hammer'
        ));

        register_post_type("news", array(
            'show_in_rest' => true,
            'supports' => array('title'),
            'rewrite' => array(
                'slug' => 'news'
            ),         
            'has_archive' => true,
            'public' => true,
            'labels' => array(
                'name' => 'News',
                'add_new_item' => 'Add New Update' ,
                'edit_item' => 'Edit Update',
                'all_items' => 'All Updates',
                'singular_name' => 'News Update'
            ),
            'menu_icon' => 'dashicons-calendar-alt'
        ));

    }

    add_action('init', 'cahPostTypes');
?>