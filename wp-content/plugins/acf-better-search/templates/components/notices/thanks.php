<?php
/**
 * .
 *
 * @package ACF: Better Search
 */

?>

<div class="notice notice-success is-dismissible"
	data-notice="acf-better-search"
	data-url="<?php echo esc_url( apply_filters( 'acfbs_notice_url', '' ) ); ?>">
	<div class="acfbsContent acfbsContent--notice">
		<h4>
			<?php echo esc_html( __( 'Thank you for using our plugin ACF: Better Search!', 'acf-better-search' ) ); ?>
		</h4>
		<p>
			<?php
			echo wp_kses_post(
				sprintf(
				/* translators: %1$s: open anchor tag, %2$s: close anchor tag */
					__( 'Please let us know what you think about our plugin. It is important that we can develop this tool. Thank you for all the ratings, reviews and donates. If you have a technical problem, please before you add a review %1$scheck our FAQ%2$s or contact us if you did not find help there. We will try to help you!', 'acf-better-search' ),
					'<a href="https://wordpress.org/plugins/acf-better-search/#faq" target="_blank">',
					'</a>'
				)
			);
			?>
		</p>
		<div class="acfbsContent__buttons">
			<a href="https://wordpress.org/support/plugin/acf-better-search/#new-post"
				target="_blank"
				class="acfbsContent__button acfbsButton acfbsButton--green">
				<?php echo esc_html( __( 'Get help', 'acf-better-search' ) ); ?>
			</a>
			<a href="https://wordpress.org/support/plugin/acf-better-search/reviews/#new-post"
				target="_blank"
				class="acfbsContent__button acfbsButton acfbsButton--green">
				<?php echo esc_html( __( 'Add review', 'acf-better-search' ) ); ?>
			</a>
			<a href="https://ko-fi.com/gbiorczyk/?utm_source=acf-better-search&utm_medium=notice-thanks"
				target="_blank"
				class="acfbsContent__button acfbsButton acfbsButton--green dashicons-heart">
				<?php echo esc_html( __( 'Provide us a coffee', 'acf-better-search' ) ); ?>
			</a>
			<button type="button" data-permanently
				class="acfbsContent__button acfbsButton acfbsButton--blue">
				<?php echo esc_html( __( 'I added review, do not show again', 'acf-better-search' ) ); ?>
			</button>
		</div>
	</div>
</div>
