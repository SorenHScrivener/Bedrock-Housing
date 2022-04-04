                <div class="news">
                    <!--add related prop and optional related member for both-->
                    <?php

                        $propertyUpdateImg = get_field('gallery', $post->ID);
                        
                        $imgInput = $propertyUpdateImg[0]['full_image_url']; 
                        $imgInputThumb = acf_photo_gallery_resize_image($imgInput, 220, 120); 
                        $imgInputLarge = acf_photo_gallery_resize_image($imgInput, 440, 240);  

                        // $updateThumb = $propertyUpdateImg['sizes']['newsThumb'];
                        // $updateFull = $propertyUpdateImg['sizes']['newsFullLarge'];
                        // $updateVid = get_field('media')['video'];      // $updateVid = get_field('media')['video'];
                        $relatedPosts = get_field('related_posts');
                        // $relatedMembers = get_field('related_members');

                        // $post = get_queried_object();
                        $postId = get_the_id();
                        $postType = get_post_type_object(get_post_type());

                    ?>
                    
                    <h4><?php 
                        the_title();
                        if(!is_front_page()){
                            //Load in with ajax and send id along with all news
                            echo ' <a href="' . " " . '">(See More Related News)</a>';
                        }
                    ?></h4>
 
                    <p>
                        <?php if( get_field('caption') ){
                             echo get_field('caption'); ?> - 
                        <?php } ?>
                        <?php echo get_the_date( 'm/d/y' ); ?>  
                    </p>
                    <?php if( $relatedPosts && is_front_page() ){ 
                        echo '<ul>';
                        foreach($relatedPosts as $relatedPost){?>
                              <?php
                              if (next($relatedPosts )) {
                                  $comma = ',';
                                    
                                }else{
                                    $comma = ' ';
                                }
                            ?>
                            <li><a href="<?php echo get_home_url(); ?>/all-news/#<?php echo $relatedPost -> ID; ?>-related-allNews"><?php echo get_the_title($relatedPost); echo $comma; ?>
                        </a></li>
                        <?php }
                        echo '</ul>';
                    }?>

                    <!-- figure out how to account for video. Perhaps draw from url field
                        Can I still resize them like that?
                        Add an 'if' for if video url is not empty-->

                        <!-- Then again, I think need to serve through ajax, so it's a bit of a different route -->
                        <div class="media-card">    
                            <?php if( is_front_page()){?>      
                                <img data-id="<?php echo $postId ?>" data-post="<?php echo strtolower($postType->labels->name); ?>" data-full="<?php echo $imgInputLarge; ?>" src="<?php echo $imgInputThumb; ?>"  alt="<?php the_title(); ?> image gallery">
                            <?php }else if(!is_front_page()){?>
                                <img data-id="<?php echo $postId ?>" data-post="<?php echo strtolower($postType->labels->name); ?>" data-full="<?php echo $imgInputLarge; ?>" src="<?php echo $imgInput; ?>" alt="<?php the_title(); ?> image gallery">
                            <?php }else{ 
                                // data-mediatype="video"
                                echo $updateVid; 
                                //Get url of update vid and use in iframe in 'lightbox'
                                //But how do I style the pic to look like the iframe?
                                } //Change to using false thumb and click to view in pop-up
                                    //After implement, have news have a selection of vid or images and/or put in as a gallery of vids and images, 
                                    //with one being deemed as the main one
                                    ?> 
                        </div>             
                    <p>          
                    
                    <?php if ( is_front_page() ){
                        // consider getting rid of exercpts or using them very sparongly as too much effort
                        if(strlen(get_field('excerpt'))){
                            echo get_field('excerpt');
                        } else{
                            echo wp_trim_words(get_field('description'), 80);
                        } 
                    } else{
                        the_content();
                    }?>
                    </p>
                        <?php if( is_front_page() ){ ?> 
                            <a class="read-more" href="<?php echo get_home_url(); ?>/all-news/#<?php echo get_the_ID(); ?>-news-allNews">Read More...</a>
                        <?php } ?>
                </div> 