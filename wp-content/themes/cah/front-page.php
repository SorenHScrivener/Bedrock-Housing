<!--Remember Seo and accessability-->
<!-- Look up mobile and tablet overhead menus -->

<!-- Perhaps add universal img and vid reciever to all pages tha handles all, but the member and property pics when on the front page
    But when in single, I think I'll use the universal for any who wants a closer look, in regards to the news
    thumbs in all-news can be maginfied, with them moving to the left with the other media on 'read more' press-->

<!-- Use Gallery for both news, with gallery appearing on cick of cover thumb, with available filter betweeen vids and images,
    arrows to cycle, along with selectable thumbs of all, unless filtered-->

    <!-- Have 'read more', on both types of news, fetch the expanded content, 
    with media being accesible through it and clicking the main image-->
<?php 
    get_header();

        $mainLoaderText = array('1'=>"One Moment Please...", '2'=>"Perfection takes time", '3'=>"Groaning only makes this slower...", 
        '4'=>"I'm watching you... :)", '5'=>"Commencing Hack ;)", 
        '6'=>"One Moment. Retrieving your SSN", '7'=>"Shaving your cat...", '8'=>"You like Scary Movies...? >:)");
        shuffle($mainLoaderText);
?>

<!-- <div id="page-loader" class="loader loader-curtain is-active" data-curtain-text="<?php echo $mainLoaderText[0]; ?>" data-colorful=""></div> -->

<!-- Get a loading spinner in here.-->

