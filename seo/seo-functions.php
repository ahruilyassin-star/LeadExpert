<?php
/**
 * SEO functions for Little Oummah WooCommerce store.
 * Add to functions.php or a child-theme plugin.
 *
 * Covers: meta descriptions, Open Graph tags, title optimisation,
 * canonical URLs, hreflang (TranslatePress), and breadcrumb schema.
 */

// ---------------------------------------------------------------------------
// 1. Dynamic meta description for product pages
// ---------------------------------------------------------------------------
add_action( 'wp_head', 'little_oummah_meta_description', 1 );

function little_oummah_meta_description() {
	if ( ! is_product() ) {
		return;
	}

	global $product;

	if ( ! $product instanceof WC_Product ) {
		return;
	}

	$desc = $product->get_short_description() ?: $product->get_description();
	$desc = wp_strip_all_tags( $desc );
	$desc = wp_trim_words( $desc, 25, '...' );

	if ( $desc ) {
		echo '<meta name="description" content="' . esc_attr( $desc ) . '">' . "\n";
	}
}


// ---------------------------------------------------------------------------
// 2. Open Graph / Social sharing tags
// ---------------------------------------------------------------------------
add_action( 'wp_head', 'little_oummah_open_graph' );

function little_oummah_open_graph() {
	if ( is_product() ) {
		global $product;

		if ( ! $product instanceof WC_Product ) {
			return;
		}

		$image_id  = $product->get_image_id();
		$image_url = $image_id ? wp_get_attachment_image_url( $image_id, 'large' ) : get_site_icon_url( 512 );
		$title     = $product->get_name() . ' | Little Oummah';
		$desc      = wp_strip_all_tags( $product->get_short_description() ?: $product->get_description() );
		$desc      = wp_trim_words( $desc, 25, '...' );

		$tags = [
			'og:type'        => 'product',
			'og:title'       => $title,
			'og:description' => $desc,
			'og:image'       => $image_url,
			'og:url'         => get_permalink(),
			'og:site_name'   => 'Little Oummah',
		];
	} elseif ( is_front_page() ) {
		$tags = [
			'og:type'        => 'website',
			'og:title'       => 'Little Oummah – Islamic Educational Toys',
			'og:description' => 'Discover award-winning Islamic educational toys for children: Arabic alphabet magnets, motor skills blocks, and more. Shipped across Europe.',
			'og:image'       => get_site_icon_url( 512 ),
			'og:url'         => home_url(),
			'og:site_name'   => 'Little Oummah',
		];
	} else {
		return;
	}

	foreach ( $tags as $property => $content ) {
		echo '<meta property="' . esc_attr( $property ) . '" content="' . esc_attr( $content ) . '">' . "\n";
	}
}


// ---------------------------------------------------------------------------
// 3. Optimised <title> tag for product pages
// ---------------------------------------------------------------------------
add_filter( 'woocommerce_page_title', 'little_oummah_seo_product_title' );
add_filter( 'document_title_parts', 'little_oummah_document_title' );

function little_oummah_document_title( $title ) {
	if ( is_product() ) {
		global $product;
		if ( $product instanceof WC_Product ) {
			$title['title'] = $product->get_name() . ' – Islamic Educational Toy';
			$title['site']  = 'Little Oummah';
		}
	} elseif ( is_shop() ) {
		$title['title'] = 'Islamic Educational Toys for Kids';
		$title['site']  = 'Little Oummah';
	}
	return $title;
}

function little_oummah_seo_product_title( $title ) {
	return $title;
}


// ---------------------------------------------------------------------------
// 4. Add keyword-rich alt text to product images that have none
// ---------------------------------------------------------------------------
add_filter( 'woocommerce_product_get_image', 'little_oummah_product_image_alt', 10, 5 );

function little_oummah_product_image_alt( $html, $product, $size, $attr, $placeholder ) {
	if ( empty( $attr['alt'] ) && $product instanceof WC_Product ) {
		$alt  = $product->get_name() . ' – Islamic educational toy for children';
		$html = str_replace( 'alt=""', 'alt="' . esc_attr( $alt ) . '"', $html );
	}
	return $html;
}


// ---------------------------------------------------------------------------
// 5. Canonical URL – prevent duplicate content from query strings
// ---------------------------------------------------------------------------
add_action( 'wp_head', 'little_oummah_canonical', 1 );

function little_oummah_canonical() {
	if ( is_product() || is_product_category() || is_shop() ) {
		$canonical = is_shop() ? get_permalink( wc_get_page_id( 'shop' ) ) : get_permalink();
		echo '<link rel="canonical" href="' . esc_url( $canonical ) . '">' . "\n";
	}
}


// ---------------------------------------------------------------------------
// 6. Breadcrumb schema (BreadcrumbList) for product pages
// ---------------------------------------------------------------------------
add_action( 'wp_head', 'little_oummah_breadcrumb_schema' );

function little_oummah_breadcrumb_schema() {
	if ( ! is_product() ) {
		return;
	}

	global $product;

	$terms = get_the_terms( $product->get_id(), 'product_cat' );
	if ( ! $terms || is_wp_error( $terms ) ) {
		return;
	}

	$category = reset( $terms );

	$schema = [
		'@context'        => 'https://schema.org',
		'@type'           => 'BreadcrumbList',
		'itemListElement' => [
			[
				'@type'    => 'ListItem',
				'position' => 1,
				'name'     => 'Home',
				'item'     => home_url(),
			],
			[
				'@type'    => 'ListItem',
				'position' => 2,
				'name'     => $category->name,
				'item'     => get_term_link( $category ),
			],
			[
				'@type'    => 'ListItem',
				'position' => 3,
				'name'     => $product->get_name(),
				'item'     => get_permalink(),
			],
		],
	];

	echo '<script type="application/ld+json">' . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
}


// ---------------------------------------------------------------------------
// 7. Remove noindex from paginated shop pages (common WooCommerce mistake)
// ---------------------------------------------------------------------------
add_filter( 'wpseo_robots', 'little_oummah_fix_shop_pagination_robots' );

function little_oummah_fix_shop_pagination_robots( $robots ) {
	if ( is_shop() && get_query_var( 'paged' ) > 1 ) {
		return str_replace( 'noindex', 'index', $robots );
	}
	return $robots;
}
