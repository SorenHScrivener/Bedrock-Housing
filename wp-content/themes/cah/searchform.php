      <!--esc_url() provides extra security for users. If use for real, apply to all echoed site_urls-->
      <!--Make sure this works too. Seems to appear in background of wherever it goes. Can I just stick this on the constant header?
        Also, it shouldn't be getting any single page like that. need to fix the banner logic-->
      <form class="search-form" method="get" action="<?php echo esc_url(site_url('/')); ?>">
            <label for="s">Start new search</label>
            <div>
                <input placeholder="what are you looking for?" class="s" type="search"name="s" id="s">
                <input class="search-submit" type="submit" value="Search">
            </div>
        </form>