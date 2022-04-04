<?php 
    get_header();
    //I dont't think this 'while' is needed. Also, is there a way to combine this and member page, and use conditional?
    while(have_posts()){
        the_post(); 
?>


<?php }
get_footer();  ?>