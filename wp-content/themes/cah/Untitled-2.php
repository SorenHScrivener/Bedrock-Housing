           <!--Need to exclude past dates and ones within 7(?) days from today, so make a few like that to test-->
            <!--Also Might limit to 2 or 3 weeks in advance-->

            <div id="meetingRequest">
                <!-- Add in that *not taking in person due to covid -->
                <h3>Request a Meeting</h3>
                <!-- have calender options based on which selected, deselecting if chose one that doesn't work -->
                <!--dropdown with date and one for time range dependemt on said date-->

                <!--Or put interactive calender in empty space tp the right-->
                <!-- Blank out unavailable spaces and/or have avail clickable-->

                <!--Dropdown might be better here as more direct for appointments, but we'll see...-->
                
                <form action="<?php the_permalink();?>" id="meetingInquiryForm" class="form" method="POST" autocomplete="off">
                    <ul>
                        <!-- put circles on other side -->
                        <!--Make phone number req for phone meet and skype[list one or two other?] req for vid chat?-->
                        <li>
                            <label for="">In person</label>
                            <input type="radio" name="meetingType">
                            <select name="select_in-person" id="">
                                <option value=""></option>
                                <!-- Access the value of the radio buitton [if(meeting availability is phone, display in phone)]-->
                                <!--In back, get rid of field names for time, justing having one, with use indicated by radio
                                    Also, try to get the timre and subject listed in the panel-->
                            <?php
                                //Order by days and time. But How?
                                //3 part selection process. Pick type, day, and then time, all being dependent of what come before it
                                //Some certains days for certain meeting types, and times for certain days 
                                $homepageEvents = new WP_Query(array(
                                    'posts_per_page' => 10, 
                                    'post_type' => 'availability',
                                    'orderby' => 'date',
                                    'order' => 'DESC'
                                ));

                                while($homepageEvents->have_posts()){
                                $homepageEvents->the_post();?>
                                    <option value=""><?php echo get_field('days'); echo " "; the_field('time_start'); echo " "; the_field('time_end'); ?></option>;
                                    <?php
                                }
                                wp_reset_postdata();
                            ?>
                            </select>
                        </li>
                        <li>
                            <label for="">Phone</label>
                            <input type="radio" name="meetingType">
                            <select name="select_phone" id="">
                                <option value=""></option>

                            </select>
                        </li>
                        <li>
                            <label for="">Online</label>
                            <input type="radio" name="meetingType">
                            <select name="select_online" id="">
                                <option value=""></option>

                            </select>
                        </li>
                    </ul>

                    <div>
                        <label for="contactName">Name (*required)</label>
                        <input type="text" name="contactName" id="contactName" maxlength="36" value="<?php if(isset($_POST['contactName'])) echo $_POST['contactName'];?>" class="required requiredField" />
                        <?php if($nameError != '') { ?>
                            <span class="error"><?=$nameError;?></span>
                        <?php } ?>
                    </div>
                    <div>             
                        <label for="email">Email (*required)</label>
                        <input type="text" name="email" id="email" value="<?php if(isset($_POST['email']))  echo $_POST['email'];?>" class="required requiredField" />
                        <?php if($emailError != '') { ?>
                            <span class="error"><?=$emailError;?></span>
                        <?php } ?>
                    </div>
                    <div>
                        <label for="message">Additional Informnation (limit 1000 chars)</label>
                        <textarea name="message" id="message" rows="20" cols="30" class="required requiredField" maxlength="1000"><?php if(isset($_POST['message'])) { if(function_exists('stripslashes')) { echo stripslashes($_POST['message']); } else { echo $_POST['message']; } } ?></textarea>
                        <?php if($messageError != '') { ?>
                            <span class="error"><?=$messageError;?></span>
                        <?php } ?>
                    </div>
                          <!--Take to page that says your request will process, response will typically be within a week and we will get back to you, 
                along with a button to go back to main-->
                <!--Or do a pop-up and wipe the inputs-->
                <button type="button">Submit Request</button>

                <input type="hidden" name="submitted" id="submitted" value="true" />
                </form>
            </div>

            <div>
                    <?php if(isset($emailSent) && $emailSent == true && wp_verify_nonce($_POST['inquiry_confirm'], 'protect_fields')) { ?>
                    <div class="thanks">
                        <p>Thanks, your email was sent successfully.</p>
                    </div>
                    
                <?php } else { ?>
                    
                    <?php if(isset($hasError) || isset($captchaError)) { ?>
                        <p class="error">Sorry, an error occured.<p>
                    <?php } ?>
                <?php } ?>    
                    </div>
                </div>

                <?php wp_nonce_field( 'protect_fields', 'inquiry_confirm' );?>
                