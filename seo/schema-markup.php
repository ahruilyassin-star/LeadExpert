<?php
/**
 * Schema.org JSON-LD markup for Little Oummah product pages.
 * Add this to functions.php or a custom plugin.
 */

add_action( 'wp_head', 'little_oummah_product_schema' );

function little_oummah_product_schema() {
	if ( ! is_product() ) {
		return;
	}

	global $product;

	if ( ! $product instanceof WC_Product ) {
		return;
	}

	$image_id  = $product->get_image_id();
	$image_url = $image_id ? wp_get_attachment_image_url( $image_id, 'full' ) : '';

	$schema = [
		'@context'    => 'https://schema.org/',
		'@type'       => 'Product',
		'name'        => $product->get_name(),
		'description' => wp_strip_all_tags( $product->get_description() ?: $product->get_short_description() ),
		'image'       => $image_url,
		'sku'         => $product->get_sku(),
		'brand'       => [
			'@type' => 'Brand',
			'name'  => 'Little Oummah',
		],
		'offers'      => [
			'@type'           => 'Offer',
			'url'             => get_permalink(),
			'priceCurrency'   => get_woocommerce_currency(),
			'price'           => $product->get_price(),
			'availability'    => $product->is_in_stock()
				? 'https://schema.org/InStock'
				: 'https://schema.org/OutOfStock',
			'seller'          => [
				'@type' => 'Organization',
				'name'  => 'Little Oummah',
			],
		],
		'audience'    => [
			'@type'       => 'PeopleAudience',
			'suggestedAge' => '2-8 years',
		],
		'category'    => 'Educational Toys / Islamic Learning',
	];

	// Add aggregate rating if reviews exist.
	$rating_count = $product->get_rating_count();
	if ( $rating_count > 0 ) {
		$schema['aggregateRating'] = [
			'@type'       => 'AggregateRating',
			'ratingValue' => $product->get_average_rating(),
			'reviewCount' => $rating_count,
		];
	}

	echo '<script type="application/ld+json">' . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
}


/**
 * Organization schema for the homepage.
 */
add_action( 'wp_head', 'little_oummah_org_schema' );

function little_oummah_org_schema() {
	if ( ! is_front_page() ) {
		return;
	}

	$schema = [
		'@context' => 'https://schema.org',
		'@type'    => 'Organization',
		'name'     => 'Little Oummah',
		'url'      => home_url(),
		'logo'     => [
			'@type' => 'ImageObject',
			'url'   => get_site_icon_url( 512 ),
		],
		'sameAs'   => [
			'https://www.instagram.com/littleoummah/',
			'https://www.facebook.com/littleoummah/',
		],
		'description' => 'Islamic educational toys for children aged 2-8, including Arabic alphabet magnets and motor skills building blocks.',
		'areaServed'  => [ 'BE', 'NL', 'FR', 'DE', 'GB', 'US' ],
	];

	echo '<script type="application/ld+json">' . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
}
