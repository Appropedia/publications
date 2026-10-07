const Appropedia = {

	publications: [],

	init() {

		// Fetch the data and finish the main page
		Appropedia.fetchPublications().then( Appropedia.makeCovers );

		// Update the search query and the filter width when a filter changes
		const filters = document.getElementsByClassName( 'appropedia-filter' );
		for ( const filter of filters ) {
			filter.onchange = Appropedia.onFilterChange;
		}

		// @todo Open the relevant publication when the hash changes
		//window.onhashchange = Appropedia.openDialog;

		// Close the publication dialog when clicking the outside of it or on the close button
		const dialog = document.getElementById( 'appropedia-publication-dialog' );
		dialog.onclick = Appropedia.closeDialog;
		const content = document.getElementById( 'appropedia-publication-dialog-content' );
		content.onclick = event => event.stopPropagation();
		const closeButton = document.getElementById( 'appropedia-publication-dialog-close-button' );
		closeButton.onclick = Appropedia.closeDialog;
	},

	onFilterChange( event ) {
		const select = event.target;
		const option = select.options[ select.selectedIndex ];
		const value = option.value;

		// Create a dummy filter to figure out the optimal width
		const dummy = document.createElement( 'span' );
		dummy.textContent = option.text;
		dummy.className = 'appropedia-filter';
		dummy.style.position = 'absolute';
		dummy.style.visibility = 'hidden';
		document.body.append( dummy );
		select.style.width = dummy.offsetWidth + 'px';
		dummy.remove();

		const type = document.getElementById( 'appropedia-filter-type' ).value;
		const format = document.getElementById( 'appropedia-filter-format' ).value;
		const language = document.getElementById( 'appropedia-filter-language' ).value;
		const year = document.getElementById( 'appropedia-filter-year' ).value;
		const sdg = document.getElementById( 'appropedia-filter-sdg' ).value;
		const publisher = document.getElementById( 'appropedia-filter-publisher' ).value;
		for ( const publication of Appropedia.publications ) {
			const cover = document.getElementById( 'appropedia-cover-' + publication.hash );
			cover.style.display = 'initial';

			if ( type && publication.type !== type ) {
				cover.style.display = 'none';
			}
			
			if ( format === 'html' && !publication.url ) {
				cover.style.display = 'none';
			}
			if ( format === 'audio' && !publication.audio ) {
				cover.style.display = 'none';
			}
			if ( format === 'pdf' && !publication.pdf ) {
				cover.style.display = 'none';
			}
			if ( format === 'zim' && !publication.zim ) {
				cover.style.display = 'none';
			}
			if ( format === 'app' && !publication.app ) {
				cover.style.display = 'none';
			}

			if ( language && publication.language !== language ) {
				cover.style.display = 'none';
			}

			if ( year && publication.year !== year ) {
				cover.style.display = 'none';
			}

			if ( publisher ) {
				if ( publisher === 'appropedia' && publication.publisher !== 'Appropedia' ) {
					cover.style.display = 'none';
				}
				if ( publisher === 'others' && publication.publisher === 'Appropedia' ) {
					cover.style.display = 'none';
				}
			}
		}
	},

	makeCovers() {
		const covers = document.getElementById( 'appropedia-covers' );
		covers.innerHTML = '';
		let index = 0;
		for ( const publication of Appropedia.publications ) {
			const template = document.getElementById( 'appropedia-cover-template' );
			const cover = template.content.cloneNode( true ).children[0];
			cover.id = 'appropedia-cover-' + publication.hash;
			if ( publication.thumb ) {
				cover.src = publication.thumb;
			} else {
				cover.src = Appropedia.makeThumb( publication.title );
			}
			cover.onclick = Appropedia.openDialog;
			cover.dataset.index = index;
			covers.append( cover );
			index++;

			// If there's a hash, open the relevant publication
			if ( location.hash === '#' + publication.hash ) {
				 cover.click();
			} 
		}
	},

	openDialog( event ) {

		// Get the publication data
		const cover = event.target;
		const index = cover.dataset.index;
		const publication = Appropedia.publications[ index ];

		// Update the hash
		location.hash = publication.hash;
		
		// Show the dialog
		const dialog = document.getElementById( 'appropedia-publication-dialog' );
		dialog.showModal();

		// Remove any previous content
		const content = document.getElementById( 'appropedia-publication-dialog-content' );
		content.innerHTML = '';

		// Clone the template and add it to the dialog
		const template = document.getElementById( 'appropedia-publication-template' );
		const templateContent = template.content.cloneNode( true );
		content.append( templateContent );

		// Finish the thumbnail
		const thumb = dialog.querySelector( '.appropedia-publication-thumb' );
		if ( publication.thumb ) {
			thumb.src = publication.thumb;
		} else {
			thumb.src = Appropedia.makeThumb( publication.title );
		}

		// Finish the title
		const title = dialog.querySelector( '.appropedia-publication-title' );
		title.textContent = publication.title;

		// Finish the subtitle
		const subtitle = dialog.querySelector( '.appropedia-publication-subtitle' );
		if ( publication.subtitle ) {
			subtitle.textContent = publication.about;
		} else {
			subtitle.remove();
		}

		// Finish the type
		const type = dialog.querySelector( '.appropedia-publication-type' );
		if ( publication.type ) {
			type.textContent = publication.type;
		} else {
			type.remove();
		}

		// Finish the description
		const description = dialog.querySelector( '.appropedia-publication-description' );
		if ( publication.description ) {
			description.textContent = publication.description;
		} else {
			description.remove();
		}

		// Finish the buttons
		const online = dialog.querySelector( '.appropedia-publication-online' );
		online.onclick = () => {
			window.open( publication.url, '_blank' );
		};
		const audio = dialog.querySelector( '.appropedia-publication-audio' );
		if ( publication.audio ) {
			// @todo
		} else {
			audio.remove();
		}
		const pdf = dialog.querySelector( '.appropedia-publication-pdf' );
		if ( publication.pdf ) {
			// @todo
		} else {
			pdf.remove();
		}
		const zim = dialog.querySelector( '.appropedia-publication-zim' );
		if ( publication.zim ) {
			// @todo
		} else {
			zim.remove();
		}
		const app = dialog.querySelector( '.appropedia-publication-app' );
		if ( publication.app ) {
			// @todo
		} else {
			app.remove();
		}

		const showContentsButton = dialog.querySelector( '.show-contents-button' );
		showContentsButton.onclick = () => Appropedia.showContents( publication, dialog );
	},

	closeDialog() {
		const dialog = document.getElementById( 'appropedia-publication-dialog' );
		dialog.close();

		// Empty the hash but preserve history
		history.pushState( null, null, ' ' );
	},

	fetchPublications() {
		const properties = [
			'Publication title',
			'Publication subtitle',
			'Publication type',
			'Publication description',
			'Publication year',
			'Publication publisher',
			'Publication language',
			'Publication thumb',
			'Publication audio',
			'Publication PDF',
			'Publication ZIM',
			'Publication app'
		];
		const parameters = [
			'sort = Publication year',
			'order = desc'
		];
		const query = new URLSearchParams( {
			origin: '*',
			format: 'json',
			action: 'askargs',
			conditions: 'Category:Publications',
			printouts: properties.join( '|' ),
			parameters: parameters.join( '|' ),
		} );
		const url = 'https://www.appropedia.org/w/api.php?' + query.toString();
		return fetch( url ).then( response => response.json() ).then( response => {
			const results = response.query.results;
			const publications = [];
			for ( const result of Object.values( results ) ) {
				const title = result.printouts['Publication title'][0];
				const publication = {
					title: title,
					hash: title.replaceAll( ' ', '_' ),
					url: result.fullurl,
					subtitle: result.printouts['Publication subtitle'][0],
					type: result.printouts['Publication type'][0],
					description: result.printouts['Publication description'][0],
					year: result.printouts['Publication year'][0].raw.split( '/' ).pop(),
					publisher: result.printouts['Publication publisher'][0],
					language: result.printouts['Publication language'][0],
					thumb: result.printouts['Publication thumb'][0],
					audio: result.printouts['Publication audio'][0],
					pdf: result.printouts['Publication PDF'][0],
					zim: result.printouts['Publication ZIM'][0],
					app: result.printouts['Publication app'][0]
				};
				publications.push( publication );
			}
			Appropedia.publications = publications;
		} );
	},

	showContents( publication, dialog ) {
		// Replace the button for a loading message to prevent further clicks and hint the user that something is happening
		const contents = dialog.querySelector( '.appropedia-publication-contents' );
		contents.textContent = 'Loading...';

		// Fetch the publication menu
		const query = new URLSearchParams( {
			action: 'parse',
			page: publication.title,
			prop: 'text',
			format: 'json',
			formatversion: 2
		} );
		const url = 'https://www.appropedia.org/w/api.php?' + query.toString();
		return fetch( url ).then( response => response.json() ).then( response => {			
			const text = response.parse.text;
			const parser = new DOMParser();
			const doc = parser.parseFromString( text, 'text/html' );
			const list = doc.querySelector( '.menu-list' );
			if ( !list ) {
				contents.textContent = 'No menu found';
				return;
			}
			const links = list.getElementsByTagName( 'a' );
			for ( const link of links ) {
				link.target = '_blank';
				if ( link.classList.contains( 'mw-selflink' ) ) {
					link.href = publication.url;
				}
				const template = document.getElementById( 'appropedia-play-button-template' );
				const button = template.content.cloneNode( true ).children[0];
				button.onclick = () => Appropedia.readAloud( link );
				link.after( button );
			}
			contents.textContent = '';
			contents.append( list );
		} );
	},

	readAloud( link ) {
		const path = link.pathname;
		const title = path.replace( '/', '' );
		const query = new URLSearchParams( {
			action: 'query',
			titles: title,
			prop: 'extracts',
			format: 'json',
			formatversion: 2
		} );
		const url = 'https://www.appropedia.org/w/api.php?' + query.toString();
		return fetch( url ).then( response => response.json() ).then( response => {			
			const text = response.query.pages[0].extract;
			const parser = new DOMParser();
			const doc = parser.parseFromString( text, 'text/html' );
			const list = doc.querySelector( '.menu-list' );
		} );
	},

	makeThumb( title ) {
		const canvas = document.createElement( 'canvas' );
		canvas.width = 150;
		canvas.height = 225;
		const context = canvas.getContext( '2d' );
		context.fillStyle = 'black';
		context.fill();
		context.font = '20px Courier';
		context.fillStyle = 'ghostwhite';
		const words = title.split( ' ' );
		let y = 25;
		for ( const word of words ) {
			y += 25;
			context.fillText( word, 10, y );
		}
		const dataURL = canvas.toDataURL( 'image/jpeg' );
		return dataURL;
	},

	/**
	 * Helper method to get a cookie
	 */
	getCookie( name ) {
		const regex = new RegExp( '(^| )' + name + '=([^;]+)' );
		const match = document.cookie.match( regex );
		if ( match ) {
			return match[2];
		}
	}
};

window.onload = Appropedia.init;