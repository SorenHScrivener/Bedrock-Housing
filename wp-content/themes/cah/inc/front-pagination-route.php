<?php
//Will need to switch to a plugin to have custom fields be searchable, and will therefore need it for the news section. 
//Make it work here before do news section, and then poss figure out how to do this all without js, as well as other aspects of the site, 
//for those that have it turned off 

add_action('rest_api_init', 'cahRegisterFrontPagination');

function cahRegisterFrontPagination(){
    register_rest_route('cah/v1', 'content', array(
        'methods' => WP_REST_SERVER::READABLE,
        'callback' => 'cahFrontPaginationResults',
    ));
}

function cahFrontPaginationResults($data){
    $mainQuery =  new WP_Query(array(
        'posts_per_page' => -1,
        'post_type' => array('property', 'member'),
        'order' => 'ASC',
        's' => sanitize_text_field($data['page'])
    ));
 
    $results = array(
        'properties' => array(),
        'members' => array(), 
    );

    while($mainQuery -> have_posts()){
        $mainQuery -> the_post();

            if(get_post_type() === 'property'){

                array_push($results['properties'], array(
                    'postType' => get_post_type(),
                    'postTypePlural' => strtolower(get_post_type_object(get_post_type())->labels->name),
                    'title' => get_the_title(),
                    'permalink' => get_the_permalink(),
                    'projectedImage' => get_field('projected_info')['final_product']['sizes']['imagePortraitLarge'],
                    'image' => get_field('finished_info')['final_product']['sizes']['imagePortraitLarge'],
                    'isCompleted' => get_field('is_the_building_completed'),
                    'id' => get_the_id()
                ));
            }
        
            if(get_post_type() === 'member'){
                array_push($results['members'], array(
                    'postType' => get_post_type(),
                    'postTypePlural' => strtolower(get_post_type_object(get_post_type())->labels->name),
                    'title' => get_the_title(),
                    'permalink' => get_the_permalink(),
                    'image' => get_field('profile_image')['sizes']['imagePortrait'],
                    'positionOrRole' => get_field('position_or_role'),
                    'id' => get_the_id()
                ));
            }
    
        }
    
    return $results;

}