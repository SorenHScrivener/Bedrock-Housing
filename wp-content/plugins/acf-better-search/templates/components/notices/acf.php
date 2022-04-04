<?php
/**
 * .
 *
 * @package ACF: Better Search
 */

?>

<div class="notice notice-error is-dismissible">
	<div class="acfbsContent acfbsContent--notice">
		<h4>
			<?php echo esc_html( __( 'ACF: Better Search error!', 'acf-better-search' ) ); ?>
		</h4>
		<p>
			<?php echo wp_kses_post( __( 'Unfortunately, but this plugin requires the Advanced Custom Field plugin version 5 for all functionalities to work properly. Please install the latest version of the ACF plugin.', 'acf-better-search' ) ); ?>
		</p>
	</div>
</div>
