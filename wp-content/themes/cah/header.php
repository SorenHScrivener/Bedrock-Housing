<!DOCTYPE html>
<html <?php language_attributes();?>>
    <head>

        <meta charset="<?php bloginfo('charset');?>">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://code.jquery.com/jquery-3.6.0.slim.min.js" integrity="sha256-u7e5khyithlIdTpu22PHhENmPcRdFiHRjhAuHcs05RI=" crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.0/jquery.validate.min.js"></script>
        <script src="http://jqueryvalidation.org/files/dist/additional-methods.min.js"></script>
        <?php wp_head();?>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"></link>
        <!-- organize after finalize fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Brawler:wght@400;700&family=Cormorant+SC:wght@300;400;500;600;700&family=Gilda+Display&family=Libre+Caslon+Display&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,500;1,400;1,500&display=swap;family=Roboto:wght@300;400&display=swap" rel="stylesheet"> 
        
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Abel&display=swap" rel="stylesheet"> 

        <style id="random-animations"></style>
    </head>
    <body>

<div id="overallContainer"> 
    <div id="openingContainer">
        <header>
    
            <!--conditional that when not on homepage, link to archives and front? Replace with 'return to home?-->
            <!--Background on scroll to accomadate color shifts. Also change when view other pages-->
            <div id="logos-container">
               
                <div id="logo-symbol"><img src="<?php echo get_theme_file_uri('/images/logo_symbol_v1.png');?>" alt="company logo-symbol"></div>
              
                <div id="logo-text"><img src="<?php echo get_theme_file_uri('/images/Logo_cracked2.png');?>" alt="company logo-type"></div>
            </div>
            <!-- Also do alt function for mobile search button -->
            <!-- /images/Logo_cracked2_mobile.png -->
            <div id="additional-buttons">
                <!-- Additional with also hold cross site nav on mobile, allowing me to get rid of the back arrow on all devices-->
                <button id="more-options"><i class="fas fa-plus"></i></button>
                <button id="media-close-alt" class="media-close">Close</button>  
            </div>

            <nav>
                <ul>       
                <!--Have focus in contact container after press a tag. And jump onto news scroll when press its a tag-->    
                <?php if(!is_front_page()){ ?>
                    <li id="return-home">
                        <?php 
                            $currentPost = get_post_type(); 
                            $post_type_obj = get_post_type_object( $currentPost );

                            if($currentPost !== 'page'){
                                $scrollTo = strtolower($post_type_obj->labels->name) . 'Container';
                            }else{
                                $x = explode("-", strtolower(get_the_title()));
                                $scrollTo = $x[0] . ucfirst($x[1]) . 'Container';
                            }

                        ?>
                        <!--Have return also go back with set-up intact when called to page from all-news page-->
                        <!--Also get rid of background and border -->
                        <a href="<?php echo esc_url(home_url()); ?>/#<?php echo $scrollTo ?>"><i class="fas fa-arrow-left"></i></a>
                    </li>
                <?php }else{ ?>
                    <!-- use custom symbols for open and closed -->
                    <li id="mobile-nav-caller">
                        <button>
                            <i class="fas fa-bars"></i>
                        </button>
                    </li> 
                    <li>
                        <a href="#openingContainer">
                            Home
                        </a>
                    </li>
                    <li>
                        <a href="#propertiesContainer">
                            Properties
                        </a>
                    </li>
                    <li>
                        <a href="#allNewsContainer">
                            Latest Updates
                        </a>
                    </li>
                    <li>
                        <a href="#membersContainer">
                            Meet The Team
                        </a>
                    </li>
                    <li>
                        <a href="#contactContainer">
                            Contact Us
                        </a>
                    </li>
                <?php } ?>
                </ul>
            </nav>
        </header>
        <!-- Vary the text with an array of a few diff phrases at random ['One Moment Please...', 'Perfection takes time', 'Groaning only makes this slower...', 'I'm watch you... :)', 'Commencing Hack ;)']-->

        <?php pageBanner(); ?>
