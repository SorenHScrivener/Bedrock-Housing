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

<div id="page-loader" class="loader loader-curtain is-active" data-curtain-text="<?php echo $mainLoaderText[0]; ?>" data-colorful=""></div>

<!-- Get a loading spinner in here.-->

<div id="propertiesContainer" class="contentContainer contentContainer_paginated">
    <div>
        <div class="titleAndTextBox">
            <div class="titleBox">
                <div>
                    <p>Beauty. Affordabiity.</p>
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
           <!--  <div class="myLoader">
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
            <!-- <div class="sbl-circ"></div>
            <div class="sbl-circ-path"></div> -->
           <div class="sbl-circ-ripple"></div>
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
    <div>
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
      
            <div id="genNews" >
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
            
        <div id="propNews">
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
    </div>
</div>

<div id="membersContainer" class="contentContainer contentContainer_paginated">
    <div>
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
            <div class="loader loader-bar-ping-pong content-loader" data-rounded="" data-blink="" data-text="Right away...">
                <div class="ball"></div>
            </div>
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
    <div>
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
                <p>We hope our site has been informative. We'll be glad to answer any further questions you may have. Depending on how busy we are, it may take one to two business days, so please be patient.</p>
            </div>
        </div>

        

        <div class="contentBox">
            <div id="generalInquiry">
                <!-- Add captcha after put on hosting, as need that to use-->
                <h3>Anything we can help with?</h3>
      
                <form action="<?php echo esc_url(home_url()); ?>/contact" id="generalInquiryForm" class="form" method="POST" autocomplete="off">
                     
                    <div id="contact-name">
                        <label for="contactName">Name (*required)</label>
                        <input type="text" name="contactName" id="contactName" maxlength="36" value="<?php if(isset($_POST['contactName'])) echo $_POST['contactName'];?>" class="required requiredField" />
                        <?php if($nameError != '') { ?>
                            <span class="error"><?=$nameError;?></span>
                        <?php } ?>
                    </div>
                    <div id="contact-email">             
                        <label for="email">Email (*required)</label>
                        <input type="text" name="email" id="email" value="<?php if(isset($_POST['email']))  echo $_POST['email'];?>" class="required requiredField" />
                        <?php if($emailError != '') { ?>
                            <span class="error"><?=$emailError;?></span>
                        <?php } ?>
                    </div>
                    <div id="contact-phone">
                        <label for="phoneNumber">Phone Number (optional)</label>
						<input title="Invalid Phone Number. Either correct or erase it." name="phoneNumber" id="phoneNumber" type="Tel" <?php if(isset($_POST['phoneNumber']))  echo $_POST['phoneNumber'];?>>  
                        <?php if($phoneNumberError != '') { ?>
                            <span class="error"><?=$phoneNumberError;?></span>
                        <?php } ?>
                    </div>
                    <div id="contact-subject">
                        <label for="subject">Subject (*required)</label>
                        <select name="subject" id="subject" title="Please select something!" <?php if(isset($_POST['subject']))  echo $_POST['subject'];?>>
                            <option value="">-select one-</option>
                            <option value="Job Inquiry">Job Inquiry</option>
                            <option value="Further Information">Further Information</option> 
                            <?php if($subjectError != '') { ?>
                                <span class="error"><?=$subjectError;?></span>
                            <?php } ?>
                        </select>
                    </div>
                    <div id="contact-message">
                        <label for="message">Your Inquiry (limit 1000 chars)</label>
                        <textarea name="message" id="message" rows="20" cols="30" class="required requiredField" maxlength="1000"><?php if(isset($_POST['message'])) { if(function_exists('stripslashes')) { echo stripslashes($_POST['message']); } else { echo $_POST['message']; } } ?></textarea>
                        <?php if($messageError != '') { ?>
                            <span class="error"><?=$messageError;?></span>
                        <?php } ?>
                    </div>

                    <input type="hidden" name="submitted" id="submitted" value="true" />
                    
                    <button type="submit" name="email_submit">Submit Request</button>

                </form>
            </div>
            <img src="<?php echo get_theme_file_uri('/images/contact.jpg');?>" alt="">
        </div>

    </div>
</div>
<div id="pop-up-display-box">
    <!-- Maybe drop image between next and previous and have them offset off of it, rathe than the borders of the parent, 
    as to have even distance -->
    <div id="content-holder">
        <button id="prev-image" class="pop-up-directional">previous</button>
        <div id="image-holder"></div>
        <button id="next-image" class="pop-up-directional">next</button>
    </div>

    <button id="closeMagnify">Close</button>
</div>

<!-- Get bogger images,  it looks like sizes that exceed the image's dimensions cannot be created cannot be created-->
<div id="news-media-display">

    <button id="news-media-close">Close</button>
</div>
<?php 
// }
    get_footer();
?>