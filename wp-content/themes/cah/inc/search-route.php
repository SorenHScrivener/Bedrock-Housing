<?php
//Will need to switch to a plugin to have custom fields be searchable, and will therefore need it for the news section. 
//Make it work here before do news section, and then poss figure out how to do this all without js, as well as other aspects of the site, 
//for those that have it turned off 

add_action('rest_api_init', 'cahRegisterSearch');

function cahRegisterSearch(){
    register_rest_route('cah/v1', 'search', array(
        'methods' => WP_REST_SERVER::READABLE,
        'callback' => 'cahSearchResults'
    ));
}

function cahSearchResults($data){
   $mainQuery =  new WP_Query(array(
       'posts_per_page' => -1,
       'post_type' => array('property', 'member', 'news', 'update'),
       's' => sanitize_text_field($data['term'])
   ));

   $results = array(
       'properties' => array(),
       'members' => array(), 
       'updatesAndNews' => array()
   );

   while($mainQuery -> have_posts()){
    $mainQuery -> the_post();

    if(get_post_type() === 'property'){
        array_push($results['properties'], array(
            'postType' => get_post_type(),
            'title' => get_the_title(),
            'projectedImage' => get_field('projected_info')['final_product']['sizes']['imagePortrait'],
            'image' => get_field('finished_info')['final_product']['sizes']['imagePortrait'],
            'isCompleted' => get_field('is_the_building_completed'),
            'permalink' => get_the_permalink(),
            'id' => get_the_ID()
        ));
    }

    if(get_post_type() === 'member'){
        array_push($results['members'], array(
            'postType' => get_post_type(),
            'title' => get_the_title(),
            'permalink' => get_the_permalink(),
            'image' => get_field('profile_image')['sizes']['imagePortrait'],
            'positionOrRole' => get_field('position_or_role'),
            'bio' => get_field('bio'),
            'id' => get_the_ID()
        ));
    }

    //change image and video to 'media' and use 'if'?
    if(get_post_type() === 'update' OR get_post_type() === 'news'){

        if( get_field('media')['image']){
            $media = get_field('media')['image']['sizes']['newsThumb'];
        }else{ 
            $media = get_field('media')['video'];
        }  

        $description = null;

        if(has_excerpt()){
            $description = get_the_excerpt();
        } else{
            $description = wp_trim_words(get_the_content(), 80);
        } 

        if(has_excerpt()){
            $description = get_the_excerpt();
        } else{
            $description = wp_trim_words(get_the_content(), 80);
        } 

        array_push($results['updatesAndNews'], array(
            'postType' => get_post_type(),
            'title' => get_the_title(),
            'permalink' => get_the_permalink(),
            'caption' => get_field('caption'),
            'date' => get_the_date( 'm/d/y' ),
            'image' => get_field('media')['image']['sizes']['newsThumb'],
            'video' => get_field('media')['video'],
            // 'media' => $media,
            'description' => $description,
            'id' => get_the_ID()
        ));
    }

   }
   
   if($results['properties'] || $results['members']){

        $relationshipMetaQuery = array('relation' => 'OR');

        if($results['properties']){
            foreach($results['properties'] as $item){
            array_push($relationshipMetaQuery, array(
            'key' => 'related_properties',
            'compare' => 'LIKE',
            'value' => '"' . $item['id'] . '"'
            ));
            }
        
            $allRelationshipQuery = new WP_Query(array(
                'post_type' => 'update',
                'posts_per_page' => -1,
                'meta_query' => $relationshipMetaQuery
            ));
        }
        
        if($results['members']){
            foreach($results['members'] as $item){
            array_push($relationshipMetaQuery, array(
            'key' => 'related_members',
            'compare' => 'LIKE',
            'value' => '"' . $item['id'] . '"'
            ));
            }
        
            $allRelationshipQuery = new WP_Query(array(
                'post_type' => 'news',
                'posts_per_page' => -1,
                'meta_query' => $relationshipMetaQuery
            ));
        }

        while($allRelationshipQuery -> have_posts()){
        
        $allRelationshipQuery -> the_post();
        
        if(get_post_type() === 'update' OR get_post_type() === 'news'){
    
            if( get_field('media')['image']){
                $media = get_field('media')['image']['sizes']['newsThumb'];
            }else{ 
                $media = get_field('media')['video'];
            }  
    
            $description = null;
    
            if(has_excerpt()){
                $description = get_the_excerpt();
            } else{
                $description = wp_trim_words(get_the_content(), 80);
            } 
    
            if(has_excerpt()){
                $description = get_the_excerpt();
            } else{
                $description = wp_trim_words(get_the_content(), 80);
            } 
    
            array_push($results['updatesAndNews'], array(
                'title' => get_the_title(),
                'permalink' => get_the_permalink(),
                'caption' => get_field('caption'),
                'date' => get_the_date( 'm/d/y' ),
                'image' => get_field('media')['image']['sizes']['newsThumb'],
                'video' => get_field('media')['video'],
                // 'media' => $media,
                'description' => $description,
                'id' => get_the_ID()
            ));
        }
    
        }
    
        $results['updatesAndNews'] = array_values(array_unique($results['updatesAndNews'], SORT_REGULAR));
   }

   return $results;

}