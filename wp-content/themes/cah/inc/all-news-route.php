<?php
add_action('rest_api_init', 'cahRegisterAllNews');

function cahRegisterAllNews(){
    register_rest_route('cah/v1', 'all-news', array(
        'methods' => WP_REST_SERVER::READABLE,
        'callback' => 'cahAllNewsResults',
    ));
}

function cahAllNewsResults($data){
    $mainQuery =  new WP_Query(array(
        'posts_per_page' => -1,
        'post_type' => array('property', 'member', 'news', 'update'),
        'order' => 'DESC',
        's' => sanitize_text_field($data['news'])
    ));
 
    $results = array(
        'propertiesAndMembers' => array(),
        'updatesAndNews' => array()
    );

    while($mainQuery -> have_posts()){
        $mainQuery -> the_post();

        $gallery = get_field('gallery', $post->ID);
        
        $newGallery = array();

        if($gallery) {
            foreach($gallery as $image){
                $id = $image['id']; // The attachment id of the media
                $title = $image['title']; //The title
                $caption= $image['caption']; //The caption
                $full_image_url= $image['full_image_url']; //Full size image url
                $select_image_url = acf_photo_gallery_resize_image($full_image_url, 236, 144); //Resized size to 262px width by 160px height image url
                $thumbnail_image_url= $image['thumbnail_image_url']; //Get the thumbnail size image url 150px by 150px
                $url= $image['url']; //Goto any link when clicked
                $target= $image['target']; //Open normal or new tab
                $videoUrl = get_field('gallery_video_url', $id); //Get the alt which is a extra field (See below how to add extra fields)
                $desc = get_field('gallery_desc', $id); //Get the alt which is a extra field (See below how to add extra fields)
   
                array_push($newGallery, array(
                    'id' => $id,
                    'title' => $title,
                    'caption' => $caption,
                    'image' => $full_image_url,
                    'selectImage' => $select_image_url,
                    'videoSource' => $videoUrl,
                    'description' => $desc
                ));
            }
        }
    
        if(get_post_type() === 'update' OR get_post_type() === 'news'){
    
            $description = null;
            $relatedPosts = get_field('related_posts');
    
            if(get_field('excerpt')){
                $description = get_field('excerpt');
            } else{
                $description = wp_trim_words(get_field('description'), 80);
            } 
    
            if(get_field('excerpt')){
                $description = get_field('excerpt');
            } else{
                $description = wp_trim_words(get_field('description'), 80);
            } 
    
            array_push($results['updatesAndNews'], array(
                'postType' => get_post_type(),
                'postTypePlural' => strtolower(get_post_type_object(get_post_type())->labels->name),
                'title' => get_the_title(),
                'permalink' => get_the_permalink(),
                'caption' => get_field('caption'),
                'relationships' => $relatedPosts,
                'date' => get_field('post_date'),
                'image' => get_field('media')['image']['sizes']['newsThumb'],
                'fullImage' => get_field('media')['image']['sizes']['newsFull'],
                // 'video' => get_field('media')['video'],
                'description' => $description,
                'fullDescription' => get_field('description'),
                'gallery' => $newGallery,
                'id' => get_the_id()
            ));
        }

        if(get_post_type() === 'member' || get_post_type() === 'property'){
            array_push($results['propertiesAndMembers'], array(
                'postType' => get_post_type(),
                'title' => get_the_title(),
                'permalink' => get_the_permalink(),
                'id' => get_the_id(),
                'gallery' => $newGallery
            ));
        }
    
        }
        
    
    return $results;

}