<div id="propertiesContainer" class="contentContainer contentContainer_paginated">
    <div class="inner-container">
        <div class="titleAndTextBox">
            <div class="titleBox">
                <div>
                    <p>Beauty. Affordability.</p>
                </div>
                <div>
                    <h2>Our Properties</h2>
                </div>
            </div>
            <div class="textBox">
                <p>Not just pleasant to look at. A joy to live in and easy to afford, the properties we contruct are where people not only live, but thrive. We strive to make dreams come true for families that desperately need it.</p>
            </div>
        </div>             

        <div class="contentBox">

            <!-- <div class="custom-box"> -->
              
                <!--<div id="custom-loader_1" class="custom-loader inactive">
                    <div class="L">
                        <div id="vertical-boxes">
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                        </div>
                        <div id="horizantal-boxes">
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                        </div>
                    </div>
                    <div class="o">
                        <div class="inner">
                            <div class="letter-box corners"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box corners"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box corners"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box corners"></div>
                        </div>
                        <div class="outer">
                            <div class="letter-box corners"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box corners"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box corners"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box corners"></div>
                        </div>
                    </div>
                    <div class="a">
                        <div class="circle">
                            <div class="inner">
                                <div class="letter-box corners"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box corners"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box corners"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box corners"></div>
                            </div>
                            <div class="outer">
                                <div class="letter-box corners"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box corners"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box corners"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box corners"></div>
                            </div>
                        </div>
                        <div class="rectangle">
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                        </div>
                    </div>
                    <div class="d">
                        <div class="circle">
                            <div class="inner">
                                <div class="letter-box corners"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box corners"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box corners"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box corners"></div>
                            </div>
                            <div class="outer">
                                <div class="letter-box corners"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box corners"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box corners"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box corners"></div>
                            </div>
                        </div>
                        <div class="rectangle">
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                        </div>
                    </div>
                    <div class="i">
                        <div class="circle">
                            <div class="letter-box corners"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box corners"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box corners"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box corners"></div>
                        </div>
                        <div class="rectangle">
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                        </div>
                    </div>
                    <div class="n">
                        <div class="circle">
                            <div class="outer">
                                <div class="letter-box corners"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box corners"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box"></div>
                            </div>
                        </div>
                        <div class="rectangle">
                            <div class="letter-box"></div>
                            <div class="letter-box"></div>
                        </div>
                    </div>
                    <div class="g">
                        <div class="circle">
                            <div class="inner">
                                <div class="letter-box corners"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box corners"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box corners"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box corners"></div>
                            </div>
                            <div class="outer">
                                <div class="letter-box corners"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box corners"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box corners"></div>
                                <div class="letter-box"></div>
                                <div class="letter-box corners"></div>
                            </div>
                        </div>
                        <div class="rectangle">
                            <div class="letter-box">
                                <div class="sub-box"></div>
                                <div class="sub-box"></div>
                            </div>
                            <div class="letter-box"></div>
                            <div class="letter-box">
                                <div class="sub-box"></div>
                                <div class="sub-box"></div>
                            </div>
                            <div class="letter-box corners"></div>
                            <div class="letter-box"></div>
                            <div class="letter-box corners"></div>
                            <div class="letter-box"></div>
                        </div>
                    </div>
                    <div class="dot">
                        <div class="letter-box"></div>
                        <div class="letter-box"></div>
                        <div class="letter-box"></div>
                        <div class="letter-box"></div>
                    </div>
                    <div class="dot">
                        <div class="letter-box"></div>
                        <div class="letter-box"></div>
                        <div class="letter-box"></div>
                        <div class="letter-box"></div>
                    </div>
                    <div class="dot">
                        <div class="letter-box"></div>
                        <div class="letter-box"></div>
                        <div class="letter-box"></div>
                        <div class="letter-box"></div>
                    </div>
                </div>  
                <div id="custom-loader_2" class="custom-loader inactive">
                    <div class="buildings-container">
                        <div class="building_1 buildings">
                            <div class="window"></div>
                            <div class="window"></div>
                            <div class="window"></div>
                            <div class="window"></div>
                            <div class="window"></div>
                            <div class="window unseen"></div>

                            <div class="window"></div>
                            <div class="window unseen"></div>
                            <div class="window"></div>
                            <div class="window unseen"></div>
                            <div class="window"></div>
                            <div class="window unseen"></div>
                        </div>
                        <div class="building_2 buildings">
                            <div class="window"></div>
                            <div class="window"></div>
                            <div class="window"></div>
                            <div class="window"></div>
                            <div class="window"></div>
                            <div class="window"></div>
                            <div class="window"></div>
                            <div class="window"></div>
                            <div class="window"></div>
                            <div class="window"></div>
                            <div class="window"></div>
                            <div class="window"></div>
                        </div>
                        <div class="building_3 buildings">
                            <div class="window"></div>
                            <div class="window"></div>
                            <div class="window"></div>
                            <div class="window"></div>
                            <div class="window"></div>
                            <div class="window"></div>
                            <div class="window"></div>
                            <div class="window"></div>
                            <div class="window"></div>
                        </div>
                    </div>
                    <div class="hammer-and-nail-container">
                        <img class="hammer" src="<?php echo get_theme_file_uri('/images/hammer.png');?>" alt="">
                        <img class="nail" src="<?php echo get_theme_file_uri('/images/nail.png');?>" alt="">
                    </div>
                </div>
                <div id="custom-loader_3" class="custom-loader inactive">
                    <div class="slider-track">
                        <div class="slider-after-leftward_3 after"></div>
                        <div class="slider-after-leftward_2 after"></div>
                        <div class="slider-after-leftward_1 after"></div>

                        <div class="slider-after-rightward_3 after"></div>
                        <div class="slider-after-rightward_2 after"></div>
                        <div class="slider-after-rightward_1 after"></div>
                        <div class="slider"></div>
                    </div>
                </div>
                            ball going back and forth across a container, with 'after-images' as it moves[transparent, circles, progressively stacked, that fade along the way]-->
            <!-- Use dark/light slider as inspiration-->
            <!-- <div class="ball-slider_after-image custom-box"></div> -->
            <!-- </div> -->

            <!-- random 'bouncing' direction off the walls of the box and rgb color, with the later being a slow, smooth transition
            [prevent from being color too close to background] -->
            <!-- add another ball everytime it hits a wall, just for fun-->
            <!-- Or if bump into each other, with seemingly 'hitting' and bouncing in opposite directions [can test with 'fixed path collision']-->
            <!-- have cose that keeps track of each bew ball, as well as the first, with a limit on ball creation[20?]-->
            <!--Add in a border and a small 'css line'[flex for the window rows?] building that blinks when hit, without producting another ball-->
            <!--Add in a tracker for each ball, wherein, whenever it hits a bulding, it gains one 'death point, with 3(?) killing it-->
            <!-- Might have ability for building to be desatroyed and respawn in random location, at least a few px away from sides, or have multi, 
                with the destruction of all, yielding a 'game over' to appear-->
            <!-- Have a  number inside each ball, with death allowing threre to nbe higher numbers than the limit, but minusing from the limit tracker, 
            but not the count-->
            <!-- Can make into a sort of game by having the balls be spawned by clicking or tapping, and can even increase the buildings with each 'level'
            And I can even have your 'score'[total balls used] be tracked via local storage-->

            <!--Button to change from random to click-spawn to location?-->

            <!-- <div class="random-ball-loader custom-box">
                <div class="initial-ball balls" id="ball1"></div>
            </div> -->
            
            <!-- Simulate rudimentary comp-player pong game using random number ranges for each and keeping track of score on each side-->
            <!-- I could also make it playable by mapping up and down to 'wasd' and arrow keys for 2 players[comp only] or to verse comp with one, with touch and drag as 
                sub for phones and tablets-->
            <!-- increase comp diff by shrinking movement range-->
            <!-- Make so can do two player pong with teamviewer-->
            <!--3-5 zones that dictate a range of bounce direction on the paddles? More up or down with each suessive zone up or down, 
            with center having least angle of return? Is there any change based on angle of approach?-->

            <!-- Mat=ybe add free, 'collision noises' -->
            <!-- <div class="auto-pong custom-box"></div> -->
            
            <!-- <div class="myLoader">
                <div class="innerCircleHolder">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <div class="innerCircleHolder_second">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div> -->

            <!-- <div class="sbl-circ-ripple"></div> -->


            <!-- <div class="sbl-circ"></div>
            <div class="sbl-circ-path"></div> -->
             <!-- <div class="sbl-seven-circles"></div>
            <div class="sbl-meter"></div>
            <div class="sbl-puzzle"></div>
            <div class="sbl-pushing-shapes"></div>
            <div class="sbl-square-to-circle"></div>
            <div class="sbl-rect-spin-fill"></div>
            <div class="sbl-dot-slide"></div>
            <div class="sbl-cirle-balance"></div>
            <div class="sbl-cirle-to-rhombus"></div>

            <div class="sbl-cirle-and-square "></div>
            <div class="sbl-half-circle-spin"></div>
            <div class="sbl-sticks-spin"></div> -->
             <!--Add option to look through gallery of photos on hover photo, alongside a link 
            [apply to all imgs with conditional giving gall to props]-->

            <noscript>
                <?php
                    $properties = new WP_Query(array(
                        'posts_per_page' => 1,
                        'post_type' => 'property',
                        'order' => 'ASC'
                    ));
                        while($properties->have_posts()){
                            $properties->the_post();?>              
                        <div class="displaySquares">
                            <?php $projected = get_field('projected_info'); ?>

                            <?php $propImage = $projected['final_product']['sizes']['imagePortrait'];?>
                            <img class="displayImages" src="<?php echo $propImage; ?>" alt="<?php the_title(); ?>">
                            <div class="displaySquares-pageLinks">
                                <a href="<?php the_permalink(); ?>">-link-</a>
                                <a>Associated News?</a>
                                <button>Magnify Image</button>
                            </div>
                            <div>
                                <p><?php the_title(); ?></p>
                                <a>Put in a location name and link?</a>
                            </div>
                        </div>  
                    <?php }
                    ?>
            </noscript>
        </div>
    </div>    
