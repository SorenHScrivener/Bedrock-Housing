<?php get_header();
// pageBanner(array(
//     'title' => 'Search Results',
//     'subtitle' => 'You searched for &ldquo;'. get_search_query() . '&rdquo;'
// ));
?>

<!-- Make this look nice -->

    <div class="container container--narrow page-section">
        <?php 
        if(have_posts()){
            while(have_posts()){
                the_post(); 
                get_template_part('template-parts/content', get_post_type());
               echo '<p>';
                    the_title();
               echo '</p>';
               echo '<p>';
                    the_content();
                echo '</p>';
             }
            echo paginate_links();
        }else{
            echo '<h2 class="headline headline--small-plus">No Results Found</h2>';
            echo '<script>console.log("red")</script>';
        }

        get_search_form();
        ?>
        
    </div>
<?php
    get_footer();
?>