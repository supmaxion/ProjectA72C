


export function RestApi( phase ) {
	
	//Ha localban vagyunk, ne legyen API hívás
	if (window.location.hostname === 'localhost' || window.location.port === '5173') {
			// console.log('Localhost környezet észlelve - API hívás kihagyva')
		return
	}

	
	let url

    switch (phase) {
        case 'Indul':
            url = "https://labor24.hu/space/api.php?action=Indul"
            break
        case 'Landing':
            url = "https://labor24.hu/space/api.php?action=Landing"
            break
        case 'Hit':
            url = "https://labor24.hu/space/api.php?action=Hit"
            break
        default:
            console.log('Ismeretlen phase:', phase)
            return // Kilép, ha nincs megfelelő phase
    }
    
	
	const sendRequest = async () => {
		try {
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			})
			
			if (response.ok) {
				console.log('Email sent successfully')
			} else {
				console.log('Failed to send email')
			}
		} catch (error) {
			console.log('Error sending email:', error)
		}
	}
	
	sendRequest()
	
}


