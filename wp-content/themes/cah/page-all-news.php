<!-- Hide pagination numbers after a cetain points, revealing more later ones as go forward and earlier ones being hidden, and the reverse -->
<!-- Make a shit ton of legitimate-looking news with accompanying materials-->

<!-- Make a date field for news and updates -->

<!--Need new date fields, so I can make up may diverse dates for testing and presentation of capabilities-->
<?php 
    get_header();
?>
<!-- Do date comparison to determine how to display the mixed types-->

<!-- Put search paramters in header and move search button for all? -->

<!-- Have dropdown date filters, populated by existing options, but also have option of a popup calender following the same rules -->

<!--Use section and/or article for news? Can I apply to each block somehow? Apply in the back of WP? Or does it do that automatically?-->
        
<div id="all-news-container">
    <div id="selected-news-container">
        <div>
            <h2 id="main-header">All News</h2>
            <button id="dismiss-selection" class="dismissed">(Dismiss)</button>
        </div>
        <div id="selected-news-reciever">
            <div id="main-display"></div>
            <div id="full-display-container" class="dismissed"></div>
            <!-- News loaded in from link will display with change to the title and specific way to dismiss it? -->
        </div>

        <!-- add buttons that change results per page, such as 1, 3, and 5 -->
        <div id="pagination-holder"></div>
    </div>
    <div id="filter-sort-toggle">
        <button>red</button>
    </div>
    <div id="filters-and-links-container">
                <!--Might move all search and filters into here and get rid of top bar.
        Plus, that would mean, all filters and such would be hidden until single view is canceled
        (might add pointer events none just to be safe)--> 
        <!-- switch out -->

        <div id="realtime-filters-and-sorting">
        
        <h2>Realtime Filter and Reorder</h2>
                        <!-- swap span display on click, ASC on as DESC is the default. Same for alpha-->
            <!-- Using one pair, will cause the other to reset -->
            <!--All apply on search-->
            <!--Have seperate button for just canceling these, as well as returning after select one, that respects the filters and search-->
            <!-- Use symbols instead? -->

            <!--Later, at text to right panel. Something to effect of: Date Sort: On(Desc) and AlphaSort: on(Z-A)-->
            <!-- press alpha puts date back to standard, and desc on first press, with date putiing alpha at a to z -->
            <!--Maybe move order to be in header box, with search going to right--> 
            <div id="order-by">
            <h3>Order By:</h3>
                <ul>
                    <li>
                        <button class="toggle-options" id="order-by-date">Date Order(<span class="asc">ASC</span><span class="desc">DESC</span><span class="off">Off</span>)</button>
                    </li>
                    <li>
                        <button class="toggle-options" id="order-by-alpha">Alpha Order(<span class="asc">ASC</span><span class="desc">DESC</span><span class="off">Off</span>)</button>
                    </li>
                </ul>
            </div>
            <div id="toggle-type">
                <h3>Toggle Types Allowed</h3>
                <ul>
                    <li>
                        <button class="toggle-options" id="include-property-updates">Property Updates(<span class="include">Included</span><span class="off">Excluded</span>)</button>
                    </li>
                    <li>
                        <button class="toggle-options" id="include-general-news">General News(<span class="include">Included</span><span class="off">Excluded</span>)</button>
                    </li>   
                </ul>
            </div>
            <div id="filter-date">
                <h3>Date filters</h3>
            <!-- Use this to toggle between range and specific after latter is implemented. Use it will reset the values of what gets hidden-->
            <!-- <button id="filter-by-date">Filter By Date</button> -->
            <!-- display current in all cases -->
            <!-- populate select by what is available -->
            <!--Might skip range for now, as more vanity than necessity-->
            <!-- Also would need to crrate new fields where can set date, which woud allow for easy testing of it-->
                <div id="date-filters" class="dismissed">
                    <ul>
                        <li>
                            <label for="by-year">Filter By Year</label>
                            <select id="by-year" autocomplete="off">
                                <!-- <option value=""></option>
                                <option value="2021">2021</option>
                                <option value="2022">2022</option> -->
                            </select>
                        </li>
                        <li>
                            <label for="by-month">Filter By Month</label>
                            <select id="by-month" The autocomplete="off">
                                <!-- <option value=""></option>
                                <option value="January">January</option>
                                <option value="February">February</option> -->
                            </select>
                        </li>
                    </ul>

                    <!-- <label for="by-range">Filter By Range</label> -->
                    <!-- <div id="by-range">
                        <label for="by-range-start">Start of Range</label>
                        <select id="by-range_start" The autocomplete="off">

                        </select>
                        <label for="by-range-end">End of Range</label>
                        <select id="by-range_end" The autocomplete="off">

                        </select>
                    </div> -->
                </div>
            </div>
     
        </div>

        <div id="search-filters">
            <h2>Search Filters</h3>
            <!-- //Start only is standard and auto true when whole word is turned on(?) or simply buried in partial if -->
            <!-- //it should at least be inacessible on the frontend with visual cue -->
            <!-- shelf whole word, for now. 8+ hours wasted on it-->
            <div id="news-search-container">
                <input id="news-search" type="search" placeholder="search for news..." autocomplete="off">   
            </div>
    
            <!-- <div id="test"> -->
                <button class="toggle-options" id="full-word-only"><span class="off">partials allowed</span><span class="full-word-only">Only whole words</span></button>
                <!-- <h4>partial options</h4> -->
                <!-- show only when partial is active -->
                <button class="toggle-options" id="word-start-only"><span class="word-start-only">start of word only</span><span class="off">any part</span></button>
                <!-- <h4>options for both</h4> -->
                <button class="toggle-options" id="case-sensitive">case sensitive is <span class="case-sensitive">on</span><span class="off">off</span></button>
                <!-- Save for later, as need to figure out hw to get relationship -->
                <button class="toggle-options" id="include-title">Title(<span class="include">Included</span><span class="off">Excluded</span>)</button>
                <button class="toggle-options" id="include-description">Description(<span class="include">Included</span><span class="off">Excluded</span>)</button>
                <!-- <button id="include-relationship">include relationships on/off</button> -->
                <!-- If title or desc or relationship match, put in new version of array
                [match dependent on partial or whole, case setting, and what part of word is valid]-->
            <!-- </div> -->
        </div>

        <button id="reset-all">Reset All</button>
    </div>
</div>
<?php
    get_footer();
?>