</div>

<div id="allNewsContainer" class=contentContainer>
    <!--make all images and vids clickable with box view bigger?-->
    <div class="inner-container">
        <div class="titleAndTextBox">
            <div class="titleBox">
                <div>
                    <p>Every Moment. Every Step of the Way.</p>
                </div>
                <div>
                    <h2>Latest News <a href="<?php echo esc_url(site_url('/all-news')); ?>">(View All)</a></h2>
                </div>
            </div>
            <div class="textBox">
                <p>Be it triumph or failure&mdash; even simple moments or big developments&mdash; we'll keep you 'in-the-know'. We promise transparancy and intgregity, in equal delivery.</p>
            </div>
        </div>

        <div class="contentBox">
      
            <div id="genNews" class="section">
                <h3>Latest General News</h3>
                <div>
                    <?php
                    $today = date('Ymd');
                    $homepageEvents = new WP_Query(array(
                    'posts_per_page' => 4, 
                    'post_type' => 'news',
                    'orderby' => 'date',
                    'order' => 'DESC'
                    ));
                    //relationships link to news about them
                    while($homepageEvents->have_posts()){
                    $homepageEvents->the_post(); 
                    get_template_part('template-parts/content', 'updates');
                    } 
                    wp_reset_postdata();
                    ?>
                </div>
            </div>        
            
        <div id="propNews" class="non-primary section">
            <h3>Latest Property News</h3>   
                <div>
                    <?php
                    $today = date('Ymd');
                    $homepageEvents = new WP_Query(array(
                    'posts_per_page' => 4, 
                    'post_type' => 'update',
                    'orderby' => 'date',
                    'order' => 'DESC'
                    ));

                    while($homepageEvents->have_posts()){
                    $homepageEvents->the_post(); 
                    get_template_part('template-parts/content', 'updates');
                    } 
                    wp_reset_postdata();
                    ?>
                </div>
        </div>
        </div>
        <div id="news-type-tabs" class="section-tabs">
            <div>
                <button id="genNews-tab" class="activated">General</button>
                <p><span class="required">*</span>diamond?</p>
                <button id="propNews-tab">Properties</button>
            </div>
        </div>
    </div>
