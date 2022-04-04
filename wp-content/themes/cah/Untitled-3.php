<div>
                    <?php if(isset($emailSent) && $emailSent == true) { ?>
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