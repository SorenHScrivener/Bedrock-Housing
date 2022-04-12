<?php

//Remember to implement property map location using alts to google maps

// Put in single-page logic, validation, etc. through this to clean up this file through seperation

require get_theme_file_path('/inc/search-route.php');
require get_theme_file_path('/inc/front-pagination-route.php');
require get_theme_file_path('/inc/all-news-route.php');
require get_theme_file_path('/inc/media-route.php');

function cah_custom_rest(){
    register_rest_field('post', 'authorName', array(
        'get_callback' => function(){return get_the_author();}
    ));
};

add_action('rest_api_init', 'cah_custom_rest');

function pageBanner($args = NULL){
    $business = get_field('other_business');

    $projected = get_field('projected_info');
    $dateRange = $projected['completion_date_range'];
    $projectedComposition = $projected['unit_type_composition'];

    $finished = get_field('finished_info');
    $finishedComposition = $finished['unit_type_composition'];

    $floorPlans = get_field('floor_plans', $post->ID);
    $buildingPlans = get_field('building_plans', $post->ID);
    $interiorImages = get_field('interior_images', $post->ID);
    $generalMedia = get_field('gallery', $post->ID);

    $mediaTypes = array('floorPlans', 'buildingPlans', 'interiorImages', 'generalMedia');

    // for use later, in the light box
    $alteredVideoUrl = str_replace('watch?v=', 'embed/', $videoUrl);
    $alteredVideoUrl .= "?autoplay=1";

    $post = get_queried_object();
    $postType = get_post_type_object(get_post_type($post));
    
    if(!$args['title']){
        $args['title'] = get_the_title();
    }

    if (!$args['photo']) {
        if (get_field('page_banner_background_image') AND !is_archive() AND !is_home() ) {
          $args['photo'] = get_field('page_banner_background_image')['sizes']['pageBanner'];
        } else {
          $args['photo'] = get_theme_file_uri('/images/wip.jpg');
        }
    }


    if (get_field('profile_image') AND !is_archive() AND !is_home() ) {
        $args['mainImg'] = get_field('profile_image')['sizes']['imagePortrait'];
        $args['mainImgLarge'] = get_field('profile_image')['sizes']['imagePortraitLarge'];
    }else{
        //add logic for when completed
        if(!get_field('is_the_building_completed')){
            $args['mainImg'] = $projected['final_product']['sizes']['imagePortrait'];
            $args['mainImgLarge'] = $projected['final_product']['sizes']['imagePortraitLarge'];
        }else{
            $args['mainImg'] = $finished['final_product']['sizes']['imagePortrait'];
            $args['mainImgLarge'] = $finished['final_product']['sizes']['imagePortraitLarge'];
        }
    }
    
    if( is_single()){ ?>
    <!--Consider seperating this logic into diff files and reffing them here-->
    <!--Add in 'alts'-->
        <div id="pageImage">
            <img src="<?php echo $args['photo']; ?>" alt="">
        </div>
        <div id="singleContainer">
            
            <div id="updates-col">
                <h3>Most Recent News(<a class="related-link" href="<?php echo get_home_url(); ?>/all-news/#<?php echo get_the_ID();?>-related-<?php echo strtolower($postType->labels->name); ?>"">See All Related News</a>)</h3>
                <div id="news-reciever"></div>
                <div id="pagination-holder"></div>
            </div>

            <?php
        // <!-- either not valid, don't show this or spit out paragraph into it  -->


            ?>
            <div id="mainImageAndStats">
                <!-- <div class="media-card"> -->
                    <img data-post="none" data-id="<?php echo get_the_ID(); ?>" data-full="<?php echo $args['mainImgLarge']; ?>" src="<?php echo $args['mainImg']; ?>" alt="">
                <!-- </div> -->

                <ul>
                <?php

                if(get_post_type() === 'member'){?>
                    <li>Name: <?php the_title(); ?></li>
                    <li>Position: <?php the_field('position_or_role'); ?></li>
                    <li>Education: <?php the_field('degrees'); ?></li>
                    <?php

                    //   $fullAddress = get_field('external_websites');
                    //   $firstCut = substr($fullAddress, 0, strpos($fullAddress, '.com'));
                    //   $finalCut = substr($firstCut, strpos($firstCut, '//')+2);
                    ?> 
                    <!--get pro acf to use 'repeater' for do mult businesses without fixed dup-->
                    <?php if($business['business_name']){ ?>                    
                        <li>Other Business: <?php echo $business['business_name'] ?>
                        <?php if($business['business_web_address']){ ?>   
                            <a target="_blank" href="<?php echo $business['business_web_address'] ?>">(Visit)</a>
                        <?php } ?>
                    </li>
                    <?php } ?>    
                    <li>Motto: <?php the_field('motto'); ?></li>
                <?php }else{ ?>
                        <li><?php the_title(); ?></li>
                  
                    <?php if(!get_field('is_the_building_completed')){?>
                        <li>Set to be completed between: <?php echo $dateRange['range_start'] . ' - ' . $dateRange['range_end']?></li>
                        <li>Projected Minimum Occupancy(<?php echo $projectedComposition['studio_amount'] + $projectedComposition['1br_amount'] + 
                                $projectedComposition['2br_amount']*2 + $projectedComposition['3br_amount']*3?>)
                            <ul>
                                <li>Studios: <?php echo $projectedComposition['studio_amount'] ?></li>
                                <li>1BR: <?php echo $projectedComposition['1br_amount'] ?></li>
                                <li>2BR: <?php echo $projectedComposition['2br_amount'] ?></li>
                                <li>3BR: <?php echo $projectedComposition['3br_amount'] ?></li>
                            </ul>
                        </li>   
                    <?php } else{?>
                        <li><?php echo $finished['date_of_completion']; ?></li>
                        <li>Projected Minimum Occupancy(Total: <?php echo $finishedComposition['studio_amount'] + $finishedComposition['1br_amount'] + 
                                $finishedComposition['2br_amount']*2 + $finishedComposition['3br_amount']*3?>)
                            <ul>
                                <li>Studios: <?php echo $finishedComposition['studio_amount'] ?></li>
                                <li>1BR: <?php echo $finishedComposition['1br_amount'] ?></li>
                                <li>2BR: <?php echo $finishedComposition['2br_amount'] ?></li>
                                <li>3BR: <?php echo $finishedComposition['3br_amount'] ?></li>
                            </ul>
                        </li> 
                    <?php } ?>
                <?php }
                ?>
            </ul>
            </div>
            
            <div id="singleInfo">
                <div class="media-card">
                    <button data-id="<?php echo get_the_id(); ?>" data-post="<?php echo strtolower($postType->labels->name); ?>" data-full="<?php echo $imgInputLarge; ?>">View Gallery</button>
                </div>
 
                <div class="prop-info">

            <?php if(get_field('bio') || get_field('property_description')){
                                
            
                    if(get_post_type() === 'member'){
     
                        ?>

                        <p><?php the_field('bio'); ?></p>
                    <?php }elseif(get_post_type() === 'property'){ ?>
                        <p><?php the_field('property_description'); ?></p>
                    <?php } 
                    }else{
                        echo "<p>Coming soon...</p>";
                    }?>
                </div>
            </div>
            <!--If prop or gen news that has this as a relation-->
                <!-- news will take a new div, expanding the box via it's flex display -->
                <!-- Use ajax pagination -->
                <!-- Maybe do one update per paginated 'page' -->
                <!--Make sure that presented, starting with most recent, 
                and excluding past ones, which I will test by putting an old one in, 
                both here and on thec front-->
                
                <?php

                //Can I combine these in array to ensure only one thing at a time, if has update and news?
                $relatedPropertyNews = new WP_Query(array(
                'posts_per_page' => 1, 
                'post_type' => 'update',
                'orderby' => 'date',
                'order' => 'DESC',
                'meta_query' => array(
                    array(
                    'key' => 'related_properties',
                    'compare' => 'LIKE',
                    'value' => '"' . get_the_id() . '"'
                    )
                )
                ));

                $relatedGeneralNews = new WP_Query(array(
                    'posts_per_page' => 1, 
                    'post_type' => 'news',
                    // 'orderby' => 'title',
                    'order' => 'ASC',
                    'meta_query' => array(
                        array(
                        'key' => 'related_members',
                        'compare' => 'LIKE',
                        'value' => '"' . get_the_id() . '"'
                        )
                    )
                    ));
                //Need to figure how to do ajax if both are present, such as is poss in members
                //Use all-news's route
                // grab first 3-5, paginating each single post

                if($relatedPropertyNews->have_posts() || $relatedGeneralNews->have_posts()){
                    echo '<div id="updates">';

                    while($relatedPropertyNews->have_posts()){
                    $relatedPropertyNews->the_post(); 
                    get_template_part('template-parts/content', 'updates');
                    } 
                    while($relatedGeneralNews->have_posts()){
                        $relatedGeneralNews->the_post(); 
                        get_template_part('template-parts/content', 'updates');
                    } 
                    wp_reset_postdata();
                    echo '</div>';
                };?>
        </div>
    <?php }else{ ?>
            <div id="pageImage">
                <img src="<?php echo get_theme_file_uri('/images/opening.jpg');?>" alt="">
            </div>
            <?php if(is_front_page()){ ?>
            <div id="welcomeContainer">
                <div>        
                    <h1>Welcome To <?php bloginfo('name')?></h1>
                    <p><?php bloginfo('description')?></p>
                </div>
            </div>
            <?php } ?>
        </div>
    <?php } ?>
<?php }
function cahFiles() {
    wp_enqueue_script('main-js-css', get_theme_file_uri('/dist/main.js'), array('jquery'), '1.0', true);
    wp_enqueue_style('exteriorStyles1', get_theme_file_uri('/css/downloads/css-loader.css'));
    // wp_register_style('Font_Awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
    // wp_enqueue_style('Font_Awesome');
    wp_localize_script('main-js-css', 'siteData', array(
      'root_url' =>  get_site_url()
    ));
}


add_action('wp_enqueue_scripts', 'cahFiles');

function wpb_change_title_text( $title ){
    $screen = get_current_screen();
 
    if  ( 'member' == $screen->post_type ) {
         $title = 'Enter Full Name';
    }

    if  ( 'property' == $screen->post_type ) {
        $title = 'Enter Property Name';
   }
 
    return $title;
}
 
add_filter( 'enter_title_here', 'wpb_change_title_text' );

function cahFeatures(){
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_image_size('newsThumb', 150, 100, true);
    add_image_size('newsFull', 600, 400, true);
    add_image_size('newsFullLarge', 900, 600, true);
    add_image_size('imagePortraitThumb', 160, 200, true);
    add_image_size('imagePortrait', 320, 400, true);
    add_image_size('imagePortraitLarge', 600, 750, true);
    add_image_size('pageBanner', 2500, 1600 , true);
}

add_action('after_setup_theme', 'cahFeatures');

add_filter('manage_availability_posts_columns', 'availability_table_head');
function availability_table_head( $defaults ) {
    $defaults['availability_type']  = 'availability type';
    $defaults['days']  = 'days';
    $defaults['time_range']  = 'Time Range';
    return $defaults;
}

add_action( 'manage_availability_posts_custom_column', 'availability_table_content', 10, 2 );

function availability_table_content( $column_name, $post_id ) {
    if ($column_name === 'availability_type') {
        echo get_post_meta( $post_id, 'availability_type', true );
    }

    if ($column_name === 'days') {
        echo get_post_meta( $post_id, 'days', true );
    }
    if ($column_name === 'time_range') { 
        $timeStart = get_post_meta( $post_id, 'time_start', true); 
        $timeEnd = get_post_meta(  $post_id, 'time_end', true );
        echo $timeStart . '-' . $timeEnd;
    }
}

// $projectedComposition = $projected['unit_type_composition'];

add_filter('manage_edit-availability_sortable_columns', 'availability_table_sorting');
function availability_table_sorting( $columns ) {
    $columns['availability_type']  = 'availability_type';
    $columns['days']  = 'days';
    $columns['time_range']  = 'time_range';
    return $columns;
} 

add_filter( 'request', 'availability_type_column_orderby' );
function availability_type_column_orderby( $vars ) {
    if ( isset( $vars['orderby'] ) && 'availability_type' === $vars['orderby'] ) {
        $vars = array_merge( $vars, array(
            'meta_key' => 'availability_type',
            'orderby' => 'meta_value'
        ) );
    }

    return $vars;
}
add_filter( 'request', 'days_column_orderby' );
function days_column_orderby( $vars ) {
    if ( isset( $vars['orderby'] ) && 'days' === $vars['orderby'] ) {
        $vars = array_merge( $vars, array(
            'meta_key' => 'days',
            'orderby' => 'meta_value'
        ) );
    }

    return $vars;
}

add_filter( 'request', 'meeting_range_column_orderby' );
function meeting_range_column_orderby( $vars ) {
    if ( isset( $vars['orderby'] ) && 'time_range' === $vars['orderby'] ) {
        $vars = array_merge( $vars, array(
            'meta_key' => 'time_start',
            'orderby' => 'meta_value'
        ) );
    }

    return $vars;
}

add_action('after_setup_theme', 'cahFeatures');

add_filter('manage_member_posts_columns', 'member_table_head');
function member_table_head( $defaults ) {
    $defaults['member_name']  = 'member name';
    $defaults['member_title']    = 'member title';
    return $defaults;
}

add_action( 'manage_member_posts_custom_column', 'member_table_content', 10, 2 );

function member_table_content( $column_name, $post_id ) {
    if ($column_name === 'member_name') {
        $firstName = get_post_meta( $post_id, 'first_name', true); 
        $lastName = get_post_meta( $post_id, 'last_name', true );
        echo $firstName . ' ' . $lastName;
    }

    if ($column_name === 'member_title') {
        echo get_post_meta( $post_id, 'position_or_role', true );
    }

}

add_filter('manage_edit-member_sortable_columns', 'member_table_sorting');
function member_table_sorting( $columns ) {
    $columns['member_name']  = 'member_name';
    $columns['member_title']    = 'member_title';
    return $columns;
}

add_filter( 'request', 'member_name_column_orderby' );
function member_name_column_orderby( $vars ) {
    if ( isset( $vars['orderby'] ) && 'member_name' === $vars['orderby'] ) {
        $vars = array_merge( $vars, array(
            'meta_key' => 'last_name',
            'orderby' => 'meta_value'
        ) );
    }

    return $vars;
}

add_filter( 'request', 'member_title_column_orderby' );
function member_title_column_orderby( $vars ) {
    if ( isset( $vars['orderby'] ) && 'member_title' === $vars['orderby'] ) {
        $vars = array_merge( $vars, array(
            'meta_key' => 'position_or_role',
            'orderby' => 'meta_value'
        ) );
    }

    return $vars;
}

add_filter('manage_property_posts_columns', 'property_table_head');
function property_table_head( $defaults ) {
    $defaults['property_name']  = 'property name';
    $defaults['is_completed']    = 'is completed?';
    return $defaults;
}

add_action( 'manage_property_posts_custom_column', 'property_table_content', 10, 2 );

function property_table_content( $column_name, $post_id ) {
    if ($column_name === 'is_completed') {
        $status = get_field('is_the_building_completed', $post_id); 
        $statusOutput = $status ? 'yes' : 'no';
        echo $statusOutput;
    }

    if ($column_name === 'property_name') {
        echo get_field('property_name', $post_id);
    }
}

add_filter('manage_edit-property_sortable_columns', 'property_table_sorting');
function property_table_sorting( $columns ) {
    $columns['property_name']  = 'property_name';
    $columns['is_completed']    = 'is_completed';
    return $columns;
}

add_filter( 'request', 'property_name_column_orderby' );
function property_name_column_orderby( $vars ) {
    if ( isset( $vars['orderby'] ) && 'property_name' === $vars['orderby'] ) {
        $vars = array_merge( $vars, array(
            'meta_key' => 'property_name',
            'orderby' => 'meta_value'
        ) );
    }

    return $vars;
}

add_filter( 'request', 'is_completed_column_orderby' );
function is_completed_column_orderby( $vars ) {
    if ( isset( $vars['orderby'] ) && 'is_completed' === $vars['orderby'] ) {
        $vars = array_merge( $vars, array(
            'meta_key' => 'is_the_building_completed',
            'orderby' => 'meta_value'
        ) );
    }

    return $vars;
}

function my_extra_gallery_fields( $args, $attachment_id, $field ){
    $args['imageUrl'] = array(
        'type' => 'text', 
        'label' => 'Image Url', 
        'name' => 'image_url', 
        'value' => get_field($field . '_image_url', $attachment_id)
    );
    $args['videoUrl'] = array(
        'type' => 'text', 
        'label' => 'Video Url', 
        'name' => 'video_url', 
        'value' => get_field($field . '_video_url', $attachment_id)
    );
    $args['desc'] = array(
        'type' => 'textarea', 
        'label' => 'Video Description', 
        'name' => 'desc',
        'value' => get_field($field . '_desc', $attachment_id)
    );
    return $args;
}
add_filter( 'acf_photo_gallery_image_fields', 'my_extra_gallery_fields', 10, 3 );

add_action('admin_head', 'my_custom_fonts');

if(isset($_POST['submitted'])) {


	if(trim($_POST['contactName']) === '') {
		$nameError = 'Please enter your name.';
		$hasError = true;
	} else {
		$name = trim($_POST['contactName']);
	}

	if(trim($_POST['email']) === '')  {
		$emailError = 'Please enter your email address.';
		$hasError = true;
	} else if (!preg_match("/^[[:alnum:]][a-z0-9_.-]*@[a-z0-9.-]+\.[a-z]{2,4}$/i", trim($_POST['email']))) {
		$emailError = 'You entered an invalid email address.';
		$hasError = true;
	} else {
		$email = trim($_POST['email']);
	}

    if(trim($_POST['phoneNumber']) === '') {
		$phoneNumber = 'N/A';
	}else if( is_numeric(trim($_POST['phoneNumber'])) === false) {
		$phoneNumberError = 'Invalid Phone Number. Erase if by mistake...';
		$hasError = true;
	} 
    else {
		$phoneNumber = trim($_POST['phoneNumber']);
	}

    if(trim($_POST['subject']) === '') {
		$subjectError = 'Please select a subject.';
		$hasError = true;
	} else {
		$subject = trim($_POST['subject']);
	}

	if(trim($_POST['message']) === '') {
		$commentError = 'Please enter a message.';
		$hasError = true;
	} else {
		if(function_exists('stripslashes')) {
			$message = stripslashes(trim($_POST['message']));
		} else {
			$message = trim($_POST['message']);
		}
	}

	if(!isset($hasError)) {
        echo "<script>console.log('was sent!')</script>";

		$emailTo = get_option('tz_email');
		if (!isset($emailTo) || ($emailTo == '') ){
			$emailTo = get_option('admin_email');
		}
		// $subject = '[PHP Snippets] From '.$name;
        $subject = $subject;
		$body = "Name: $name \n\nEmail: $email \n\nPhone Number: $phoneNumber \n\nMessage: $message";
		$headers = 'From: '.$name.' <'.$emailTo.'>' . "\r\n" . 'Reply-To: ' . $email;

		wp_mail($emailTo, $subject, $body, $headers);
		$emailSent = true;
	}else{
        echo "<script>console.log('was not sent!')</script>";
    }

}

function my_custom_fonts() {
  echo '<style>
  body{
    font-family: "Lucida Grande";
    font-size: 14px;
    background: rgb(166, 166, 166);
  } 
    .largeField input{
       font-size 16px;
    }
    #poststuff h2{
        font-size: 1.5rem;
    }

  </style>';
}