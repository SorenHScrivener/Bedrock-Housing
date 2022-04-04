else if($floorPlans || $buildingPlans || $interiorImages || $genImages){ ?>
                        <!--For now, I will use first image in each gallery 
                        as clickable cover image[use ajax to prevent slow load], and will later be default, 
                        with option to assign one-->
                    <?php
                        $width = 220;
                        $height = 120;

                        $floorPlansUrl = $floorPlans[0]['full_image_url']; 
                        $floorPlansUrl = acf_photo_gallery_resize_image($floorPlansUrl, $width, $height); 

                        $buildingPlansUrl = $buildingPlans[0]['full_image_url']; 
                        $buildingPlansUrl = acf_photo_gallery_resize_image($buildingPlansUrl, $width, $height); 

                        $interiorImagesUrl = $interiorImages[0]['full_image_url']; 
                        $interiorImagesUrl = acf_photo_gallery_resize_image($interiorImagesUrl, $width, $height); 

                        $generalImagesUrl = $generalImages[0]['full_image_url']; 
                        $generalImagesUrl = acf_photo_gallery_resize_image($generalImagesUrl, $width, $height); 
                    ?>
<?php if($floorPlan){?>
                            <div class="property-media-card">
                                <h3>Floor Plans</h3>
                                <img src="<?php echo $floorPlanUrl; ?>" alt="">
                            </div> 
                        <?php } ?>    
                        <?php if($interiorImages){?>
                            <div class="property-media-card">
                                <h3>Interior</h3>
                                <img src="<?php echo $interiorImagesUrl; ?>" alt="">
                            </div>
                        <?php } ?> 
                        <?php if($buildingPlan){?>
                            <div class="property-media-card">
                                <h3>Building Plans</h3>
                                <img src="<?php echo $buildingPlanUrl; ?>" alt="">
                            </div>
                        <?php } ?> 
                        <?php if($genImages){?>
                            <div class="property-media-card">
                                <h3>General Images</h3>
                                <img src="<?php echo $genImagesUrl; ?>" alt="">
                            </div>
                        <?php } ?> 
<?php } ?>