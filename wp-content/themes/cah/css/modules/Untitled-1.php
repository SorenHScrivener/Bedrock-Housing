
/* //load what is needed on pagination and/or filtering
//implement media column select and test for none-video images, before adding more media to test pagination(?)[too much?]
//Using pagination could be a good oppurtunity to test out putting all results in variable, so I don't need to keep querying the database
//'this.localStorage' will become storage for all, and this.lastQuery will take up it's current role[for use in limited cases, where data bloat is unlikely]  

//Then figure out how to grab news related media, before testing the filters
//[Will be in column too, but both up and running for demonstration purposes]{Then again, properties do the column 
//with other subjects, so maybe do the selection from column there, with gen and news rendered together}

//Get news image on single to work, bring up the other media wit it, and add to front news as well, along with news page[then again, there is the media column there] 
//front page read more should bring up that spefic report, activating the single report view. Or is it better to handle it in a pop-up?

//Seperate the video container fill as well



//Have three, paginated news reports per single, , with option to see all reports pertaing to the member or building

//Figure how to render property images by category*/

/* Maybe get rid of media column for all and just use the thumbnail to call the shadowbox [though might keep just for buildings as 
    the categories are valid]*/
/* Maybe stats go in that column instead and buildings will be in shadowbox too, but rather than filters the menu will act like the column categories*/

if($generalMedia || $floorPlans || $buildingPlans || $interiorImages){
    echo '<div id="vidAndImgCol">';
    
    //Made impossible to stop flow temporarily. Will either have already in invisible box or have these fetched with ajax on demand
    if($generalMedia){
        //change if parameter and add logic for if building 

        //Check if return array has anything in it
        if( count($generalMedia)) {
            //Cool, we got some data so now let's loop over it
            foreach($generalMedia as $image){
                $id = $image['id']; // The attachment id of the media
                $title = $image['title']; //The title
                $caption= $image['caption']; //The caption
                $full_image_url= $image['full_image_url']; //Full size image url
                $full_image_url = acf_photo_gallery_resize_image($full_image_url, 260, 160); //Resized size to 262px width by 160px height image url
                $thumbnail_image_url= $image['thumbnail_image_url']; //Get the thumbnail size image url 150px by 150px
                $url= $image['url']; //Goto any link when clicked
                $target= $image['target']; //Open normal or new tab
                $videoUrl = get_field('gallery_video_url', $id); //Get the alt which is a extra field (See below how to add extra fields)
                $desc = get_field('gallery_desc', $id); //Get the alt which is a extra field (See below how to add extra fields)
                ?>

                    <!-- After done with main stuff on site, have imgs and vids in news about character or property,
                        appear in their single using some sort of identification method (I think gallery allows me to add extra fields)
                        Also, changes singles to have vid thumb bring up multiple, scrollable vid thumbs in box to be selected, 
                        with each on the side ready to be pressed, and their coressponding vid played in the center played
                        Also, seperated like images with titles, like 'news vids', 'personal vids', 'all vids'
                        Or maybe have just marked 'vids' vs 'imgs', with the titles being used in the shadow box
                        as ajax filters with loading spinner used.-->

                         <!--if floor plans or interior fields, make clickable thumbs or 
            just words that bring images that can be magnified 
            and arrowed through-->
            <!-- Also add 'news upadates' to property-->

                                    <!-- arrows for ajax call for next set  or just have 1-3 most recent and have button to see the rest-->
                <!-- Add space for videos -->
                <!--Maybe give own scrollable column space, expanding box, with filler text-->
                <!--Have each image render an iframe via information within[find that alt method tp gallery again?]-->

                <?php 
                }

            } 
        } 
         
             foreach($mediaTypes as $type){ 

                $imgInput = $$type[0]['full_image_url']; 
                $imgInput = acf_photo_gallery_resize_image($imgInput, 220, 120); 
                $imgInputLarge = acf_photo_gallery_resize_image($imgInput, 440, 240); 
                // print $$type[0];
                if($$type){
                    // $imgInput = $type . 'Url'; 

                    $titlePieces = preg_split('/(?=[A-Z])/', $type);

                    ?>
                    <div class="media-card">
                        <h3><?php echo ucFirst($titlePieces[0]) . " " . $titlePieces[1]; ?></h3>
                        <img data-id="<?php echo get_the_id(); ?>" data-post="<?php echo strtolower($postType->labels->name); ?>" data-full="<?php echo $imgInputLarge; ?>" src="<?php echo $imgInput; ?>" alt="">
                    </div>
               <?php }
              };            
        echo '</div>';
    }?>