</div>

<div id="membersContainer" class="contentContainer contentContainer_paginated">
    <div class="inner-container">
        <div class="titleAndTextBox">
            <div class="titleBox">
                <div>
                    <p>Trustworthy. Tireless. Professional.</p>
                </div>
                <div>
                    <h2>Our Team</h2>
                </div>
            </div>
            <div class="textBox">
                <p>Meet our team; the foundation of our efforts. Every single one of them is integral in ensuring our properties are perfect. Their dedication is only matched by their pride in knowing that what they do helps so many families. More than just hardworking, they're <b>Bedrock</b>.</p>
            </div>
        </div>             
        <div class="contentBox">
            <!-- <div class="dot-pulse"></div> -->
            <!-- <div class="loader loader-bar-ping-pong content-loader" data-rounded="" data-blink="" data-text="Right away...">
                <div class="ball"></div>
            </div> -->
                <noscript>
                    <?php
                        $members = new WP_Query(array(
                            'posts_per_page' => -1,
                            'post_type' => 'member',
                            'order' => 'ASC'
                        ));
                            while($members->have_posts()){
                                $members->the_post();?>              
                            <div class="displaySquares">
                                <?php $profImage = get_field('profile_image')['sizes']['imagePortrait'];?>

                                <img class="displayImages" src="<?php echo $profImage; ?>" alt="<?php the_title(); ?>">
                                <div class="displaySquares-pageLinks">
                                    <a href="<?php the_permalink(); ?>">-link-</a>
                                    <button href="<?php the_permalink(); ?>">-link-</button>
                                </div>
                                <div>
                                    <p><?php the_title(); ?></p>
                                    <p><?php the_field('position_or_role'); ?></p>
                                    <?php wp_reset_postdata(); ?>
                                </div>
                                
                            </div>  
                            
                        <?php }
                    ?>
                </noscript>
        </div>
    </div>    
</div>

