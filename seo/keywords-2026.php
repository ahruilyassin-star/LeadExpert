<?php
/**
 * 2026 high-intent keyword mapping for Little Oummah product pages.
 *
 * Usage: feed these into Yoast / RankMath focus keyword fields,
 * product titles, and meta descriptions.
 *
 * Priority tiers:
 *   HIGH   – monthly search volume >500, low-medium competition
 *   MEDIUM – monthly search volume 100-500
 *   LONG   – long-tail, conversion-ready
 */

return [

	// -----------------------------------------------------------------------
	// Core product lines
	// -----------------------------------------------------------------------
	'arabic_alphabet_magnets' => [
		'primary'  => 'Arabic alphabet magnets for kids',
		'high'     => [
			'Arabic magnetic letters',
			'Arabic letter magnets toddler',
			'Islamic learning toys',
			'Arabic alphabet fridge magnets',
		],
		'medium'   => [
			'Arabic letters for children',
			'Islamic educational toys 2026',
			'Quran learning toys',
			'halal toys for kids',
		],
		'long_tail' => [
			'best Arabic alphabet magnets for 3 year olds',
			'how to teach kids Arabic letters at home',
			'magnetic Arabic letters for fridge EU',
			'Arabic learning toys Belgium',
			'Islamic Montessori toys for toddlers',
		],
		'nl'       => [ 'Arabisch alfabet magneten', 'islamitisch speelgoed kinderen', 'Arabische letters magneten peuter' ],
		'fr'       => [ 'lettres arabes magnétiques enfants', 'jouets islamiques éducatifs', 'apprendre alphabet arabe enfants' ],
		'de'       => [ 'Arabische Buchstaben Magnete Kinder', 'Islamisches Lernspielzeug', 'Arabisch lernen Spielzeug' ],
	],

	'building_blocks_motor_skills' => [
		'primary'  => 'Islamic building blocks motor skills',
		'high'     => [
			'Islamic wooden building blocks',
			'Muslim kids motor skills toys',
			'halal building blocks toddler',
			'Islamic Montessori blocks',
		],
		'medium'   => [
			'Islamic toys motor development',
			'Muslim educational building blocks',
			'wooden Islamic toys kids',
		],
		'long_tail' => [
			'building blocks for Muslim toddlers 2-4 years',
			'Islamic STEM toys for children',
			'best Islamic gifts for kids birthday',
			'wooden building blocks Islamic patterns',
		],
		'nl'       => [ 'islamitisch speelgoed motoriek', 'houten bouwblokken islamitisch', 'moslim speelgoed peuter' ],
		'fr'       => [ 'jouets islamiques motricité', 'blocs construction islamiques', 'jouets éducatifs musulmans' ],
		'de'       => [ 'Islamisches Motorik Spielzeug', 'Muslimische Holzbausteine', 'Islamisches Lernspielzeug Kleinkind' ],
	],

	// -----------------------------------------------------------------------
	// Brand & category terms
	// -----------------------------------------------------------------------
	'brand'    => [
		'primary'  => 'Little Oummah',
		'high'     => [
			'Little Oummah toys',
			'Little Oummah shop',
			'Little Oummah Islamic toys',
		],
		'long_tail' => [
			'Little Oummah review',
			'Little Oummah shipping Europe',
			'Little Oummah discount code',
		],
	],

	'category' => [
		'primary'  => 'Islamic educational toys',
		'high'     => [
			'Islamic toys for kids 2026',
			'Muslim children toys',
			'halal educational toys',
			'Islamic gifts for children',
		],
		'long_tail' => [
			'best Islamic educational toys 2-8 years',
			'Islamic toys shipped to Belgium',
			'Islamic toys shipped to Netherlands',
			'Islamic toys shipped to France',
			'Islamic toys shipped to Germany',
			'Islamic Christmas alternative gifts kids',
			'Eid gift ideas for children',
		],
	],

	// -----------------------------------------------------------------------
	// Seasonal / event keywords
	// -----------------------------------------------------------------------
	'seasonal' => [
		'ramadan'  => [ 'Ramadan gifts for kids', 'Ramadan activities children', 'Ramadan learning toys' ],
		'eid'      => [ 'Eid gifts children', 'Eid al-Fitr presents kids', 'Eid al-Adha gifts toddler' ],
		'back2school' => [ 'Islamic back to school toys', 'Arabic learning kit school', 'Muslim kids school gifts' ],
	],

	// -----------------------------------------------------------------------
	// Page-specific title + meta templates
	// -----------------------------------------------------------------------
	'templates' => [
		'product_title'       => '{Product Name} – Islamic Educational Toy | Little Oummah',
		'product_meta'        => 'Buy {Product Name} for your little one. Expertly designed Islamic educational toy for children aged {age_range}. Free EU shipping from €{threshold}.',
		'category_title'      => '{Category} Islamic Toys for Kids | Little Oummah',
		'category_meta'       => 'Explore our {category} collection – premium Islamic educational toys crafted to make learning fun. Shipped to BE, NL, FR & DE.',
		'homepage_title'      => 'Little Oummah – Islamic Educational Toys | Arabic Alphabet & Motor Skills',
		'homepage_meta'       => 'Discover award-winning Islamic educational toys: Arabic alphabet magnets, motor skills blocks, and more. Free shipping across Europe.',
	],
];
