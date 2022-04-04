<?php
/**
 * .
 *
 * @package ACF: Better Search
 */

?>

<div class="acfbsPage__widget">
	<h3 class="acfbsPage__widgetTitle acfbsPage__widgetTitle--second">
		<?php echo esc_html( __( 'We love what we do!', 'acf-better-search' ) ); ?>
	</h3>
	<div class="acfbsContent acfbsContent--lastCenter">
		<p>
			<?php
			echo wp_kses_post(
				__( 'However, working on plugins and technical support requires many hours of work. If you want to appreciate it, you can provide us a coffee. Thanks everyone!', 'acf-better-search' )
			);
			?>
		</p>
		<p>
			<a href="https://ko-fi.com/gbiorczyk/?utm_source=acf-better-search&utm_medium=widget-donate" target="_blank"
				class="acfbsButton acfbsButton--blue dashicons-heart">
				<?php echo esc_html( __( 'Provide us a coffee', 'acf-better-search' ) ); ?>
			</a>
		</p>
	</div>
</div>