<div id="contactContainer" class=contentContainer>
    <!-- <div class="container-overlay"></div> -->
    <div class="inner-container">
        <div class="titleAndTextBox">
            <div class="titleBox">
                <div>
                    <p>Thank you for your time.</p>
                </div>
                <div>
                    <h2>Have Any Questions?</h2>
                </div>
            </div>
            <div class="textBox">
                <p>We hope our site has been informative. We'll be glad to answer any further questions you may have. Depending on how busy we are, it may take 3 to 4 business days, so please be patient.</p>
            </div>
        </div>

        

        <div class="contentBox" id="test">
            <div id="generalInquiry">
                <!-- Add captcha after put on hosting, as need that to use-->
                <h3>Anything we can help with?</h3>
      
                <form action="<?php echo esc_url(home_url()); ?>/contact" id="generalInquiryForm" class="form" method="POST" autocomplete="off">
                     
                    <div id="contact-name">
                        <label for="contactName">Name (<span class="required">*</span>required)</label>
                        <input class="form-field" type="text" name="contactName" id="contactName" maxlength="36">
                    </div>
                    <div id="contact-email">             
                        <label for="email">Email (<span class="required">*</span>required)</label>
                        <input class="form-field" type="text" name="email" id="email">
                    </div>
                    <div id="contact-phone">
                        <label for="phoneNumber">Phone Number (optional)</label>
						<input class="form-field" title="Invalid Phone Number. Either correct or erase it." name="phoneNumber" id="phoneNumber" type="Tel">  
                    </div>
                    <div id="contact-subject">
                        <label for="subject">Subject (<span class="required">*</span>required)</label>
                        <select name="subject" id="subject" title="Please select something!">
                            <option value="">-select one-</option>
                            <option value="Job Inquiry">Job Inquiry</option>
                            <option value="Further Information">Further Information</option> 
                        </select>
                    </div>
                    <div id="contact-message">
                        <label for="message">Your Inquiry (limit 1000 chars)</label>
                        <textarea class="form-field" name="message" id="message" rows="20" cols="30" class="required requiredField" maxlength="1000"></textarea>
                    </div>
                    
                    <button type="submit" name="email_submit">Submit Request</button>

                </form>
            </div>
            <!-- <img src="<?php echo get_theme_file_uri('/images/contact.jpg');?>" alt=""> -->
        </div>
        <!-- <div id="contact-info">
            Or:
            <ul>
                <li>Call us at: [insert number here]</li>
                <li>Email us at: [insert email here]</li>
            </ul>
        </div> -->

    </div>
</div>
<div id="pop-up-display-box" class="hidden">
    <!-- Maybe drop image between next and previous and have them offset off of it, rathe than the borders of the parent, 
    as to have even distance -->
    <!-- <div id="content-holder"> -->

        <div id="image-holder"></div>
<!-- 
    </div> -->
    <button id="prev-image" class="pop-up-directional">previous</button>
    <button id="next-image" class="pop-up-directional">next</button>
    <button id="closeMagnify">x</button>
</div>

<!-- Get bogger images,  it looks like sizes that exceed the image's dimensions cannot be created cannot be created-->
<!-- <div id="news-media-display">

    <button id="news-media-close">Close</button>
</div> -->

<div id="mobile-typing-container">
    <div>
        <div class="form-field-container_front" id="front-form-contactName-container">
            <label for="front-form-contactName">Name</label>
            <input class="form-field_front" id="front-form-contactName" type="text" placeholder="your name..." autocomplete="off">
        </div>

        <div class="form-field-container_front" id="front-form-email-container">
            <label for="front-form-email">Email</label>
            <input class="form-field_front" id="front-form-email" type="email" placeholder="your email..." autocomplete="off">
        </div>

        <div class="form-field-container_front" id="front-form-phoneNumber-container">
            <label for="front-form-phoneNumber">Phone Number(optional)</label>
            <input class="form-field_front" id="front-form-phoneNumber" type="tel" placeholder="your phone number..." autocomplete="off">
        </div>

        <div class="form-field-container_front" id="front-form-message-container">
            <label for="front-form-message">Message</label>
            <textarea class="form-field_front" id="front-form-message" maxlength="1000" placeholder="your message..." autocomplete="off"></textarea>
        </div>

        <button id="close-front-form">Close</button>
    </div>
</div>
<?php 
// }
    get_footer();
?>