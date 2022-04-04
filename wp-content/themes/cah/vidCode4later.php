    $url = get_field('video_url');

    $thumb = get_field('video_thumb'); // this is an array

    $title = get_field('video_title');

    $desc = get_field('video_description');

    $parsedURL = parse_url($url);

    $host = $parsedURL['host'];

    if (strpos($host, 'youtube') !== false) {




        // if is hosted on youtube, extract ID from the query property
      
        $vidQuery = $parsedURL['query'];
      
      
        // remove the 'v='
      
        $vidID = str_replace('v=','',$vidQuery);
      
      
        // pass ID into url 
      
        $defaultThumb = 'https://img.youtube.com/vi/'.$vidID.'/maxresdefault.jpg';
      
      
      
      }elseif (strpos($host, 'vimeo') !== false) {


        // if is hosted on vimeo, extract ID from the path property
      
        $vidQuery = $parsedURL['path'];
      
      
        // remove the backslash
      
        $vidID = str_replace('/','',$vidQuery);
      
      
        // all data about vimeo videos is stored in api, like so:
      
        $hash = simplexml_load_file("https://vimeo.com/api/v2/video/$vidID.xml");
      
      
        // grab url for large thumb
      
        $defaultThumb = $hash->video[0]->thumbnail_large;
      
      
      
      }
      
    if(!empty($thumb)) {

        $vid_img = $thumb['sizes']['medium'];
        echo '<script>console.log("Your stuff here")</script>';
    
    }elseif(!empty($defaultThumb)) {

        $vid_img = $defaultThumb;
        echo '<script>console.log("No, your stuff here")</script>';
      }